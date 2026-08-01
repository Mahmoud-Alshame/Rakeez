export function FormField({ label, id, children, hint, error }) {
  return (
    <div>
      {label ? (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
          {label}
        </label>
      ) : null}
      {children}
      {error ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p> : null}
      {hint && !error ? <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{hint}</p> : null}
    </div>
  )
}

export const inputClass =
  'w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500'

export const btnPrimary =
  'inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-primary/20 transition hover:bg-primary-dark disabled:opacity-60 dark:hover:bg-emerald-700'

export const btnOutline =
  'inline-flex items-center justify-center rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-60 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700'

export const btnDanger =
  'inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-red-600/25 transition hover:bg-red-700 disabled:opacity-60 dark:bg-red-600 dark:hover:bg-red-500'

export const btnSuccess =
  'inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-600/25 transition hover:bg-emerald-700 disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500'

export const btnWarning =
  'inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-amber-500/25 transition hover:bg-amber-600 disabled:opacity-60 dark:bg-amber-500 dark:hover:bg-amber-400'

export const btnInfo =
  'inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-sky-600/25 transition hover:bg-sky-700 disabled:opacity-60 dark:bg-sky-600 dark:hover:bg-sky-500'

/** أزرار صغيرة للجداول */
export const btnDangerSm = btnDanger + ' text-xs py-1.5 px-3'
export const btnOutlineSm = btnOutline + ' text-xs py-1.5 px-3'
