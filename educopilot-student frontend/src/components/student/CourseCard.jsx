import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen } from 'lucide-react'
import Card from '../ui/Card'
import ProgressBar from '../ui/ProgressBar'
import Button from '../ui/Button'


const iconStyles = {
  teal: 'bg-teal-100 text-teal-700',
  moss: 'bg-moss-100 text-moss-700',
  rosy: 'bg-rosy-100 text-rosy-700',
  brand: 'bg-brand-100 text-brand-700',
}

export default function CourseCard({ course, compact = false }) {
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
            <p className="text-xs text-ink-500">{course.code} · {course.professor}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-5">
        <ProgressBar value={course.progress} tone={tone} label="Progress" />

      </div>

      <div className="p-5 pt-4">
        <Button as={Link} to={`/student/courses/${course.id}`} variant="secondary" size="sm" icon={ArrowRight} iconPosition="right" className="w-full">
          Continue
        </Button>
      </div>
    </Card>
  )
}
