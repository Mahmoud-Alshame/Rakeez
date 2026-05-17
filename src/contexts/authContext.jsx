import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { roleCan } from '../constants/roles'

/** مفتاح التخزين المحلي لمحاكاة الجلسة (يُستبدل بـ Firebase Auth persistence) */
/** الإصدار v2: إعادة تعيين الصلاحيات لتطابق Use Case (مورد ↔ ناشئة) */
const MOCK_AUTH_STORAGE_KEY = 'tender_platform_mock_session_v2'

const AuthContext = createContext(null)

/**
 * موفر حالة المصادقة والدور.
 * يُحاكي تسجيل الدخول محلياً — عند ربط Firebase استبدل login/logout بالاستدعاءات الفعلية.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  /** يمنع وميض شاشة تسجيل الدخول أثناء قراءة التخزين */
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MOCK_AUTH_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.uid && parsed?.role) setUser(parsed)
      }
    } catch {
      localStorage.removeItem(MOCK_AUTH_STORAGE_KEY)
    }
    setInitializing(false)
  }, [])

  /**
   * تسجيل دخول تجريبي — لاحقاً: signInWithEmailAndPassword(auth, email, password)
   */
  const login = useCallback(async (payload) => {
    await new Promise((resolve) => setTimeout(resolve, 280))
    const nextUser = {
      uid: `mock_${payload.role}_${Date.now()}`,
      email: payload.email?.trim() || `demo@${payload.role}.local`,
      displayName:
        payload.displayName?.trim() ||
        (payload.role === 'admin'
          ? 'مدير النظام'
          : payload.role === 'supplier'
            ? 'مورد / شركة خدمات (تجريبي)'
            : 'شركة ناشئة (تجريبي)'),
      role: payload.role,
    }
    setUser(nextUser)
    localStorage.setItem(MOCK_AUTH_STORAGE_KEY, JSON.stringify(nextUser))
  }, [])

  /** تسجيل خروج — لاحقاً: signOut(auth) */
  const logout = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 120))
    setUser(null)
    localStorage.removeItem(MOCK_AUTH_STORAGE_KEY)
  }, [])

  /**
   * هل يملك المستخدم الحالي صلاحية مفتاح معيّن؟
   * @param {keyof import('../constants/roles').PERMISSIONS} permissionKey
   */
  const canAccess = useCallback(
    (permissionKey) => {
      if (!user?.role) return false
      return roleCan(user.role, permissionKey)
    },
    [user],
  )

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      initializing,
      login,
      logout,
      canAccess,
      isAuthenticated: Boolean(user),
    }),
    [user, initializing, login, logout, canAccess],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('يجب استخدام useAuth داخل <AuthProvider>')
  }
  return ctx
}
