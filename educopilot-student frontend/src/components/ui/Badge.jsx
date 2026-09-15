import { cn } from '../../utils/cn'

const tones = {
  neutral: 'bg-ink-100 text-ink-700',
  brand: 'bg-brand-100 text-brand-700',
  teal: 'bg-teal-100 text-teal-700',
  moss: 'bg-moss-100 text-moss-700',
  rosy: 'bg-rosy-100 text-rosy-700',
  danger: 'bg-danger-50 text-danger-600',
  warn: 'bg-warn-50 text-warn-500',
}

export default function Badge({ tone = 'neutral', className, children, icon: Icon, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="size-3" aria-hidden="true" />}
      {children}
    </span>
  )
}
