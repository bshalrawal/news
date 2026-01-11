
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  className?: string;
  starClassName?: string;
}

export function StarRating({ rating, className, starClassName }: StarRatingProps) {
  const clampedRating = Math.max(0, Math.min(5, rating || 0));

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[...Array(5)].map((_, i) => {
        const starValue = i + 1;
        const fillPercentage = Math.max(0, Math.min(100, (clampedRating - i) * 100));

        return (
          <div key={i} className="relative">
            <Star className={cn("h-5 w-5 text-gray-300 dark:text-gray-600", starClassName)} fill="currentColor" />
            <div
              className="absolute top-0 left-0 h-full overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <Star className={cn("h-5 w-5 text-yellow-400", starClassName)} fill="currentColor" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
