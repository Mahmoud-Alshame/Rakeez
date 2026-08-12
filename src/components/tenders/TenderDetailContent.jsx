import { formatMoneyRange } from '../../utils/currency'

const TENDER_STATUS_LABELS = {
  active: 'نشطة',
  awarded: 'مُنحت',
  completed: 'مكتملة',
  removed: 'محذوفة',
}

/** عرض تفاصيل المناقصة داخل نافذة منبثقة أو لوحة */
export function TenderDetailContent({ tender, categories, owner }) {
  if (!tender) {
    return <p className="text-stone-500 dark:text-stone-400">لا توجد بيانات للمناقصة.</p>
  }

  const categoryName = categories.find((c) => c.id === tender.categoryId)?.name || '—'

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-stone-100 bg-stone-50/80 p-4 dark:border-stone-800 dark:bg-stone-800/50">
        <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">{tender.title}</h3>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          {owner?.companyName || 'شركة غير معروفة'}
        </p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <DetailItem label="التصنيف" value={categoryName} />
        <DetailItem
          label="الحالة"
          value={TENDER_STATUS_LABELS[tender.status] || tender.status}
        />
        <DetailItem
          label="الميزانية"
          value={formatMoneyRange(tender.budgetMin, tender.budgetMax, tender.currency)}
          highlight
        />
        <DetailItem label="آخر موعد للعروض" value={tender.deadline || '—'} />
        {tender.createdAt ? (
          <DetailItem label="تاريخ النشر" value={new Date(tender.createdAt).toLocaleDateString('ar-SY')} />
        ) : null}
      </dl>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          الوصف
        </p>
        <p className="whitespace-pre-wrap rounded-lg border border-stone-100 bg-white p-3 leading-relaxed text-stone-700 dark:border-stone-700 dark:bg-stone-800/50 dark:text-stone-300">
          {tender.description || '—'}
        </p>
      </div>
    </div>
  )
}

function DetailItem({ label, value, highlight }) {
  return (
    <div className="rounded-lg border border-stone-100 px-3 py-2 dark:border-stone-800">
      <dt className="text-xs font-medium text-stone-500 dark:text-stone-400">{label}</dt>
      <dd
        className={`mt-0.5 font-semibold tabular-nums ${
          highlight ? 'text-lg text-primary-dark dark:text-emerald-400' : 'text-stone-900 dark:text-stone-100'
        }`}
      >
        {value}
      </dd>
    </div>
  )
}