import { RotateCcw, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { TournamentParticipant } from '@/hooks/useTournament';
import { cn } from '@/lib/utils';
import { getImageUrl, getHeroPosterUrl } from '@/lib/imageUrl';
import { TooltipWrap } from '@/components/ui/tooltip';

interface TournamentResultsProps {
  participants: Array<TournamentParticipant & { position: number }>;
  champion: TournamentParticipant | null;
  onRestart: () => void;
}

export function TournamentResults({ participants, champion, onRestart }: TournamentResultsProps) {
  const sortedResults = [...participants].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-8 py-8">
      {champion && (
        <div className="text-center">
          <div className="inline-block">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-40 md:h-40 mx-auto mb-3 sm:mb-4 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse" />
              <div className="absolute inset-2 sm:inset-3 md:inset-4 bg-background rounded-full" />
              <div className="absolute inset-3 sm:inset-4 md:inset-6 overflow-hidden rounded-full">
                <img
                  src={getImageUrl(getHeroPosterUrl(champion.anime))}
                  alt={champion.anime.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs md:text-sm font-bold whitespace-nowrap">
                🏆 Чемпион
              </div>
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{champion.anime.title}</h2>
          </div>
        </div>
      )}

      <div className="max-w-xs sm:max-w-sm md:max-w-2xl mx-auto">
        <h3 className="text-base sm:text-xl font-bold mb-3 sm:mb-4 text-center text-foreground">Итоговая таблица</h3>
        <div className="space-y-2">
          {sortedResults.map((participant, idx) => {
            const prev = sortedResults[idx - 1];
            const hasGap = prev !== undefined && participant.position > prev.position + 1;

            return (
              <div key={participant.id} className="space-y-2">
                {hasGap && (
                  <div
                    className="flex items-center gap-2 px-2 py-1 text-[10px] sm:text-xs text-muted-foreground/70"
                    aria-hidden="true"
                  >
                    <div className="flex-1 border-t border-dashed border-muted-foreground/30" />
                    <span className="font-medium tracking-widest">···</span>
                    <div className="flex-1 border-t border-dashed border-muted-foreground/30" />
                  </div>
                )}
                <div
                  className={cn(
                    "flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg transition-colors border",
                    participant.position <= 3
                      ? "bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-transparent border-yellow-500/20"
                      : "bg-card border-border"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base md:text-lg",
                    participant.position === 1 && "bg-yellow-500 text-black",
                    participant.position === 2 && "bg-gray-400 text-white",
                    participant.position === 3 && "bg-amber-600 text-white",
                    participant.position > 3 && "bg-muted text-muted-foreground"
                  )}>
                    {participant.position <= 3 ? (
                      participant.position === 1 ? '🥇' : participant.position === 2 ? '🥈' : '🥉'
                    ) : (
                      participant.position
                    )}
                  </div>

                  <div className="w-10 h-12 sm:w-12 sm:h-16 md:w-16 md:h-20 rounded overflow-hidden bg-muted flex-shrink-0 border border-border">
                    <img
                      src={getImageUrl(getHeroPosterUrl(participant.anime))}
                      alt={participant.anime.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-foreground text-xs sm:text-sm">{participant.anime.title}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {participant.anime.year ? `${participant.anime.year} • ` : ''}
                      {participant.anime.genres?.slice(0, 2).map((g) => g.title).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {participant.anime.user?.rating ? (
                      <TooltipWrap content="Ваша оценка">
                        <div className="flex items-center gap-1 text-xs sm:text-sm font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded cursor-default">
                          <User className="w-3 h-3" />
                          {participant.anime.user.rating}
                        </div>
                      </TooltipWrap>
                    ) : null}
                    {participant.anime.rating?.average ? (
                      <TooltipWrap content="Оценка других пользователей">
                        <div className="text-xs sm:text-sm font-medium text-muted-foreground cursor-default">
                          ★ {Number(participant.anime.rating.average).toFixed(1)}
                        </div>
                      </TooltipWrap>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <Button onClick={onRestart} size="lg" variant="outline" className="gap-2 text-foreground border-2 hover:bg-accent text-sm sm:text-base px-4 py-3 sm:px-8 sm:py-6 w-full sm:w-auto">
          <RotateCcw className="w-4 h-4" />
          Провести ещё один турнир
        </Button>
        <Link to="/" className="w-full sm:w-auto">
          <Button size="lg" variant="outline" className="gap-2 text-foreground border-2 hover:bg-accent text-sm sm:text-base px-4 py-3 sm:px-8 sm:py-6 w-full">
            На главную
          </Button>
        </Link>
      </div>
    </div>
  );
}
