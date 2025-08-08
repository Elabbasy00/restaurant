from django.urls import path
from src.menu.views import CategoryListView, MenuItemView


urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="categories"),
    path("menu-items/<slug:slug>/", MenuItemView.as_view(), name="menu-items"),
]
