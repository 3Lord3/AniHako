import { AnimeGrid } from '@/components/AnimeGrid';
import type { AnimeListItem, UserAnimeRate } from '@/types';

interface AnimeGridSectionProps {
  anime: AnimeListItem[];
  userAnimeList?: UserAnimeRate[];
  isLoading: boolean;
}

export function AnimeGridSection({ anime, userAnimeList, isLoading }: AnimeGridSectionProps) {
  if (isLoading) {
    return <AnimeGrid anime={[]} isLoading={true} />;
  }

  if (anime.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Аниме не найдены
      </div>
    );
  }

  return <AnimeGrid anime={anime} userAnimeList={userAnimeList} />;
}