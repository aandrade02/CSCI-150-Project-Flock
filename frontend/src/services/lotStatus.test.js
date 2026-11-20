import { describe, it, expect } from 'vitest';
import {
  isLotUpdating,
  isStaffLot,
  getOccupancyColor,
  getStatusBarColor,
  getMapPolygonColor
} from './lotStatus';

const GREEN = '#22c55e';
const YELLOW = '#eab308';
const RED = '#ef4444';
const GREY = '#64748b';
const PERMIT_GREEN = '#16a34a';

describe('getOccupancyColor', () => {
  it('is green below 50%', () => {
    expect(getOccupancyColor(0)).toBe(GREEN);
    expect(getOccupancyColor(49)).toBe(GREEN);
  });

  it('is yellow from 50% up to 79%', () => {
    expect(getOccupancyColor(50)).toBe(YELLOW);
    expect(getOccupancyColor(79)).toBe(YELLOW);
  });

  it('is red at 80% and above', () => {
    expect(getOccupancyColor(80)).toBe(RED);
    expect(getOccupancyColor(100)).toBe(RED);
  });
});

describe('isLotUpdating', () => {
  it('is true when the status is UPDATING', () => {
    expect(isLotUpdating({ status: 'UPDATING', percentFull: 40 })).toBe(true);
  });

  it('is true when percentFull is missing', () => {
    expect(isLotUpdating({ status: 'OK', percentFull: null })).toBe(true);
    expect(isLotUpdating({ status: 'OK' })).toBe(true);
  });

  it('is true when there is no lot', () => {
    expect(isLotUpdating(null)).toBe(true);
  });

  it('is false for a lot with a reading, including 0%', () => {
    expect(isLotUpdating({ status: 'OK', percentFull: 40 })).toBe(false);
    expect(isLotUpdating({ status: 'OK', percentFull: 0 })).toBe(false);
  });
});

describe('isStaffLot', () => {
  it('ignores the case of the permit type', () => {
    expect(isStaffLot({ permitType: 'Staff' })).toBe(true);
    expect(isStaffLot({ permitType: 'STAFF' })).toBe(true);
  });

  it('is false for student lots and lots with no permit type', () => {
    expect(isStaffLot({ permitType: 'Student' })).toBe(false);
    expect(isStaffLot({})).toBe(false);
  });
});

describe('getStatusBarColor', () => {
  it('is grey while the lot is updating', () => {
    expect(getStatusBarColor({ status: 'UPDATING', percentFull: null })).toBe(GREY);
  });

  it('follows the occupancy thresholds otherwise', () => {
    expect(getStatusBarColor({ status: 'OK', percentFull: 20 })).toBe(GREEN);
    expect(getStatusBarColor({ status: 'OK', percentFull: 65 })).toBe(YELLOW);
    expect(getStatusBarColor({ status: 'OK', percentFull: 95 })).toBe(RED);
  });
});

describe('getMapPolygonColor', () => {
  it('is grey while the lot is updating', () => {
    expect(getMapPolygonColor({ status: 'UPDATING', percentFull: null, permitType: 'Staff' })).toBe(GREY);
  });

  it('matches the permit color, not the occupancy', () => {
    expect(getMapPolygonColor({ status: 'OK', percentFull: 95, permitType: 'Staff' })).toBe(YELLOW);
    expect(getMapPolygonColor({ status: 'OK', percentFull: 95, permitType: 'Student' })).toBe(PERMIT_GREEN);
  });
});
