# draw_zones.py : check a lot's map before counting
# Draws every row (blue), every spot (yellow) and skipped spots (red X)
# from lot_directory.json onto the lot's image. No YOLO needed.
#
# Run (from Backend):  python draw_zones.py S1          (every snapshot)
#                       python draw_zones.py S1 2021     (one snapshot)
# Saves zones_<lot>_<label>.png next to this script.

import json
import sys
from pathlib import Path

import cv2
import numpy as np

HERE = Path(__file__).parent
# Looks for the lot file and images in either place, so you don't have to edit this.
DIRECTORY = next((p for p in [HERE / "lot_directory.json",
                              HERE / "LOT_DIRECTORY" / "lot_directory.json"] if p.exists()),
                 HERE / "lot_directory.json")
IMAGES_DIRS = [HERE / "images", HERE]


def find_image(name):
    for folder in IMAGES_DIRS:
        if (folder / name).exists():
            return folder / name
    return IMAGES_DIRS[0] / name


def order_corners(corners):
    """Put 4 corners in TL, TR, BR, BL order, whatever order they were typed in.
    (Works for rows that run left-to-right in the image.)"""
    pts = sorted(corners, key=lambda p: p[1])          # sort by y
    top = sorted(pts[:2], key=lambda p: p[0])          # top two, left to right
    bottom = sorted(pts[2:], key=lambda p: p[0])       # bottom two, left to right
    return [top[0], top[1], bottom[1], bottom[0]]


def split_row(row):
    """Yield (spot number, 4 corners) for every spot in a row, skipped ones too.
    Works for straight and slanted rows: splits the top and bottom edges."""
    tl, tr, br, bl = order_corners(row["corners"])
    n = row["spots"]
    for i in range(n):
        a, b = i / n, (i + 1) / n
        top1 = (tl[0] + (tr[0] - tl[0]) * a, tl[1] + (tr[1] - tl[1]) * a)
        top2 = (tl[0] + (tr[0] - tl[0]) * b, tl[1] + (tr[1] - tl[1]) * b)
        bot2 = (bl[0] + (br[0] - bl[0]) * b, bl[1] + (br[1] - bl[1]) * b)
        bot1 = (bl[0] + (br[0] - bl[0]) * a, bl[1] + (br[1] - bl[1]) * a)
        yield i, [top1, top2, bot2, bot1]


def lot_images(lot):
    """Every snapshot of a lot as a list of {"file", "label", "offset"}.
    Works with the old single "image" and the new "images" list."""
    if "images" in lot:
        return lot["images"]
    return [{"file": lot["image"], "label": "1", "offset": lot.get("offset", [0, 0])}]


def shifted(corners, offset):
    dx, dy = offset
    return [[x + dx, y + dy] for x, y in corners]


lot_id = sys.argv[1] if len(sys.argv) > 1 else "T5"
want = sys.argv[2] if len(sys.argv) > 2 else None     # a label, or all images
lots = json.load(open(DIRECTORY))
lot = lots[lot_id]

for snap in lot_images(lot):
    if want and snap["label"] != want:
        continue
    path = find_image(snap["file"])
    img = cv2.imread(str(path))
    if img is None:
        print(f"Can't open {path}")
        continue
    offset = snap.get("offset", [0, 0])
    rows = snap.get("rows", lot["rows"])           # a snapshot can override rows

    thick = max(2, img.shape[1] // 1500)           # thicker lines on 8K images
    total = 0
    for row in rows:
        # image offset + this row's own offset (if it has one)
        rdx, rdy = row.get("offset", [0, 0])
        total_offset = [offset[0] + rdx, offset[1] + rdy]
        row = dict(row, corners=shifted(order_corners(row["corners"]), total_offset))
        for i, corners in split_row(row):
            pts = np.array(corners, np.int32)
            if i in row.get("skip", []):
                cv2.line(img, tuple(pts[0]), tuple(pts[2]), (0, 0, 255), thick)
                cv2.line(img, tuple(pts[1]), tuple(pts[3]), (0, 0, 255), thick)
            else:
                cv2.polylines(img, [pts], True, (0, 255, 255), thick)
                total += 1
        cv2.polylines(img, [np.array(row["corners"], np.int32)], True, (255, 0, 0), thick * 2)
        x, y = row["corners"][0]
        cv2.putText(img, row["id"], (int(x), int(y) - 8), cv2.FONT_HERSHEY_SIMPLEX,
                    thick * 0.6, (255, 0, 0), thick)

    out = HERE / f"zones_{lot_id}_{snap['label']}.png"
    cv2.imwrite(str(out), img)
    print(f"{lot['name']} [{snap['label']}]: {len(rows)} rows, {total} spots, "
          f"image offset {offset} -> {out.name}")
    for row in rows:
        if "offset" in row:
            print(f"   {row['id']} offset {row['offset']}")
