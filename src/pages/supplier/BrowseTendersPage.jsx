import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RequirePermission } from '../../components/auth/RequirePermission'
import { Alert } from '../../components/ui/Alert'
import { Modal } from '../../components/ui/Modal'
import { TenderDetailContent } from '../../components/tenders/TenderDetailContent'
import { SearchFilterBar, matchesSearch } from '../../components/ui/SearchFilterBar'
import { FormField, btnOutline, btnPrimary, inputClass } from '../../components/ui/FormField'
import { formatSYPRange } from '../../utils/currency'
import { useAuth } from '../../contexts/authContext'
import { useData } from '../../contexts/dataContext'

export default function BrowseTendersPage() {
  const { user, isProfileComplete } = useAuth()
  const {
    getActiveTenders,
    categories,
    getUserById,
    createBid,
    hasSupplierBidOnTender,
  } = useData()

  const [detailTender, setDetailTender] = useState(null)
  const [bidTender, setBidTender] = useState(null)
  const [bidForm, setBidForm] = useState({ price: '', plan: '', deliveryDate: '', message: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')

  const supplierCategory = user?.profile?.categoryId
  const allTenders = getActiveTenders().filter(
    (t) => !supplierCategory || t.categoryId === supplierCategory,
  )

  const tenders = useMemo(() => {
    return allTenders.filter((t) => {
      const owner = getUserById(t.ownerId)
      const catName = categories.find((c) => c.id === t.categoryId)?.name || ''
      const matchesCat = categoryFilter === 'all' || t.categoryId === categoryFilter
      const matchesDate = !dateFilter || t.deadline?.startsWith(dateFilter)
      const matchesText =
        matchesSearch(t.title, search) ||
        matchesSearch(t.description, search) ||
        matchesSearch(owner?.companyName, search) ||
        matchesSearch(catName, search)
      return matchesCat && matchesDate && matchesText
    })
  }, [allTenders, search, categoryFilter, dateFilter, categories, getUserById])

  function openDetail(tender) {
    setDetailTender(tender)
  }

  function openBid(tender) {
    setDetailTender(null)
    setBidTender(tender)
    setBidForm({ price: '', plan: '', deliveryDate: '', message: '' })
    setError('')
  }

  async function submitBid(e) {
    e.preventDefault()
    if (!isProfileComplete) {
      setError('أكمل ملفك الشخصي أولاً.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await createBid({
        tenderId: bidTender.id,
        supplierId: user.uid,
        price: Number(bidForm.price),
        plan: bidForm.plan.trim(),
        deliveryDate: bidForm.deliveryDate,
        message: bidForm.message.trim(),
      })
      setBidTender(null)
    } catch (err) {
      setError('تعذّر إرسال العرض، حاول مرة أخرى.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <RequirePermission permission="BIDDING_MARKET">
      <div className="space-y-6">
        <BrowseTendersHeader />

        {!isProfileComplete ? (
          <Alert variant="warning">
            <Link to="/profile" className="font-semibold underline">أكمل الملف الشخصي</Link> قبل التقديم.
          </Alert>
        ) : null}

        <SearchFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="بحث بالعنوان أو الوصف أو الشركة..."
          filters={[
            {
              id: 'category',
              label: 'التصنيف',
              value: categoryFilter,
              onChange: setCategoryFilter,
              options: [
                { value: 'all', label: 'كل التصنيفات' },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ],
            },
          ]}
        />

        <BrowseTendersDateFilter dateFilter={dateFilter} setDateFilter={setDateFilter} />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tenders.length === 0 ? (
            <p className="col-span-full text-sm text-stone-500 dark:text-stone-400">لا توجد مناقصات مطابقة للبحث.</p>
          ) : (
            tenders.map((t) => {
              const owner = getUserById(t.ownerId)
              const submitted = hasSupplierBidOnTender(user.uid, t.id)
              return (
                <article
                  key={t.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openDetail(t)}
                  onKeyDown={(e) => e.key === 'Enter' && openDetail(t)}
                  className="flex cursor-pointer flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md dark:border-stone-700 dark:bg-stone-900"
                >
                  <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">{t.title}</h2>
                  <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{owner?.companyName}</p>
                  <p className="mt-3 line-clamp-2 text-sm text-stone-600 dark:text-stone-400">{t.description}</p>
                  <p className="mt-3 font-bold tabular-nums text-primary-dark dark:text-emerald-400">
                    {formatSYPRange(t.budgetMin, t.budgetMax)}
                  </p>
                  <p className="text-xs text-stone-400">آخر موعد: {t.deadline}</p>
                  <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={submitted || !isProfileComplete}
                      onClick={() => openBid(t)}
                      className={btnPrimary + ' flex-1'}
                    >
                      {submitted ? 'تم التقديم' : 'تقديم عرض'}
                    </button>
                    <button type="button" onClick={() => openDetail(t)} className={btnOutline + ' text-xs'}>
                      التفاصيل
                    </button>
                  </div>
                </article>
              )
            })
          )}
        </div>

        {/* نافذة تفاصيل المناقصة */}
        <Modal
          open={Boolean(detailTender)}
          onClose={() => setDetailTender(null)}
          title="تفاصيل المناقصة"
          size="lg"
          footer={
            detailTender ? (
              <>
                <button type="button" onClick={() => setDetailTender(null)} className={btnOutline}>
                  إغلاق
                </button>
                {!hasSupplierBidOnTender(user.uid, detailTender.id) && isProfileComplete ? (
                  <button type="button" onClick={() => openBid(detailTender)} className={btnPrimary}>
                    تقديم عرض
                  </button>
                ) : null}
              </>
            ) : null
          }
        >
          {detailTender ? (
            <TenderDetailContent
              tender={detailTender}
              categories={categories}
              owner={getUserById(detailTender.ownerId)}
            />
          ) : null}
        </Modal>

        {/* نافذة تقديم العرض */}
        <Modal
          open={Boolean(bidTender)}
          onClose={() => setBidTender(null)}
          title="تقديم عرض"
          footer={
            <>
              <button type="button" onClick={() => setBidTender(null)} className={btnOutline}>
                إلغاء
              </button>
              <button type="submit" form="bid-form" className={btnPrimary} disabled={submitting}>
                {submitting ? 'جاري الإرسال…' : 'إرسال العرض'}
              </button>
            </>
          }
        >
          {error ? <Alert variant="error">{error}</Alert> : null}
          <p className="mb-3 text-sm font-medium">{bidTender?.title}</p>
          <form id="bid-form" onSubmit={submitBid} className="space-y-3">
            <FormField label="السعر المعروض (ل.س)" id="price">
              <input
                id="price"
                type="number"
                required
                min={0}
                step={1000}
                value={bidForm.price}
                onChange={(e) => setBidForm({ ...bidForm, price: e.target.value })}
                className={inputClass + ' tabular-nums'}
                placeholder="مثال: 5000000"
                disabled={submitting}
              />
            </FormField>
            <FormField label="خطة تنفيذ المشروع" id="plan">
              <textarea
                id="plan"
                required
                rows={3}
                value={bidForm.plan}
                onChange={(e) => setBidForm({ ...bidForm, plan: e.target.value })}
                className={inputClass}
                disabled={submitting}
              />
            </FormField>
            <FormField label="موعد التسليم المتوقع" id="deliveryDate">
              <input
                id="deliveryDate"
                type="date"
                required
                value={bidForm.deliveryDate}
                onChange={(e) => setBidForm({ ...bidForm, deliveryDate: e.target.value })}
                className={inputClass}
                disabled={submitting}
              />
            </FormField>
            <FormField label="رسالة تعريفية" id="message">
              <textarea
                id="message"
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
      </div>
    </RequirePermission>
  )
}

function BrowseTendersHeader() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">المناقصات المتاحة</h1>
      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
        انقر على أي مناقصة لعرض التفاصيل. الميزانيات بالليرة السورية (ل.س).
      </p>
    </div>
  )
}

function BrowseTendersDateFilter({ dateFilter, setDateFilter }) {
  return (
    <div className="flex items-end gap-2">
      <div className="min-w-[180px]">
        <label htmlFor="deadline-filter" className="mb-1 block text-xs font-medium text-stone-500 dark:text-stone-400">
          فلترة بالتاريخ
        </label>
        <input
          id="deadline-filter"
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className={inputClass}
        />
      </div>
      {dateFilter ? (
        <button type="button" onClick={() => setDateFilter('')} className={btnOutline + ' text-xs py-2'}>
          مسح التاريخ
        </button>
      ) : null}
    </div>
  )
}