from src.order.models import Order
from src.common.utils import get_object
from django.db.models import Sum, Count, F
import django_filters
from datetime import date
from django.db.models import Q


def get_order_revenue():
    total_revenue = (
        Order.objects.aggregate(total=Sum(F("order_items__get_final_price") + F("order_services__get_total_price")))[
            "total"
        ]
        or 0
    )


def get_orders_list():
    """Get all orders with related data including services"""
    return Order.objects.filter(cancelled=False).select_related("table__area", "staff").order_by("-created_at")


def get_order_by_id(order_id: int):
    """Get order by ID with all related data including services"""
    return get_object(
        Order.objects.select_related("table__area", "user", "staff").prefetch_related(
            "order_items__item", "order_items__item_variations", "order_services__service__category"  # Add this line
        ),
        id=order_id,
    )


def get_order_by_ref_code(ref_code: str):
    """Get order by reference code including services"""
    return get_object(
        Order.objects.select_related("table__area").prefetch_related(
            "order_items__item", "order_services__service"  # Add this line
        ),
        ref_code=ref_code,
    )


def get_orders_by_table(table_id: int):
    """Get orders for a specific table"""
    return Order.objects.filter(table_id=table_id).select_related("table").order_by("-created_at")


def get_recent_orders():
    """Get recent orders (last 24 hours)"""
    return (
        Order.objects.recent()
        .select_related("table__area")
        .prefetch_related("order_items__item", "order_services__service")
    )


def get_pending_orders():
    """Get orders with pending payment status"""
    return Order.objects.filter(payment_status="pending").select_related("table__area")


class OrderListFilter(django_filters.FilterSet):
    search_table = django_filters.CharFilter(method="search_table")
    ref_code = django_filters.CharFilter(field_name="ref_code", lookup_expr="icontains")
    tax_enabled = django_filters.BooleanFilter(field_name="tax_enabled", lookup_expr="exact")
    payment_status = django_filters.CharFilter(field_name="payment_status", lookup_expr="exact")
    search = django_filters.CharFilter(method="search_filter")
    created_at = django_filters.DateFilter(field_name="created_at", lookup_expr="gte", initial=date.today())

    def search_filter(self, queryset, name, value):
        return queryset.filter(
            Q(staff__username=value) | Q(customer_name__icontains=value) | Q(customer_phone__icontains=value)
        )

    def search_table(self, queryset, name, value):
        return queryset.filter(table__name__icontains=value | Q(table__area__name__icontains=value))

    class Meta:
        model = Order
        fields = ["ref_code", "tax_enabled", "payment_status", "search", "created_at"]


def get_order_list_filter(*, filters=None):
    filters = filters or {}
    qs = get_orders_list()

    return OrderListFilter(filters, qs).qs
