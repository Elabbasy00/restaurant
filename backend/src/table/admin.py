from django.contrib import admin
from .models import Table, TableArea


@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = ("number", "area", "capacity", "status", "is_active")
    list_filter = ("is_active",)
    search_fields = ("number",)

    def has_add_permission(self, request, obj=None):
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False

    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False

    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False

    def has_module_permission(self, request, obj=None):
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False

    def has_view_permission(self, request, obj=None) -> bool:
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False


@admin.register(TableArea)
class TableAreaAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)

    def has_add_permission(self, request, obj=None):
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False

    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False

    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False

    def has_module_permission(self, request, obj=None):
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False

    def has_view_permission(self, request, obj=None) -> bool:
        if request.user.is_superuser or request.user.role != "owner" or request.user.role != "manger":
            return True
        return False
