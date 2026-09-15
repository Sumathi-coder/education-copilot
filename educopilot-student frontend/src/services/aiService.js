import { aiApi, USE_BACKEND } from './api'

export async function askTutor({ courseId, question, attachment }) {
  if (!USE_BACKEND) throw new Error('AI Tutor requires the backend/AI service.')
  if (attachment) {
    const formData = new FormData()
    formData.append('courseId', courseId)
    formData.append('question', question)
    formData.append('file', attachment)
    return (await aiApi.post('/tutor/ask', formData)).data
  }
  return (await aiApi.post('/tutor/ask', { courseId, question })).data
}

export function getSuggestedQuestions() {
  return []
}

export function getConversationHistory() {
  return []
}

export async function generateStudyPlan(payload) {
  if (!USE_BACKEND) throw new Error('Study plan generation requires the backend/AI service.')
  return (await aiApi.post('/study-plan/generate', payload)).data
}
