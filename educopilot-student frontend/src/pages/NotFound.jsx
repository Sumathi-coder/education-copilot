import { Link } from 'react-router-dom'
import { Compass, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-sand-50 px-4 text-center">
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-brand-700 text-sand-50 shadow-soft">
        <Compass className="size-6" />
      </div>
      <h1 className="text-2xl font-semibold text-brand-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-500">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Button as={Link} to="/" variant="secondary" className="mt-6" icon={ArrowLeft}>
        Back to safety
      </Button>
    </div>
  )
}
