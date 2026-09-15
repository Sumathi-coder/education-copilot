import { api, USE_BACKEND } from './api'
import { readStore, writeStore } from './localStore'
import { getUploadedMaterials, addUploadedMaterial, updateUploadedMaterial, removeUploadedMaterial } from './materialsStore'
import { getStoredSession } from './authService'

const COURSES_STORE = 'courses'
const ASSESSMENTS_STORE = 'assessments'
const SUBMISSIONS_STORE = 'submissions'
const SCHEDULES_STORE = 'schedules'
const REQUESTS_STORE = 'enrollmentRequests'

function currentUser() {
  return getStoredSession()?.user ?? null
}

function allCourses() {
  return readStore(COURSES_STORE, [])
}

function professorCourses() {
  const user=currentUser(); const courses=allCourses().filter(c=>!c.professorId||c.professorId===user?.id)
  const assessments=readStore(ASSESSMENTS_STORE,[]), submissions=readStore(SUBMISSIONS_STORE,[])
  return courses.map(c=>{const rosterIds=new Set((c.studentIds||[]).map(String));const rosterEmails=new Set((c.studentEmails||[]).map(x=>String(x).toLowerCase()));const allStudents=readStore('users',[]).filter(u=>u.role==='student'); const restricted=Boolean(c.enrollmentRequired)||rosterIds.size||rosterEmails.size; const courseSubs=submissions.filter(s=>s.courseId===c.id); const users=allStudents.filter(u=>!restricted||((u.rollNumber&&rosterIds.has(String(u.rollNumber)))||rosterEmails.has(String(u.email).toLowerCase()))||courseSubs.some(s=>s.studentId===u.id));const vals=courseSubs.map(s=>Number(s.percent??s.score)).filter(Number.isFinite);const as=assessments.filter(a=>a.courseId===c.id&&a.status!=='draft');return {...c,studentCount:users.length||courseSubs.length?Math.max(users.length,new Set(courseSubs.map(s=>s.studentId)).size):0,avgScore:vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0,completionRate:users.length&&as.length?Math.round(new Set(courseSubs.map(s=>s.studentId)).size/users.length*100):0,assessmentCount:as.length}})
}

export async function fetchProfessorCourses() {
  if (USE_BACKEND) return (await api.get('/professor/courses')).data
  return professorCourses()
}

export async function fetchProfessorCourseById(courseId) {
  if (USE_BACKEND) return (await api.get(`/professor/courses/${courseId}`)).data
  const course = professorCourses().find((item) => item.id === courseId)
  if (!course) {
    const error = new Error('Course not found.')
    error.code = 'NOT_FOUND'
    throw error
  }
  return course
}

export async function createCourse(payload) {
  if (USE_BACKEND) return (await api.post('/professor/courses', payload)).data

  const user = currentUser()
  if (!user) throw new Error('You must be signed in.')

  const course = {
    id: `course-${crypto.randomUUID?.() ?? Date.now()}`,
    name: payload.name.trim(),
    code: payload.code.trim().toUpperCase(),
    description: payload.description?.trim() || '',
    semester: payload.semester,
    academicYear: payload.academicYear,
    professor: user.name,
    professorId: user.id,
    studentEmails: payload.studentEmails ?? [],
    studentCount: 0,
    avgScore: 0,
    completionRate: 0,
    studentIds: payload.studentIds ?? [],
    enrollmentRequired: true,
    pendingStudentIds: payload.pendingStudentIds ?? [],
    progress: 0,
    nextTopic: 'Not set',
    examDate: null,
    credits: 0,
    color: 'teal',
    units: [],
    createdAt: new Date().toISOString(),
  }
  writeStore(COURSES_STORE, [...allCourses(), course])
  // Student IDs entered by the professor are accepted by the professor at course creation time.
  // They become part of the roster immediately; students cannot self-enroll.
  if (course.pendingStudentIds?.length) {
    const ids = course.pendingStudentIds.map((value) => String(value).trim()).filter(Boolean)
    const users = readStore('users', [])
    const invited = users.filter((u) => u.role === 'student' && ids.some((id) => id.toLowerCase() === String(u.rollNumber ?? '').trim().toLowerCase()))
    const acceptedIds = invited.map((u) => String(u.rollNumber).trim())
    const acceptedEmails = invited.map((u) => String(u.email ?? '').trim()).filter(Boolean)
    const updatedCourse = {
      ...course,
      // The professor has accepted every entered Student ID. Keep the ID even if
      // that student has not registered yet; fetchRoster only shows registered users.
      studentIds: [...new Set([...(course.studentIds || []), ...ids])],
      studentEmails: [...new Set([...(course.studentEmails || []), ...acceptedEmails])],
      pendingStudentIds: [],
    }
    writeStore(COURSES_STORE, allCourses().map((item) => item.id === course.id ? updatedCourse : item))

    // Notify only the affected students; this is a professor -> student event.
    if (invited.length) {
      const requests = readStore(REQUESTS_STORE, [])
      const additions = invited.map((u) => ({
        id: `approval-${crypto.randomUUID?.() ?? Date.now()}-${u.id}`,
        courseId: course.id,
        courseName: course.name,
        studentId: u.id,
        studentRollNumber: u.rollNumber,
        studentName: u.name,
        studentEmail: u.email,
        status: 'accepted',
        createdOn: new Date().toISOString(),
        respondedOn: new Date().toISOString(),
      }))
      writeStore(REQUESTS_STORE, [...requests, ...additions])
    }
    return updatedCourse
  }
  return course
}

