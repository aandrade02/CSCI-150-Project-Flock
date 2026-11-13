# File containing mapped out lots with their static images
from shapely.geometry import Point, Polygon

TEST_LOTS = {
    "testimg5.png": [
        ("zone1", Polygon([(30, 85), (1065, 85), (1065, 330), (30, 330)])),
        ("zone2", Polygon([(30, 480), (1065, 480), (1065, 600), (30, 600)])),
    ],
    "testimg1.png": [
        ("zone1", Polygon([(60, 0), (295,0), (60, 125), (290, 125)])),
        ("zone2", Polygon([(60, 205), (615, 205), (60, 325), (610, 325)])),
        ("zone3", Polygon([(60, 405), (610, 405), (60, 525), (610, 525)])),
        ("zone4", Polygon([(55, 605), (600, 610), (55, 670), (600, 670)])),
    ],
}

# STUDENT_LOTS = \

# STAFF_LOTS  = \
