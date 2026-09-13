import { useState } from 'react';
import { Star, Vote, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { getRatingColor } from '@/types/constants';
import { useRateAnime, useUnrateAnime } from '@/hooks/useAnime';

const CRITERIA = [
  { key: 'plot', label: 'Сюжет' },
  { key: 'world', label: 'Мир' },
  { key: 'characters', label: 'Персонажи' },
  { key: 'impression', label: 'Общее впечатление' },
] as const;

/** Вычисляет округлённое до целого среднее четырёх критериев (1–10). */
function computeOverall(a: number, b: number, c: number, d: number): number | null {
  if (a < 1 || b < 1 || c < 1 || d < 1) return null;
  const mean = (a + b + c + d) / 4;
  return Math.min(10, Math.max(1, Math.round(mean)));
}

function ratingLabel(value: number | null): string {
  if (value === null || value < 1) return '—';
  return value.toFixed(value % 1 === 0 ? 0 : 2);
}

interface StarSelectorProps {
  value: number;
  onChange: (v: number) => void;
  ariaLabel: string;
}

/** Ряд из 10 звёзд для выбора целой оценки от 1 до 10. */
function StarSelector({ value, onChange, ariaLabel }: StarSelectorProps) {
  return (
    <div className="flex items-center gap-0" role="radiogroup" aria-label={ariaLabel}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => {
        const active = value >= star;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${ariaLabel}: ${star}`}
            onClick={() => onChange(star === value ? 0 : star)}
            className="cursor-pointer p-0.5 text-amber-400 transition-transform hover:scale-115 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 rounded"
          >
            <Star
              className={cn('w-6 h-6 sm:w-7 sm:h-7', active ? 'fill-current' : 'fill-transparent stroke-current')}
            />
          </button>
        );
      })}
    </div>
  );
}

export interface RatingBlockProps {
  animeId: number;
  /** Оценка текущего пользователя, если есть (из `anime.user.rating`). */
  currentUserRating?: number;
  /** Текущий средний рейтинг аниме (из `anime.rating.average`). */
  overallRating?: number;
  /** Количество голосов (из `anime.rating.counters`). */
  votes?: number;
  /** Может ли пользователь оценивать (авторизован). */
  enabled?: boolean;
}

/**
 * Кнопка «Оценить» + модальное окно с формой оценки.
 *
 * В модальном окне пользователь ставит четыре критерия (сюжет, мир,
 * персонажи, общее впечатление) по 1–10, а итоговая оценка считается как
 * среднее арифметическое этих четырёх и отправляется в `PUT /anime/{id}/rate`.
 * «Убрать оценку» шлёт `DELETE /anime/{id}/rate`. Средний рейтинг
 * отображается с цветом из бейджа оценок (`getRatingColor`).
 */
export function RatingBlock({
  animeId,
  currentUserRating,
  overallRating,
  votes,
  enabled = false,
}: RatingBlockProps) {
  const { mutate: rate } = useRateAnime();
  const { mutate: unrate } = useUnrateAnime();

  const [open, setOpen] = useState(false);

  const [plot, setPlot] = useState(0);
  const [world, setWorld] = useState(0);
  const [characters, setCharacters] = useState(0);
  const [impression, setImpression] = useState(0);
  const [myRating, setMyRating] = useState<number | undefined>(currentUserRating);
  const [stats, setStats] = useState<{ rating: number | undefined; votes: number | undefined }>({
    rating: overallRating,
    votes,
  });

  const [pending, setPending] = useState(false);

  const overall = computeOverall(plot, world, characters, impression);
  const avg = stats.rating;
  const counter = stats.votes;
  const displayRating = avg && !isNaN(avg) ? avg : null;

  const resetForm = () => {
    setPlot(0);
    setWorld(0);
    setCharacters(0);
    setImpression(0);
  };

  const handleRate = () => {
    if (!enabled || overall === null || pending) return;
    setPending(true);
    rate(
      { animeId, rate: overall },
      {
        onSuccess: (data) => {
          setMyRating(overall);
          setStats({ rating: data.rating, votes: data.votes });
          resetForm();
          setOpen(false);
        },
        onSettled: () => setPending(false),
      }
    );
  };

  const handleUnrate = () => {
    if (!enabled || pending) return;
    setPending(true);
    unrate(animeId, {
      onSuccess: (data) => {
        setMyRating(undefined);
        setStats({ rating: data.rating, votes: data.votes });
        resetForm();
      },
      onSettled: () => setPending(false),
    });
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={!enabled}
        className="w-full cursor-pointer"
        variant={myRating !== undefined ? 'default' : 'outline'}
      >
        <Star className={cn('w-4 h-4', myRating !== undefined && 'fill-current')} />
        {myRating !== undefined ? `Моя оценка: ${myRating}` : 'Оценить'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">Оценка</DialogTitle>
          </DialogHeader>

          {/* Текущий средний рейтинг с цветом бейджа + число голосов */}
          <div className="flex items-center gap-3">
            <span
              className={cn(
                getRatingColor(displayRating),
                'px-2.5 py-1 rounded text-sm font-bold text-white'
              )}
            >
              <span className="inline-flex items-center gap-1">
                <Star className="w-4 h-4 fill-white text-white" />
                {ratingLabel(displayRating)}
              </span>
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
              <Vote className="w-4 h-4" />
              {counter !== undefined ? counter.toLocaleString('ru-RU') : '—'} голосов
            </span>
          </div>

          {/* Ваша оценка */}
          <div className="text-sm">
            Ваша оценка:{' '}
            {myRating ? (
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded text-white text-xs font-bold',
                  getRatingColor(myRating)
                )}
              >
                {myRating}
              </span>
            ) : (
              <span className="text-muted-foreground">нет</span>
            )}
          </div>

          {myRating === undefined ? (
            <>
              {/* 4 критерия: сюжет, мир, персонажи, общее впечатление */}
              <div className="space-y-2">
                {CRITERIA.map((c, idx) => {
                  const value = [plot, world, characters, impression][idx];
                  const setValue = [setPlot, setWorld, setCharacters, setImpression][idx];
                  return (
                    <div
                      key={c.key}
                      className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2"
                    >
                      <span className="text-sm text-muted-foreground shrink-0">{c.label}</span>
                      <StarSelector value={value} onChange={setValue} ariaLabel={c.label} />
                    </div>
                  );
                })}
              </div>

              {/* Итоговая оценка = среднее арифметическое четырёх критериев */}
              <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                <span className="text-sm font-medium">Итоговая оценка</span>
                <span
                  className={cn(
                    getRatingColor(overall),
                    'inline-flex min-w-7 items-center justify-center rounded px-2 py-1 text-sm font-bold text-white'
                  )}
                >
                  {overall ?? '—'}
                </span>
              </div>

              <Button
                onClick={handleRate}
                disabled={overall === null || pending}
                className="cursor-pointer w-full"
              >
                Оценить
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleUnrate}
                disabled={pending}
                className="cursor-pointer w-full"
              >
                <X className="w-4 h-4" />
                Убрать
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}