import { Users, UserCheck, ArrowDownLeft, ArrowUpRight, Inbox, Send, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FRIEND_STATUSES, FRIEND_STATUS_LABELS } from '@/types/friend';
import type { FriendStatus } from '@/types/friend';

export type FriendsTab = 'all' | FriendStatus;

const TABS: FriendsTab[] = ['all', ...FRIEND_STATUSES];

const TAB_LABELS: Record<FriendsTab, string> = {
  all: 'Все',
  ...FRIEND_STATUS_LABELS,
};

const TAB_ICONS: Record<FriendsTab, LucideIcon> = {
  all: Users,
  friends: UserCheck,
  followers: ArrowDownLeft,
  following: ArrowUpRight,
  requests: Inbox,
  'sent-requests': Send,
};

interface FriendsSidebarProps {
  active: FriendsTab;
  onChange: (tab: FriendsTab) => void;
}

// На мобильных вертикальная панель не помещается — там это горизонтальная прокрутка.
export function FriendsSidebar({ active, onChange }: FriendsSidebarProps) {
  return (
    <nav
      aria-label="Категории друзей"
      className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0"
    >
      {TABS.map((tab) => {
        const Icon = TAB_ICONS[tab];
        const isActive = tab === active;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium whitespace-nowrap transition-colors',
              isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {TAB_LABELS[tab]}
          </button>
        );
      })}
    </nav>
  );
}
