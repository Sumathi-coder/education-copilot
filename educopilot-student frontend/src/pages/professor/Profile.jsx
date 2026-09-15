import { useState } from 'react'
import { Save, Lock, Mail, Building2, Bell } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Card, { CardBody } from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Tabs from '../../components/ui/Tabs'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { initials, sleep } from '../../utils/formatters'

const defaultNotifications = [
  { key: 'submissions', label: 'New submission alerts', description: 'Get notified when a student submits a test or assignment.' },
  { key: 'grading', label: 'Grading reminders', description: 'Reminders for submissions waiting to be graded.' },
  { key: 'digest', label: 'Weekly analytics digest', description: 'A weekly summary of class performance by email.' },
]

export default function Profile() {
  const { user } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState('profile')

  const [form, setForm] = useState({ name: user?.name ?? '', department: user?.department ?? '' })
  const [saving, setSaving] = useState(false)

  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [passwordError, setPasswordError] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const [notifications, setNotifications] = useState({ submissions: true, grading: true, digest: false })

  async function handleSaveProfile(event) {
    event.preventDefault()
    setSaving(true)
    await sleep(500)
    setSaving(false)
    toast.success('Profile updated.')
  }

  async function handleSavePassword(event) {
    event.preventDefault()
    if (passwordForm.next.length < 8) return setPasswordError('New password must be at least 8 characters.')
    if (passwordForm.next !== passwordForm.confirm) return setPasswordError('Passwords do not match.')
    setPasswordError('')
    setSavingPassword(true)
    await sleep(600)
    setSavingPassword(false)
    setPasswordForm({ current: '', next: '', confirm: '' })
    toast.success('Password updated.')
  }

  function toggleNotification(key) {
    setNotifications((current) => ({ ...current, [key]: !current[key] }))
    toast.success('Notification preference saved.')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Profile & Settings" subtitle="Manage your account information, security, and notifications." />

      <Card className="mb-6">
        <CardBody className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-brand-700 text-xl font-semibold text-white">
            {initials(user?.name ?? 'P')}
          </div>
          <div>
            <p className="text-lg font-semibold text-brand-800">{user?.name}</p>
            <p className="flex items-center gap-1.5 text-sm text-ink-500"><Mail className="size-3.5" /> {user?.email}</p>
            <p className="flex items-center gap-1.5 text-sm text-ink-500"><Building2 className="size-3.5" /> {user?.department}</p>
          </div>
        </CardBody>
      </Card>

      <Tabs
        tabs={[
          { value: 'profile', label: 'Profile Details' },
          { value: 'security', label: 'Security' },
          { value: 'notifications', label: 'Notifications' },
        ]}
        active={tab}
        onChange={setTab}
        className="mb-5"
      />

      {tab === 'profile' && (
        <Card>
          <CardBody>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <Input label="Full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <Input label="Email" value={user?.email ?? ''} disabled hint="Contact support to change your email." />
              <Input label="Department" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} />
              <Button type="submit" icon={Save} loading={saving}>Save changes</Button>
            </form>
          </CardBody>
        </Card>
      )}

      {tab === 'security' && (
        <Card>
          <CardBody>
            <form onSubmit={handleSavePassword} className="space-y-4">
              <Input label="Current password" type="password" icon={Lock} value={passwordForm.current} onChange={(e) => setPasswordForm((f) => ({ ...f, current: e.target.value }))} />
              <Input label="New password" type="password" icon={Lock} value={passwordForm.next} onChange={(e) => setPasswordForm((f) => ({ ...f, next: e.target.value }))} hint="At least 8 characters." />
              <Input label="Confirm new password" type="password" icon={Lock} value={passwordForm.confirm} onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))} error={passwordError} />
              <Button type="submit" icon={Save} loading={savingPassword}>Update password</Button>
            </form>
          </CardBody>
        </Card>
      )}

      {tab === 'notifications' && (
        <Card>
          <CardBody className="space-y-3">
            {defaultNotifications.map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4 rounded-lg border border-ink-100 p-3.5">
                <div className="flex items-start gap-2.5">
                  <Bell className="mt-0.5 size-4 shrink-0 text-ink-400" />
                  <div>
                    <p className="text-sm font-medium text-ink-800">{item.label}</p>
                    <p className="text-xs text-ink-500">{item.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleNotification(item.key)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${notifications[item.key] ? 'bg-teal-500' : 'bg-ink-200'}`}
                  aria-pressed={notifications[item.key]}
                  aria-label={`Toggle ${item.label}`}
                >
                  <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
