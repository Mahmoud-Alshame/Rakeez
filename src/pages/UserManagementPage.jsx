import { useMemo, useState } from 'react'
import { RequirePermission } from '../components/auth/RequirePermission'

const MOCK_USERS = [
  { id: '1', name: 'نور الهدى حسين', email: 'nour@example.com', role: 'مدير', active: true },
  { id: '2', name: 'شركة المستقبل', email: 'future@supplier.com', role: 'مورد', active: true },
  { id: '3', name: 'تقنية A', email: 'techA@startup.com', role: 'ناشئة', active: false },
  { id: '4', name: 'مورد تجريبي', email: 'blocked@x.com', role: 'مورد', active: false },
]

/**
 * إدارة الحسابات — للمدير فقط (حظر / تفعيل محاكاة محلية).
 */
export default function UserManagementPage() {
  const [rows, setRows] = useState(MOCK_USERS)

  const counts = useMemo(() => {
    const active = rows.filter((r) => r.active).length
    return { total: rows.length, active }
  }, [rows])

  function toggleActive(id) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)))
  }

  return (
    <RequirePermission permission="USER_MANAGEMENT">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">إدارة الحسابات</h1>
          <p className="mt-1 text-sm text-stone-500">
            إجمالي {counts.total} مستخدم — {counts.active} نشط — البيانات وهمية للواجهة فقط.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-right text-sm">
            <thead className="border-b border-stone-100 bg-stone-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-stone-700">الاسم</th>
                <th className="px-4 py-3 font-semibold text-stone-700">البريد</th>
                <th className="px-4 py-3 font-semibold text-stone-700">النوع</th>
                <th className="px-4 py-3 font-semibold text-stone-700">الحالة</th>
                <th className="px-4 py-3 font-semibold text-stone-700">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-b border-stone-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-stone-900">{u.name}</td>
                  <td className="px-4 py-3 text-stone-600">{u.email}</td>
                  <td className="px-4 py-3 text-stone-600">{u.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.active ? 'bg-primary-light text-primary-dark' : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {u.active ? 'نشط' : 'موقوف'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleActive(u.id)}
                      className="rounded-lg border border-stone-200 px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50"
                    >
                      {u.active ? 'حظر' : 'تفعيل'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RequirePermission>
  )
}
