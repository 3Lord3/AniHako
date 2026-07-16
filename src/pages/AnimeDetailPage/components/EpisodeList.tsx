import { useCallback, useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AnimeVideo } from '@/types';

interface EpisodeListProps {
  videos: AnimeVideo[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  viewedVideoIds?: Set<number>;
  onToggleWatched?: (videoId: number, isWatched: boolean) => void;
  canMarkWatched?: boolean;
}

export function EpisodeList({
  videos,
  selectedIndex,
  onSelect,
  viewedVideoIds,
  onToggleWatched,
  canMarkWatched = false,
}: EpisodeListProps) {
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

  const handleTablistKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    // ARIA tabs pattern: ArrowLeft/Right move between tabs and select them.
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return;
    const active = e.currentTarget.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (!active) return;
    const tabs = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]')
    );
    const currentIdx = tabs.indexOf(active);
    if (currentIdx === -1) return;
    let nextIdx = currentIdx;
    if (e.key === 'ArrowLeft') nextIdx = Math.max(0, currentIdx - 1);
    else if (e.key === 'ArrowRight') nextIdx = Math.min(tabs.length - 1, currentIdx + 1);
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = tabs.length - 1;
    if (nextIdx !== currentIdx) {
      e.preventDefault();
      onSelect(nextIdx);
      tabs[nextIdx]?.focus();
    }
  };

  return (
    // `pt-2.5` makes room for the desktop dot that overflows the top of the
    // tab button. Without it, the indicator gets clipped by the parent's
    // `overflow-x: auto` (which also implies `overflow-y: auto` per CSS spec).
    <div
      className="flex gap-1.5 overflow-x-auto pt-2.5 pb-2 -mx-1 px-1 scrollbar-thin"
      role="tablist"
      aria-label="Список серий"
      onKeyDown={handleTablistKeyDown}
    >
      {videos.map((video, idx) => {
        const label = video.number || String(video.index);
        const isActive = idx === selectedIndex;
        const isWatched = !!viewedVideoIds?.has(video.video_id);
        const showToggle = canMarkWatched && !!onToggleWatched;

        const handleToggle = () => {
          onToggleWatched?.(video.video_id, isWatched);
        };

        return (
          <div
            key={video.video_id}
            className="relative shrink-0 flex items-center gap-1.5 md:block"
          >
            {showToggle && (
              <button
                type="button"
                role="checkbox"
                aria-checked={isWatched}
                aria-label={
                  isWatched
                    ? `Снять отметку с серии ${label}`
                    : `Отметить серию ${label} как просмотренную`
                }
                onClick={handleToggle}
                className={cn(
                  // Mobile: standalone button to the left of the tab.
                  'inline-flex items-center justify-center size-9 rounded-md border-2',
                  // Desktop: absolute dot in the tab's top-right corner.
                  'md:absolute md:-top-1.5 md:-right-1.5 md:size-4 md:rounded-full',
                  // Generous hit-area for the small desktop dot.
                  'md:before:absolute md:before:inset-[-6px] md:before:content-[""]',
                  isWatched
                    ? isActive
                      // Watched + active on mobile: invert to white fill /
                      // primary text (matches the active tab button). On
                      // desktop: keep the solid primary dot. The `!` prefix
                      // is needed to win against the surrounding variant
                      // classes whose source order isn't guaranteed.
                      ? '!bg-primary-foreground !text-primary border-primary md:!bg-primary md:!text-primary-foreground md:border-0'
                      // Watched, not active: solid primary with no border.
                      : 'bg-primary border-transparent text-primary-foreground'
                    // Unwatched: outlined.
                    : 'bg-background border-muted-foreground/50 hover:border-primary'
                )}
                data-testid={`episode-watched-toggle-${video.video_id}`}
              >
                {/* Checkmark visible only on the mobile-sized button. Inherits
                    its color from the button (text-primary on white mobile,
                    text-primary-foreground on primary). */}
                {isWatched && (
                  <Check
                    className="size-4 md:hidden text-foreground"
                    strokeWidth={3}
                  />
                )}
              </button>
            )}
            <Button
              ref={setButtonRef(idx)}
              role="tab"
              aria-selected={isActive}
              variant={isActive ? 'default' : 'outline'}
              size="icon"
              onClick={() => onSelect(idx)}
              className={cn(
                'cursor-pointer h-9 w-9',
                isActive && isWatched &&
                  // Active + watched: invert to a white fill with primary
                  // text. The `!` prefix is required to override the
                  // `bg-primary` / `text-primary-foreground` set by
                  // variant="default", whose CSS source order is not
                  // guaranteed to win against these utilities.
                  '!bg-primary-foreground !text-primary hover:!bg-primary-foreground/90',
                isActive && !isWatched && 'font-semibold',
                isWatched && !isActive && 'opacity-70'
              )}
              aria-label={`Серия ${label}${isWatched ? ', просмотрена' : ''}`}
            >
              {label}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
