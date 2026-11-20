import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
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