export async function updateCourse(courseId, patch) {
  if (USE_BACKEND) return (await api.put(`/professor/courses/${courseId}`, patch)).data
  const updated = allCourses().map((course) => course.id === courseId ? { ...course, ...patch } : course)
  writeStore(COURSES_STORE, updated)
  return updated.find((course) => course.id === courseId)
}

export async function deleteCourse(courseId) {
  if (USE_BACKEND) {
    await api.delete(`/professor/courses/${courseId}`)
    return
  }
  writeStore(COURSES_STORE, allCourses().filter((course) => course.id !== courseId))
}

// Materials
export async function fetchCourseMaterialsForProfessor(courseId) {
  if (USE_BACKEND) return (await api.get(`/professor/courses/${courseId}/materials`)).data
  return getUploadedMaterials(courseId)
}

export async function uploadMaterial(courseId, file, materialType = 'Course Material') {
  if (USE_BACKEND) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', materialType)
    return (await api.post(`/professor/courses/${courseId}/materials`, formData)).data
  }

  // Local mode stores metadata only. The real file is intentionally not
  // converted into application data. Backend storage will own file bytes.
  const material = {
    id: `material-${crypto.randomUUID?.() ?? Date.now()}`,
    courseId,
    name: file.name,
    type: materialType,
    sizeKb: Math.max(1, Math.round((file.size ?? 0) / 1024)),
    uploadedOn: new Date().toISOString(),
    status: 'ready',
  }
  return addUploadedMaterial(courseId, material)
}

export async function deleteMaterial(courseId, materialId) {
  if (USE_BACKEND) {
    await api.delete(`/professor/courses/${courseId}/materials/${materialId}`)
    return
  }
  removeUploadedMaterial(courseId, materialId)
}

// Roster contains ONLY students explicitly accepted/enrolled by the professor.
export async function fetchRoster(courseId) {
  if (USE_BACKEND) return (await api.get(`/professor/courses/${courseId}/students`)).data
  const course = allCourses().find((item) => item.id === courseId)
  const users = readStore('users', [])
  const ids = new Set((course?.studentIds || []).map((v) => String(v).trim().toLowerCase()))
  const emails = new Set((course?.studentEmails || []).map((v) => String(v).trim().toLowerCase()))
  const submissions = readStore(SUBMISSIONS_STORE, []).filter((s) => s.courseId === courseId)
  return users.filter((u) => u.role === 'student' && (
    ids.has(String(u.rollNumber ?? '').trim().toLowerCase()) ||
    emails.has(String(u.email ?? '').trim().toLowerCase())
  )).map(({ password, ...user }) => {
    const mine = submissions.filter((s) => s.studentId === user.id)
    const scores = mine.map((s) => Number(s.percent ?? s.score)).filter(Number.isFinite)
    return { ...user, avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0, progress: course?.assessmentCount ? Math.round(mine.length / course.assessmentCount * 100) : 0, testsTaken: mine.length, weakTopic: '—' }
  })
}

