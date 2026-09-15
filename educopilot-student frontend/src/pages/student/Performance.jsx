import { useEffect, useMemo, useState } from 'react'
import { Target, Trophy, ListChecks, Flame, BookOpen, ChevronRight } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Card, { CardBody, CardHeader } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { ScoreLineChart, TopicBarChart } from '../../components/student/PerformanceChart'
import ProgressBar from '../../components/ui/ProgressBar'
import { fetchStudentPerformance } from '../../services/analyticsService'
import { cn } from '../../utils/cn'

const summaryCards = [
  { key: 'averageScore', label: 'Average Score', icon: Target, suffix: '%', tone: 'teal' },
  { key: 'bestScore', label: 'Best Score', icon: Trophy, suffix: '%', tone: 'moss' },
  { key: 'testsTaken', label: 'Total test taken', icon: Flame, suffix: '', tone: 'brand' },
]

const toneStyles = {
  teal: 'bg-teal-100 text-teal-700',
  moss: 'bg-moss-100 text-moss-700',
  brand: 'bg-brand-100 text-brand-700',
  rosy: 'bg-rosy-100 text-rosy-700',
}

function normalizeSubjects(data) {
  if (!Array.isArray(data?.subjectPerformance)) return []
  return data.subjectPerformance.map((subject, index) => ({
    ...subject,
    code: String(subject.code || subject.subject || subject.name || `SUB${index + 1}`),
    name: String(subject.name || subject.subject || subject.code || 'Subject'),
    avgScore: Number(subject.avgScore) || 0,
    units: Array.isArray(subject.units) ? subject.units : [],
  }))
}

export default function Performance() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('')
  const [selectedUnitName, setSelectedUnitName] = useState('')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const result = await fetchStudentPerformance()
        if (!mounted) return
        setData(result)
        setError(null)
      } catch (err) {
        if (mounted) setError(err)
      }
    }
    load()
    const handler = () => load()
    window.addEventListener('educopilot:data-updated', handler)
    window.addEventListener('storage', handler)
    return () => {
      mounted = false
      window.removeEventListener('educopilot:data-updated', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  const subjects = useMemo(() => normalizeSubjects(data), [data])
  const selectedSubject = subjects.find((subject) => subject.code === selectedSubjectCode) || subjects[0] || null
  const units = selectedSubject?.units || []
  const selectedUnit = units.find((unit) => unit.unit === selectedUnitName) || units[0] || null
  const topicData = selectedUnit?.topics?.length ? selectedUnit.topics : []

  useEffect(() => {
    if (!selectedSubject) {
      setSelectedSubjectCode('')
      setSelectedUnitName('')
      return
    }
    if (selectedSubject.code !== selectedSubjectCode) setSelectedSubjectCode(selectedSubject.code)
    const firstUnit = selectedSubject.units?.[0]?.unit || ''
    if (!selectedUnitName || !selectedSubject.units?.some((unit) => unit.unit === selectedUnitName)) {
      setSelectedUnitName(firstUnit)
    }
  }, [selectedSubject, selectedSubjectCode, selectedUnitName])

  if (error) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Could not load performance"
        description={error.message || 'Please reload the page and try again.'}
      />
    )
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  const summary = data.summary || {}

  return (
    <div>
      <PageHeader title="Performance" subtitle="Track your progress across courses, units, topics, and test attempts." />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {summaryCards.map(({ key, label, icon: Icon, suffix, tone }) => (
          <Card key={key} className="p-4">
            <div className={`mb-2.5 flex size-8 items-center justify-center rounded-lg ${toneStyles[tone]}`}>
              <Icon className="size-4" aria-hidden="true" />
            </div>
            <p className="text-2xl font-semibold text-brand-800">{Number(summary[key]) || 0}{suffix}</p>
            <p className="text-xs text-ink-500">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <h2 className="font-semibold text-brand-800">Score Trend</h2>
              <p className="text-xs text-ink-500">Your last {data.scoreHistory?.length || 0} test attempts</p>
            </div>
          </CardHeader>
          <CardBody>
            {data.scoreHistory?.length ? <ScoreLineChart data={data.scoreHistory} /> : <EmptyState title="No test attempts yet" description="Complete an assessment to build your score trend." />}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h2 className="font-semibold text-brand-800">Subject-wise Performance</h2>
              <p className="text-xs text-ink-500">Choose a subject code to inspect its units and topics.</p>
            </div>
          </CardHeader>
          <CardBody>
            {subjects.length === 0 ? (
              <EmptyState title="No subject results yet" description="Complete an assessment to see subject-wise performance." />
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject) => (
                    <button
                      key={subject.code}
                      type="button"
                      onClick={() => {
                        setSelectedSubjectCode(subject.code)
                        setSelectedUnitName(subject.units?.[0]?.unit || '')
                      }}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-sm font-semibold transition',
                        selectedSubject?.code === subject.code
                          ? 'border-teal-500 bg-teal-500 text-white'
                          : 'border-ink-200 bg-white text-ink-700 hover:border-teal-300 hover:bg-teal-50',
                      )}
                    >
                      {subject.code}
                    </button>
                  ))}
                </div>

                {selectedSubject && (
                  <div className="rounded-xl border border-ink-200 bg-sand-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">{selectedSubject.code}</p>
                        <h3 className="mt-1 font-semibold text-brand-800">{selectedSubject.name}</h3>
                      </div>
                      <Badge tone={selectedSubject.avgScore >= 70 ? 'moss' : selectedSubject.avgScore >= 50 ? 'teal' : 'warn'}>
                        {selectedSubject.avgScore}% average
                      </Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {units.length === 0 ? (
                        <p className="text-sm text-ink-500">No unit-level results are available yet.</p>
                      ) : units.map((unit) => (
                        <button
                          key={unit.unit}
                          type="button"
                          onClick={() => setSelectedUnitName(unit.unit)}
                          className={cn(
                            'flex items-center justify-between rounded-xl border p-3 text-left transition',
                            selectedUnit?.unit === unit.unit
                              ? 'border-teal-400 bg-white shadow-soft'
                              : 'border-ink-200 bg-white/70 hover:border-teal-300',
                          )}
                        >
                          <div>
                            <p className="text-sm font-semibold text-brand-800">{unit.unit}</p>
                            <p className="mt-0.5 text-xs text-ink-500">{unit.topics?.length || 0} topics</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-teal-700">{unit.avgScore}%</span>
                            <ChevronRight className="size-4 text-ink-300" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h2 className="font-semibold text-brand-800">Topic Mastery</h2>
              <p className="text-xs text-ink-500">
                {selectedSubject ? `${selectedSubject.code} · ${selectedUnit?.unit || 'All units'}` : 'Topic performance'}
              </p>
            </div>
          </CardHeader>
          <CardBody>
            {topicData.length ? (
              <TopicBarChart data={topicData} />
            ) : (
              <EmptyState title="No topic results yet" description="Topic scores will appear after you complete questions in this unit." />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-brand-800">Course Progress</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {data.courseProgress?.length ? data.courseProgress.map((course) => (
              <ProgressBar key={course.code || course.course} value={course.progress} tone="moss" label={course.course} />
            )) : <EmptyState title="No course progress yet" description="Your course progress will appear as assessments are completed." />}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
