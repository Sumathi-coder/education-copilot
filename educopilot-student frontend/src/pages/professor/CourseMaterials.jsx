import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { UploadCloud, Info } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Select from '../../components/ui/Select'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { SkeletonCard } from '../../components/ui/Skeleton'
import MaterialCard from '../../components/professor/MaterialCard'
import { fetchProfessorCourseById, fetchCourseMaterialsForProfessor, uploadMaterial, deleteMaterial } from '../../services/professorService'
import { useToast } from '../../hooks/useToast'

const materialTypes = [
  { value: 'Syllabus', label: 'Syllabus' },
  { value: 'Lecture Notes', label: 'Lecture Notes' },
  { value: 'Textbook', label: 'Textbook' },
  { value: 'Assignment', label: 'Assignment' },
  { value: 'Course Material', label: 'Course Material' },
]

export default function CourseMaterials() {
  const { courseId } = useParams()
  const toast = useToast()
  const fileInputRef = useRef(null)

  const [course, setCourse] = useState(null)
  const [materials, setMaterials] = useState(null)
  const [materialType, setMaterialType] = useState('Lecture Notes')
  const [dragActive, setDragActive] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const refresh = useCallback(() => {
    fetchCourseMaterialsForProfessor(courseId).then(setMaterials)
  }, [courseId])

  useEffect(() => {
    fetchProfessorCourseById(courseId).then(setCourse).catch(() => setCourse({ name: 'Course', code: '' }))
    refresh()
  }, [courseId, refresh])

  async function handleFiles(fileList) {
    const files = Array.from(fileList)
    if (files.length === 0) return
    for (const file of files) {
      await uploadMaterial(courseId, file, materialType)
    }
    toast.success(`${files.length > 1 ? `${files.length} files` : 'File'} uploaded — processing into the knowledge base.`)
    refresh()
    // Refresh the list so the newly uploaded material is visible immediately.
    refresh()
  }

  function handleDrop(event) {
    event.preventDefault()
    setDragActive(false)
    handleFiles(event.dataTransfer.files)
  }

  async function confirmDelete() {
    await deleteMaterial(courseId, pendingDelete.id)
    toast.success(`${pendingDelete.name} deleted.`)
    setPendingDelete(null)
    refresh()
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'My Courses', to: '/professor/courses' },
          { label: course?.name ?? 'Course', to: `/professor/courses/${courseId}` },
          { label: 'Materials' },
        ]}
        title="Course Materials"
        subtitle={`Manage documents for ${course?.name ?? 'this course'}. New uploads appear for students automatically once ready.`}
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full sm:w-56">
          <Select
            label="Upload as"
            value={materialType}
            onChange={(e) => setMaterialType(e.target.value)}
            options={materialTypes}
          />
        </div>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`mb-6 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
          dragActive ? 'border-teal-400 bg-teal-50' : 'border-ink-300 bg-white hover:border-teal-300'
        }`}
      >
        <UploadCloud className={`size-8 ${dragActive ? 'text-teal-500' : 'text-ink-400'}`} />
        <p className="text-sm font-medium text-ink-700">Drag and drop files here, or click to browse</p>
        <p className="text-xs text-ink-400">PDF, DOCX, or TXT · up to 25 MB each</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <div className="mb-4 flex items-start gap-2 rounded-lg bg-sand-100 px-3.5 py-3 text-xs text-ink-600">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        Documents uploaded here are shared with students immediately in local mode. Backend ingestion/RAG processing will be handled by the backend when it is connected.
      </div>

      {!materials ? (
        <div className="space-y-2.5"><SkeletonCard /><SkeletonCard /></div>
      ) : materials.length === 0 ? (
        <EmptyState title="No materials yet" description="Upload your first document above to get started." />
      ) : (
        <div className="space-y-2.5">
          {materials.map((material) => (
            <MaterialCard key={material.id} material={material} onDelete={setPendingDelete} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete this material?"
        description={`"${pendingDelete?.name}" will be removed from the knowledge base and will no longer be visible to students.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  )
}
