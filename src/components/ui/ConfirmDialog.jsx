import { Modal } from './Modal'
import { btnDanger, btnOutline, btnPrimary, btnSuccess, btnWarning } from './FormField'

const VARIANTS = {
  danger: {
    icon: (
      <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    box: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800',
    confirmClass: btnDanger,
  },
  warning: {
    icon: (
      <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    box: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    confirmClass: btnWarning,
  },
  success: {
    icon: (
      <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    box: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    confirmClass: btnSuccess,
  },
  info: {
    icon: (
      <svg className="h-6 w-6 text-primary dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    box: 'bg-primary-light/60 dark:bg-emerald-950/30 border-primary/30 dark:border-emerald-800',
    confirmClass: btnPrimary,
  },
}

/**
 * نافذة تأكيد قبل تنفيذ إجراءات تغيّر الحالة (حذف، تفعيل، اختيار فائز، إلخ)
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  variant = 'warning',
  loading = false,
}) {
  const style = VARIANTS[variant] || VARIANTS.warning

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button type="button" onClick={onClose} className={btnOutline} disabled={loading}>
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className={style.confirmClass} disabled={loading}>
            {loading ? 'جاري التنفيذ...' : confirmLabel}
          </button>
        </>
      }
    >
      <ConfirmBody icon={style.icon} message={message} boxClass={style.box} />
    </Modal>
  )
}

function ConfirmBody({ icon, message, boxClass }) {
  return (
    <div className={`flex gap-4 rounded-xl border p-4 ${boxClass}`}>
      <ConfirmBodyIcon icon={icon} />
      <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">{message}</p>
    </div>
  )
}

function ConfirmBodyIcon({ icon }) {
  return (
    <div className="shrink-0 rounded-full bg-white/80 p-2 shadow-sm dark:bg-stone-800/80">{icon}</div>
  )
}
