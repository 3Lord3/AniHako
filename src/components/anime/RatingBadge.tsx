import { Star } from 'lucide-react';
import { TooltipWrap } from '@/components/ui/tooltip';
import { getRatingColor } from '@/types/constants';

interface RatingBadgeProps {
  rating: number;
}

export function RatingBadge({ rating }: RatingBadgeProps) {
  const validRating = typeof rating === 'number' && !isNaN(rating);

  if (!validRating) {
    return null;
  }

  const label = `Рейтинг: ${rating.toFixed(1)}`;

  return (
    <TooltipWrap content={label}>
      <div aria-label={label} className={`${getRatingColor(rating)} h-9 px-1.5 rounded flex items-center gap-0.5 cursor-pointer`}>
        <Star className="w-4 h-4 fill-white text-white" />
        <span className="text-sm font-bold text-white">
          {rating.toFixed(1)}
        </span>
      </div>
    </TooltipWrap>
  );
}
