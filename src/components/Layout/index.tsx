import { Outlet, useLocation } from 'react-router-dom';
import { DesktopHeader } from './DesktopHeader';
import { MobileBottomNav } from './MobileBottomNav';

export function Layout() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="min-h-screen bg-background">
      <DesktopHeader pathname={pathname} />

      <main className="container mx-auto px-4 py-8 overscroll-none pb-24 md:pb-8">
        <Outlet />
      </main>

      <MobileBottomNav pathname={pathname} />
    </div>
  );
}
