import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthShell } from '../../components/auth/AuthShell'
import { Alert } from '../../components/ui/Alert'
import { FormField, btnPrimary, inputClass } from '../../components/ui/FormField'
import { useAuth } from '../../contexts/authContext'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      // لا نكشف إن كان البريد غير مسجّل أم لا — رسالة عامة أكثر أماناً
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="نسيت كلمة المرور؟" subtitle="أدخل بريدك وسنرسل رابط إعادة التعيين">
      {sent ? (
        <Alert variant="success">
          إذا كان البريد مسجّلاً، ستصلك رسالة تحتوي رابط إعادة تعيين كلمة المرور. تفقّد صندوق
          الوارد (وصندوق الرسائل غير المرغوبة).
        </Alert>
      ) : (
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
            />
          </FormField>
          <button type="submit" disabled={loading} className={btnPrimary + ' w-full py-2.5'}>
            {loading ? 'جاري الإرسال…' : 'إرسال رابط الاستعادة'}
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="font-semibold text-primary hover:underline">
          العودة لتسجيل الدخول
        </Link>
      </p>
    </AuthShell>
  )
}