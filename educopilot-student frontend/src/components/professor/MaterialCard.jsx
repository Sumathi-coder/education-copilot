import { FileText, Loader2, CheckCircle2, AlertCircle, Eye, Trash2 } from 'lucide-react'
import Badge from '../ui/Badge'
import { formatDate } from '../../utils/formatters'

const statusConfig = {
  ready: { label: 'Ready', tone: 'moss', icon: CheckCircle2 },
  processing: { label: 'Processing', tone: 'teal', icon: Loader2 },
  uploaded: { label: 'Uploaded', tone: 'neutral', icon: FileText },
  failed: { label: 'Failed', tone: 'danger', icon: AlertCircle },
}

export default function MaterialCard({ material, onDelete }) {
  const status = statusConfig[material.status] ?? statusConfig.ready
  const StatusIcon = status.icon

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-white p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
          <FileText className="size-4.5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink-800">{material.name}</p>
          <p className="text-xs text-ink-400">
            {material.type} · {(material.sizeKb / 1024).toFixed(1)} MB · {formatDate(material.uploadedOn)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge tone={status.tone} icon={StatusIcon} className={material.status === 'processing' ? '[&>svg]:animate-spin' : ''}>
          {status.label}
        </Badge>
        <button className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink-700" aria-label="View material">
          <Eye className="size-4" />
        </button>
        <button
          className="rounded-lg p-1.5 text-ink-400 hover:bg-danger-50 hover:text-danger-500"
          aria-label="Delete material"
          onClick={() => onDelete?.(material)}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  )
}
