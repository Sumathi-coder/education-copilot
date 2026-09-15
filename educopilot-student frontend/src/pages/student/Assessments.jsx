import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardCheck, Clock, FileText, CheckCircle2 } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Card, { CardBody } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { fetchStudentAssessments, fetchStudentCompletedAssessments, subscribeAssessmentUpdates } from '../../services/assessmentService'
import { formatDate } from '../../utils/formatters'

export default function Assessments() {
  const [items, setItems] = useState(null)
  const [completed, setCompleted] = useState([])
  const [tab, setTab] = useState('active')

  useEffect(() => {
    const load = () => { fetchStudentAssessments().then(setItems); fetchStudentCompletedAssessments().then(setCompleted) }
    load()
    return subscribeAssessmentUpdates(load)
  }, [])

  return (
    <div>
      <PageHeader title="Assignments & Tests" subtitle="Assessments published by your professors that are ready for you to attend." />
      <div className="mb-5 flex gap-2"><Button variant={tab==='active'?'primary':'secondary'} onClick={()=>setTab('active')}>Active</Button><Button variant={tab==='completed'?'primary':'secondary'} onClick={()=>setTab('completed')}>Completed</Button></div>
      {tab === 'active' && (!items ? (
        <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>
      ) : items.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="No active assessments" description="Your professors haven't published any assignments or tests for your enrolled courses yet." />
      ) : (
        <div className="space-y-3">
          {items.map((assessment) => (
            <Card key={assessment.id}>
              <CardBody>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                      {assessment.type === 'Assignment' ? <FileText className="size-5" /> : <ClipboardCheck className="size-5" />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-medium text-brand-800">{assessment.name}</h2>
                        <Badge tone="moss">Active</Badge>
                        {assessment.submitted && <Badge tone="teal">Submitted</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-ink-500">{assessment.courseName} · {assessment.type} · {(Array.isArray(assessment.questions) ? assessment.questions.length : 0)} questions</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink-400">
                        {assessment.duration && <span className="flex items-center gap-1"><Clock className="size-3.5" /> {assessment.duration} min</span>}
                        <span>Published {formatDate(assessment.publishedOn ?? assessment.createdOn)}</span>
                      </div>
                    </div>
                  </div>
                  {assessment.submitted ? (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-moss-600"><CheckCircle2 className="size-4" /> Completed</span>
                  ) : (
                    <Button as={Link} to={`/student/assessments/${assessment.id}`}>Attend {assessment.type}</Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ))}
      {tab === 'completed' && (
        completed.length === 0 ? <EmptyState icon={CheckCircle2} title="No completed assessments" description="Completed or submitted assessments will appear here." /> :
        <div className="space-y-3">{completed.map((assessment) => {
          const submission = assessment.submission
          const totalMarks = submission?.totalMarks ?? (Array.isArray(assessment.questions) ? assessment.questions.length : 0)
          const score = submission?.score
          const percent = submission?.percent

          return (
            <Card key={assessment.id}>
              <CardBody>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-medium text-brand-800">{assessment.name}</h2>
                    <p className="text-sm text-ink-500">{assessment.courseName} · {assessment.type}</p>
                    {submission && (
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                        {score !== null && score !== undefined && (
                          <span className="font-semibold text-brand-800">Marks: {score}/{totalMarks}</span>
                        )}
                        {percent !== null && percent !== undefined && (
                          <span className="font-medium text-teal-600">{percent}%</span>
                        )}
                      </div>
                    )}
                  </div>
                  <Badge tone="teal">Completed</Badge>
                </div>
              </CardBody>
            </Card>
          )
        })}</div>
      )}
    </div>  )
}
