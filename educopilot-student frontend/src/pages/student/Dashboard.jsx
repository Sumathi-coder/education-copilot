import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Flame, Target, BookOpen, TrendingUp, CheckSquare, Square, ArrowRight, Sparkles } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Card, { CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { SkeletonCard } from '../../components/ui/Skeleton'
import CourseCard from '../../components/student/CourseCard'
import WeakTopicCard from '../../components/student/WeakTopicCard'
import QuizCard from '../../components/student/QuizCard'
import { useAuth } from '../../hooks/useAuth'
import { fetchCourses } from '../../services/courseService'
import { fetchStudentPerformance } from '../../services/analyticsService'
import { fetchQuizHistory } from '../../services/quizService'
import { fetchStudentAssessments, subscribeAssessmentUpdates } from '../../services/assessmentService'
import { subscribeStore } from '../../services/localStore'

const statCards = [
  { key: 'overallProgress', label: 'Overall Progress', icon: TrendingUp, suffix: '%', tone: 'teal' },
  { key: 'averageScore', label: 'Average Score', icon: Target, suffix: '%', tone: 'moss' },
  { key: 'activeCourses', label: 'Active Courses', icon: BookOpen, suffix: '', tone: 'brand' },
]

const toneStyles = {
  teal: 'bg-teal-100 text-teal-700',
  moss: 'bg-moss-100 text-moss-700',
  brand: 'bg-brand-100 text-brand-700',
  rosy: 'bg-rosy-100 text-rosy-700',
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState(null)
  const [performance, setPerformance] = useState(null)
  const [history, setHistory] = useState(null)
  const [tasks, setTasks] = useState([])
  const [assessments, setAssessments] = useState([])

  useEffect(() => {
    const load = () => {
      fetchCourses().then(setCourses)
      fetchStudentPerformance().then(setPerformance)
      fetchQuizHistory().then((data) => setHistory(data.slice(0, 3)))
      fetchStudentAssessments().then((data) => setAssessments(data.slice(0, 3)))
    }
    load()
    const unsubAssessments = subscribeAssessmentUpdates(load)
    const unsubCourses = subscribeStore('courses', load)
    return () => { unsubAssessments(); unsubCourses() }
  }, [])

  function toggleTask(id) {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)))
  }

  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Here's where your prep stands today."
        actions={
          <Button as={Link} to="/student/quiz/create" icon={Sparkles}>
            Start a practice test
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {statCards.map(({ key, label, icon: Icon, suffix, tone }) => (
          <Card key={key} className="p-4">
            <div className={`mb-2.5 flex size-8 items-center justify-center rounded-lg ${toneStyles[tone]}`}>
              <Icon className="size-4" aria-hidden="true" />
            </div>
            <p className="text-2xl font-semibold text-brand-800">{performance ? (key === 'activeCourses' ? (courses?.length ?? 0) : key === 'averageScore' ? (performance.summary?.avgScore ?? 0) : key === 'overallProgress' ? (performance.summary?.overallProgress ?? 0) : (performance.summary?.studyStreakDays ?? 0)) : '—'}{suffix}</p>
            <p className="text-xs text-ink-500">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brand-800">Your Courses</h2>
              <Link to="/student/courses" className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700">
                View all <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {courses
                ? courses.slice(0, 2).map((course) => <CourseCard key={course.id} course={course} />)
                : Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brand-800">Active Assignments & Tests</h2>
              <Link to="/student/assessments" className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700">View all <ArrowRight className="size-3.5" /></Link>
            </div>
            {assessments.length === 0 ? (
              <Card><CardBody><p className="text-sm text-ink-500">No active assignments or tests from your professors.</p></CardBody></Card>
            ) : (
              <div className="space-y-2.5">{assessments.map((assessment) => <Card key={assessment.id} className="p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-medium text-brand-800">{assessment.name}</p><p className="text-xs text-ink-500">{assessment.courseName} · {assessment.type} · {(Array.isArray(assessment.questions) ? assessment.questions.length : 0)} questions</p></div>{assessment.submitted ? <span className="text-xs font-medium text-moss-600">Submitted</span> : <Button as={Link} to={`/student/assessments/${assessment.id}`} size="sm">Attend</Button>}</div></Card>)}</div>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brand-800">Recent Quiz Results</h2>
              <Link to="/student/performance" className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700">
                View performance <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="space-y-2.5">
              {history
                ? history.map((attempt) => <QuizCard key={attempt.id} attempt={attempt} />)
                : Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} className="p-4" />)}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <Card>
            <CardBody>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-brand-800">Today's Study Plan</h2>
                <Link to="/student/study-plan" className="text-xs font-medium text-teal-600 hover:text-teal-700">
                  Full plan
                </Link>
              </div>
              {tasks.length === 0 ? (
                <p className="text-sm text-ink-500">No study tasks have been created yet.</p>
              ) : (
                <ul className="space-y-2">
                  {tasks.map((task) => (
                    <li key={task.id}>
                      <button onClick={() => toggleTask(task.id)} className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-sand-50">
                        {task.done ? <CheckSquare className="size-4.5 text-moss-500" /> : <Square className="size-4.5 text-ink-300" />}
                        <span className={task.done ? 'text-ink-400 line-through' : 'text-ink-700'}>{task.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-brand-800">Weak Topics</h2>
                <Link to="/student/revision" className="text-xs font-medium text-teal-600 hover:text-teal-700">
                  Revise all
                </Link>
              </div>
              <div className="space-y-2.5">
                {performance
                  ? performance.weakTopics.map((topic) => (
                      <WeakTopicCard
                        key={topic.topic}
                        {...topic}
                        onClick={() => navigate('/student/revision')}
                      />
                    ))
                  : Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} className="p-4" />)}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
