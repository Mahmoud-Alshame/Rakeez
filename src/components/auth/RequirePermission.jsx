import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/authContext'

/**
 * يمنع الوصول لصفحة لا يملك المستخدم صلاحيتها حسب الدور.
 * @param {{ permission: keyof import('../../constants/roles').PERMISSIONS; children: import('react').ReactNode }} props
 */
export function RequirePermission({ permission, children }) {
  const { canAccess, user, initializing } = useAuth()

  if (initializing) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (!canAccess(permission)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
