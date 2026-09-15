import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, X, Plus } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Card, { CardBody } from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import { createCourse, uploadMaterial } from '../../services/professorService'
import { useToast } from '../../hooks/useToast'

const semesterOptions = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8']
  .map((s) => ({ value: s, label: s }))

export default function CourseCreate() {
  const navigate = useNavigate()
  const toast = useToast()

  const [form, setForm] = useState({
    name: '', code: '', description: '', semester: 'Semester 5', academicYear: '2026-27',
  })
  const [syllabusFile, setSyllabusFile] = useState(null)
  const [studentIds, setStudentIds] = useState([])
  const [studentIdInput, setStudentIdInput] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function addStudentId() {
    const trimmed = studentIdInput.trim()
    if (!trimmed) return
    setStudentIds((current) => [...new Set([...current, trimmed])])
    setStudentIdInput('')
  }

  function validate() {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Course name is required.'
    if (!form.code.trim()) nextErrors.code = 'Course code is required.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const course = await createCourse({ ...form, studentIds: [], pendingStudentIds: studentIds })
      if (syllabusFile) await uploadMaterial(course.id, syllabusFile, 'Syllabus')
      toast.success(`${course.name} created.`)
      navigate(`/professor/courses/${course.id}`)
    } catch {
      toast.error('Could not create the course. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        breadcrumbs={[{ label: 'My Courses', to: '/professor/courses' }, { label: 'Create Course' }]}
        title="Create a Course"
        subtitle="Set up a new course, upload its syllabus, and add students."
      />

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Course name"
              placeholder="e.g. Data Structures"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              error={errors.name}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Course code"
                placeholder="e.g. CS301"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                error={errors.code}
              />
              <Input
                label="Academic year"
                value={form.academicYear}
                onChange={(e) => setForm((f) => ({ ...f, academicYear: e.target.value }))}
              />
            </div>
            <Select
              label="Semester"
              value={form.semester}
              onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
              options={semesterOptions}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="What will students learn in this course?"
                className="w-full resize-none rounded-lg border border-ink-200 px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Syllabus (optional)</label>
              {syllabusFile ? (
                <div className="flex items-center gap-2.5 rounded-lg border border-ink-200 bg-sand-50 px-3.5 py-2.5 text-sm">
                  <FileText className="size-4 text-teal-600" />
                  <span className="flex-1 truncate text-ink-700">{syllabusFile.name}</span>
                  <button type="button" onClick={() => setSyllabusFile(null)} className="text-ink-400 hover:text-danger-500">
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-ink-300 px-3.5 py-4 text-sm text-ink-500 transition-colors hover:border-teal-300 hover:text-teal-600">
                  <Upload className="size-4" />
                  Click to upload a syllabus PDF
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && setSyllabusFile(e.target.files[0])}
                  />
                </label>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Invite students by Student ID</label>
              <p className="mb-2 text-xs text-ink-400">The student receives an enrollment request and must accept it before the course appears in My Courses.</p>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. 24CS101"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addStudentId() } }}
                  className="flex-1"
                />
                <Button type="button" variant="secondary" icon={Plus} onClick={addStudentId}>Add</Button>
              </div>
              {studentIds.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {studentIds.map((id) => (
                    <span key={id} className="flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-xs text-teal-700">
                      {id}
                      <button type="button" onClick={() => setStudentIds((c) => c.filter((e) => e !== id))}>
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" loading={loading} size="lg">
              Create Course
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
