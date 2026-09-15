import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Card, { CardBody, CardHeader } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/EmptyState'
import { ScoreLineChart, TopicBarChart } from '../../components/student/PerformanceChart'
import { fetchStudentAnalytics } from '../../services/professorService'
import { initials, formatDate } from '../../utils/formatters'

export default function StudentAnalytics() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStudentAnalytics(studentId).then(setData).catch(setError)
  }, [studentId])

  if (error) {
    return <ErrorState title="Student not found" description={error.message} onRetry={() => navigate('/professor/analytics')} />
  }
  if (!data) return <SkeletonCard />

  const { student } = data

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: 'Analytics', to: '/professor/analytics' }, { label: student.name }]}
        title={student.name}
        subtitle={`${student.rollNumber} · ${student.email}`}
      />

      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-ink-200 bg-white p-5">
        <div className="flex size-14 items-center justify-center rounded-full bg-teal-500 text-lg font-semibold text-white">
          {initials(student.name)}
        </div>
        <div className="flex-1">
          <div className="mb-1.5 flex items-center gap-3">
            <p className="text-2xl font-semibold text-brand-800">{data.overallScore}%</p>
            <span className="text-sm text-ink-500">overall average</span>
          </div>
          <ProgressBar value={data.progress} tone="teal" label="Course progress" size="sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><h2 className="font-semibold text-brand-800">Score History</h2></CardHeader>
          <CardBody><ScoreLineChart data={data.scoreHistory} /></CardBody>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold text-brand-800">Topic Performance</h2></CardHeader>
          <CardBody><TopicBarChart data={data.topicPerformance} /></CardBody>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardBody>
            <p className="mb-3 font-medium text-brand-800">Strong Topics</p>
            <div className="flex flex-wrap gap-2">
              {data.strongTopics.map((t) => <Badge key={t} tone="moss">{t}</Badge>)}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="mb-3 font-medium text-brand-800">Weak Topics</p>
            <div className="flex flex-wrap gap-2">
              {data.weakTopics.map((t) => <Badge key={t} tone="rosy">{t}</Badge>)}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-5">
        <CardBody>
          <p className="mb-3 font-medium text-brand-800">Quiz History</p>
          <div className="space-y-2">
            {data.quizHistory.map((q) => (
              <div key={q.id} className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2 text-sm">
                <div>
                  <p className="text-ink-800">{q.topic}</p>
                  <p className="text-xs text-ink-400">{formatDate(q.date)}</p>
                </div>
                <Badge tone={q.percent >= 70 ? 'moss' : q.percent >= 50 ? 'warn' : 'danger'}>{q.percent}%</Badge>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card className="mt-5 border-teal-200 bg-teal-50/50">
        <CardBody className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-teal-600" />
          <div>
            <p className="mb-1 text-sm font-semibold text-teal-800">AI Recommendation</p>
            <p className="text-sm text-ink-700">{data.recommendation}</p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
