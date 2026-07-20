import { Wand2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { NavItem } from './navConfig';
import { FullscreenNavLink } from './FullscreenNavLink';

interface ServicesDropdownProps {
  items: readonly NavItem[];
  active: boolean;
}

export function ServicesDropdown({ items, active }: ServicesDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex flex-col items-center justify-center h-full gap-0.5 text-[10px] font-medium transition-colors cursor-pointer',
          active ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        <Wand2 className={cn('w-5 h-5', active && 'stroke-[2.5]')} />
        <span className="truncate max-w-full px-1">Сервисы</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="mb-2 w-48">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem key={item.to} className="cursor-pointer">
              <FullscreenNavLink to={item.to} className="flex items-center w-full">
                <Icon className="w-4 h-4 mr-2" />
                {item.label}
              </FullscreenNavLink>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
