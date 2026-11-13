// Fresno State Demo Lots:
// Student (Green Permit): P1, P2, P5, P6, P15, P20
// Staff (Yellow Permit): P30, P31
export const INITIAL_LOTS = [
  {
    id: 'lot-p1',
    code: 'P1',
    name: 'Lot P1',
    permitType: 'Student',
    permitColorName: 'Green Permit (Student/Visitor)',
    percentFull: 74,
    status: 'OK',
    lastUpdated: 'Just now',
    fiveMinDelta: +11,
    coordinates: { x: 516, y: 726, width: 218, height: 88 },
    hasForecastData: true,
    forecasts: {
      hourly: [
        { label: '+1 Hr', pctFull: 96 },
        { label: '+2 Hr', pctFull: 92 },
        { label: '+3 Hr', pctFull: 79 },
        { label: '+4 Hr', pctFull: 60 }
      ],
      daily: [
        { label: 'Tomorrow 8AM', pctFull: 85 },
        { label: 'Tomorrow 12PM', pctFull: 98 },
        { label: 'Tomorrow 4PM', pctFull: 58 }
      ]
    }
  },
  {
    id: 'lot-p2',
    code: 'P2',
    name: 'Lot P2',
    permitType: 'Student',
    permitColorName: 'Green Permit (Student/Visitor)',
    percentFull: 49,
    status: 'OK',
    lastUpdated: '1 min ago',
    fiveMinDelta: +3,
    coordinates: { x: 664, y: 632, width: 70, height: 90 },
    hasForecastData: false,
    forecasts: { hourly: [], daily: [] }
  },
  {
    id: 'lot-p5',
    code: 'P5',
    name: 'Lot P5',
    permitType: 'Student',
    permitColorName: 'Green Permit (Student/Visitor)',
    percentFull: 79,
    status: 'OK',
    lastUpdated: '1 min ago',
    fiveMinDelta: +4,
    coordinates: { x: 662, y: 504, width: 72, height: 122 },
    hasForecastData: true,
    forecasts: {
      hourly: [
        { label: '+1 Hr', pctFull: 85 },
        { label: '+2 Hr', pctFull: 78 },
        { label: '+3 Hr', pctFull: 62 },
        { label: '+4 Hr', pctFull: 44 }
      ],
      daily: [
        { label: 'Tomorrow 8AM', pctFull: 70 },
        { label: 'Tomorrow 12PM', pctFull: 89 },
        { label: 'Tomorrow 4PM', pctFull: 41 }
      ]
    }
  },
  {
    id: 'lot-p6',
    code: 'P6',
    name: 'Lot P6',
    permitType: 'Student',
    permitColorName: 'Green Permit (Student/Visitor)',
    percentFull: 86,
    status: 'OK',
    lastUpdated: 'Just now',
    fiveMinDelta: +8,
    coordinates: { x: 662, y: 352, width: 72, height: 142 },
    hasForecastData: true,
    forecasts: {
      hourly: [
        { label: '+1 Hr', pctFull: 90 },
        { label: '+2 Hr', pctFull: 84 },
        { label: '+3 Hr', pctFull: 68 },
        { label: '+4 Hr', pctFull: 49 }
      ],
      daily: [
        { label: 'Tomorrow 8AM', pctFull: 74 },
        { label: 'Tomorrow 12PM', pctFull: 93 },
        { label: 'Tomorrow 4PM', pctFull: 46 }
      ]
    }
  },
  {
    id: 'lot-p15',
    code: 'P15',
    name: 'Lot P15',
    permitType: 'Student',
    permitColorName: 'Green Permit (Student/Visitor)',
    percentFull: 91,
    status: 'OK',
    lastUpdated: 'Just now',
    fiveMinDelta: +9,
    coordinates: { x: 522, y: 204, width: 32, height: 132 },
    hasForecastData: true,
    forecasts: {
      hourly: [
        { label: '+1 Hr', pctFull: 95 },
        { label: '+2 Hr', pctFull: 88 },
        { label: '+3 Hr', pctFull: 72 },
        { label: '+4 Hr', pctFull: 54 }
      ],
      daily: [
        { label: 'Tomorrow 8AM', pctFull: 78 },
        { label: 'Tomorrow 12PM', pctFull: 96 },
        { label: 'Tomorrow 4PM', pctFull: 50 }
      ]
    }
  },
  {
    id: 'lot-p20',
    code: 'P20',
    name: 'Lot P20',
    permitType: 'Student',
    permitColorName: 'Green Permit (Student/Visitor)',
    percentFull: 96,
    status: 'OK',
    lastUpdated: 'Just now',
    fiveMinDelta: -5,
    coordinates: { x: 155, y: 62, width: 215, height: 112 },
    hasForecastData: true,
    forecasts: {
      hourly: [
        { label: '+1 Hr', pctFull: 56 },
        { label: '+2 Hr', pctFull: 68 },
        { label: '+3 Hr', pctFull: 52 },
        { label: '+4 Hr', pctFull: 34 }
      ],
      daily: [
        { label: 'Tomorrow 8AM', pctFull: 44 },
        { label: 'Tomorrow 12PM', pctFull: 78 },
        { label: 'Tomorrow 4PM', pctFull: 32 }
      ]
    }
  },
  {
    id: 'lot-p30',
    code: 'P30',
    name: 'Lot P30',
    permitType: 'Staff',
    permitColorName: 'Yellow Permit (Employee/Staff)',
    percentFull: 88,
    status: 'OK',
    lastUpdated: '3 mins ago',
    fiveMinDelta: -1,
    coordinates: { x: 266, y: 628, width: 40, height: 64 },
    hasForecastData: true,
    forecasts: {
      hourly: [
        { label: '+1 Hr', pctFull: 68 },
        { label: '+2 Hr', pctFull: 72 },
        { label: '+3 Hr', pctFull: 58 },
        { label: '+4 Hr', pctFull: 36 }
      ],
      daily: [
        { label: 'Tomorrow 8AM', pctFull: 62 },
        { label: 'Tomorrow 12PM', pctFull: 79 },
        { label: 'Tomorrow 4PM', pctFull: 32 }
      ]
    }
  },
  {
    id: 'lot-p31',
    code: 'P31',
    name: 'Lot P31',
    permitType: 'Staff',
    permitColorName: 'Yellow Permit (Employee/Staff)',
    percentFull: 77,
    status: 'OK',
    lastUpdated: '1 min ago',
    fiveMinDelta: +3,
    coordinates: { x: 312, y: 572, width: 46, height: 116 },
    hasForecastData: true,
    forecasts: {
      hourly: [
        { label: '+1 Hr', pctFull: 81 },
        { label: '+2 Hr', pctFull: 84 },
        { label: '+3 Hr', pctFull: 70 },
        { label: '+4 Hr', pctFull: 46 }
      ],
      daily: [
        { label: 'Tomorrow 8AM', pctFull: 74 },
        { label: 'Tomorrow 12PM', pctFull: 88 },
        { label: 'Tomorrow 4PM', pctFull: 42 }
      ]
    }
  }
];

export const INITIAL_ADMIN_LOGS = [];
