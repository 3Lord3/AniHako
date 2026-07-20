import { useCallback, useEffect, useState } from 'react';

interface FullscreenRequestApi {
  requestFullscreen?: (element: Element) => Promise<void>;
  webkitRequestFullscreen?: (element: Element) => Promise<void> | void;
  mozRequestFullScreen?: (element: Element) => Promise<void> | void;
}

interface FullscreenExitApi {
  exitFullscreen?: () => Promise<void>;
  webkitExitFullscreen?: () => Promise<void> | void;
  mozCancelFullScreen?: () => Promise<void> | void;
}

function getRequestApi(): FullscreenRequestApi | null {
  if (typeof document === 'undefined') return null;
  const doc = document as unknown as FullscreenRequestApi;
  if (doc.requestFullscreen || doc.webkitRequestFullscreen || doc.mozRequestFullScreen) {
    return doc;
  }
  return null;
}

function getExitApi(): FullscreenExitApi | null {
  if (typeof document === 'undefined') return null;
  const doc = document as unknown as FullscreenExitApi;
  if (doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen) {
    return doc;
  }
  return null;
}

function isCurrentlyFullscreen(): boolean {
  if (typeof document === 'undefined') return false;
  const doc = document as unknown as {
    fullscreenElement?: Element | null;
    webkitFullscreenElement?: Element | null;
    mozFullScreenElement?: Element | null;
  };
  return Boolean(doc.fullscreenElement ?? doc.webkitFullscreenElement ?? doc.mozFullScreenElement);
}

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const requestApi = getRequestApi();
    setIsSupported(requestApi !== null);
    setIsFullscreen(isCurrentlyFullscreen());

    const onChange = () => setIsFullscreen(isCurrentlyFullscreen());
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    document.addEventListener('mozfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
      document.removeEventListener('mozfullscreenchange', onChange);
    };
  }, []);

  const enter = useCallback(async (): Promise<boolean> => {
    const api = getRequestApi();
    if (!api || !document.documentElement) return false;
    try {
      if (api.requestFullscreen) {
        await api.requestFullscreen(document.documentElement);
      } else if (api.webkitRequestFullscreen) {
        await api.webkitRequestFullscreen(document.documentElement);
      } else if (api.mozRequestFullScreen) {
        await api.mozRequestFullScreen(document.documentElement);
      } else {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const exit = useCallback(async (): Promise<boolean> => {
    const api = getExitApi();
    if (!api) return false;
    try {
      if (api.exitFullscreen) {
        await api.exitFullscreen();
      } else if (api.webkitExitFullscreen) {
        await api.webkitExitFullscreen();
      } else if (api.mozCancelFullScreen) {
        await api.mozCancelFullScreen();
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
