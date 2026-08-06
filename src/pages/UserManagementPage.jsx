import { useMemo, useState } from 'react'
import { RequirePermission } from '../components/auth/RequirePermission'
import { Alert } from '../components/ui/Alert'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { SearchFilterBar, matchesSearch } from '../components/ui/SearchFilterBar'
import { btnOutline, btnPrimary, btnDangerSm } from '../components/ui/FormField'
import { ACCOUNT_STATUS, ACCOUNT_STATUS_LABELS } from '../constants/auth'
import { BRAND_NAME } from '../constants/brand'
import { ROLE_LABELS_AR } from '../constants/roles'
import { useAuth } from '../contexts/authContext'
import { useData } from '../contexts/dataContext'

export default function UserManagementPage() {
  const { users } = useData()
  const { activateUser, blockUser } = useAuth()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [confirmAction, setConfirmAction] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

const filtered = useMemo(() => {
  return users.filter((u) => {
    if (u.role === 'admin') return false
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter
    const matchesText =
      matchesSearch(u.companyName, search) ||
      matchesSearch(u.email, search) ||
      matchesSearch(ROLE_LABELS_AR[u.role], search)
    return matchesRole && matchesStatus && matchesText
  })
}, [users, search, roleFilter, statusFilter])

  async function handleConfirm() {
    if (!confirmAction) return
    const { type, uid } = confirmAction
    setError('')
    setProcessing(true)
    try {
      if (type === 'activate') await activateUser(uid)
      if (type === 'block') await blockUser(uid)
      setConfirmAction(null)
    } catch (err) {
      setError('تعذّر تنفيذ العملية، حاول مرة أخرى.')
    } finally {
      setProcessing(false)
    }
  }

  const confirmMessages = {
    activate: 'هل تريد تفعيل هذا الحساب ومنحه صلاحية الدخول الكامل؟',
    block: `هل تريد حظر هذا الحساب؟ لن يتمكن من استخدام ${BRAND_NAME}.`,
  }

  return (
    <RequirePermission permission="USER_MANAGEMENT">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">إدارة الحسابات</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            مراجعة الحسابات الجديدة وتفعيلها أو حظرها بعد التحقق من البريد.
          </p>
        </div>

        {error ? <Alert variant="error">{error}</Alert> : null}

        <SearchFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="بحث بالشركة أو البريد..."
          filters={[
            {
              id: 'role',
              label: 'نوع الحساب',
              value: roleFilter,
              onChange: setRoleFilter,
              options: [
                { value: 'all', label: 'الكل' },
                { value: 'startup', label: 'شركة ناشئة' },
                { value: 'supplier', label: 'مورد' },
              ],
            },
            {
              id: 'status',
              label: 'الحالة',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: 'all', label: 'كل الحالات' },
                { value: ACCOUNT_STATUS.PENDING, label: 'بانتظار التفعيل' },
                { value: ACCOUNT_STATUS.ACTIVE, label: 'نشط' },
                { value: ACCOUNT_STATUS.BLOCKED, label: 'محظور' },
              ],
            },
          ]}
        />

        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900">
          <table className="w-full min-w-[720px] text-right text-sm">
            <thead className="border-b border-stone-100 bg-stone-50 dark:border-stone-800 dark:bg-stone-800/50">
              <tr>
                <th className="px-4 py-3 font-semibold">الشركة</th>
                <th className="px-4 py-3 font-semibold">البريد</th>
                <th className="px-4 py-3 font-semibold">النوع</th>
                <th className="px-4 py-3 font-semibold">الحالة</th>
                <th className="px-4 py-3 font-semibold">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-stone-500 dark:text-stone-400">
                    لا يوجد مستخدمون مطابقون.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.uid} className="border-b border-stone-50 last:border-0 dark:border-stone-800">
                    <td className="px-4 py-3 font-medium">{u.companyName}</td>
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{u.email}</td>
                    <td className="px-4 py-3">{ROLE_LABELS_AR[u.role]}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.status === ACCOUNT_STATUS.ACTIVE
                            ? 'bg-primary-light text-primary-dark dark:bg-emerald-950 dark:text-emerald-300'
                            : u.status === ACCOUNT_STATUS.BLOCKED
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {ACCOUNT_STATUS_LABELS[u.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {u.status === ACCOUNT_STATUS.PENDING ? (
                          <button
                            type="button"
                            onClick={() => setConfirmAction({ type: 'activate', uid: u.uid, name: u.companyName })}
                            className={btnPrimary + ' text-xs py-1'}
                          >
                            قبول وتفعيل
                          </button>
                        ) : null}
                        {u.status !== ACCOUNT_STATUS.BLOCKED ? (
                          <button
                            type="button"
                            onClick={() => setConfirmAction({ type: 'block', uid: u.uid, name: u.companyName })}
                            className={btnDangerSm}
                          >
                            حظر
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmAction({ type: 'activate', uid: u.uid, name: u.companyName })}
                            className={btnOutline + ' text-xs py-1'}
                          >
                            إلغاء الحظر
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <ConfirmDialog
          open={Boolean(confirmAction)}
          onClose={() => setConfirmAction(null)}
          onConfirm={handleConfirm}
          title={confirmAction?.type === 'block' ? 'تأكيد الحظر' : 'تأكيد التفعيل'}
          message={`${confirmMessages[confirmAction?.type] || ''} (${confirmAction?.name})`}
          confirmLabel={confirmAction?.type === 'block' ? 'حظر الحساب' : 'تفعيل الحساب'}
          variant={confirmAction?.type === 'block' ? 'danger' : 'success'}
          loading={processing}
        />
      </div>
    </RequirePermission>
  )
}