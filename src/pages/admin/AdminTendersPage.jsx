import { useState } from 'react'
import { RequirePermission } from '../../components/auth/RequirePermission'
import { Alert } from '../../components/ui/Alert'
import { Modal } from '../../components/ui/Modal'
import { btnOutline, btnPrimary, btnDangerSm, inputClass } from '../../components/ui/FormField'
import { useData } from '../../contexts/dataContext'
const STATUS_LABELS = {
  active: 'نشطة',
  removed: 'محذوفة',
  awarded: 'مُنحت',
  completed: 'مكتملة',
}

export default function AdminTendersPage() {
  const { tenders, users, categories, removeTenderByAdmin, updateTender } = useData()
  const [modal, setModal] = useState(null)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [restoringId, setRestoringId] = useState(null)
  const [error, setError] = useState('')

  function getCatName(id) {
    return categories.find((c) => c.id === id)?.name || '—'
  }

  function getOwnerName(id) {
    return users.find((u) => u.uid === id)?.companyName || id
  }

  async function confirmRemove() {
    if (!modal || !reason.trim()) return
    setError('')
    setSubmitting(true)
    try {
      await removeTenderByAdmin(modal.id, reason.trim())
      setModal(null)
      setReason('')
    } catch (err) {
      setError('تعذّرت إزالة المناقصة، حاول مرة أخرى.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRestore(id) {
    setError('')
    setRestoringId(id)
    try {
      await updateTender(id, { status: 'active', removalReason: null })
    } catch (err) {
      setError('تعذّرت استعادة المناقصة، حاول مرة أخرى.')
    } finally {
      setRestoringId(null)
    }
  }

  return (
    <RequirePermission permission="ADMIN_TENDERS">
      <PageWrap>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">إدارة الإعلانات والمناقصات</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">عرض كل المناقصات المنشورة وإزالتها مع توثيق السبب.</p>

        {error ? <Alert variant="error">{error}</Alert> : null}

        <div className="mt-6 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm  dark:border-stone-700 dark:bg-stone-900">
          <table className="w-full min-w-[800px] text-right text-sm">
            <thead className="border-b border-stone-100 bg-stone-50 dark:border-stone-800 dark:bg-stone-800/50">
              <tr>
                <th className="px-4 py-3 font-semibold">العنوان</th>
                <th className="px-4 py-3 font-semibold">الناشئة</th>
                <th className="px-4 py-3 font-semibold">التصنيف</th>
                <th className="px-4 py-3 font-semibold">الحالة</th>
                <th className="px-4 py-3 font-semibold">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {tenders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-stone-500">
                    لا توجد مناقصات بعد.
                  </td>
                </tr>
              ) : (
                tenders.map((t) => (
                  <tr key={t.id} className="border-b border-stone-50 last:border-0 dark:border-stone-800">
                    <td className="px-4 py-3 font-medium">{t.title}</td>
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{getOwnerName(t.ownerId)}</td>
                    <td className="px-4 py-3 text-stone-600">{getCatName(t.categoryId)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs dark:bg-slate-600">
                        {STATUS_LABELS[t.status] || t.status}
                      </span>
                      {t.removalReason ? (
                        <p className="mt-1 text-xs text-red-600">سبب الإزالة: {t.removalReason}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {t.status === 'active' ? (
                        <button
                          type="button"
                          onClick={() => setModal(t)}
                          className={btnDangerSm}
                        >
                          إزالة
                        </button>
                      ) : t.status === 'removed' ? (
                        <button
                          type="button"
                          onClick={() => handleRestore(t.id)}
                          disabled={restoringId === t.id}
                          className={btnOutline + ' text-xs'}
                        >
                          {restoringId === t.id ? 'جاري الاستعادة…' : 'استعادة'}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Modal
          open={Boolean(modal)}
          onClose={() => setModal(null)}
          title="إزالة المناقصة"
          footer={
            <>
              <button type="button" onClick={() => setModal(null)} className={btnOutline}>
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmRemove}
                className={btnPrimary}
                disabled={!reason.trim() || submitting}
              >
                {submitting ? 'جاري الإزالة…' : 'تأكيد الإزالة'}
              </button>
            </>
          }
        >
          <p className="mb-3">المناقصة: <strong>{modal?.title}</strong></p>
          <label className="mb-1 block text-sm font-medium">سبب الإزالة</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={inputClass}
            rows={3}
            required
            disabled={submitting}
          />
        </Modal>
      </PageWrap>
    </RequirePermission>
  )
}

function PageWrap({ children }) {
  return <div className="space-y-6">{children}</div>
}