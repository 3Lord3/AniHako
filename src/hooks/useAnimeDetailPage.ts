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
import type { AnimeStatus, YummyUserAnimeRate } from '@/types';

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
  const { data: viewedVideoIds = [] } = useVideoViews(animeId || null, anime?.videos);
  const { mutate: toggleVideoViewed } = useToggleVideoViewed(animeId || null, anime?.videos);

  const viewedVideoSet = useMemo(() => new Set(viewedVideoIds), [viewedVideoIds]);

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
    (videoId: number, isWatched: boolean) => {
      requireAuth(() => {
        toggleVideoViewed({ videoId, currentlyViewed: isWatched }, { onError: () => {} });
      });
    },
    [requireAuth, toggleVideoViewed]
  );

  const handleEpisodeComplete = useCallback(
    (videoId: number) => {
      if (!user) return;
      if (viewedVideoSet.has(videoId)) return;
      toggleVideoViewed({ videoId, currentlyViewed: false }, { onError: () => {} });
    },
    [user, viewedVideoSet, toggleVideoViewed]
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
    viewedVideoSet,
    handleAddToList,
    handleToggleFavorite,
    handleToggleWatched,
    handleEpisodeComplete,
    handleBack,
  };
}
