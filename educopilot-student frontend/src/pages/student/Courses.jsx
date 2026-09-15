import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import CourseCard from '../../components/student/CourseCard'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Card, { CardBody } from '../../components/ui/Card'
import { fetchCourses } from '../../services/courseService'
import { readStore } from '../../services/localStore'
import { getStoredSession } from '../../services/authService'
import { requestEnrollment } from '../../services/professorService'
import { useToast } from '../../hooks/useToast'

export default function Courses() {
  const toast = useToast()
  const [courses, setCourses] = useState(null)
  const [query, setQuery] = useState('')
  const [courseCode, setCourseCode] = useState('')
  const [studentId, setStudentId] = useState('')
  const [pendingRequests, setPendingRequests] = useState([])

  const load = () => {
    fetchCourses().then(setCourses)
    const user = getStoredSession()?.user
    setStudentId(user?.rollNumber || '')
    const requests = readStore('enrollmentRequests', [])
    setPendingRequests(requests.filter((r) => r.studentId === user?.id && r.status === 'pending'))
  }

  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener('storage', handler)
    window.addEventListener('educopilot:data-updated', handler)
    return () => {
      window.removeEventListener('storage', handler)
      window.removeEventListener('educopilot:data-updated', handler)
    }
  }, [])

  const filtered = useMemo(() => {
    if (!courses) return null
    const q = query.trim().toLowerCase()
    return q ? courses.filter((course) => [course.name, course.code, course.professor].some((value) => String(value || '').toLowerCase().includes(q))) : courses
  }, [courses, query])

  async function request() {
    if (!courseCode.trim() || !studentId.trim()) {
      toast.error('Enter the course code/ID and your Student ID.')
      return
    }
    try {
      await requestEnrollment(courseCode.trim(), studentId.trim())
      toast.success('Request sent. The course will appear only after the professor accepts you.')
      setCourseCode('')
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div>
      <PageHeader title="My Courses" subtitle="Your professor-approved courses. Search here or request access to a course." />
      <div className="mb-5 max-w-sm">
        <Input icon={Search} placeholder="Search by course, code, or professor" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {pendingRequests.length > 0 && (
        <Card className="mb-5">
          <CardBody>
            <h2 className="mb-3 font-semibold text-brand-800">Pending Requests</h2>
            <div className="space-y-2">
              {pendingRequests.map((requestItem) => (
                <div key={requestItem.id} className="rounded-lg border border-ink-100 p-3">
                  <p className="font-medium text-ink-800">{requestItem.courseName || requestItem.courseId}</p>
                  <p className="mt-1 text-xs text-ink-500">Waiting for the professor to accept your enrollment request.</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <Card className="mb-5">
        <CardBody>
          <h2 className="font-semibold text-brand-800">Add a Course</h2>
          <p className="mt-1 mb-3 text-xs text-ink-500">Enter the course code or course ID and your Student ID. The professor must accept the request before the course is added.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input label="Course code / ID" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="CS301" />
            <Input label="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="24CS101" />
            <div className="flex items-end"><Button className="w-full" onClick={request}>Request Access</Button></div>
          </div>
        </CardBody>
      </Card>

      {!filtered ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="No courses found" description="Search again or request access to a course above." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((course) => <CourseCard key={course.id} course={course} />)}</div>
      )}
    </div>
  )
}
