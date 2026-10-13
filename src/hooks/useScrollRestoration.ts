import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const STORAGE_KEY = 'anihako:scroll';
const MAX_ENTRIES = 30;

function readMap(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, number>) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore quota / disabled
  }
}

function save(key: string, y: number) {
  const map = readMap();
  map[key] = y;
  // Trim: keep only the last N entries
  const keys = Object.keys(map);
  if (keys.length > MAX_ENTRIES) {
    keys
      .sort((a, b) => map[a] - map[b])
      .slice(0, keys.length - MAX_ENTRIES)
      .forEach((k) => delete map[k]);
  }
  writeMap(map);
}

/**
 * Restores scroll position on back/forward navigation and saves it on unmount.
 * Forward/new navigations scroll to top.
 */
export function useScrollRestoration() {
  const location = useLocation();
  const navType = useNavigationType();
  const key = location.pathname + location.search;

  // Restore on key change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (navType === 'POP') {
      const map = readMap();
      const saved = map[key];
      if (typeof saved === 'number') {
        requestAnimationFrame(() => window.scrollTo(0, saved));
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [key, navType]);

  // Save on unmount / route change
  useEffect(() => {
    return () => {
      save(key, window.scrollY);
    };
  }, [key]);
}
