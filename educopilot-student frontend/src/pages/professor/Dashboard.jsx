import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, Users, ListChecks, Inbox, Plus, Upload, Sparkles, FileCheck2, BarChart3, ArrowRight,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Card, { CardBody, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { SimpleBarChart } from '../../components/student/PerformanceChart'
import { useAuth } from '../../hooks/useAuth'
import { fetchProfessorCourses, fetchAssessments, fetchSubmissions } from '../../services/professorService'
import { formatDate } from '../../utils/formatters'

const toneStyles = {
  teal: 'bg-teal-100 text-teal-700',
  moss: 'bg-moss-100 text-moss-700',
  brand: 'bg-brand-100 text-brand-700',
  rosy: 'bg-rosy-100 text-rosy-700',
}



export default function Dashboard() {
  const { user } = useAuth()
  const [courses, setCourses] = useState(null)
  const [assessments, setAssessments] = useState(null)
  const [submissions, setSubmissions] = useState(null)

  useEffect(() => {
    const load = () => { fetchProfessorCourses().then(setCourses); fetchAssessments().then(setAssessments); fetchSubmissions().then(setSubmissions) }
    load()
    window.addEventListener('educopilot:data-updated', load)
    window.addEventListener('storage', load)
    return () => { window.removeEventListener('educopilot:data-updated', load); window.removeEventListener('storage', load) }
  }, [])

  const totalStudents = courses?.reduce((sum, c) => sum + c.studentCount, 0) ?? 0
  const pendingGrading = submissions?.filter((s) => s.status !== 'graded').length ?? 0
  const combinedTrend = submissions?.filter(s => Number.isFinite(Number(s.percent ?? s.score))).sort((a,b)=>new Date(a.submittedOn)-new Date(b.submittedOn)).map(s=>({date:new Date(s.submittedOn).toLocaleDateString(undefined,{month:'short',day:'numeric'}),average:Number(s.percent??s.score)})) ?? []

  const stats = [
    { label: 'Courses', value: courses?.length ?? '—', icon: BookOpen, tone: 'teal' },
    { label: 'Students', value: totalStudents || '—', icon: Users, tone: 'moss' },
    { label: 'Assessments', value: assessments?.length ?? '—', icon: ListChecks, tone: 'brand' },
    { label: 'Pending Grading', value: pendingGrading, icon: Inbox, tone: 'rosy' },
  ]

  const weakTopicsAcrossCourses = []

  const uploadTarget = courses?.[0]?.id
  const quickActions = [
    { label: 'Create Course', icon: Plus, to: '/professor/courses/create' },
    { label: 'Upload Material', icon: Upload, to: uploadTarget ? `/professor/courses/${uploadTarget}/materials` : '/professor/courses' },
    { label: 'Generate Material', icon: Sparkles, to: '/professor/material-generator' },
    { label: 'Create Test', icon: FileCheck2, to: '/professor/assessments/create' },
    { label: 'View Analytics', icon: BarChart3, to: '/professor/analytics' },
  ]

  return (
    <div>
      <PageHeader
        title={`Good morning, ${user?.name?.split(' ')[0] ?? 'Professor'} 👋`}
        subtitle="Here's what's happening across your courses."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <Card key={label} className="p-4">
            <div className={`mb-2.5 flex size-8 items-center justify-center rounded-lg ${toneStyles[tone]}`}>
              <Icon className="size-4" aria-hidden="true" />
            </div>
            <p className="text-2xl font-semibold text-brand-800">{value}</p>
            <p className="text-xs text-ink-500">{label}</p>
          </Card>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2.5">
        {quickActions.map(({ label, icon: Icon, to }) => (
          <Button key={label} as={Link} to={to} variant="secondary" size="sm" icon={Icon}>
            {label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div>
                <h2 className="font-semibold text-brand-800">Course Performance</h2>
                <p className="text-xs text-ink-500">Average class score across all courses, over time</p>
              </div>
            </CardHeader>
            <CardBody>
              <SimpleBarChart data={combinedTrend} dataKey="average" xKey="date" color="teal" unit="%" />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold text-brand-800">Recent Submissions</h2>
            </CardHeader>
            <CardBody className="space-y-2.5">
              {!submissions ? (
                <SkeletonCard />
              ) : (
                submissions.slice(0, 4).map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-ink-100 p-3">
                    <div>
                      <p className="text-sm font-medium text-ink-800">{s.studentName}</p>
                      <p className="text-xs text-ink-400">{s.assessmentName} · {formatDate(s.submittedOn)}</p>
                    </div>
                    <Badge tone={s.status === 'graded' ? 'moss' : s.status === 'pending' ? 'neutral' : 'warn'}>
                      {s.status === 'needs-review' ? 'Needs Review' : s.status}
                    </Badge>
                  </div>
                ))
              )}
              <Link to="/professor/submissions" className="flex items-center justify-center gap-1 pt-1 text-sm font-medium text-teal-600 hover:text-teal-700">
                View all submissions <ArrowRight className="size-3.5" />
              </Link>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card><CardBody><p className="text-sm text-ink-500">No class schedule has been added yet.</p></CardBody></Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold text-brand-800">Weak Topics Overview</h2>
            </CardHeader>
            <CardBody className="space-y-2">
              {weakTopicsAcrossCourses.map((topic) => (
                <div key={`${topic.courseId}-${topic.topic}`} className="flex items-center justify-between rounded-lg bg-rosy-50 px-3 py-2 text-sm">
                  <span className="text-ink-700">{topic.topic}</span>
                  <span className="font-semibold text-rosy-600">{topic.percent}%</span>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
