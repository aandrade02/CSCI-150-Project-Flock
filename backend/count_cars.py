# count_cars_tiled.py : count vehicles in a very large image (like 8K)
# Cuts the image into overlapping 1024 px tiles, runs YOLO on each tile at
# full sharpness, then removes cars counted twice where tiles overlap.
#
# Run (from Backend, .venv active):
#   python count_cars_tiled.py images/p20_8k.jpg
#   python count_cars_tiled.py images/p20_8k.jpg yolo11m-obb.pt

import sys
from pathlib import Path

import cv2
import numpy as np
from shapely.geometry import Polygon
from ultralytics import YOLO

image_path = sys.argv[1]
model_name = sys.argv[2] if len(sys.argv) > 2 else "yolo11s-obb.pt"

VEHICLES = {"small vehicle", "large vehicle"}
CONF = 0.25
TILE = 1024        # tile size in pixels (what the model was trained on)
OVERLAP = 128      # tiles overlap so cars on a tile edge aren't cut in half
DUP_OVERLAP = 0.5  # boxes sharing 50%+ of the smaller one = same car
EDGE = 4           # a box this close to a tile edge is a cut-off car

model = YOLO(model_name)
img = cv2.imread(image_path)
H, W = img.shape[:2]
print(f"Image: {image_path}  ({W} x {H} px)")

# 1. cut into tiles
step = TILE - OVERLAP
tiles, offsets = [], []
for y in range(0, max(H - OVERLAP, 1), step):
    for x in range(0, max(W - OVERLAP, 1), step):
        tiles.append(img[y:y + TILE, x:x + TILE])
        offsets.append((x, y))
print(f"Tiles: {len(tiles)}")

# 2. run YOLO on every tile, shift boxes back to full-image position
cars = []   # each car: (center_x, center_y, corners)
for i in range(0, len(tiles), 8):                      # 8 tiles per batch
    results = model(tiles[i:i + 8], imgsz=TILE, conf=CONF, verbose=False)
    for r, (ox, oy) in zip(results, offsets[i:i + 8]):
        for xywhr, corners, c in zip(r.obb.xywhr.tolist(),
                                     r.obb.xyxyxyxy.tolist(), r.obb.cls):
            if r.names[int(c)] not in VEHICLES:
                continue
            # skip cars cut off by this tile's edge (the overlap means the
            # neighbouring tile sees them whole), unless it's the image edge
            th, tw = r.orig_img.shape[:2]
            xs = [px for px, py in corners]
            ys = [py for px, py in corners]
            if ((min(xs) < EDGE and ox > 0) or (min(ys) < EDGE and oy > 0) or
                    (max(xs) > tw - EDGE and ox + tw < W) or
                    (max(ys) > th - EDGE and oy + th < H)):
                continue
            cx, cy = xywhr[0] + ox, xywhr[1] + oy
            corners = [(px + ox, py + oy) for px, py in corners]
            cars.append((cx, cy, corners, xywhr[2] * xywhr[3]))

# 3. remove duplicates from the overlap areas (biggest box wins)
cars.sort(key=lambda car: car[3], reverse=True)
cars = [(cx, cy, corners) for cx, cy, corners, _ in cars]
unique = []
for cx, cy, corners in cars:
    poly = Polygon(corners)
    duplicate = False
    for ux, uy, kept in unique:
        if abs(cx - ux) > 150 or abs(cy - uy) > 150:   # far apart, skip (speed)
            continue
        kept_poly = Polygon(kept)
        overlap = poly.intersection(kept_poly).area
        if overlap / min(poly.area, kept_poly.area) > DUP_OVERLAP:
            duplicate = True
            break
    if not duplicate:
        unique.append((cx, cy, corners))

print(f"Detections before removing duplicates: {len(cars)}")
print(f"Vehicles: {len(unique)}")

# 4. save a check image with green boxes
out = img.copy()
for _, _, corners in unique:
    cv2.polylines(out, [np.array(corners, np.int32)], True, (0, 200, 0), 2)
out_path = f"count_{Path(image_path).stem}_tiled.png"
cv2.imwrite(out_path, out)
print(f"Saved {out_path}")
