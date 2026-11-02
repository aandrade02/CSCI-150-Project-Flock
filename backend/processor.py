from ultralytics import YOLO

model = YOLO("yolo11s-obb.pt")

results = model("images/testimg1.png", save=True)

print("Vehicles found:", len(results[0].obb))

total_spots = 107

cars = len(results[0].obb)

availablePercentage = (total_spots - cars) / total_spots * 100
availablePercentage = round(availablePercentage, 1)
availableSpots = total_spots - cars

print("Available parking spots percentage:", availablePercentage, "%")
print("Available parking spots:", availableSpots)

