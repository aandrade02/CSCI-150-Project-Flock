// Persists the signed-in demo user in localStorage.

const USER_KEY = 'flocklite_user';

export function loadSavedUser() {
  const saved = localStorage.getItem(USER_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
}

export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSavedUser() {
  localStorage.removeItem(USER_KEY);
}
