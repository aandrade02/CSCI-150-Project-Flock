import { describe, it, expect } from 'vitest';
import { getFocusViewBox, MAP_WIDTH, MAP_HEIGHT } from './mapView';

const lotAt = (points) => ({ coordinates: { points, label: { x: 0, y: 0 } } });
const parse = (viewBox) => viewBox.split(' ').map(Number);

describe('getFocusViewBox', () => {
  it('centers a 2:1 box on a small lot', () => {
    const [x, y, w, h] = parse(getFocusViewBox(lotAt([[480, 290], [520, 290], [520, 310], [480, 310]])));
    expect(w / h).toBeCloseTo(2);
    expect(x + w / 2).toBeCloseTo(500);
    expect(y + h / 2).toBeCloseTo(300);
  });

  it('grows the box so a large lot fits with room around it', () => {
    const [, , w, h] = parse(getFocusViewBox(lotAt([[100, 100], [400, 100], [400, 300], [100, 300]])));
    expect(w).toBeGreaterThanOrEqual(300);
    expect(h).toBeGreaterThanOrEqual(200);
  });

  it('keeps the box on the map near an edge', () => {
    const [x, y, w, h] = parse(getFocusViewBox(lotAt([[980, 600], [995, 600], [995, 610], [980, 610]])));
    expect(x + w).toBeLessThanOrEqual(MAP_WIDTH);
    expect(y + h).toBeLessThanOrEqual(MAP_HEIGHT);
    expect(x).toBeGreaterThanOrEqual(0);
    expect(y).toBeGreaterThanOrEqual(0);
  });
});
