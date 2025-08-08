from django.urls import include, path

urlpatterns = [
    path("auth/", include(("src.authentication.urls", "authentication"))),
    path("users/", include(("src.users.urls", "users"))),
    path("menu/", include(("src.menu.urls", "menu"))),
    path("tables/", include(("src.table.urls", "tables"))),
    path("orders/", include(("src.order.urls", "orders"))),
    path("services/", include(("src.service.urls", "services"))),
]
