import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRandomAnime, useAddToList, useFullscreen } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { SwipeCard } from '@/components/matcher/SwipeCard';
import { ActionButtons, AddButton, ExternalLinkButton } from '@/components/matcher/ActionButtons';
import { DescriptionPanel } from '@/components/matcher/DescriptionView';
import { buildAnimeUrl } from '@/lib/animeUrl';

export function AnimeMatcherPage() {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const { enter: enterFullscreen, exit: exitFullscreen, isFullscreen } = useFullscreen();
  const hasEnteredFullscreen = useRef(false);

  const { data: anime, isLoading, refetch } = useRandomAnime();
  const { mutate: addToList, isPending: isAdding } = useAddToList();

  const currentAnime = anime ?? null;

  const loadNextAnime = () => {
    setIsTransitioning(true);
    refetch().then(() => {
      setIsTransitioning(false);
    });
  };

  const requestFullscreenOnce = () => {
    if (!hasEnteredFullscreen.current) {
      hasEnteredFullscreen.current = true;
      void enterFullscreen();
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (isTransitioning) return;
    requestFullscreenOnce();
    setIsTransitioning(true);
    setShowDescriptionModal(false);

    if (direction === 'right' && currentAnime) {
      addToList(
        { animeId: currentAnime.anime_id, status: 'planned' },
        {
          onSuccess: () => {
            loadNextAnime();
          },
          onError: () => {
            setIsTransitioning(false);
          }
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

  const handleGoHome = () => {
    void exitFullscreen();
    navigate('/');
  };

  useEffect(() => {
    return () => {
      if (isFullscreen) {
        void exitFullscreen();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading && !currentAnime) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentAnime && !isLoading) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">Аниме не найдено</p>
        <Button onClick={() => refetch()}>Попробовать снова</Button>
      </div>
    );
  }

  return (
    <div className="md:space-y-6">
      <div className="hidden md:block text-center md:space-y-2">
        <h1 className="text-4xl font-bold select-text">AniMatch</h1>
        <p className="text-muted-foreground select-text">
          Свайпайте влево чтобы пропустить, вправо чтобы добавить в запланированное
        </p>
      </div>

      <div className="md:hidden text-center mb-3">
        <p className="text-sm text-muted-foreground select-text">
          Свайпайте влево чтобы пропустить, вправо чтобы добавить в запланированное
        </p>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex items-center justify-center gap-6">
        <ActionButtons
          isTransitioning={isTransitioning}
          isAdding={isAdding}
          onSkip={handleSkip}
          onAdd={handleAdd}
          onHome={handleGoHome}
        />

        <div className="w-[360px]">
          {currentAnime && (
            <SwipeCard
              key={currentAnime.anime_id}
              anime={currentAnime}
              onSwipe={handleSwipe}
              isActive={!isTransitioning}
            />
          )}
        </div>

        <div className="flex flex-col items-center gap-6">
          <AddButton
            isTransitioning={isTransitioning}
            isAdding={isAdding}
            onAdd={handleAdd}
          />
          {currentAnime && (
            <ExternalLinkButton
              onClick={() => navigate(buildAnimeUrl(currentAnime))}
            />
          )}
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex flex-col h-[calc(100dvh-150px)]">
        <div className="relative flex-grow flex items-center justify-center py-2">
          {currentAnime && (
            <SwipeCard
              key={currentAnime.anime_id}
              anime={currentAnime}
              onSwipe={handleSwipe}
              isActive={!isTransitioning}
            />
          )}
        </div>

        <ActionButtons
          variant="mobile"
          isTransitioning={isTransitioning}
          isAdding={isAdding}
          onSkip={handleSkip}
          onAdd={handleAdd}
          onHome={handleGoHome}
          onExternalLink={currentAnime ? () => navigate(buildAnimeUrl(currentAnime)) : undefined}
          onInfo={() => setShowDescriptionModal(true)}
        />
      </div>

      {/* Description panel - desktop */}
      <div className="hidden md:block">
        <DescriptionPanel anime={currentAnime} />
      </div>

      {/* Description modal - mobile */}
      <Dialog open={showDescriptionModal} onOpenChange={setShowDescriptionModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{currentAnime?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {currentAnime?.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {currentAnime.description}
              </p>
            )}
            {currentAnime?.genres && currentAnime.genres.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Жанры</h4>
                <div className="flex flex-wrap gap-1.5">
                  {currentAnime.genres.slice(0, 2).map((g: { title: string }) => (
                    <Badge key={g.title} variant="outline" className="text-xs">
                      {g.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