export async function requestEnrollment(courseId, studentId) {
  if (USE_BACKEND) return (await api.post('/student/enrollment-requests', { courseId, studentId })).data
  const user = currentUser()
  if (!user || user.role !== 'student') throw new Error('Student login required.')
  if (String(studentId).trim().toLowerCase() !== String(user.rollNumber ?? '').trim().toLowerCase()) throw new Error('The Student ID does not match your account.')
  const course = allCourses().find((c) => c.id === courseId || c.code?.toLowerCase() === String(courseId).trim().toLowerCase())
  if (!course) throw new Error('Course not found. Use the course code or course ID.')
  const enrolled = (course.studentIds || []).some((id) => String(id).trim().toLowerCase() === String(user.rollNumber ?? '').trim().toLowerCase()) || (course.studentEmails || []).some((email) => String(email).trim().toLowerCase() === String(user.email ?? '').trim().toLowerCase())
  if (enrolled) throw new Error('You are already enrolled in this course.')
  const requests = readStore(REQUESTS_STORE, [])
  if (requests.some((r) => r.courseId === course.id && r.studentId === user.id && r.status === 'pending')) throw new Error('Request already pending.')
  const req = { id: `request-${crypto.randomUUID?.() ?? Date.now()}`, courseId: course.id, courseName: course.name, studentId: user.id, studentRollNumber: user.rollNumber, studentName: user.name, studentEmail: user.email, status: 'pending', createdOn: new Date().toISOString() }
  writeStore(REQUESTS_STORE, [...requests, req])
  return req
}

export async function fetchEnrollmentRequests(courseId) {
  if (USE_BACKEND) return (await api.get(`/professor/courses/${courseId}/enrollment-requests`)).data
  return readStore(REQUESTS_STORE, []).filter((r) => r.courseId === courseId && r.status === 'pending')
}

export async function respondToEnrollmentRequest(requestId, accept) {
  if (USE_BACKEND) return (await api.post(`/professor/enrollment-requests/${requestId}/${accept ? 'accept' : 'reject'}`)).data
  const requests = readStore(REQUESTS_STORE, [])
  const req = requests.find((r) => r.id === requestId)
  if (!req) throw new Error('Request not found.')
  const now = new Date().toISOString()
  const updatedRequest = { ...req, status: accept ? 'accepted' : 'rejected', respondedOn: now }
  writeStore(REQUESTS_STORE, requests.map((r) => r.id === requestId ? updatedRequest : r))
  if (accept) {
    const courses = allCourses()
    const c = courses.find((item) => item.id === req.courseId)
    if (c) {
      const ids = [...(c.studentIds || []), req.studentRollNumber || req.studentId]
      const emails = [...(c.studentEmails || []), req.studentEmail]
      writeStore(COURSES_STORE, courses.map((item) => item.id === c.id ? { ...item, studentIds: [...new Set(ids.filter(Boolean))], studentEmails: [...new Set(emails.filter(Boolean))] } : item))
    }
  }
  return updatedRequest
}

export async function removeStudentFromCourse(courseId, student) {
  if (USE_BACKEND) {
    const identifier = encodeURIComponent(student?.id || student?.email || student?.rollNumber || '')
    await api.delete(`/professor/courses/${courseId}/students/${identifier}`)
    return
  }
  const courses = allCourses()
  const course = courses.find((item) => item.id === courseId)
  if (!course) throw new Error('Course not found.')
  const email = String(student?.email ?? '').trim().toLowerCase()
  const roll = String(student?.rollNumber ?? student?.studentId ?? '').trim().toLowerCase()
  const userId = String(student?.id ?? '').trim()
  const nextIds = (course.studentIds || []).filter((id) => String(id).trim().toLowerCase() !== roll && String(id).trim() !== userId)
  const nextEmails = (course.studentEmails || []).filter((value) => String(value).trim().toLowerCase() !== email)
  writeStore(COURSES_STORE, courses.map((item) => item.id === courseId ? { ...item, studentIds: nextIds, studentEmails: nextEmails, studentCount: nextIds.length || nextEmails.length } : item))
  // Remove stale request/invitation records so the student cannot regain access from an old approval.
  writeStore(REQUESTS_STORE, readStore(REQUESTS_STORE, []).filter((r) => !(r.courseId === courseId && (String(r.studentId) === userId || String(r.studentEmail ?? '').trim().toLowerCase() === email || String(r.studentRollNumber ?? '').trim().toLowerCase() === roll))))
}

