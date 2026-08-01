import { useState, useEffect } from 'react'
import { BRAND_NAME } from '../../constants/brand'
import { Link, Navigate } from 'react-router-dom'
import { sendEmailVerification } from 'firebase/auth'
import { auth } from '../../services/firebase'
import { AuthShell } from '../../components/auth/AuthShell'
import { Alert } from '../../components/ui/Alert'
import { btnOutline, btnPrimary } from '../../components/ui/FormField'
import { ACCOUNT_STATUS } from '../../constants/auth'
import { useAuth } from '../../contexts/authContext'

export default function VerificationPendingPage() {
  const { user, initializing, logout, isActive, refreshUserFromStore } = useAuth()
  const [resendState, setResendState] = useState('idle') // idle | sending | sent | error

  useEffect(() => {
    refreshUserFromStore()
    // تحديث دوري لاكتشاف: توثيق البريد + تفعيل الحساب من المدير
    const id = setInterval(refreshUserFromStore, 5000)
    return () => clearInterval(id)
  }, [refreshUserFromStore])

  if (!initializing && !user) return <Navigate to="/login" replace />
  if (!initializing && isActive) return <Navigate to="/dashboard" replace />
  if (!initializing && user?.status === ACCOUNT_STATUS.BLOCKED) {
    return <Navigate to="/login" replace />
  }

  const emailVerified = Boolean(user?.emailVerified)

  async function handleResend() {
    if (!auth.currentUser) return
    setResendState('sending')
    try {
      await sendEmailVerification(auth.currentUser)
      setResendState('sent')
    } catch {
      setResendState('error')
    }
  }

  return (
    <AuthShell title="الحساب قيد المراجعة" subtitle={`شكراً لتسجيلك في ${BRAND_NAME}`}>
      {!emailVerified ? (
        <Alert variant="warning">
          لم يتم التحقق من بريدك الإلكتروني بعد. تفقّد صندوق الوارد (وصندوق الرسائل غير
          المرغوبة) لدى <strong>{user?.email}</strong> واضغط على رابط التحقق.
        </Alert>
      ) : (
        <Alert variant="warning">
          حسابك <strong>{user?.companyName || user?.email}</strong> قيد المراجعة من قِبل مدير
          النظام. لن تتمكن من الدخول إلى لوحة التحكم حتى يتم تفعيل حسابك.
        </Alert>
      )}

      <p className="mt-4 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
        هذه الصفحة تتحقق تلقائياً كل بضع ثوانٍ. بمجرد توثيق بريدك وتفعيل حسابك سيتم تحويلك
        مباشرة إلى لوحة التحكم.
      </p>

      {!emailVerified ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendState === 'sending'}
            className={btnPrimary + ' w-full py-2'}
          >
            {resendState === 'sending' ? 'جاري الإرسال…' : 'إعادة إرسال إيميل التحقق'}
          </button>
          {resendState === 'sent' ? (
            <p className="mt-2 text-center text-xs text-emerald-600">تم الإرسال، تفقّد بريدك.</p>
          ) : null}
          {resendState === 'error' ? (
            <p className="mt-2 text-center text-xs text-red-600">
              تعذّر الإرسال، حاول بعد قليل.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 flex gap-2">
        <Link to="/" className={btnOutline + ' flex-1 text-center'}>
          العودة للرئيسية
        </Link>
        <button type="button" onClick={() => logout()} className={btnOutline + ' flex-1'}>
          تسجيل الخروج
        </button>
      </div>
    </AuthShell>
  )
}