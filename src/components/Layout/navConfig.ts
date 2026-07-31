import { Home, LayoutGrid, Sparkles, Trophy, LayoutList, type LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const mainNavItems: readonly NavItem[] = [
  { to: '/', label: 'Главная', icon: Home },
  { to: '/catalog', label: 'Каталог', icon: LayoutGrid },
];

export const servicesItems: readonly NavItem[] = [
  { to: '/matcher', label: 'AniMatch', icon: Sparkles },
  { to: '/tournament', label: 'AniTour', icon: Trophy },
  { to: '/tier', label: 'AniTier', icon: LayoutList },
];

export function isPathActive(currentPath: string, target: string): boolean {
  if (target === '/') return currentPath === '/';
  return currentPath.startsWith(target);
}
