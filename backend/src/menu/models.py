from django.db import models
from django_resized import ResizedImageField
from django.utils.translation import gettext_lazy as _

VARIATION_CHOISE = (("radio", "اختيار واحد"), ("checkbox", "اختيار متعدد"))


class Category(models.Model):
    name = models.CharField(_("الاسم"), max_length=100)
    slug = models.SlugField(_("الرابط"), max_length=250, unique=True)
    image = ResizedImageField(
        _("الصورة"),
        size=[350, 350],
        crop=["middle", "center"],
        force_format="WEBP",
        quality=100,
        upload_to="images/category_image/",
    )

    class Meta:
        verbose_name = _("تصنيف")
        verbose_name_plural = _("تصنيفات")

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="product_category")
    name = models.CharField(_("الاسم"), max_length=100)
    description = models.TextField(_("الوصف"), blank=True)
    price = models.DecimalField(_("السعر"), max_digits=8, decimal_places=2)
    discount_price = models.DecimalField(_("السعر بعد الخصم"), max_digits=8, decimal_places=2, null=True, blank=True)
    slug = models.SlugField(_("الرابط"), max_length=255, null=True, blank=True, unique=True)
    sku = models.CharField(_("الكود"), max_length=20, null=True, blank=True)
    visible = models.BooleanField(_("الحالة"), default=True, null=True, blank=True)
    product_image = ResizedImageField(
        _("الصورة"),
        size=[700, 500],
        crop=["middle", "center"],
        force_format="WEBP",
        quality=100,
        upload_to="images/product_images/",
    )

    class Meta:
        verbose_name = _("منتج")
        verbose_name_plural = _("منتجات")

    def __str__(self):
        return self.name

    def is_available(self):
        """Check if this item is currently available"""
        from src.menu.services import calculate_max_available

        ingredients = self.recipe_ingredients.all()
        return calculate_max_available(ingredients) > 0


class Variation(models.Model):
    """
    Product varations
    eg size, drink, etc..
    """

    item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name="menu_variation")
    name = models.CharField(_("الاسم"), max_length=50)  # size
    value_type = models.CharField(_("نوع القيمة"), max_length=20, choices=VARIATION_CHOISE, null=True, blank=True)
    required = models.BooleanField(_("مطلوب"), default=False)

    class Meta:
        verbose_name = _("تنوع")
        verbose_name_plural = _("تنوعات")
        unique_together = ("item", "name")
        ordering = ["id"]

    def __str__(self):
        return f"{self.item.name} - ({self.name})"


class MenuItemVariation(models.Model):
    """
    varations values
    eg. Small, large, etc..
    """

    variation = models.ForeignKey(
        Variation, on_delete=models.CASCADE, related_name="menu_variation_info", verbose_name=_("التنوع")
    )
    value = models.CharField(_("القيمة"), max_length=50)
    extra_price = models.DecimalField(
        _("السعر الإضافي"), max_digits=8, decimal_places=2, null=True, blank=True, default=0
    )

    class Meta:
        verbose_name = _("تنوع عناصر القائمة")
        verbose_name_plural = _("تنوعات عناصر القائمة")
        unique_together = ("variation", "value")
        ordering = ["id"]

    def __str__(self):
        return self.value

    def is_available(self):
        from src.menu.services import calculate_max_available

        """Check if this item is currently available"""
        ingredients = self.recipe_ingredients.all()
        return calculate_max_available(ingredients) > 0


class ProductGallery(models.Model):
    """
    product image gallery
    """

    menu_item = models.ForeignKey(
        MenuItem, on_delete=models.CASCADE, related_name="product_gallery", verbose_name=_("المنتج")
    )
    image = ResizedImageField(
        _("الصورة"),
        size=[700, 500],
        crop=["middle", "center"],
        force_format="WEBP",
        quality=100,
        upload_to="gallery/products/",
    )

    class Meta:
        verbose_name = _("معرض المنتج")
        verbose_name_plural = _("معرض المنتجات")

    def __str__(self):
        return self.menu_item.name
