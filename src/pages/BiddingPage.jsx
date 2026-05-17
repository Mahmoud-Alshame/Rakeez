import { RequirePermission } from '../components/auth/RequirePermission'

const CARDS = [
  { id: '1', title: 'توريد أجهزة حاسوب', budget: '150,000 ر.س', org: 'منشور من: شركة نماء الناشئة', days: 12, tags: ['تقنية', 'توريد'] },
  { id: '2', title: 'تطوير منصة داخلية', budget: '200,000 ر.س', org: 'منشور من: تقنية الحديث الناشئة', days: 8, tags: ['برمجيات'] },
  { id: '3', title: 'خدمات تنظيف وصيانة', budget: '80,000 ر.س', org: 'منشور من: مجموعة الأفق الناشئة', days: 30, tags: ['خدمات'] },
]

/**
 * استعراض المناقصات المتاحة — Use Case: المورد / شركة الخدمات (بحث وفلترة لاحقاً).
 */
export default function BiddingPage() {
  return (
    <RequirePermission permission="BIDDING_MARKET">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">المناقصات المتاحة</h1>
          <p className="mt-1 text-sm text-stone-500">استعرض الفرص المنشورة وقدّم عرضك عند الجاهزية.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {CARDS.map((c) => (
            <article
              key={c.id}
              className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-bold text-stone-900 group-hover:text-primary-dark">{c.title}</h2>
                <span className="shrink-0 rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary-dark">
                  متاحة
                </span>
              </div>
              <p className="mt-2 text-sm text-stone-500">{c.org}</p>
              <p className="mt-4 text-2xl font-bold text-stone-900">{c.budget}</p>
              <p className="mt-1 text-xs text-stone-400">ينتهي خلال {c.days} يوماً تقريباً</p>
              <div className="mt-4 flex flex-wrap gap-1">
                {c.tags.map((t) => (
                  <span key={t} className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <button type="button" className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-white hover:bg-primary-dark">
                  تقديم عرض
                </button>
                <button type="button" className="rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-600 hover:bg-stone-50">
                  تفاصيل
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </RequirePermission>
  )
}
