import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/authContext'
import { ACCOUNT_STATUS } from '../../constants/auth'
import { ROLE_LABELS_AR, USER_ROLES } from '../../constants/roles'
import { btnOutline, btnPrimary } from '../ui/FormField'
import { PlatformBrand } from './PlatformBrand'
import { ThemeToggle } from '../ui/ThemeToggle'

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const showDashboard =
    isAuthenticated &&
    (user?.role === USER_ROLES.ADMIN || user?.status === ACCOUNT_STATUS.ACTIVE)

  async function handleLogout() {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur-md transition-colors dark:border-stone-800/80 dark:bg-stone-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <PlatformBrand />

        <nav className="hidden items-center gap-6 text-sm font-medium text-stone-600 dark:text-stone-400 md:flex">
          <a href="#stats" className="hover:text-primary-dark dark:hover:text-emerald-400">
            الإحصائيات
          </a>
          <a href="#how" className="hover:text-primary-dark dark:hover:text-emerald-400">
            كيف يعمل
          </a>
          <a href="#audience" className="hover:text-primary-dark dark:hover:text-emerald-400">
            الفئات المستهدفة
          </a>
          <a href="#faq" className="hover:text-primary-dark dark:hover:text-emerald-400">
            الأسئلة الشائعة
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {showDashboard ? (
            <>
              <span className="hidden text-xs text-stone-500 dark:text-stone-400 sm:inline">
                {ROLE_LABELS_AR[user.role]}
              </span>
              <NavLink to="/dashboard" className={btnPrimary}>
                لوحة التحكم
              </NavLink>
              <button type="button" onClick={handleLogout} className={btnOutline}>
                خروج
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={btnOutline}>
                تسجيل الدخول
              </Link>
              <Link to="/register" className={btnPrimary}>
                ابدأ الآن
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
