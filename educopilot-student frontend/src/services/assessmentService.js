import { api, USE_BACKEND } from './api'
import { readStore, writeStore } from './localStore'
import { getStoredSession } from './authService'

const ASSESSMENTS_STORE = 'assessments'
const SUBMISSIONS_STORE = 'submissions'

function currentUser() {
  return getStoredSession()?.user ?? null
}

function normalized(value) {
  return String(value ?? '').trim().toLowerCase()
}

function enrolled(course, user) {
  if (!course || !user) return false
  const email = normalized(user.email)
  const roll = normalized(user.rollNumber ?? user.studentId)
  const id = normalized(user.id)

  const emails = Array.isArray(course.studentEmails) ? course.studentEmails.map(normalized).filter(Boolean) : []
  const ids = Array.isArray(course.studentIds) ? course.studentIds.map(normalized).filter(Boolean) : []
  const roster = Array.isArray(course.students) ? course.students : []

  const rosterMatch = roster.some((student) => {
    if (typeof student === 'string') return normalized(student) === email || normalized(student) === roll || normalized(student) === id
    return normalized(student?.email) === email || normalized(student?.rollNumber ?? student?.studentId) === roll || normalized(student?.id) === id
  })

  if (emails.length || ids.length || roster.length) {
    return emails.includes(email) || ids.includes(roll) || ids.includes(id) || rosterMatch
  }

  return course.enrollmentRequired !== true
}

function status(a) {
  if (a?.status === 'draft') return 'draft'
  if (a?.status === 'completed') return 'completed'
  if (a?.published === false || a?.isPublished === false) return 'draft'
  const due = a?.dueDate || a?.endAt
  return due && new Date(due).getTime() <= Date.now() ? 'completed' : 'active'
}

function normalize(a) {
  return {
    ...a,
    questions: Array.isArray(a?.questions) ? a.questions : [],
    status: status(a),
  }
}

export async function fetchStudentAssessments() {
  if (USE_BACKEND) return (await api.get('/student/assessments')).data
  const user = currentUser()
  if (!user) return []

  const courses = readStore('courses', [])
  const courseIds = new Set(courses.filter((course) => enrolled(course, user)).map((course) => course.id))
  const submissions = readStore(SUBMISSIONS_STORE, [])

  return readStore(ASSESSMENTS_STORE, [])
    .map(normalize)
    .filter((assessment) => assessment.status === 'active')
    .filter((assessment) => !assessment.availableFrom || new Date(assessment.availableFrom).getTime() <= Date.now())
    .filter((assessment) => courseIds.has(assessment.courseId))
    .map((assessment) => ({
      ...assessment,
      submitted: submissions.some((submission) => submission.assessmentId === assessment.id && String(submission.studentId) === String(user.id)),
    }))
    .filter((assessment) => !assessment.submitted)
}

export async function fetchStudentCompletedAssessments() {
  if (USE_BACKEND) return (await api.get('/student/assessments/completed')).data
  const user = currentUser()
  if (!user) return []

  const courses = readStore('courses', [])
  const courseIds = new Set(courses.filter((course) => enrolled(course, user)).map((course) => course.id))
  const submissions = readStore(SUBMISSIONS_STORE, [])

  return readStore(ASSESSMENTS_STORE, [])
    .map(normalize)
    .filter((assessment) => courseIds.has(assessment.courseId))
    .filter((assessment) => assessment.status === 'completed' || submissions.some((submission) => submission.assessmentId === assessment.id && String(submission.studentId) === String(user.id)))
    .map((assessment) => {
      const submission = submissions.find((item) => item.assessmentId === assessment.id && String(item.studentId) === String(user.id))
      return { ...assessment, submitted: Boolean(submission), submission }
    })
}

export async function getStudentAssessment(id) {
  if (USE_BACKEND) return (await api.get(`/student/assessments/${id}`)).data
  const user = currentUser()
  const assessment = readStore(ASSESSMENTS_STORE, []).map(normalize).find((item) => String(item.id) === String(id))
  if (!assessment) throw new Error('Assessment not found.')
  if (assessment.status !== 'active' || (assessment.availableFrom && new Date(assessment.availableFrom).getTime() > Date.now())) {
    throw new Error('This assessment is no longer active.')
  }

  const course = readStore('courses', []).find((item) => item.id === assessment.courseId)
  if (!enrolled(course, user)) throw new Error('You are not enrolled in this course.')

  return assessment
}

export async function submitAssessment(id, answers) {
  if (USE_BACKEND) return (await api.post(`/student/assessments/${id}/submit`, { answers })).data
  const user = currentUser()
  if (!user) throw new Error('Please sign in again.')

  const assessment = await getStudentAssessment(id)
  const submissions = readStore(SUBMISSIONS_STORE, [])
  if (submissions.some((submission) => submission.assessmentId === id && String(submission.studentId) === String(user.id))) {
    throw new Error('You have already submitted this assessment.')
  }

  let correctMarks = 0
  let autoGradedMarks = 0
  let hasSubjective = false

  assessment.questions.forEach((question, index) => {
    const marks = Number(question.marks ?? question.mark ?? 1) || 1
    const type = normalized(question.type)
    const subjective = type === 'short answer' || type === 'essay' || type === 'subjective'
    if (subjective || (question.correctIndex === undefined && question.correctAnswer === undefined)) {
      hasSubjective = true
      return
    }

    autoGradedMarks += marks
    if (question.correctIndex !== undefined && question.correctIndex !== null) {
      if (Number(answers[index]) === Number(question.correctIndex)) correctMarks += marks
    } else if (question.correctAnswer !== undefined && question.correctAnswer !== null) {
      if (normalized(answers[index]) === normalized(question.correctAnswer)) correctMarks += marks
    }
  })

  const totalMarks = assessment.questions.reduce((sum, question) => sum + (Number(question.marks ?? question.mark ?? 1) || 1), 0)
  const percent = autoGradedMarks > 0 && !hasSubjective ? Math.round((correctMarks / autoGradedMarks) * 100) : null

  const submission = {
    id: `submission-${crypto.randomUUID?.() ?? Date.now()}`,
    assessmentId: id,
    assessmentName: assessment.name,
    assessmentType: assessment.type,
    type: assessment.type,
    courseId: assessment.courseId,
    courseName: assessment.courseName,
    studentId: user.id,
    studentName: user.name,
    studentEmail: user.email,
    rollNumber: user.rollNumber || '',
    total: assessment.questions.length,
    totalMarks,
    answers,
    score: hasSubjective ? null : correctMarks,
    percent,
    status: hasSubjective ? 'submitted' : 'graded',
    submittedOn: new Date().toISOString(),
  }

  writeStore(SUBMISSIONS_STORE, [...submissions, submission])
  return submission
}

export function subscribeAssessmentUpdates(callback) {
  const handler = () => callback()
  window.addEventListener('educopilot:data-updated', handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener('educopilot:data-updated', handler)
    window.removeEventListener('storage', handler)
  }
}
