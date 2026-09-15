import { api, USE_BACKEND } from './api'
import { readStore, writeStore } from './localStore'

const QUIZZES_STORE = 'quizzes'
const RESULTS_STORE = 'quiz_results'

export async function generateQuiz(payload) {
  if (USE_BACKEND) return (await api.post('/quizzes/generate', payload)).data

  const assessments = readStore('assessments', [])
    .filter((a) => a.courseId === payload.courseId && a.status !== 'draft')
  const source = assessments.find((a) => a.questions?.length)
  if (!source) {
    throw new Error('No published questions are available for this course yet.')
  }

  const questions = source.questions
  const quiz = {
    id: `quiz-${crypto.randomUUID?.() ?? Date.now()}`,
    courseId: source.courseId,
    courseName: source.courseName,
    topic: payload.topic === 'all' ? 'Course assessment' : payload.topic,
    difficulty: payload.difficulty,
    durationMinutes: Number(payload.durationMinutes) || source.duration || 15,
    createdAt: new Date().toISOString(),
    questions,
  }
  writeStore(QUIZZES_STORE, { ...readStore(QUIZZES_STORE, {}), [quiz.id]: quiz })
  return quiz
}

export async function getQuiz(quizId) {
  if (USE_BACKEND) return (await api.get(`/quizzes/${quizId}`)).data
  const quiz = readStore(QUIZZES_STORE, {})[quizId]
  if (!quiz) throw new Error('Quiz not found.')
  return quiz
}

export async function submitQuiz(quizId, answers) {
  if (USE_BACKEND) return (await api.post(`/quizzes/${quizId}/submit`, { answers })).data
  const quiz = await getQuiz(quizId)
  const topicTally = {}
  let correctCount = 0
  quiz.questions.forEach((question, index) => {
    const correct = answers[index] === question.correctIndex
    if (correct) correctCount += 1
    topicTally[question.topic || 'General'] ??= { correct: 0, total: 0 }
    topicTally[question.topic || 'General'].total += 1
    if (correct) topicTally[question.topic || 'General'].correct += 1
  })
  const topicBreakdown = Object.entries(topicTally).map(([topic, value]) => ({
    topic, percent: Math.round((value.correct / value.total) * 100),
  }))
  const result = {
    quizId, courseId: quiz.courseId, courseName: quiz.courseName, topic: quiz.topic,
    total: quiz.questions.length, score: correctCount,
    percent: Math.round((correctCount / quiz.questions.length) * 100),
    answers, topicBreakdown,
    strongTopics: topicBreakdown.filter((t) => t.percent >= 70).map((t) => t.topic),
    weakTopics: topicBreakdown.filter((t) => t.percent < 70).map((t) => t.topic),
    submittedAt: new Date().toISOString(),
  }
  writeStore(RESULTS_STORE, { ...readStore(RESULTS_STORE, {}), [quizId]: result })
  return result
}

export async function getQuizResult(quizId) {
  if (USE_BACKEND) return (await api.get(`/quizzes/${quizId}/result`)).data
  const result = readStore(RESULTS_STORE, {})[quizId]
  if (!result) throw new Error('No result found for this quiz yet.')
  return result
}

export async function fetchQuizHistory() {
  if (USE_BACKEND) return (await api.get('/quizzes/history')).data
  return Object.values(readStore(RESULTS_STORE, {})).sort(
    (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt),
  )
}
