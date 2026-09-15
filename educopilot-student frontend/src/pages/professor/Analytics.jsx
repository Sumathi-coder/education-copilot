import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Users, Target, Trophy, TrendingDown, CheckCircle2 } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Select from '../../components/ui/Select'
import Card, { CardBody } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { SkeletonCard } from '../../components/ui/Skeleton'
import AnalyticsChart from '../../components/professor/AnalyticsChart'
import StudentTable from '../../components/professor/StudentTable'
import { fetchProfessorCourses } from '../../services/professorService'
import { fetchClassAnalytics } from '../../services/professorService'

const toneStyles = {
  teal: 'bg-teal-100 text-teal-700',
  moss: 'bg-moss-100 text-moss-700',
  rosy: 'bg-rosy-100 text-rosy-700',
  brand: 'bg-brand-100 text-brand-700',
}

export default function Analytics() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [courses, setCourses] = useState([])
  const [courseId, setCourseId] = useState(searchParams.get('course') || '')
  useEffect(() => { fetchProfessorCourses().then((items) => { setCourses(items); if (!searchParams.get('course') && items[0]) setCourseId(items[0].id) }) }, [])
  const [data, setData] = useState(null)

  useEffect(() => {
    setData(null)
    fetchClassAnalytics(courseId).then(setData)
  }, [courseId])

  function handleCourseChange(value) {
    setCourseId(value)
    setSearchParams({ course: value })
  }

  return (
    <div>
      <PageHeader
        title="Class Analytics"
        subtitle="See how your class is performing as a whole."
        actions={
          <Select
            value={courseId}
            onChange={(e) => handleCourseChange(e.target.value)}
            options={courses.map((c) => ({ value: c.id, label: c.name }))}
            className="w-56"
          />
        }
      />

      {!data ? (
        <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Card className="p-4">
              <div className={`mb-2 flex size-8 items-center justify-center rounded-lg ${toneStyles.teal}`}><Users className="size-4" /></div>
              <p className="text-xl font-semibold text-brand-800">{data.summary.totalStudents}</p>
              <p className="text-xs text-ink-500">Total Students</p>
            </Card>
            <Card className="p-4">
              <div className={`mb-2 flex size-8 items-center justify-center rounded-lg ${toneStyles.moss}`}><Target className="size-4" /></div>
              <p className="text-xl font-semibold text-brand-800">{data.summary.avgScore}%</p>
              <p className="text-xs text-ink-500">Average Score</p>
            </Card>
            <Card className="p-4">
              <div className={`mb-2 flex size-8 items-center justify-center rounded-lg ${toneStyles.brand}`}><Trophy className="size-4" /></div>
              <p className="text-xl font-semibold text-brand-800">{data.summary.highestScore}%</p>
              <p className="text-xs text-ink-500">Highest Score</p>
            </Card>
            <Card className="p-4">
              <div className={`mb-2 flex size-8 items-center justify-center rounded-lg ${toneStyles.rosy}`}><TrendingDown className="size-4" /></div>
              <p className="text-xl font-semibold text-brand-800">{data.summary.lowestScore}%</p>
              <p className="text-xs text-ink-500">Lowest Score</p>
            </Card>
            <Card className="p-4 col-span-2 sm:col-span-1">
              <div className={`mb-2 flex size-8 items-center justify-center rounded-lg ${toneStyles.teal}`}><CheckCircle2 className="size-4" /></div>
              <p className="text-xl font-semibold text-brand-800">{data.summary.completionRate}%</p>
              <p className="text-xs text-ink-500">Completion Rate</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <AnalyticsChart title="Class Average Over Time" type="bar" data={data.averageOverTime} dataKey="average" xKey="date" color="teal" unit="%" />
            <AnalyticsChart title="Score Distribution" type="bar" data={data.scoreDistribution} dataKey="students" xKey="range" color="moss" unit=" students" />
            <AnalyticsChart title="Topic Performance" type="topicBar" data={data.topicPerformance} />
            <AnalyticsChart title="Assessment Performance" type="bar" data={data.assessmentPerformance} dataKey="avgScore" xKey="name" color="rosy" unit="%" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardBody>
                <p className="mb-3 font-medium text-brand-800">Weak Topics</p>
                <div className="space-y-2">
                  {data.weakTopics.map((t) => (
                    <div key={t.topic} className="flex items-center justify-between rounded-lg bg-rosy-50 px-3 py-2 text-sm">
                      <span className="text-ink-700">{t.topic}</span>
                      <Badge tone="rosy">{t.percent}%</Badge>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="mb-3 font-medium text-brand-800">Strong Topics</p>
                <div className="space-y-2">
                  {data.strongTopics.map((t) => (
                    <div key={t.topic} className="flex items-center justify-between rounded-lg bg-moss-50 px-3 py-2 text-sm">
                      <span className="text-ink-700">{t.topic}</span>
                      <Badge tone="moss">{t.percent}%</Badge>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="mt-6">
            <p className="mb-3 font-medium text-brand-800">Students</p>
            <StudentTable students={data.roster} />
          </div>
        </>
      )}
    </div>
  )
}
