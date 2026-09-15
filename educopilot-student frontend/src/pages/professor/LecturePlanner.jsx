import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarRange, RefreshCcw, CheckCircle2, Info } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Card, { CardBody } from '../../components/ui/Card'
import Select from '../../components/ui/Select'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import ScheduleCard from '../../components/professor/ScheduleCard'
import { EmptyState } from '../../components/ui/EmptyState'
import { fetchProfessorCourses } from '../../services/professorService'
import { generateSchedule, saveSchedule } from '../../services/professorService'
import { useToast } from '../../hooks/useToast'

export default function LecturePlanner() {
  const toast = useToast()
  const [searchParams] = useSearchParams()

  const [courses, setCourses] = useState([])
  useEffect(() => { fetchProfessorCourses().then(setCourses) }, [])
  const [form, setForm] = useState({
    courseId: searchParams.get('course') || '',
    totalClasses: 12,
    classesPerWeek: 3,
    examDate: '',
  })
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(false)
  const [approving, setApproving] = useState(false)

  const selectedCourse = courses.find((c) => c.id === form.courseId)

  async function handleGenerate(event) {
    event?.preventDefault()
    setLoading(true)
    try {
      const result = await generateSchedule({
        courseName: selectedCourse?.name,
        totalClasses: Number(form.totalClasses),
        classesPerWeek: Number(form.classesPerWeek),
      })
      setSchedule(result)
      toast.success('Schedule generated. Review and approve when ready.')
    } catch {
      toast.error('Could not generate a schedule.')
    } finally {
      setLoading(false)
    }
  }

  function addTopic(weekNumber) {
    const topic = window.prompt('Topic name?')
    if (!topic) return
    setSchedule((current) => ({
      ...current,
      weeks: current.weeks.map((w) => (w.week === weekNumber ? { ...w, topics: [...w.topics, topic] } : w)),
    }))
  }

  function removeTopic(weekNumber, index) {
    setSchedule((current) => ({
      ...current,
      weeks: current.weeks.map((w) =>
        w.week === weekNumber ? { ...w, topics: w.topics.filter((_, i) => i !== index) } : w,
      ),
    }))
  }

  async function handleApprove() {
    setApproving(true)
    try {
      const approved = await saveSchedule({ ...schedule, status: 'approved' })
      setSchedule(approved)
      toast.success('Schedule approved and shared with students.')
    } catch {
      toast.error('Could not save the schedule.')
    } finally {
      setApproving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Lecture Planner" subtitle="Generate a weekly teaching schedule, then adjust it to fit your pace." />

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
              label="Total classes"
              type="number"
              min={1}
              value={form.totalClasses}
              onChange={(e) => setForm((f) => ({ ...f, totalClasses: e.target.value }))}
            />
            <Input
              label="Classes / week"
              type="number"
              min={1}
              max={7}
              value={form.classesPerWeek}
              onChange={(e) => setForm((f) => ({ ...f, classesPerWeek: e.target.value }))}
            />
            <Input
              label="Exam date"
              type="date"
              value={form.examDate}
              onChange={(e) => setForm((f) => ({ ...f, examDate: e.target.value }))}
            />
          </form>
          <Button className="mt-4 w-full sm:w-auto" icon={schedule ? RefreshCcw : CalendarRange} loading={loading} onClick={handleGenerate}>
            {schedule ? 'Regenerate Schedule' : 'Generate Schedule'}
          </Button>
        </CardBody>
      </Card>

      <div className="mb-5 flex items-start gap-2 rounded-lg bg-sand-100 px-3.5 py-3 text-xs text-ink-600">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        AI suggests. Professor decides. Review the generated schedule, drag topics between weeks or edit them freely, then approve to share it with students.
      </div>

      {!schedule ? (
        <EmptyState icon={CalendarRange} title="No schedule yet" description="Configure the course and click Generate Schedule above." />
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-brand-800">{schedule.courseName} — {schedule.weeks.length}-Week Plan</h2>
              <Badge tone={schedule.status === 'approved' ? 'moss' : 'neutral'} className="mt-1">
                {schedule.status === 'approved' ? 'Approved' : 'Pending approval'}
              </Badge>
            </div>
            <Button icon={CheckCircle2} onClick={handleApprove} loading={approving} disabled={schedule.status === 'approved'}>
              {schedule.status === 'approved' ? 'Approved' : 'Approve Schedule'}
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {schedule.weeks.map((week) => (
              <ScheduleCard key={week.week} week={week} onAddTopic={addTopic} onRemoveTopic={removeTopic} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
