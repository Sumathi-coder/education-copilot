import axios from 'axios'

// Data mode is deliberately explicit.
// local = temporary browser-only persistence for frontend development.
// backend = the future Spring Boot/FastAPI integration.
export const DATA_MODE = import.meta.env.VITE_DATA_MODE || 'local'
export const USE_BACKEND = DATA_MODE === 'backend'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
})

export const aiApi = axios.create({
  baseURL: import.meta.env.VITE_AI_API_URL || 'http://localhost:8000/api',
  timeout: 20000,
})

function addAuth(config) {
  const token = localStorage.getItem('educopilot_token') || sessionStorage.getItem('educopilot_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}

api.interceptors.request.use(addAuth)
aiApi.interceptors.request.use(addAuth)
