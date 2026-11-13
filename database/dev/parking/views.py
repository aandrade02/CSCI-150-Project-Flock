from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ParkingLot


@api_view(['GET'])
def parking_lots(request):
    results = []

    for lot in ParkingLot.objects.all():
        latest = lot.availabilityrecord_set.order_by('-recorded_at').first()

        if latest is None:
            continue

        occupied = lot.total_spaces - latest.available_spaces

        percentage = (
            round(occupied * 100 / lot.total_spaces, 2)
            if lot.total_spaces > 0 else 0
        )

        results.append({
            'lot_id': lot.id,
            'lot_name': lot.name,
            'permit_type': lot.permit_type,
            'total_spaces': lot.total_spaces,
            'available_spaces': latest.available_spaces,
            'occupied_spaces': occupied,
            'occupancy_percentage': percentage,
            'available_percentage': round(100 - percentage, 2),
            'recorded_at': latest.recorded_at.isoformat(),
        })

    return Response(results)