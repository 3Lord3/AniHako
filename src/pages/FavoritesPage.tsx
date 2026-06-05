import { useFavorites } from '@/hooks';
import { Heart } from 'lucide-react';
import { AnimeGrid } from '@/components/AnimeGrid';
import { FavoritesPageSkeleton } from '@/components/loaders/PageSkeletons';

export function FavoritesPage() {
  const { data: favorites, isLoading } = useFavorites();

  if (isLoading) {
    return <FavoritesPageSkeleton />;
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>У вас пока нет любимых аниме</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Любимое</h1>
      <AnimeGrid anime={favorites} />
    </div>
  );
}