from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

# from django_countries.fields import CountryField
from src.menu.models import MenuItem, MenuItemVariation
import decimal
from django.db.models import Q
from datetime import datetime
from django.utils.timezone import make_aware
from datetime import timedelta
from src.service.models import Service, ServiceBooking
from src.table.models import Table


User = get_user_model()


PAYMENT_STATUS = (
    ("pending", "قيد الانتظار"),
    ("partial", "جزئي"),
    ("paid", "مدفوع"),
    ("refunded", "تم استرداد المبلغ"),
)


class OrderManager(models.Manager):
    """
    order custom manager to add new queryset func
    """

    def range(self, fromDate, toDate, *args, **kwargs):
        """
        accept tow dates and return orders within these dates
        """
        fromDate = make_aware(datetime.strptime(fromDate, "%Y-%m-%d %H:%M:%S"))
        toDate = make_aware(datetime.strptime(toDate, "%Y-%m-%d %H:%M:%S"))
        return self.filter(Q(start_date__gte=fromDate) & Q(start_date__lte=toDate), *args, **kwargs)

    def recent(self, *args, **kwargs):
        """
        return orders for today
        """
        today = make_aware(datetime.now())
        prev_day = make_aware(datetime.now() - timedelta(days=1))
        return self.filter(Q(start_date__gte=prev_day) & Q(start_date__lte=today), *args, **kwargs)

    # .select_related(
    #         "shipping_address", "payment", "coupon", "user", "waiter", "delivery").prefetch_related(
    #         "items__item_variations__variation", "items__item", "order_status")

    def total_earn_range(self, fromDate, toDate):
        """
        return total earn with range dates, and order count
        """
        try:
            fromDate = make_aware(datetime.strptime(fromDate, "%Y-%m-%d"))
            toDate = make_aware(datetime.strptime(toDate, "%Y-%m-%d"))
        except:
            pass

        queryset = self.filter(Q(start_date__gte=fromDate) & Q(start_date__lte=toDate))
        total = 0
        for order in queryset:  # loop throw orders then call model func get_total
            total += order.get_total()
        return decimal.Decimal(total), queryset.count()


