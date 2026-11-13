// Shared lot status checks and color helpers for the list, map, and forecast views.

export function isLotUpdating(lot) {
  return !lot || lot.status === 'UPDATING' || lot.percentFull === null || lot.percentFull === undefined;
}

export function isStaffLot(lot) {
  return (lot.permitType || '').toLowerCase() === 'staff';
}

// Occupancy Color Helper: thresholds shared by status bars and forecast bars
export function getOccupancyColor(pctFull) {
  if (pctFull >= 80) return '#ef4444'; //Red
  if (pctFull >= 50) return '#eab308'; //Yellow
  return '#22c55e'; //Green
}

// Status Bar Color Helper
export function getStatusBarColor(lot) {
  if (isLotUpdating(lot)) {
    return '#64748b'; //Grey
  }
  return getOccupancyColor(lot.percentFull);
}

// Map Polygon Color Helper: Matches Permit Colors
export function getMapPolygonColor(lot) {
  if (isLotUpdating(lot)) {
    return '#64748b';
  }
  return isStaffLot(lot) ? '#eab308' : '#16a34a';
}
