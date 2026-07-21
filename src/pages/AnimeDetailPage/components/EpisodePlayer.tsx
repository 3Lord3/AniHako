import { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { AnimeVideo } from '@/types';

interface EpisodePlayerProps {
  video: AnimeVideo;
  title: string;
  onEpisodeComplete?: (videoId: number) => void;
}

const ENDED_EVENT_PATTERN = /ended|finish|complete/i;

function isPlayerEndedEvent(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const payload = data as Record<string, unknown>;
  const event = payload.event;
  const type = payload.type;
  if (typeof event === 'string' && ENDED_EVENT_PATTERN.test(event)) return true;
  if (typeof type === 'string' && ENDED_EVENT_PATTERN.test(type)) return true;
  return false;
}

export function EpisodePlayer({ video, title, onEpisodeComplete }: EpisodePlayerProps) {
  const [loaded, setLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedRef = useRef(false);
  const videoIdRef = useRef<number>(video.video_id);
  const onCompleteRef = useRef(onEpisodeComplete);

  useEffect(() => {
    onCompleteRef.current = onEpisodeComplete;
  }, [onEpisodeComplete]);

  const episodeLabel = video.number || String(video.index);

  useEffect(() => {
    setLoaded(false);
    completedRef.current = false;
    videoIdRef.current = video.video_id;
  }, [video.video_id]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // `video.duration` is in seconds (matches the YummyAnime `/video/watch-history`
    // payload and the duration returned by `getByUrl`). Fallback timer fires
    // ~5 s after the episode would naturally end; postMessage is the primary
    // completion signal, this is just a safety net for players that don't
    // emit it.
    if (video.duration <= 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    const ms = Math.max(1000, (video.duration + 5) * 1000);
    timerRef.current = setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onCompleteRef.current?.(videoIdRef.current);
    }, ms);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [video.video_id, video.duration]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!iframeRef.current) return;
      if (e.source !== iframeRef.current.contentWindow) return;
      if (!isPlayerEndedEvent(e.data)) return;
      if (completedRef.current) return;
      completedRef.current = true;
      onCompleteRef.current?.(videoIdRef.current);
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
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
