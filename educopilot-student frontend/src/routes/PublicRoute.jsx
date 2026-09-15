import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function PublicRoute() {
  const { isAuthenticated, role, isLoading } = useAuth()

  if (isLoading) return null
  if (isAuthenticated) {
    return <Navigate to={role === 'professor' ? '/professor/dashboard' : '/student/dashboard'} replace />
  }
  return <Outlet />
}
