import { Skeleton } from '@/components/ui/skeleton';

interface AnimeCardSkeletonProps {
  showRating?: boolean;
}

export function AnimeCardSkeleton({ showRating = true }: AnimeCardSkeletonProps) {
  return (
    <div className="group block">
      <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
        <Skeleton className="w-full h-full" />
        {showRating && (
          <div className="absolute top-2 right-2">
            <Skeleton className="h-9 w-12 rounded" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-12">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function CarouselSkeleton() {
  return (
    <div className="flex gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <AnimeCardSkeleton key={i} showRating={false} />
      ))}
    </div>
  );
}

export function ScheduleSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-16 rounded-md" />
        ))}
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="border-b border-border p-4">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20 hidden md:block" />
            <Skeleton className="h-4 w-24 hidden lg:block" />
            <Skeleton className="h-4 w-20 hidden sm:block" />
          </div>
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border-b border-border last:border-b-0 p-4">
            <div className="flex gap-4 items-center">
              <div className="flex gap-3 items-center flex-1">
                <Skeleton className="w-10 h-14 rounded" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-4 w-16 hidden md:block" />
              <Skeleton className="h-4 w-20 hidden lg:block" />
              <Skeleton className="h-4 w-16 hidden sm:block" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}