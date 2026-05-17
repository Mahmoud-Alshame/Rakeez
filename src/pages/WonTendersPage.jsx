import { RequirePermission } from '../components/auth/RequirePermission'

const WON = [
  { id: 'W-01', tender: 'صيانة مباني — عقد سنوي', startup: 'مجموعة الأفق الناشئة', amount: '72,000 ر.س', closedAt: '2026-03-20' },
  { id: 'W-02', tender: 'توريد قرطاسية', startup: 'إبداع التقنية الناشئة', amount: '18,500 ر.س', closedAt: '2026-02-02' },
]

/**
 * عرض المناقصات الفائز بها — Use Case: المورد / شركة الخدمات.
 */
export default function WonTendersPage() {
  return (
    <RequirePermission permission="WON_TENDERS">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">المناقصات الفائز بها</h1>
          <p className="mt-1 text-sm text-stone-500">سجل المناقصات التي فزت بها بعد اختيار الناشئة لعرضك.</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full min-w-[560px] text-right text-sm">
            <thead className="border-b border-stone-100 bg-stone-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-stone-700">المرجع</th>
                <th className="px-4 py-3 font-semibold text-stone-700">المناقصة</th>
                <th className="px-4 py-3 font-semibold text-stone-700">الشركة الناشئة</th>
                <th className="px-4 py-3 font-semibold text-stone-700">قيمة العرض</th>
                <th className="px-4 py-3 font-semibold text-stone-700">تاريخ الإغلاق</th>
              </tr>
            </thead>
            <tbody>
              {WON.map((w) => (
                <tr key={w.id} className="border-b border-stone-50 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-stone-500">{w.id}</td>
                  <td className="px-4 py-3 font-medium text-stone-900">{w.tender}</td>
                  <td className="px-4 py-3 text-stone-600">{w.startup}</td>
                  <td className="px-4 py-3 text-stone-800">{w.amount}</td>
                  <td className="px-4 py-3 text-stone-600">{w.closedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RequirePermission>
  )
}
