import { Link, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { useUser, useAuth } from '@/hooks';
import { User, List, LogOut } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeSwitcher } from './ThemeSwitcher';

export function Layout() {
  const { data: user } = useUser();
  const { logout } = useAuth();
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();

  const handleLogoClick = () => {
    // Clear search query when clicking on logo
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-foreground" onClick={handleLogoClick}>
            <span className="md:hidden">AH</span>
            <span className="hidden md:inline">AnimeHako</span>
          </Link>
          <nav className="flex items-center gap-6 text-foreground">
            <Link
              to="/"
              className={`hover:text-primary transition-colors ${
                location.pathname === '/' ? 'text-primary font-medium' : ''
              }`}
            >
              Главная
            </Link>
            <Link
              to="/catalog"
              className={`hover:text-primary transition-colors ${
                location.pathname === '/catalog' ? 'text-primary font-medium' : ''
              }`}
            >
              Каталог
            </Link>
            <Link
              to="/matcher"
              className={`hover:text-primary transition-colors ${
                location.pathname === '/matcher' ? 'text-primary font-medium' : ''
              }`}
            >
              AniMatch
            </Link>
            <Link
              to="/tournament"
              className={`hover:text-primary transition-colors ${
                location.pathname === '/tournament' ? 'text-primary font-medium' : ''
              }`}
            >
              AniTour
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <span className="cursor-pointer">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatars?.big || undefined} alt={user.nickname} />
                      <AvatarFallback>{user.nickname?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
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
                  <ThemeSwitcher />
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <User className="w-6 h-6 cursor-pointer" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
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
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 overscroll-none">
        <Outlet />
      </main>
    </div>
  );
}
