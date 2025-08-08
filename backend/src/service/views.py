from rest_framework import serializers, views, response, status
from src.api.utils import inline_serializer
from src.service.selectors import (
    get_service_categories_list,
    get_services_list,
    get_service_by_slug,
    get_service_bookings_list,
)
from src.service.services import create_service_booking, get_service_availability, update_booking_status
from datetime import datetime


class ServiceCategoryListView(views.APIView):
    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField()
        name = serializers.CharField()
        slug = serializers.SlugField()
        description = serializers.CharField()
        image = serializers.ImageField()
        is_active = serializers.BooleanField()
        services = inline_serializer(
            fields={
                "id": serializers.IntegerField(),
                "name": serializers.CharField(),
                "slug": serializers.SlugField(),
                "description": serializers.CharField(),
                "price": serializers.DecimalField(max_digits=8, decimal_places=2),
                "image": serializers.ImageField(),
                "requires_booking": serializers.BooleanField(),
            },
            many=True,
        )

    def get(self, request):
        categories = get_service_categories_list()
        serializer = self.OutputSerializer(categories, many=True, context={"request": request})
        return response.Response(serializer.data, status=status.HTTP_200_OK)


class ServiceListView(views.APIView):
    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField()
        name = serializers.CharField()
        slug = serializers.SlugField()
        description = serializers.CharField()
        price = serializers.DecimalField(max_digits=8, decimal_places=2)
        image = serializers.ImageField()
        requires_booking = serializers.BooleanField()
        category = inline_serializer(
            fields={
                "id": serializers.IntegerField(),
                "name": serializers.CharField(),
                "slug": serializers.SlugField(),
            }
        )

    def get(self, request):
        services = get_services_list()
        serializer = self.OutputSerializer(services, many=True, context={"request": request})
        return response.Response(serializer.data, status=status.HTTP_200_OK)


class ServiceDetailView(views.APIView):
    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField()
        name = serializers.CharField()
        slug = serializers.SlugField()
        description = serializers.CharField()
        price = serializers.DecimalField(max_digits=8, decimal_places=2)
        image = serializers.ImageField()
        requires_booking = serializers.BooleanField()
        category = inline_serializer(
            fields={
                "id": serializers.IntegerField(),
                "name": serializers.CharField(),
                "slug": serializers.SlugField(),
            }
        )

    def get(self, request, slug):
        service = get_service_by_slug(slug=slug)
        serializer = self.OutputSerializer(service, context={"request": request})
        return response.Response(serializer.data, status=status.HTTP_200_OK)


class ServiceAvailabilityView(views.APIView):
    class InputSerializer(serializers.Serializer):
        date = serializers.DateField()

    def get(self, request, service_id):
        serializer = self.InputSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        date = datetime.combine(serializer.validated_data["date"], datetime.min.time())
        availability = get_service_availability(service_id, date)

        return response.Response(availability, status=status.HTTP_200_OK)


class ServiceBookingCreateView(views.APIView):
    class InputSerializer(serializers.Serializer):
        service_id = serializers.IntegerField()
        customer_name = serializers.CharField(max_length=100)
        customer_phone = serializers.CharField(max_length=20, required=False)
        scheduled_time = serializers.DateTimeField()
        notes = serializers.CharField(required=False)

    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField()
        customer_name = serializers.CharField()
        scheduled_time = serializers.DateTimeField()
        status = serializers.CharField()

    def post(self, request):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        booking = create_service_booking(**serializer.validated_data)

        if booking:
            output_serializer = self.OutputSerializer(booking)
            return response.Response(output_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return response.Response({"error": "Unable to create booking"}, status=status.HTTP_400_BAD_REQUEST)
