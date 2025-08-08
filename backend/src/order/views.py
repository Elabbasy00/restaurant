from rest_framework import serializers, views, response, status
from src.api.utils import inline_serializer
from src.order.selectors import get_orders_list, get_order_by_id, get_order_list_filter
from src.order.services import create_order, split_payment_by_person, cancel_order, update_order_item, order_analysis
from src.api.pagination import get_paginated_response, LimitOffsetPagination
from src.api.mixins import ApiAuthMixin


class OrderCreateView(ApiAuthMixin, views.APIView):
    class InputSerializer(serializers.Serializer):
        customer_name = serializers.CharField(max_length=100)
        customer_phone = serializers.CharField(max_length=20, required=False)
        table_id = serializers.IntegerField(required=False)
        tax_enabled = serializers.BooleanField(default=True)
        items = serializers.ListField(child=serializers.DictField(), required=False)
        services = serializers.ListField(child=serializers.DictField(), required=False)

    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField()
        ref_code = serializers.CharField()
        customer_name = serializers.CharField()
        payment_status = serializers.CharField()
        created_at = serializers.DateTimeField()

    def post(self, request):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = create_order(
            customer_name=serializer.validated_data["customer_name"],
            items_data=serializer.validated_data.get("items", []),
            services_data=serializer.validated_data.get("services", []),
            table_id=serializer.validated_data.get("table_id"),
            customer_phone=serializer.validated_data.get("customer_phone", ""),
            tax_enabled=serializer.validated_data.get("tax_enabled", True),
        )

        output_serializer = self.OutputSerializer(order)
        return response.Response(output_serializer.data, status=status.HTTP_201_CREATED)


class OrderListView(ApiAuthMixin, views.APIView):
    class Pagination(LimitOffsetPagination):
        default_limit = 25

    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField()
        ref_code = serializers.CharField()
        customer_name = serializers.CharField()
        customer_phone = serializers.CharField()
        payment_status = serializers.CharField()
        tax_enabled = serializers.BooleanField()
        created_at = serializers.DateTimeField()
        cancelled = serializers.BooleanField()
        table = inline_serializer(
            fields={
                "id": serializers.IntegerField(),
                "number": serializers.CharField(),
                "area": inline_serializer(
                    fields={
                        "id": serializers.IntegerField(),
                        "name": serializers.CharField(),
                    }
                ),
            },
            required=False,
        )
        staff = inline_serializer(
            fields={
                "id": serializers.IntegerField(),
                "username": serializers.CharField(source="get_full_name"),
            },
            required=False,
        )

    def get(self, request):
        orders = get_order_list_filter(filters=request.query_params)

        return get_paginated_response(
            pagination_class=self.Pagination,
            serializer_class=self.OutputSerializer,
            queryset=orders,
            request=request,
            view=self,
        )


class OrderDetailView(ApiAuthMixin, views.APIView):
    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField()
        ref_code = serializers.CharField()
        customer_name = serializers.CharField()
        customer_phone = serializers.CharField()
        payment_status = serializers.CharField()
        tax_enabled = serializers.BooleanField()
        tax_rate = serializers.DecimalField(max_digits=5, decimal_places=4)
        created_at = serializers.DateTimeField()
        updated_at = serializers.DateTimeField()
        cancelled = serializers.BooleanField()
        table = inline_serializer(
            fields={
                "id": serializers.IntegerField(),
                "number": serializers.CharField(),
                "capacity": serializers.IntegerField(),
                "area": inline_serializer(
                    fields={
                        "id": serializers.IntegerField(),
                        "name": serializers.CharField(),
                    }
                ),
            },
            required=False,
        )

        order_items = inline_serializer(
            fields={
                "id": serializers.IntegerField(),
                "quantity": serializers.IntegerField(),
                "notes": serializers.CharField(),
                "person_name": serializers.CharField(),
                "is_paid": serializers.BooleanField(),
                "paid_amount": serializers.DecimalField(max_digits=8, decimal_places=2),
                "item": inline_serializer(
                    fields={
                        "id": serializers.IntegerField(),
                        "name": serializers.CharField(),
                        "price": serializers.DecimalField(max_digits=8, decimal_places=2),
                        "discount_price": serializers.DecimalField(max_digits=8, decimal_places=2),
                        "product_image": serializers.ImageField(),
                    }
                ),
                "item_variations": inline_serializer(
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

        order_services = inline_serializer(
            fields={
                "id": serializers.IntegerField(),
                "quantity": serializers.IntegerField(),
                "notes": serializers.CharField(),
                "person_name": serializers.CharField(),
                "is_paid": serializers.BooleanField(),
                "paid_amount": serializers.DecimalField(max_digits=8, decimal_places=2),
                "service": inline_serializer(
                    fields={
                        "id": serializers.IntegerField(),
                        "name": serializers.CharField(),
                        "price": serializers.DecimalField(max_digits=8, decimal_places=2),
                    }
                ),
            },
            many=True,
        )

    def get(self, request, order_id):
        order = get_order_by_id(order_id)
        serializer = self.OutputSerializer(order, context={"request": request})
        return response.Response(serializer.data, status=status.HTTP_200_OK)


class PaymentSplitView(ApiAuthMixin, views.APIView):
    def get(self, request, order_id):
        order = get_order_by_id(order_id)
        split_data = split_payment_by_person(order)
        return response.Response(split_data, status=status.HTTP_200_OK)


class OrderPaymentUpdateView(ApiAuthMixin, views.APIView):
    class InputSerializer(serializers.Serializer):
        payment_status = serializers.ChoiceField(choices=["pending", "partial", "paid", "refunded"])

    def patch(self, request, order_id):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = get_order_by_id(order_id)
        order.payment_status = serializer.validated_data["payment_status"]
        order.save()

        return response.Response({"message": "Payment status updated successfully"}, status=status.HTTP_200_OK)


class CancelOrderView(ApiAuthMixin, views.APIView):
    def post(self, request, order_id):
        order = get_order_by_id(order_id)
        cancel_order(order)
        return response.Response({"message": "تم إلغاء الطلب بنجاح"}, status=status.HTTP_200_OK)


class UpdateOrderItemsServicesView(ApiAuthMixin, views.APIView):
    class InputSerializer(serializers.Serializer):
        order_id = serializers.IntegerField()
        type = serializers.ChoiceField(choices=["item", "service"])
        person_name = serializers.CharField(required=False)
        is_paid = serializers.BooleanField(required=False, default=False)
        paid_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

    def put(self, request, itemId):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order_id = serializer.validated_data["order_id"]
        update_order_item(orderId=order_id, orderItemId=itemId, data=serializer.validated_data)
        return response.Response({"message": "تم تحديث العنصر بنجاح"}, status=status.HTTP_200_OK)


class OrderStats(ApiAuthMixin, views.APIView):
    def get(self, request):
        return response.Response(order_analysis(), status=status.HTTP_200_OK)
