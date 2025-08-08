from src.service.models import Service, ServiceCategory, ServiceBooking
from src.common.utils import get_object
from django.db.models import Prefetch


def get_service_categories_list():
    """Get all active service categories with their services"""
    return (
        ServiceCategory.objects.filter(is_active=True)
        .prefetch_related(Prefetch("services", queryset=Service.objects.filter(is_active=True)))
        .order_by("sort_order", "name")
    )


def get_service_category_by_slug(slug: str):
    """Get service category by slug"""
    return get_object(ServiceCategory.objects.prefetch_related("services"), slug=slug)


def get_services_list():
    """Get all active services"""
    return Service.objects.filter(is_active=True).select_related("category")


def get_service_by_slug(slug: str):
    """Get service by slug"""
    return get_object(Service.objects.select_related("category"), slug=slug)


def get_service_by_id(id: int, is_active: bool = True):
    """Get service by id"""
    return get_object(Service.objects.select_related("category"), id=id, is_active=is_active)


def get_services_by_category(category_id: int):
    """Get services by category"""
    return Service.objects.filter(category_id=category_id, is_active=True).select_related("category")


def get_service_bookings_list():
    """Get all service bookings"""
    return ServiceBooking.objects.select_related("service__category").order_by("-created_at")


def get_booking_by_id(booking_id: int):
    """Get booking by ID"""
    return get_object(ServiceBooking.objects.select_related("service__category"), id=booking_id)
