import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Clock, ChevronLeft, ChevronRight, Flag, FileText } from 'lucide-react'
import Card, { CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/EmptyState'
import { getStudentAssessment, submitAssessment } from '../../services/assessmentService'
import { formatDuration } from '../../utils/formatters'
import { useToast } from '../../hooks/useToast'
import { cn } from '../../utils/cn'

export default function AssessmentTake() {
  const { assessmentId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [assessment, setAssessment] = useState(null)
  const [error, setError] = useState(null)
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getStudentAssessment(assessmentId)
      .then((data) => {
        setAssessment(data)
        setSecondsLeft(data.type === 'Test' && data.duration ? Number(data.duration) * 60 : null)
      })
      .catch(setError)
  }, [assessmentId])

  const handleSubmit = useCallback(async () => {
    if (submitting || !assessment) return
    setSubmitting(true)
    try {
      const result = await submitAssessment(assessmentId, answers)
      if (result.percent !== null) {
        navigate(`/student/assessments/${assessmentId}/result`, { state: { result, assessment } })
      } else {
        toast.success('Assignment submitted successfully. Your professor will review it.')
        navigate('/student/assessments')
      }
    } catch (err) {
      toast.error(err.message || 'Could not submit your assessment.')
      setSubmitting(false)
    }
  }, [submitting, assessment, assessmentId, answers, navigate, toast])

  useEffect(() => {
    if (secondsLeft === null) return undefined
    if (secondsLeft <= 0) {
      handleSubmit()
      return undefined
    }
    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft, handleSubmit])

  if (error) return <div className="flex min-h-[70vh] items-center justify-center"><ErrorState title="Assessment unavailable" description={error.message} onRetry={() => navigate('/student/assessments')} /></div>
  if (!assessment) return <div className="mx-auto max-w-3xl"><SkeletonCard /></div>

  const questions = Array.isArray(assessment.questions) ? assessment.questions : []
  if (questions.length === 0) return <div className="flex min-h-[60vh] items-center justify-center"><ErrorState title="No questions available" description="This assessment has no questions yet. Ask your professor to add questions before publishing." onRetry={() => navigate('/student/assessments')} /></div>

  const question = questions[current]
  const answeredCount = Object.keys(answers).length
  const isLow = secondsLeft !== null && secondsLeft <= 60

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-ink-500">{assessment.courseName} · {assessment.type}</p>
          <h1 className="text-xl font-semibold text-brand-800">{assessment.name}</h1>
        </div>
        {secondsLeft !== null && <div className={cn('flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold', isLow ? 'border-danger-500/30 bg-danger-50 text-danger-600' : 'border-ink-200 bg-white text-ink-700')}><Clock className="size-4" />{formatDuration(Math.max(secondsLeft, 0))}</div>}
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {questions.map((item, index) => <button key={item.id ?? index} onClick={() => setCurrent(index)} className={cn('flex size-8 items-center justify-center rounded-lg text-xs font-semibold', index === current ? 'bg-teal-500 text-white' : answers[index] !== undefined ? 'bg-moss-100 text-moss-700' : 'bg-ink-100 text-ink-500')}>{index + 1}</button>)}
      </div>

      <Card>
        <CardBody>
          <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-teal-600"><FileText className="size-3.5" /> Question {current + 1} of {questions.length}</div>
          <h2 className="mb-5 text-lg font-medium text-brand-900">{question.text || question.question}</h2>

          {question.type === 'MCQ' && <div className="space-y-2.5">{question.options.map((option, index) => <button key={option} onClick={() => setAnswers((a) => ({ ...a, [current]: index }))} className={cn('flex w-full items-center gap-3 rounded-xl border p-3.5 text-left text-sm', answers[current] === index ? 'border-teal-400 bg-teal-50 text-teal-800' : 'border-ink-200 hover:border-ink-300')}><span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold', answers[current] === index ? 'border-teal-500 bg-teal-500 text-white' : 'border-ink-300 text-ink-500')}>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>}
          {question.type === 'True/False' && <div className="grid grid-cols-2 gap-3">{['True', 'False'].map((option, index) => <button key={option} onClick={() => setAnswers((a) => ({ ...a, [current]: index }))} className={cn('rounded-xl border p-4 text-sm font-medium', answers[current] === index ? 'border-teal-400 bg-teal-50 text-teal-800' : 'border-ink-200 hover:border-ink-300')}>{option}</button>)}</div>}
          {(question.type === 'Fill in the Blank' || question.type === 'Short Answer') && <textarea rows={question.type === 'Short Answer' ? 7 : 3} value={answers[current] ?? ''} onChange={(e) => setAnswers((a) => ({ ...a, [current]: e.target.value }))} placeholder={question.type === 'Short Answer' ? 'Write your answer here...' : 'Enter your answer...'} className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100" />}
        </CardBody>
      </Card>

      <div className="mt-5 flex items-center justify-between gap-3">
        <Button variant="secondary" icon={ChevronLeft} disabled={current === 0} onClick={() => setCurrent((value) => Math.max(0, value - 1))}>Previous</Button>
        <p className="text-sm text-ink-500">{answeredCount} of {questions.length} answered</p>
        {current === questions.length - 1 ? <Button icon={Flag} onClick={() => setConfirmOpen(true)}>Submit</Button> : <Button icon={ChevronRight} iconPosition="right" onClick={() => setCurrent((value) => Math.min(questions.length - 1, value + 1))}>Next</Button>}
      </div>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleSubmit} loading={submitting} title={`Submit ${assessment.type.toLowerCase()}?`} description={answeredCount < questions.length ? `You've answered ${answeredCount} of ${questions.length} questions. Unanswered questions will remain blank.` : 'Make sure your answers are final before submitting.'} confirmLabel="Submit" />
    </div>
  )
}
