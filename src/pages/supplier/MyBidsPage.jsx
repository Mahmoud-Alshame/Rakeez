import { useState } from 'react'
import { RequirePermission } from '../../components/auth/RequirePermission'
import { Alert } from '../../components/ui/Alert'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Modal } from '../../components/ui/Modal'
import { TenderDetailContent } from '../../components/tenders/TenderDetailContent'
import { FormField, btnOutline, btnPrimary, btnDangerSm, inputClass } from '../../components/ui/FormField'
import { formatMoney, getCurrencySymbol, toCleanNumberString } from '../../utils/currency'
import { useAuth } from '../../contexts/authContext'
import { useData } from '../../contexts/dataContext'

const STATUS = { pending: 'قيد الانتظار', won: 'فائز', rejected: 'مرفوض' }

const emptyBidForm = { price: '', plan: '', deliveryDate: '', message: '' }

export default function MyBidsPage() {
  const { user } = useAuth()
  const { getBidsBySupplier, tenders, categories, getUserById, updateBid, deleteBid } = useData()
  const bids = getBidsBySupplier(user?.uid)

  const [selectedTender, setSelectedTender] = useState(null)
  const [editingBid, setEditingBid] = useState(null)
  const [bidForm, setBidForm] = useState(emptyBidForm)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  function getTender(id) {
    return tenders.find((t) => t.id === id)
  }

  // عملة العرض: نأخذها من العرض نفسه إن وُجدت (عروض جديدة)، وإلا من المناقصة المرتبطة
  // (توافقاً مع عروض قديمة أُنشئت قبل إضافة نظام العملات)
  function getBidCurrency(bid) {
    return bid.currency || getTender(bid.tenderId)?.currency
  }

  function openTender(tenderId) {
    const tender = getTender(tenderId)
    if (tender) setSelectedTender(tender)
  }

  function openEdit(bid) {
    if (bid.status !== 'pending') return
    setEditingBid(bid)
    setBidForm({
      price: String(bid.price),
      plan: bid.plan || '',
      deliveryDate: bid.deliveryDate || '',
      message: bid.message || '',
    })
    setError('')
  }

  async function submitEdit(e) {
    e.preventDefault()
    if (!editingBid) return
    setError('')
    setSubmitting(true)
    try {
      await updateBid(editingBid.id, {
        price: Number(bidForm.price),
        plan: bidForm.plan.trim(),
        deliveryDate: bidForm.deliveryDate,
        message: bidForm.message.trim(),
      })
      setEditingBid(null)
    } catch (err) {
      setError('تعذّر حفظ التعديلات، حاول مرة أخرى.')
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteBid(deleteTarget.id)
      if (selectedTender?.id === deleteTarget.tenderId) setSelectedTender(null)
      setDeleteTarget(null)
    } catch (err) {
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <RequirePermission permission="MY_BIDS">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">عروضي</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            تتبع العروض المقدّمة. يمكن تعديل أو حذف العروض «قيد الانتظار» فقط.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900">
          <table className="w-full min-w-[720px] text-right text-sm">
            <thead className="border-b border-stone-100 bg-stone-50 dark:border-stone-800 dark:bg-stone-800/50">
              <tr>
                <th className="px-4 py-3 font-semibold">المناقصة</th>
                <th className="px-4 py-3 font-semibold">السعر</th>
                <th className="px-4 py-3 font-semibold">التسليم</th>
                <th className="px-4 py-3 font-semibold">الحالة</th>
                <th className="px-4 py-3 font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {bids.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-stone-500 dark:text-stone-400">
                    لم تقدّم أي عروض بعد.
                  </td>
                </tr>
              ) : (
                bids.map((b) => (
                  <tr key={b.id} className="border-b border-stone-50 dark:border-stone-800">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openTender(b.tenderId)}
                        className="font-medium text-primary-dark underline-offset-2 hover:underline dark:text-emerald-400"
                      >
                        {getTender(b.tenderId)?.title || b.tenderId}
                      </button>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{formatMoney(b.price, getBidCurrency(b))}</td>
                    <td className="px-4 py-3">{b.deliveryDate}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          b.status === 'won'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : b.status === 'rejected'
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                        }`}
                      >
                        {STATUS[b.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {b.status === 'pending' ? (
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => openEdit(b)} className={btnOutline + ' text-xs py-1'}>
                            تعديل
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(b)}
                            className={btnDangerSm}
                          >
                            حذف
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-stone-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Modal
          open={Boolean(selectedTender)}
          onClose={() => setSelectedTender(null)}
          title="تفاصيل المناقصة"
          size="lg"
          footer={
            <button type="button" onClick={() => setSelectedTender(null)} className={btnOutline}>
              إغلاق
            </button>
          }
        >
          {selectedTender ? (
            <div className="space-y-4">
              <TenderDetailContent
                tender={selectedTender}
                categories={categories}
                owner={getUserById(selectedTender.ownerId)}
              />
              {(() => {
                const myBid = bids.find((b) => b.tenderId === selectedTender.id)
                if (!myBid) return null
                return (
                  <section className="rounded-xl border border-primary/20 bg-primary-light/30 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">عرضك على هذه المناقصة</h3>
                    <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs text-stone-500 dark:text-stone-400">السعر المعروض</dt>
                        <dd className="font-semibold tabular-nums text-stone-900 dark:text-stone-100">
                          {formatMoney(myBid.price, getBidCurrency(myBid))}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-stone-500 dark:text-stone-400">موعد التسليم</dt>
                        <dd className="font-semibold text-stone-900 dark:text-stone-100">{myBid.deliveryDate}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-stone-500 dark:text-stone-400">الحالة</dt>
                        <dd className="font-semibold text-stone-900 dark:text-stone-100">{STATUS[myBid.status]}</dd>
                      </div>
                    </dl>
                    {myBid.plan ? (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">خطة التنفيذ</p>
                        <p className="mt-1 text-sm leading-relaxed text-stone-700 dark:text-stone-300">{myBid.plan}</p>
                      </div>
                    ) : null}
                    {myBid.message ? (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">الرسالة التعريفية</p>
                        <p className="mt-1 text-sm leading-relaxed text-stone-700 dark:text-stone-300">{myBid.message}</p>
                      </div>
                    ) : null}
                  </section>
                )
              })()}
            </div>
          ) : null}
        </Modal>

        <Modal
          open={Boolean(editingBid)}
          onClose={() => setEditingBid(null)}
          title="تعديل العرض"
          footer={
            <>
              <button type="button" onClick={() => setEditingBid(null)} className={btnOutline}>
                إلغاء
              </button>
              <button type="submit" form="edit-bid-form" className={btnPrimary} disabled={submitting}>
                {submitting ? 'جاري الحفظ…' : 'حفظ التعديلات'}
              </button>
            </>
          }
        >
          {error ? <Alert variant="error">{error}</Alert> : null}
          <form id="edit-bid-form" onSubmit={submitEdit} className="space-y-3">
            <FormField
              label={`السعر المعروض (${getCurrencySymbol(editingBid ? getBidCurrency(editingBid) : undefined)})`}
              id="edit-price"
            >
              <input
                id="edit-price"
                type="text"
                inputMode="numeric"
                required
                value={bidForm.price}
                onChange={(e) => setBidForm({ ...bidForm, price: toCleanNumberString(e.target.value) })}
                className={inputClass + ' tabular-nums'}
                disabled={submitting}
              />
              {bidForm.price ? (
                <p className="mt-1 text-xs text-stone-400">
                  {formatMoney(bidForm.price, editingBid ? getBidCurrency(editingBid) : undefined)}
                </p>
              ) : null}
            </FormField>
            <FormField label="خطة تنفيذ المشروع" id="edit-plan">
              <textarea
                id="edit-plan"
                required
                rows={3}
                value={bidForm.plan}
                onChange={(e) => setBidForm({ ...bidForm, plan: e.target.value })}
                className={inputClass}
                disabled={submitting}
              />
            </FormField>
            <FormField label="موعد التسليم" id="edit-delivery">
              <input
                id="edit-delivery"
                type="date"
                required
                value={bidForm.deliveryDate}
                onChange={(e) => setBidForm({ ...bidForm, deliveryDate: e.target.value })}
                className={inputClass}
                disabled={submitting}
              />
            </FormField>
            <FormField label="رسالة تعريفية" id="edit-message">
              <textarea
                id="edit-message"
                required
                rows={2}
                value={bidForm.message}
                onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
                className={inputClass}
                disabled={submitting}
              />
            </FormField>
          </form>
        </Modal>

        <ConfirmDialog
          open={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          title="حذف العرض"
          message="هل أنت متأكد من حذف هذا العرض؟ لا يمكن التراجع عن هذا الإجراء."
          confirmLabel="حذف العرض"
          variant="danger"
          loading={deleting}
        />
      </div>
    </RequirePermission>
  )
}