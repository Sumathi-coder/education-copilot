import { Link } from 'react-router-dom'
import { Users, TrendingUp, ArrowRight, BookOpen, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Dropdown from '../ui/Dropdown'

const iconStyles = {
  teal: 'bg-teal-100 text-teal-700',
  moss: 'bg-moss-100 text-moss-700',
  rosy: 'bg-rosy-100 text-rosy-700',
  brand: 'bg-brand-100 text-brand-700',
}

export default function ProfessorCourseCard({ course, onDelete }) {
  const tone = ['teal', 'moss', 'rosy', 'brand'].includes(course.color) ? course.color : 'teal'

  return (
    <Card interactive className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div className="flex items-start gap-3">
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconStyles[tone]}`}>
            <BookOpen className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-medium text-brand-800">{course.name}</p>
            <p className="text-xs text-ink-500">{course.code} · {course.semester}</p>
          </div>
        </div>
        <Dropdown
          align="right"
          trigger={
            <button className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-50" aria-label="Course options">
              <MoreVertical className="size-4" />
            </button>
          }
          items={[
            { key: 'edit', label: 'Edit', icon: Pencil, onClick: () => {} },
            { key: 'delete', label: 'Delete', icon: Trash2, danger: true, onClick: () => onDelete?.(course) },
          ]}
        />
      </div>

      <div className="flex-1 space-y-2.5 px-5">
        <div className="flex items-center gap-1.5 text-sm text-ink-600">
          <Users className="size-3.5 text-ink-400" />
          {course.studentCount} Students
        </div>
        <div className="flex items-center gap-1.5 text-sm text-ink-600">
          <TrendingUp className="size-3.5 text-ink-400" />
          {course.avgScore}% avg score · {course.completionRate}% completion
        </div>
      </div>

      <div className="p-5 pt-4">
        <Button as={Link} to={`/professor/courses/${course.id}`} variant="secondary" size="sm" icon={ArrowRight} iconPosition="right" className="w-full">
          Manage
        </Button>
      </div>
    </Card>
  )
}
