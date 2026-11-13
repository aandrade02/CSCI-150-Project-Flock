import os
import sys
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from parking.models import AvailabilityRecord, ParkingLot


def backend_dir():
    # In Docker the backend folder is mounted at /backend (set by BACKEND_DIR).
    # Outside Docker it sits next to the database folder in the repo.
    if os.environ.get("BACKEND_DIR"):
        return Path(os.environ["BACKEND_DIR"])
    return Path(__file__).resolve().parents[5] / "backend"


class Command(BaseCommand):
    help = "Run processor_v2 on an image and save the lot's availability."

    def add_arguments(self, parser):
        parser.add_argument("image", help="file name inside backend/images, e.g. testimg5.png")
        parser.add_argument("--lot", required=True,
                            help="lot name; use a campus code like P20 so it shows on the map")
        parser.add_argument("--total", type=int,
                            help="total spaces in the image (required for a new lot)")
        parser.add_argument("--permit", default="student")

    def handle(self, *args, **opts):
        backend = backend_dir()
        image = backend / "images" / opts["image"]
        if not image.exists():
            raise CommandError(f"Image not found: {image}")

        lot = ParkingLot.objects.filter(name__iexact=opts["lot"]).first()
        if lot is None:
            if not opts["total"]:
                raise CommandError("New lot: pass --total with the number of spaces.")
            lot = ParkingLot.objects.create(name=opts["lot"], permit_type=opts["permit"],
                                            total_spaces=opts["total"])
        elif opts["total"] and opts["total"] != lot.total_spaces:
            lot.total_spaces = opts["total"]
            lot.save(update_fields=["total_spaces"])

        sys.path.insert(0, str(backend))
        from processor_v2 import count_available
        result = count_available(image, lot.total_spaces)

        AvailabilityRecord.objects.create(
            parking_lot=lot,
            available_spaces=result["available"],
            recorded_at=timezone.now(),
        )
        self.stdout.write(self.style.SUCCESS(
            f"Saved {lot.name}: {result['cars']} cars parked, "
            f"{result['available']}/{lot.total_spaces} available "
            f"({result['percent_open']}% available)"))