import { Badge } from '@/components/ui/badge';
import { STATUS_ICONS, STATUS_LABELS, type StatusType } from '@/types/constants';

interface StatusBadgeProps {
  status: StatusType;
  showIcon?: boolean;
}

// Theme-adaptive status colors using CSS variables
const STATUS_CLASSES: Record<StatusType, string> = {
  watching: 'bg-blue-500 text-white dark:bg-blue-600',
  completed: 'bg-green-500 text-white dark:bg-green-600',
  paused: 'bg-yellow-500 text-gray-900 dark:bg-yellow-600 dark:text-gray-900',
  dropped: 'bg-red-500 text-white dark:bg-red-600',
  planned: 'bg-yellow-600 text-gray-900 dark:bg-yellow-700 dark:text-gray-900',
  favourite: 'bg-pink-500 text-white dark:bg-pink-600',
};

export function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
  return (
    <Badge title={STATUS_LABELS[status]} className={`${STATUS_CLASSES[status]} h-9 w-9 p-0 rounded-full cursor-pointer`}>
      <span className="flex items-center justify-center w-full h-full">
        {showIcon && STATUS_ICONS[status]}
      </span>
    </Badge>
  );
}