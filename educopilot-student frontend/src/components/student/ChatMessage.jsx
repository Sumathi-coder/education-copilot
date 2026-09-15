import { Sparkles, User, AlertCircle } from 'lucide-react'
import SourceCard from './SourceCard'
import Badge from '../ui/Badge'

export default function ChatMessage({ message, onSourceClick }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end gap-3">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-teal-500 px-4 py-3 text-sm text-white sm:max-w-[70%]">
          {message.content}
        </div>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-500">
          <User className="size-4" aria-hidden="true" />
        </div>
      </div>
    )
  }

  const isFallback = message.confidence === 'low'

  return (
    <div className="flex gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sand-50">
        <Sparkles className="size-4" aria-hidden="true" />
      </div>
      <div className="max-w-[90%] flex-1 space-y-3 sm:max-w-[80%]">
        {isFallback ? (
          <div className="flex items-start gap-2 rounded-2xl rounded-tl-sm border border-warn-500/30 bg-warn-50 px-4 py-3 text-sm text-ink-700">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-warn-500" aria-hidden="true" />
            {message.fallbackText}
          </div>
        ) : (
          <div className="space-y-3 rounded-2xl rounded-tl-sm border border-ink-200 bg-white px-4 py-3.5">
            {message.sections?.map((section) => (
              <div key={section.heading}>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-teal-600">{section.heading}</p>
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink-800">{section.body}</p>
              </div>
            ))}
          </div>
        )}

        {!isFallback && message.sources?.length > 0 && (
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <p className="text-xs font-medium text-ink-500">Sources</p>
              <Badge tone="teal">Grounded in course material</Badge>
            </div>
            <div className="space-y-1.5">
              {message.sources.map((source) => (
                <SourceCard key={source.id} source={source} onClick={onSourceClick} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
