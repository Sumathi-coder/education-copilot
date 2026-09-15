import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Clock, ChevronLeft, ChevronRight, Flag } from 'lucide-react'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/EmptyState'
import { getQuiz, submitQuiz } from '../../services/quizService'
import { formatDuration } from '../../utils/formatters'
import { useToast } from '../../hooks/useToast'
import { cn } from '../../utils/cn'

export default function Quiz() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [quiz, setQuiz] = useState(null)
  const [error, setError] = useState(null)
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getQuiz(quizId)
      .then((data) => {
        setQuiz(data)
        setSecondsLeft(data.durationMinutes * 60)
      })
      .catch(setError)
  }, [quizId])

  const handleSubmit = useCallback(async () => {
    if (submitting || !quiz) return
    setSubmitting(true)
    try {
      await submitQuiz(quizId, answers)
      navigate(`/student/quiz/${quizId}/result`)
    } catch {
      toast.error('Could not submit your test. Please try again.')
      setSubmitting(false)
    }
  }, [submitting, quiz, quizId, answers, navigate, toast])

  useEffect(() => {
    if (secondsLeft === null) return undefined
    if (secondsLeft <= 0) {
      handleSubmit()
      return undefined
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft, handleSubmit])

  const answeredCount = Object.keys(answers).length

  const question = quiz?.questions[current]
  const isLow = secondsLeft !== null && secondsLeft <= 60

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand-50 p-6">
        <ErrorState title="Test unavailable" description={error.message} onRetry={() => navigate('/student/quiz/create')} />
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand-50 p-6">
        <SkeletonCard className="w-full max-w-3xl" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand-50 px-4 py-8 sm:px-6">
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-ink-500">{quiz.courseName} · {quiz.topic}</p>
          <h1 className="text-xl font-semibold text-brand-800">Practice Test</h1>
        </div>
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold',
            isLow ? 'border-danger-500/30 bg-danger-50 text-danger-600' : 'border-ink-200 bg-white text-ink-700',
          )}
        >
          <Clock className="size-4" />
          {formatDuration(Math.max(secondsLeft, 0))}
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {quiz.questions.map((q, index) => (
          <button
            key={q.id}
            onClick={() => setCurrent(index)}
            className={cn(
              'flex size-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors',
              index === current
                ? 'bg-teal-500 text-white'
                : answers[index] !== undefined
                  ? 'bg-moss-100 text-moss-700'
                  : 'bg-ink-100 text-ink-500',
            )}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-ink-200 bg-white p-6">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-teal-600">
          Question {current + 1} of {quiz.questions.length} · {question.topic}
        </p>
        <h2 className="mb-5 text-lg font-medium text-brand-900">{question.question}</h2>

        <div className="space-y-2.5">
          {question.options.map((option, index) => {
            const selected = answers[current] === index
            return (
              <button
                key={option}
                onClick={() => setAnswers((a) => ({ ...a, [current]: index }))}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border p-3.5 text-left text-sm transition-colors',
                  selected ? 'border-teal-400 bg-teal-50 text-teal-800' : 'border-ink-200 hover:border-ink-300',
                )}
              >
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                    selected ? 'border-teal-500 bg-teal-500 text-white' : 'border-ink-300 text-ink-500',
                  )}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Button
          variant="secondary"
          icon={ChevronLeft}
          disabled={current === 0}
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
        >
          Previous
        </Button>
        <p className="text-sm text-ink-500">{answeredCount} of {quiz.questions.length} answered</p>
        {current === quiz.questions.length - 1 ? (
          <Button icon={Flag} onClick={() => setConfirmOpen(true)}>
            Submit Test
          </Button>
        ) : (
          <Button icon={ChevronRight} iconPosition="right" onClick={() => setCurrent((c) => Math.min(quiz.questions.length - 1, c + 1))}>
            Next
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSubmit}
        loading={submitting}
        title="Submit practice test?"
        description={
          answeredCount < quiz.questions.length
            ? `You've answered ${answeredCount} of ${quiz.questions.length} questions. Unanswered questions will be marked incorrect.`
            : 'You can review your answers and explanations right after submitting.'
        }
        confirmLabel="Submit"
      />
    </div>
    </div>
  )
}
