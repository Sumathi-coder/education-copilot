import { createPortal } from 'react-dom'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '../../utils/cn'

const variantConfig = {
  default: { icon: Info, classes: 'border-ink-200 bg-white text-ink-800' },
  success: { icon: CheckCircle2, classes: 'border-moss-200 bg-moss-50 text-moss-800' },
  error: { icon: AlertCircle, classes: 'border-danger-500/30 bg-danger-50 text-danger-600' },
}

export default function ToastViewport({ toasts, onDismiss }) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
      {toasts.map((toast) => {
        const config = variantConfig[toast.variant] ?? variantConfig.default
        const Icon = config.icon
        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-start gap-2.5 rounded-xl border p-3.5 shadow-lift animate-[toast-in_0.18s_ease-out]',
              config.classes,
            )}
          >
            <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p className="flex-1 text-sm leading-snug">{toast.message}</p>
            <button
              onClick={() => onDismiss(toast.id)}
              className="mt-0.5 text-current opacity-60 transition-opacity hover:opacity-100"
              aria-label="Dismiss notification"
            >
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>,
    document.body,
  )
}
