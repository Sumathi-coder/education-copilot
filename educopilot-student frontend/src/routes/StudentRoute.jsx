import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function StudentRoute() {
  const { role, isLoading } = useAuth()

  if (isLoading) return null
  if (role !== 'student') {
    return <Navigate to="/professor/dashboard" replace />
  }
  return <Outlet />
}
