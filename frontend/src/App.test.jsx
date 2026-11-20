import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, fireEvent, act } from '@testing-library/react';
import App from './App';
import { INITIAL_LOTS } from './mocks/mockData';

const TOTAL = INITIAL_LOTS.length;
const STUDENT_COUNT = INITIAL_LOTS.filter((lot) => lot.permitType === 'Student').length;
const STAFF_COUNT = INITIAL_LOTS.filter((lot) => lot.permitType === 'Staff').length;
const FIRST_LOT = INITIAL_LOTS[0];
const FIRST_STAFF_LOT = INITIAL_LOTS.find((lot) => lot.permitType === 'Staff');

// The app loads lots through timers (simulated latency and the 15s timeout),
// so these tests run on fake timers and use fireEvent, which is synchronous.
const advance = (ms) => act(() => vi.advanceTimersByTimeAsync(ms));

const renderApp = async () => {
  const view = render(<App />);
  await advance(200); // let the initial load finish
  return view;
};

const click = (name) => fireEvent.click(screen.getByRole('button', { name }));
const pressShiftD = (target = window) => fireEvent.keyDown(target, { key: 'D', shiftKey: true });
const cardFor = (name) => screen.getByRole('heading', { name }).closest('.lot-card');

// jsdom has no matchMedia, which the app reads as desktop. This makes the screen portrait (mobile).
const useMobileScreen = () =>
  vi.stubGlobal('matchMedia', (query) => ({
    matches: true,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {}
  }));

const fillLogin = (userLabel, username, passwordLabel, password) => {
  fireEvent.change(screen.getByLabelText(userLabel), { target: { value: username } });
  fireEvent.change(screen.getByLabelText(passwordLabel), { target: { value: password } });
  click('Log In');
};

beforeEach(() => {
  vi.useFakeTimers();
});

describe('App: permit filter', () => {
  it('lists every lot by default', async () => {
    await renderApp();
    expect(screen.getByText(new RegExp(`Showing ${TOTAL} of ${TOTAL} lot`))).toBeInTheDocument();
  });

  it('narrows the list and the map to student lots', async () => {
    const { container } = await renderApp();
    click('Green (General)');
    await advance(200);

    expect(screen.getByText(new RegExp(`Showing ${STUDENT_COUNT} of ${TOTAL} lot`))).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: FIRST_LOT.name })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: FIRST_STAFF_LOT.name })).not.toBeInTheDocument();
    expect(container.querySelectorAll('.map-lot-group')).toHaveLength(STUDENT_COUNT);
  });

  it('narrows to staff lots and back to all', async () => {
    await renderApp();
    click('Yellow (Staff)');
    await advance(200);
    expect(screen.getByText(new RegExp(`Showing ${STAFF_COUNT} of ${TOTAL} lot`))).toBeInTheDocument();

    click('All Lots');
    await advance(200);
    expect(screen.getByText(new RegExp(`Showing ${TOTAL} of ${TOTAL} lot`))).toBeInTheDocument();
  });
});

describe('App: layout', () => {
  const listHeading = () => screen.queryByRole('heading', { name: 'Lot Occupancy Status' });
  const mapHeading = () => screen.queryByRole('heading', { name: 'Fresno State Campus Parking Map' });

  it('shows the list and the map side by side on desktop, with no view switcher', async () => {
    await renderApp();
    expect(listHeading()).toBeInTheDocument();
    expect(mapHeading()).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Split/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Open menu' })).not.toBeInTheDocument();
  });

  it('shows only the list on a portrait (mobile) screen', async () => {
    useMobileScreen();
    await renderApp();
    expect(listHeading()).toBeInTheDocument();
    expect(mapHeading()).not.toBeInTheDocument();
  });
});

