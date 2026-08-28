import { useRef, useState } from 'react';

const SWIPE_THRESHOLD = 100;

export function useSwipeGesture(onSwipe: (direction: 'left' | 'right') => void, isActive: boolean) {
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isActive) return;
    setIsDragging(true);
    const clientX = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    startX.current = clientX;
    startY.current = clientY;
    if ('preventDefault' in e) {
      e.preventDefault();
    }
    if (cardRef.current && 'setCapture' in cardRef.current) {
      (cardRef.current as unknown as { setCapture: () => void }).setCapture();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isActive) return;
    const deltaX = e.clientX - startX.current;
    const deltaY = e.clientY - startY.current;
    setTranslateX(deltaX);
    setTranslateY(deltaY * 0.3);
    setRotation(deltaX / 20);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isActive) return;
    if ('preventDefault' in e) {
      e.preventDefault();
    }
    const clientX = e.touches.length > 0 ? e.touches[0].clientX : 0;
    const clientY = e.touches.length > 0 ? e.touches[0].clientY : 0;
    const deltaX = clientX - startX.current;
    const deltaY = clientY - startY.current;
    setTranslateX(deltaX);
    setTranslateY(deltaY * 0.3);
    setRotation(deltaX / 20);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (cardRef.current && 'releaseCapture' in cardRef.current) {
      (cardRef.current as unknown as { releaseCapture: () => void }).releaseCapture();
    }
    if (Math.abs(translateX) > SWIPE_THRESHOLD) {
      onSwipe(translateX > 0 ? 'right' : 'left');
    } else {
      setTranslateX(0);
      setTranslateY(0);
      setRotation(0);
    }
  };

  const swipeDirection = translateX > 50 ? 'right' : translateX < -50 ? 'left' : null;
  const swipeOpacity = Math.min(Math.abs(translateX) / SWIPE_THRESHOLD, 1);

  return {
    cardRef,
    translateX,
    translateY,
    rotation,
    isDragging,
    swipeDirection,
    swipeOpacity,
    handlers: {
      onMouseDown: handleTouchStart,
      onMouseMove: handleMouseMove,
      onMouseUp: handleTouchEnd,
      onMouseLeave: handleTouchEnd,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
