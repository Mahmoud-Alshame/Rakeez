import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthShell } from '../../components/auth/AuthShell'
import { Alert } from '../../components/ui/Alert'
import { FormField, btnPrimary, inputClass } from '../../components/ui/FormField'
import { ROLE_LABELS_AR, USER_ROLES } from '../../constants/roles'
import { useAuth } from '../../contexts/authContext'

const ROLE_OPTIONS = [USER_ROLES.SUPPLIER, USER_ROLES.STARTUP]

export default function RegisterPage() {
  const { register, user, initializing } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState(USER_ROLES.STARTUP)
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!initializing && user) {
    return <Navigate to="/verification-pending" replace />
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('كلمتا المرور غير متطابقتين.')
      return
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.')
      return
    }
    setLoading(true)
    try {
      await register({ role, companyName, email, password })
      navigate('/verification-pending', { replace: true })
    } catch (err) {
      setError(err.message || 'فشل التسجيل')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell wide title="إنشاء حساب جديد" subtitle="اختر نوع حسابك ثم أدخل بيانات شركتك">
      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        {error ? <Alert variant="error">{error}</Alert> : null}

        <div>
          <p className="mb-3 text-sm font-semibold text-stone-700">نوع الحساب</p>
          <RoleGrid>
            {ROLE_OPTIONS.map((r) => (
              <label
                key={r}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                  role === r
                    ? 'border-primary bg-primary-light ring-1 ring-primary'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={role === r}
                  onChange={() => setRole(r)}
                  className="text-primary"
                />
                <span className="text-sm font-medium">{ROLE_LABELS_AR[r]}</span>
              </label>
            ))}
          </RoleGrid>
        </div>

        <FormField label="اسم الشركة" id="company">
          <input
            id="company"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={inputClass}
          />
        </FormField>

        <FormField label="البريد الإلكتروني" id="email">
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
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
            autoComplete="new-password"
          />
        </FormField>

        <FormField label="تأكيد كلمة المرور" id="confirm">
          <input
            id="confirm"
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
            autoComplete="new-password"
          />
        </FormField>

        <button type="submit" disabled={loading} className={btnPrimary + ' w-full py-2.5'}>
          {loading ? 'جاري التسجيل…' : 'إنشاء الحساب'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-600">
        لديك حساب؟{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </AuthShell>
  )
}

function RoleGrid({ children }) {
  return <div className="grid gap-2">{children}</div>
}
