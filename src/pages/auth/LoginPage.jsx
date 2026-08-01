import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthShell } from '../../components/auth/AuthShell'
import { Alert } from '../../components/ui/Alert'
import { FormField, btnPrimary, inputClass } from '../../components/ui/FormField'
import { ADMIN_EMAIL } from '../../constants/auth'
import { useAuth } from '../../contexts/authContext'
import { ACCOUNT_STATUS } from '../../constants/auth'

export default function LoginPage() {
  const { login, user, initializing, isActive, isPending } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!initializing && user) {
    if (user.status === ACCOUNT_STATUS.PENDING || isPending) {
      return <Navigate to="/verification-pending" replace />
    }
    if (isActive) return <Navigate to="/dashboard" replace />
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { redirect } = await login({ email, password })
      navigate(redirect, { replace: true })
    } catch (err) {
      setError(err.message || 'فشل تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="تسجيل الدخول" subtitle="أدخل بريدك وكلمة المرور للوصول إلى لوحة التحكم">
      {location.state?.blocked ? (
        <Alert variant="error">تم حظر حسابك. تواصل مع الإدارة.</Alert>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error ? <Alert variant="error">{error}</Alert> : null}

        <FormField label="البريد الإلكتروني" id="email">
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@company.com"
          />
        </FormField>

        <FormField label="كلمة المرور" id="password">
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            autoComplete="current-password"
          />
        </FormField>

        <div className="text-left">
          <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
            نسيت كلمة المرور؟
          </Link>
        </div>

        <button type="submit" disabled={loading} className={btnPrimary + ' w-full py-2.5'}>
          {loading ? 'جاري الدخول…' : 'دخول'}
        </button>
      </form>

      {/* <p className="mt-6 text-xs text-center text-stone-500">
        مدير النظام: <code className="px-1 rounded bg-stone-100">{ADMIN_EMAIL}</code>
      </p> */}
      <p className="mt-2 text-sm text-center text-stone-600">
        ليس لديك حساب؟{' '}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          ابدأ الآن
        </Link>
      </p>
    </AuthShell>
  )
}
