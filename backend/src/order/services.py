from src.order.models import Order, OrderItem, OrderService, PAYMENT_STATUS
from src.menu.models import MenuItem, MenuItemVariation
from src.service.models import Service
from src.table.models import Table
from django.db import transaction
from typing import List, Dict, Optional
import uuid
from decimal import Decimal
from src.menu.services import check_ingredient_availability, decrease_ingredient_stock, increase_ingredient_stock
from src.api.exception_handlers import ApplicationError
from src.order.selectors import get_order_by_id
from src.common.services import model_update
from django.db.models.functions import Coalesce

from django.db.models import (
    Sum,
    Count,
    F,
    ExpressionWrapper,
    DecimalField,
    Case,
    When,
    Value,
    Q,
    FloatField,
    Subquery,
    OuterRef,
)
from django.utils import timezone
from datetime import timedelta


def generate_ref_code() -> str:
    """Generate unique reference code for order"""
    return str(uuid.uuid4())[:8].upper()


def update_order_payment_status(order):
    """Update order payment status based on individual item/service payments"""
    total_amount = order.get_total()
    paid_amount = Decimal("0.00")

    # Calculate total paid from items
    for item in order.order_items.all():
        paid_amount += item.paid_amount

    # Calculate total paid from services
    for service in order.order_services.all():
        paid_amount += service.paid_amount

    if paid_amount >= total_amount:

        order.payment_status = "paid"
    elif paid_amount > 0:
        order.payment_status = "partial"
    else:
        order.payment_status = "pending"

    order.save()
    return order


@transaction.atomic
def create_order(
    customer_name: str,
    items_data: List[Dict] = None,
    services_data: List[Dict] = None,
    table_id: Optional[int] = None,
    customer_phone: str = "",
    tax_enabled: bool = True,
    **kwargs,
) -> Order:
    """Create a new order with items and services"""

    # Create the order
    order = Order.objects.create(
        table_id=table_id,
        customer_name=customer_name,
        customer_phone=customer_phone,
        tax_enabled=tax_enabled,
        ref_code=generate_ref_code(),
        **kwargs,
    )

    # Add menu items
    if items_data:
        for item_data in items_data:
            create_order_item(order, item_data)

    # Add services
    if services_data:
        for service_data in services_data:
            create_order_service(order, service_data)

    update_order_payment_status(order)
    return order


def create_order_item(order: Order, item_data: Dict) -> OrderItem:
    """Create an order item"""
    menu_item = MenuItem.objects.get(id=item_data["item"])
    quantity = item_data["quantity"]
    variations = None

    if "item_variations" in item_data and item_data["item_variations"]:
        variations = list(MenuItemVariation.objects.filter(id__in=item_data["item_variations"]))

    is_available, missing_ingredients = check_ingredient_availability(menu_item, variations, quantity)

    if not is_available:
        missing_items = ", ".join(
            [f"{ing['ingredient']} (تحتاج {ing['required']}, يملك {ing['available']})" for ing in missing_ingredients]
        )
        raise ApplicationError(message=f"مكونات غير كافية ل {menu_item.name}: {missing_items}")

    order_item = OrderItem.objects.create(
        order=order,
        item=menu_item,
        quantity=item_data["quantity"],
        notes=item_data.get("notes", ""),
        person_name=item_data.get("person_name", ""),
        is_paid=item_data.get("is_paid", False),
        paid_amount=item_data.get("paid_amount", 0),
    )

    if variations:
        order_item.item_variations.set(variations)

    decrease_ingredient_stock(menu_item, variations, quantity)

    return order_item


def create_order_service(order: Order, service_data: Dict) -> OrderService:
    """Create an order service"""
    service = Service.objects.get(id=service_data["service"])

    order_service = OrderService.objects.create(
        order=order,
        service=service,
        quantity=service_data["quantity"],
        notes=service_data.get("notes", ""),
        person_name=service_data.get("person_name", ""),
        booking_id=service_data.get("booking_id"),
        is_paid=service_data.get("is_paid", False),
        paid_amount=service_data.get("paid_amount", 0),
    )

    return order_service


