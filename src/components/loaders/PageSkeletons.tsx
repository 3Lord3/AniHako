import { Skeleton } from '@/components/ui/skeleton';

export function AnimeDetailPageSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-9 w-20" />
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0 flex flex-col items-center">
          <Skeleton className="w-64 h-96 rounded-lg" />
          <div className="flex gap-2 mt-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="w-full aspect-video rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="size-7 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="p-6 border border-border rounded-lg">
        <div className="flex items-center gap-6">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
    </div>
  );
}
