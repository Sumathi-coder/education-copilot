import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Select from '../../components/ui/Select'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import SubmissionTable from '../../components/professor/SubmissionTable'
import { fetchSubmissions, fetchAssessments } from '../../services/professorService'
import { fetchProfessorCourses } from '../../services/professorService'

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'graded', label: 'Graded' },
  { value: 'pending', label: 'Pending' },
  { value: 'needs-review', label: 'Needs Review' },
]

export default function Submissions() {
  const [searchParams] = useSearchParams()
  const [courses, setCourses] = useState([])
  const [submissions, setSubmissions] = useState(null)
  const [assessments, setAssessments] = useState(null)
  const [filters, setFilters] = useState({
    courseId: 'all',
    assessmentId: searchParams.get('assessment') || 'all',
    status: 'all',
  })

  useEffect(() => {
    fetchProfessorCourses().then(setCourses)
    fetchSubmissions().then(setSubmissions)
    fetchAssessments().then(setAssessments)
  }, [])

  const filtered = useMemo(() => {
    if (!submissions) return null
    return submissions.filter((s) => {
      if (filters.courseId !== 'all' && s.courseId !== filters.courseId) return false
      if (filters.assessmentId !== 'all' && s.assessmentId !== filters.assessmentId) return false
      if (filters.status !== 'all' && s.status !== filters.status) return false
      return true
    })
  }, [submissions, filters])

  const assessmentOptions = [
    { value: 'all', label: 'All assessments' },
    ...(assessments?.map((a) => ({ value: a.id, label: a.name })) ?? []),
  ]

  return (
    <div>
      <PageHeader title="Submissions" subtitle="Review and grade student submissions across your courses." />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select
          label="Course"
          value={filters.courseId}
          onChange={(e) => setFilters((f) => ({ ...f, courseId: e.target.value }))}
          options={[{ value: 'all', label: 'All courses' }, ...courses.map((c) => ({ value: c.id, label: c.name }))]}
        />
        <Select
          label="Assessment"
          value={filters.assessmentId}
          onChange={(e) => setFilters((f) => ({ ...f, assessmentId: e.target.value }))}
          options={assessmentOptions}
        />
        <Select
          label="Status"
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          options={statusOptions}
        />
      </div>

      {!filtered ? (
        <SkeletonCard />
      ) : filtered.length === 0 ? (
        <EmptyState title="No submissions match these filters" description="Try widening your filters above." />
      ) : (
        <SubmissionTable submissions={filtered} />
      )}
    </div>
  )
}
