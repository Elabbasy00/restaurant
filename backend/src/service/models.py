from django.db import models
from django.utils.translation import gettext_lazy as _
from django_resized import ResizedImageField


class ServiceCategory(models.Model):
    """Categories for different services (Kids Area, Barber Shop, etc.)"""

    name = models.CharField(_("اسم الفئة"), max_length=100)
    slug = models.SlugField(max_length=250, unique=True)
    description = models.TextField(blank=True)
    image = ResizedImageField(
        size=[350, 350],
        crop=["middle", "center"],
        force_format="WEBP",
        quality=100,
        upload_to="images/service_categories/",
        blank=True,
        null=True,
    )
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]
        verbose_name = _("فئة الخدمة")
        verbose_name_plural = _("فئات الخدمات")

    def __str__(self):
        return self.name


class Service(models.Model):
    """Individual services that can be added to orders"""

    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE, related_name="services")
    name = models.CharField(_("اسم الخدمة"), max_length=200)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = ResizedImageField(
        size=[700, 500],
        crop=["middle", "center"],
        force_format="WEBP",
        quality=100,
        upload_to="images/services/",
        blank=True,
        null=True,
    )
    is_active = models.BooleanField(default=True)
    requires_booking = models.BooleanField(default=False)

    class Meta:
        verbose_name = _("خدمة")
        verbose_name_plural = _("خدمات")

    def __str__(self):
        return f"{self.category.name} - {self.name}"


class ServiceBooking(models.Model):
    """Bookings for services that require scheduling"""

    BOOKING_STATUS = (
        ("pending", "قيد الانتظار"),
        ("confirmed", "مؤكد"),
        ("in_progress", "في تَقَدم"),
        ("completed", "مكتمل"),
        ("cancelled", "تم الإلغاء"),
    )

    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    customer_name = models.CharField(max_length=100)
    customer_phone = models.CharField(max_length=20, blank=True)
    scheduled_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=BOOKING_STATUS, default="pending")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("حجز خدمة")
        verbose_name_plural = _("حجوزات الخدمات")

    def __str__(self):
        return f"{self.service.name} - {self.customer_name} - {self.scheduled_time}"
