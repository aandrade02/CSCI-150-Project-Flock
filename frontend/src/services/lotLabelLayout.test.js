import { describe, it, expect } from 'vitest';
import { getLotLabelLayout } from './lotLabelLayout';

// Axis-aligned rectangle with its label at the center.
const rect = (x, y, width, height) => ({
  points: [[x, y], [x + width, y], [x + width, y + height], [x, y + height]],
  label: { x: x + width / 2, y: y + height / 2 }
});

describe('getLotLabelLayout', () => {
  it('uses the large stacked layout for a roomy lot', () => {
    const layout = getLotLabelLayout(rect(0, 0, 100, 100));
    expect(layout.codeSize).toBe(13);
    expect(layout.statusSize).toBe(10);
    expect(layout.codeAnchor).toBe('middle');
    expect(layout.transform).toBeUndefined();
  });

  it('uses the small stacked layout when the narrowest side is under 48', () => {
    const layout = getLotLabelLayout(rect(0, 0, 40, 40));
    expect(layout.codeSize).toBe(9);
    expect(layout.statusSize).toBe(7.5);
    expect(layout.codeAnchor).toBe('middle');
    expect(layout.transform).toBeUndefined();
  });

  it('puts code and status side by side on a thin horizontal strip', () => {
    const layout = getLotLabelLayout(rect(331, 120, 166, 10));
    expect(layout.codeAnchor).toBe('end');
    expect(layout.statusAnchor).toBe('start');
    expect(layout.codeDy).toBe(layout.statusDy);
    expect(layout.transform).toBeUndefined();
  });

  it('rotates the label on a tall, thin lot', () => {
    const layout = getLotLabelLayout(rect(476, 133, 21, 72));
    expect(layout.codeSize).toBe(9);
    expect(layout.transform).toBe('rotate(-90 486.5 169)');
  });

  it('rotates the inline label when the thin strip is vertical', () => {
    const layout = getLotLabelLayout(rect(0, 0, 10, 166));
    expect(layout.codeAnchor).toBe('end');
    expect(layout.transform).toBe('rotate(-90 5 83)');
  });
});

describe('fitLength', () => {
  it('returns undefined when the text already fits', () => {
    const layout = getLotLabelLayout(rect(0, 0, 100, 100));
    expect(layout.fitLength('P1', layout.codeSize, layout.codeDy)).toBeUndefined();
  });

  it('squeezes text that is wider than the lot, leaving a margin', () => {
    const layout = getLotLabelLayout(rect(0, 0, 40, 40));
    // 9 chars at 7.5 is about 40.5 wide; the lot offers 40 minus a 6 margin.
    expect(layout.fitLength('100% Full', layout.statusSize, layout.statusDy)).toBeCloseTo(34);
  });

  it('never returns a length below 1', () => {
    const layout = getLotLabelLayout(rect(0, 0, 10, 166));
    expect(layout.fitLength('A very long status line', layout.statusSize, layout.statusDy)).toBeGreaterThanOrEqual(1);
  });
});
