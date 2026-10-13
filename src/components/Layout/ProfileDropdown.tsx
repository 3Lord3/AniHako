import { Link } from 'react-router-dom';
import {
  User,
  ListChecks,
  Users,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useUser, useAuth } from '@/hooks';
import { useT } from '@/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { cn } from '@/lib/utils';

interface ProfileDropdownProps {
  variant: 'desktop' | 'mobile';
}

export function ProfileDropdown({ variant }: ProfileDropdownProps) {
  const { data: user } = useUser();
  const { logout } = useAuth();
  const { t } = useT();

  const isMobile = variant === 'mobile';

  const trigger = user ? (
    isMobile ? (
      <Avatar className="h-6 w-6">
        <AvatarImage src={user.avatars?.big || undefined} alt={user.nickname} />
        <AvatarFallback>{user.nickname?.[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
    ) : (
      <Avatar className="h-10 w-10 cursor-pointer">
        <AvatarImage src={user.avatars?.big || undefined} alt={user.nickname} />
        <AvatarFallback>{user.nickname?.[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
    )
  ) : (
    <User className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} />
  );

  const mobileTrigger = isMobile ? (
    <span
      data-active={false}
      className="inline-flex items-center justify-center size-9 rounded-xl transition-all bg-transparent"
    >
      {trigger}
    </span>
  ) : (
    trigger
  );

  const triggerClassName = isMobile
    ? cn(
        'group relative flex flex-col items-center justify-center h-full gap-0.5 text-[10px] font-medium transition-colors cursor-pointer',
        'text-muted-foreground data-[state=open]:text-primary'
      )
    : cn(
        'inline-flex items-center justify-center rounded-full transition-colors cursor-pointer',
        'data-[state=open]:ring-2 data-[state=open]:ring-brand-tint hover:ring-2 hover:ring-brand-tint'
      );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={triggerClassName} aria-label={user ? t('profileMenu.userLabel') : t('profileMenu.guestLabel')}>
        {mobileTrigger}
        {isMobile && (
          <span className="truncate max-w-full px-1">
            {user ? t('profileMenu.userLabel') : t('profileMenu.guestLabel')}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side={isMobile ? 'top' : 'bottom'}
        sideOffset={isMobile ? 8 : 10}
        alignOffset={-4}
        className={cn('w-64 p-1.5', isMobile && 'mb-2')}
      >
        {user ? (
          <>
            <DropdownMenuLabel className="flex items-center gap-3 px-2 py-2.5">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={user.avatars?.big || undefined} alt={user.nickname} />
                <AvatarFallback>{user.nickname?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-semibold leading-tight truncate">
                  {user.nickname}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link to="/profile" />}>
              <User className="size-4" />
              {t('profileMenu.profile')}
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link to="/profile/anime" />}>
              <ListChecks className="size-4" />
              {t('profileMenu.myList')}
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link to="/profile/friends" />}>
              <Users className="size-4" />
              {t('profileMenu.friends')}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1.5" />
            <ThemeSwitcher />
            <DropdownMenuSeparator className="my-1.5" />
            <DropdownMenuItem
              variant="destructive"
              onClick={logout}
            >
              <LogOut className="size-4" />
              {t('profileMenu.logout')}
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem render={<Link to="/login" />}>
              <LogIn className="size-4" />
              {t('profileMenu.login')}
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link to="/register" />}>
              <UserPlus className="size-4" />
              {t('profileMenu.register')}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1.5" />
            <ThemeSwitcher />
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
