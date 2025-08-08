from django.urls import path
from .views import TableAreaListView, TableListView, TableStatusUpdateView, AvailableTablesView


urlpatterns = [
    path("areas/", TableAreaListView.as_view(), name="table-areas-list"),
    path("list/", TableListView.as_view(), name="tables-list"),
    path("update_status/", TableStatusUpdateView.as_view(), name="update_table-status"),
    path("available/", AvailableTablesView.as_view(), name="available-tables"),
]