class Order(models.Model):
    table = models.ForeignKey(
        Table, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders", verbose_name=_("الطاولة")
    )
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("المستخدم"))
    staff = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="order_staff", verbose_name=_("الموظف")
    )
    customer_name = models.CharField(_("الاسم"), max_length=100, blank=True)
    customer_phone = models.CharField(_("رقم الهاتف"), max_length=20, blank=True)
    ref_code = models.CharField(_("الكود"), max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    tax_enabled = models.BooleanField(_("الضريبة"), default=True)
    tax_rate = models.DecimalField(_("نسبة الضريبة"), max_digits=5, decimal_places=4, default=0.14)
    payment_status = models.CharField(_("حالة الدفع"), max_length=10, choices=PAYMENT_STATUS, default="pending")
    created_at = models.DateTimeField(_("تاريخ الانشاء"), auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(_("تاريخ التحديث"), auto_now=True)
    cancelled = models.BooleanField(_("ملفي"), default=False)
    objects = OrderManager()

    class Meta:
        ordering = ["id"]
        verbose_name = _("طلب")
        verbose_name_plural = _("الطلبات")

    def __str__(self):
        return f"طلب {self.ref_code or self.id}"

    def get_subtotal(self):
        """Calculate subtotal from all order items and services"""
        items_total = sum(item.get_total_price() for item in self.order_items.all())
        services_total = sum(service.get_total_price() for service in self.order_services.all())
        return items_total + services_total

    def get_tax_amount(self):
        """Calculate tax amount"""
        if not self.tax_enabled:
            return decimal.Decimal("0.00")
        return self.get_subtotal() * self.tax_rate

    def get_total(self):
        """Calculate total including tax"""
        subtotal = self.get_subtotal()
        tax = self.get_tax_amount()
        return subtotal + tax

    # def save(self, *args, **kwargs):
    #     total = self.get_total()
    #     if total:
    #         self.total_price = total
    #     super(Order, self).save(*args, **kwargs)


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="order_items", null=True, blank=True, verbose_name=_("الطلب")
    )
    item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, verbose_name=_("المنتج"))
    quantity = models.IntegerField(_("الكمية"), default=1)
    item_variations = models.ManyToManyField(MenuItemVariation, blank=True, verbose_name=_("الإضافات"))
    notes = models.TextField(_("ملاحظات"), null=True, blank=True)
    # Person assignment
    person_name = models.CharField(_("الاسم"), max_length=100, blank=True)
    # Individual payment tracking
    is_paid = models.BooleanField(_("تم الدفع"), default=False)
    paid_amount = models.DecimalField(_("المبلغ المدفوع"), max_digits=8, decimal_places=2, default=0)

    created_at = models.DateTimeField(_("تاريخ الانشاء"), auto_now_add=True, null=True, blank=True)

    class Meta:
        verbose_name = _("العنصر المطلوب")
        verbose_name_plural = _("العناصر المطلوبة")

    def __str__(self):
        return f"{self.quantity}x {self.item.name}"

    def get_base_price(self):
        """Get item base price (with discount if applicable)"""
        if self.item.discount_price and self.item.discount_price > 0:
            return self.item.discount_price
        return self.item.price

    def get_unit_price(self):
        """Get price per unit including variations"""
        return self.get_base_price() + self.get_variations_price()

    def get_total_price(self):
        """Get total price for this order item"""
        return self.get_unit_price() * self.quantity

    def get_variations_price(self):
        """Get total price of variations"""
        return sum(var.extra_price for var in self.item_variations.all())

    def get_total_variations_price(self):
        """
        get extras price for variations eg. (size large)
        """
        if self.item_variations:
            price = 0
            for var in self.item_variations.all():
                price += var.extra_price
            return price

    def get_total_item_price(self):
        """
        total price without variations
        """
        return self.quantity * self.item.price

    def get_total_discount_item_price(self):
        """
        if item have discount return the discount price
        """
        try:
            return self.quantity * self.item.discount_price
        except:
            pass

    def get_amount_saved(self):
        """
        amount save total order count - discount price
        """
        try:
            return self.get_total_item_price() - self.get_total_discount_item_price()
        except:
            pass

    def get_final_price(self):
        """
        final price include variations price
        """
        if self.item.discount_price:
            return self.get_total_discount_item_price() + self.get_total_variations_price()
        return self.get_total_item_price() + self.get_total_variations_price()

    def get_ingredient_usage(self):
        usage = {}
        for link in self.item.recipes.all():
            total_needed = link.quantity_required * self.quantity
            usage[link.ingredient] = total_needed
        return usage


class OrderService(models.Model):
    """Services added to an order"""

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="order_services", verbose_name=_("الطلب"))
    service = models.ForeignKey(Service, on_delete=models.CASCADE, verbose_name=_("الخدمة"))
    quantity = models.PositiveIntegerField(_("الكمية"), default=1)
    booking = models.ForeignKey(ServiceBooking, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(_("ملاحظات"), blank=True)

    # Person assignment
    person_name = models.CharField(_("الاسم"), max_length=100, blank=True, null=True)

    # Individual payment tracking
    is_paid = models.BooleanField(_("تم الدفع"), default=False, null=True, blank=True)
    paid_amount = models.DecimalField(
        _("المبلغ المدفوع"), max_digits=8, decimal_places=2, default=0, null=True, blank=True
    )

    created_at = models.DateTimeField(_("تاريخ الانشاء"), auto_now_add=True)

    class Meta:
        verbose_name = _("الخدمة المطلوبة")
        verbose_name_plural = _("الخدمات المطلوبة")

    def __str__(self):
        return f"{self.quantity}x {self.service.name}"

    def get_total_price(self):
        """Get total price for this service"""
        return self.service.price * self.quantity
