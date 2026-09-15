import { cn } from '../../utils/cn'

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-md bg-ink-100', className)} />
}

export function SkeletonCard({ className }) {
  return (
    <div className={cn('rounded-card border border-ink-200 bg-white p-5', className)}>
      <Skeleton className="mb-3 h-4 w-2/3" />
      <Skeleton className="mb-2 h-3 w-1/2" />
      <Skeleton className="mb-4 h-2 w-full" />
      <Skeleton className="h-8 w-24" />
    </div>
  )
}

export function SkeletonRow({ className }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Skeleton className="size-9 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/5" />
      </div>
    </div>
  )
}