// Planner
export async function generateSchedule(config) {
  if (!USE_BACKEND) throw new Error('Lecture schedule generation requires the backend.')
  return (await api.post('/professor/planner/generate', config)).data
}

export async function saveSchedule(schedule) {
  if (USE_BACKEND) return (await api.post('/professor/planner/schedule', schedule)).data
  const store = readStore(SCHEDULES_STORE, {})
  store[schedule.courseId || schedule.courseName] = schedule
  writeStore(SCHEDULES_STORE, store)
  return schedule
}

// AI generator
export async function generateMaterial(config) {
  if (!USE_BACKEND) throw new Error('AI material generation requires the AI/backend service.')
  return (await api.post('/professor/material-generator/generate', config)).data
}

// Assessments
function assessmentStatus(a){
  if(a.status==='draft') return 'draft'
  const due=a.dueDate||a.endAt
  return due && new Date(due).getTime()<=Date.now() ? 'completed' : 'active'
}
export async function fetchAssessments(){
  if(USE_BACKEND) return (await api.get('/professor/assessments')).data
  const submissions=readStore(SUBMISSIONS_STORE,[])
  return readStore(ASSESSMENTS_STORE,[]).filter(a=>!a?.professorId || a.professorId===currentUser()?.id).map(a=>{
    const questions=Array.isArray(a.questions)?a.questions:[]
    const totalMarks=questions.reduce((sum,q)=>sum+(Number(q.marks??q.mark??1)||1),0)
    const attempts=submissions.filter(s=>s.assessmentId===a.id).length
    const assessmentSubmissions=submissions.filter(s=>s.assessmentId===a.id)
    const scores=assessmentSubmissions.map(s=>Number(s.percent)).filter(Number.isFinite)
    return {...a,questions,status:assessmentStatus(a),totalMarks,attempts,avgScore:scores.length?Math.round(scores.reduce((x,y)=>x+y,0)/scores.length):null}
  })
}

export async function createAssessment(payload){
  if(USE_BACKEND) return (await api.post('/professor/assessments',payload)).data
  const user=currentUser(); if(!user) throw new Error('You must be signed in as a professor.')
  const course=allCourses().find(item=>item.id===payload.courseId); if(!course) throw new Error('The selected course no longer exists.')
  const questions=Array.isArray(payload.questions)?payload.questions:[]
  const status=payload.status==='active'?'active':'draft'
  const normalizedQuestions=questions.map((q)=>({...q,marks:Number(q.marks??q.mark??1)||1}))
  const totalMarks=normalizedQuestions.reduce((sum,q)=>sum+q.marks,0)
  const assessment={id:`assessment-${crypto.randomUUID?.()??Date.now()}`,professorId:user.id,professorName:user.name,...payload,questions:normalizedQuestions,numQuestions:normalizedQuestions.length,totalMarks,status,publishedOn:status==='active'?new Date().toISOString():null,attempts:0,avgScore:null,createdOn:new Date().toISOString()}
  writeStore(ASSESSMENTS_STORE,[...readStore(ASSESSMENTS_STORE,[]),assessment]); return assessment
}
export async function publishAssessment(id){
  if(USE_BACKEND) return (await api.post(`/professor/assessments/${id}/publish`)).data
  const assessments=readStore(ASSESSMENTS_STORE,[]); const a=assessments.find(x=>x.id===id); if(!a) throw new Error('Assessment not found.')
  if(!a.questions?.length) throw new Error('Add at least one question before publishing.')
  const updated=assessments.map(x=>x.id===id?{...x,status:'active',publishedOn:new Date().toISOString()}:x); writeStore(ASSESSMENTS_STORE,updated); return updated.find(x=>x.id===id)
}

