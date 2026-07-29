interface SkeletonProps {
  className?: string;
}

function SkeletonBox({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-200 rounded-2xl ${className}`}
      aria-hidden="true"
    />
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-[3.5rem] border border-slate-100 overflow-hidden shadow-sm">
      <SkeletonBox className="h-72 w-full rounded-none" />
      <div className="p-10 space-y-5">
        <SkeletonBox className="h-4 w-32" />
        <SkeletonBox className="h-7 w-48" />
        <div className="flex items-end justify-between pt-4">
          <div>
            <SkeletonBox className="h-3 w-20 mb-2" />
            <SkeletonBox className="h-8 w-36" />
          </div>
          <SkeletonBox className="w-14 h-14 rounded-[1.25rem]" />
        </div>
      </div>
    </div>
  );
}

export function PropertyDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto pb-20">
      <SkeletonBox className="h-6 w-40 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-8">
          <SkeletonBox className="h-[450px] rounded-[3.5rem]" />
          <SkeletonBox className="h-64 rounded-[3.5rem]" />
          <SkeletonBox className="h-80 rounded-[3.5rem]" />
        </div>
        <div className="lg:col-span-2">
          <SkeletonBox className="h-[600px] rounded-[3.5rem]" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <SkeletonBox className="h-10 w-64 mb-2" />
          <SkeletonBox className="h-5 w-96" />
        </div>
        <SkeletonBox className="h-16 w-64 rounded-[2rem]" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SkeletonBox className="h-40 rounded-[3rem]" />
            <SkeletonBox className="h-40 rounded-[3rem]" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SkeletonBox key={i} className="h-28 rounded-[2.5rem]" />
            ))}
          </div>
        </div>
        <SkeletonBox className="h-64 rounded-[3.5rem]" />
      </div>
    </div>
  );
}

export function TrendsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-12">
        <SkeletonBox className="h-10 w-64 mb-2" />
        <SkeletonBox className="h-5 w-80" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <SkeletonBox className="h-48 rounded-[3.5rem]" />
        <SkeletonBox className="h-48 rounded-[3.5rem]" />
        <SkeletonBox className="h-48 rounded-[3.5rem]" />
      </div>
      <SkeletonBox className="h-[400px] rounded-[3.5rem]" />
    </div>
  );
}

export { SkeletonBox };