def split_payment_by_person(order):
    """Split order payment by person assignments"""
    people_data = {}
    unassigned_items = []
    unassigned_services = []

    # Process order items
    for item in order.order_items.all():
        if item.person_name:
            if item.person_name not in people_data:
                people_data[item.person_name] = {
                    "name": item.person_name,
                    "items": [],
                    "services": [],
                    "total": Decimal("0.00"),
                    "paid": Decimal("0.00"),
                    "remaining": Decimal("0.00"),
                }

            item_total = item.get_total_price()
            people_data[item.person_name]["items"].append(
                {
                    "name": item.item.name,
                    "quantity": item.quantity,
                    "total": item_total,
                    "is_paid": item.is_paid,
                    "paid_amount": item.paid_amount,
                }
            )
            people_data[item.person_name]["total"] += item_total
            people_data[item.person_name]["paid"] += item.paid_amount
        else:
            unassigned_items.append(
                {
                    "name": item.item.name,
                    "quantity": item.quantity,
                    "total": item.get_total_price(),
                    "is_paid": item.is_paid,
                    "paid_amount": item.paid_amount,
                }
            )

    # Process order services
    for service in order.order_services.all():
        if service.person_name:
            if service.person_name not in people_data:
                people_data[service.person_name] = {
                    "name": service.person_name,
                    "items": [],
                    "services": [],
                    "total": Decimal("0.00"),
                    "paid": Decimal("0.00"),
                    "remaining": Decimal("0.00"),
                }

            service_total = service.get_total_price()
            people_data[service.person_name]["services"].append(
                {
                    "name": service.service.name,
                    "quantity": service.quantity,
                    "total": service_total,
                    "is_paid": service.is_paid,
                    "paid_amount": service.paid_amount,
                }
            )
            people_data[service.person_name]["total"] += service_total
            people_data[service.person_name]["paid"] += service.paid_amount
        else:
            unassigned_services.append(
                {
                    "name": service.service.name,
                    "quantity": service.quantity,
                    "total": service.get_total_price(),
                    "is_paid": service.is_paid,
                    "paid_amount": service.paid_amount,
                }
            )

    # Calculate remaining amounts
    for person_data in people_data.values():
        person_data["remaining"] = person_data["total"] - person_data["paid"]

    return {
        "people": list(people_data.values()),
        "unassigned_items": unassigned_items,
        "unassigned_services": unassigned_services,
        "order_total": order.get_total(),
        "total_paid": sum(p["paid"] for p in people_data.values()),
        "total_remaining": sum(p["remaining"] for p in people_data.values()),
    }


@transaction.atomic
def cancel_order(order: Order) -> Order:
    """Cancel an entire order and return all ingredients to stock"""

    for order_item in order.order_items.all():
        variations = list(order_item.item_variations.all()) if order_item.item_variations.exists() else None
        increase_ingredient_stock(order_item.item, variations, order_item.quantity)

    order.cancelled = True
    order.save()

    return order


def get_order_ingredient_usage(order: Order) -> Dict:
    """Get total ingredient usage for an order"""
    total_usage = {}

    for order_item in order.order_items.all():
        from src.menu.services import get_ingredient_usage_for_order_item

        item_usage = get_ingredient_usage_for_order_item(order_item)

        for ingredient, quantity in item_usage.items():
            if ingredient in total_usage:
                total_usage[ingredient] += quantity
            else:
                total_usage[ingredient] = quantity

    return total_usage


def validate_order_ingredients(order: Order) -> tuple[bool, List[Dict]]:
    """Validate that all ingredients are available for an order"""
    all_missing = []

    for order_item in order.order_items.all():
        variations = list(order_item.item_variations.all()) if order_item.item_variations.exists() else None
        is_available, missing_ingredients = check_ingredient_availability(
            order_item.item, variations, order_item.quantity
        )

        if not is_available:
            for missing in missing_ingredients:
                missing["item_name"] = order_item.item.name
                all_missing.append(missing)

    return len(all_missing) == 0, all_missing


