import { Badge } from '@/components/ui/badge';
import { TooltipWrap } from '@/components/ui/tooltip';
import { STATUS_ICONS, STATUS_COLORS, STATUS_LABELS, type StatusType } from '@/types/constants';

interface StatusBadgeProps {
  status: StatusType;
  showIcon?: boolean;
}

export function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
  const label = STATUS_LABELS[status];
  return (
    <TooltipWrap content={label}>
      <Badge aria-label={label} className={`${STATUS_COLORS[status]} h-9 w-9 p-0 rounded-full cursor-pointer`}>
        <span className="flex items-center justify-center w-full h-full">
          {showIcon && STATUS_ICONS[status]}
        </span>
      </Badge>
    </TooltipWrap>
  );
}
