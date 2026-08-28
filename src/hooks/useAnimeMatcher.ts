import { useState } from 'react';
import { useRandomAnime, useAddToList } from './useAnime';

export function useAnimeMatcher(onSwipeStart?: () => void) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { data: anime, isLoading, refetch } = useRandomAnime();
  const { mutate: addToList, isPending: isAdding } = useAddToList();

  const currentAnime = anime ?? null;

  const loadNextAnime = () => {
    setIsTransitioning(true);
    refetch().then(() => {
      setIsTransitioning(false);
    });
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    onSwipeStart?.();

    if (direction === 'right' && currentAnime) {
      addToList(
        { animeId: currentAnime.anime_id, status: 'planned' },
        {
          onSuccess: () => {
            loadNextAnime();
          },
          onError: () => {
            setIsTransitioning(false);
          },
        }
      );
    } else {
      loadNextAnime();
    }
  };

  const handleSkip = () => {
    if (isTransitioning || isAdding) return;
    handleSwipe('left');
  };

  const handleAdd = () => {
    if (isTransitioning || isAdding) return;
    handleSwipe('right');
  };

  return {
    currentAnime,
    isLoading,
    isTransitioning,
    isAdding,
    refetch,
    handleSwipe,
    handleSkip,
    handleAdd,
  };
}
