import { api, USE_BACKEND } from './api'
import { readStore, writeStore } from './localStore'

const TOKEN_KEY = 'educopilot_token'
const USER_KEY = 'educopilot_user'
const USERS_STORE = 'users'

function localUsers() {
  return readStore(USERS_STORE, [])
}

function localLogin({ email, password }) {
  const user = localUsers().find(
    (item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password,
  )
  if (!user) {
    const error = new Error('Invalid email or password. Create an account first.')
    error.code = 'INVALID_CREDENTIALS'
    throw error
  }
  const { password: _password, ...safeUser } = user
  return { user: safeUser, token: `local-token-${user.id}` }
}

export async function login({ email, password, remember }) {
  const result = USE_BACKEND
    ? (await api.post('/auth/login', { email, password })).data
    : localLogin({ email, password })

  const storage = remember ? localStorage : sessionStorage
  storage.setItem(TOKEN_KEY, result.token)
  storage.setItem(USER_KEY, JSON.stringify(result.user))
  return result.user
}

export async function register({ name, email, password, role, studentId }) {
  if (USE_BACKEND) {
    const { data } = await api.post('/auth/register', { name, email, password, role })
    return data
  }

  const users = localUsers()
  if (users.some((user) => user.email.toLowerCase() === email.trim().toLowerCase())) {
    const error = new Error('An account with this email already exists.')
    error.code = 'EMAIL_TAKEN'
    throw error
  }

  const user = {
    id: `${role}-${crypto.randomUUID?.() ?? Date.now()}`,
    role,
    name: name.trim(),
    email: email.trim(),
    password,
    avatarColor: role === 'professor' ? 'brand' : 'teal',
    rollNumber: role === 'student' ? String(studentId ?? '').trim() : undefined,
    branch: role === 'student' ? '' : undefined,
    department: role === 'professor' ? '' : undefined,
    joinedOn: new Date().toISOString(),
  }
  writeStore(USERS_STORE, [...users, user])
  const { password: _password, ...safeUser } = user
  const token = `local-token-${user.id}`
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(safeUser))
  return safeUser
}

export async function requestPasswordReset(email) {
  if (USE_BACKEND) {
    const { data } = await api.post('/auth/forgot-password', { email })
    return data
  }
  // No fake success message. A real reset requires the backend.
  throw new Error('Password reset is unavailable until the backend is connected.')
}

export function getStoredSession() {
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY)
  const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
  if (!raw || !token) return null
  try {
    return { user: JSON.parse(raw), token }
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}