describe('App: mobile menu', () => {
  const menu = () => screen.queryByRole('navigation', { name: 'Main menu' });

  it('slides the navbar options out from the hamburger button', async () => {
    useMobileScreen();
    await renderApp();
    expect(menu()).not.toBeInTheDocument();

    click('Open menu');
    expect(menu()).toBeInTheDocument();
    expect(within(menu()).getByRole('button', { name: 'Account' })).toBeInTheDocument();
    expect(within(menu()).getByRole('button', { name: 'Admin' })).toBeInTheDocument();

    click('Close menu');
    expect(menu()).not.toBeInTheDocument();
  });

  it('applies a permit filter and closes the menu', async () => {
    useMobileScreen();
    await renderApp();

    click('Open menu');
    click('Yellow (Staff)');
    await advance(200);

    expect(menu()).not.toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Showing ${STAFF_COUNT} of ${TOTAL} lot`))).toBeInTheDocument();
  });

  it('opens the account modal from the menu', async () => {
    useMobileScreen();
    await renderApp();

    click('Open menu');
    click('Account');
    expect(screen.getByRole('heading', { name: 'User Login' })).toBeInTheDocument();
  });
});

describe('App: forecast', () => {
  const panelTitle = `${FIRST_LOT.name} Forecast`;
  const panel = () => screen.queryByRole('heading', { name: panelTitle });

  it('slides the forecast over the list from a lot card and from the map', async () => {
    const { container } = await renderApp();

    fireEvent.click(cardFor(FIRST_LOT.name));
    expect(panel()).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Lot Occupancy Status' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Hourly forecast' })).toBeInTheDocument();
    expect(container.querySelector('.mini-map')).toBeNull();

    click('Lots');
    expect(panel()).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Lot Occupancy Status' })).toBeInTheDocument();

    fireEvent.click(container.querySelector('.map-lot-group'));
    expect(panel()).toBeInTheDocument();
  });

  it('includes a mini map of the lot on mobile', async () => {
    useMobileScreen();
    const { container } = await renderApp();

    fireEvent.click(cardFor(FIRST_LOT.name));
    expect(panel()).toBeInTheDocument();
    expect(container.querySelector('.mini-map .map-lot-group.selected')).not.toBeNull();
  });

  it('keeps the open forecast in sync when the lot changes', async () => {
    await renderApp();
    fireEvent.click(cardFor(FIRST_LOT.name));
    pressShiftD();

    click(`${FIRST_LOT.code}: OK`);
    const forecast = panel().closest('.forecast-panel');
    expect(within(forecast).getByText('Still Updating...')).toBeInTheDocument();
  });
});

describe('App: user account', () => {
  it('logs in, remembers the user, and logs out', async () => {
    await renderApp();

    click('Account');
    fillLogin('Username or Email', 'bulldog_student', 'Password', 'secret');

    expect(alert).toHaveBeenCalledWith('Login successful for bulldog_student.');
    expect(JSON.parse(localStorage.getItem('flocklite_user'))).toEqual({ username: 'bulldog_student' });
    expect(screen.queryByRole('heading', { name: 'User Login' })).not.toBeInTheDocument();

    click('bulldog_student');
    click('Log Out');

    expect(localStorage.getItem('flocklite_user')).toBeNull();
    expect(screen.getByRole('button', { name: 'Account' })).toBeInTheDocument();
  });

  it('starts signed in when a user was saved earlier', async () => {
    localStorage.setItem('flocklite_user', JSON.stringify({ username: 'returning_user' }));
    await renderApp();
    expect(screen.getByRole('button', { name: 'returning_user' })).toBeInTheDocument();
  });
});

describe('App: admin login', () => {
  it('accepts the demo credentials', async () => {
    await renderApp();

    click('Admin');
    fillLogin('Admin User ID', 'admin', 'Admin Password', 'admin');

    expect(alert).toHaveBeenCalledWith('Admin login successful.');
    expect(screen.queryByRole('heading', { name: 'Admin Login' })).not.toBeInTheDocument();

    click('Admin');
    expect(screen.getByText(/Currently authenticated as/)).toBeInTheDocument();
  });

  it('rejects wrong credentials and keeps the modal open', async () => {
    await renderApp();

    click('Admin');
    fillLogin('Admin User ID', 'admin', 'Admin Password', 'wrong');

    expect(alert).toHaveBeenCalledWith('Demo credentials: username "admin", password "admin"');
    expect(screen.getByRole('heading', { name: 'Admin Login' })).toBeInTheDocument();
    expect(screen.queryByText(/Currently authenticated as/)).not.toBeInTheDocument();
  });
});

describe('App: demo controls', () => {
  const toolbar = () => screen.queryByText(/Demo Simulation Controls/);

  it('toggles the toolbar with Shift+D', async () => {
    await renderApp();
    expect(toolbar()).not.toBeInTheDocument();

    pressShiftD();
    expect(toolbar()).toBeInTheDocument();

    pressShiftD();
    expect(toolbar()).not.toBeInTheDocument();
  });

  it('ignores Shift+D while typing in a field', async () => {
    await renderApp();
    click('Account');
    pressShiftD(screen.getByLabelText('Username or Email'));
    expect(toolbar()).not.toBeInTheDocument();
  });

  it('marks a lot as still updating and back', async () => {
    await renderApp();
    pressShiftD();

    click(`${FIRST_LOT.code}: OK`);
    expect(within(cardFor(FIRST_LOT.name)).getByText('Still Updating...')).toBeInTheDocument();

    click(`${FIRST_LOT.code}: UPDATING`);
    expect(within(cardFor(FIRST_LOT.name)).queryByText('Still Updating...')).not.toBeInTheDocument();
  });

  it('shows the timeout banner after 15 seconds and clears it on reset', async () => {
    await renderApp();
    pressShiftD();

    click('15.5s (Timeout Error)');
    expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();
    expect(screen.queryByText('Timeout Error:')).not.toBeInTheDocument();

    await advance(15000);
    expect(screen.getByText('Timeout Error:')).toBeInTheDocument();

    click(/Reset Latency/);
    expect(screen.queryByText('Timeout Error:')).not.toBeInTheDocument();

    await advance(200);
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeEnabled();
  });
});
