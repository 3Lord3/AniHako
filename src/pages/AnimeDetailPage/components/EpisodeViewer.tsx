import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AnimeTranslate, AnimeVideo } from '@/types';
import { EpisodePlayer } from './EpisodePlayer';
import { EpisodeList } from './EpisodeList';
import { PlayerSelector } from './PlayerSelector';
import { TranslateSelector } from './TranslateSelector';

interface EpisodeViewerProps {
  videos: AnimeVideo[];
  translates?: AnimeTranslate[];
  title: string;
  viewedVideoIds?: Set<number>;
  onToggleWatched?: (videoId: number, isWatched: boolean) => void;
  onEpisodeComplete?: (videoId: number) => void;
  canMarkWatched?: boolean;
}

const PLAYER_PRIORITY = ['Kodik', 'CVH', 'Alloha'];

const GENERIC_TRANSLATE_TITLES = new Set(['Многоголосый', 'Одноголосый', 'Двухголосый', 'Субтитры']);

function filterVideosByTranslate(videos: AnimeVideo[], translate: AnimeTranslate | undefined): AnimeVideo[] {
  if (!translate) return videos;
  const filtered = videos.filter((v) => v.data?.dubbing === translate.title);
  return filtered.length > 0 ? filtered : videos;
}

function synthesizeTranslatesFromVideos(videos: AnimeVideo[]): AnimeTranslate[] {
  const seen = new Set<string>();
  const result: AnimeTranslate[] = [];
  for (const v of videos) {
    const dubbing = v.data?.dubbing;
    if (!dubbing || seen.has(dubbing)) continue;
    seen.add(dubbing);
    result.push({ title: dubbing, href: dubbing.toLowerCase().replace(/\s+/g, '-'), value: result.length + 1 });
  }
  return result;
}

function isGenericTranslateTitle(title: string): boolean {
  return GENERIC_TRANSLATE_TITLES.has(title);
}

function filterGenericTranslates(translates: AnimeTranslate[]): AnimeTranslate[] {
  return translates.filter((t) => !isGenericTranslateTitle(t.title));
}

function comparePlayersByPriority(a: string, b: string): number {
  const ia = PLAYER_PRIORITY.findIndex((p) => a.toLowerCase().includes(p.toLowerCase()));
  const ib = PLAYER_PRIORITY.findIndex((p) => b.toLowerCase().includes(p.toLowerCase()));
  const ra = ia === -1 ? PLAYER_PRIORITY.length : ia;
  const rb = ib === -1 ? PLAYER_PRIORITY.length : ib;
  if (ra !== rb) return ra - rb;
  return a.localeCompare(b);
}

function getUniquePlayers(videos: AnimeVideo[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const v of videos) {
    const player = v.data?.player;
    if (!player || seen.has(player)) continue;
    seen.add(player);
    result.push(player);
  }
  return result.sort(comparePlayersByPriority);
}

export function EpisodeViewer({
  videos,
  translates,
  title,
  viewedVideoIds,
  onToggleWatched,
  onEpisodeComplete,
  canMarkWatched = false,
}: EpisodeViewerProps) {
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

  if (videos.length === 0) return null;

  const currentVideo = filteredVideos[selectedIndex];
  if (!currentVideo) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="select-text">Просмотр</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PlayerSelector
          players={playersList}
          value={playerName}
          onChange={setPlayerName}
        />
        <TranslateSelector
          translates={translatesList}
          value={translateValue}
          onChange={setTranslateValue}
        />
        {filteredVideos.length > 1 && (
          <EpisodeList
            videos={filteredVideos}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            viewedVideoIds={viewedVideoIds}
            onToggleWatched={onToggleWatched}
            canMarkWatched={canMarkWatched}
          />
        )}
        <EpisodePlayer
          video={currentVideo}
          title={title}
          onEpisodeComplete={handleEpisodeComplete}
        />
      </CardContent>
    </Card>
  );
}
