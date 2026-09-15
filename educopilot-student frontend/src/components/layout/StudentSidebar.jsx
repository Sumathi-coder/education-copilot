import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  CalendarClock,
  ListChecks,
  ClipboardCheck,
  LineChart,
  RotateCcw,
  UserCircle,
  Settings,
  LogOut,
  GraduationCap,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { initials } from '../../utils/formatters'
import { cn } from '../../utils/cn'

const navItems = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/courses', label: 'My Courses', icon: BookOpen },
  { to: '/student/tutor', label: 'AI Tutor', icon: Sparkles },
  { to: '/student/study-plan', label: 'Study Plan', icon: CalendarClock },
  { to: '/student/quiz/create', label: 'Practice Tests', icon: ListChecks },
  { to: '/student/assessments', label: 'Assignments & Tests', icon: ClipboardCheck },
  { to: '/student/performance', label: 'Performance', icon: LineChart },
  { to: '/student/revision', label: 'Revision', icon: RotateCcw },
  { to: '/student/profile', label: 'Profile', icon: UserCircle },
]

export default function StudentSidebar({ onNavigate }) {
  const { user, logout } = useAuth()

  return (
    <div className="flex h-full w-64 flex-col bg-brand-700 text-sand-50">
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sand-100 text-brand-700">
          <GraduationCap className="size-4.5" />
        </div>
        <div>
          <p className="font-display text-base font-semibold leading-tight">EduCopilot</p>
          <p className="text-[11px] text-brand-200">Student workspace</p>
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
          to="/student/profile"
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
          {initials(user?.name ?? 'Student')}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{user?.name ?? 'Student'}</p>
          <p className="truncate text-xs text-brand-200">{user?.rollNumber ?? user?.email}</p>
        </div>
      </div>
    </div>
  )
}
