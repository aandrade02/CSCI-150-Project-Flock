# draw_zones.py : check a lot's map before counting
# Draws every row (blue), every spot (yellow) and skipped spots (red X)
# from lot_directory.json onto the lot's image. No YOLO needed.
#
# Run (from Backend):  python draw_zones.py S1
# Opens nothing; saves zones_S1.png next to this script.

import json
import sys
from pathlib import Path

import cv2
import numpy as np

HERE = Path(__file__).parent
DIRECTORY = HERE / "lot_directory.json"
IMAGES = HERE / "images"


def split_row(row):
    """Yield (spot number, 4 corners) for every spot in a row, skipped ones too.
    Works for straight and slanted rows: splits the top and bottom edges."""
    tl, tr, br, bl = row["corners"]
    n = row["spots"]
    for i in range(n):
        a, b = i / n, (i + 1) / n
        top1 = (tl[0] + (tr[0] - tl[0]) * a, tl[1] + (tr[1] - tl[1]) * a)
        top2 = (tl[0] + (tr[0] - tl[0]) * b, tl[1] + (tr[1] - tl[1]) * b)
        bot2 = (bl[0] + (br[0] - bl[0]) * b, bl[1] + (br[1] - bl[1]) * b)
        bot1 = (bl[0] + (br[0] - bl[0]) * a, bl[1] + (br[1] - bl[1]) * a)
        yield i, [top1, top2, bot2, bot1]


lot_id = sys.argv[1] if len(sys.argv) > 1 else "T5"
lots = json.load(open(DIRECTORY))
lot = lots[lot_id]
img = cv2.imread(str(IMAGES / lot["image"]))
if img is None:
    sys.exit(f"Can't open {IMAGES / lot['image']}")

thick = max(2, img.shape[1] // 1500)       # thicker lines on 8K images
total = 0
for row in lot["rows"]:
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

out = HERE / f"zones_{lot_id}.png"
cv2.imwrite(str(out), img)
print(f"{lot['name']}: {len(lot['rows'])} rows, {total} spots (after skips)")
print(f"Saved {out}")
