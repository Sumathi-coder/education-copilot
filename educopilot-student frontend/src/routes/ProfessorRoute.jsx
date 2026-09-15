import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProfessorRoute() {
  const { role, isLoading } = useAuth()

  if (isLoading) return null
  if (role !== 'professor') {
    return <Navigate to="/student/dashboard" replace />
  }
  return <Outlet />
}
