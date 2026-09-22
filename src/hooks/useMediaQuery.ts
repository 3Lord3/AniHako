import { useSyncExternalStore } from 'react';

// Matches the Tailwind `md` breakpoint.
export const DESKTOP_MEDIA_QUERY = '(min-width: 768px)';

function subscribe(query: string, callback: () => void) {
  const mql = window.matchMedia(query);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getSnapshot(query: string) {
  return window.matchMedia(query).matches;
}

// Server snapshot - avoids hydration mismatch.
const getServerSnapshot = () => false;

export function useMediaQuery(query: string = DESKTOP_MEDIA_QUERY): boolean {
  return useSyncExternalStore(
    (callback) => subscribe(query, callback),
    () => getSnapshot(query),
    getServerSnapshot
  );
}