import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useIsMobile, { MOBILE_QUERY } from './useIsMobile';

// A matchMedia stand-in whose result can be flipped to simulate rotating the screen.
const stubMatchMedia = (initial) => {
  const listeners = new Set();
  const mq = {
    matches: initial,
    addEventListener: vi.fn((type, fn) => listeners.add(fn)),
    removeEventListener: vi.fn((type, fn) => listeners.delete(fn))
  };
  const matchMedia = vi.fn(() => mq);
  vi.stubGlobal('matchMedia', matchMedia);
  return {
    mq,
    matchMedia,
    listeners,
    setMatches: (value) => {
      mq.matches = value;
      listeners.forEach((fn) => fn());
    }
  };
};

describe('useIsMobile', () => {
  it('treats the screen as desktop when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('reports a portrait screen as mobile', () => {
    const { matchMedia } = stubMatchMedia(true);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
    expect(matchMedia).toHaveBeenCalledWith(MOBILE_QUERY);
    expect(MOBILE_QUERY).toBe('(max-aspect-ratio: 1/1)');
  });

  it('reports a landscape screen as desktop', () => {
    stubMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('updates when the screen rotates', () => {
    const { setMatches } = stubMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());

    act(() => setMatches(true));
    expect(result.current).toBe(true);

    act(() => setMatches(false));
    expect(result.current).toBe(false);
  });

  it('stops listening on unmount', () => {
    const { mq, listeners } = stubMatchMedia(false);
    const { unmount } = renderHook(() => useIsMobile());
    expect(listeners.size).toBe(1);

    unmount();
    expect(mq.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    expect(listeners.size).toBe(0);
  });
});
