import { useState } from 'react'
import { RequirePermission } from '../components/auth/RequirePermission'

const INITIAL = [
  { id: 'TND-001', title: 'توريد معدات تقنية', status: 'مفتوحة', bids: 6, deadline: '2026-05-30' },
  { id: 'TND-002', title: 'صيانة دورية', status: 'مغلقة', bids: 4, deadline: '2026-04-01' },
  { id: 'TND-003', title: 'تطوير برمجيات', status: 'قيد المراجعة', bids: 8, deadline: '2026-06-15' },
]

/**
 * إدارة المناقصات — Use Case: الشركة الناشئة (يشمل إنشاء مناقصة جديدة عبر الزر).
 */
export default function TenderManagementPage() {
  const [rows, setRows] = useState(INITIAL)

  function addDraft() {
    const n = rows.length + 1
    setRows((r) => [
      {
        id: `TND-${String(n).padStart(3, '0')}`,
        title: `مناقصة جديدة ${n}`,
        status: 'مسودة',
        bids: 0,
        deadline: '—',
      },
      ...r,
    ])
  }

  return (
    <RequirePermission permission="TENDER_MANAGEMENT">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">إدارة المناقصات</h1>
            <p className="mt-1 text-sm text-stone-500">عرض مناقصاتك، استقبال العروض، واختيار الفائز (واجهة فقط).</p>
          </div>
          <button
            type="button"
            onClick={addDraft}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            + مناقصة جديدة
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-right text-sm">
            <thead className="border-b border-stone-100 bg-stone-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-stone-700">الرمز</th>
                <th className="px-4 py-3 font-semibold text-stone-700">العنوان</th>
                <th className="px-4 py-3 font-semibold text-stone-700">الحالة</th>
                <th className="px-4 py-3 font-semibold text-stone-700">العروض</th>
                <th className="px-4 py-3 font-semibold text-stone-700">الانتهاء</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-b border-stone-50 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-stone-500">{t.id}</td>
                  <td className="px-4 py-3 font-medium text-stone-900">{t.title}</td>
                  <td className="px-4 py-3 text-stone-600">{t.status}</td>
                  <td className="px-4 py-3 text-stone-600">{t.bids}</td>
                  <td className="px-4 py-3 text-stone-600">{t.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RequirePermission>
  )
}
