import { cn } from '../../utils/cn'

const tones = {
  teal: 'bg-teal-500',
  moss: 'bg-moss-500',
  rosy: 'bg-rosy-400',
  brand: 'bg-brand-600',
  danger: 'bg-danger-500',
}

export default function ProgressBar({ value = 0, tone = 'teal', size = 'md', label, className }) {
  const clamped = Math.min(100, Math.max(0, value))
  const height = size === 'sm' ? 'h-1.5' : 'h-2'

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-ink-500">
          <span>{label}</span>
          <span className="font-medium text-ink-700">{clamped}%</span>
        </div>
      )}
      <div
        className={cn('w-full overflow-hidden rounded-full bg-ink-100', height)}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-500 ease-out', tones[tone])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
