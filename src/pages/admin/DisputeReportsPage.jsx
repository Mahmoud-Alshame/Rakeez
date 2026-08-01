import { useMemo, useState } from 'react'
import { RequirePermission } from '../../components/auth/RequirePermission'
import { Alert } from '../../components/ui/Alert'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Modal } from '../../components/ui/Modal'
import { TenderDetailContent } from '../../components/tenders/TenderDetailContent'
import { SearchFilterBar, matchesSearch } from '../../components/ui/SearchFilterBar'
import { btnOutline, btnPrimary } from '../../components/ui/FormField'
import { useData } from '../../contexts/dataContext'

const STATUS_LABELS = {
  pending: 'قيد المراجعة',
  resolved: 'تم الحل',
}

export default function DisputeReportsPage() {
  const { disputes, tenders, users, categories, updateDisputeStatus } = useData()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [resolveTarget, setResolveTarget] = useState(null)
  const [selected, setSelected] = useState(null)
  const [resolving, setResolving] = useState(false)
  const [reopening, setReopening] = useState(false)
  const [error, setError] = useState('')

  function getTender(tenderId) {
    return tenders.find((t) => t.id === tenderId)
  }

  function getTenderTitle(tenderId) {
    return getTender(tenderId)?.title || '—'
  }

  function getUser(uid) {
    return users.find((u) => u.uid === uid)
  }

  function getUserName(uid) {
    return getUser(uid)?.companyName || uid
  }

  const filtered = useMemo(() => {
    return disputes.filter((d) => {
      const title = getTenderTitle(d.tenderId)
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter
      const matchesText =
        matchesSearch(title, search) ||
        matchesSearch(getUserName(d.complainantId), search) ||
        matchesSearch(getUserName(d.defendantId), search) ||
        matchesSearch(d.description, search)
      return matchesStatus && matchesText
    })
  }, [disputes, search, statusFilter, tenders, users])

  async function handleResolve() {
    if (!resolveTarget) return
    setError('')
    setResolving(true)
    try {
      await updateDisputeStatus(resolveTarget.id, 'resolved')
      setSelected((prev) => (prev?.id === resolveTarget.id ? { ...prev, status: 'resolved' } : prev))
      setResolveTarget(null)
    } catch (err) {
      setError('تعذّر تحديث حالة النزاع، حاول مرة أخرى.')
    } finally {
      setResolving(false)
    }
  }

  async function handleReopen() {
    if (!selected) return
    setError('')
    setReopening(true)
    try {
      await updateDisputeStatus(selected.id, 'pending')
      setSelected((prev) => (prev ? { ...prev, status: 'pending' } : prev))
    } catch (err) {
      setError('تعذّرت إعادة فتح النزاع، حاول مرة أخرى.')
    } finally {
      setReopening(false)
    }
  }

  function openDispute(d) {
    setSelected(d)
  }

  return (
    <RequirePermission permission="DISPUTES">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">إدارة النزاعات والتبليغات</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            انقر على أي نزاع لعرض التفاصيل الكاملة. مراجعة الشكاوى المرسلة من الموردين أو الشركات الناشئة.
          </p>
        </div>

        {error ? <Alert variant="error">{error}</Alert> : null}

        {disputes.length === 0 ? (
          <Alert variant="info">لا توجد نزاعات مسجّلة حالياً.</Alert>
        ) : (
          <>
            <SearchFilterBar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="بحث بعنوان المناقصة أو أسماء الأطراف..."
              filters={[
                {
                  id: 'status',
                  label: 'حالة النزاع',
                  value: statusFilter,
                  onChange: setStatusFilter,
                  options: [
                    { value: 'all', label: 'كل الحالات' },
                    { value: 'pending', label: 'قيد المراجعة' },
                    { value: 'resolved', label: 'تم الحل' },
                  ],
                },
              ]}
            />

            <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900">
              <table className="w-full min-w-[900px] text-right text-sm">
                <thead className="border-b border-stone-100 bg-stone-50 dark:border-stone-800 dark:bg-stone-800/50">
                  <tr>
                    <th className="px-4 py-3 font-semibold">المناقصة</th>
                    <th className="px-4 py-3 font-semibold">المشتكي</th>
                    <th className="px-4 py-3 font-semibold">المشتكى عليه</th>
                    <th className="px-4 py-3 font-semibold">ملخص الشكوى</th>
                    <th className="px-4 py-3 font-semibold">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-stone-500 dark:text-stone-400">
                        لا توجد نتائج مطابقة.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((d) => (
                      <tr
                        key={d.id}
                        onClick={() => openDispute(d)}
                        className="cursor-pointer border-b border-stone-50 align-top transition hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-800/60"
                      >
                        <td className="px-4 py-3 font-medium text-primary-dark dark:text-emerald-400">
                          {getTenderTitle(d.tenderId)}
                        </td>
                        <td className="px-4 py-3 text-stone-800 dark:text-stone-200">{getUserName(d.complainantId)}</td>
                        <td className="px-4 py-3 text-stone-800 dark:text-stone-200">{getUserName(d.defendantId)}</td>
                        <td className="max-w-xs px-4 py-3 text-stone-600 dark:text-stone-400">
                          <span className="line-clamp-2">{d.description}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              d.status === 'resolved'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {STATUS_LABELS[d.status]}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        <Modal
          open={Boolean(selected)}
          onClose={() => setSelected(null)}
          title="تفاصيل النزاع"
          size="lg"
          footer={
            selected ? (
              <>
                <button type="button" onClick={() => setSelected(null)} className={btnOutline}>
                  إغلاق
                </button>
                {selected.status === 'pending' ? (
                  <button
                    type="button"
                    onClick={() => setResolveTarget(selected)}
                    className={btnPrimary + ' text-xs py-2'}
                  >
                    تم الحل
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleReopen}
                    disabled={reopening}
                    className={btnOutline + ' text-xs py-2'}
                  >
                    {reopening ? 'جاري إعادة الفتح…' : 'إعادة فتح'}
                  </button>
                )}
              </>
            ) : null
          }
        >
          {selected ? (
            <DisputeDetailBody
              dispute={selected}
              tender={getTender(selected.tenderId)}
              categories={categories}
              complainant={getUser(selected.complainantId)}
              defendant={getUser(selected.defendantId)}
              tenderOwner={getUser(getTender(selected.tenderId)?.ownerId)}
            />
          ) : null}
        </Modal>

        <ConfirmDialog
          open={Boolean(resolveTarget)}
          onClose={() => setResolveTarget(null)}
          onConfirm={handleResolve}
          title="تأكيد حل النزاع"
          message={`هل تم حل النزاع المتعلق بمناقصة "${getTenderTitle(resolveTarget?.tenderId)}"؟`}
          confirmLabel="تأكيد — تم الحل"
          variant="success"
          loading={resolving}
        />
      </div>
    </RequirePermission>
  )
}

function DisputeDetailBody({ dispute, tender, categories, complainant, defendant, tenderOwner }) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-stone-100 p-4 dark:border-stone-800">
        <h3 className="mb-3 text-sm font-bold text-stone-900 dark:text-stone-100">معلومات النزاع</h3>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-stone-500 dark:text-stone-400">رقم النزاع</dt>
            <dd className="font-mono text-sm font-medium text-stone-800 dark:text-stone-200">{dispute.id}</dd>
          </div>
          <div>
            <dt className="text-xs text-stone-500 dark:text-stone-400">الحالة</dt>
            <dd className="font-semibold text-stone-900 dark:text-stone-100">
              {STATUS_LABELS[dispute.status]}
            </dd>
          </div>
          {dispute.createdAt ? (
            <div>
              <dt className="text-xs text-stone-500 dark:text-stone-400">تاريخ التقديم</dt>
              <dd className="text-stone-800 dark:text-stone-200">
                {new Date(dispute.createdAt).toLocaleString('ar-SY')}
              </dd>
            </div>
          ) : null}
          {dispute.resolvedAt ? (
            <div>
              <dt className="text-xs text-stone-500 dark:text-stone-400">تاريخ الحل</dt>
              <dd className="text-stone-800 dark:text-stone-200">
                {new Date(dispute.resolvedAt).toLocaleString('ar-SY')}
              </dd>
            </div>
          ) : null}
        </dl>
        <div className="mt-4">
          <p className="mb-1 text-xs font-semibold text-stone-500 dark:text-stone-400">نص الشكوى</p>
          <p className="whitespace-pre-wrap rounded-lg border border-stone-100 bg-white p-3 leading-relaxed text-stone-700 dark:border-stone-700 dark:bg-stone-800/50 dark:text-stone-300">
            {dispute.description}
          </p>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-bold text-stone-900 dark:text-stone-100">الأطراف</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <PartyCard title="المشتكي" user={complainant} />
          <PartyCard title="المشتكى عليه" user={defendant} />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-bold text-stone-900 dark:text-stone-100">المناقصة المرتبطة</h3>
        <TenderDetailContent tender={tender} categories={categories} owner={tenderOwner} />
      </section>
    </div>
  )
}

function PartyCard({ title, user }) {
  return (
    <div className="rounded-xl border border-stone-100 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-800/40">
      <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">{title}</p>
      <p className="mt-1 font-bold text-stone-900 dark:text-stone-100">{user?.companyName || '—'}</p>
      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{user?.email || '—'}</p>
      {user?.profile?.phone ? (
        <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">هاتف: {user.profile.phone}</p>
      ) : null}
    </div>
  )
}