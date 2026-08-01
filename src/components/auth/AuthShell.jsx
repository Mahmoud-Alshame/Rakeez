import { BRAND_NAME } from '../../constants/brand'
import { RakeezLogo } from '../layout/RakeezLogo'

export function AuthShell({ title, subtitle, children, wide }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-light via-surface to-stone-100 p-4 font-sans dark:from-emerald-950/40 dark:via-stone-950 dark:to-stone-900">
      <div
        className={`w-full rounded-2xl border border-stone-200 bg-white p-8 shadow-xl dark:border-stone-700 dark:bg-stone-900 ${wide ? 'max-w-lg' : 'max-w-md'}`}
      >
        <div className="mb-6 flex flex-col items-center gap-2">
          <RakeezLogo size={48} />
          <p className="text-sm font-bold text-primary-dark dark:text-emerald-400">{BRAND_NAME}</p>
        </div>
        <h1 className="text-center text-xl font-bold text-stone-900 dark:text-stone-100">{title}</h1>
        {subtitle ? (
          <p className="mt-2 text-center text-sm text-stone-500 dark:text-stone-400">{subtitle}</p>
        ) : null}
        {children}
      </div>
    </div>
  )
}
