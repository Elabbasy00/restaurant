from rest_framework import serializers, views, response, status
from src.api.utils import inline_serializer
from src.menu.selectors import get_categories_list, get_menu_item_by_slug


class CategoryListView(views.APIView):

    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField()
        name = serializers.CharField()
        slug = serializers.SlugField(allow_unicode=True)
        image = serializers.ImageField()
        product_category = inline_serializer(
            fields={
                "id": serializers.IntegerField(),
                "name": serializers.CharField(),
                "description": serializers.CharField(),
                "price": serializers.DecimalField(max_digits=8, decimal_places=2),
                "discount_price": serializers.DecimalField(max_digits=8, decimal_places=2),
                "slug": serializers.SlugField(allow_unicode=True),
                "product_image": serializers.ImageField(),
            },
            many=True,
        )

    def get(self, request):
        categories = get_categories_list()
        serializer = self.OutputSerializer(categories, many=True, context={"request": request})
        return response.Response(serializer.data, status=status.HTTP_200_OK)


class MenuItemView(views.APIView):
    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField()
        category = serializers.CharField()
        name = serializers.CharField()
        description = serializers.CharField()
        price = serializers.DecimalField(max_digits=8, decimal_places=2)
        discount_price = serializers.DecimalField(max_digits=8, decimal_places=2)
        slug = serializers.SlugField(allow_unicode=True)
        sku = serializers.CharField()
        product_image = serializers.ImageField()
        product_gallery = inline_serializer(
            fields={
                "id": serializers.IntegerField(),
                "image": serializers.ImageField(),
            },
            many=True,
        )
        menu_variation = inline_serializer(
            fields={
                "id": serializers.IntegerField(),
                "name": serializers.CharField(),
                "value_type": serializers.CharField(),
                "required": serializers.BooleanField(),
                "menu_variation_info": inline_serializer(
                    fields={
                        "id": serializers.IntegerField(),
                        "value": serializers.CharField(),
                        "extra_price": serializers.DecimalField(max_digits=8, decimal_places=2),
                    },
                    many=True,
                ),
            },
            many=True,
        )

    def get(self, request, slug):
        menu_items = get_menu_item_by_slug(slug=slug)
        serializer = self.OutputSerializer(menu_items, context={"request": request})
        return response.Response(serializer.data, status=status.HTTP_200_OK)
