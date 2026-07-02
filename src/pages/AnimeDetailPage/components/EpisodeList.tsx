import { useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AnimeVideo } from '@/types';

interface EpisodeListProps {
  videos: AnimeVideo[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function EpisodeList({ videos, selectedIndex, onSelect }: EpisodeListProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const setButtonRef = useCallback(
    (idx: number) => (el: HTMLButtonElement | null) => {
      buttonRefs.current[idx] = el;
    },
    []
  );

  useEffect(() => {
    const btn = buttonRefs.current[selectedIndex];
    if (btn) {
      btn.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  useEffect(() => {
    return () => {
      buttonRefs.current = [];
    };
  }, []);

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin"
      role="tablist"
      aria-label="Список серий"
    >
      {videos.map((video, idx) => {
        const label = video.number || String(video.index);
        const isActive = idx === selectedIndex;
        return (
          <Button
            key={video.video_id}
            ref={setButtonRef(idx)}
            role="tab"
            aria-selected={isActive}
            variant={isActive ? 'default' : 'outline'}
            size="icon-sm"
            onClick={() => onSelect(idx)}
            className={cn('cursor-pointer shrink-0', isActive && 'font-semibold')}
            aria-label={`Серия ${label}`}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
}
