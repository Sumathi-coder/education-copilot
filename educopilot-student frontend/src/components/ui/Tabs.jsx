import { cn } from '../../utils/cn'

export default function Tabs({ tabs, active, onChange, className }) {
  return (
    <div
      role="tablist"
      className={cn('flex items-center gap-1 overflow-x-auto border-b border-ink-200 scrollbar-thin', className)}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === active
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative shrink-0 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'text-teal-600' : 'text-ink-500 hover:text-ink-800',
            )}
          >
            {tab.label}
            {isActive && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-teal-500" />
            )}
          </button>
        )
      })}
    </div>
  )
}
