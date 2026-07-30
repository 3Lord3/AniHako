import { Link } from 'react-router-dom';
import { User, List, Users, LogOut } from 'lucide-react';
import { useUser, useAuth } from '@/hooks';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

  const isMobile = variant === 'mobile';

  const trigger = user ? (
    isMobile ? (
      <Avatar className="h-6 w-6">
        <AvatarImage src={user.avatars?.big || undefined} alt={user.nickname} />
        <AvatarFallback>{user.nickname?.[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
    ) : (
      <span className="cursor-pointer">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatars?.big || undefined} alt={user.nickname} />
          <AvatarFallback>{user.nickname?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
      </span>
    )
  ) : (
    <User className={isMobile ? 'w-5 h-5' : 'w-6 h-6'} />
  );

  const triggerClassName = isMobile
    ? cn(
        'flex flex-col items-center justify-center h-full gap-0.5 text-[10px] font-medium transition-colors cursor-pointer',
        'text-muted-foreground data-[state=open]:text-primary'
      )
    : 'cursor-pointer';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={triggerClassName}>
        {trigger}
        {isMobile && (
          <span className="truncate max-w-full px-1">{user ? 'Профиль' : 'Войти'}</span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side={isMobile ? 'top' : undefined}
        className={cn('w-56', isMobile && 'mb-2')}
      >
        {user ? (
          <>
            <div className="flex items-center gap-2 p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.nickname}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Link to="/profile" className="flex items-center w-full">
                <User className="w-4 h-4 mr-2" />
                Профиль
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Link to="/profile/anime" className="flex items-center w-full">
                <List className="w-4 h-4 mr-2" />
                Мой список
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Link to="/profile/friends" className="flex items-center w-full">
                <Users className="w-4 h-4 mr-2" />
                Друзья
              </Link>
            </DropdownMenuItem>
            <ThemeSwitcher />
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem className="cursor-pointer">
              <Link to="/login" className="flex items-center w-full">
                Вход
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Link to="/register" className="flex items-center w-full">
                Регистрация
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <ThemeSwitcher />
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
