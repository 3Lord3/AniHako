import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { NavItem } from './navConfig';

interface BottomNavItemProps {
  item: NavItem;
  active: boolean;
}

export function BottomNavItem({ item, active }: BottomNavItemProps) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className={cn(
        'flex flex-col items-center justify-center h-full gap-0.5 text-[10px] font-medium transition-colors',
        active ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      <Icon className={cn('w-5 h-5', active && 'stroke-[2.5]')} />
      <span className="truncate max-w-full px-1">{item.label}</span>
    </Link>
  );
}
