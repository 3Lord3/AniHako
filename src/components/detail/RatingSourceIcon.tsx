import { cn } from '@/lib/utils';

export type RatingSourceKey =
  | 'anihako'
  | 'shikimori'
  | 'mal'
  | 'kinopoisk'
  | 'worldart'
  | 'anidub';

interface RatingSourceIconProps {
  source: RatingSourceKey;
  className?: string;
}

// Real brand logos come from the simpleicons CDN (https://simpleicons.org),
// passing the brand color in the path. The icon is white on a colored bg.
// Sources without a simpleicons slug are drawn inline (worldart, anidub).
type SourceStyle =
  | { kind: 'img'; bg: string; slug: string }
  | { kind: 'text'; bg: string; label: string };

const SOURCE_STYLE: Record<Exclude<RatingSourceKey, 'anihako'>, SourceStyle> = {
  shikimori: { kind: 'img', bg: '#2f7ac1', slug: 'shikimori' },
  mal: { kind: 'img', bg: '#2e51a2', slug: 'myanimelist' },
  kinopoisk: { kind: 'img', bg: '#ff6600', slug: 'kinopoisk' },
  worldart: { kind: 'text', bg: '#1e88e5', label: 'WA' },
  anidub: { kind: 'text', bg: '#5c4dbe', label: 'AD' },
};

export function RatingSourceIcon({ source, className }: RatingSourceIconProps) {
  const base = 'w-12 h-12 rounded-xl shadow-soft overflow-hidden shrink-0 flex items-center justify-center';

  if (source === 'anihako') {
    return (
      <div className={cn(base, 'bg-primary', className)}>
        <img src="/favicon.svg" alt="" className="w-8 h-8" />
      </div>
    );
  }

  const cfg = SOURCE_STYLE[source];
  if (!cfg) return null;

  if (cfg.kind === 'text') {
    return (
      <div
        className={cn(base, 'text-white font-bold text-sm', className)}
        style={{ backgroundColor: cfg.bg }}
      >
        {cfg.label}
      </div>
    );
  }

  return (
    <div className={cn(base, className)} style={{ backgroundColor: cfg.bg }}>
      <img
        src={`https://cdn.simpleicons.org/${cfg.slug}/ffffff`}
        alt=""
        className="w-7 h-7"
        loading="lazy"
      />
    </div>
  );
}