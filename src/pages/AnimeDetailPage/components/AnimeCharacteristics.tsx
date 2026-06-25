import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Clock, Film, Building2, Tag } from 'lucide-react';
import { KIND_LABELS } from '@/types/constants';
import { SEASONS, type Season } from '@/lib/seasons';
import type { AnimeDetailResponse } from '@/types';

interface CharacteristicItemProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

function CharacteristicItem({ label, value, icon }: CharacteristicItemProps) {
  if (!value) return null;

  return (
    <div className="flex flex-col gap-1 py-2 px-2 rounded-md hover:bg-muted/50 transition-colors min-w-0">
      <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium select-text">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-foreground select-text font-medium">
        {value}
      </div>
    </div>
  );
}

interface AnimeCharacteristicsProps {
  anime: AnimeDetailResponse;
  className?: string;
}

function getSeasonLabel(season: Season | undefined): string | null {
  if (!season) return null;
  return SEASONS[season].label;
}

export function AnimeCharacteristics({ anime, className }: AnimeCharacteristicsProps) {
  const year = anime.year;
  const season = anime.season as Season | undefined;
  const genres = anime.genres?.map(g => g.title) || [];
  const studios = anime.studios?.map(s => s.title) || anime.creators?.map(c => c.title) || [];

  const rating = anime.rating?.average;

  const status = anime.anime_status?.alias;
  const statusTitle = anime.anime_status?.title;

  const episodesCount = anime.episodes?.count;
  const episodesAired = anime.episodes?.aired;

  const duration = anime.duration;

  const typeName = anime.type?.name;
  const typeShortname = anime.type?.shortname;
  const kindLabel = typeShortname && KIND_LABELS[typeShortname]
    ? KIND_LABELS[typeShortname]
    : typeName;

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-1 ${className || ''}`}>
      <CharacteristicItem
        label="Рейтинг"
        icon={<Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />}
        value={
          rating && !isNaN(rating) ? (
            <span className="font-medium text-foreground">{rating.toFixed(2)}</span>
          ) : null
        }
      />
      <CharacteristicItem
        label="Год"
        icon={<Calendar className="w-3.5 h-3.5" />}
        value={year ? <span className="text-foreground">{year}</span> : null}
      />
      <CharacteristicItem
        label="Сезон"
        icon={<Calendar className="w-3.5 h-3.5" />}
        value={season ? <span className="text-foreground">{getSeasonLabel(season)}</span> : null}
      />
      <CharacteristicItem
        label="Тип"
        value={
          kindLabel ? (
            <Badge variant="secondary">
              {kindLabel}
            </Badge>
          ) : null
        }
      />
      <CharacteristicItem
        label="Статус"
        value={
          statusTitle ? (
            <Badge variant={status === 'ongoing' ? 'default' : 'secondary'}>
              {status === 'ongoing' ? 'Онгоинг' : statusTitle === 'released' ? 'Вышло' : statusTitle}
            </Badge>
          ) : null
        }
      />
      <CharacteristicItem
        label="Эпизоды"
        icon={<Film className="w-3.5 h-3.5" />}
        value={
          episodesCount !== undefined && episodesCount > 0 ? (
            <span className="text-foreground">
              {episodesCount} эп.
              {episodesAired && episodesAired > 0 && episodesAired !== episodesCount && ` (вышло ${episodesAired})`}
            </span>
          ) : episodesAired ? (
            <span className="text-foreground">{episodesAired} эп.</span>
          ) : null
        }
      />
      <CharacteristicItem
        label="Длительность"
        icon={<Clock className="w-3.5 h-3.5" />}
        value={duration && duration > 0 ? <span className="text-foreground">{Math.floor(duration / 60)} мин.</span> : null}
      />
      {studios.length > 0 && (
        <CharacteristicItem
          label="Студия"
          icon={<Building2 className="w-3.5 h-3.5" />}
          value={<span className="text-foreground">{studios.join(', ')}</span>}
        />
      )}
      <CharacteristicItem
        label="Жанры"
        icon={<Tag className="w-3.5 h-3.5" />}
        value={
          genres.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {genres.slice(0, 5).map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
              {genres.length > 5 && (
                <Badge variant="outline">+{genres.length - 5}</Badge>
              )}
            </div>
          ) : null
        }
      />
    </div>
  );
}
