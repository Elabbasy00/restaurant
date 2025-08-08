from django.contrib import admin
from src.inventory.models import Ingredient, RecipeIngredient


@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ("name", "quantity_in_stock", "reorder_level", "is_low")
    search_fields = ("name",)
    readonly_fields = ("create_at", "updated_at")

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


@admin.register(RecipeIngredient)
class RecipeIngredientAdmin(admin.ModelAdmin):
    list_display = ("variation", "ingredient", "quantity_required")
    search_fields = ("variation__name", "ingredient__name")
    list_filter = ("variation", "ingredient")

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
