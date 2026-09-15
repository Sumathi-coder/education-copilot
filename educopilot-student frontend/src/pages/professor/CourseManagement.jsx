import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Users, TrendingUp, ListChecks, FolderOpen, Plus, ArrowRight, X } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Tabs from '../../components/ui/Tabs'
import Card, { CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/EmptyState'
import StudentTable from '../../components/professor/StudentTable'
import AssessmentCard from '../../components/professor/AssessmentCard'
import AnalyticsChart from '../../components/professor/AnalyticsChart'
import { fetchProfessorCourseById, updateCourse, fetchRoster, fetchAssessments, fetchClassAnalytics, duplicateAssessment, deleteAssessment, publishAssessment, fetchEnrollmentRequests, respondToEnrollmentRequest, removeStudentFromCourse } from '../../services/professorService'
import { useToast } from '../../hooks/useToast'

export default function CourseManagement() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [course, setCourse] = useState(null)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('overview')
  const [roster, setRoster] = useState(null)
  const [assessments, setAssessments] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [units, setUnits] = useState([])
  const [newUnit, setNewUnit] = useState('')
  const [enrollmentRequests, setEnrollmentRequests] = useState([])

  useEffect(() => {
    setCourse(null)
    setError(null)
    fetchProfessorCourseById(courseId).then((loadedCourse) => { setCourse(loadedCourse); setUnits(loadedCourse.units ?? []) }).catch(setError)
    fetchRoster(courseId).then(setRoster)
    fetchEnrollmentRequests(courseId).then(setEnrollmentRequests)
    fetchAssessments().then((all) => setAssessments(all.filter((a) => a.courseId === courseId)))
    fetchClassAnalytics(courseId).then(setAnalytics)
  }, [courseId])

  async function handleDuplicate(assessment) {
    const copy = await duplicateAssessment(assessment.id)
    setAssessments((current) => [...current, copy])
    toast.success('Assessment duplicated as a draft.')
  }


  async function handlePublish(assessment) {
    try {
      const published = await publishAssessment(assessment.id)
      setAssessments((current) => current.map((item) => item.id === published.id ? published : item))
      toast.success('Published. Enrolled students can now attend it.')
    } catch (error) {
      toast.error(error.message || 'Could not publish assessment.')
    }
  }

  async function handleDelete(assessment) {
    await deleteAssessment(assessment.id)
    setAssessments((current) => current.filter((a) => a.id !== assessment.id))
    toast.success('Assessment deleted.')
  }



  async function removeStudent(student) {
    try {
      await removeStudentFromCourse(courseId, student)
      setCourse(await fetchProfessorCourseById(courseId))
      setRoster(await fetchRoster(courseId))
      toast.success('Student removed from this course.')
    } catch (error) {
      toast.error(error.message || 'Could not remove the student.')
    }
  }

  async function addUnit() {
    if (!newUnit.trim()) return
    const next = [...units, { id: `u${units.length + 1}`, title: newUnit.trim(), status: 'upcoming', topics: [] }]
    setUnits(next)
    await updateCourse(courseId, { units: next })
    setCourse((current) => ({ ...current, units: next }))
    setNewUnit('')
  }

  async function removeUnit(unitId) {
    const next = units.filter((unit) => unit.id !== unitId)
    setUnits(next)
    await updateCourse(courseId, { units: next })
    setCourse((current) => ({ ...current, units: next }))
  }

  if (error) {
    return <ErrorState title="Course not found" description={error.message} onRetry={() => navigate('/professor/courses')} />
  }

  if (!course) {
    return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: 'My Courses', to: '/professor/courses' }, { label: course.name }]}
        title={course.name}
        subtitle={`${course.code} · ${course.semester} · ${course.academicYear}`}
      />

      <Tabs
        tabs={[
          { value: 'overview', label: 'Overview' },
          { value: 'syllabus', label: 'Syllabus' },
          { value: 'materials', label: 'Materials' },
          { value: 'students', label: 'Students' },
          { value: 'planner', label: 'Planner' },
          { value: 'assessments', label: 'Assessments' },
          { value: 'analytics', label: 'Analytics' },
        ]}
        active={tab}
        onChange={setTab}
        className="mb-5"
      />

      {tab === 'overview' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs text-ink-500"><TrendingUp className="size-3.5" /> Course Progress</div>
            <p className="text-2xl font-semibold text-brand-800">{course.completionRate}%</p>
          </Card>
          <Card className="p-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs text-ink-500"><Users className="size-3.5" /> Students</div>
            <p className="text-2xl font-semibold text-brand-800">{course.studentCount}</p>
          </Card>
          <Card className="p-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs text-ink-500"><ListChecks className="size-3.5" /> Upcoming Assessments</div>
            <p className="text-2xl font-semibold text-brand-800">{assessments?.filter((a) => a.status === 'active').length ?? '—'}</p>
          </Card>
          <Card className="p-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs text-ink-500"><TrendingUp className="size-3.5" /> Average Class Score</div>
            <p className="text-2xl font-semibold text-brand-800">{course.avgScore}%</p>
          </Card>
        </div>
      )}

      {tab === 'syllabus' && (
        <div className="space-y-3">
          {units.length === 0 && (
            <p className="rounded-lg bg-sand-100 px-3.5 py-3 text-sm text-ink-600">No syllabus units yet — add the first one below.</p>
          )}
          {units.map((unit) => (
            <Card key={unit.id}>
              <CardBody className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-brand-800">{unit.title}</p>
                  {unit.topics?.length > 0 && <p className="mt-1 text-sm text-ink-500">{unit.topics.join(' · ')}</p>}
                </div>
                <button onClick={() => removeUnit(unit.id)} className="text-ink-400 hover:text-danger-500">
                  <X className="size-4" />
                </button>
              </CardBody>
            </Card>
          ))}
          <div className="flex gap-2">
            <input
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUnit() } }}
              placeholder="New unit title, e.g. Unit 6 — Hashing"
              className="flex-1 rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
            <Button variant="secondary" icon={Plus} onClick={addUnit}>Add Unit</Button>
          </div>
        </div>
      )}

      {tab === 'materials' && (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-10 text-center">
            <FolderOpen className="size-8 text-ink-300" />
            <p className="text-sm text-ink-600">Manage syllabus, notes, and other course documents in one place.</p>
            <Button as={Link} to={`/professor/courses/${courseId}/materials`} icon={ArrowRight} iconPosition="right">
              Open Material Management
            </Button>
          </CardBody>
        </Card>
      )}

      {tab === 'students' && (
        <div className="space-y-4">
          {enrollmentRequests.length > 0 && <Card><CardBody><h3 className="mb-3 font-semibold text-brand-800">Pending enrollment requests</h3><div className="space-y-2">{enrollmentRequests.map((request)=><div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink-100 p-3"><div><p className="font-medium text-ink-800">{request.studentName}</p><p className="text-xs text-ink-500">ID: {request.studentRollNumber || request.studentId} · {request.studentEmail}</p></div><div className="flex gap-2"><Button size="sm" onClick={async()=>{await respondToEnrollmentRequest(request.id,true);setEnrollmentRequests(await fetchEnrollmentRequests(courseId));setRoster(await fetchRoster(courseId));setCourse(await fetchProfessorCourseById(courseId));toast.success('Student accepted into the course.')}}>Accept</Button><Button size="sm" variant="secondary" onClick={async()=>{await respondToEnrollmentRequest(request.id,false);setEnrollmentRequests(await fetchEnrollmentRequests(courseId));toast.success('Request declined.')}}>Decline</Button></div></div>)}</div></CardBody></Card>}
          {!roster ? <SkeletonCard /> : <div className="space-y-4">
            {roster.length === 0 ? <p className="rounded-lg bg-sand-100 px-3.5 py-3 text-sm text-ink-600">No students have been accepted into this course yet.</p> : <div className="space-y-2">{roster.map((student) => <div key={student.id} className="flex items-center justify-between rounded-lg border border-ink-200 bg-white px-3 py-2"><div><p className="text-sm font-medium text-brand-800">{student.name}</p><p className="text-xs text-ink-500">{student.rollNumber} · {student.email}</p></div><button onClick={() => removeStudent(student)} className="text-xs text-danger-500 hover:text-danger-600">Remove</button></div>)}</div>}
          </div>}
        </div>
      )}

      {tab === 'planner' && (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-10 text-center">
            <ListChecks className="size-8 text-ink-300" />
            <p className="text-sm text-ink-600">Generate or edit the weekly lecture schedule for {course.name}.</p>
            <Button as={Link} to={`/professor/planner?course=${courseId}`} icon={ArrowRight} iconPosition="right">
              Open Lecture Planner
            </Button>
          </CardBody>
        </Card>
      )}

      {tab === 'assessments' && (
        <div>
          <div className="mb-3 flex justify-end">
            <Button as={Link} to={`/professor/assessments/create?course=${courseId}`} size="sm" icon={Plus}>
              Create Assessment
            </Button>
          </div>
          <div className="space-y-3">
            {!assessments ? (
              <SkeletonCard />
            ) : assessments.length === 0 ? (
              <p className="rounded-lg bg-sand-100 px-3.5 py-3 text-sm text-ink-600">No assessments yet for this course.</p>
            ) : (
              assessments.map((a) => (
                <AssessmentCard key={a.id} assessment={a} onDuplicate={handleDuplicate} onDelete={handleDelete} onPublish={handlePublish} />
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'analytics' && (
        <div className="space-y-5">
          {!analytics ? (
            <SkeletonCard />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Card className="p-4"><p className="text-xs text-ink-500">Avg Score</p><p className="text-xl font-semibold text-brand-800">{analytics.summary.avgScore}%</p></Card>
                <Card className="p-4"><p className="text-xs text-ink-500">Highest</p><p className="text-xl font-semibold text-brand-800">{analytics.summary.highestScore}%</p></Card>
                <Card className="p-4"><p className="text-xs text-ink-500">Lowest</p><p className="text-xl font-semibold text-brand-800">{analytics.summary.lowestScore}%</p></Card>
                <Card className="p-4"><p className="text-xs text-ink-500">Completion</p><p className="text-xl font-semibold text-brand-800">{analytics.summary.completionRate}%</p></Card>
              </div>
              <AnalyticsChart title="Topic Performance" type="topicBar" data={analytics.topicPerformance} />
              <div className="flex justify-end">
                <Button as={Link} to={`/professor/analytics?course=${courseId}`} variant="secondary" size="sm" icon={ArrowRight} iconPosition="right">
                  Full analytics
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
