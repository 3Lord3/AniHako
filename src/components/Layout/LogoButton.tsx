import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { SearchSheet } from './SearchSheet';
import { useState } from 'react';

interface LogoButtonProps {
  variant: 'desktop' | 'mobile';
}

export function LogoButton({ variant }: LogoButtonProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();

  const handleLogoClick = () => {
    if (location.pathname === '/' && location.search) {
      setSearchParams({});
    }
  };

  if (variant === 'desktop') {
    return (
      <Link
        to="/"
        onClick={handleLogoClick}
        className="flex items-center gap-3 text-2xl font-bold text-foreground cursor-pointer"
      >
        <img src="/favicon.svg" alt="" className="h-10 w-10 shrink-0" />
        <span className="flex gap-0">
          Ani<span className="text-brand">Hako</span>
        </span>
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        aria-label="Поиск"
        className="relative -mt-10 w-16 h-16 rounded-full bg-card border-2 border-primary shadow-lg flex items-center justify-center transition-transform active:scale-95"
      >
        <img src="/favicon.svg" alt="" className="h-9 w-9" />
      </button>
      <SearchSheet open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
