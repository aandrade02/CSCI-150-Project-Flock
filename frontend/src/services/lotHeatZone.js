
import { getOccupancyColor } from './lotStatus';

// Determines overall busyness using Django's data.
export function getLotHeatZone(lot) {
  const value = lot?.occupancy_percentage ?? lot?.percentFull;

  if (
    value == null ||
    value === '' ||
    lot?.status === 'UPDATING'
  ) {
    return {
      level: 'Unknown',
      percentage: null,
      color: '#64748b'
    };
  }

  const percentage = Number(value);

  if (!Number.isFinite(percentage) ||
      percentage < 0 || percentage > 100) {
    return {
      level: 'Unknown',
      percentage: null,
      color: '#64748b'
    };
  }

  return {
    level: percentage >= 80
      ? 'High'
      : percentage >= 50
        ? 'Moderate'
        : 'Low',
    percentage,
    color: getOccupancyColor(percentage)
  };
}

// Processes every parking lot using the same data.
export function generateLotHeatZones(lots) {
  return lots.map(lot => ({
    ...lot,
    heatZone: getLotHeatZone(lot)
  }));
}
