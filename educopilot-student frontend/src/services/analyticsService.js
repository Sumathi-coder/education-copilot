import { api, USE_BACKEND } from './api'
import { readStore } from './localStore'
import { getStoredSession } from './authService'

const asNumber = (value, fallback = null) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const safeDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const normalizeText = (value) => String(value ?? '').trim().toLowerCase()

function getCurrentStudent() {
  return getStoredSession()?.user ?? null
}

function isStudentEnrolled(course, user) {
  if (!course || !user) return false

  const email = normalizeText(user.email)
  const roll = normalizeText(user.rollNumber ?? user.studentId)
  const id = normalizeText(user.id)

  const emails = Array.isArray(course.studentEmails)
    ? course.studentEmails.map(normalizeText).filter(Boolean)
    : []
  const ids = Array.isArray(course.studentIds)
    ? course.studentIds.map(normalizeText).filter(Boolean)
    : []
  const students = Array.isArray(course.students) ? course.students : []

  const studentMatch = students.some((student) => {
    if (typeof student === 'string') return normalizeText(student) === email || normalizeText(student) === roll || normalizeText(student) === id
    return normalizeText(student?.email) === email || normalizeText(student?.rollNumber ?? student?.studentId) === roll || normalizeText(student?.id) === id
  })

  if (emails.length || ids.length || students.length) {
    return emails.includes(email) || ids.includes(roll) || ids.includes(id) || studentMatch
  }

  // Courses without a roster are treated as open only when enrollment was not
  // explicitly required. This keeps professor-created restricted courses safe.
  return course.enrollmentRequired !== true
}

function getCourseUnits(course) {
  return Array.isArray(course?.units) ? course.units : []
}

function getQuestionMarks(question) {
  return Math.max(0, asNumber(question?.marks ?? question?.mark, 1) ?? 1)
}

function getEarnedMarks(question, answer, submission, index) {
  const max = getQuestionMarks(question)
  const saved = submission?.questionScores?.[index]
  if (saved !== undefined && saved !== null && saved !== '') {
    return Math.max(0, Math.min(max, asNumber(saved, 0) ?? 0))
  }

  const type = normalizeText(question?.type)
  if (question?.correctIndex !== undefined && question?.correctIndex !== null) {
    return Number(answer) === Number(question.correctIndex) ? max : 0
  }

  if (question?.correctAnswer !== undefined && question?.correctAnswer !== null && String(question.correctAnswer).trim() !== '') {
    return normalizeText(answer) === normalizeText(question.correctAnswer) ? max : 0
  }

  // Short-answer questions are professor-graded. If a per-question score is
  // not available, the best available real result is the submission percent.
  if (type === 'short answer' || type === 'essay' || type === 'subjective') {
    const percent = asNumber(submission?.percent)
    return percent === null ? 0 : Math.round((max * Math.max(0, Math.min(100, percent))) / 100)
  }

  return 0
}

function questionPercent(question, answer, submission, index) {
  const max = getQuestionMarks(question)
  if (!max) return 0
  return Math.round((getEarnedMarks(question, answer, submission, index) / max) * 100)
}

function getSubmissionPercent(submission) {
  if (submission?.percent !== null && submission?.percent !== undefined) return asNumber(submission.percent)
  const score = asNumber(submission?.score)
  const total = asNumber(submission?.totalMarks ?? submission?.total)
  if (score !== null && total > 0) return Math.round((score / total) * 100)
  return null
}

function emptyPerformance() {
  return {
    summary: {
      averageScore: 0,
      avgScore: 0,
      bestScore: 0,
      testsTaken: 0,
      studyStreak: 0,
      studyStreakDays: 0,
      overallProgress: 0,
      completedAssessments: 0,
      totalAssessments: 0,
    },
    scoreHistory: [],
    topicPerformance: [],
    quizPerformance: [],
    subjectPerformance: [],
    courseProgress: [],
    weakTopics: [],
    strongTopics: [],
  }
}

