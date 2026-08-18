import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { AnimeVideo } from '@/types';
import { useEpisodePlayerCompletion } from '@/hooks/useEpisodePlayerCompletion';

interface EpisodePlayerProps {
  video: AnimeVideo;
  title: string;
  onEpisodeComplete?: (videoId: number) => void;
}

export function EpisodePlayer({ video, title, onEpisodeComplete }: EpisodePlayerProps) {
  const [loaded, setLoaded] = useState(false);
  const { iframeRef } = useEpisodePlayerCompletion(video, onEpisodeComplete);

  const episodeLabel = video.number || String(video.index);

  useEffect(() => {
    setLoaded(false);
  }, [video.video_id]);

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted ring-1 ring-foreground/10">
      {!loaded && <Skeleton className="absolute inset-0 w-full h-full rounded-none" />}
      <iframe
        ref={iframeRef}
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
  );
}
