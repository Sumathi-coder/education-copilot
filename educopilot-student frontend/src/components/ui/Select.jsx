import { forwardRef, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'

const Select = forwardRef(function Select(
  { label, error, hint, options = [], placeholder, className, id, ...props },
  ref,
) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'h-10 w-full appearance-none rounded-lg border border-ink-200 bg-white px-3 pr-9 text-sm text-ink-900',
            'transition-colors focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100',
            error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-50',
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
      </div>
      {error && <p className="mt-1.5 text-xs text-danger-500">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>}
    </div>
  )
})

export default Select
