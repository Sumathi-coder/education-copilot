import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Sparkles, Send } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Card, { CardBody, CardHeader } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import ProgressBar from '../../components/ui/ProgressBar'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/EmptyState'
import { fetchSubmissionById, publishGrade } from '../../services/professorService'
import { formatDate } from '../../utils/formatters'
import { useToast } from '../../hooks/useToast'
import { cn } from '../../utils/cn'

export default function Grading() {
  const { submissionId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [score, setScore] = useState('')
  const [questionScores, setQuestionScores] = useState({})
  const [acceptedAI, setAcceptedAI] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    fetchSubmissionById(submissionId)
      .then((result) => {
        setData(result)
        const initialScores = {}
        result.questions.forEach((q, index) => {
          const max = Number(q.marks ?? q.mark ?? 1) || 1
          const saved = result.submission.questionScores?.[index]
          if (saved !== undefined && saved !== null) {
            initialScores[index] = saved
          } else if ((q.type === 'MCQ' || q.type === 'True/False') && q.studentAnswerIndex !== undefined) {
            initialScores[index] = Number(q.studentAnswerIndex) === Number(q.correctIndex) ? max : 0
          } else if (q.type === 'Fill in the Blank' && q.studentAnswer) {
            initialScores[index] = String(q.studentAnswer).trim().toLowerCase() === String(q.correctAnswer ?? '').trim().toLowerCase() ? max : 0
          } else {
            initialScores[index] = ''
          }
        })
        setQuestionScores(initialScores)
        const initialTotal = Object.values(initialScores).reduce((sum, value) => sum + (Number(value) || 0), 0)
        setScore(String(initialTotal))
      })
      .catch(setError)
  }, [submissionId])

  async function handlePublish() {
    setPublishing(true)
    try {
      await publishGrade(submissionId, { score: Number(score), questionScores, feedback })
      toast.success('Grade published to the student.')
      navigate('/professor/submissions')
    } catch {
      toast.error('Could not publish the grade.')
    } finally {
      setPublishing(false)
    }
  }

  if (error) {
    return <ErrorState title="Submission not found" description={error.message} onRetry={() => navigate('/professor/submissions')} />
  }
  if (!data) return <SkeletonCard />

  const { submission, questions } = data
  const isObjective = submission.type === 'objective'
  const awardedTotal = Object.values(questionScores).reduce((sum, value) => sum + (Number(value) || 0), 0)

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        breadcrumbs={[{ label: 'Submissions', to: '/professor/submissions' }, { label: submission.studentName }]}
        title={`Grading — ${submission.studentName}`}
        subtitle={`${submission.assessmentName} · ${submission.courseName} · Submitted ${formatDate(submission.submittedOn)}`}
      />

      <Card className="mb-5">
        <CardBody className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-ink-500">Roll Number</p>
            <p className="font-medium text-ink-800">{submission.rollNumber}</p>
          </div>
          <div>
            <p className="text-xs text-ink-500">Total Marks</p>
            <p className="font-medium text-ink-800">{submission.totalMarks}</p>
          </div>
          <div>
            <p className="text-xs text-ink-500">Status</p>
            <Badge tone={submission.status === 'graded' ? 'moss' : 'warn'}>{submission.status}</Badge>
          </div>
        </CardBody>
      </Card>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Question {index + 1}</p>
                <span className="text-xs font-semibold text-teal-700">{Number(question.marks ?? question.mark ?? 1) || 1} marks</span>
              </div>
            </CardHeader>
            <CardBody>
              <p className="mb-3 font-medium text-ink-900">{question.question}</p>

              {String(question.type).toLowerCase() === 'mcq' || String(question.type).toLowerCase() === 'true/false' ? (
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={option}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                        optIndex === question.correctIndex
                          ? 'border-moss-300 bg-moss-50 text-moss-800'
                          : optIndex === question.studentAnswerIndex
                            ? 'border-danger-500/30 bg-danger-50 text-danger-600'
                            : 'border-ink-100 text-ink-500',
                      )}
                    >
                      {optIndex === question.correctIndex ? (
                        <CheckCircle2 className="size-4 shrink-0" />
                      ) : optIndex === question.studentAnswerIndex ? (
                        <XCircle className="size-4 shrink-0" />
                      ) : (
                        <span className="size-4 shrink-0" />
                      )}
                      {option}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="mb-1 text-xs font-medium text-ink-500">Student Answer</p>
                    <p className="rounded-lg bg-sand-50 p-3 text-sm leading-relaxed text-ink-700">{question.studentAnswer}</p>
                  </div>

                  {question.aiEvaluation && (
                    <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-4">
                      <div className="mb-3 flex items-center gap-1.5 text-sm font-medium text-teal-800">
                        <Sparkles className="size-4" /> AI Evaluation
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <RubricStat label="Concept Accuracy" value={question.aiEvaluation.conceptAccuracy} />
                        <RubricStat label="Key Points" value={question.aiEvaluation.keyPoints} />
                        <RubricStat label="Example" value={question.aiEvaluation.example} />
                        <RubricStat label="Clarity" value={question.aiEvaluation.clarity} />
                      </div>
                      <p className="mt-3 text-sm text-ink-700">{question.aiEvaluation.notes}</p>
                      <div className="mt-3 flex items-center justify-between rounded-lg bg-white px-3 py-2">
                        <span className="text-sm text-ink-600">AI Suggested Score</span>
                        <span className="font-semibold text-teal-700">
                          {question.aiEvaluation.suggestedScore} / {question.aiEvaluation.maxScore}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="mt-5">
        <CardBody>
          <p className="mb-3 font-medium text-brand-800">Finalize Grade</p>
          <p className="mb-3 text-sm text-ink-500">Total awarded: <span className="font-semibold text-brand-800">{awardedTotal} / {submission.totalMarks}</span></p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={`Score (out of ${submission.totalMarks})`}
              type="number"
              min={0}
              max={submission.totalMarks}
              value={awardedTotal}
              readOnly
            />
            {!isObjective && (
              <div className="flex items-end">
                <Button variant="secondary" size="sm" onClick={() => { setScore(String(questions[0]?.aiEvaluation?.suggestedScore ?? score)); setAcceptedAI(true) }}>
                  {acceptedAI ? 'AI score applied' : 'Accept AI Score'}
                </Button>
              </div>
            )}
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Feedback for student</label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add a note about what went well and what to improve..."
              className="w-full resize-none rounded-lg border border-ink-200 px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
          </div>
          <Button className="mt-4 w-full" icon={Send} loading={publishing} onClick={handlePublish}>
            Publish Grade
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}

function RubricStat({ label, value }) {
  return (
    <div>
      <p className="mb-1 text-xs text-ink-500">{label}</p>
      <ProgressBar value={value} tone="teal" size="sm" />
      <p className="mt-1 text-xs font-medium text-ink-700">{value}%</p>
    </div>
  )
}
