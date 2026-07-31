import type { TierAnimeItem } from '@/types/tier';
import type { YummyUserAnimeRate } from '@/types/list';
import type { AnimeCatalogItem } from '@/types/anime';
import { getPosterUrl } from '@/lib/imageUrl';

export function toTierAnimeItem(source: YummyUserAnimeRate | AnimeCatalogItem): TierAnimeItem {
  return {
    animeId: source.anime_id,
    title: source.title,
    // 'small' is a ~33x47 thumbnail, visibly blurry; 'big' is the largest size YummyAnime reliably has.
    posterUrl: getPosterUrl(source, 'big'),
    url: source.anime_url,
  };
}
