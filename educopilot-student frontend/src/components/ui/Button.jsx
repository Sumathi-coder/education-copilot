import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

const variants = {
  primary:
    'bg-teal-500 text-sand-50 hover:bg-teal-600 active:bg-teal-700 shadow-soft disabled:bg-ink-200 disabled:text-ink-400',
  secondary:
    'bg-white text-brand-700 border border-ink-200 hover:border-teal-300 hover:text-teal-600 disabled:text-ink-300',
  ghost:
    'bg-transparent text-ink-700 hover:bg-ink-50 disabled:text-ink-300',
  danger:
    'bg-danger-500 text-white hover:bg-danger-600 disabled:bg-ink-200',
}

const sizes = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
}

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className,
  children,
  disabled,
  ...props
}) {
  return (
    <Component
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150',
        'disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="size-4" aria-hidden="true" />
      )}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className="size-4" aria-hidden="true" />}
    </Component>
  )
}
