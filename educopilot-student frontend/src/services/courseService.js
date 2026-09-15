import { api, USE_BACKEND } from './api'
import { readStore } from './localStore'
import { getStoredSession } from './authService'
import { getUploadedMaterials, onMaterialsUpdated } from './materialsStore'

const COURSES_STORE = 'courses'

function normalizeCourse(course) {
  return {
    id: course?.id ?? '',
    name: course?.name ?? 'Untitled Course',
    code: course?.code ?? '',
    professor: course?.professor ?? 'Professor',
    description: course?.description ?? '',
    studentEmails: Array.isArray(course?.studentEmails) ? course.studentEmails : [],
    studentCount: Array.isArray(course?.studentEmails) ? course.studentEmails.length : 0,
    progress: 0,
    nextTopic: 'Not set',
    examDate: null,
    credits: 0,
    units: [],
    color: 'teal',
    ...course,
  }
}

export async function fetchCourses() {
  if (USE_BACKEND) {
    const { data } = await api.get('/courses')
    return data
  }
  const session = getStoredSession()
  const courses = Array.isArray(readStore(COURSES_STORE, [])) ? readStore(COURSES_STORE, []) : []
  if (session?.user?.role === 'student') {
    const email = String(session.user.email ?? '').trim().toLowerCase()
    return courses
      .filter((course) => {
        const roster = Array.isArray(course.studentEmails) ? course.studentEmails.map((value) => String(value).trim().toLowerCase()).filter(Boolean) : []
        const idRoster = Array.isArray(course.studentIds) ? course.studentIds.map((value) => String(value).trim().toLowerCase()).filter(Boolean) : []
        const studentId = String(session.user.rollNumber ?? session.user.studentId ?? '').trim().toLowerCase()
        const userId = String(session.user.id ?? '').trim().toLowerCase()
        // Students only see courses that the professor has explicitly accepted them into.
        return roster.includes(email) || (studentId && idRoster.includes(studentId)) || idRoster.includes(userId)
      })
      .map(normalizeCourse)
  }
  return courses.map(normalizeCourse)
}

export async function fetchCourseById(courseId) {
  if (USE_BACKEND) {
    const { data } = await api.get(`/courses/${courseId}`)
    return data
  }
  const course = readStore(COURSES_STORE, []).find((item) => item.id === courseId)
  if (!course) {
    const error = new Error('Course not found.')
    error.code = 'NOT_FOUND'
    throw error
  }
  return normalizeCourse(course)
}

export async function fetchCourseMaterials(courseId) {
  if (USE_BACKEND) {
    const { data } = await api.get(`/courses/${courseId}/materials`)
    return data
  }
  return getUploadedMaterials(courseId).filter((m) => m.status === 'ready')
}

export { onMaterialsUpdated }
