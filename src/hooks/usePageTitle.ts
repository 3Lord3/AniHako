import { useEffect } from 'react';

const APP_NAME = 'AniHako';

/**
 * Sets `document.title` for the current page. Restores the default on unmount.
 * Pass a translation key or a plain string. Falsy values fall back to APP_NAME.
 */
export function usePageTitle(title?: string | null) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
