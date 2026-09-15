import { AlertTriangle } from 'lucide-react'
import ProgressBar from '../ui/ProgressBar'
import { scoreTone } from '../../utils/formatters'

export default function WeakTopicCard({ topic, percent, courseName, onClick }) {
  const tone = scoreTone(percent) === 'moss' ? 'moss' : scoreTone(percent) === 'warn' ? 'rosy' : 'danger'

  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-ink-200 bg-white p-4 text-left transition-colors hover:border-rosy-300 hover:bg-rosy-50/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rosy-400" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-ink-800">{topic}</p>
            {courseName && <p className="text-xs text-ink-400">{courseName}</p>}
          </div>
        </div>
        <span className="shrink-0 text-sm font-semibold text-ink-700">{percent}%</span>
      </div>
      <ProgressBar value={percent} tone={tone === 'danger' ? 'danger' : 'rosy'} size="sm" className="mt-3" />
    </button>
  )
}
