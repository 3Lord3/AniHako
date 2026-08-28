import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { AnimeDetail } from '@/types';

interface DescriptionViewProps {
  anime: AnimeDetail | null;
}

export function DescriptionPanel({ anime }: DescriptionViewProps) {
  return (
    <div className="w-full select-text">
      <Card className="py-0">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-2">Описание</h3>
          {anime?.description ? (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {anime.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Описание отсутствует</p>
          )}

          {anime?.genres && anime.genres.length > 0 && (
            <div className="space-y-2 mt-4">
              <h4 className="text-sm font-medium">Жанры</h4>
              <div className="flex flex-wrap gap-1.5">
                {anime.genres.map((g) => (
                  <Badge key={g.id} variant="outline" className="text-xs">
                    {g.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
