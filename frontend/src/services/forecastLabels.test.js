import { describe, it, expect } from 'vitest';
import { toClockHourLabel } from './forecastLabels';

const at = (hours, minutes = 15) => new Date(2026, 10, 19, hours, minutes);

describe('toClockHourLabel', () => {
  it('counts hours from the start of the current hour', () => {
    expect(toClockHourLabel('+1 Hr', at(14))).toBe('3PM');
    expect(toClockHourLabel('+4 Hr', at(14, 59))).toBe('6PM');
  });

  it('handles noon, midnight, and wrapping past midnight', () => {
    expect(toClockHourLabel('+1 Hr', at(11))).toBe('12PM');
    expect(toClockHourLabel('+1 Hr', at(23))).toBe('12AM');
    expect(toClockHourLabel('+3 Hr', at(22))).toBe('1AM');
  });

  it('leaves labels it does not recognize alone', () => {
    expect(toClockHourLabel('Tomorrow 8AM', at(14))).toBe('Tomorrow 8AM');
  });
});
