import { AlertTriangle } from 'lucide-react'
import Button from './Button'
import { cn } from '../../utils/cn'

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-ink-200 bg-sand-50 px-6 py-14 text-center', className)}>
      {Icon && (
        <div className="flex size-12 items-center justify-center rounded-full bg-white text-ink-400 shadow-soft">
          <Icon className="size-5" aria-hidden="true" />
        </div>
      )}
      <div>
        <p className="font-medium text-ink-800">{title}</p>
        {description && <p className="mx-auto mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', description, onRetry, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-card border border-danger-500/20 bg-danger-50 px-6 py-14 text-center', className)}>
      <div className="flex size-12 items-center justify-center rounded-full bg-white text-danger-500 shadow-soft">
        <AlertTriangle className="size-5" aria-hidden="true" />
      </div>
      <div>
        <p className="font-medium text-danger-600">{title}</p>
        {description && <p className="mx-auto mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
