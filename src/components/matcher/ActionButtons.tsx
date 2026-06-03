import { Button } from '@/components/ui/button';
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
  const baseSize = variant === 'desktop' ? 'h-16 w-16' : 'h-14 w-14';
  const iconSkipSize = variant === 'desktop' ? 'w-8 h-8' : 'w-6 h-6';
  
  if (variant === 'mobile') {
    return (
      <div className="flex flex-col items-center gap-4 pb-4">
        <div className="flex justify-center gap-8">
          <Button
            variant="outline"
            size="lg"
            className={`${baseSize} rounded-full border-2 border-red-500 hover:bg-red-500/10 hover:text-red-500`}
            onClick={onSkip}
            disabled={isTransitioning || isAdding}
            title="Пропустить"
          >
            <X className={iconSkipSize} style={{ color: '#ef4444' }} />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className={`${baseSize} rounded-full border-2 border-green-500 hover:bg-green-500/10 hover:text-green-500`}
            onClick={onAdd}
            disabled={isTransitioning || isAdding}
            title="В запланированное"
          >
            {isAdding ? (
              <Loader2 className={iconSkipSize} style={{ color: '#22c55e' }} />
            ) : (
              <CalendarClock className={iconSkipSize} style={{ color: '#22c55e' }} />
            )}
          </Button>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            className={baseSize + " rounded-full border-2 border-muted-foreground/30 hover:bg-muted"}
            onClick={onHome}
            title="На главную"
          >
            <Home className="w-6 h-6" />
          </Button>
          
          {onExternalLink && (
            <Button
              variant="outline"
              size="lg"
              className={baseSize + " rounded-full border-2 border-muted-foreground/30 hover:bg-muted"}
              onClick={onExternalLink}
              title="Страница аниме"
            >
              <ExternalLink className="w-6 h-6" />
            </Button>
          )}
          
          {onInfo && (
            <Button 
              variant="outline"
              size="lg"
              className={baseSize + " rounded-full border-2 border-muted-foreground/30 hover:bg-muted"}
              onClick={onInfo}
              title="Описание"
            >
              <Info className="w-6 h-6" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <Button
        variant="outline"
        size="lg"
        className={`${baseSize} rounded-full border-2 border-red-500 hover:bg-red-500/10 hover:text-red-500`}
        onClick={onSkip}
        disabled={isTransitioning || isAdding}
        title="Пропустить"
      >
        <X className={iconSkipSize} style={{ color: '#ef4444' }} />
      </Button>
      <Button
        variant="outline"
        size="lg"
        className={baseSize + " rounded-full border-2 border-muted-foreground/30 hover:bg-muted"}
        onClick={onHome}
        title="На главную"
      >
        <Home className="w-6 h-6" />
      </Button>
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
    <Button
      variant="outline"
      size="lg"
      className="h-16 w-16 rounded-full border-2 border-green-500 hover:bg-green-500/10 hover:text-green-500"
      onClick={onAdd}
      disabled={isTransitioning || isAdding}
      title="В запланированное"
    >
      {isAdding ? (
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      ) : (
        <CalendarClock className="w-8 h-8 text-green-500" />
      )}
    </Button>
  );
}

interface ExternalLinkButtonProps {
  onClick: () => void;
}

export function ExternalLinkButton({ onClick }: ExternalLinkButtonProps) {
  return (
    <Button
      variant="outline"
      size="lg"
      className="h-14 w-14 rounded-full border-2 border-muted-foreground/30 hover:bg-muted"
      onClick={onClick}
      title="Открыть страницу аниме"
    >
      <ExternalLink className="w-6 h-6" />
    </Button>
  );
}
