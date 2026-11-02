from pathlib import Path
from ultralytics import YOLO

HERE = Path(__file__).parent
model = YOLO("yolo11s-obb.pt")
VEHICLES = {"small vehicle", "large vehicle"}

def count_available(image_path, total_spaces, min_conf=0.4):
    r = model(str(image_path), verbose=False)[0]
    cars = sum(1 for c, conf in zip(r.obb.cls, r.obb.conf)
               if r.names[int(c)] in VEHICLES and conf >= min_conf)
    available = max(total_spaces - cars, 0)
    return {"cars": cars, "available": available,
            "percent_open": round(available / total_spaces * 100, 1)}

if __name__ == "__main__":
    print(count_available(HERE / "images" / "testimg5.png", 107))