@transaction.atomic
def update_order_item_quantity(order_item: OrderItem, new_quantity: int) -> OrderItem:
    """Update order item quantity and adjust ingredient stock accordingly"""
    old_quantity = order_item.quantity
    quantity_difference = new_quantity - old_quantity

    if quantity_difference == 0:
        return order_item

    # Get variations
    variations = list(order_item.item_variations.all()) if order_item.item_variations.exists() else None

    if quantity_difference > 0:
        # Increasing quantity - check availability first
        is_available, missing_ingredients = check_ingredient_availability(
            order_item.item, variations, quantity_difference
        )

        if not is_available:
            missing_items = ", ".join(
                [
                    f"{ing['ingredient']} (need {ing['required']}, have {ing['available']})"
                    for ing in missing_ingredients
                ]
            )
            raise ApplicationError(message=f"Insufficient ingredients to increase quantity: {missing_items}")

        # Decrease stock for additional quantity
        decrease_ingredient_stock(order_item.item, variations, quantity_difference)

    else:
        # Decreasing quantity - return ingredients to stock
        increase_ingredient_stock(order_item.item, variations, abs(quantity_difference))

    # Update the order item
    order_item.quantity = new_quantity
    order_item.save()

    return order_item


def update_order_item(*, orderId, orderItemId: int, data: dict) -> OrderItem:
    """Update order item person and paid status"""
    order = get_order_by_id(orderId)
    type = data.get("type")
    item = None

    if type == "item":
        item = order.order_items.get(id=orderItemId)
    elif type == "services":
        item = order.order_services.get(id=orderItemId)

    if not item:
        raise ApplicationError(message="لم يتم العثور على عنصر الطلب")

    fields = ["person_name", "is_paid", "paid_amount"]

    instance, is_updated = model_update(instance=item, fields=fields, data=data)
    order.refresh_from_db()
    update_order_payment_status(order)

    return instance


