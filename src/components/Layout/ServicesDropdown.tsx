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
          'flex items-center gap-2 transition-colors cursor-pointer',
          active ? 'text-primary font-medium' : 'hover:text-primary'
        )
      : cn(
          'flex flex-col items-center justify-center h-full gap-0.5 text-[10px] font-medium transition-colors cursor-pointer',
          active ? 'text-primary' : 'text-muted-foreground'
        );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={triggerClass}>
        <Wand2
          className={cn('w-5 h-5', active && variant === 'mobile' && 'stroke-[2.5]')}
        />
        <span className={variant === 'desktop' ? 'text-sm' : undefined}>{t('nav.services')}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side={variant === 'mobile' ? 'top' : 'bottom'}
        className={cn('w-48', variant === 'mobile' && 'mb-2')}
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
