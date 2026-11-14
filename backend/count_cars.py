# count_cars.py : quick resolution test
# Counts vehicles in one image at a few YOLO input sizes, so you can see
# whether the picture is sharp enough.
#
# Run (from Backend, .venv active):
#   python count_cars.py images/p20.jpg
#   python count_cars.py images/p20.jpg yolo11m-obb.pt     (bigger model)

import sys
from pathlib import Path

import cv2
import numpy as np
from ultralytics import YOLO

image_path = sys.argv[1] if len(sys.argv) > 1 else "images/testimg5.png"
model_name = sys.argv[2] if len(sys.argv) > 2 else "yolo11s-obb.pt"

VEHICLES = {"small vehicle", "large vehicle"}
CONF = 0.25
SIZES = [1024, 1536, 2048]     # YOLO input sizes to try

model = YOLO(model_name)
img = cv2.imread(image_path)
print(f"Image: {image_path}  ({img.shape[1]} x {img.shape[0]} px)")
print(f"Model: {model_name}   min confidence: {CONF}\n")

for size in SIZES:
    r = model(image_path, imgsz=size, conf=CONF, verbose=False)[0]

    cars = []
    for corners, c in zip(r.obb.xyxyxyxy.tolist(), r.obb.cls):
        if r.names[int(c)] in VEHICLES:
            cars.append(corners)

    print(f"imgsz {size}: {len(cars)} vehicles")

    # draw green boxes so you can see what it found and what it missed
    out = img.copy()
    for corners in cars:
        cv2.polylines(out, [np.array(corners, np.int32)], True, (0, 200, 0), 2)
    out_path = f"count_{Path(image_path).stem}_{size}.png"
    cv2.imwrite(out_path, out)
    print(f"   saved {out_path}")

print("\nIf the count keeps climbing with size, the image is usable but needs a big imgsz.")
print("If it stays low and the saved images show many unboxed cars, the picture is too blurry.")
