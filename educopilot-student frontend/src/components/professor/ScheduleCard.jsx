import { X, Plus, GripVertical } from 'lucide-react'
import Button from '../ui/Button'

export default function ScheduleCard({ week, onAddTopic, onRemoveTopic }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-teal-600">Week {week.week}</p>
      <ul className="space-y-2">
        {week.topics.map((topic, index) => (
          <li key={`${topic}-${index}`} className="flex items-center gap-2 rounded-lg border border-ink-100 bg-sand-50 px-3 py-2 text-sm text-ink-700">
            <GripVertical className="size-3.5 shrink-0 cursor-grab text-ink-300" />
            <span className="flex-1">{topic}</span>
            <button
              onClick={() => onRemoveTopic?.(week.week, index)}
              className="text-ink-400 hover:text-danger-500"
              aria-label={`Remove ${topic}`}
            >
              <X className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <Button
        variant="ghost"
        size="sm"
        icon={Plus}
        className="mt-2 w-full justify-start"
        onClick={() => onAddTopic?.(week.week)}
      >
        Add topic
      </Button>
    </div>
  )
}
