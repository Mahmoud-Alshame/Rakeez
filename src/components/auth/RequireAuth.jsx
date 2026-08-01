import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/authContext'
import { BootLoader } from '../ui/BootLoader'

/** يتطلب جلسة مسجّلة — يُكمّل بـ RequireRole للصلاحيات */
export function RequireAuth() {
  const { user, initializing } = useAuth()

  if (initializing) return <BootLoader />
  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}
