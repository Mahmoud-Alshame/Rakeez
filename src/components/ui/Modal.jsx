/** نافذة منبثقة — متوافقة مع الوضع الداكن */
export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  if (!open) return null

  const sizeClass = size === 'lg' ? 'max-w-2xl' : 'max-w-lg'

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm dark:bg-black/60"
        aria-label="إغلاق"
        onClick={onClose}
      />
      <div className="relative flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full ${sizeClass} rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-stone-700 dark:bg-stone-900`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader title={title} onClose={onClose} />
          <div className="max-h-[70vh] overflow-y-auto px-6 py-4 text-sm text-stone-600 dark:text-stone-300">
            {children}
          </div>
          {footer ? (
            <div className="flex justify-end gap-2 border-t border-stone-100 px-6 py-4 dark:border-stone-800">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function ModalHeader({ title, onClose }) {
  return (
    <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4 dark:border-stone-800">
      <h2 id="modal-title" className="text-lg font-bold text-stone-900 dark:text-stone-100">
        {title}
      </h2>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
        aria-label="إغلاق"
      >
        ✕
      </button>
    </div>
  )
}
