import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import ProfessorCourseCard from '../../components/professor/ProfessorCourseCard'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { fetchProfessorCourses, deleteCourse } from '../../services/professorService'
import { useToast } from '../../hooks/useToast'

export default function Courses() {
  const toast = useToast()
  const [courses, setCourses] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchProfessorCourses().then(setCourses)
  }, [])

  const filteredCourses = courses?.filter((c) => { const q=query.trim().toLowerCase(); return !q || [c.name,c.code,c.semester].some(v=>String(v||'').toLowerCase().includes(q)) })

  async function confirmDelete() {
    await deleteCourse(pendingDelete.id)
    setCourses((current) => current.filter((c) => c.id !== pendingDelete.id))
    toast.success(`${pendingDelete.name} removed.`)
    setPendingDelete(null)
  }

  return (
    <div>
      <PageHeader
        title="My Courses"
        subtitle="Manage the courses you teach this semester."
        actions={
          <Button as="a" href="/professor/courses/create" icon={Plus}>
            Create Course
          </Button>
        }
      />

      {courses && <div className="mb-5 max-w-sm"><Input icon={Search} placeholder="Search by course, code, or semester" value={query} onChange={(e)=>setQuery(e.target.value)} /></div>}

      {!courses ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <ProfessorCourseCard key={course.id} course={course} onDelete={setPendingDelete} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete course?"
        description={`This removes "${pendingDelete?.name}" from your course list. This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  )
}
