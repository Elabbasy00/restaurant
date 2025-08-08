from django.db import models
from django.utils.translation import gettext_lazy as _
from src.menu.models import MenuItemVariation, MenuItem
from django.core.exceptions import ValidationError

UNITS = (
    ("Liter", "لتر"),
    ("Kilogram", "كيلوغرام"),
    ("Piece", "قطعة"),
    ("Pack", "عبوة"),
    ("Bottle", "زجاجة"),
    ("Gram", "غرام"),
    ("Milliliter", "ملتر"),
)


class Ingredient(models.Model):
    name = models.CharField(_("اسم"), max_length=150, unique=True)
    unit = models.CharField(_("الوحدة"), choices=UNITS, max_length=12)
    quantity_in_stock = models.FloatField(_("الكمية المتوفرة في المخزون"), default=0)
    reorder_level = models.FloatField(_("مستوى إعادة الطلب"), default=0)
    create_at = models.DateTimeField(_("تم إنشاؤه في"), auto_now_add=True)
    updated_at = models.DateTimeField(_("تم التحديث في"), auto_now=True)

    class Meta:
        verbose_name = _("المكون")
        verbose_name_plural = _("المكونات")

    def is_low(self):
        return self.quantity_in_stock <= self.reorder_level

    def is_out_of_stock(self):
        """Check if completely out of stock"""
        return self.quantity_in_stock <= 0

    def clean(self):
        if self.quantity_in_stock < 0:
            raise ValidationError("لا يمكن أن تكون كمية المخزون سلبية")
        if self.reorder_level < 0:
            raise ValidationError("لا يمكن أن يكون مستوى إعادة الطلب سلبيا")

    def __str__(self):
        return f"{self.name} ({self.quantity_in_stock} {self.unit})"


class RecipeIngredient(models.Model):
    """
    Manufacturing Materials based on ProductVariation
    """

    ingredient = models.ForeignKey(
        Ingredient, on_delete=models.CASCADE, related_name="recipes", verbose_name=_("المكون")
    )
    variation = models.ForeignKey(
        MenuItemVariation,
        on_delete=models.CASCADE,
        related_name="recipe_ingredients",
        null=True,
        blank=True,
        verbose_name=_("الصنف"),
    )
    menu_item = models.ForeignKey(
        MenuItem,
        on_delete=models.CASCADE,
        related_name="recipe_ingredients",
        null=True,
        blank=True,
        verbose_name=_("الصنف"),
    )
    quantity_required = models.FloatField(
        default=0,
        verbose_name=_("الكمية المطلوبة"),
        help_text=_("الكمية المطلوبة من المكون"),
    )

    class Meta:
        unique_together = [("variation", "ingredient"), ("menu_item", "ingredient")]
        constraints = [
            models.CheckConstraint(
                check=models.Q(variation__isnull=False) | models.Q(menu_item__isnull=False), name="not_both_null"
            ),
            models.CheckConstraint(
                check=~(models.Q(variation__isnull=False) & models.Q(menu_item__isnull=False)), name="not_both_not_null"
            ),
        ]
        verbose_name = _("مكونات الوصفة")
        verbose_name_plural = _("مكونات الوصفة")

    def clean(self):
        if self.quantity_required < 0:
            raise ValidationError("الكمية المطلوبة لا يمكن أن تكون سلبية")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        if self.variation:
            return f"{self.variation} needs {self.quantity_required} {self.ingredient.unit} of {self.ingredient.name}"
        return f"{self.menu_item} needs {self.quantity_required} {self.ingredient.unit} of {self.ingredient.name}"
