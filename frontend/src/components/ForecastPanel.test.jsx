import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForecastPanel from './ForecastPanel';

const LOT = {
  id: 'lot-a',
  code: 'PA',
  name: 'Lot A',
  permitType: 'Student',
  percentFull: 74,
  status: 'OK',
  lastUpdated: 'Just now',
  fiveMinDelta: 11,
  coordinates: {
    points: [[100, 100], [200, 100], [200, 200], [100, 200]],
    label: { x: 150, y: 150 }
  },
  hasForecastData: true,
  forecasts: {
    hourly: [
      { label: '+1 Hr', pctFull: 96 },
      { label: '+2 Hr', pctFull: 30 }
    ],
    daily: [{ label: 'Tomorrow 8AM', pctFull: 55 }]
  }
};

const NO_DATA_LOT = { ...LOT, hasForecastData: false, forecasts: { hourly: [], daily: [] } };

const renderPanel = (props = {}) =>
  render(
    <ForecastPanel lot={LOT} lots={[LOT]} isMobile={false} onSelectLot={() => {}} onClose={() => {}} {...props} />
  );

const hourly = () => within(screen.getByRole('region', { name: 'Hourly forecast' }));
const daily = () => within(screen.getByRole('region', { name: 'Daily forecast' }));

describe('ForecastPanel', () => {
  it('renders nothing before any lot is selected', () => {
    const { container } = renderPanel({ lot: null });
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the selected lot card', () => {
    renderPanel();
    expect(screen.getByRole('heading', { name: 'Lot A Forecast' })).toBeInTheDocument();
    expect(screen.getByText('74% Full')).toBeInTheDocument();
    expect(screen.getByText('Green Permit • Student')).toBeInTheDocument();
  });

  it('shows an hourly strip of clock times that starts with the current occupancy', () => {
    vi.useFakeTimers({ now: new Date(2026, 10, 19, 14, 15) });
    renderPanel();
    const labels = hourly().getAllByRole('listitem').map((li) => li.textContent);
    expect(labels).toEqual(['Now74%', '3PM96%', '4PM30%']);
    expect(hourly().getByText('Expected to peak at 96% full around 3PM.')).toBeInTheDocument();
    expect(hourly().getByLabelText('Nearly full')).toBeInTheDocument();
    expect(hourly().getByLabelText('Open')).toBeInTheDocument();
  });

  it('leaves "Now" out of the strip while the lot is updating', () => {
    renderPanel({ lot: { ...LOT, status: 'UPDATING', percentFull: null } });
    expect(hourly().queryByText('Now')).not.toBeInTheDocument();
  });

  it('shows daily rows with a bar sized by percent', () => {
    const { container } = renderPanel();
    expect(daily().getByText('Tomorrow 8AM')).toBeInTheDocument();
    expect(daily().getByText('55% Full')).toBeInTheDocument();
    expect(daily().getByLabelText('Busy')).toBeInTheDocument();
    expect(container.querySelector('.wx-range-fill')).toHaveStyle({ width: '55%' });
  });

  it('explains when a lot has no forecast data', () => {
    renderPanel({ lot: NO_DATA_LOT });
    expect(screen.getByText('Forecast Unavailable:')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Hourly forecast' })).not.toBeInTheDocument();
  });

  it('shows a zoomed-in mini map of the lot only on mobile', () => {
    const { container, rerender } = renderPanel();
    expect(container.querySelector('.mini-map')).toBeNull();

    rerender(<ForecastPanel lot={LOT} lots={[LOT]} isMobile onSelectLot={() => {}} onClose={() => {}} />);
    const svg = container.querySelector('.mini-map svg');
    expect(svg.getAttribute('viewBox')).not.toBe('0 0 1000 612');
    expect(container.querySelector('.mini-map .map-lot-group.selected')).not.toBeNull();
  });

  it('closes from the back button and Escape', async () => {
    const onClose = vi.fn();
    renderPanel({ onClose });

    await userEvent.click(screen.getByRole('button', { name: 'Lots' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('stays mounted but hidden after closing so it can slide out', () => {
    const { container, rerender } = renderPanel();
    rerender(<ForecastPanel lot={null} lots={[LOT]} isMobile={false} onSelectLot={() => {}} onClose={() => {}} />);
    expect(container.querySelector('.forecast-panel')).not.toHaveClass('open');
    expect(screen.queryByRole('heading', { name: 'Lot A Forecast' })).not.toBeInTheDocument();
  });
});

const OTHER_LOT = {
  ...LOT,
  id: 'lot-b',
  code: 'PB',
  name: 'Lot B',
  percentFull: 20,
  coordinates: {
    points: [[210, 100], [260, 100], [260, 150], [210, 150]],
    label: { x: 235, y: 125 }
  }
};

const withHourly = (...values) => ({
  ...LOT,
  forecasts: { ...LOT.forecasts, hourly: values.map((pctFull, i) => ({ label: `+${i + 1} Hr`, pctFull })) }
});

const iconNames = () =>
  hourly()
    .getAllByRole('listitem')
    .map((li) => li.querySelector('[aria-label]').getAttribute('aria-label'));

describe('ForecastPanel: occupancy icons', () => {
  it('switches icons at 50% (busy) and 80% (nearly full)', () => {
    renderPanel({ lot: { ...withHourly(49, 50, 79, 80), status: 'UPDATING', percentFull: null } });
    expect(iconNames()).toEqual(['Open', 'Busy', 'Busy', 'Nearly full']);
  });
});

describe('ForecastPanel: hourly clock labels', () => {
  it('rolls the labels forward when the hour changes while open', () => {
    vi.useFakeTimers({ now: new Date(2026, 10, 19, 14, 59, 30) });
    renderPanel();
    expect(hourly().getAllByRole('listitem')[1]).toHaveTextContent('3PM');

    act(() => vi.advanceTimersByTime(60000));
    expect(hourly().getAllByRole('listitem')[1]).toHaveTextContent('4PM');
  });

  it('skips the peak summary when there are no hourly predictions', () => {
    renderPanel({ lot: withHourly() });
    expect(screen.queryByText(/Expected to peak/)).not.toBeInTheDocument();
    expect(hourly().getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Now74%']);
  });
});

describe('ForecastPanel: daily bars', () => {
  const dailyLot = (...values) => ({
    ...LOT,
    forecasts: { ...LOT.forecasts, daily: values.map((pctFull, i) => ({ label: `Day ${i}`, pctFull })) }
  });

  it('stretches the gradient across the full track, whatever the fill width', () => {
    const { container } = renderPanel({ lot: dailyLot(55, 100) });
    const [partial, full] = container.querySelectorAll('.wx-range-fill');
    expect(parseFloat(partial.style.backgroundSize)).toBeCloseTo(10000 / 55);
    expect(full.style.backgroundSize).toBe('100% 100%');
  });

  it('handles an empty (0%) day without dividing by zero', () => {
    const { container } = renderPanel({ lot: dailyLot(0) });
    const fill = container.querySelector('.wx-range-fill');
    expect(fill).toHaveStyle({ width: '0%' });
    expect(fill.style.backgroundSize).toBe('10000% 100%');
  });
});

describe('ForecastPanel: mini map', () => {
  it('switches to another lot tapped on the mini map', async () => {
    const onSelectLot = vi.fn();
    const { container } = renderPanel({ lots: [LOT, OTHER_LOT], isMobile: true, onSelectLot });
    const [, other] = container.querySelectorAll('.mini-map .map-lot-group');
    await userEvent.click(other);
    expect(onSelectLot).toHaveBeenCalledWith(OTHER_LOT);
  });

  it('leaves the mini map out for a lot with no map shape', () => {
    const { container } = renderPanel({ lot: { ...LOT, coordinates: undefined }, isMobile: true });
    expect(container.querySelector('.mini-map')).toBeNull();
  });
});

describe('ForecastPanel: open and close', () => {
  it('stops listening for Escape once closed', () => {
    const onClose = vi.fn();
    const props = { lots: [LOT], isMobile: false, onSelectLot: () => {}, onClose };
    const { rerender } = render(<ForecastPanel lot={LOT} {...props} />);
    rerender(<ForecastPanel lot={null} {...props} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('ignores keys other than Escape', () => {
    const onClose = vi.fn();
    renderPanel({ onClose });
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows the newly chosen lot when switching lots', () => {
    const props = { lots: [LOT, OTHER_LOT], isMobile: false, onSelectLot: () => {}, onClose: () => {} };
    const { rerender } = render(<ForecastPanel lot={LOT} {...props} />);
    rerender(<ForecastPanel lot={OTHER_LOT} {...props} />);
    expect(screen.getByRole('heading', { name: 'Lot B Forecast' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Lot A Forecast' })).not.toBeInTheDocument();
  });

  it('keeps showing the last lot while sliding out, then reopens', () => {
    const props = { lots: [LOT], isMobile: false, onSelectLot: () => {}, onClose: () => {} };
    const { container, rerender } = render(<ForecastPanel lot={LOT} {...props} />);
    rerender(<ForecastPanel lot={null} {...props} />);
    const panel = container.querySelector('.forecast-panel');
    expect(panel).toHaveAttribute('aria-hidden', 'true');
    expect(within(panel).getByText('Lot A Forecast')).toBeInTheDocument();

    rerender(<ForecastPanel lot={LOT} {...props} />);
    expect(panel).toHaveClass('open');
    expect(screen.getByRole('heading', { name: 'Lot A Forecast' })).toBeInTheDocument();
  });
});

describe('ForecastPanel: focus and keys', () => {
  const props = { lots: [LOT], isMobile: false, onSelectLot: () => {}, onClose: () => {} };

  it('moves focus to the back button when it opens', () => {
    renderPanel();
    expect(screen.getByRole('button', { name: 'Lots' })).toHaveFocus();
  });

  it('returns focus to the lot card when it closes', () => {
    const card = document.createElement('div');
    card.className = 'lot-card';
    card.dataset.lotId = LOT.id;
    card.tabIndex = 0;
    document.body.appendChild(card);

    const { rerender } = render(<ForecastPanel lot={LOT} {...props} />);
    rerender(<ForecastPanel lot={null} {...props} />);
    expect(card).toHaveFocus();
    card.remove();
  });

  it('leaves Escape alone when something on top already handled it', () => {
    const onClose = vi.fn();
    renderPanel({ onClose });
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    event.preventDefault();
    window.dispatchEvent(event);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders every hour even when two land on the same clock time', () => {
    vi.useFakeTimers({ now: new Date(2026, 10, 19, 14, 15) });
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderPanel({ lot: { ...LOT, forecasts: { ...LOT.forecasts, hourly: [
      { label: '+1 Hr', pctFull: 40 },
      { label: '+25 Hr', pctFull: 60 }
    ] } } });

    expect(hourly().getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Now74%', '3PM40%', '3PM60%']);
    expect(errors.mock.calls.flat().join(' ')).not.toMatch(/same key/);
  });
});
