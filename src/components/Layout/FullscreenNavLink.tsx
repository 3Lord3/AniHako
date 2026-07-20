import type { MouseEvent, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFullscreen } from '@/hooks/useFullscreen';

interface FullscreenNavLinkProps {
  to: string;
  className?: string;
  children: ReactNode;
  onNavigate?: () => void;
}

export function FullscreenNavLink({ to, className, children, onNavigate }: FullscreenNavLinkProps) {
  const navigate = useNavigate();
  const { enter, isSupported } = useFullscreen();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isSupported) {
      void enter();
    }
    onNavigate?.();
    navigate(to);
  };

  return (
    <Link to={to} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
