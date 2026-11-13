// Fresno State Demo Lots:
// Student (Green Permit): P1, P2, P5, P6, P15, P20
// Staff (Yellow Permit): P30, P31, P4, P16, P18, P23, P24, P1 Staff
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
    coordinates: {
      points: [[667, 522], [663, 524], [625, 523], [603, 522], [588, 520], [561, 512], [562, 578], [729, 578], [729, 522]],
      label: { x: 644, y: 550 }
    },
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
    coordinates: {
      points: [[668, 451], [668, 519], [729, 519], [729, 451]],
      label: { x: 698, y: 485 }
    },
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
    coordinates: {
      points: [[660, 408], [662, 418], [668, 427], [668, 440], [729, 440], [729, 347], [728, 345], [660, 345]],
      label: { x: 695, y: 392 }
    },
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
    coordinates: {
      points: [[659, 224], [661, 227], [662, 229], [660, 233], [660, 340], [729, 340], [729, 205], [724, 198], [659, 198]],
      label: { x: 695, y: 269 }
    },
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
    coordinates: {
      points: [[514, 120], [514, 223], [548, 223], [548, 120]],
      label: { x: 531, y: 171 }
    },
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
    coordinates: {
      points: [[365, 71], [276, 71], [275, 15], [155, 15], [155, 101], [365, 101]],
      label: { x: 236, y: 64 }
    },
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
    coordinates: {
      points: [[295, 453], [290, 447], [283, 443], [275, 440], [266, 439], [266, 491], [301, 491], [299, 464]],
      label: { x: 279, y: 469 }
    },
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
    coordinates: {
      points: [[309, 453], [316, 482], [354, 482], [354, 395], [309, 395]],
      label: { x: 332, y: 438 }
    },
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

// The newer staff lots borrow P31's occupancy and forecast fields as mock
// placeholders, so they show P31's numbers until you give them their own
// (or the backend reports them).
const P31_TEMPLATE = INITIAL_LOTS.find((lot) => lot.code === 'P31');

const staffLot = (id, code, name, coordinates) => ({
  ...P31_TEMPLATE,
  id,
  code,
  name,
  permitType: 'Staff',
  coordinates,
});

INITIAL_LOTS.push(
  staffLot('lot-p4', 'P4', 'Lot P4', {
    points: [[619, 440], [658, 440], [656, 427], [651, 415], [650, 404], [561, 404], [561, 468], [619, 468]],
    label: { x: 602, y: 424 },
  }),
  staffLot('lot-p16', 'P16', 'Lot P16', {
    points: [[497, 205], [497, 133], [476, 133], [476, 205]],
    label: { x: 487, y: 169 },
  }),
  staffLot('lot-p18', 'P18', 'Lot P18', {
    points: [[331, 130], [497, 130], [497, 120], [331, 120]],
    label: { x: 414, y: 125 },
  }),
  staffLot('lot-p23', 'P23', 'Lot P23', {
    points: [[196, 153], [196, 218], [217, 218], [217, 153]],
    label: { x: 207, y: 185 },
  }),
  staffLot('lot-p24', 'P24', 'Lot P24', {
    points: [[151, 125], [151, 222], [183, 222], [183, 125]],
    label: { x: 167, y: 173 },
  }),
  staffLot('lot-p1-staff', 'P1S', 'Lot P1 Staff', {
    points: [[545, 508], [531, 518], [522, 544], [522, 578], [559, 578], [558, 511]],
    label: { x: 542, y: 547 },
  }),
);

export const INITIAL_ADMIN_LOGS = [];
