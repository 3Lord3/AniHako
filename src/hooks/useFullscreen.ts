import { useCallback, useEffect, useState } from 'react';

interface FullscreenApi {
  requestFullscreen?: (element: Element) => Promise<void>;
  webkitRequestFullscreen?: (element: Element) => Promise<void> | void;
  exitFullscreen?: () => Promise<void>;
  webkitExitFullscreen?: () => Promise<void> | void;
}

function getFullscreenElement(): FullscreenApi | null {
  if (typeof document === 'undefined') return null;
  const element = document as unknown as FullscreenApi;
  if (element.requestFullscreen || element.webkitRequestFullscreen) {
    return element;
  }
  return null;
}

function isCurrentlyFullscreen(): boolean {
  if (typeof document === 'undefined') return false;
  const doc = document as unknown as {
    fullscreenElement?: Element | null;
    webkitFullscreenElement?: Element | null;
  };
  return Boolean(doc.fullscreenElement ?? doc.webkitFullscreenElement);
}

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const api = getFullscreenElement();
    setIsSupported(api !== null);
    setIsFullscreen(isCurrentlyFullscreen());

    const onChange = () => setIsFullscreen(isCurrentlyFullscreen());
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  const enter = useCallback(async (): Promise<boolean> => {
    const api = getFullscreenElement();
    if (!api || !document.documentElement) return false;
    try {
      if (api.requestFullscreen) {
        await api.requestFullscreen(document.documentElement);
      } else if (api.webkitRequestFullscreen) {
        await api.webkitRequestFullscreen(document.documentElement);
      } else {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const exit = useCallback(async (): Promise<boolean> => {
    const doc = document as unknown as FullscreenApi;
    try {
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      } else {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const toggle = useCallback(async () => {
    if (isCurrentlyFullscreen()) {
      await exit();
    } else {
      await enter();
    }
  }, [enter, exit]);

  return { isFullscreen, isSupported, enter, exit, toggle };
}
