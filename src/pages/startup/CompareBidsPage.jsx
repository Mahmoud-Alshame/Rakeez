import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { RequirePermission } from '../../components/auth/RequirePermission'
import { Alert } from '../../components/ui/Alert'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Modal } from '../../components/ui/Modal'
import { formatSYP } from '../../utils/currency'
import { btnPrimary, btnOutline } from '../../components/ui/FormField'
import { useAuth } from '../../contexts/authContext'
import { useData } from '../../contexts/dataContext'

const BID_STATUS = { pending: 'قيد الانتظار', won: 'فائز', rejected: 'مرفوض' }
const TENDER_STATUS = {
  active: 'نشطة',
  awarded: 'مُنحت للفائز',
  completed: 'مكتملة / مغلقة',
}

export default function CompareBidsPage() {
  const { tenderId } = useParams()
  const { user } = useAuth()
  const { tenders, getBidsForTender, getUserById, selectWinner, completeTender, categories } = useData()

  const myTenders = tenders.filter((t) => t.ownerId === user?.uid)
  const activeId = tenderId || myTenders[0]?.id
  const tender = myTenders.find((t) => t.id === activeId)
  const bids = tender ? getBidsForTender(tender.id) : []

  const [selectedBid, setSelectedBid] = useState(null)
  const [confirmWinner, setConfirmWinner] = useState(null)
  const [confirmComplete, setConfirmComplete] = useState(false)
  const [processingWinner, setProcessingWinner] = useState(false)
  const [processingComplete, setProcessingComplete] = useState(false)
  const [error, setError] = useState('')

  function catName(id) {
    return categories.find((c) => c.id === id)?.name || '—'
  }

  async function handleConfirmWinner() {
    if (!confirmWinner || !tender) return
    setError('')
    setProcessingWinner(true)
    try {
      await selectWinner(tender.id, confirmWinner.id)
      setConfirmWinner(null)
    } catch (err) {
      setError('تعذّر اختيار الفائز، حاول مرة أخرى.')
    } finally {
      setProcessingWinner(false)
    }
  }

  async function handleCompleteTender() {
    if (!tender) return
    setError('')
    setProcessingComplete(true)
    try {
      await completeTender(tender.id)
      setConfirmComplete(false)
    } catch (err) {
      setError('تعذّر إغلاق المناقصة، حاول مرة أخرى.')
    } finally {
      setProcessingComplete(false)
    }
  }


  return (
    <RequirePermission permission="COMPARISON">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">مقارنة العروض</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">اختر مناقصة لعرض العروض المقدّمة ومقارنتها.</p>
        </div>

        {error ? <Alert variant="error">{error}</Alert> : null}

        {myTenders.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {myTenders.map((t) => (
              <Link
                key={t.id}
                to={`/compare/${t.id}`}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  t.id === activeId
                    ? 'bg-primary text-white'
                    : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                }`}
              >
                {t.title}
              </Link>
            ))}
          </div>
        ) : null}

        {!tender ? (
          <Alert variant="info">لا توجد مناقصات للمقارنة. أنشئ مناقصة من صفحة المناقصات.</Alert>
        ) : (
          <>
            <div className="rounded-xl border border-stone-200 bg-white p-4 text-sm dark:border-stone-700 dark:bg-stone-900">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-stone-900 dark:text-stone-100">{tender.title}</p>
                  <p className="mt-1 text-stone-500 dark:text-stone-400">
                    {catName(tender.categoryId)} — ينتهي {tender.deadline}
                  </p>
                </div>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium dark:bg-stone-800">
                  {TENDER_STATUS[tender.status] || tender.status}
                </span>
              </div>
              {tender.status === 'awarded' ? (
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-stone-100 pt-4 dark:border-stone-800">
                  <Alert variant="success" title="تم اختيار الفائز">
                    يمكنك الآن إغلاق المناقصة نهائياً لمنع أي عروض أو تعديلات إضافية.
                  </Alert>
                  <button type="button" onClick={() => setConfirmComplete(true)} className={btnPrimary}>
                    تحويل إلى مكتملة
                  </button>
                </div>
              ) : null}
              {tender.status === 'completed' ? (
                <Alert variant="info" title="مناقصة مغلقة">
                  هذه المناقصة مكتملة ولا يمكن استقبال عروض جديدة أو تعديلها.
                </Alert>
              ) : null}
            </div>

            <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900">
              <table className="w-full min-w-[900px] text-right text-sm">
                <thead className="border-b border-stone-100 bg-stone-50 dark:border-stone-800 dark:bg-stone-800/50">
                  <tr>
                    <th className="px-4 py-3 font-semibold">المورد</th>
                    <th className="px-4 py-3 font-semibold">السعر</th>
                    <th className="px-4 py-3 font-semibold">خطة المشروع</th>
                    <th className="px-4 py-3 font-semibold">موعد التسليم</th>
                    <th className="px-4 py-3 font-semibold">الرسالة</th>
                    <th className="px-4 py-3 font-semibold">الحالة</th>
                    <th className="px-4 py-3 font-semibold">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {bids.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-stone-500 dark:text-stone-400">
                        لا توجد عروض بعد.
                      </td>
                    </tr>
                  ) : (
                    bids.map((b) => {
                      const supplier = getUserById(b.supplierId)
                      return (
                        <tr
                          key={b.id}
                          className="cursor-pointer border-b border-stone-50 align-top transition hover:bg-primary-light/30 dark:border-stone-800 dark:hover:bg-emerald-950/20"
                          onClick={() => setSelectedBid(b)}
                          title="انقر لعرض التفاصيل الكاملة"
                        >
                          <td className="px-4 py-3 font-medium">{supplier?.companyName || b.supplierId}</td>
                          <td className="px-4 py-3 tabular-nums">{formatSYP(b.price)}</td>
                          <td className="max-w-xs truncate px-4 py-3 text-stone-600 dark:text-stone-400">{b.plan}</td>
                          <td className="px-4 py-3">{b.deliveryDate}</td>
                          <td className="max-w-xs truncate px-4 py-3 text-stone-600 dark:text-stone-400">{b.message}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs dark:bg-stone-800">
                              {BID_STATUS[b.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            {b.status === 'pending' && tender.status === 'active' ? (
                              <button
                                type="button"
                                onClick={() => setConfirmWinner(b)}
                                className={btnPrimary + ' text-xs py-1'}
                              >
                                اختيار كفائز
                              </button>
                            ) : b.status === 'won' ? (
                              <Link to="/messages" className={btnOutline + ' text-xs py-1'}>
                                مراسلة
                              </Link>
                            ) : null}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        <Modal
          open={Boolean(selectedBid)}
          onClose={() => setSelectedBid(null)}
          title="تفاصيل العرض"
          size="lg"
        >
          {selectedBid ? (
            <BidDetails bid={selectedBid} supplier={getUserById(selectedBid.supplierId)} />
          ) : null}
        </Modal>

        <ConfirmDialog
          open={Boolean(confirmWinner)}
          onClose={() => setConfirmWinner(null)}
          onConfirm={handleConfirmWinner}
          title="تأكيد اختيار الفائز"
          message={`هل أنت متأكد من اختيار "${getUserById(confirmWinner?.supplierId)?.companyName || 'هذا المورد'}" كفائز؟ سيتم رفض باقي العروض تلقائياً.`}
          confirmLabel="تأكيد الاختيار"
          variant="success"
          loading={processingWinner}
        />

        <ConfirmDialog
          open={confirmComplete}
          onClose={() => setConfirmComplete(false)}
          onConfirm={handleCompleteTender}
          title="تحويل المناقصة إلى مكتملة"
          message="سيتم إغلاق المناقصة نهائياً ولن يُسمح باستقبال عروض جديدة أو تعديل بياناتها. هل تريد المتابعة؟"
          confirmLabel="تحويل إلى مكتملة"
          variant="warning"
          loading={processingComplete}
        />
      </div>
    </RequirePermission>
  )
}

function BidDetails({ bid, supplier }) {
  return (
    <div className="space-y-4">
      <DetailRow label="المورد" value={supplier?.companyName || bid.supplierId} />
      <DetailRow label="السعر المعروض" value={formatSYP(bid.price)} highlight />
      <DetailRow label="موعد التسليم" value={bid.deliveryDate} />
      <DetailRow label="خطة تنفيذ المشروع" value={bid.plan} multiline />
      <DetailRow label="الرسالة التعريفية" value={bid.message} multiline />
      <DetailRow label="الحالة" value={BID_STATUS[bid.status]} />
    </div>
  )
}

function DetailRow({ label, value, multiline, highlight }) {
  return (
    <div className="rounded-lg border border-stone-100 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-800/50">
      <p className="text-xs font-medium text-stone-500 dark:text-stone-400">{label}</p>
      <p
        className={`mt-1 ${multiline ? 'whitespace-pre-wrap leading-relaxed' : ''} ${
          highlight ? 'text-lg font-bold text-primary-dark dark:text-emerald-400' : 'text-stone-800 dark:text-stone-200'
        }`}
      >
        {value}
      </p>
    </div>
  )
}