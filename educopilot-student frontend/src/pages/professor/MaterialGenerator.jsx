import { useEffect, useState } from 'react'
import { Sparkles, AlertTriangle, Save, Send, Pencil } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Card, { CardBody } from '../../components/ui/Card'
import Select from '../../components/ui/Select'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Tabs from '../../components/ui/Tabs'
import Badge from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { fetchProfessorCourses } from '../../services/professorService'
import { generateMaterial } from '../../services/professorService'
import { useToast } from '../../hooks/useToast'

const artifactOptions = [
  { key: 'lectureNotes', label: 'Lecture Notes' },
  { key: 'examples', label: 'Examples' },
  { key: 'importantQuestions', label: 'Important Questions' },
  { key: 'assignment', label: 'Assignment' },
  { key: 'quiz', label: 'Quiz' },
]

export default function MaterialGenerator() {
  const toast = useToast()
  const [courses, setCourses] = useState([])
  useEffect(() => { fetchProfessorCourses().then((items) => { setCourses(items); if (items[0]) setForm((f) => ({ ...f, courseId: f.courseId || items[0].id })) }) }, [])
  const [form, setForm] = useState({
    courseId: '',
    unit: '',
    topic: '',
    artifacts: { lectureNotes: true, examples: true, importantQuestions: true, assignment: true, quiz: true },
  })
  const [loading, setLoading] = useState(false)
  const [material, setMaterial] = useState(null)
  const [tab, setTab] = useState('lectureNotes')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const selectedCourse = courses.find((c) => c.id === form.courseId)

  function toggleArtifact(key) {
    setForm((f) => ({ ...f, artifacts: { ...f.artifacts, [key]: !f.artifacts[key] } }))
  }

  async function handleGenerate(event) {
    event.preventDefault()
    if (!form.topic.trim()) return toast.error('Enter a topic to generate material for.')
    setLoading(true)
    try {
      const result = await generateMaterial({ topic: form.topic, courseName: selectedCourse?.name })
      setMaterial(result)
      setTab('lectureNotes')
      toast.success('Material generated. Review before publishing.')
    } catch {
      toast.error('Could not generate material. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveDraft() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    setEditing(false)
    toast.success('Draft saved.')
  }

  async function handlePublish() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 700))
    setMaterial((m) => ({ ...m, status: 'published' }))
    setSaving(false)
    toast.success('Material published to the course.')
  }

  return (
    <div>
      <PageHeader title="AI Material Generator" subtitle="Generate lecture-ready content grounded in your course's topic and unit." />

      <Card className="mb-6">
        <CardBody>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Select
                label="Course"
                value={form.courseId}
                onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}
                options={courses.map((c) => ({ value: c.id, label: c.name }))}
              />
              <Input
                label="Unit"
                placeholder="e.g. Unit 3"
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
              />
              <Input
                label="Topic"
                placeholder="e.g. AVL Trees"
                value={form.topic}
                onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-ink-700">Artifacts to generate</p>
              <div className="flex flex-wrap gap-3">
                {artifactOptions.map((option) => (
                  <label key={option.key} className="flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-700">
                    <input
                      type="checkbox"
                      checked={form.artifacts[option.key]}
                      onChange={() => toggleArtifact(option.key)}
                      className="size-4 rounded border-ink-300 text-teal-500 focus:ring-teal-200"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" icon={Sparkles} loading={loading}>
              Generate
            </Button>
          </form>
        </CardBody>
      </Card>

      {!material ? (
        <EmptyState icon={Sparkles} title="Nothing generated yet" description="Fill in a topic above and click Generate to create lecture-ready material." />
      ) : (
        <div>
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-warn-500/30 bg-warn-50 px-3.5 py-3 text-xs text-ink-700">
            <AlertTriangle className="size-4 shrink-0 text-warn-500" />
            AI-generated content should be reviewed before publishing.
          </div>

          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-brand-800">{material.topic}</h2>
              <Badge tone={material.status === 'published' ? 'moss' : 'neutral'}>{material.status}</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" icon={Pencil} onClick={() => setEditing((v) => !v)}>
                {editing ? 'Done Editing' : 'Edit'}
              </Button>
              <Button variant="secondary" size="sm" icon={Save} loading={saving} onClick={handleSaveDraft}>
                Save Draft
              </Button>
              <Button size="sm" icon={Send} loading={saving} onClick={handlePublish} disabled={material.status === 'published'}>
                Publish
              </Button>
            </div>
          </div>

          <Tabs
            tabs={[
              { value: 'lectureNotes', label: 'Lecture Notes' },
              { value: 'examples', label: 'Examples' },
              { value: 'importantQuestions', label: 'Questions' },
              { value: 'assignment', label: 'Assignment' },
              { value: 'quiz', label: 'Quiz' },
            ]}
            active={tab}
            onChange={setTab}
            className="mb-5"
          />

          <Card>
            <CardBody>
              {tab === 'lectureNotes' && (
                editing ? (
                  <textarea
                    value={material.lectureNotes}
                    onChange={(e) => setMaterial((m) => ({ ...m, lectureNotes: e.target.value }))}
                    rows={10}
                    className="w-full resize-none rounded-lg border border-ink-200 p-3 text-sm text-ink-800 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
                  />
                ) : (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">{material.lectureNotes}</p>
                )
              )}
              {tab === 'examples' && <p className="text-sm leading-relaxed text-ink-700">{material.examples}</p>}
              {tab === 'importantQuestions' && (
                <ol className="list-decimal space-y-2 pl-5 text-sm text-ink-700">
                  {material.importantQuestions.map((q) => <li key={q}>{q}</li>)}
                </ol>
              )}
              {tab === 'assignment' && (
                <div>
                  <p className="mb-1 font-medium text-brand-800">{material.assignment.title}</p>
                  <p className="mb-3 text-sm text-ink-500">{material.assignment.instructions}</p>
                  <ol className="list-decimal space-y-2 pl-5 text-sm text-ink-700">
                    {material.assignment.questions.map((q) => <li key={q}>{q}</li>)}
                  </ol>
                </div>
              )}
              {tab === 'quiz' && (
                <div className="text-sm text-ink-700">
                  <p className="mb-1 font-medium text-brand-800">{material.quiz.title}</p>
                  <p>{material.quiz.questionCount} auto-generated questions · {material.quiz.difficulty} difficulty</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}
