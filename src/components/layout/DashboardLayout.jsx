import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/authContext'
import { getNavItemsForRole } from '../../config/navigation'
import { ROLE_LABELS_AR } from '../../constants/roles'

/** أيقونات SVG بسيطة — يمكن استبدالها بمكتبة لاحقاً */
function NavIcon({ name }) {
  const common = 'h-5 w-5 shrink-0 text-stone-500'
  switch (name) {
    case 'users':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    case 'file':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    case 'search':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    case 'send':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      )
    case 'columns':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      )
    case 'alert':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    case 'trophy':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 9H4.5a2.5 2.5 0 010-5H6m0 5v8a2 2 0 002 2h8a2 2 0 002-2V9M6 9h12m0 0h1.5a2.5 2.5 0 000-5H18m0 5V7a2 2 0 00-2-2h-1.32a2 2 0 01-1.789-1.106l-.5-1A2 2 0 0010.607 2h2.786a2 2 0 011.789 1.106l.5 1A2 2 0 0016.18 5H18a2 2 0 012 2v2" />
        </svg>
      )
    default:
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
  }
}

/**
 * التخطيط الرئيسي: شريط جانبي ديناميكي حسب الدور + شريط علوي + المحتوى.
 */
export function DashboardLayout() {
  const { user, logout, role } = useAuth()
  const items = getNavItemsForRole(role)

  return (
    <div className="flex min-h-screen bg-surface font-sans text-stone-800">
      <aside className="hidden w-60 shrink-0 flex-col border-l border-stone-200 bg-white md:flex" aria-label="القائمة الرئيسية">
        <div className="border-b border-stone-100 px-4 py-5">
          <p className="text-xs font-medium text-stone-400">نظام المناقصات</p>
          <p className="mt-1 text-base font-bold text-stone-900">لوحة التحكم</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {items.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-light text-primary-dark'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900',
                ].join(' ')
              }
              end={item.path === '/dashboard'}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-stone-100 p-3 text-xs text-stone-400">
          جاهز لربط Firebase Auth / Firestore
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary-dark">
              {(user?.displayName || '?').charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-stone-900">{user?.displayName}</p>
              <p className="truncate text-xs text-stone-500">{user?.email}</p>
            </div>
            <span className="hidden shrink-0 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700 sm:inline-block">
              {role ? ROLE_LABELS_AR[role] : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50"
              onClick={() => logout()}
            >
              تسجيل الخروج
            </button>
          </div>
        </header>

        <div className="flex gap-1 overflow-x-auto border-b border-stone-100 bg-white px-2 py-2 md:hidden">
          {items.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${isActive ? 'bg-primary text-white' : 'bg-stone-100 text-stone-700'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
