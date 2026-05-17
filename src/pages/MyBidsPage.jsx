import { RequirePermission } from '../components/auth/RequirePermission'

const MY_BIDS = [
  { id: 'B-101', tender: 'توريد أجهزة حاسوب', status: 'قيد المراجعة', date: '2026-05-10' },
  { id: 'B-102', tender: 'خدمات تدريب', status: 'مقبول', date: '2026-04-22' },
  { id: 'B-103', tender: 'تطوير بوابة', status: 'مرفوض', date: '2026-03-01' },
]

/**
 * إدارة العروض — Use Case: المورد (يشمل مسار تقديم العرض ضمن دورة حياة العرض).
 */
export default function MyBidsPage() {
  return (
    <RequirePermission permission="MY_BIDS">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">إدارة العروض</h1>
          <p className="mt-1 text-sm text-stone-500">متابعة العروض التي قدّمتها على مناقصات الشركات الناشئة.</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full min-w-[560px] text-right text-sm">
            <thead className="border-b border-stone-100 bg-stone-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-stone-700">رقم العرض</th>
                <th className="px-4 py-3 font-semibold text-stone-700">المناقصة</th>
                <th className="px-4 py-3 font-semibold text-stone-700">الحالة</th>
                <th className="px-4 py-3 font-semibold text-stone-700">تاريخ التقديم</th>
              </tr>
            </thead>
            <tbody>
              {MY_BIDS.map((b) => (
                <tr key={b.id} className="border-b border-stone-50 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-stone-500">{b.id}</td>
                  <td className="px-4 py-3 font-medium text-stone-900">{b.tender}</td>
                  <td className="px-4 py-3 text-stone-600">{b.status}</td>
                  <td className="px-4 py-3 text-stone-600">{b.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RequirePermission>
  )
}
