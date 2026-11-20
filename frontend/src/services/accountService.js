// frontend/src/services/accountService.js
// Sends signup/login requests from the browser to the Django backend.
// "/api/..." gets forwarded to Django by the proxy in vite.config.js.

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// Helper: POST some JSON, return the JSON reply, or throw the backend's error message
async function postJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    // reply wasn't JSON, leave data empty
  }

  if (!res.ok) {
    // e.g. { "error": "Invalid email or password." } from views.py
    throw new Error(data.error || `Request failed (HTTP ${res.status})`);
  }
  return data; // { email, role }
}

// Calls signup_view in accounts/views.py
export function signupUser(email, password, role) {
  return postJson('/accounts/signup/', { email, password, role });
}

// Calls login_view in accounts/views.py
export function loginUser(email, password) {
  return postJson('/accounts/login/', { email, password });
}