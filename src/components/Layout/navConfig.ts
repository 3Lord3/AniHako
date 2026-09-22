import { Home, LayoutGrid, Sparkles, Trophy, LayoutList, type LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
}

export const mainNavItems: readonly NavItem[] = [
  { to: '/', labelKey: 'nav.home', icon: Home },
  { to: '/catalog', labelKey: 'nav.catalog', icon: LayoutGrid },
];

export const servicesItems: readonly NavItem[] = [
  { to: '/matcher', labelKey: 'nav.matcher', icon: Sparkles },
  { to: '/tournament', labelKey: 'nav.tournament', icon: Trophy },
  { to: '/tier', labelKey: 'nav.tier', icon: LayoutList },
];

export function isPathActive(currentPath: string, target: string): boolean {
  if (target === '/') return currentPath === '/';
  return currentPath.startsWith(target);
}
