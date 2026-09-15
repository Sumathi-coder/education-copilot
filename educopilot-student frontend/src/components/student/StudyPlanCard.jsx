import { CheckCircle2, Circle, PlayCircle } from 'lucide-react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { cn } from '../../utils/cn'

const statusConfig = {
  completed: { label: 'Completed', tone: 'moss', icon: CheckCircle2 },
  'in-progress': { label: 'In Progress', tone: 'teal', icon: PlayCircle },
  upcoming: { label: 'Upcoming', tone: 'neutral', icon: Circle },
}

export default function StudyPlanCard({ day, onMarkComplete, onEdit }) {
  const status = statusConfig[day.status] ?? statusConfig.upcoming
  const StatusIcon = status.icon

  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-5 transition-colors',
        day.status === 'in-progress' ? 'border-teal-300 ring-1 ring-teal-100' : 'border-ink-200',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Day {day.day}</p>
          <h3 className="mt-0.5 text-base font-semibold text-brand-800">{day.topic}</h3>
        </div>
        <Badge tone={status.tone} icon={StatusIcon}>{status.label}</Badge>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium text-ink-400">Concepts</dt>
          <dd className="mt-0.5 text-ink-700">{day.concepts.join(', ')}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-ink-400">Operations</dt>
          <dd className="mt-0.5 text-ink-700">{day.operations.join(', ')}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-ink-400">Complexity</dt>
          <dd className="mt-0.5 text-ink-700">{day.complexity}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-ink-400">Practice</dt>
          <dd className="mt-0.5 text-ink-700">{day.practice}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center gap-2">
        {day.status !== 'completed' && (
          <Button size="sm" variant="secondary" onClick={() => onMarkComplete?.(day.day)}>
            Mark Complete
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => onEdit?.(day.day)}>
          Edit
        </Button>
      </div>
    </div>
  )
}
