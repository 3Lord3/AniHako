import { Trophy, Swords, ArrowLeft, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks';
import { TooltipWrap } from '@/components/ui/tooltip';

interface MatchHeaderProps {
  roundName: string;
  totalMatches: number;
  currentMatch: number;
  isFinal: boolean;
  onBack?: () => void;
  onBackToBracket?: () => void;
  onBackDialogOpen?: () => void;
}

export function MatchHeader({
  roundName,
  totalMatches,
  currentMatch,
  isFinal,
  onBack,
  onBackToBracket,
}: MatchHeaderProps) {
  const { theme, setTheme } = useTheme();

  const themes = ['light', 'dark', 'system'] as const;
  const themeIcons = { light: Sun, dark: Moon, system: Monitor };
  const ThemeIcon = themeIcons[theme];
  const themeLabel = `Тема: ${theme === 'light' ? 'Светлая' : theme === 'dark' ? 'Тёмная' : 'Системная'}`;
  const backLabel = 'Вернуться к турнирной сетке (изменения не сохранятся)';

  return (
    <div className="flex items-center justify-between p-1.5 sm:p-3 md:p-4 border-b border-border bg-card shrink-0">
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
          {currentMatch}/{totalMatches}
        </span>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {onBackToBracket && (
          <TooltipWrap content={backLabel}>
            <button
              onClick={() => {
                // Parent should handle showing confirmation dialog
                onBackToBracket();
              }}
              aria-label={backLabel}
              className="flex items-center gap-1 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Назад</span>
            </button>
          </TooltipWrap>
        )}
        <TooltipWrap content={themeLabel}>
          <button
            onClick={() => {
              const nextIndex = (themes.indexOf(theme) + 1) % themes.length;
              setTheme(themes[nextIndex]);
            }}
            aria-label={themeLabel}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <ThemeIcon className="w-4 h-4 text-foreground" />
          </button>
        </TooltipWrap>
      </div>
    </div>
  );
}
