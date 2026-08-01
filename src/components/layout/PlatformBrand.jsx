import { Link } from 'react-router-dom'
import { BRAND_NAME, BRAND_TAGLINE } from '../../constants/brand'
import { RakeezLogo } from './RakeezLogo'

/** شعار ركيز — يُستخدم في الشريط العلوي والجانبي */
export function PlatformBrand({ className = '', compact = false }) {
  return (
    <Link
      to="/"
      className={`group flex items-center gap-2.5 rounded-lg transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
      title="العودة للصفحة الرئيسية"
      aria-label={`العودة للصفحة الرئيسية — ${BRAND_NAME}`}
    >
      <RakeezLogo size={50} className="transition group-hover:scale-105" />
      {!compact ? (
        <span className="flex flex-col leading-tight">
          <span className="text-base font-black text-stone-900 dark:text-white">{BRAND_NAME}</span>
          <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400">{BRAND_TAGLINE}</span>
        </span>
      ) : null}
    </Link>
  )
}
