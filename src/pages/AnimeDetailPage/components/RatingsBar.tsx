import { RatingSourceIcon, type RatingSourceKey } from '@/components/detail/RatingSourceIcon';
import { useT } from '@/i18n';
import type { AnimeCatalogItem } from '@/types';

interface RatingsBarProps {
  rating: AnimeCatalogItem['rating'];
}

interface SourceRow {
  source: RatingSourceKey;
  name: string;
  value: number;
}

function toRow(source: RatingSourceKey, name: string, value: number | undefined | null): SourceRow | null {
  if (value == null || value <= 0) return null;
  return { source, name, value };
}

export function RatingsBar({ rating }: RatingsBarProps) {
  const { t } = useT();
  if (!rating) return null;

  const rows: SourceRow[] = [
    toRow('anihako', 'AniHako', rating.average),
    toRow('shikimori', 'Shikimori', rating.shikimori_rating),
    toRow('mal', 'MyAnimeList', rating.myanimelist_rating),
    toRow('kinopoisk', 'Кинопоиск', rating.kp_rating),
    toRow('worldart', 'WorldArt', rating.worldart_rating),
    toRow('anidub', 'AniDub', rating.anidub_rating),
  ].filter((r): r is SourceRow => r !== null);

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-foreground select-text">
        {t('ratings.title')}
      </div>
      <div className="flex md:grid md:grid-cols-6 gap-4 md:gap-x-4 md:gap-y-5 py-2 overflow-x-auto md:overflow-visible snap-x md:snap-none -mx-4 px-4 md:mx-0 md:px-0 [mask-image:linear-gradient(to_right,black_0%,black_92%,transparent_100%)] md:[mask-image:none] [-webkit-mask-image:linear-gradient(to_right,black_0%,black_92%,transparent_100%)] md:[-webkit-mask-image:none]">
        {rows.map(({ source, name, value }) => (
          <div key={source} className="flex flex-col items-center gap-1.5 min-w-[80px] shrink-0 snap-start md:min-w-0">
            <RatingSourceIcon source={source} />
            <div className="text-xl font-bold text-foreground leading-none tabular-nums">
              {value.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground leading-none truncate max-w-full">
              {name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}