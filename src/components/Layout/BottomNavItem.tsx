import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useT, type TranslationKey } from '@/i18n';
import type { NavItem } from './navConfig';

interface BottomNavItemProps {
  item: NavItem;
  active: boolean;
}

export function BottomNavItem({ item, active }: BottomNavItemProps) {
  const { t } = useT();
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className={cn(
        'group relative flex flex-col items-center justify-center h-full gap-0.5 text-[10px] font-medium transition-colors',
        active ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      <span
        className={cn(
          'inline-flex items-center justify-center size-9 rounded-xl transition-all',
          active ? 'bg-brand-tint' : 'group-hover:bg-muted'
        )}
      >
        <Icon className={cn('w-5 h-5', active && 'stroke-[2.5]')} />
      </span>
      <span className="truncate max-w-full px-1">{t(item.labelKey as TranslationKey)}</span>
    </Link>
  );
}
