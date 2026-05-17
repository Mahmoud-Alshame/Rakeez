import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/authContext'

/** شاشة تحميل بسيطة أثناء استعادة الجلسة */
function BootLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface font-sans">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

/**
 * يمنع الوصول لمنطقة لوحة التحكم دون تسجيل دخول.
 * يعرض Outlet للمسارات الفرعية بعد التحقق.
 */
export function RequireAuth() {
  const { user, initializing } = useAuth()

  if (initializing) return <BootLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: 'protected' }} />

  return <Outlet />
}
