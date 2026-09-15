import { cn } from '../../utils/cn'

export default function Card({ as: Component = 'div', className, children, interactive = false, ...props }) {
  return (
    <Component
      className={cn(
        'rounded-card border border-ink-200 bg-white',
        interactive && 'transition-all duration-150 hover:border-teal-200 hover:shadow-soft',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('flex items-start justify-between gap-3 border-b border-ink-100 p-5', className)} {...props}>
      {children}
    </div>
  )
}

export function CardBody({ className, children, ...props }) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn('flex items-center justify-between gap-3 border-t border-ink-100 p-5', className)} {...props}>
      {children}
    </div>
  )
}
