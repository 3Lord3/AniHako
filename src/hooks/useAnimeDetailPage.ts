import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useAnimeDetail,
  useAddToList,
  useUserAnimeList,
  useToggleFavorite,
  useUpdateListEntry,
  useRemoveFromList,
  useVideoViews,
  useToggleVideoViewed,
} from './useAnime';
import { useUser } from './useAuth';
import { mapStatusToListId } from '@/types';
import type { AnimeStatus, AnimeVideo, YummyUserAnimeRate } from '@/types';

export function useAnimeDetailPage(url: string) {
  const navigate = useNavigate();
  const { data: user } = useUser();

  const { data: anime, isLoading } = useAnimeDetail(url);

  const animeId = anime?.anime_id || 0;
  const { data: userAnimeList } = useUserAnimeList();
  const { mutate: addToList } = useAddToList();
  const { mutate: toggleFavorite } = useToggleFavorite();
  const { mutate: updateListEntry } = useUpdateListEntry();
  const { mutate: removeFromList } = useRemoveFromList();
  const { data: viewedEpisodeNumbers = [] } = useVideoViews(animeId || null);
  const { mutate: toggleVideoViewed } = useToggleVideoViewed(animeId || null, anime?.videos);

  const viewedEpisodeSet = useMemo(() => new Set(viewedEpisodeNumbers), [viewedEpisodeNumbers]);

  // Build a Map for O(1) lookup of the user's rate for this anime, instead
  // of scanning the full user-anime list on every render.
  const userAnimeById = useMemo(() => {
    const map = new Map<number, YummyUserAnimeRate>();
    for (const rate of Array.isArray(userAnimeList) ? userAnimeList : []) {
      if (typeof rate?.anime_id === 'number') {
        map.set(rate.anime_id, rate);
      }
    }
    return map;
  }, [userAnimeList]);

  const userAnime = animeId > 0 ? userAnimeById.get(animeId) : undefined;
  const isFavorite = anime?.user?.list?.is_fav || false;
  const userListId: number | null = anime?.user?.list?.list?.id ?? userAnime?.user?.list?.list?.id ?? null;
  const canMarkWatched = !!user && animeId > 0;

  const requireAuth = useCallback(
    (fn: () => void) => {
      if (!user) {
        navigate('/login');
        return;
      }
      fn();
    },
    [user, navigate]
  );

  const handleAddToList = useCallback(
    (status: AnimeStatus) => {
      requireAuth(() => {
        const statusId = mapStatusToListId(status);
        if (userListId === statusId) {
          removeFromList(animeId, { onError: () => {} });
        } else if (userAnime) {
          updateListEntry({ animeId, data: { status } }, { onError: () => {} });
        } else {
          addToList({ animeId, status, episodes: 0 }, { onError: () => {} });
        }
      });
    },
    [requireAuth, userListId, animeId, userAnime, removeFromList, updateListEntry, addToList]
  );

  const handleToggleFavorite = useCallback(() => {
    requireAuth(() => {
      toggleFavorite({ animeId, isFavorite });
    });
  }, [requireAuth, toggleFavorite, animeId, isFavorite]);

  const handleToggleWatched = useCallback(
    (video: AnimeVideo, isWatched: boolean) => {
      requireAuth(() => {
        toggleVideoViewed(
          { epTitle: video.number, videoId: video.video_id, currentlyViewed: isWatched },
          { onError: () => {} }
        );
      });
    },
    [requireAuth, toggleVideoViewed]
  );

  const handleEpisodeComplete = useCallback(
    (video: AnimeVideo) => {
      if (!user) return;
      if (viewedEpisodeSet.has(video.number)) return;
      toggleVideoViewed(
        { epTitle: video.number, videoId: video.video_id, currentlyViewed: false },
        { onError: () => {} }
      );
    },
    [user, viewedEpisodeSet, toggleVideoViewed]
  );

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }, [navigate]);

  return {
    user,
    anime,
    isLoading,
    isFavorite,
    userListId,
    canMarkWatched,
    viewedEpisodeSet,
    handleAddToList,
    handleToggleFavorite,
    handleToggleWatched,
    handleEpisodeComplete,
    handleBack,
  };
}
