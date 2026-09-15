import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Bell, Sun, Moon, ChevronDown, LogOut, UserCircle, Settings } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Dropdown from '../ui/Dropdown'
import { initials } from '../../utils/formatters'
import { readStore, subscribeStore } from '../../services/localStore'

const COURSES_STORE = 'courses'
const MATERIALS_STORE = 'materials'
const ASSESSMENTS_STORE = 'assessments'
const SUBMISSIONS_STORE = 'submissions'
const REQUESTS_STORE = 'enrollmentRequests'

function timeAgo(date) {
  if (!date) return ''
  const diff = Math.max(0, Date.now() - new Date(date).getTime())
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function buildNotifications(user) {
  if (!user) return []

  const courses = readStore(COURSES_STORE, [])
  const email = String(user.email ?? '').trim().toLowerCase()
  const studentId = String(user.rollNumber ?? user.studentId ?? '').trim().toLowerCase()
  const myCourses = courses.filter((course) => {
    if (user.role !== 'student') return String(course.professorId ?? '') === String(user.id ?? '')
    const rosterEmails = Array.isArray(course.studentEmails) ? course.studentEmails.map((v) => String(v).trim().toLowerCase()) : []
    const rosterIds = Array.isArray(course.studentIds) ? course.studentIds.map((v) => String(v).trim().toLowerCase()) : []
    return rosterEmails.includes(email) || (studentId && rosterIds.includes(studentId))
  })
  const courseIds = new Set(myCourses.map((course) => course.id))
  const items = []

  if (user.role === 'student') {
    // Student notifications are only professor -> student events.
    const materials = readStore(MATERIALS_STORE, {}) || {}
    Object.entries(materials).forEach(([courseId, courseMaterials]) => {
      if (!courseIds.has(courseId)) return
      const course = myCourses.find((item) => item.id === courseId)
      ;(Array.isArray(courseMaterials) ? courseMaterials : [])
        .filter((material) => material.status === 'ready')
        .forEach((material) => items.push({
          id: `material-${material.id}`,
          text: `New material uploaded for ${course?.name ?? 'your course'}: ${material.name}`,
          time: timeAgo(material.uploadedOn),
          date: material.uploadedOn,
        }))
    })

    readStore(ASSESSMENTS_STORE, [])
      .filter((assessment) => courseIds.has(assessment.courseId) && assessment.status !== 'draft')
      .forEach((assessment) => items.push({
        id: `assessment-${assessment.id}`,
        text: `New ${String(assessment.type ?? 'assessment').toLowerCase()}: ${assessment.name}`,
        time: timeAgo(assessment.publishedOn || assessment.createdOn),
        date: assessment.publishedOn || assessment.createdOn,
      }))

    // Only an approved professor action creates an enrollment notification.
    readStore(REQUESTS_STORE, [])
      .filter((request) => request.studentId === user.id && request.status === 'accepted' && request.respondedOn)
      .forEach((request) => items.push({
        id: `enrollment-approved-${request.id}`,
        text: `Enrollment approved for ${request.courseName ?? 'the course'}.`,
        time: timeAgo(request.respondedOn),
        date: request.respondedOn,
      }))
  } else if (user.role === 'professor') {
    // Professor notifications are only student -> professor events.
    readStore(SUBMISSIONS_STORE, [])
      .filter((submission) => courseIds.has(submission.courseId) && submission.submittedOn)
      .forEach((submission) => items.push({
        id: `submission-${submission.id}`,
        text: `${submission.studentName ?? 'A student'} submitted ${submission.assessmentName ?? 'an assessment'}.`,
        time: timeAgo(submission.submittedOn),
        date: submission.submittedOn,
      }))

    readStore(REQUESTS_STORE, [])
      .filter((request) => courseIds.has(request.courseId) && request.status === 'pending')
      .forEach((request) => items.push({
        id: `enrollment-request-${request.id}`,
        text: `${request.studentName ?? 'A student'} requested access to ${request.courseName ?? 'your course'}.`,
        time: timeAgo(request.createdOn),
        date: request.createdOn,
      }))
  }

  return items.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 10)
}

export default function Navbar({ onOpenMobileNav }) {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()
  const profilePath = role === 'professor' ? '/professor/profile' : '/student/profile'
  const [dark, setDark] = useState(() => localStorage.getItem('educopilot_theme') === 'dark')
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const notifRef = useRef(null)

  useEffect(() => {
    const refresh = () => setNotifications(buildNotifications(user))
    refresh()

    const unsubCourses = subscribeStore(COURSES_STORE, refresh)
    const unsubMaterials = subscribeStore(MATERIALS_STORE, refresh)
    const unsubAssessments = subscribeStore(ASSESSMENTS_STORE, refresh)
    const unsubSubmissions = subscribeStore(SUBMISSIONS_STORE, refresh)
    const unsubRequests = subscribeStore(REQUESTS_STORE, refresh)
    return () => {
      unsubCourses()
      unsubMaterials()
      unsubAssessments()
      unsubSubmissions()
      unsubRequests()
    }
  }, [user])

  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', dark)
    localStorage.setItem('educopilot_theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <button onClick={onOpenMobileNav} className="rounded-lg p-2 text-ink-500 hover:bg-ink-50 lg:hidden" aria-label="Open navigation menu">
        <Menu className="size-5" />
      </button>


      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <button onClick={() => setDark((v) => !v)} className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50" aria-label="Toggle theme" title={dark ? "Switch to light mode" : "Switch to night mode"}>
          {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>

        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen((v) => !v)} className="relative rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50" aria-label="Notifications">
            <Bell className="size-5" />
            {notifications.length > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-rosy-400 ring-2 ring-white" />}
          </button>
          {notifOpen && (
            <div className="absolute right-0 z-40 mt-2 w-80 rounded-xl border border-ink-200 bg-white p-2 shadow-lift">
              <p className="px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-ink-400">Notifications</p>
              <div className="max-h-72 overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                  <p className="px-2 py-6 text-center text-sm text-ink-400">No new notifications.</p>
                ) : notifications.map((item) => (
                  <div key={item.id} className="rounded-lg px-2 py-2.5 hover:bg-sand-50">
                    <p className="text-sm text-ink-800">{item.text}</p>
                    <p className="mt-0.5 text-xs text-ink-400">{item.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Dropdown
          align="right"
          trigger={<button className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 transition-colors hover:bg-ink-50"><div className="flex size-8 items-center justify-center rounded-full bg-teal-500 text-xs font-semibold text-white">{initials(user?.name ?? 'S')}</div><ChevronDown className="hidden size-4 text-ink-400 sm:block" /></button>}
          items={[
            { key: 'profile', label: 'View profile', icon: UserCircle, onClick: () => navigate(profilePath) },
            { key: 'settings', label: 'Settings', icon: Settings, onClick: () => navigate(profilePath) },
            { divider: true },
            { key: 'logout', label: 'Logout', icon: LogOut, danger: true, onClick: logout },
          ]}
        />
      </div>
    </header>
  )
}
