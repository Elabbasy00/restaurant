from django.urls import path
from . import views


urlpatterns = [
    path("create/", views.OrderCreateView.as_view(), name="order-create"),
    path("list/", views.OrderListView.as_view(), name="order-list"),
    path("<int:order_id>/", views.OrderDetailView.as_view(), name="order-detail"),
    path("split-payment/<int:order_id>/", views.PaymentSplitView.as_view(), name="split-payment"),
    path("<int:order_id>/payment/", views.OrderPaymentUpdateView.as_view(), name="order-payment-update"),
    path("cancel/<int:order_id>/", views.CancelOrderView.as_view(), name="cancel-order"),
    path(
        "order-item/update/<int:itemId>/",
        views.UpdateOrderItemsServicesView.as_view(),
        name="update-order-items-services",
    ),
    path("stats/", views.OrderStats.as_view(), name="order-stats"),
]
