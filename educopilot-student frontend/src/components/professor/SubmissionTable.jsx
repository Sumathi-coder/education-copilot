import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Badge from '../ui/Badge'
import { formatDate } from '../../utils/formatters'

const statusConfig = {
  graded: { label: 'Graded', tone: 'moss' },
  pending: { label: 'Pending', tone: 'neutral' },
  'needs-review': { label: 'Needs Review', tone: 'warn' },
}

export default function SubmissionTable({ submissions }) {
  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
      <table className="hidden w-full text-sm sm:table">
        <thead>
          <tr className="border-b border-ink-100 bg-sand-50 text-left text-xs font-medium uppercase tracking-wide text-ink-400">
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Assessment</th>
            <th className="px-4 py-3">Submitted</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => {
            const status = statusConfig[submission.status]
            return (
              <tr key={submission.id} className="border-b border-ink-100 last:border-0 hover:bg-sand-50/60">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink-800">{submission.studentName}</p>
                  <p className="text-xs text-ink-400">{submission.rollNumber}</p>
                </td>
                <td className="px-4 py-3 text-ink-600">{submission.assessmentName}</td>
                <td className="px-4 py-3 text-ink-500">{formatDate(submission.submittedOn)}</td>
                <td className="px-4 py-3 text-ink-600">
                  {submission.score !== null ? `${submission.score ?? '—'}/${submission.totalMarks ?? 0}` : '—'}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={status.tone}>{status.label}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/professor/grading/${submission.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700"
                  >
                    Grade <ArrowRight className="size-3.5" />
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="divide-y divide-ink-100 sm:hidden">
        {submissions.map((submission) => {
          const status = statusConfig[submission.status]
          return (
            <Link key={submission.id} to={`/professor/grading/${submission.id}`} className="block p-4 hover:bg-sand-50/60">
              <div className="mb-1 flex items-center justify-between">
                <p className="font-medium text-ink-800">{submission.studentName}</p>
                <Badge tone={status.tone}>{status.label}</Badge>
              </div>
              <p className="text-xs text-ink-500">{submission.assessmentName}</p>
              <p className="mt-1 text-xs text-ink-400">
                {formatDate(submission.submittedOn)} · {submission.score !== null ? `${submission.score ?? '—'}/${submission.totalMarks ?? 0}` : 'Not graded'}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
