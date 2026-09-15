import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Card, { CardBody } from '../../components/ui/Card'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import { fetchCourses } from '../../services/courseService'
import { generateQuiz } from '../../services/quizService'
import { useToast } from '../../hooks/useToast'

const difficultyOptions = [
  { value: 'mixed', label: 'Mixed' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

const questionCountOptions = [5, 10, 15, 20].map((n) => ({ value: String(n), label: `${n} questions` }))
const durationOptions = [10, 15, 20, 30].map((n) => ({ value: String(n), label: `${n} minutes` }))

export default function QuizCreate() {
  const navigate = useNavigate()
  const toast = useToast()
  const [searchParams] = useSearchParams()

  const [courses, setCourses] = useState([])
  useEffect(() => { fetchCourses().then((items) => { setCourses(items); if (!searchParams.get('course') && items[0]) setForm((f) => ({ ...f, courseId: items[0].id })) }) }, [])
  const [form, setForm] = useState({
    courseId: searchParams.get('course') || '',
    topic: 'all',
    difficulty: 'mixed',
    numQuestions: '10',
    durationMinutes: '15',
  })
  const [loading, setLoading] = useState(false)

  const topicOptions = useMemo(() => {
    const topics = []
    return [{ value: 'all', label: 'All topics' }, ...topics.map((t) => ({ value: t, label: t }))]
  }, [form.courseId])

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    try {
      const quiz = await generateQuiz(form)
      navigate(`/student/quiz/${quiz.id}`)
    } catch {
      toast.error('Could not generate a practice test. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Create a Practice Test" subtitle="Configure a quiz generated from your course material." />

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Course"
              value={form.courseId}
              onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value, topic: 'all' }))}
              options={courses.map((c) => ({ value: c.id, label: `${c.name} (${c.code})` }))}
            />
            <Select
              label="Topic"
              value={form.topic}
              onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
              options={topicOptions}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Select
                label="Difficulty"
                value={form.difficulty}
                onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
                options={difficultyOptions}
              />
              <Select
                label="Number of questions"
                value={form.numQuestions}
                onChange={(e) => setForm((f) => ({ ...f, numQuestions: e.target.value }))}
                options={questionCountOptions}
              />
              <Select
                label="Duration"
                value={form.durationMinutes}
                onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
                options={durationOptions}
              />
            </div>

            <div className="rounded-lg bg-sand-100 px-3.5 py-3 text-xs text-ink-600">
              Questions are generated from your course's ingested material, weighted toward topics where your
              past performance was weaker.
            </div>

            <Button type="submit" className="w-full" icon={Sparkles} loading={loading} size="lg">
              Generate Test
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
