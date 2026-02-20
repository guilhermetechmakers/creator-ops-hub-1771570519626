import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Enable shimmer effect for loading states */
  shimmer?: boolean
}

function Skeleton({ className, shimmer, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md',
        shimmer
          ? 'animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%]'
          : 'animate-pulse bg-muted',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
