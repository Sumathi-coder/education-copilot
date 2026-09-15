import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, PlayCircle, Circle, FileText, Sparkles, ListChecks, Download } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Tabs from '../../components/ui/Tabs'
import Card, { CardBody } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ProgressBar from '../../components/ui/ProgressBar'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { ErrorState, EmptyState } from '../../components/ui/EmptyState'
import { fetchCourseById, fetchCourseMaterials, onMaterialsUpdated } from '../../services/courseService'
import { fetchStudentAssessments, subscribeAssessmentUpdates } from '../../services/assessmentService'
import { formatDate } from '../../utils/formatters'

const unitStatus = {
  completed: { icon: CheckCircle2, tone: 'moss', label: 'Completed' },
  'in-progress': { icon: PlayCircle, tone: 'teal', label: 'In Progress' },
  upcoming: { icon: Circle, tone: 'neutral', label: 'Upcoming' },
}

export default function CourseDetail() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [materials, setMaterials] = useState(null)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('syllabus')
  const [assessments, setAssessments] = useState([])

  useEffect(() => {
    setCourse(null)
    setError(null)
    fetchCourseById(courseId).then(setCourse).catch(setError)
    fetchCourseMaterials(courseId).then(setMaterials)
    const loadAssessments = () => fetchStudentAssessments().then((items) => setAssessments(items.filter((item) => item.courseId === courseId)))
    loadAssessments()

    // If a professor uploads material for this course while this page is
    // open (this tab or another), refresh the list automatically.
    const unsubscribe = onMaterialsUpdated(() => {
      fetchCourseMaterials(courseId).then(setMaterials)
    })
    const unsubscribeAssessments = subscribeAssessmentUpdates(loadAssessments)
    return () => { unsubscribe(); unsubscribeAssessments() }
  }, [courseId])

  if (error) {
    return <ErrorState title="Course not found" description={error.message} onRetry={() => navigate('/student/courses')} />
  }

  if (!course) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: 'My Courses', to: '/student/courses' }, { label: course.name }]}
        title={course.name}
        subtitle={`${course.code} · ${course.professor} · ${course.credits} credits`}
        actions={
          <>
            <Button variant="secondary" icon={Sparkles} onClick={() => navigate(`/student/tutor/${course.id}`)}>
              Ask AI Tutor
            </Button>
            <Button icon={ListChecks} onClick={() => navigate(`/student/quiz/create?course=${course.id}`)}>
              Practice Test
            </Button>
          </>
        }
      />

      <div className="mb-6 max-w-sm">
        <Card className="p-4">
          <p className="text-xs text-ink-500">Progress</p>
          <p className="mt-1 text-2xl font-semibold text-brand-800">{course.progress}%</p>
          <ProgressBar value={course.progress} tone="teal" size="sm" className="mt-2" />
        </Card>
      </div>

      <p className="mb-5 max-w-3xl text-sm leading-relaxed text-ink-600">{course.description}</p>

      <Tabs
        tabs={[
          { value: 'syllabus', label: 'Syllabus' },
          { value: 'materials', label: 'Materials' },
          { value: 'assessments', label: 'Assignments & Tests' },
        ]}
        active={tab}
        onChange={setTab}
        className="mb-5"
      />

      {tab === 'syllabus' && (
        <div className="space-y-3">
          {(Array.isArray(course.units) ? course.units : []).map((unit) => {
            const status = unitStatus[unit.status]
            const Icon = status.icon
            return (
              <Card key={unit.id}>
                <CardBody>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Icon className={`mt-0.5 size-5 shrink-0 ${status.tone === 'moss' ? 'text-moss-500' : status.tone === 'teal' ? 'text-teal-500' : 'text-ink-300'}`} />
                      <div>
                        <p className="font-medium text-brand-800">{unit.title}</p>
                        <p className="mt-1 text-sm text-ink-500">{unit.topics.join(' · ')}</p>
                      </div>
                    </div>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}

      {tab === 'assessments' && (
        <div className="space-y-3">
          {assessments.length === 0 ? (
            <EmptyState icon={ListChecks} title="No active assessments" description="Your professor hasn't published an assignment or test for this course yet." />
          ) : assessments.map((assessment) => (
            <Card key={assessment.id}>
              <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="font-medium text-brand-800">{assessment.name}</p><p className="mt-1 text-sm text-ink-500">{assessment.type} · {(Array.isArray(assessment.questions) ? assessment.questions.length : 0)} questions {assessment.duration ? `· ${assessment.duration} min` : ''}</p></div>
                {assessment.submitted ? <Badge tone="teal">Submitted</Badge> : <Button onClick={() => navigate(`/student/assessments/${assessment.id}`)}>Attend {assessment.type}</Button>}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {tab === 'materials' && (
        <div className="space-y-2.5">
          <p className="mb-1 text-xs text-ink-400">Synced automatically when your professor uploads new material.</p>
          {!materials ? (
            <SkeletonCard />
          ) : materials.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No materials uploaded yet"
              description="Your professor hasn't added any documents for this course yet. Check back soon."
            />
          ) : (
            materials.map((material) => (
              <Card key={material.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                    <FileText className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-800">{material.name}</p>
                    <p className="text-xs text-ink-400">{material.type} · {(material.sizeKb / 1024).toFixed(1)} MB · {formatDate(material.uploadedOn)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" icon={Download}>Download</Button>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
