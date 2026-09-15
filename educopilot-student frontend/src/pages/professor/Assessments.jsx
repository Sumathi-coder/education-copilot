import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Tabs from '../../components/ui/Tabs'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import AssessmentCard from '../../components/professor/AssessmentCard'
import { fetchAssessments, duplicateAssessment, deleteAssessment, publishAssessment } from '../../services/professorService'
import { subscribeStore } from '../../services/localStore'
import { useToast } from '../../hooks/useToast'

const tabs = [
  { value: 'active', label: 'Active Tests' },
  { value: 'draft', label: 'Draft Tests' },
  { value: 'completed', label: 'Completed Tests' },
  { value: 'Assignment', label: 'Assignments' },
]

export default function Assessments() {
  const toast = useToast()
  const [assessments, setAssessments] = useState(null)
  const [tab, setTab] = useState('active')
  const [pendingDelete, setPendingDelete] = useState(null)

  useEffect(() => {
    const load = () => fetchAssessments().then(setAssessments)
    load()
    return subscribeStore('assessments', load)
  }, [])

  const filtered = assessments?.filter((a) => (tab === 'Assignment' ? a.type === 'Assignment' : a.status === tab))

  async function handleDuplicate(assessment) {
    const copy = await duplicateAssessment(assessment.id)
    setAssessments((current) => [...current, copy])
    toast.success('Assessment duplicated as a draft.')
  }


  async function handlePublish(assessment) {
    try {
      const published = await publishAssessment(assessment.id)
      setAssessments((current) => current.map((item) => item.id === published.id ? published : item))
      toast.success('Published. Enrolled students can now attend this assessment.')
      setTab('active')
    } catch (error) {
      toast.error(error.message || 'Could not publish assessment.')
    }
  }

  async function confirmDelete() {
    await deleteAssessment(pendingDelete.id)
    setAssessments((current) => current.filter((a) => a.id !== pendingDelete.id))
    toast.success('Assessment deleted.')
    setPendingDelete(null)
  }

  return (
    <div>
      <PageHeader
        title="Assessments"
        subtitle="Manage tests and assignments across all your courses."
        actions={<Button as="a" href="/professor/assessments/create" icon={Plus}>Create Assessment</Button>}
      />

      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-5" />

      {!assessments ? (
        <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Nothing here yet" description="Create an assessment to see it listed in this tab." />
      ) : (
        <div className="space-y-3">
          {filtered.map((assessment) => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
              onDuplicate={handleDuplicate}
              onDelete={setPendingDelete}
              onPublish={handlePublish}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete assessment?"
        description={`"${pendingDelete?.name}" and its results will be permanently removed.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  )
}
