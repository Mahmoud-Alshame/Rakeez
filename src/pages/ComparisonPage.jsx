import { RequirePermission } from '../components/auth/RequirePermission'

const BIDDERS = [
  { name: 'شركة الرياض', price: '142,000', duration: '30 يوماً', score: 4.7, notes: 'ضمان سنتين' },
  { name: 'مستقبل الرقمي', price: '148,500', duration: '25 يوماً', score: 4.5, notes: 'توريد محلي' },
  { name: 'تقنية الحديث', price: '139,000', duration: '35 يوماً', score: 4.2, notes: 'أقل سعر' },
]

/**
 * مقارنة العروض المستلمة — Use Case: الشركة الناشئة ثم اختيار فائز وإغلاق المناقصة.
 */
export default function ComparisonPage() {
  const keys = ['price', 'duration', 'score', 'notes']

  return (
    <RequirePermission permission="COMPARISON">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">مقارنة العروض</h1>
          <p className="mt-1 text-sm text-stone-500">مناقصتك: توريد معدات تقنية — TND-2026-001 (عروض الموردين — بيانات تجريبية).</p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] border-collapse text-center text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="sticky right-0 z-10 min-w-[100px] border-l border-stone-200 bg-stone-50 px-3 py-3 text-stone-600">
                  المعيار
                </th>
                {BIDDERS.map((b) => (
                  <th key={b.name} className="min-w-[140px] px-3 py-3 font-bold text-stone-900">
                    {b.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k} className="border-b border-stone-100">
                  <td className="sticky right-0 z-10 border-l border-stone-200 bg-stone-50/95 px-3 py-3 text-right text-xs font-semibold text-stone-500 backdrop-blur">
                    {k === 'price' && 'السعر'}
                    {k === 'duration' && 'المدة'}
                    {k === 'score' && 'التقييم'}
                    {k === 'notes' && 'ملاحظات'}
                  </td>
                  {BIDDERS.map((b) => (
                    <td key={b.name + k} className="px-3 py-3 text-stone-800">
                      {b[k]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
            اختيار فائز
          </button>
          <button type="button" className="rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
            طلب توضيح
          </button>
        </div>
      </div>
    </RequirePermission>
  )
}
