import { useParams, useNavigate } from 'react-router-dom';
import { useAnimeDetail, useAddToList, useUserAnimeList, useToggleFavorite, useUpdateListEntry, useRemoveFromList } from '@/hooks';
import { useUser } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { getImageUrl } from '@/lib/imageUrl';
import { mapStatusToListId } from '@/types';
import { AnimeDetailPageSkeleton } from '@/components/loaders/PageSkeletons';
import { AnimeCharacteristics } from './AnimeDetailPage/components/AnimeCharacteristics';
import { StatusButtonGroup } from '@/components/detail/StatusButtonGroup';
import type { AnimeStatus } from '@/types';

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

  const userAnime = userAnimeList?.find((rate) => rate.anime_id === animeId);
  const isFavorite = anime?.user?.list?.is_fav || false;
  const userListId: number | null = anime?.user?.list?.list?.id ?? userAnime?.list?.id ?? null;

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
    </div>
  );
}
