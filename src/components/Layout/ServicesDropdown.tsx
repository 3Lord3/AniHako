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
}

export function ServicesDropdown({ items, active }: ServicesDropdownProps) {
  const { t } = useT();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex flex-col items-center justify-center h-full gap-0.5 text-[10px] font-medium transition-colors cursor-pointer',
          active ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        <Wand2 className={cn('w-5 h-5', active && 'stroke-[2.5]')} />
        <span className="truncate max-w-full px-1">{t('nav.services')}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="mb-2 w-48">
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
