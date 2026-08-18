import { useParams } from 'react-router-dom';
import { useAnimeDetailPage } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { getImageUrl } from '@/lib/imageUrl';
import { AnimeDetailPageSkeleton } from '@/components/loaders/PageSkeletons';
import { AnimeCharacteristics } from './AnimeDetailPage/components/AnimeCharacteristics';
import { EpisodeViewer } from './AnimeDetailPage/components/EpisodeViewer';
import { ViewingOrder } from './AnimeDetailPage/components/ViewingOrder';
import { StatusButtonGroup } from '@/components/detail/StatusButtonGroup';

export function AnimeDetailPage() {
  const { url } = useParams<{ url: string }>();
  const {
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
  } = useAnimeDetailPage(url || '');

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
        onClick={handleBack}
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
