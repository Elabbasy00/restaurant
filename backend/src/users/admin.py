from django.contrib import admin, messages
from django.contrib.auth.models import Group

# from rest_framework.authtoken.models import Token
from src.users.models import User
from django.contrib import admin
from django.contrib.auth import admin as upstream

# from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from src.users.services import user_create

# admin.site.unregister(Token)
admin.site.unregister(Group)


class UserAdmin(upstream.UserAdmin):
    fieldsets = (
        (
            None,
            {"fields": ("username", "password", "email", "role")},
        ),
        (_("Personal info"), {"fields": ("first_name", "last_name")}),
        (_("Permissions"), {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "password1", "password2", "email", "first_name", "last_name"),
            },
        ),
    )

    # def save_model(self, request, obj, form, change):
    #     if change:
    #         return super().save_model(request, obj, form, change)
    #     try:
    #         user_create(**form.cleaned_data)
    #     except ValidationError as exc:
    #         self.message_user(request, str(exc), messages.ERROR)

    # form = UserChangeForm
    # add_form = UserCreationForm

    def has_add_permission(self, request, obj=None):
        if request.user.is_superuser or request.user.role != "owner":
            return True
        return False

    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser or request.user.role != "owner":
            return True
        return False

    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser or request.user.role != "owner":
            return True
        return False

    def has_module_permission(self, request, obj=None):
        if request.user.is_superuser or request.user.role != "owner":
            return True
        return False

    def has_view_permission(self, request, obj=None) -> bool:
        if request.user.is_superuser or request.user.role != "owner":
            return True
        return False


try:
    admin.site.unregister(User)
except:
    pass

    admin.site.register(User, UserAdmin)
