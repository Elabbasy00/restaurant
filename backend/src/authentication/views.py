from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
)
from src.users.selectors import user_get_login_data
from src.api.mixins import ApiAuthMixin
from rest_framework import serializers
from src.users.services import user_update, user_create
from django.contrib.auth import password_validation
from django.utils.translation import gettext_lazy as _
from rest_framework.permissions import AllowAny


class CreateUser(AllowAny, APIView):
    class InputSerializer(serializers.Serializer):
        first_name = serializers.CharField()
        last_name = serializers.CharField()
        username = serializers.CharField()
        email = serializers.EmailField()
        phone_number = serializers.CharField()
        password = serializers.CharField()

    def post(self, request):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = user_create(**serializer.validated_data)
        return Response({"user created"})


class UserSessionLoginApi(APIView):
    class InputSerializer(serializers.Serializer):
        username = serializers.CharField()
        password = serializers.CharField()

    def post(self, request):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(request, **serializer.validated_data)

        if user is None:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        login(request, user)
        data = user_get_login_data(user=user)
        session_key = request.session.session_key

        return Response({"session": session_key, "data": data})


class UserSessionLogoutApi(ApiAuthMixin, APIView):
    def get(self, request):
        logout(request)

        return Response()

    def post(self, request):
        logout(request)

        return Response()


class UserJwtLoginApi(TokenObtainPairView):

    def post(self, request, *args, **kwargs):
        # We are redefining post so we can change the response status on success
        # Mostly for consistency with the session-based API
        response = super().post(request, *args, **kwargs)

        if response.status_code == status.HTTP_201_CREATED:
            response.status_code = status.HTTP_200_OK

        if settings.SIMPLE_JWT["JWT_AUTH_COOKIE"] is not None:
            response.set_cookie(
                key=settings.SIMPLE_JWT["JWT_AUTH_COOKIE"],
                value=response.data.get("access"),
                expires=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
                secure=settings.SIMPLE_JWT["JWT_AUTH_COOKIE_SECURE"],
                samesite=settings.SIMPLE_JWT["JWT_AUTH_COOKIE_SAMESITE"],
            )

        return response


class UserJwtLogoutApi(ApiAuthMixin, APIView):
    def post(self, request):

        response = Response()

        if settings.SIMPLE_JWT["JWT_AUTH_COOKIE"] is not None:
            response.delete_cookie(settings.SIMPLE_JWT["JWT_AUTH_COOKIE"])

        return response


class UserMeApi(ApiAuthMixin, APIView):
    class InputSerializer(serializers.Serializer):
        first_name = serializers.CharField()
        last_name = serializers.CharField()
        email = serializers.EmailField()
        phone_number = serializers.CharField()

    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField()
        email = serializers.EmailField()
        is_staff = serializers.BooleanField()
        username = serializers.CharField()
        first_name = serializers.CharField()
        last_name = serializers.CharField()
        is_superuser = serializers.BooleanField()

    def get(self, request):

        data = self.OutputSerializer(request.user).data

        return Response(data)

    def post(self, request):

        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = user_update(user=request.user, **serializer.validated_data)
        data = user_get_login_data(user=user)
        return Response(data)


class ChangePassword(ApiAuthMixin, APIView):
    class InputSerializer(serializers.Serializer):
        old_password = serializers.CharField()
        password1 = serializers.CharField()
        password2 = serializers.CharField()

        def validate_old_password(self, value):

            user = self.context["request"].user
            if not user.check_password(value):
                raise serializers.ValidationError(
                    _("Your old password was entered incorrectly. Please enter it again.")
                )
            return value

        def validate(self, data):
            if data["password1"] != data["password2"]:
                raise serializers.ValidationError({"password2": _("The two password fields didn't match.")})

            password_validation.validate_password(data["password1"], self.context["request"].user)
            return data

    def post(self, request):

        serializer = self.InputSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        password = serializer.validated_data.get("password1")
        request.user.set_password(password)
        request.user.save()
        return Response({"Password Changed"})
