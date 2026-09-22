import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks';
import { useT } from '@/i18n';

const themes = ['light', 'dark', 'system'] as const;
const labelKeys: Record<typeof themes[number], 'theme.light' | 'theme.dark' | 'theme.system'> = {
  light: 'theme.light',
  dark: 'theme.dark',
  system: 'theme.system',
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useT();

  const currentIndex = themes.indexOf(theme);

  const handleToggle = () => {
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const Icon = { light: Sun, dark: Moon, system: Monitor }[theme];

  return (
    <div className="flex items-center justify-between px-2 py-1 cursor-pointer" onClick={handleToggle}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{t(labelKeys[theme])}</span>
      </div>
      <div className="relative w-12 h-5 bg-muted rounded-full p-0.5">
        <div
          className="absolute top-0.5 w-4 h-4 bg-primary rounded-full shadow transition-transform"
          style={{
            left: '2px',
            transform: `translateX(${currentIndex * 12}px)`,
          }}
        />
      </div>
    </div>
  );
}