import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ProgressBar from '../ui/ProgressBar'
import Badge from '../ui/Badge'
import { scoreTone } from '../../utils/formatters'

export default function StudentTable({ students, analyticsLinkBase = '/professor/analytics/student' }) {
  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
      {/* Desktop table */}
      <table className="hidden w-full text-sm sm:table">
        <thead>
          <tr className="border-b border-ink-100 bg-sand-50 text-left text-xs font-medium uppercase tracking-wide text-ink-400">
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Average</th>
            <th className="px-4 py-3">Tests</th>
            <th className="px-4 py-3">Progress</th>
            <th className="px-4 py-3">Weak Topic</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} className="border-b border-ink-100 last:border-0 hover:bg-sand-50/60">
              <td className="px-4 py-3">
                <p className="font-medium text-ink-800">{student.name}</p>
                <p className="text-xs text-ink-400">{student.rollNumber}</p>
              </td>
              <td className="px-4 py-3">
                <Badge tone={scoreTone(student.avgScore) === 'moss' ? 'moss' : scoreTone(student.avgScore) === 'warn' ? 'warn' : 'danger'}>
                  {student.avgScore}%
                </Badge>
              </td>
              <td className="px-4 py-3 text-ink-600">{student.testsTaken}</td>
              <td className="px-4 py-3 w-40">
                <ProgressBar value={student.progress} tone="teal" size="sm" />
              </td>
              <td className="px-4 py-3 text-ink-600">{student.weakTopic}</td>
              <td className="px-4 py-3 text-right">
                <Link
                  to={`${analyticsLinkBase}/${student.id}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700"
                >
                  View <ArrowRight className="size-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="divide-y divide-ink-100 sm:hidden">
        {students.map((student) => (
          <Link key={student.id} to={`${analyticsLinkBase}/${student.id}`} className="block p-4 hover:bg-sand-50/60">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="font-medium text-ink-800">{student.name}</p>
                <p className="text-xs text-ink-400">{student.rollNumber}</p>
              </div>
              <Badge tone={scoreTone(student.avgScore) === 'moss' ? 'moss' : scoreTone(student.avgScore) === 'warn' ? 'warn' : 'danger'}>
                {student.avgScore}%
              </Badge>
            </div>
            <ProgressBar value={student.progress} tone="teal" size="sm" />
            <p className="mt-2 text-xs text-ink-500">{student.testsTaken} tests · Weak: {student.weakTopic}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
