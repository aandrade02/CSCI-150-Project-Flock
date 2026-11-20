import { describe, it, expect, vi, beforeEach } from 'vitest';
import { normalizeLotData, fetchParkingLots } from './parkingService';
import { INITIAL_LOTS } from '../mocks/mockData';

const BASE_LOTS = [
  {
    id: 'lot-a',
    code: 'PA',
    name: 'Lot A',
    percentFull: 10,
    status: 'UPDATING',
    lastUpdated: 'Just now',
    totalSpaces: 100,
    availableSpaces: 90,
    occupiedSpaces: 10
  },
  {
    id: 'lot-b',
    code: 'PB',
    name: 'Lot B',
    percentFull: 20,
    status: 'OK',
    lastUpdated: '1 min ago'
  }
];

describe('normalizeLotData', () => {
  it('returns the base lots when the backend sends nothing usable', () => {
    expect(normalizeLotData([], BASE_LOTS)).toBe(BASE_LOTS);
    expect(normalizeLotData(null, BASE_LOTS)).toBe(BASE_LOTS);
    expect(normalizeLotData({}, BASE_LOTS)).toBe(BASE_LOTS);
  });

  it('matches a backend lot by code, ignoring case, and rounds the occupancy', () => {
    const [lotA, lotB] = normalizeLotData([{ lot_name: 'pa', occupancy_percentage: 42.6 }], BASE_LOTS);
    expect(lotA.percentFull).toBe(43);
    expect(lotA.status).toBe('OK');
    expect(lotB).toBe(BASE_LOTS[1]);
  });

  it('accepts a { lots: [...] } wrapper and matches by name', () => {
    const [lotA, lotB] = normalizeLotData({ lots: [{ name: 'lot b', percentFull: 55 }] }, BASE_LOTS);
    expect(lotA).toBe(BASE_LOTS[0]);
    expect(lotB.percentFull).toBe(55);
  });

  it('keeps the base values for fields the backend leaves out', () => {
    const [lotA] = normalizeLotData([{ lot_name: 'PA', available_spaces: 12 }], BASE_LOTS);
    expect(lotA.percentFull).toBe(10);
    expect(lotA.totalSpaces).toBe(100);
    expect(lotA.availableSpaces).toBe(12);
    expect(lotA.occupiedSpaces).toBe(10);
    expect(lotA.lastUpdated).toBe('Just now');
  });

  it('formats a valid recorded_at and ignores an invalid one', () => {
    const [valid] = normalizeLotData([{ lot_name: 'PA', recorded_at: '2026-11-12T09:30:00' }], BASE_LOTS);
    expect(valid.lastUpdated).not.toBe('Just now');
    expect(valid.lastUpdated).toContain('9:30');

    const [invalid] = normalizeLotData([{ lot_name: 'PA', recorded_at: 'not-a-date' }], BASE_LOTS);
    expect(invalid.lastUpdated).toBe('Just now');
  });
});

describe('fetchParkingLots (mock mode)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('resolves with the supplied lots after the simulated delay', async () => {
    const onSystemLog = vi.fn();
    const promise = fetchParkingLots({ simulatedDelayMs: 200, customLots: BASE_LOTS, onSystemLog });
    await vi.advanceTimersByTimeAsync(200);

    await expect(promise).resolves.toBe(BASE_LOTS);
    expect(onSystemLog).toHaveBeenCalledWith(expect.stringContaining('[OK]'));
  });

  it('falls back to the mock lots when none are supplied', async () => {
    const promise = fetchParkingLots({ simulatedDelayMs: 200 });
    await vi.advanceTimersByTimeAsync(200);

    await expect(promise).resolves.toBe(INITIAL_LOTS);
  });

  it('logs a warning when the response takes longer than 3 seconds', async () => {
    const onSystemLog = vi.fn();
    const promise = fetchParkingLots({ simulatedDelayMs: 3500, customLots: BASE_LOTS, onSystemLog });
    await vi.advanceTimersByTimeAsync(3500);

    await expect(promise).resolves.toBe(BASE_LOTS);
    expect(onSystemLog).toHaveBeenCalledWith(expect.stringContaining('[WARN]'));
  });

  it('rejects when the response takes longer than 15 seconds', async () => {
    const promise = fetchParkingLots({ simulatedDelayMs: 15500, customLots: BASE_LOTS });
    const rejection = expect(promise).rejects.toThrow('Request took longer than 15 seconds');
    await vi.advanceTimersByTimeAsync(15000);

    await rejection;
  });
});
