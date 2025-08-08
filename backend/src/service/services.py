from src.service.models import Service, ServiceBooking
from src.service.selectors import get_service_by_id
from datetime import datetime, timedelta
from django.db import transaction


def get_service_availability(service_id, date):
    """Get availability for a service on a specific date"""
    service = get_service_by_id(service_id)

    if not service.requires_booking:
        return {"available": True, "message": "Service does not require booking", "available_slots": []}

    # Get existing bookings for the date
    existing_bookings = ServiceBooking.objects.filter(
        service_id=service_id, scheduled_time__date=date.date(), status__in=["pending", "confirmed", "in_progress"]
    ).values_list("scheduled_time", flat=True)

    # Generate available time slots (example: 9 AM to 6 PM, 1-hour slots)
    available_slots = []
    start_time = datetime.combine(date.date(), datetime.min.time().replace(hour=9))
    end_time = datetime.combine(date.date(), datetime.min.time().replace(hour=18))

    current_time = start_time
    while current_time < end_time:
        if current_time not in existing_bookings:
            available_slots.append(current_time.strftime("%H:%M"))
        current_time += timedelta(hours=1)

    return {
        "available": len(available_slots) > 0,
        "message": f"{len(available_slots)} slots available",
        "available_slots": available_slots,
    }


@transaction.atomic
def create_service_booking(service_id, customer_name, scheduled_time, customer_phone="", notes=""):
    """Create a new service booking"""
    service = get_service_by_id(service_id)

    if not service.requires_booking:
        return None

    # Check if the time slot is available
    existing_booking = ServiceBooking.objects.filter(
        service_id=service_id, scheduled_time=scheduled_time, status__in=["pending", "confirmed", "in_progress"]
    ).exists()

    if existing_booking:
        return None

    booking = ServiceBooking.objects.create(
        service=service,
        customer_name=customer_name,
        customer_phone=customer_phone,
        scheduled_time=scheduled_time,
        notes=notes,
        status="pending",
    )

    return booking


def update_booking_status(booking_id, status):
    """Update booking status"""
    try:
        booking = ServiceBooking.objects.get(id=booking_id)
        booking.status = status
        booking.save()
        return booking
    except ServiceBooking.DoesNotExist:
        return None


def cancel_booking(booking_id):
    """Cancel a booking"""
    return update_booking_status(booking_id, "cancelled")


def complete_booking(booking_id):
    """Mark booking as completed"""
    return update_booking_status(booking_id, "completed")
