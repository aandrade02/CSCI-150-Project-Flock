import { INITIAL_LOTS, INITIAL_ADMIN_LOGS } from '../mocks/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const TIMEOUT_LIMIT_MS = 15000;

/**
 * Fetches Fresno State parking lot occupancy.
 * Automatically uses local mock data when VITE_USE_MOCK=true, or calls GET /api/v1/lots when false.
 */
export function fetchParkingLots({ simulatedDelayMs = 250, customLots = null, permitFilter = 'All', onSystemLog }) {
  const startTime = performance.now();

  const requestPromise = USE_MOCK
    ? new Promise((resolve) => {
        setTimeout(() => {
          const elapsed = Math.round(performance.now() - startTime);
          if (elapsed > 3000 && onSystemLog) {
            onSystemLog(`[WARN] Display time (${elapsed}ms) exceeded the 3000ms target.`);
          } else if (onSystemLog) {
            onSystemLog(`[OK] Occupancy rendered in ${elapsed}ms (< 3000ms target).`);
          }
          resolve(customLots || INITIAL_LOTS);
        }, simulatedDelayMs);
      })
    : fetch(
        `${API_BASE}/lots${permitFilter !== 'All' ? `?permitType=${encodeURIComponent(permitFilter)}` : ''}`
      ).then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch lots`);
        const data = await res.json();
        const elapsed = Math.round(performance.now() - startTime);
        if (elapsed > 3000 && onSystemLog) {
          onSystemLog(`[WARN] API display time (${elapsed}ms) exceeded the 3000ms target.`);
        } else if (onSystemLog) {
          onSystemLog(`[OK] API occupancy rendered in ${elapsed}ms.`);
        }
        return data.lots || data;
      });

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Request took longer than 15 seconds. Please refresh the application.'));
    }, TIMEOUT_LIMIT_MS);
  });

  return Promise.race([requestPromise, timeoutPromise]);
}

/**
 * Fetches hourly or daily forecast for a specific lot: GET /api/v1/lots/:lotId/forecast?interval=hourly|daily
 */
export async function fetchLotForecast(lotId, interval = 'hourly') {
  if (USE_MOCK) {
    const lot = INITIAL_LOTS.find((l) => l.id === lotId);
    return {
      lotId,
      interval,
      hasForecastData: lot ? lot.hasForecastData : false,
      predictions: lot && lot.hasForecastData ? lot.forecasts[interval] : []
    };
  }
  const res = await fetch(`${API_BASE}/lots/${encodeURIComponent(lotId)}/forecast?interval=${encodeURIComponent(interval)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch forecast`);
  return res.json();
}

/**
 * Admin authentication: POST /api/v1/admin/login
 */
export async function loginAdmin(username, password) {
  if (USE_MOCK) {
    if (username === 'admin' && password === 'admin') {
      return { authenticated: true, adminUser: username, logs: INITIAL_ADMIN_LOGS };
    }
    throw new Error('Invalid admin credentials');
  }
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error('Invalid admin credentials');
  return res.json();
}

/**
 * Updates drone acquisition parameters: PUT /api/v1/admin/drone-settings
 */
export async function updateDroneSettings(settings, token = null) {
  if (USE_MOCK) {
    return { status: 'OK', settings };
  }
  const res = await fetch(`${API_BASE}/admin/drone-settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error('Failed to update drone settings');
  return res.json();
}
