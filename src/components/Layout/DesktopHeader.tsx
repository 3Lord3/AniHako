import { Link } from 'react-router-dom';
import { LogoButton } from './LogoButton';
import { ProfileDropdown } from './ProfileDropdown';
import { mainNavItems, servicesItems, isPathActive, type NavItem } from './navConfig';

interface DesktopHeaderProps {
  pathname: string;
}

export function DesktopHeader({ pathname }: DesktopHeaderProps) {
  return (
    <header className="border-b border-border hidden md:block">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <LogoButton variant="desktop" />

        <nav className="flex items-center gap-6 text-foreground">
          {renderNavLinks(mainNavItems, pathname)}
          {renderNavLinks(servicesItems, pathname)}
          <ProfileDropdown variant="desktop" />
        </nav>
      </div>
    </header>
  );
}

function renderNavLinks(items: readonly NavItem[], pathname: string) {
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
        {item.label}
      </Link>
    );
  });
}
