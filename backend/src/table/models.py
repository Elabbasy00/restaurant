from django.db import models
from django.utils.translation import gettext_lazy as _


class TableArea(models.Model):
    """Different areas in the resort (Restaurant, Pool, Beach, etc.)"""

    name = models.CharField(_("مكان التربيزة"), max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = _("مكان التربيزة")
        verbose_name_plural = _("أماكن التربيزة")

    def __str__(self):
        return self.name


class Table(models.Model):
    """Tables in different areas"""

    TABLE_STATUS = (
        ("available", "متاح"),
        ("occupied", "مشغول"),
        ("reserved", "محجوز"),
        ("maintenance", "تحت الصيانة"),
    )

    number = models.CharField(_("رقم التربيزة"), max_length=20)
    area = models.ForeignKey(TableArea, on_delete=models.CASCADE, related_name="tables")
    capacity = models.PositiveIntegerField(_("عدد الكراسي المسموح بها"))
    status = models.CharField(max_length=20, choices=TABLE_STATUS, default="available")
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("number", "area")
        verbose_name = _("الطاولة")
        verbose_name_plural = _("الطاولات")

    def __str__(self):
        return f"{self.area.name} - تربيزة {self.number}"
