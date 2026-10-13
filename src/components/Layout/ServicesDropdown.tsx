import { Link } from 'react-router-dom';
import { Wand2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useT, type TranslationKey } from '@/i18n';
import type { NavItem } from './navConfig';

interface ServicesDropdownProps {
  items: readonly NavItem[];
  active: boolean;
  variant?: 'mobile' | 'desktop';
}

export function ServicesDropdown({ items, active, variant = 'mobile' }: ServicesDropdownProps) {
  const { t } = useT();
  const triggerClass =
    variant === 'desktop'
      ? cn(
          'inline-flex items-center gap-2 px-3 h-9 rounded-xl text-sm transition-colors cursor-pointer',
          active
            ? 'bg-brand-tint text-primary font-medium'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )
      : cn(
          'group relative flex flex-col items-center justify-center h-full gap-0.5 text-[10px] font-medium transition-colors cursor-pointer',
          active ? 'text-primary' : 'text-muted-foreground'
        );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={triggerClass}>
        {variant === 'desktop' ? (
          <>
            <Wand2 className="w-4 h-4" />
            <span>{t('nav.services')}</span>
          </>
        ) : (
          <>
            <span
              className={cn(
                'inline-flex items-center justify-center size-9 rounded-xl transition-all',
                active ? 'bg-brand-tint' : 'group-hover:bg-muted'
              )}
            >
              <Wand2 className={cn('w-5 h-5', active && 'stroke-[2.5]')} />
            </span>
            <span className="truncate max-w-full px-1">{t('nav.services')}</span>
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side={variant === 'mobile' ? 'top' : 'bottom'}
        className={cn('w-52', variant === 'mobile' && 'mb-2')}
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem key={item.to} className="cursor-pointer">
              <Link to={item.to} className="flex items-center w-full">
                <Icon className="w-4 h-4 mr-2" />
                {t(item.labelKey as TranslationKey)}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
