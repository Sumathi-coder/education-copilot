import { useEffect, useState } from 'react'
import { Sparkles, RefreshCcw } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Card, { CardBody } from '../../components/ui/Card'
import Select from '../../components/ui/Select'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import StudyPlanCard from '../../components/student/StudyPlanCard'
import { EmptyState } from '../../components/ui/EmptyState'
import { fetchCourses } from '../../services/courseService'
import { generateStudyPlan } from '../../services/aiService'
import { useToast } from '../../hooks/useToast'

export default function StudyPlan() {
  const toast = useToast()
  const [courses, setCourses] = useState([])
  useEffect(() => { fetchCourses().then((items) => { setCourses(items); if (items[0]) setForm((f) => ({ ...f, courseId: f.courseId || items[0].id })) }) }, [])
  const [form, setForm] = useState({
    courseId: '',
    hoursPerDay: 2,
    prepPercent: 40,
  })
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)

  const selectedCourse = courses.find((c) => c.id === form.courseId)

  async function handleGenerate(event) {
    event?.preventDefault()
    setLoading(true)
    try {
      if (!selectedCourse) return toast.error('Create or select a course first.')
      const result = await generateStudyPlan({
        courseName: selectedCourse.name,
        examDate: selectedCourse.examDate,
        prepPercent: form.prepPercent,
        hoursPerDay: form.hoursPerDay,
      })
      setPlan(result)
      toast.success('Study plan generated.')
    } catch {
      toast.error('Could not generate a study plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function markComplete(dayNumber) {
    setPlan((current) => ({
      ...current,
      days: current.days.map((d) => (d.day === dayNumber ? { ...d, status: 'completed' } : d)),
    }))
  }

  return (
    <div>
      <PageHeader
        title="AI Study Plan"
        subtitle="A day-by-day plan built from your syllabus, exam date, and current mastery."
      />

      <Card className="mb-6">
        <CardBody>
          <form onSubmit={handleGenerate} className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:items-end">
            <Select
              label="Course"
              value={form.courseId}
              onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}
              options={courses.map((c) => ({ value: c.id, label: c.name }))}
            />
            <Input
              label="Hours / day"
              type="number"
              min={1}
              max={8}
              value={form.hoursPerDay}
              onChange={(e) => setForm((f) => ({ ...f, hoursPerDay: e.target.value }))}
            />
            <Input
              label="Current prep level (%)"
              type="number"
              min={0}
              max={100}
              value={form.prepPercent}
              onChange={(e) => setForm((f) => ({ ...f, prepPercent: e.target.value }))}
            />
            <Button type="submit" icon={plan ? RefreshCcw : Sparkles} loading={loading}>
              {plan ? 'Regenerate' : 'Generate Plan'}
            </Button>
          </form>
        </CardBody>
      </Card>

      {loading && !plan && (
        <EmptyState icon={Sparkles} title="Building your plan..." description="Analyzing the syllabus and your exam date." />
      )}

      {!loading && !plan && (
        <EmptyState
          icon={Sparkles}
          title="No study plan yet"
          description="Choose a course above and generate a personalized day-by-day plan."
        />
      )}

      {plan && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-brand-800">{plan.courseName} — {plan.days.length}-Day Plan</h2>
              <p className="text-sm text-ink-500">
                {plan.days.filter((d) => d.status === 'completed').length} of {plan.days.length} days complete
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {plan.days.map((day) => (
              <StudyPlanCard key={day.day} day={day} onMarkComplete={markComplete} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
