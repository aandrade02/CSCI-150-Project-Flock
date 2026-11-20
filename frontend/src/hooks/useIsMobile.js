import { useSyncExternalStore } from 'react';

// A screen taller than it is wide (portrait) gets the mobile layout.
export const MOBILE_QUERY = '(max-aspect-ratio: 1/1)';

const getMediaQuery = () =>
  typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(MOBILE_QUERY) : null;

function subscribe(onChange) {
  const mq = getMediaQuery();
  if (!mq) return () => {};
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

const getSnapshot = () => getMediaQuery()?.matches ?? false;

export default function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
