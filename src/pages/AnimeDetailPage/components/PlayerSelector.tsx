import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PlayerSelectorProps {
  players: string[];
  value: string | null;
  onChange: (player: string) => void;
}

export function stripPlayerPrefix(player: string): string {
  return player.replace(/^Плеер\s+/i, '').trim();
}

export function PlayerSelector({ players, value, onChange }: PlayerSelectorProps) {
  if (players.length <= 1) return null;

  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Плеер
      </div>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Выбор плеера">
        {players.map((player) => {
          const isActive = player === value;
          return (
            <Button
              key={player}
              type="button"
              role="radio"
              aria-checked={isActive}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange(player)}
              className={cn('cursor-pointer', isActive && 'font-semibold')}
            >
              {stripPlayerPrefix(player)}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
