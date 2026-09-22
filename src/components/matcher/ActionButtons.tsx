import { Button } from '@/components/ui/button';
import { TooltipWrap } from '@/components/ui/tooltip';
import { X, CalendarClock, Home, ExternalLink, Info, Loader2 } from 'lucide-react';
import { useT } from '@/i18n';

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
  const { t } = useT();
  const baseSize = 'h-16 w-16';
  const iconSkipSize = variant === 'desktop' ? 'w-10 h-10' : 'w-20 h-20 sm:w-24 sm:h-24';

  if (variant === 'mobile') {
    return (
      <div className="flex flex-col items-center gap-5 pt-3 pb-4 w-full max-w-[360px] mx-auto px-2">
        <div className="flex justify-between gap-3 w-full">
          <TooltipWrap content={t('matcher.skip')}>
            <Button
              variant="outline"
              size="lg"
              className={`${baseSize} flex-1 aspect-square rounded-full border-2 border-red-500 p-0 hover:bg-red-500/10 hover:text-red-500`}
              onClick={onSkip}
              disabled={isTransitioning || isAdding}
              aria-label={t('matcher.skip')}
            >
              <X className={iconSkipSize} style={{ color: '#ef4444' }} />
            </Button>
          </TooltipWrap>

          <TooltipWrap content={t('matcher.addToPlanned')}>
            <Button
              variant="outline"
              size="lg"
              className={`${baseSize} flex-1 aspect-square rounded-full border-2 border-green-500 p-0 hover:bg-green-500/10 hover:text-green-500`}
              onClick={onAdd}
              disabled={isTransitioning || isAdding}
              aria-label={t('matcher.addToPlanned')}
            >
              {isAdding ? (
                <Loader2 className={iconSkipSize} style={{ color: '#22c55e' }} />
              ) : (
                <CalendarClock className={iconSkipSize} style={{ color: '#22c55e' }} />
              )}
            </Button>
          </TooltipWrap>
        </div>

        <div className="flex justify-between gap-3 w-full">
          <TooltipWrap content={t('matcher.home')}>
            <Button
              variant="outline"
              size="lg"
              className={`${baseSize} flex-1 aspect-square rounded-full border-2 border-muted-foreground/30 p-0 hover:bg-muted`}
              onClick={onHome}
              aria-label={t('matcher.home')}
            >
              <Home className="w-14 h-14 sm:w-16 sm:h-16" />
            </Button>
          </TooltipWrap>

          {onExternalLink && (
            <TooltipWrap content={t('matcher.animePage')}>
              <Button
                variant="outline"
                size="lg"
                className={`${baseSize} flex-1 aspect-square rounded-full border-2 border-muted-foreground/30 p-0 hover:bg-muted`}
                onClick={onExternalLink}
                aria-label={t('matcher.animePage')}
              >
                <ExternalLink className="w-14 h-14 sm:w-16 sm:h-16" />
              </Button>
            </TooltipWrap>
          )}

          {onInfo && (
            <TooltipWrap content={t('matcher.description')}>
              <Button
                variant="outline"
                size="lg"
                className={`${baseSize} flex-1 aspect-square rounded-full border-2 border-muted-foreground/30 p-0 hover:bg-muted`}
                onClick={onInfo}
                aria-label={t('matcher.description')}
              >
                <Info className="w-14 h-14 sm:w-16 sm:h-16" />
              </Button>
            </TooltipWrap>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <TooltipWrap content={t('matcher.skip')}>
        <Button
          variant="outline"
          size="lg"
          className={`${baseSize} rounded-full border-2 border-red-500 hover:bg-red-500/10 hover:text-red-500`}
          onClick={onSkip}
          disabled={isTransitioning || isAdding}
          aria-label={t('matcher.skip')}
        >
          <X className={iconSkipSize} style={{ color: '#ef4444' }} />
        </Button>
      </TooltipWrap>
      <TooltipWrap content={t('matcher.home')}>
        <Button
          variant="outline"
          size="lg"
          className={baseSize + " rounded-full border-2 border-muted-foreground/30 hover:bg-muted"}
          onClick={onHome}
          aria-label={t('matcher.home')}
        >
          <Home className="w-10 h-10" />
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
  const { t } = useT();
  return (
    <TooltipWrap content={t('matcher.addToPlanned')}>
      <Button
        variant="outline"
        size="lg"
        className="h-16 w-16 rounded-full border-2 border-green-500 hover:bg-green-500/10 hover:text-green-500"
        onClick={onAdd}
        disabled={isTransitioning || isAdding}
        aria-label={t('matcher.addToPlanned')}
      >
        {isAdding ? (
          <Loader2 className="w-10 h-10 animate-spin text-green-500" />
        ) : (
          <CalendarClock className="w-10 h-10 text-green-500" />
        )}
      </Button>
    </TooltipWrap>
  );
}

interface ExternalLinkButtonProps {
  onClick: () => void;
}

export function ExternalLinkButton({ onClick }: ExternalLinkButtonProps) {
  const { t } = useT();
  return (
    <TooltipWrap content={t('matcher.openPage')}>
      <Button
        variant="outline"
        size="lg"
        className="h-14 w-14 rounded-full border-2 border-muted-foreground/30 hover:bg-muted"
        onClick={onClick}
        aria-label={t('matcher.openPage')}
      >
        <ExternalLink className="w-8 h-8" />
      </Button>
    </TooltipWrap>
  );
}
