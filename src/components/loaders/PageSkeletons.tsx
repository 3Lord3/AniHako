import { Skeleton } from '@/components/ui/skeleton';

// Home page skeleton
export function HomePageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Search row */}
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-10" />
          <Skeleton className="w-24 h-10" />
        </div>
        {/* Quick filters */}
        <div className="flex gap-2">
          <Skeleton className="w-32 h-9" />
          <Skeleton className="w-28 h-9" />
        </div>
      </div>
      {/* Anime grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// Anime detail page skeleton
export function AnimeDetailPageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Poster column */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <Skeleton className="w-64 h-96 rounded-lg" />
          <div className="flex gap-2 mt-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </div>
        {/* Info column */}
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
      {/* Description card */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}

// User anime list page skeleton
export function UserAnimeListPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <Skeleton className="h-8 w-12 mx-auto mb-2" />
            <Skeleton className="h-4 w-16 mx-auto" />
          </div>
        ))}
      </div>
      {/* Filter buttons */}
      <div className="flex gap-2">
        <Skeleton className="w-24 h-10" />
        <Skeleton className="w-28 h-10" />
        <Skeleton className="w-20 h-10" />
        <Skeleton className="w-28 h-10" />
      </div>
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// Profile page skeleton
export function ProfilePageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="p-6 border rounded-lg">
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

// Login/Register page skeleton
export function AuthPageSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md p-6 border rounded-lg space-y-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}