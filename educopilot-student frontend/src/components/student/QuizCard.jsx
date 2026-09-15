import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Badge from '../ui/Badge'
import { formatDate, scoreTone } from '../../utils/formatters'

const toneBadge = { moss: 'moss', warn: 'warn', danger: 'danger' }

export default function QuizCard({ attempt }) {
  const tone = scoreTone(attempt.percent)

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-white p-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink-800">{attempt.topic}</p>
        <p className="text-xs text-ink-400">{attempt.courseName} · {formatDate(attempt.date)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Badge tone={toneBadge[tone]}>{attempt.score}/{attempt.total} · {attempt.percent}%</Badge>
        <Link
          to={`/student/quiz/${attempt.id}/result`}
          className="text-ink-400 transition-colors hover:text-teal-600"
          aria-label={`View result for ${attempt.topic}`}
        >
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  )
}
