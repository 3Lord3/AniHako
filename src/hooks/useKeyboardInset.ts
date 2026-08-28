import { useState, useEffect } from 'react';

export function useKeyboardInset(active: boolean): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (!active || typeof window === 'undefined' || !window.visualViewport) return;

    const vv = window.visualViewport;
    const update = () => {
      const keyboardHeight = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setInset(keyboardHeight);
    };

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();

    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [active]);

  return inset;
}
