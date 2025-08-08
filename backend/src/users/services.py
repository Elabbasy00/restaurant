from src.users.models import User


def user_create(*, username: str, email: str, password: str, **extra_fields: dict) -> User:
    user = User.objects.create_user(username=username, email=email, password=password, **extra_fields)
    return user


def user_update() -> User:
    pass
