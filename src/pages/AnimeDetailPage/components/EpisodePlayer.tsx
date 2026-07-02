import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { AnimeVideo } from '@/types';

interface EpisodePlayerProps {
  video: AnimeVideo;
  title: string;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function EpisodePlayer({
  video,
  title,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: EpisodePlayerProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [video.video_id]);

  const episodeLabel = video.number || String(video.index);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={!hasPrev}
          className="cursor-pointer"
          aria-label="Предыдущая серия"
        >
          <ChevronLeft className="size-4" />
          Предыдущая
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasNext}
          className="cursor-pointer"
          aria-label="Следующая серия"
        >
          Следующая
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted ring-1 ring-foreground/10">
        {!loaded && <Skeleton className="absolute inset-0 w-full h-full rounded-none" />}
        <iframe
          key={video.video_id}
          src={video.iframe_url}
          title={`${title} - Серия ${episodeLabel}`}
          className={cn(
            'absolute inset-0 w-full h-full',
            !loaded && 'opacity-0'
          )}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          referrerPolicy="origin"
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}
