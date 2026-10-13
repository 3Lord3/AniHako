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
    <div className="min-h-dvh bg-background">
      <a href="#main" className="skip-target">
        Skip to content
      </a>

      <DesktopHeader pathname={pathname} />

      <main
        id="main"
        tabIndex={-1}
        className={`container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 overscroll-none outline-none ${
          hideMobileNav ? 'pb-8' : 'pb-24'
        }`}
      >
        <Outlet />
      </main>

      {!hideMobileNav && <MobileBottomNav pathname={pathname} />}
    </div>
  );
}
