import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  CalendarRange,
  Sparkles,
  ListChecks,
  Inbox,
  BarChart3,
  UserCircle,
  Settings,
  LogOut,
  GraduationCap,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { initials } from '../../utils/formatters'
import { cn } from '../../utils/cn'

const navItems = [
  { to: '/professor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/professor/courses', label: 'My Courses', icon: BookOpen },
  { to: '/professor/planner', label: 'Lecture Planner', icon: CalendarRange },
  { to: '/professor/material-generator', label: 'AI Material Generator', icon: Sparkles },
  { to: '/professor/assessments', label: 'Assessments', icon: ListChecks },
  { to: '/professor/submissions', label: 'Submissions', icon: Inbox },
  { to: '/professor/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/professor/profile', label: 'Profile', icon: UserCircle },
]

export default function ProfessorSidebar({ onNavigate }) {
  const { user, logout } = useAuth()

  return (
    <div className="flex h-full w-64 flex-col bg-brand-700 text-sand-50">
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sand-100 text-brand-700">
          <GraduationCap className="size-4.5" />
        </div>
        <div>
          <p className="font-display text-base font-semibold leading-tight">EduCopilot</p>
          <p className="text-[11px] text-brand-200">Professor workspace</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 scrollbar-thin">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-brand-100 hover:bg-brand-600/60 hover:text-white',
              )
            }
          >
            <Icon className="size-4.5 shrink-0" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-brand-600 px-3 py-3">
        <NavLink
          to="/professor/profile"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-100 transition-colors hover:bg-brand-600/60 hover:text-white"
        >
          <Settings className="size-4.5 shrink-0" aria-hidden="true" />
          Settings
        </NavLink>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-brand-100 transition-colors hover:bg-brand-600/60 hover:text-white"
        >
          <LogOut className="size-4.5 shrink-0" aria-hidden="true" />
          Logout
        </button>
      </div>

      <div className="flex items-center gap-2.5 border-t border-brand-600 px-4 py-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rosy-400 text-sm font-semibold text-brand-900">
          {initials(user?.name ?? 'Professor')}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{user?.name ?? 'Professor'}</p>
          <p className="truncate text-xs text-brand-200">{user?.department ?? user?.email}</p>
        </div>
      </div>
    </div>
  )
}
