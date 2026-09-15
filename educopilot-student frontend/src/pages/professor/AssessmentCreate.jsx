import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Sparkles, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Card, { CardBody } from '../../components/ui/Card'
import Select from '../../components/ui/Select'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { fetchProfessorCourses } from '../../services/professorService'
import { createAssessment } from '../../services/professorService'
import { useToast } from '../../hooks/useToast'

const typeOptions = [{ value: 'Test', label: 'Test' }, { value: 'Assignment', label: 'Assignment' }]
const difficultyOptions = [{ value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' }, { value: 'mixed', label: 'Mixed' }]
const questionTypeOptions = ['MCQ', 'True/False', 'Fill in the Blank', 'Short Answer']

export default function AssessmentCreate() {
  const navigate = useNavigate()
  const toast = useToast()
  const [searchParams] = useSearchParams()

  const [courses, setCourses] = useState([])
  useEffect(() => { fetchProfessorCourses().then((items) => { setCourses(items); if (!searchParams.get('course') && items[0]) setForm((f) => ({ ...f, courseId: items[0].id })) }) }, [])
  const [form, setForm] = useState({
    courseId: searchParams.get('course') || '',
    unit: '',
    name: '',
    type: 'Test',
    difficulty: 'medium',
    numQuestions: 10,
    duration: 20,
    questionTypes: ['MCQ'],
    availableFrom: '',
    dueDate: '',
  })
  const [manualQuestions, setManualQuestions] = useState([])
  const [rubric, setRubric] = useState({ conceptAccuracy: 40, keyPoints: 30, example: 15, clarity: 15 })
  const [loading, setLoading] = useState(false)
  const [generatingAI, setGeneratingAI] = useState(false)

  const selectedCourse = courses.find((c) => c.id === form.courseId)
  const usesShortAnswer = form.questionTypes.includes('Short Answer')

  function toggleQuestionType(type) {
    setForm((f) => ({
      ...f,
      questionTypes: f.questionTypes.includes(type)
        ? f.questionTypes.filter((t) => t !== type)
        : [...f.questionTypes, type],
    }))
  }

  function addManualQuestion() {
    setManualQuestions((current) => [...current, {
      id: `manual-${crypto.randomUUID?.() ?? Date.now()}-${current.length}`,
      type: form.questionTypes[0] || 'MCQ',
      text: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      correctAnswer: '',
      topic: form.unit || 'General',
      explanation: '',
      marks: 1,
    }])
  }

  function updateQuestion(id, patch) {
    setManualQuestions((current) => current.map((q) => q.id === id ? { ...q, ...patch } : q))
  }

  function changeQuestionType(id, type) {
    updateQuestion(id, {
      type,
      options: type === 'MCQ' ? ['', '', '', ''] : type === 'True/False' ? ['True', 'False'] : [],
      correctIndex: 0,
      correctAnswer: '',
    })
  }

  function updateOption(id, index, value) {
    setManualQuestions((current) => current.map((q) => {
      if (q.id !== id) return q
      const options = [...(q.options ?? [])]
      options[index] = value
      return { ...q, options }
    }))
  }

  function handleGenerateWithAI() {
    toast.error('AI question generation is available after the backend is connected.')
  }

  function validateQuestions() {
    if (!manualQuestions.length) return 'Add at least one manual question before publishing.'
    for (const [index, q] of manualQuestions.entries()) {
      if (!q.text.trim()) return `Enter question ${index + 1}.`
      if (q.type === 'MCQ' && q.options.some((option) => !option.trim())) return `Complete all options for question ${index + 1}.`
      if (q.type === 'Fill in the Blank' && !q.correctAnswer.trim()) return `Enter the answer for question ${index + 1}.`
      if (!Number.isFinite(Number(q.marks)) || Number(q.marks) <= 0) return `Enter valid marks for question ${index + 1}.`
    }
    return null
  }

  async function saveAssessment(status = 'draft') {
    if (!form.name.trim()) return toast.error('Give this assessment a name.')
    if (!form.courseId) return toast.error('Select a course.')
    if (status === 'active') {
      const error = validateQuestions()
      if (error) return toast.error(error)
    }
    setLoading(true)
    try {
      const assessment = await createAssessment({
        name: form.name.trim(),
        courseId: form.courseId,
        courseName: selectedCourse?.name || '',
        type: form.type,
        unit: form.unit,
        difficulty: form.difficulty,
        questionTypes: form.questionTypes,
        availableFrom: form.availableFrom || null,
        dueDate: form.dueDate || null,
        questions: manualQuestions.map((q) => ({ ...q, marks: Number(q.marks) || 1 })),
        numQuestions: manualQuestions.length,
        totalMarks: manualQuestions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0),
        duration: form.type === 'Test' ? Number(form.duration) : null,
        rubric,
        status,
      })
      toast.success(status === 'active' ? 'Published! Students can now see and attend it.' : 'Assessment saved as draft.')
      navigate('/professor/assessments')
      return assessment
    } catch (error) {
      toast.error(error.message || 'Could not save the assessment.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveDraft(event) {
    event.preventDefault()
    await saveAssessment('draft')
  }

  async function handlePublish(event) {
    event.preventDefault()
    if (!form.name.trim()) return toast.error('Give this assessment a name.')
    const error = validateQuestions()
    if (error) return toast.error(error)
    await saveAssessment('active')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        breadcrumbs={[{ label: 'Assessments', to: '/professor/assessments' }, { label: 'Create' }]}
        title="Create Assessment"
        subtitle="Configure a test or assignment, generated with AI or built manually."
      />

      <Card>
        <CardBody>
          <form onSubmit={handleSaveDraft} className="space-y-5">
            <Input
              label="Assessment name"
              placeholder="e.g. AVL Trees — Unit Test"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Assessment type"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                options={typeOptions}
              />
              <Select
                label="Difficulty"
                value={form.difficulty}
                onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
                options={difficultyOptions}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Available from" type="datetime-local" value={form.availableFrom} onChange={(e) => setForm((f) => ({ ...f, availableFrom: e.target.value }))} hint="Students can start only after this time." />
              <Input label="Due date & time" type="datetime-local" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} hint="After this time it moves to Completed." />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Number of questions"
                type="number"
                min={1}
                value={form.numQuestions}
                onChange={(e) => setForm((f) => ({ ...f, numQuestions: e.target.value }))}
              />
              {form.type === 'Test' && (
                <Input
                  label="Duration (minutes)"
                  type="number"
                  min={5}
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                />
              )}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-ink-700">Question types</p>
              <div className="flex flex-wrap gap-3">
                {questionTypeOptions.map((type) => (
                  <label key={type} className="flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-700">
                    <input
                      type="checkbox"
                      checked={form.questionTypes.includes(type)}
                      onChange={() => toggleQuestionType(type)}
                      className="size-4 rounded border-ink-300 text-teal-500 focus:ring-teal-200"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            {usesShortAnswer && (
              <div className="rounded-lg border border-ink-200 p-4">
                <p className="mb-3 text-sm font-medium text-ink-700">Short-answer grading rubric</p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(rubric).map(([key, value]) => (
                    <Input
                      key={key}
                      label={key === 'conceptAccuracy' ? 'Concept Accuracy %' : key === 'keyPoints' ? 'Key Points %' : key === 'example' ? 'Example %' : 'Clarity %'}
                      type="number"
                      min={0}
                      max={100}
                      value={value}
                      onChange={(e) => setRubric((r) => ({ ...r, [key]: Number(e.target.value) }))}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 rounded-lg bg-sand-100 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink-700">Manually add questions (optional)</p>
                <Button type="button" size="sm" variant="secondary" icon={Plus} onClick={addManualQuestion}>Add</Button>
              </div>
              {manualQuestions.length === 0 ? (
                <p className="text-xs text-ink-500">Add your questions below. Choose MCQ to reveal answer options, True/False for a fixed pair, or Fill in the Blank/Short Answer for text responses.</p>
              ) : (
                manualQuestions.map((q, i) => (
                  <div key={q.id} className="rounded-xl border border-ink-200 bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-brand-800">Question {i + 1}</p>
                      <button type="button" onClick={() => setManualQuestions((c) => c.filter((mq) => mq.id !== q.id))} className="text-ink-400 hover:text-danger-500" aria-label={`Delete question ${i + 1}`}>
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <Select
                        label="Question type"
                        value={q.type}
                        onChange={(e) => changeQuestionType(q.id, e.target.value)}
                        options={questionTypeOptions.map((type) => ({ value: type, label: type }))}
                      />
                      <Input
                        label="Topic"
                        value={q.topic}
                        onChange={(e) => updateQuestion(q.id, { topic: e.target.value })}
                        placeholder="e.g. Trees"
                      />
                      <Input
                        label="Marks"
                        type="number"
                        min={1}
                        step={0.5}
                        value={q.marks}
                        onChange={(e) => updateQuestion(q.id, { marks: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink-700">Question</label>
                      <textarea
                        value={q.text}
                        onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                        placeholder={`Write question ${i + 1}...`}
                        rows={3}
                        className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
                      />
                    </div>
                    {q.type === 'MCQ' && (
                      <div className="rounded-lg bg-teal-50/60 p-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal-700">Answer options</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {q.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${q.id}`}
                                checked={q.correctIndex === optionIndex}
                                onChange={() => updateQuestion(q.id, { correctIndex: optionIndex })}
                                className="size-4 text-teal-500 focus:ring-teal-200"
                                title="Mark as correct answer"
                              />
                              <input
                                value={option}
                                onChange={(e) => updateOption(q.id, optionIndex, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                className="flex-1 rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
                              />
                            </div>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-ink-500">Select the radio button beside the correct option.</p>
                      </div>
                    )}
                    {q.type === 'True/False' && (
                      <div className="rounded-lg bg-teal-50/60 p-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal-700">Correct answer</p>
                        <div className="flex gap-4 text-sm text-ink-700">
                          {['True', 'False'].map((option, optionIndex) => (
                            <label key={option} className="flex items-center gap-2">
                              <input type="radio" name={`tf-${q.id}`} checked={q.correctIndex === optionIndex} onChange={() => updateQuestion(q.id, { correctIndex: optionIndex })} />
                              {option}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    {q.type === 'Fill in the Blank' && (
                      <Input label="Correct answer" placeholder="Expected answer" value={q.correctAnswer} onChange={(e) => updateQuestion(q.id, { correctAnswer: e.target.value })} />
                    )}
                    {q.type === 'Short Answer' && (
                      <p className="rounded-lg bg-sand-100 px-3 py-2 text-xs text-ink-600"><CheckCircle2 className="mr-1 inline size-3.5" />This response will be submitted for professor review.</p>
                    )}
                  </div>
                ))
              )}
              {manualQuestions.length > 0 && (
                <div className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
                  Total marks: <span className="font-semibold">{manualQuestions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0)}</span>
                </div>
              )}
              <Button type="button" variant="ghost" size="sm" icon={Sparkles} loading={generatingAI} onClick={handleGenerateWithAI} className="mt-1 self-start">
                Generate with AI
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button type="submit" variant="secondary" size="lg" loading={loading}>
                Save as Draft
              </Button>
              <Button type="button" size="lg" loading={loading} onClick={handlePublish}>
                Publish to Students
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
