import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import AuthShell from '../../components/layout/AuthShell'
import { requestPasswordReset } from '../../services/authService'
import { useToast } from '../../hooks/useToast'

export default function ForgotPassword() {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!email) return setError('Email is required.')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.')
    setError('')
    setLoading(true)
    try {
      await requestPasswordReset(email)
      setSent(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthShell title="Check your inbox" subtitle="We've sent password reset instructions.">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-moss-100 text-moss-700">
            <CheckCircle2 className="size-6" />
          </div>
          <p className="text-sm text-ink-600">
            If an account exists for <span className="font-medium text-ink-800">{email}</span>, a reset link is on its way. It may take a few minutes to arrive.
          </p>
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700">
            <ArrowLeft className="size-4" />
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Forgot password?" subtitle="Enter your email and we'll send you a reset link.">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Email"
          type="email"
          icon={Mail}
          placeholder="you@university.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          autoComplete="email"
        />
        <Button type="submit" className="w-full" loading={loading} icon={ArrowRight} iconPosition="right">
          Send reset link
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">
        <Link to="/login" className="inline-flex items-center gap-1.5 font-medium text-teal-600 hover:text-teal-700">
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  )
}
