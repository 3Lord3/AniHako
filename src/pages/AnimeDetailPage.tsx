import { useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useAnimeDetail,
  useAddToList,
  useUserAnimeList,
  useToggleFavorite,
  useUpdateListEntry,
  useRemoveFromList,
  useVideoViews,
  useToggleVideoViewed,
} from '@/hooks';
import { useUser } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { getImageUrl } from '@/lib/imageUrl';
import { mapStatusToListId } from '@/types';
import { AnimeDetailPageSkeleton } from '@/components/loaders/PageSkeletons';
import { AnimeCharacteristics } from './AnimeDetailPage/components/AnimeCharacteristics';
import { EpisodeViewer } from './AnimeDetailPage/components/EpisodeViewer';
import { ViewingOrder } from './AnimeDetailPage/components/ViewingOrder';
import { StatusButtonGroup } from '@/components/detail/StatusButtonGroup';
import type { AnimeStatus, YummyUserAnimeRate } from '@/types';

export function AnimeDetailPage() {
  const { url } = useParams<{ url: string }>();
  const navigate = useNavigate();
  const { data: user } = useUser();

  const { data: anime, isLoading } = useAnimeDetail(url || '');

  const animeId = anime?.anime_id || 0;
  const { data: userAnimeList } = useUserAnimeList();
  const { mutate: addToList } = useAddToList();
  const { mutate: toggleFavorite } = useToggleFavorite();
  const { mutate: updateListEntry } = useUpdateListEntry();
  const { mutate: removeFromList } = useRemoveFromList();
  const { data: viewedVideoIds = [] } = useVideoViews(animeId || null, anime?.videos);
  const { mutate: toggleVideoViewed } = useToggleVideoViewed(animeId || null, anime?.videos);

  const viewedVideoSet = useMemo(() => new Set(viewedVideoIds), [viewedVideoIds]);

  // Build a Map for O(1) lookup of the user's rate for this anime, instead
  // of scanning the full user-anime list on every render.
  const userAnimeById = useMemo(() => {
    const map = new Map<number, YummyUserAnimeRate>();
    if (Array.isArray(userAnimeList)) {
      for (const rate of userAnimeList) {
        if (typeof rate?.anime_id === 'number') {
          map.set(rate.anime_id, rate);
        }
      }
    }
    return map;
  }, [userAnimeList]);

  const userAnime = animeId > 0 ? userAnimeById.get(animeId) : undefined;
  const isFavorite = anime?.user?.list?.is_fav || false;
  const userListId: number | null = anime?.user?.list?.list?.id ?? userAnime?.user?.list?.list?.id ?? null;
  const canMarkWatched = !!user && animeId > 0;

  const handleAddToList = (status: AnimeStatus) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const statusId = mapStatusToListId(status);
    if (userListId === statusId) {
      removeFromList(animeId, { onError: () => {} });
    } else if (userAnime) {
      updateListEntry(
        { animeId, data: { status } },
        { onError: () => {} }
      );
    } else {
      addToList(
        { animeId, status, episodes: 0 },
        { onError: () => {} }
      );
    }
  };

  const handleToggleFavorite = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    toggleFavorite({ animeId, isFavorite });
  };

  const handleToggleWatched = useCallback(
    (videoId: number, isWatched: boolean) => {
      if (!user) {
        navigate('/login');
        return;
      }
      toggleVideoViewed(
        { videoId, currentlyViewed: isWatched },
        { onError: () => {} }
      );
    },
    [user, navigate, toggleVideoViewed]
  );

  const handleEpisodeComplete = useCallback(
    (videoId: number) => {
      if (!user) return;
      if (viewedVideoSet.has(videoId)) return;
      toggleVideoViewed(
        { videoId, currentlyViewed: false },
        { onError: () => {} }
      );
    },
    [user, viewedVideoSet, toggleVideoViewed]
  );

  if (isLoading) {
    return <AnimeDetailPageSkeleton />;
  }

  if (!anime) {
    return <div className="text-center py-12">Аниме не найдено</div>;
  }

  const displayTitle = anime.title;
  const otherTitles = anime.other_titles;
  const englishTitle = otherTitles && otherTitles.length > 0 ? otherTitles[0] : null;

  return (
    <div className="space-y-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate('/');
          }
        }}
        className="cursor-pointer text-foreground hover:bg-muted"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Назад
      </Button>

      {anime.poster && (
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 to-background" />
          <img
            src={getImageUrl(anime.poster.huge || anime.poster.big || anime.poster.fullsize)}
            alt=""
            className="w-full h-full object-cover blur-xl scale-110"
          />
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0 flex flex-col items-center">
          <img
            src={getImageUrl(anime.poster?.medium || anime.poster?.big || anime.poster?.huge)}
            alt={displayTitle}
            className="w-64 rounded-lg shadow-lg"
          />
          {user && (
            <div className="mt-4">
              <StatusButtonGroup
                isFavorite={isFavorite}
                userListId={userListId}
                onToggleFavorite={handleToggleFavorite}
                onAddToList={handleAddToList}
              />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold text-foreground select-text">{displayTitle}</h1>
          {englishTitle && englishTitle !== displayTitle && (
            <p className="text-xl text-muted-foreground select-text">{englishTitle}</p>
          )}

          <AnimeCharacteristics anime={anime} />
        </div>
      </div>

      {anime.description && (
        <Card>
          <CardHeader>
            <CardTitle className="select-text">Описание</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap select-text">{anime.description}</p>
          </CardContent>
        </Card>
      )}

      {anime.viewing_order && anime.viewing_order.length > 0 && (
        <ViewingOrder
          items={anime.viewing_order}
          currentAnimeId={anime.anime_id}
        />
      )}

      {anime.videos && anime.videos.length > 0 && (
        <EpisodeViewer
          videos={anime.videos}
          translates={anime.translates}
          title={displayTitle}
          viewedVideoIds={viewedVideoSet}
          canMarkWatched={canMarkWatched}
          onToggleWatched={handleToggleWatched}
          onEpisodeComplete={handleEpisodeComplete}
        />
      )}
    </div>
  );
}
