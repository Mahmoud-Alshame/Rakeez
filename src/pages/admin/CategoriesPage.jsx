import { useState } from 'react'
import { RequirePermission } from '../../components/auth/RequirePermission'
import { Alert } from '../../components/ui/Alert'
import { FormField, btnPrimary, btnDangerSm, inputClass } from '../../components/ui/FormField'
import { useData } from '../../contexts/dataContext'

export default function CategoriesPage() {
  const { categories, addCategory, removeCategory } = useData()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  async function onAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    setError('')
    setLoading(true)
    try {
      await addCategory(name)
      setName('')
    } catch (err) {
      setError('تعذّرت إضافة التصنيف، حاول مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  async function onDelete(id) {
    setError('')
    setDeletingId(id)
    try {
      await removeCategory(id)
    } catch (err) {
      setError('تعذّر حذف التصنيف، حاول مرة أخرى.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <RequirePermission permission="CATEGORIES">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">إدارة التصنيفات</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            التصنيفات تظهر للموردين والشركات الناشئة عند إكمال الملف.
          </p>
        </div>

        {error ? <Alert variant="error">{error}</Alert> : null}

        <form
          onSubmit={onAdd}
          className="flex flex-wrap gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <FormField label="تصنيف جديد" id="catName">
            <input
              id="catName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="مثال: تقنية معلومات"
              disabled={loading}
            />
          </FormField>
          <div className="flex items-end">
            <button type="submit" disabled={loading} className={btnPrimary}>
              {loading ? 'جاري الإضافة…' : 'إضافة'}
            </button>
          </div>
        </form>

        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900">
          <table className="w-full min-w-[400px] text-right text-sm">
            <thead className="border-b border-stone-100 bg-stone-50 dark:border-stone-800 dark:bg-stone-800/50">
              <tr>
                <th className="px-4 py-3 font-semibold text-stone-700 dark:text-stone-300">التصنيف</th>
                <th className="px-4 py-3 font-semibold text-stone-700 dark:text-stone-300">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-stone-50 last:border-0 dark:border-stone-800"
                >
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">{c.name}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onDelete(c.id)}
                      disabled={deletingId === c.id}
                      className={btnDangerSm}
                    >
                      {deletingId === c.id ? 'جاري الحذف…' : 'حذف'}
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