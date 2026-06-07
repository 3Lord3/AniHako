import { LogoButton } from './LogoButton';
import { BottomNavItem } from './BottomNavItem';
import { ServicesDropdown } from './ServicesDropdown';
import { ProfileDropdown } from './ProfileDropdown';
import { mainNavItems, servicesItems, isPathActive } from './navConfig';

interface MobileBottomNavProps {
  pathname: string;
}

export function MobileBottomNav({ pathname }: MobileBottomNavProps) {
  const isServicesActive =
    isPathActive(pathname, '/matcher') || isPathActive(pathname, '/tournament');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="relative">
        <div
          className="absolute inset-x-0 bottom-0 h-16 bg-card/95 backdrop-blur border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        />
        <div className="relative grid grid-cols-5 h-16 items-center">
          <BottomNavItem
            item={mainNavItems[0]}
            active={isPathActive(pathname, mainNavItems[0].to)}
          />
          <BottomNavItem
            item={mainNavItems[1]}
            active={isPathActive(pathname, mainNavItems[1].to)}
          />

          <div className="flex items-center justify-center">
            <LogoButton variant="mobile" />
          </div>

          <ServicesDropdown items={servicesItems} active={isServicesActive} />
          <ProfileDropdown variant="mobile" />
        </div>
      </div>
    </nav>
  );
}
