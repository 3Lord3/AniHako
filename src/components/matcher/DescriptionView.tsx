import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

interface DescriptionModalProps {
  anime: AnimeDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DescriptionModal({ anime, open, onOpenChange }: DescriptionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{anime?.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {anime?.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {anime.description}
            </p>
          )}
          {anime?.genres && anime.genres.length > 0 && (
            <div className="space-y-2">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
