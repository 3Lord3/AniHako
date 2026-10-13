import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { LogoButton } from './LogoButton';
import { ProfileDropdown } from './ProfileDropdown';
import { SearchSheet } from './SearchSheet';
import { ServicesDropdown } from './ServicesDropdown';
import { useT, type TranslationKey } from '@/i18n';
import { mainNavItems, servicesItems, isPathActive, type NavItem } from './navConfig';
import { cn } from '@/lib/utils';

interface DesktopHeaderProps {
  pathname: string;
}

export function DesktopHeader({ pathname }: DesktopHeaderProps) {
  const { t } = useT();
  const [searchOpen, setSearchOpen] = useState(false);
  const isServicesActive =
    isPathActive(pathname, '/matcher') ||
    isPathActive(pathname, '/tournament') ||
    isPathActive(pathname, '/tier');
  return (
    <header className="sticky top-0 z-40 hidden md:block bg-background/95 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto max-w-6xl px-6 py-3.5 flex items-center justify-between">
        <LogoButton variant="desktop" />

        <nav className="flex items-center gap-1 text-foreground" aria-label="Main">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label={t('search.sheetTitle')}
            className="inline-flex items-center justify-center size-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
          {renderNavLinks(mainNavItems, pathname, t)}
          <ServicesDropdown items={servicesItems} active={isServicesActive} variant="desktop" />
          <ProfileDropdown variant="desktop" />
        </nav>

        <SearchSheet open={searchOpen} onOpenChange={setSearchOpen} />
      </div>
    </header>
  );
}

function renderNavLinks(items: readonly NavItem[], pathname: string, t: (key: TranslationKey) => string) {
  return items.map((item) => {
    const Icon = item.icon;
    const active = isPathActive(pathname, item.to);
    return (
      <Link
        key={item.to}
        to={item.to}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'inline-flex items-center gap-2 px-3 h-9 rounded-lg text-sm transition-colors',
          active
            ? 'bg-brand-tint text-primary font-medium'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <Icon className="w-4 h-4" />
        {t(item.labelKey as TranslationKey)}
      </Link>
    );
  });
}
