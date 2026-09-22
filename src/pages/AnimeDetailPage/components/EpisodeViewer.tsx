import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AnimeTranslate, AnimeVideo } from '@/types';
import { useEpisodeViewer } from '@/hooks/useEpisodeViewer';
import { EpisodePlayer } from './EpisodePlayer';
import { EpisodeList } from './EpisodeList';
import { PlayerSelector } from './PlayerSelector';
import { TranslateSelector } from './TranslateSelector';
import { useT } from '@/i18n';

interface EpisodeViewerProps {
  videos: AnimeVideo[];
  translates?: AnimeTranslate[];
  title: string;
  viewedEpisodeNumbers?: Set<string>;
  onToggleWatched?: (video: AnimeVideo, isWatched: boolean) => void;
  onEpisodeComplete?: (video: AnimeVideo) => void;
  canMarkWatched?: boolean;
}

export function EpisodeViewer({
  videos,
  translates,
  title,
  viewedEpisodeNumbers,
  onToggleWatched,
  onEpisodeComplete,
  canMarkWatched = false,
}: EpisodeViewerProps) {
  const { t } = useT();
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
        <CardTitle className="select-text">{t('episodes.viewerTitle')}</CardTitle>
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
            viewedEpisodeNumbers={viewedEpisodeNumbers}
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
