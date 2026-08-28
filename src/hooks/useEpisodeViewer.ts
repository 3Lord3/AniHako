import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AnimeTranslate, AnimeVideo } from '@/types';
import {
  filterVideosByTranslate,
  synthesizeTranslatesFromVideos,
  filterGenericTranslates,
  getUniquePlayers,
} from '@/lib/episodes';

export function useEpisodeViewer(
  videos: AnimeVideo[],
  translates: AnimeTranslate[] | undefined,
  onEpisodeComplete?: (videoId: number) => void
) {
  const translatesList = useMemo(() => {
    const synthesized = filterGenericTranslates(synthesizeTranslatesFromVideos(videos));
    if (synthesized.length > 0) return synthesized;
    return filterGenericTranslates(translates ?? []);
  }, [translates, videos]);
  const [translateValue, setTranslateValue] = useState<number | null>(
    translatesList[0]?.value ?? null
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [playerName, setPlayerName] = useState<string | null>(null);

  const currentTranslate = useMemo(
    () => translatesList.find((t) => t.value === translateValue) ?? translatesList[0],
    [translatesList, translateValue]
  );

  const videosByDubbing = useMemo(
    () => filterVideosByTranslate(videos, currentTranslate),
    [videos, currentTranslate]
  );

  const playersList = useMemo(() => getUniquePlayers(videosByDubbing), [videosByDubbing]);

  useEffect(() => {
    if (playersList.length === 0) {
      if (playerName !== null) setPlayerName(null);
      return;
    }
    if (playerName === null || !playersList.includes(playerName)) {
      setPlayerName(playersList[0]);
    }
  }, [playersList, playerName]);

  const filteredVideos = useMemo(() => {
    if (!playerName) return videosByDubbing;
    return videosByDubbing.filter((v) => v.data?.player === playerName);
  }, [videosByDubbing, playerName]);

  useEffect(() => {
    const isStale =
      translateValue == null ||
      !translatesList.some((t) => t.value === translateValue);
    if (isStale && translatesList.length > 0) {
      setTranslateValue(translatesList[0].value);
    }
  }, [translateValue, translatesList]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [translateValue, playerName]);

  useEffect(() => {
    if (selectedIndex >= filteredVideos.length) {
      setSelectedIndex(Math.max(0, filteredVideos.length - 1));
    }
  }, [filteredVideos.length, selectedIndex]);

  const handleEpisodeComplete = useCallback(
    (videoId: number) => {
      onEpisodeComplete?.(videoId);
      setSelectedIndex((current) =>
        current + 1 < filteredVideos.length ? current + 1 : current
      );
    },
    [onEpisodeComplete, filteredVideos.length]
  );

  const currentVideo = filteredVideos[selectedIndex];

  return {
    translatesList,
    translateValue,
    setTranslateValue,
    playerName,
    setPlayerName,
    playersList,
    filteredVideos,
    selectedIndex,
    setSelectedIndex,
    currentVideo,
    handleEpisodeComplete,
  };
}
