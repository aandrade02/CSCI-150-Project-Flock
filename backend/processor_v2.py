import sys
from pathlib import Path

import cv2
import numpy as np
from shapely.geometry import Point, Polygon
from ultralytics import YOLO

HERE = Path(__file__).parent
model = YOLO("yolo11s-obb.pt")
VEHICLES = {"small vehicle", "large vehicle"}

# Corners of each row of parking spots, in pixels (measure in Paint).
# Images not listed here count every vehicle.
ZONES = {
    "testimg5.png": [
        ("zone1", Polygon([(30, 85), (1065, 85), (1065, 330), (30, 330)])),
        ("zone2", Polygon([(30, 480), (1065, 480), (1065, 600), (30, 600)])),
    ],
}


def count_available(image_path, total_spaces, min_conf=0.4, save=False):
    r = model(str(image_path), verbose=False, save=save)[0]
    print("YOLO found", len(r.obb), "objects")
    zones = ZONES.get(Path(image_path).name, [])

    img = r.orig_img.copy()
    for name, poly in zones:
        cv2.polylines(img, [np.array(poly.exterior.coords, np.int32)], True, (255, 0, 0), 2)

    cars = 0
    for (cx, cy, w, h, angle), corners, c, conf in zip(
            r.obb.xywhr.tolist(), r.obb.xyxyxyxy.tolist(), r.obb.cls, r.obb.conf):
        if r.names[int(c)] not in VEHICLES or conf < min_conf:
            continue
        counted = not zones or any(poly.contains(Point(cx, cy)) for name, poly in zones)
        color = (0, 200, 0) if counted else (0, 0, 255)  # green = counted, red = skipped
        cv2.polylines(img, [np.array(corners, np.int32)], True, color, 2)
        if counted:
            cars += 1

    out = HERE / f"zone_check_{Path(image_path).stem}.png"
    cv2.imwrite(str(out), img)
    print("Saved", out)

    available = max(total_spaces - cars, 0)
    return {"cars": cars, "available": available,
            "percent_open": round(available / total_spaces * 100, 1)}


if __name__ == "__main__":
    name = sys.argv[1] if len(sys.argv) > 1 else "testimg5.png"
    total_spaces = int(sys.argv[2]) if len(sys.argv) > 2 else 107
    print(count_available(HERE / "images" / name, total_spaces, save=True))