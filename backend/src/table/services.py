from src.table.models import Table, TableArea
from src.table.selectors import filter_tables
from django.db.models import Q
from typing import List, Optional
from src.api.exception_handlers import ApplicationError


def get_available_tables(area_id: Optional[int] = None) -> List[Table]:
    """Get all available tables, optionally filtered by area"""
    queryset = filter_tables(status="available", is_active=True)
    if area_id:
        queryset = queryset.filter(area_id=area_id)
    return list(queryset.select_related("area"))


def change_table_status(table_id: int, status: str) -> bool:
    """Reserve a table"""
    try:
        table = filter_tables(id=table_id).update(status=status)
        return True
    except Exception as e:
        raise ApplicationError(f"Failed to change table status: {e}")
