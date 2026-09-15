import { GraduationCap } from 'lucide-react'

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand-700 text-sand-50 shadow-soft">
            <GraduationCap className="size-6" />
          </div>
          <p className="font-display text-lg font-semibold text-brand-800">EduCopilot</p>
          <h1 className="mt-3 text-2xl font-semibold text-brand-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-ink-500">{subtitle}</p>}
        </div>
        <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-soft sm:p-8">{children}</div>
      </div>
    </div>
  )
}
