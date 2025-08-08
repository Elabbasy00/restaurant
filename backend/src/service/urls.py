from django.urls import path
from .views import *


urlpatterns = [
    path("categories/", ServiceCategoryListView.as_view(), name="service-categories"),
    path("", ServiceListView.as_view(), name="service-list"),
    path("<str:slug>/", ServiceDetailView.as_view(), name="service-detail"),
    path("<str:slug>/availability/", ServiceAvailabilityView.as_view(), name="service-availability"),
    path("<int:service_id>/bookings/", ServiceBookingCreateView.as_view(), name="service-booking-create"),
]
