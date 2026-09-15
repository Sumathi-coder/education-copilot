import { FileText, ExternalLink } from 'lucide-react'

export default function SourceCard({ source, onClick }) {
  return (
    <button
      onClick={() => onClick?.(source)}
      className="flex w-full items-center gap-3 rounded-lg border border-ink-200 bg-sand-50 p-3 text-left transition-colors hover:border-teal-300 hover:bg-teal-50/50"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-teal-600 shadow-soft">
        <FileText className="size-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-800">{source.title}</p>
        {source.page && <p className="text-xs text-ink-400">Page {source.page}</p>}
      </div>
      <ExternalLink className="size-3.5 shrink-0 text-ink-300" aria-hidden="true" />
    </button>
  )
}
