from src.menu.models import MenuItem, Category, ProductGallery, MenuItemVariation, Variation
from src.common.utils import get_object
from django.db.models import Prefetch


def get_categories_list():
    return Category.objects.all().prefetch_related(
        Prefetch("product_category", queryset=MenuItem.objects.filter(visible=True))
    )


def get_category_by_slug(slug):
    return get_object(Category.objects.prefetch_related("product_category"), slug=slug)


def get_menu_items_list():
    return MenuItem.objects.prefetch_related("product_gallery").all()


def get_menu_item_by_slug(slug):
    return get_object(
        MenuItem.objects.prefetch_related(
            "product_gallery",
            #  "menu_variation__menu_variation_info__recipe_ingredients",
            "menu_variation__menu_variation_info",
        ),
        slug=slug,
    )
