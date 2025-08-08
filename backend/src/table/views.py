from rest_framework import serializers, views, response, status
from src.api.utils import inline_serializer
from src.table.selectors import get_table_areas_list, get_tables_list
from src.table.services import get_available_tables, change_table_status


class TableAreaListView(views.APIView):
    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField()
        name = serializers.CharField()
        description = serializers.CharField()
        is_active = serializers.BooleanField()
        tables = inline_serializer(
            fields={
                "id": serializers.IntegerField(),
                "number": serializers.CharField(),
                "capacity": serializers.IntegerField(),
                "status": serializers.CharField(),
                "qr_code": serializers.CharField(),
                "is_active": serializers.BooleanField(),
            },
            many=True,
        )

    def get(self, request):
        areas = get_table_areas_list()
        serializer = self.OutputSerializer(areas, many=True)
        return response.Response(serializer.data, status=status.HTTP_200_OK)


class TableListView(views.APIView):
    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField()
        number = serializers.CharField()
        capacity = serializers.IntegerField()
        status = serializers.CharField()
        qr_code = serializers.CharField()
        is_active = serializers.BooleanField()
        area = inline_serializer(
            fields={
                "id": serializers.IntegerField(),
                "name": serializers.CharField(),
            }
        )

    def get(self, request):
        tables = get_tables_list()
        serializer = self.OutputSerializer(tables, many=True)
        return response.Response(serializer.data, status=status.HTTP_200_OK)


class AvailableTablesView(views.APIView):
    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField()
        number = serializers.CharField()
        capacity = serializers.IntegerField()
        area = inline_serializer(
            fields={
                "id": serializers.IntegerField(),
                "name": serializers.CharField(),
            }
        )

    def get(self, request):
        area_id = request.query_params.get("area_id")
        tables = get_available_tables(area_id=int(area_id) if area_id else None)
        serializer = self.OutputSerializer(tables, many=True)
        return response.Response(serializer.data, status=status.HTTP_200_OK)


class TableStatusUpdateView(views.APIView):
    class InputSerializer(serializers.Serializer):
        action = serializers.ChoiceField(choices=["reserve", "occupy", "free"])

    def post(self, request, table_id):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data["action"]

        is_success = change_table_status(table_id, action)

        if is_success:
            return response.Response({"message": f"Table {action}d successfully"})
        else:
            return response.Response({"error": "Unable to update table status"}, status=status.HTTP_400_BAD_REQUEST)
