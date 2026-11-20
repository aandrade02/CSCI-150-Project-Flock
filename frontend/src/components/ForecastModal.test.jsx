import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForecastModal from './ForecastModal';

const LOT = {
  id: 'lot-a',
  name: 'Lot A',
  permitColorName: 'Green Permit (Student/Visitor)',
  hasForecastData: true,
  forecasts: {
    hourly: [
      { label: '+1 Hr', pctFull: 96 },
      { label: '+2 Hr', pctFull: 60 }
    ],
    daily: [{ label: 'Tomorrow 8AM', pctFull: 30 }]
  }
};

const NO_DATA_LOT = {
  ...LOT,
  hasForecastData: false,
  forecasts: { hourly: [], daily: [] }
};

describe('ForecastModal', () => {
  it('renders nothing when no lot is selected', () => {
    const { container } = render(<ForecastModal lot={null} onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the lot name, permit, and hourly forecast by default', () => {
    render(<ForecastModal lot={LOT} onClose={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Occupancy Forecast: Lot A' })).toBeInTheDocument();
    expect(screen.getByText('Green Permit (Student/Visitor)')).toBeInTheDocument();
    expect(screen.getByText('+1 Hr')).toBeInTheDocument();
    expect(screen.getByText('96% Full')).toBeInTheDocument();
    expect(screen.queryByText('Tomorrow 8AM')).not.toBeInTheDocument();
  });

  it('switches to the daily forecast', async () => {
    render(<ForecastModal lot={LOT} onClose={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Daily Interval' }));
    expect(screen.getByText('Tomorrow 8AM')).toBeInTheDocument();
    expect(screen.queryByText('+1 Hr')).not.toBeInTheDocument();
  });

  it('colors each bar by its occupancy and sizes it by percent', () => {
    const { container } = render(<ForecastModal lot={LOT} onClose={() => {}} />);
    const [red, yellow] = container.querySelectorAll('.forecast-bar');
    expect(red).toHaveStyle({ width: '96%', backgroundColor: '#ef4444' });
    expect(yellow).toHaveStyle({ width: '60%', backgroundColor: '#eab308' });
  });

  it('explains when a lot has no forecast data', () => {
    render(<ForecastModal lot={NO_DATA_LOT} onClose={() => {}} />);
    expect(screen.getByText('Forecast Unavailable:')).toBeInTheDocument();
  });

  it('closes from the × button and the backdrop, but not from inside the card', async () => {
    const onClose = vi.fn();
    const { container } = render(<ForecastModal lot={LOT} onClose={onClose} />);

    await userEvent.click(screen.getByRole('heading', { name: 'Occupancy Forecast: Lot A' }));
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: '×' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    await userEvent.click(container.querySelector('.modal-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