export async function duplicateAssessment(id) {
  if (USE_BACKEND) return (await api.post(`/professor/assessments/${id}/duplicate`)).data
  const original = readStore(ASSESSMENTS_STORE, []).find((a) => a.id === id)
  if (!original) throw new Error('Assessment not found.')
  const copy = { ...original, id: `assessment-${crypto.randomUUID?.() ?? Date.now()}`, name: `${original.name} (Copy)`, status: 'draft' }
  writeStore(ASSESSMENTS_STORE, [...readStore(ASSESSMENTS_STORE, []), copy])
  return copy
}

export async function deleteAssessment(id) {
  if (USE_BACKEND) {
    await api.delete(`/professor/assessments/${id}`)
    return
  }
  writeStore(ASSESSMENTS_STORE, readStore(ASSESSMENTS_STORE, []).filter((a) => a.id !== id))
}

// Submissions
export async function fetchSubmissions() {
  if (USE_BACKEND) return (await api.get('/professor/submissions')).data
  const assessments = readStore(ASSESSMENTS_STORE, [])
  const courses = professorCourses()
  const courseIds = new Set(courses.map(c => c.id))
  return readStore(SUBMISSIONS_STORE, []).filter(s => courseIds.has(s.courseId)).map(s => {
    const a = assessments.find(x => x.id === s.assessmentId)
    const calculatedTotal = (a?.questions || []).reduce((sum, q) => sum + (Number(q.marks ?? q.mark ?? 1) || 1), 0)
    const totalMarks = Number(s.totalMarks ?? s.total ?? calculatedTotal)
    const score = s.score === null || s.score === undefined ? null : Number(s.score)
    return { ...s, type: s.type || a?.type || '', assessmentType: s.assessmentType || a?.type || '', totalMarks, score: Number.isFinite(score) ? score : null, percent: Number.isFinite(Number(s.percent)) ? Number(s.percent) : (totalMarks ? Math.round((score / totalMarks) * 100) : null) }
  })
}

export async function fetchSubmissionById(id) {
  if (USE_BACKEND) return (await api.get(`/professor/submissions/${id}`)).data
  const raw = readStore(SUBMISSIONS_STORE, []).find((s) => s.id === id)
  if (!raw) { const error = new Error('Submission not found.'); error.code = 'NOT_FOUND'; throw error }
  const assessment = readStore(ASSESSMENTS_STORE, []).find(a => a.id === raw.assessmentId)
  const calculatedTotal=(assessment?.questions||[]).reduce((sum,q)=>sum+(Number(q.marks??q.mark??1)||1),0)
  const submission = { ...raw, type: raw.type || assessment?.type || '', assessmentType: raw.assessmentType || assessment?.type || '', totalMarks: Number(raw.totalMarks ?? raw.total ?? calculatedTotal), score: raw.score == null ? null : Number(raw.score) }
  const questions = (assessment?.questions || []).map((q,index)=>({
    ...q, marks:Number(q.marks??q.mark??1)||1, question:q.text || q.question, studentAnswerIndex: q.type==='MCQ'||q.type==='True/False' ? raw.answers?.[index] : undefined, studentAnswer: q.type==='MCQ'||q.type==='True/False' ? (q.options?.[raw.answers?.[index]] ?? '') : (raw.answers?.[index] ?? '')
  }))
  return { submission, questions }
}

export async function publishGrade(id, payload) {
  if (USE_BACKEND) return (await api.post(`/professor/submissions/${id}/grade`, payload)).data
  const submissions = readStore(SUBMISSIONS_STORE, [])
  const raw=submissions.find((s)=>s.id===id)
  if(!raw) throw new Error('Submission not found.')
  const assessment=readStore(ASSESSMENTS_STORE,[]).find(a=>a.id===raw.assessmentId)
  const questions=Array.isArray(assessment?.questions)?assessment.questions:[]
  const questionScores=payload.questionScores || {}
  const totalMarks=questions.reduce((sum,q)=>sum+(Number(q.marks??q.mark??1)||1),0)
  const score=Object.keys(questionScores).length ? questions.reduce((sum,q,i)=>sum+Math.max(0,Math.min(Number(q.marks??q.mark??1)||1,Number(questionScores[i]??0)||0)),0) : Number(payload.score??raw.score??0)
  const percent=totalMarks?Math.round(score/totalMarks*100):0
  const updated = submissions.map((s) => s.id === id ? { ...s, ...payload, score, totalMarks, percent, questionScores, status: 'graded', gradedOn:new Date().toISOString() } : s)
  writeStore(SUBMISSIONS_STORE, updated)
  return updated.find((s) => s.id === id)
}

