import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/authContext'
import { ROLE_LABELS_AR, USER_ROLES } from '../constants/roles'

/**
 * أنواع الحسابات المعروضة في نموذج الدخول — فقط فاعلو Use Case الأساسيون.
 * المدير لا يُختار هنا؛ يُنشأ/يُعيَّن من لوحة الإدارة أو Firebase Custom Claims.
 */
const ROLE_OPTIONS = [USER_ROLES.SUPPLIER, USER_ROLES.STARTUP]

/**
 * صفحة تسجيل الدخول — اختيار نوع الحساب (مورد أو ناشئة) ثم إرسال بيانات تجريبية.
 * لاحقاً: استبدال النموذج بـ Firebase Auth؛ يُجلب دور المدير من الخادم وليس من القائمة.
 */
export default function LoginPage() {
  const { login, user, initializing } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState(USER_ROLES.SUPPLIER)
  const [email, setEmail] = useState('demo@example.com')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)

  if (!initializing && user) {
    return <Navigate to="/dashboard" replace />
  }

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await login({ role, email, displayName })
      navigate('/dashboard', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-light via-surface to-stone-100 p-4 font-sans">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-xl">
        <h1 className="text-center text-xl font-bold text-stone-900">تسجيل الدخول</h1>
        <p className="mt-2 text-center text-sm text-stone-500">نظام إدارة المناقصات والعروض — وضع تجريبي</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <div>
            <p className="mb-3 text-sm font-semibold text-stone-700">نوع الحساب</p>
            <div className="grid gap-2">
              {ROLE_OPTIONS.map((r) => (
                <label
                  key={r}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                    role === r ? 'border-primary bg-primary-light ring-1 ring-primary' : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="text-primary" />
                  <span className="text-sm font-medium text-stone-800">{ROLE_LABELS_AR[r]}</span>
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-stone-500">
              حساب <strong className="text-stone-700">مدير النظام</strong> يُعرَّف من قبل الإدارة أو عبر Firebase (Custom Claims) ولا يظهر في
              قائمة التسجيل/الدخول العامة.
            </p>
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-stone-700">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div>
            <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-stone-700">
              الاسم المعروض (اختياري)
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="يُولّد تلقائياً إن تُرك فارغاً"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-stone-700">
              كلمة المرور (وهمية — لربط Firebase لاحقاً)
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {loading ? 'جاري الدخول…' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  )
}
