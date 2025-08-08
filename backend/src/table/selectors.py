from src.table.models import Table, TableArea
from src.common.utils import get_object
from django.db.models import Prefetch


def get_table_areas_list():
    """Get all active table areas with their tables"""
    return TableArea.objects.filter(is_active=True).prefetch_related(
        Prefetch("tables", queryset=Table.objects.filter(is_active=True))
    )


def get_table_area_by_id(area_id: int):
    """Get table area by ID"""
    return get_object(TableArea.objects.prefetch_related("tables"), id=area_id)


def get_tables_list():
    """Get all active tables"""
    return Table.objects.filter(is_active=True).select_related("area")


def get_table_by_id(table_id: int):
    """Get table by ID"""
    return get_object(Table.objects.select_related("area"), id=table_id)


def get_tables_by_area(area_id: int):
    """Get tables by area"""
    return Table.objects.filter(area_id=area_id, is_active=True).select_related("area")


def get_tables_by_status(status: str):
    """Get tables by status"""
    return Table.objects.filter(status=status, is_active=True).select_related("area")


def filter_tables(*args, **kwargs):
    return Table.objects.filter(*args, **kwargs)
