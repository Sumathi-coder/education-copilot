import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, Briefcase, ArrowRight } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import AuthShell from '../../components/layout/AuthShell'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { cn } from '../../utils/cn'

export default function Register() {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', email: '', studentId: '', password: '', confirmPassword: '', role: 'student',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Full name is required.'
    if (form.role === 'student' && !form.studentId.trim()) nextErrors.studentId = 'Student ID is required.'
    if (!form.email) nextErrors.email = 'Email is required.'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.'
    if (!form.password) nextErrors.password = 'Password is required.'
    else if (form.password.length < 8) nextErrors.password = 'Use at least 8 characters.'
    if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Passwords do not match.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const user = await register(form)
      toast.success('Account created. Welcome to EduCopilot!')
      navigate(user.role === 'professor' ? '/professor/dashboard' : '/student/dashboard', { replace: true })
    } catch (error) {
      toast.error(error.message || 'Could not create your account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Set up EduCopilot in under a minute.">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <RoleOption
            icon={GraduationCap}
            label="Student"
            active={form.role === 'student'}
            onClick={() => setForm((f) => ({ ...f, role: 'student' }))}
          />
          <RoleOption
            icon={Briefcase}
            label="Professor"
            active={form.role === 'professor'}
            onClick={() => setForm((f) => ({ ...f, role: 'professor' }))}
          />
        </div>

        <Input
          label="Full name"
          icon={User}
          placeholder="Your full name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          error={errors.name}
          autoComplete="name"
        />
        {form.role === 'student' && (
          <Input
            label="Student ID"
            placeholder="e.g. 24CS101"
            value={form.studentId}
            onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
            error={errors.studentId}
          />
        )}

        <Input
          label="Email"
          type="email"
          icon={Mail}
          placeholder="you@university.edu"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          error={errors.email}
          autoComplete="email"
        />
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          icon={Lock}
          placeholder="At least 8 characters"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          error={errors.password}
          autoComplete="new-password"
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-ink-400 hover:text-ink-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />
        <Input
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          icon={Lock}
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        {form.role === 'professor' && (
          <p className="rounded-lg bg-sand-100 px-3 py-2 text-xs text-ink-600">
            The professor workspace ships in Part 2 of EduCopilot — you can still create your account now.
          </p>
        )}

        <Button type="submit" className="w-full" loading={loading} icon={ArrowRight} iconPosition="right">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-teal-600 hover:text-teal-700">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}

function RoleOption({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5 rounded-xl border p-3.5 text-sm font-medium transition-colors',
        active ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-ink-200 text-ink-500 hover:border-ink-300',
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
      {label}
    </button>
  )
}