// Analytics are empty until actual student submissions/results exist.
export async function fetchClassAnalytics(courseId){
  if(USE_BACKEND) return (await api.get(`/professor/analytics?course=${courseId}`)).data
  const course=allCourses().find(c=>c.id===courseId)
  const roster=await fetchRoster(courseId)
  const assessments=readStore(ASSESSMENTS_STORE,[]).filter(a=>a.courseId===courseId)
  const submissions=readStore(SUBMISSIONS_STORE,[]).filter(s=>s.courseId===courseId)
  const scores=submissions.map(s=>Number(s.percent ?? s.score)).filter(Number.isFinite)
  const avg=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):0
  const completion=roster.length&&assessments.length?Math.round((new Set(submissions.map(s=>s.studentId)).size/roster.length)*100):0
  const distribution=[{range:'0–39',students:scores.filter(x=>x<40).length},{range:'40–59',students:scores.filter(x=>x>=40&&x<60).length},{range:'60–79',students:scores.filter(x=>x>=60&&x<80).length},{range:'80–100',students:scores.filter(x=>x>=80).length}]
  const assessmentPerformance=assessments.map(a=>{const ss=submissions.filter(s=>s.assessmentId===a.id);const vals=ss.map(s=>Number(s.percent??s.score)).filter(Number.isFinite);return {name:a.name,avgScore:vals.length?Math.round(vals.reduce((x,y)=>x+y,0)/vals.length):0}})
  const averageOverTime=submissions.filter(s=>Number.isFinite(Number(s.percent??s.score))).sort((a,b)=>new Date(a.submittedOn)-new Date(b.submittedOn)).map(s=>({date:new Date(s.submittedOn).toLocaleDateString(undefined,{month:'short',day:'numeric'}),average:Number(s.percent??s.score)||0}))
  const topic={}; submissions.forEach(s=>{const a=assessments.find(x=>x.id===s.assessmentId);(a?.questions||[]).forEach((q,i)=>{const n=q.topic||'General';if(!topic[n])topic[n]=[];const val=Number(s.percent??s.score);topic[n].push(Number.isFinite(val)?val:0)})})
  const topicPerformance=Object.entries(topic).map(([name,v])=>{const avgScore=Math.round(v.reduce((a,b)=>a+b,0)/v.length);return {name,avgScore,topic:name,score:avgScore}})
  return {summary:{totalStudents:roster.length,avgScore:avg,highestScore:scores.length?Math.max(...scores):0,lowestScore:scores.length?Math.min(...scores):0,completionRate:completion},averageOverTime,scoreDistribution:distribution,topicPerformance,assessmentPerformance,weakTopics:topicPerformance.filter(x=>x.avgScore<60).map(x=>({topic:x.name,percent:x.avgScore})),strongTopics:topicPerformance.filter(x=>x.avgScore>=80).map(x=>({topic:x.name,percent:x.avgScore})),roster}
}
export async function fetchStudentAnalytics(studentId){
  if(USE_BACKEND) return (await api.get(`/professor/analytics/student/${studentId}`)).data
  const student=readStore('users',[]).find(u=>u.id===studentId); const submissions=readStore(SUBMISSIONS_STORE,[]).filter(s=>s.studentId===studentId); const assessments=readStore(ASSESSMENTS_STORE,[])
  const scores=submissions.map(s=>Number(s.percent??s.score)).filter(Number.isFinite); const overallScore=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):0
  const scoreHistory=submissions.filter(s=>Number.isFinite(Number(s.percent??s.score))).map(s=>({date:s.submittedOn,score:Number(s.percent??s.score)}))
  const topicPerformance=[]; const weakTopics=[]; const strongTopics=[]
  return {student,overallScore,progress:assessments.length?Math.round(submissions.length/assessments.length*100):0,scoreHistory,topicPerformance,weakTopics,strongTopics,quizHistory:submissions.map(s=>({id:s.id,topic:s.assessmentName,date:s.submittedOn,percent:Number(s.percent??s.score)||0})),recommendation:overallScore<60?'Review weak areas and retake practice questions.':'Keep building consistency with your next assessment.'}
}
