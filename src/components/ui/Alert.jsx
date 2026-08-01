const ICONS = {
  info: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

const STYLES = {
  info: {
    wrap: 'border-sky-200/80 bg-gradient-to-l from-sky-50 to-white text-sky-950 dark:border-sky-800/60 dark:from-sky-950/50 dark:to-stone-900 dark:text-sky-100',
    icon: 'bg-sky-100 text-sky-600 dark:bg-sky-900/60 dark:text-sky-300',
    accent: 'bg-sky-500',
  },
  warning: {
    wrap: 'border-amber-200/80 bg-gradient-to-l from-amber-50 to-white text-amber-950 dark:border-amber-800/60 dark:from-amber-950/50 dark:to-stone-900 dark:text-amber-100',
    icon: 'bg-amber-100 text-amber-600 dark:bg-amber-900/60 dark:text-amber-300',
    accent: 'bg-amber-500',
  },
  error: {
    wrap: 'border-red-200/80 bg-gradient-to-l from-red-50 to-white text-red-950 dark:border-red-800/60 dark:from-red-950/50 dark:to-stone-900 dark:text-red-100',
    icon: 'bg-red-100 text-red-600 dark:bg-red-900/60 dark:text-red-300',
    accent: 'bg-red-500',
  },
  success: {
    wrap: 'border-emerald-200/80 bg-gradient-to-l from-emerald-50 to-white text-emerald-950 dark:border-emerald-800/60 dark:from-emerald-950/50 dark:to-stone-900 dark:text-emerald-100',
    icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300',
    accent: 'bg-emerald-500',
  },
}

/** تنبيه متدرّج مع أيقونة دائرية — متوافق مع الوضع الداكن */
export function Alert({ variant = 'info', children, title, onDismiss }) {
  const style = STYLES[variant] || STYLES.info

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border px-4 py-3.5 text-sm leading-relaxed shadow-sm ${style.wrap}`}
      role="alert"
    >
      <span className={`absolute inset-y-0 end-0 w-1 ${style.accent}`} aria-hidden />
      <div className="flex gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.icon}`}>
          {ICONS[variant]}
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          {title ? <p className="mb-1 font-bold">{title}</p> : null}
          <div className="opacity-95">{children}</div>
        </div>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-lg p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
            aria-label="إغلاق"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  )
}
