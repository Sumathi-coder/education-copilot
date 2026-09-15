import { useEffect, useRef, useState } from 'react'
import { cn } from '../../utils/cn'

export default function Dropdown({ trigger, items, align = 'right', className }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-40 mt-2 min-w-[190px] rounded-xl border border-ink-200 bg-white p-1.5 shadow-lift',
            align === 'right' ? 'right-0' : 'left-0',
            className,
          )}
        >
          {items.map((item, index) =>
            item.divider ? (
              <div key={item.key ?? `divider-${index}`} className="my-1 h-px bg-ink-100" />
            ) : (
              <button
                key={item.key ?? item.label}
                role="menuitem"
                onClick={() => {
                  item.onClick?.()
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  item.danger ? 'text-danger-600 hover:bg-danger-50' : 'text-ink-700 hover:bg-ink-50',
                )}
              >
                {item.icon && <item.icon className="size-4" aria-hidden="true" />}
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  )
}
