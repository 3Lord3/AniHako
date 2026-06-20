import { Button } from '@/components/ui/button';
import { TooltipWrap } from '@/components/ui/tooltip';
import { X, CalendarClock, Home, ExternalLink, Info, Loader2 } from 'lucide-react';

interface ActionButtonsProps {
  isTransitioning: boolean;
  isAdding: boolean;
  onSkip: () => void;
  onAdd: () => void;
  onHome: () => void;
  onExternalLink?: () => void;
  onInfo?: () => void;
  variant?: 'desktop' | 'mobile';
}

export function ActionButtons({
  isTransitioning,
  isAdding,
  onSkip,
  onAdd,
  onHome,
  onExternalLink,
  onInfo,
  variant = 'desktop',
}: ActionButtonsProps) {
  const baseSize = 'h-16 w-16';
  const iconSkipSize = variant === 'desktop' ? 'w-8 h-8' : 'w-7 h-7';

  if (variant === 'mobile') {
    return (
      <div className="flex flex-col items-center gap-5 pt-3 pb-4 w-full max-w-[360px] mx-auto px-2">
        <div className="flex justify-between w-full">
          <TooltipWrap content="Пропустить">
            <Button
              variant="outline"
              size="lg"
              className={`${baseSize} rounded-full border-2 border-red-500 hover:bg-red-500/10 hover:text-red-500`}
              onClick={onSkip}
              disabled={isTransitioning || isAdding}
              aria-label="Пропустить"
            >
              <X className={iconSkipSize} style={{ color: '#ef4444' }} />
            </Button>
          </TooltipWrap>

          <TooltipWrap content="В запланированное">
            <Button
              variant="outline"
              size="lg"
              className={`${baseSize} rounded-full border-2 border-green-500 hover:bg-green-500/10 hover:text-green-500`}
              onClick={onAdd}
              disabled={isTransitioning || isAdding}
              aria-label="В запланированное"
            >
              {isAdding ? (
                <Loader2 className={iconSkipSize} style={{ color: '#22c55e' }} />
              ) : (
                <CalendarClock className={iconSkipSize} style={{ color: '#22c55e' }} />
              )}
            </Button>
          </TooltipWrap>
        </div>

        <div className="flex justify-between w-full">
          <TooltipWrap content="На главную">
            <Button
              variant="outline"
              size="lg"
              className={baseSize + " rounded-full border-2 border-muted-foreground/30 hover:bg-muted"}
              onClick={onHome}
              aria-label="На главную"
            >
              <Home className="w-6 h-6" />
            </Button>
          </TooltipWrap>

          {onExternalLink && (
            <TooltipWrap content="Страница аниме">
              <Button
                variant="outline"
                size="lg"
                className={baseSize + " rounded-full border-2 border-muted-foreground/30 hover:bg-muted"}
                onClick={onExternalLink}
                aria-label="Страница аниме"
              >
                <ExternalLink className="w-6 h-6" />
              </Button>
            </TooltipWrap>
          )}

          {onInfo && (
            <TooltipWrap content="Описание">
              <Button
                variant="outline"
                size="lg"
                className={baseSize + " rounded-full border-2 border-muted-foreground/30 hover:bg-muted"}
                onClick={onInfo}
                aria-label="Описание"
              >
                <Info className="w-6 h-6" />
              </Button>
            </TooltipWrap>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <TooltipWrap content="Пропустить">
        <Button
          variant="outline"
          size="lg"
          className={`${baseSize} rounded-full border-2 border-red-500 hover:bg-red-500/10 hover:text-red-500`}
          onClick={onSkip}
          disabled={isTransitioning || isAdding}
          aria-label="Пропустить"
        >
          <X className={iconSkipSize} style={{ color: '#ef4444' }} />
        </Button>
      </TooltipWrap>
      <TooltipWrap content="На главную">
        <Button
          variant="outline"
          size="lg"
          className={baseSize + " rounded-full border-2 border-muted-foreground/30 hover:bg-muted"}
          onClick={onHome}
          aria-label="На главную"
        >
          <Home className="w-6 h-6" />
        </Button>
      </TooltipWrap>
    </div>
  );
}

interface AddButtonProps {
  isTransitioning: boolean;
  isAdding: boolean;
  onAdd: () => void;
}

export function AddButton({ isTransitioning, isAdding, onAdd }: AddButtonProps) {
  return (
    <TooltipWrap content="В запланированное">
      <Button
        variant="outline"
        size="lg"
        className="h-16 w-16 rounded-full border-2 border-green-500 hover:bg-green-500/10 hover:text-green-500"
        onClick={onAdd}
        disabled={isTransitioning || isAdding}
        aria-label="В запланированное"
      >
        {isAdding ? (
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        ) : (
          <CalendarClock className="w-8 h-8 text-green-500" />
        )}
      </Button>
    </TooltipWrap>
  );
}

interface ExternalLinkButtonProps {
  onClick: () => void;
}

export function ExternalLinkButton({ onClick }: ExternalLinkButtonProps) {
  return (
    <TooltipWrap content="Открыть страницу аниме">
      <Button
        variant="outline"
        size="lg"
        className="h-14 w-14 rounded-full border-2 border-muted-foreground/30 hover:bg-muted"
        onClick={onClick}
        aria-label="Открыть страницу аниме"
      >
        <ExternalLink className="w-6 h-6" />
      </Button>
    </TooltipWrap>
  );
}
