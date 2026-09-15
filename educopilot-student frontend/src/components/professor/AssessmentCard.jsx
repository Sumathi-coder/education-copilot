import { Link } from 'react-router-dom'
import { Eye, Pencil, Copy, Trash2, Clock, ListChecks, Users, TrendingUp, Send, CalendarClock } from 'lucide-react'
import Card, { CardBody } from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

const statusTone = { active: 'moss', draft: 'neutral', completed: 'teal' }

export default function AssessmentCard({ assessment, onDuplicate, onDelete, onPublish }) {
  return (
    <Card>
      <CardBody>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <p className="font-medium text-brand-800">{assessment.name}</p>
              <Badge tone={statusTone[assessment.status] ?? 'neutral'}>{assessment.status ?? 'draft'}</Badge>
            </div>
            <p className="text-xs text-ink-400">{assessment.courseName} · {assessment.type}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button as={Link} to={`/professor/submissions?assessment=${assessment.id}`} variant="ghost" size="sm" icon={Eye} aria-label="View" />
            <Button variant="ghost" size="sm" icon={Pencil} aria-label="Edit" />
            {assessment.status === 'draft' && <Button variant="secondary" size="sm" icon={Send} onClick={() => onPublish?.(assessment)}>Publish</Button>}
            <Button variant="ghost" size="sm" icon={Copy} aria-label="Duplicate" onClick={() => onDuplicate?.(assessment)} />
            <Button variant="ghost" size="sm" icon={Trash2} aria-label="Delete" onClick={() => onDelete?.(assessment)} />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink-500">
          <span className="flex items-center gap-1.5"><ListChecks className="size-3.5" /> {Array.isArray(assessment.questions) ? assessment.questions.length : Number(assessment.questions) || 0} questions · {assessment.totalMarks ?? (Array.isArray(assessment.questions) ? assessment.questions.reduce((sum, q) => sum + (Number(q.marks ?? q.mark ?? 1) || 1), 0) : 0)} marks</span>
          {assessment.duration && <span className="flex items-center gap-1.5"><Clock className="size-3.5" /> {assessment.duration} min</span>}
          {assessment.dueDate && <span className="flex items-center gap-1.5"><CalendarClock className="size-3.5" /> Due {new Date(assessment.dueDate).toLocaleString()}</span>}
          <span className="flex items-center gap-1.5"><Users className="size-3.5" /> {assessment.attempts ?? 0} attempts</span>
          {assessment.avgScore !== null && (
            <span className="flex items-center gap-1.5"><TrendingUp className="size-3.5" /> {assessment.avgScore}% avg</span>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
