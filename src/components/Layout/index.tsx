import { Outlet, useLocation } from 'react-router-dom';
import { DesktopHeader } from './DesktopHeader';
import { MobileBottomNav } from './MobileBottomNav';

const ROUTES_WITHOUT_MOBILE_NAV = ['/matcher', '/tournament'];

function shouldHideMobileNav(pathname: string): boolean {
  return ROUTES_WITHOUT_MOBILE_NAV.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function Layout() {
  const location = useLocation();
  const pathname = location.pathname;
  const hideMobileNav = shouldHideMobileNav(pathname);

  return (
    <div className="min-h-screen bg-background">
      <DesktopHeader pathname={pathname} />

      <main
        className={`container mx-auto px-4 py-8 overscroll-none md:pb-8 ${
          hideMobileNav ? 'pb-8' : 'pb-24'
        }`}
      >
        <Outlet />
      </main>

      {!hideMobileNav && <MobileBottomNav pathname={pathname} />}
    </div>
  );
}
