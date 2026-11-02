import sys
from pathlib import Path
import cv2
import numpy as np
from shapely.geometry import Point, Polygon
from ultralytics import YOLO

HERE = Path(__file__).parent
model = YOLO("yolo11s-obb.pt")
VEHICLES = {"small vehicle", "large vehicle"}

ZONES = {
    "testimg5.png": [
        ("zone1", Polygon([(30, 85), (1065, 85), (1065, 300), (30, 330)])),
        ("zone2", Polygon([(30, 480), (1065, 480), (1065, 600), (30, 600)])),
    ],
}

def count_available(image_path, total_spaces, min_conf=0.4, save=False):
    r = model(str(image_path), verbose=False, save=save)[0]
    zones = ZONES.get(Path(image_path).name, [])
    cars = 0
    for (cx, cy, w, h, angle), c, conf in zip(r.obb.xywhr.tolist(), r.obb.cls, r.obb.conf):
        if r.names[int(c)] not in VEHICLES and conf < min_conf:
            continue
        if zones and not any(poly.contains(Point(cx, cy)) for name, poly in zones):
            continue
        cars += 1   
    available = max(total_spaces - cars, 0)
    return {"cars": cars, "available": available,
            "percent_open": round(available / total_spaces * 100, 1)}

if __name__ == "__main__":
    name = sys.argv[1] if len(sys.argv) > 1 else "testimg5.png"
    total_spaces = int(sys.argv[2]) if len(sys.argv) > 2 else 107
    print(count_available(HERE / "images" / name, total_spaces, save=True))