import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RequirePermission } from '../../components/auth/RequirePermission'
import { Alert } from '../../components/ui/Alert'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Modal } from '../../components/ui/Modal'
import { btnOutline, btnPrimary, inputClass } from '../../components/ui/FormField'
import { formatSYP } from '../../utils/currency'
import { useAuth } from '../../contexts/authContext'
import { useData } from '../../contexts/dataContext'

export default function WonTendersPage() {
  const { user } = useAuth()
  const { getWonBids, tenders, disputes, getUserById, createDispute } = useData()
  const won = getWonBids(user?.uid)
  const [disputeModal, setDisputeModal] = useState(null)
  const [description, setDescription] = useState('')
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function openDispute(bid) {
    const tender = tenders.find((t) => t.id === bid.tenderId)
    // نمنع فتح نافذة النزاع إذا المناقصة غير موجودة — يحمي من إرسال نزاع بدون معرفة الطرف الآخر
    if (!tender) return
    setDisputeModal({ bid, tender })
    setDescription('')
    setError('')
  }

  async function submitDispute() {
    if (!disputeModal || !description.trim()) return
    const { bid, tender } = disputeModal
    setError('')
    setSubmitting(true)
    try {
      await createDispute({
        tenderId: bid.tenderId,
        complainantId: user.uid,
        defendantId: tender.ownerId,
        description: description.trim(),
      })
      setConfirmSubmit(false)
      setDisputeModal(null)
      setDescription('')
    } catch (err) {
      setError('تعذّر إرسال النزاع، حاول مرة أخرى.')
      setConfirmSubmit(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <RequirePermission permission="WON_TENDERS">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">المناقصات الفائز بها</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">المناقصات التي اختير عرضك فيها كفائز.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {won.length === 0 ? (
            <p className="text-sm text-stone-500 dark:text-stone-400">لم تفز بأي مناقصة بعد.</p>
          ) : (
            won.map((b) => {
              const t = tenders.find((x) => x.id === b.tenderId)
              const owner = getUserById(t?.ownerId)
              const hasOpenDispute = disputes.some(
                (d) => d.tenderId === b.tenderId && d.complainantId === user.uid && d.status === 'pending',
              )
              return (
                <article
                  key={b.id}
                  className="rounded-2xl border border-primary/30 bg-primary-light/30 p-5 dark:border-emerald-800 dark:bg-emerald-950/30"
                >
                  <h2 className="font-bold text-stone-900 dark:text-stone-100">{t?.title || b.tenderId}</h2>
                  <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{owner?.companyName}</p>
                  <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                    عرضك الفائز: {formatSYP(b.price)}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link to="/messages" className={btnOutline + ' text-xs'}>
                      فتح الرسائل
                    </Link>
                    {hasOpenDispute ? (
                      <span className="text-xs text-amber-700 dark:text-amber-400">لديك نزاع قيد المراجعة</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openDispute(b)}
                        disabled={!t}
                        className={btnOutline + ' text-xs text-amber-800'}
                      >
                        تقديم نزاع
                      </button>
                    )}
                  </div>
                </article>
              )
            })
          )}
        </div>

        <Modal
          open={Boolean(disputeModal)}
          onClose={() => setDisputeModal(null)}
          title="تقديم نزاع / شكوى"
          footer={
            <>
              <button type="button" onClick={() => setDisputeModal(null)} className={btnOutline}>
                إلغاء
              </button>
              <button
                type="button"
                disabled={!description.trim()}
                onClick={() => setConfirmSubmit(true)}
                className={btnPrimary}
              >
                إرسال للمدير
              </button>
            </>
          }
        >
          {error ? <Alert variant="error">{error}</Alert> : null}
          <p className="mb-3 text-sm">
            المناقصة: <strong>{disputeModal?.tender?.title}</strong>
          </p>
          <label htmlFor="dispute-desc" className="mb-1 block text-sm font-medium">
            نص التوضيح / الشكوى
          </label>
          <textarea
            id="dispute-desc"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
            placeholder="اشرح المشكلة بالتفصيل..."
          />
        </Modal>

        <ConfirmDialog
          open={confirmSubmit}
          onClose={() => setConfirmSubmit(false)}
          onConfirm={submitDispute}
          title="تأكيد إرسال النزاع"
          message="سيتم إرسال شكواك إلى مدير النظام للمراجعة. هل تريد المتابعة؟"
          confirmLabel="إرسال"
          variant="warning"
          loading={submitting}
        />
      </div>
    </RequirePermission>
  )
}