def order_analysis():
    # Date ranges
    today = timezone.now()
    last_week = today - timedelta(days=7)
    last_month = today - timedelta(days=30)

    # 1. ITEM REVENUE CALCULATION (using subquery approach)
    item_revenue = (
        OrderItem.objects.annotate(
            base_price=Case(
                When(item__discount_price__gt=0, then=F("item__discount_price")),
                default=F("item__price"),
                output_field=DecimalField(),
            ),
            variations_total=Coalesce(Sum("item_variations__extra_price"), Value(0), output_field=DecimalField()),
        )
        .annotate(
            item_total=ExpressionWrapper(
                (F("base_price") + F("variations_total")) * F("quantity"), output_field=DecimalField()
            )
        )
        .aggregate(total=Sum("item_total"))["total"]
        or 0
    )

    # 2. SERVICE REVENUE CALCULATION
    service_revenue = (
        OrderService.objects.annotate(
            service_total=ExpressionWrapper(F("service__price") * F("quantity"), output_field=DecimalField())
        ).aggregate(total=Sum("service_total"))["total"]
        or 0
    )

    total_revenue = item_revenue + service_revenue

    # 3. PAYMENT STATUS BREAKDOWN (simplified approach)
    payment_status = []
    for status, _ in PAYMENT_STATUS:
        # Item revenue for status
        status_item_rev = (
            OrderItem.objects.filter(order__payment_status=status)
            .annotate(
                base_price=Case(
                    When(item__discount_price__gt=0, then=F("item__discount_price")),
                    default=F("item__price"),
                    output_field=DecimalField(),
                ),
                variations_total=Coalesce(Sum("item_variations__extra_price"), Value(0), output_field=DecimalField()),
            )
            .annotate(
                item_total=ExpressionWrapper(
                    (F("base_price") + F("variations_total")) * F("quantity"), output_field=DecimalField()
                )
            )
            .aggregate(total=Sum("item_total"))["total"]
            or 0
        )

        # Service revenue for status
        status_service_rev = (
            OrderService.objects.filter(order__payment_status=status)
            .annotate(service_total=ExpressionWrapper(F("service__price") * F("quantity"), output_field=DecimalField()))
            .aggregate(total=Sum("service_total"))["total"]
            or 0
        )

        # Order count
        order_count = Order.objects.filter(payment_status=status).count()

        payment_status.append(
            {"payment_status": status, "count": order_count, "total": status_item_rev + status_service_rev}
        )

    # 4. TOP ITEMS (simplified approach)
    top_items = (
        OrderItem.objects.values("item__name")
        .annotate(
            count=Count("id"),
            total=Sum(
                ExpressionWrapper(
                    Case(
                        When(item__discount_price__gt=0, then=F("item__discount_price")),
                        default=F("item__price"),
                        output_field=DecimalField(),
                    )
                    * F("quantity"),
                    output_field=DecimalField(),
                )
            ),
        )
        .order_by("-count")[:5]
    )

    # Add variations to top items (separate query)
    for item in top_items:
        variations_total = (
            OrderItem.objects.filter(item__name=item["item__name"])
            .annotate(
                variations_sum=Coalesce(
                    Sum("item_variations__extra_price") * F("quantity"), Value(0), output_field=DecimalField()
                )
            )
            .aggregate(total=Sum("variations_sum"))["total"]
            or 0
        )
        item["total"] += variations_total

    # 5. TOP SERVICES
    top_services = (
        OrderService.objects.values("service__name")
        .annotate(count=Count("id"), total=Sum(F("service__price") * F("quantity")))
        .order_by("-count")[:5]
    )

    # 6. TIME-BASED COMPARISONS
    # Current period (last week)
    current_items = (
        OrderItem.objects.filter(order__created_at__gte=last_week)
        .annotate(
            base_price=Case(
                When(item__discount_price__gt=0, then=F("item__discount_price")),
                default=F("item__price"),
                output_field=DecimalField(),
            ),
            variations_total=Coalesce(Sum("item_variations__extra_price"), Value(0), output_field=DecimalField()),
        )
        .annotate(
            item_total=ExpressionWrapper(
                (F("base_price") + F("variations_total")) * F("quantity"), output_field=DecimalField()
            )
        )
        .aggregate(total=Sum("item_total"))["total"]
        or 0
    )

    current_services = (
        OrderService.objects.filter(order__created_at__gte=last_week)
        .annotate(service_total=ExpressionWrapper(F("service__price") * F("quantity"), output_field=DecimalField()))
        .aggregate(total=Sum("service_total"))["total"]
        or 0
    )

    current_period_revenue = current_items + current_services

    # Previous period (week before last)
    previous_items = (
        OrderItem.objects.filter(order__created_at__gte=last_month, order__created_at__lt=last_week)
        .annotate(
            base_price=Case(
                When(item__discount_price__gt=0, then=F("item__discount_price")),
                default=F("item__price"),
                output_field=DecimalField(),
            ),
            variations_total=Coalesce(Sum("item_variations__extra_price"), Value(0), output_field=DecimalField()),
        )
        .annotate(
            item_total=ExpressionWrapper(
                (F("base_price") + F("variations_total")) * F("quantity"), output_field=DecimalField()
            )
        )
        .aggregate(total=Sum("item_total"))["total"]
        or 0
    )

    previous_services = (
        OrderService.objects.filter(order__created_at__gte=last_month, order__created_at__lt=last_week)
        .annotate(service_total=ExpressionWrapper(F("service__price") * F("quantity"), output_field=DecimalField()))
        .aggregate(total=Sum("service_total"))["total"]
        or 0
    )

    previous_period_revenue = previous_items + previous_services

    # Calculate percentage change
    percent_change = 0
    if previous_period_revenue > 0:
        percent_change = ((current_period_revenue - previous_period_revenue) / previous_period_revenue) * 100

    return {
        "totalRevenue": total_revenue,
        "totalOrders": Order.objects.count(),
        "paymentStatus": payment_status,
        "topItems": list(top_items),
        "topServices": list(top_services),
        "percentChange": round(percent_change, 2),
        "newOrders": Order.objects.filter(created_at__gte=last_week).count(),
        "itemsSold": OrderItem.objects.count(),
        "servicesBooked": OrderService.objects.count(),
        "itemRevenue": item_revenue,
        "serviceRevenue": service_revenue,
    }
