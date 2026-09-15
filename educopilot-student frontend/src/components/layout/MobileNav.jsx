import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Sparkles, LineChart, Menu } from 'lucide-react'
import { cn } from '../../utils/cn'

const studentTabs = [
  { to: '/student/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/student/courses', label: 'Courses', icon: BookOpen },
  { to: '/student/tutor', label: 'AI Tutor', icon: Sparkles },
  { to: '/student/performance', label: 'Stats', icon: LineChart },
]

export default function MobileNav({ onMore, tabs = studentTabs }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-ink-200 bg-white/95 py-1.5 backdrop-blur lg:hidden">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={label}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors',
              isActive ? 'text-teal-600' : 'text-ink-400',
            )
          }
        >
          <Icon className="size-5" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
      <button
        onClick={onMore}
        className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium text-ink-400"
      >
        <Menu className="size-5" aria-hidden="true" />
        More
      </button>
    </nav>
  )
}
