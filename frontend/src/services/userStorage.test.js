import { describe, it, expect } from 'vitest';
import { loadSavedUser, saveUser, clearSavedUser } from './userStorage';

describe('userStorage', () => {
  it('returns null when nothing is saved', () => {
    expect(loadSavedUser()).toBeNull();
  });

  it('loads back the user that was saved', () => {
    saveUser({ username: 'bulldog_student' });
    expect(loadSavedUser()).toEqual({ username: 'bulldog_student' });
  });

  it('returns null when the saved value is not valid JSON', () => {
    localStorage.setItem('flocklite_user', '{not json');
    expect(loadSavedUser()).toBeNull();
  });

  it('removes the saved user on clear', () => {
    saveUser({ username: 'bulldog_student' });
    clearSavedUser();
    expect(loadSavedUser()).toBeNull();
  });
});
