import sys
from pathlib import Path
from django.core.management.base import BaseCommand
from django.utils import timezone
from parking.models import AvailabilityRecord, ParkingLot

BACKEND_DIR = Path(__file__).resolve().parents[5] / "backend"


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("image")
        parser.add_argument("--lot", required=True)
        parser.add_argument("--total", type=int)

    def handle(self, *args, **opts):
        lot, _ = ParkingLot.objects.get_or_create(
            name=opts["lot"],
            defaults={"permit_type": "student", "total_spaces": opts["total"]},
        )

        sys.path.insert(0, str(BACKEND_DIR))
        from processor_v2 import count_available
        result = count_available(BACKEND_DIR / "images" / opts["image"], lot.total_spaces)

        AvailabilityRecord.objects.create(
            parking_lot=lot,
            available_spaces=result["available"],
            recorded_at=timezone.now(),
        )
        print(f"Saved {lot.name}: {result['cars']} cars parked, "
              f"{result['available']}/{lot.total_spaces} available "
              f"({result['percent_open']}% available)")