function localPerformance() {
  const user = getCurrentStudent()
  if (!user) return emptyPerformance()

  const allCourses = readStore('courses', [])
  const courses = allCourses.filter((course) => isStudentEnrolled(course, user))
  const courseMap = new Map(courses.map((course) => [String(course.id), course]))
  const courseIds = new Set(courses.map((course) => course.id))

  const allAssessments = readStore('assessments', [])
  const assessments = allAssessments.filter((assessment) => courseIds.has(assessment.courseId))
  const assessmentMap = new Map(assessments.map((assessment) => [String(assessment.id), assessment]))

  const submissions = readStore('submissions', []).filter(
    (submission) => String(submission.studentId) === String(user.id) && courseIds.has(submission.courseId),
  )

  const graded = submissions
    .map((submission) => ({ submission, percent: getSubmissionPercent(submission) }))
    .filter((item) => item.percent !== null)

  const percentages = graded.map((item) => item.percent)
  const averageScore = percentages.length
    ? Math.round(percentages.reduce((sum, value) => sum + value, 0) / percentages.length)
    : 0
  const bestScore = percentages.length ? Math.max(...percentages) : 0

  const totalAssessments = assessments.length
  const completedAssessments = submissions.length
  const overallProgress = totalAssessments
    ? Math.min(100, Math.round((completedAssessments / totalAssessments) * 100))
    : 0

  const validSubmissionDates = submissions
    .map((submission) => safeDate(submission.submittedOn))
    .filter(Boolean)
    .map((date) => date.toISOString().slice(0, 10))
  const dates = [...new Set(validSubmissionDates)].sort().reverse()

  let studyStreak = 0
  if (dates.length) {
    const latest = safeDate(`${dates[0]}T00:00:00`)
    if (latest) {
      for (let index = 0; index < dates.length; index += 1) {
        const expected = new Date(latest)
        expected.setDate(latest.getDate() - index)
        if (dates[index] === expected.toISOString().slice(0, 10)) studyStreak += 1
        else break
      }
    }
  }

  const scoreHistory = [...graded]
    .sort((a, b) => {
      const first = safeDate(a.submission.submittedOn)?.getTime() ?? 0
      const second = safeDate(b.submission.submittedOn)?.getTime() ?? 0
      return first - second
    })
    .map((item, index) => {
      const date = safeDate(item.submission.submittedOn)
      return {
        date: date ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : `Test ${index + 1}`,
        score: item.percent,
        name: item.submission.assessmentName || `Test ${index + 1}`,
      }
    })

  const courseProgress = courses.map((course) => {
    const courseAssessments = assessments.filter((assessment) => assessment.courseId === course.id)
    const courseSubmissions = submissions.filter((submission) => submission.courseId === course.id)
    const values = courseSubmissions.map(getSubmissionPercent).filter((value) => value !== null)
    return {
      course: course.name || course.code || 'Course',
      code: course.code || course.name || 'Course',
      progress: courseAssessments.length
        ? Math.min(100, Math.round((courseSubmissions.length / courseAssessments.length) * 100))
        : 0,
      avgScore: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0,
    }
  })

  // Build independent subject -> unit -> topic data from the student's real
  // assessment questions and submissions. Nothing here is seeded or mocked.
  const subjectMap = new Map()
  const topicMap = new Map()

  graded.forEach(({ submission }) => {
    const assessment = assessmentMap.get(String(submission.assessmentId))
    if (!assessment) return

    const course = courseMap.get(String(assessment.courseId))
    if (!course) return

    const subjectCode = String(course.code || course.name || course.id || 'Subject')
    const subjectName = String(course.name || subjectCode)
    if (!subjectMap.has(subjectCode)) {
      subjectMap.set(subjectCode, {
        code: subjectCode,
        name: subjectName,
        values: [],
        units: new Map(),
      })
    }
    const subject = subjectMap.get(subjectCode)

    const questions = Array.isArray(assessment.questions) ? assessment.questions : []
    questions.forEach((question, index) => {
      const unit = String(question.unit || assessment.unit || 'General').trim() || 'General'
      const topic = String(question.topic || question.title || assessment.name || 'General').trim() || 'General'
      const score = questionPercent(question, submission.answers?.[index], submission, index)

      subject.values.push(score)
      if (!subject.units.has(unit)) subject.units.set(unit, { unit, values: [], topics: new Map() })
      const unitEntry = subject.units.get(unit)
      unitEntry.values.push(score)
      if (!unitEntry.topics.has(topic)) unitEntry.topics.set(topic, [])
      unitEntry.topics.get(topic).push(score)

      const topicKey = `${subjectCode}::${unit}::${topic}`
      if (!topicMap.has(topicKey)) topicMap.set(topicKey, { name: topic, subjectCode, subjectName, unit, values: [] })
      topicMap.get(topicKey).values.push(score)
    })
  })

  // Include syllabus units even when a unit has no graded topic yet. This lets
  // the student see the complete course structure without inventing scores.
  courses.forEach((course) => {
    const subjectCode = String(course.code || course.name || course.id || 'Subject')
    const subjectName = String(course.name || subjectCode)
    if (!subjectMap.has(subjectCode)) subjectMap.set(subjectCode, { code: subjectCode, name: subjectName, values: [], units: new Map() })
    const subject = subjectMap.get(subjectCode)
    getCourseUnits(course).forEach((unit) => {
      const unitName = String(unit.title || unit.name || unit.unit || unit.code || 'General').trim() || 'General'
      if (!subject.units.has(unitName)) subject.units.set(unitName, { unit: unitName, values: [], topics: new Map() })
    })
  })

  const subjectPerformance = [...subjectMap.values()].map((subject) => {
    const units = [...subject.units.values()].map((unit) => {
      const topics = [...unit.topics.entries()].map(([topic, values]) => {
        const avgScore = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
        return { topic, name: topic, score: avgScore, avgScore, unit: unit.unit, subjectCode: subject.code }
      })
      const avgScore = unit.values.length
        ? Math.round(unit.values.reduce((sum, value) => sum + value, 0) / unit.values.length)
        : 0
      return { unit: unit.unit, name: unit.unit, avgScore, topics }
    })

    const avgScore = subject.values.length
      ? Math.round(subject.values.reduce((sum, value) => sum + value, 0) / subject.values.length)
      : 0
    return { code: subject.code, name: subject.name, subject: subject.code, avgScore, units }
  })

  const topicPerformance = [...topicMap.values()].map((topic) => {
    const avgScore = Math.round(topic.values.reduce((sum, value) => sum + value, 0) / topic.values.length)
    return {
      name: topic.name,
      topic: topic.name,
      score: avgScore,
      avgScore,
      unit: topic.unit,
      subjectCode: topic.subjectCode,
      subjectName: topic.subjectName,
    }
  })

  return {
    summary: {
      averageScore,
      avgScore: averageScore,
      bestScore,
      testsTaken: submissions.length,
      studyStreak,
      studyStreakDays: studyStreak,
      overallProgress,
      completedAssessments,
      totalAssessments,
    },
    scoreHistory,
    topicPerformance,
    quizPerformance: topicPerformance,
    subjectPerformance,
    courseProgress,
    weakTopics: topicPerformance.filter((topic) => topic.avgScore < 60).map((topic) => ({ topic: topic.name, percent: topic.avgScore })),
    strongTopics: topicPerformance.filter((topic) => topic.avgScore >= 80).map((topic) => ({ topic: topic.name, percent: topic.avgScore })),
  }
}

export async function fetchStudentPerformance() {
  if (USE_BACKEND) return (await api.get('/analytics/student/me')).data
  return localPerformance()
}

export async function fetchRevisionTopics() {
  if (USE_BACKEND) return (await api.get('/analytics/student/me/revision')).data
  return localPerformance().weakTopics
}
