import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LotList from './LotList';

const OPEN_LOT = {
  id: 'lot-a',
  code: 'PA',
  name: 'Lot A',
  permitType: 'Student',
  percentFull: 74,
  status: 'OK',
  lastUpdated: 'Just now',
  fiveMinDelta: 11
};

const UPDATING_LOT = {
  id: 'lot-b',
  code: 'PB',
  name: 'Lot B',
  permitType: 'Staff',
  percentFull: null,
  status: 'UPDATING',
  lastUpdated: '3 mins ago',
  fiveMinDelta: 0
};

const renderList = (props = {}) =>
  render(
    <LotList
      lots={[OPEN_LOT, UPDATING_LOT]}
      totalCount={5}
      loading={false}
      onRefresh={() => {}}
      onSelectLot={() => {}}
      {...props}
    />
  );

const cardFor = (name) => screen.getByRole('heading', { name }).closest('.lot-card');

describe('LotList', () => {
  it('shows how many lots are listed out of the total', () => {
    renderList();
    expect(screen.getByText(/Showing 2 of 5 lot\(s\)/)).toBeInTheDocument();
  });

  it('shows percent full, percent open, and the 5-minute change', () => {
    renderList();
    const card = within(cardFor('Lot A'));
    expect(card.getByText('74% Full')).toBeInTheDocument();
    expect(card.getByText('(26% Open)')).toBeInTheDocument();
    expect(card.getByText('(+11% full / 5m)')).toBeInTheDocument();
    expect(card.getByText('Green Permit • Student')).toBeInTheDocument();
  });

  it('shows a negative 5-minute change without a plus sign', () => {
    renderList({ lots: [{ ...OPEN_LOT, fiveMinDelta: -5 }] });
    expect(screen.getByText('(-5% full / 5m)')).toBeInTheDocument();
  });

  it('shows "Still Updating..." and no numbers for an updating lot', () => {
    renderList();
    const card = within(cardFor('Lot B'));
    expect(card.getByText('Still Updating...')).toBeInTheDocument();
    expect(card.queryByText(/% Full/)).not.toBeInTheDocument();
    expect(card.queryByText(/full \/ 5m/)).not.toBeInTheDocument();
    expect(card.getByText('Yellow Permit • Staff')).toBeInTheDocument();
  });

  it('passes the lot to onSelectLot when Forecast is clicked', async () => {
    const onSelectLot = vi.fn();
    renderList({ onSelectLot });
    await userEvent.click(within(cardFor('Lot A')).getByRole('button', { name: 'Forecast' }));
    expect(onSelectLot).toHaveBeenCalledWith(OPEN_LOT);
  });

  it('calls onRefresh when Refresh is clicked', async () => {
    const onRefresh = vi.fn();
    renderList({ onRefresh });
    await userEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('disables the refresh button while loading', () => {
    renderList({ loading: true });
    expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();
  });
});
