import { useEffect, useRef } from 'react';
import type { AnimeVideo } from '@/types';
import { isPlayerEndedEvent } from '@/lib/episodes';

export function useEpisodePlayerCompletion(
  video: AnimeVideo,
  onEpisodeComplete?: (videoId: number) => void
) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedRef = useRef(false);
  const videoIdRef = useRef<number>(video.video_id);
  const onCompleteRef = useRef(onEpisodeComplete);

  useEffect(() => {
    onCompleteRef.current = onEpisodeComplete;
  }, [onEpisodeComplete]);

  useEffect(() => {
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

  return { iframeRef };
}
