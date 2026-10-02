import { useEffect, useRef } from 'react';
import type { AnimeVideo } from '@/types';
import { isPlayerEndedEvent, getPlayerProgressSeconds } from '@/lib/episodes';

// `duration` is in seconds; treat playback within this many seconds of the end as watched.
const END_MARGIN = 5;

export function useEpisodePlayerCompletion(
  video: AnimeVideo,
  onEpisodeComplete?: (video: AnimeVideo) => void
) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const completedRef = useRef(false);
  const videoRef = useRef<AnimeVideo>(video);
  const onCompleteRef = useRef(onEpisodeComplete);

  useEffect(() => {
    onCompleteRef.current = onEpisodeComplete;
  }, [onEpisodeComplete]);

  useEffect(() => {
    completedRef.current = false;
    videoRef.current = video;
  }, [video]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!iframeRef.current) return;
      if (e.source !== iframeRef.current.contentWindow) return;
      if (isPlayerEndedEvent(e.data)) {
        if (completedRef.current) return;
        completedRef.current = true;
        onCompleteRef.current?.(videoRef.current);
        return;
      }
      const sec = getPlayerProgressSeconds(e.data);
      if (sec === null || video.duration <= 0) return;
      const threshold = Math.max(0, video.duration - END_MARGIN);
      if (sec > 0 && sec >= threshold) {
        if (completedRef.current) return;
        completedRef.current = true;
        onCompleteRef.current?.(videoRef.current);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [video.video_id, video.duration]);

  return { iframeRef };
}