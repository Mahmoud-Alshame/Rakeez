import { RakeezLogo } from '../layout/RakeezLogo'

export function BootLoader({ fullScreen = true }) {
  const wrap = fullScreen ? 'min-h-screen' : 'min-h-[40vh]'
  return (
    <div
      className={`flex ${wrap} flex-col items-center justify-center gap-3 bg-surface font-sans dark:bg-stone-950`}
    >
      <RakeezLogo size={48} className="animate-pulse" />
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent dark:border-emerald-500 dark:border-t-transparent" />
    </div>
  )
}
