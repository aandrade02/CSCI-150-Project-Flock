from django.db import models

# Create your models here.
class ParkingLot(models.Model):
    name = models.CharField(max_length=100)
    permit_type = models.CharField(max_length=50)
    total_spaces = models.PositiveIntegerField()

class AvailabilityRecord(models.Model):
    parking_lot = models.ForeignKey(
        ParkingLot,
        on_delete=models.CASCADE
    )
    available_spaces = models.PositiveIntegerField()
    recorded_at = models.DateTimeField()