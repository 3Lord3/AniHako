import { Trophy, Swords, ArrowLeft, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks';

interface MatchHeaderProps {
  roundName: string;
  matchIndex: number;
  totalMatches: number;
  isFinal: boolean;
  onBack?: () => void;
  onBackToBracket?: () => void;
  onBackDialogOpen?: () => void;
}

export function MatchHeader({
  roundName,
  matchIndex,
  totalMatches,
  isFinal,
  onBack,
  onBackToBracket,
}: MatchHeaderProps) {
  const { theme, setTheme } = useTheme();

  const themes = ['light', 'dark', 'system'] as const;
  const themeIcons = { light: Sun, dark: Moon, system: Monitor };
  const ThemeIcon = themeIcons[theme];

  return (
    <div className="flex items-center justify-between p-2 sm:p-3 md:p-4 border-b border-border bg-card shrink-0">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Назад</span>
        </button>
      )}

      {/* Round indicator */}
      <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-muted text-xs sm:text-sm font-medium text-foreground">
        {isFinal ? (
          <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
        ) : (
          <Swords className="w-3 h-3 sm:w-4 sm:h-4" />
        )}
        {roundName}
        <span className="text-muted-foreground hidden sm:inline">
          ({matchIndex + 1}/{totalMatches})
        </span>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {onBackToBracket && (
          <button
            onClick={() => {
              // Parent should handle showing confirmation dialog
              onBackToBracket();
            }}
            className="flex items-center gap-1 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm"
            title="Вернуться к турнирной сетке (изменения не сохранятся)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад</span>
          </button>
        )}
        <button
          onClick={() => {
            const nextIndex = (themes.indexOf(theme) + 1) % themes.length;
            setTheme(themes[nextIndex]);
          }}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          title={`Тема: ${theme === 'light' ? 'Светлая' : theme === 'dark' ? 'Тёмная' : 'Системная'}`}
        >
          <ThemeIcon className="w-4 h-4 text-foreground" />
        </button>
      </div>
    </div>
  );
}