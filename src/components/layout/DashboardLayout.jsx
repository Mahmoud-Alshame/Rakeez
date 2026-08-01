import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/authContext'
import { getNavItemsForRole } from '../../config/navigation'
import { ROLE_LABELS_AR } from '../../constants/roles'
import { BRAND_FULL } from '../../constants/brand'
import { PlatformBrand } from './PlatformBrand'
import { ThemeToggle } from '../ui/ThemeToggle'

/** أيقونات SVG — landing = منزل، dashboard = مخطط لوحة التحكم */
function NavIcon({ name, active }) {
  const common = `h-5 w-5 shrink-0 ${active ? 'text-primary-dark dark:text-emerald-400' : 'text-stone-500 dark:text-stone-400'}`
  switch (name) {
    case 'landing':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    case 'dashboard':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zm0 6a1 1 0 011-1h4a1 1 0 011 1v8a1 1 0 01-1 1h-4a1 1 0 01-1-1v-8zM4 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
        </svg>
      )
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
    case 'user':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    case 'tag':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    case 'chat':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    case 'shield':
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
    <div className="flex min-h-screen bg-surface font-sans text-stone-800 transition-colors duration-300 dark:bg-stone-950 dark:text-stone-100">
      <aside className="hidden w-64 shrink-0 flex-col border-l border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900 md:flex" aria-label="القائمة الرئيسية">
        <div className="border-b border-stone-100 px-4 py-5 dark:border-stone-800">
          <PlatformBrand />
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
                    ? 'bg-primary-light text-primary-dark dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100',
                ].join(' ')
              }
              end={item.path === '/dashboard'}
            >
              {({ isActive }) => (
                <>
                  <NavIcon name={item.icon} active={isActive} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-stone-100 p-3 text-xs text-stone-400 dark:border-stone-800 dark:text-stone-500">
          {BRAND_FULL}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-stone-800 dark:bg-stone-900/95 dark:supports-[backdrop-filter]:bg-stone-900/80 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary-dark dark:bg-emerald-950 dark:text-emerald-300">
              {(user?.displayName || '?').charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">{user?.displayName}</p>
              <p className="truncate text-xs text-stone-500 dark:text-stone-400">{user?.email}</p>
            </div>
            <span className="hidden shrink-0 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300 sm:inline-block">
              {role ? ROLE_LABELS_AR[role] : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
              onClick={() => logout()}
            >
              تسجيل الخروج
            </button>
          </div>
        </header>

        <div className="flex gap-1 overflow-x-auto border-b border-stone-100 bg-white px-2 py-2 dark:border-stone-800 dark:bg-stone-900 md:hidden">
          {items.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                }`
              }
              end={item.path === '/dashboard'}
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
