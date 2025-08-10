from django.contrib import admin
from src.order.models import Order, OrderItem, OrderService


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "table",
        "staff",
        "customer_name",
        "customer_phone",
        "ref_code",
        "created_at",
        "payment_status",
    )
    list_filter = ("payment_status", "created_at", "updated_at", "tax_enabled", "tax_rate")
    search_fields = ("id", "user__username", "user__email", "customer_name", "customer_phone", "ref_code")
    readonly_fields = ("created_at", "updated_at")

    @admin.display(description="Total")
    def get_total(self, obj):
        return obj.get_total()

    @admin.display(description="Subtotal")
    def get_subtotal(self, obj):
        return obj.get_subtotal()

    @admin.display(description="Tax")
    def get_tax_amount(self, obj):
        return obj.get_tax_amount()

    @admin.display(description="Items")
    def get_items(self, obj):
        return obj.order_items.count()

    @admin.display(description="Services")
    def get_services(self, obj):
        return obj.order_services.count()

    @admin.display(description="Table")
    def get_table(self, obj):
        return obj.table.name

    @admin.display(description="Waiter")
    def get_waiter(self, obj):
        return obj.staff.username

    @admin.display(description="Customer")
    def get_customer(self, obj):
        return obj.customer_name

    def has_add_permission(self, request, obj=None):
        if request.user.is_anonymous:
            return False
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False

    def has_delete_permission(self, request, obj=None):
        if request.user.is_anonymous:
            return False
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False

    def has_change_permission(self, request, obj=None):
        if request.user.is_anonymous:
            return False
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False

    def has_module_permission(self, request, obj=None):
        if request.user.is_anonymous:
            return False
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False

    def has_view_permission(self, request, obj=None) -> bool:
        if request.user.is_anonymous:
            return False
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "item", "quantity", "get_total_price")
    list_filter = ("order", "item")
    search_fields = ("id", "order__id", "item__name")

    def has_add_permission(self, request, obj=None):
        if request.user.is_anonymous:
            return False
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False

    def has_delete_permission(self, request, obj=None):
        if request.user.is_anonymous:
            return False
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False

    def has_change_permission(self, request, obj=None):
        if request.user.is_anonymous:
            return False
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False

    def has_module_permission(self, request, obj=None):
        if request.user.is_anonymous:
            return False
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False

    def has_view_permission(self, request, obj=None) -> bool:
        if request.user.is_anonymous:
            return False
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False


@admin.register(OrderService)
class OrderServiceAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "service", "quantity", "get_total_price")
    list_filter = ("order", "service")
    search_fields = ("id", "order__id", "service__name")

    def has_add_permission(self, request, obj=None):
        if request.user.is_anonymous:
            return False
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False

    def has_delete_permission(self, request, obj=None):
        if request.user.is_anonymous:
            return False
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False

    def has_change_permission(self, request, obj=None):
        if request.user.is_anonymous:
            return False
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False

    def has_module_permission(self, request, obj=None):
        if request.user.is_anonymous:
            return False
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False

    def has_view_permission(self, request, obj=None) -> bool:
        if request.user.is_anonymous:
            return False
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False
