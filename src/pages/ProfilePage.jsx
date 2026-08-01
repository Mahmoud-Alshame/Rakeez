import { useEffect, useState } from 'react'
import { RequirePermission } from '../components/auth/RequirePermission'
import { Alert } from '../components/ui/Alert'
import { FormField, btnPrimary, inputClass } from '../components/ui/FormField'
import { useAuth } from '../contexts/authContext'
import { useData } from '../contexts/dataContext'

export default function ProfilePage() {
  const { user, saveProfile, isProfileComplete } = useAuth()
  const { categories } = useData()
  const [form, setForm] = useState({
    companyName: '',
    categoryId: '',
    website: '',
    bio: '',
    phone: '',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user?.profile) {
      setForm({
        companyName: user.profile.companyName || user.companyName || '',
        categoryId: user.profile.categoryId || '',
        website: user.profile.website || '',
        bio: user.profile.bio || '',
        phone: user.profile.phone || '',
      })
    }
  }, [user])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setSaved(false)
  }

  function onSubmit(e) {
    e.preventDefault()
    saveProfile(form)
    setSaved(true)
  }

  return (
    <RequirePermission permission="PROFILE">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">الملف الشخصي</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            يجب إكمال هذا الملف قبل {user?.role === 'startup' ? 'نشر المناقصات' : 'التقديم على المناقصات'}.
          </p>
        </div>

        {!isProfileComplete ? (
          <Alert variant="warning" title="الملف غير مكتمل">
            أكمل الحقول واحفظ للمتابعة.
          </Alert>
        ) : null}
        {saved ? (
          <Alert variant="success" title="تم الحفظ">
            تم حفظ الملف بنجاح.
          </Alert>
        ) : null}

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <FormField label="اسم الشركة" id="companyName">
            <input
              id="companyName"
              required
              value={form.companyName}
              onChange={(e) => update('companyName', e.target.value)}
              className={inputClass}
            />
          </FormField>

          <FormField label="المجال / التصنيف" id="categoryId">
            <select
              id="categoryId"
              required
              value={form.categoryId}
              onChange={(e) => update('categoryId', e.target.value)}
              className={inputClass}
            >
              <option value="">اختر التصنيف</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="الموقع الإلكتروني" id="website">
            <input
              id="website"
              type="url"
              value={form.website}
              onChange={(e) => update('website', e.target.value)}
              className={inputClass}
              placeholder="https://"
            />
          </FormField>

          <FormField label="نبذة عن الشركة" id="bio">
            <textarea
              id="bio"
              rows={4}
              required
              value={form.bio}
              onChange={(e) => update('bio', e.target.value)}
              className={inputClass}
            />
          </FormField>

          <FormField label="هاتف التواصل" id="phone">
            <input
              id="phone"
              required
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className={inputClass}
            />
          </FormField>

          <button type="submit" className={btnPrimary}>
            حفظ الملف
          </button>
        </form>
      </div>
    </RequirePermission>
  )
}
