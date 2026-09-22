import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { LogoButton } from './LogoButton';
import { ProfileDropdown } from './ProfileDropdown';
import { SearchSheet } from './SearchSheet';
import { ServicesDropdown } from './ServicesDropdown';
import { useT, type TranslationKey } from '@/i18n';
import { mainNavItems, servicesItems, isPathActive, type NavItem } from './navConfig';

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
    <header className="border-b border-border hidden md:block">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <LogoButton variant="desktop" />

        <nav className="flex items-center gap-6 text-foreground">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label={t('search.sheetTitle')}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5" />
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
        className={`flex items-center gap-2 hover:text-primary transition-colors ${
          active ? 'text-primary font-medium' : ''
        }`}
      >
        <Icon className="w-4 h-4" />
        {t(item.labelKey as TranslationKey)}
      </Link>
    );
  });
}
