import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AnimeTranslate, AnimeVideo } from '@/types';
import { useEpisodeViewer } from '@/hooks/useEpisodeViewer';
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

export function EpisodeViewer({
  videos,
  translates,
  title,
  viewedVideoIds,
  onToggleWatched,
  onEpisodeComplete,
  canMarkWatched = false,
}: EpisodeViewerProps) {
  const {
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
  } = useEpisodeViewer(videos, translates, onEpisodeComplete);

  if (videos.length === 0) return null;
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
