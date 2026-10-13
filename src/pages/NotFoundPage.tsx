import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, LayoutGrid, Sparkles, Trophy, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n';
import { usePageTitle } from '@/hooks';
import { useState } from 'react';

export function NotFoundPage() {
  const { t } = useT();
  const navigate = useNavigate();
  usePageTitle('404');
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/catalog?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/catalog');
    }
  };

  const shortcuts = [
    { to: '/', label: t('nav.home'), icon: Home },
    { to: '/catalog', label: t('nav.catalog'), icon: LayoutGrid },
    { to: '/matcher', label: t('nav.matcher'), icon: Sparkles },
    { to: '/tournament', label: t('nav.tournament'), icon: Trophy },
    { to: '/tier', label: t('nav.tier'), icon: LayoutList },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-7xl sm:text-8xl font-bold text-primary tracking-tight">404</h1>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
          {t('notFound.title')}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t('notFound.description')}
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        role="search"
        className="w-full max-w-md flex items-center gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.enterName')}
            aria-label={t('search.enterName')}
            className="h-10 w-full pl-10 pr-3 rounded-lg border border-input bg-muted/40 text-foreground placeholder:text-muted-foreground transition-colors outline-none focus-visible:border-ring focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <Button type="submit" size="lg">
          {t('common.search')}
        </Button>
      </form>

      <div className="w-full max-w-md">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          {t('notFound.suggestions')}
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {shortcuts.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.to}
                to={s.to}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg text-sm font-medium transition-colors border border-border bg-background text-foreground hover:bg-muted h-8 px-3"
              >
                <Icon className="w-4 h-4" />
                {s.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
