import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks';
import { useT } from '@/i18n';
import { cn } from '@/lib/utils';

const themes = ['light', 'dark', 'system'] as const;
const labelKeys: Record<typeof themes[number], 'theme.light' | 'theme.dark' | 'theme.system'> = {
  light: 'theme.light',
  dark: 'theme.dark',
  system: 'theme.system',
};

const icons = { light: Sun, dark: Moon, system: Monitor } as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useT();

  return (
    <div className="px-2 py-1.5" role="group" aria-label={t('theme.title')}>
      <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
        {themes.map((option) => {
          const Icon = icons[option];
          const active = theme === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setTheme(option)}
              aria-pressed={active}
              aria-label={t(labelKeys[option])}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-1.5 h-7 px-2 rounded-md text-xs font-medium transition-colors',
                active
                  ? 'bg-background text-foreground shadow-soft'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
