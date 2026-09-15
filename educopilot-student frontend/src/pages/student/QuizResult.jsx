import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Trophy, RotateCcw, CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import Card, { CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/EmptyState'
import { getQuiz, getQuizResult } from '../../services/quizService'
import { scoreTone } from '../../utils/formatters'
import { cn } from '../../utils/cn'

export default function QuizResult() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [result, quiz] = await Promise.all([getQuizResult(quizId), getQuiz(quizId)])
        if (!cancelled) setState({ status: 'full', result, quiz })
      } catch {
        if (!cancelled) {
          setState({ status: 'error' })
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [quizId])

  if (state.status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand-50 p-6">
        <SkeletonCard className="w-full max-w-3xl" />
      </div>
    )
  }
  if (state.status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand-50 p-6">
        <ErrorState
          title="Result not found"
          description="This test result may have expired."
          onRetry={() => navigate('/student/quiz/create')}
        />
      </div>
    )
  }

  const { result } = state
  const tone = scoreTone(result.percent)
  const badgeTone = tone === 'moss' ? 'moss' : tone === 'warn' ? 'warn' : 'danger'

  return (
    <div className="min-h-screen bg-sand-50 px-4 py-8 sm:px-6">
    <div className="mx-auto max-w-3xl">
      <Card className="mb-6 text-center">
        <CardBody>
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-teal-50 text-teal-600">
            <Trophy className="size-7" />
          </div>
          <p className="text-sm text-ink-500">{result.courseName} · {result.topic}</p>
          <p className="mt-1 text-4xl font-semibold text-brand-800">{result.percent}%</p>
          <p className="mt-1 text-sm text-ink-500">{result.score} out of {result.total} correct</p>
          <Badge tone={badgeTone} className="mt-3">
            {result.percent >= 75 ? 'Strong performance' : result.percent >= 50 ? 'Room to improve' : 'Needs revision'}
          </Badge>

          <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
            <Button as={Link} to="/student/quiz/create" variant="secondary" icon={RotateCcw}>
              Try another test
            </Button>
            {result.percent < 70 && (
              <Button as={Link} to="/student/revision" icon={Sparkles}>
                Go to revision plan
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {state.status === 'summary' && (
        <p className="mb-6 rounded-lg bg-sand-100 px-3.5 py-3 text-center text-xs text-ink-600">
          This is a past result. Question-by-question review is only available right after taking a test.
        </p>
      )}

      {state.status === 'full' && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-brand-800">Question Review</h2>
          <div className="space-y-3">
            {state.quiz.questions.map((question, index) => {
              const userAnswer = result.answers[index]
              const isCorrect = userAnswer === question.correctIndex
              return (
                <Card key={question.id}>
                  <CardBody>
                    <div className="mb-3 flex items-start gap-2.5">
                      {isCorrect ? (
                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-moss-500" />
                      ) : (
                        <XCircle className="mt-0.5 size-5 shrink-0 text-danger-500" />
                      )}
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
                          Q{index + 1} · {question.topic}
                        </p>
                        <p className="mt-0.5 font-medium text-ink-900">{question.question}</p>
                      </div>
                    </div>
                    <div className="ml-7 space-y-1.5">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={option}
                          className={cn(
                            'rounded-lg border px-3 py-2 text-sm',
                            optIndex === question.correctIndex
                              ? 'border-moss-300 bg-moss-50 text-moss-800'
                              : optIndex === userAnswer
                                ? 'border-danger-500/30 bg-danger-50 text-danger-600'
                                : 'border-ink-100 text-ink-500',
                          )}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                    <p className="ml-7 mt-3 text-sm text-ink-600">
                      <span className="font-medium text-ink-800">Why: </span>
                      {question.explanation}
                    </p>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
    </div>
  )
}
