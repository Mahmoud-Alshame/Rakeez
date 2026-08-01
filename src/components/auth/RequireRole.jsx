import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { USER_ROLES, roleMayAccessPath } from '../../constants/roles'
import { useAuth } from '../../contexts/authContext'
import { BootLoader } from '../ui/BootLoader'

/**
 * RBAC — يمنع الوصول لمسارات لا تخص دور المستخدم.
 * يُستخدم داخل RequireAuth.
 */
export function RequireRole() {
  const { user, initializing, isPending, isActive } = useAuth()
  const location = useLocation()

  if (initializing) return <BootLoader />

  if (!user) return <Navigate to="/login" replace />

  if (user.role !== USER_ROLES.ADMIN && isPending) {
    return <Navigate to="/verification-pending" replace />
  }

  if (user.role !== USER_ROLES.ADMIN && !isActive) {
    return <Navigate to="/login" replace state={{ blocked: true }} />
  }

  if (!roleMayAccessPath(user.role, location.pathname)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
