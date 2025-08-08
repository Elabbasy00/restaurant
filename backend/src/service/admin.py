from django.contrib import admin
from .models import ServiceCategory, Service, ServiceBooking


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "is_active", "sort_order"]
    list_filter = ["is_active"]
    search_fields = ["name"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "price", "is_active", "requires_booking"]
    list_filter = ["category", "is_active", "requires_booking"]
    search_fields = ["name", "category__name"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(ServiceBooking)
class ServiceBookingAdmin(admin.ModelAdmin):
    list_display = ["service", "created_at", "status"]
    list_filter = ["service", "created_at", "status"]
    search_fields = ["service__name", "created_at"]
