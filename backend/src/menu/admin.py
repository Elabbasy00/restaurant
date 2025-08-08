from django.contrib import admin
from src.menu.models import Category, MenuItem, Variation, MenuItemVariation, ProductGallery
from src.inventory.models import RecipeIngredient
from src.menu.services import calculate_max_available


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}
    list_filter = ["name"]
    search_fields = ["name"]


class GalleryInline(admin.StackedInline):
    model = ProductGallery


class RecipeIngredientlInline(admin.StackedInline):
    model = RecipeIngredient


class ProductVariationInline(admin.StackedInline):
    model = MenuItemVariation


@admin.register(MenuItemVariation)
class ProductVariationAdmin(admin.ModelAdmin):
    model = MenuItemVariation
    list_display = ["variation", "value", "extra_price"]
    list_filter = ["variation"]
    search_fields = ["variation"]
    inlines = [RecipeIngredientlInline]


@admin.register(MenuItem)
class ProductAdmin(admin.ModelAdmin):
    model = MenuItem
    inlines = [GalleryInline]
    list_display = [
        "name",
        "category__name",
        "price",
        "discount_price",
        "visible",
    ]
    list_filter = ["category__name", "visible"]
    search_fields = ["name", "category__name"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Variation)
class VartionsAdmin(admin.ModelAdmin):
    model = Variation
    inlines = [ProductVariationInline]
    list_display = ["item", "name", "value_type", "required"]
    list_filter = ["item", "value_type", "required"]
    search_fields = ["item", "name"]
