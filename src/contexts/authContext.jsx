import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import { ACCOUNT_STATUS, ADMIN_EMAIL } from '../constants/auth'
import { roleCan } from '../constants/roles'
import { USER_ROLES } from '../constants/roles'

const AuthContext = createContext(null)

function isAdminEmail(email) {
  return email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()
}

/** يتحقق من اكتمال الملف من بيانات المستخدم */
function computeProfileComplete(user) {
  if (!user) return false
  if (user.role === USER_ROLES.ADMIN) return true
  if (user.profileComplete) return true
  const p = user.profile || {}
  return Boolean(p.companyName?.trim() && p.categoryId && p.bio?.trim() && p.phone?.trim())
}

/** يمنع إعادة setState إذا لم تتغير بيانات الجلسة فعلياً */
function sessionUsersEqual(a, b) {
  if (a === b) return true
  if (!a || !b || a.uid !== b.uid) return false
  return (
    a.status === b.status &&
    a.profileComplete === b.profileComplete &&
    a.displayName === b.displayName &&
    a.companyName === b.companyName &&
    a.emailVerified === b.emailVerified &&
    JSON.stringify(a.profile ?? {}) === JSON.stringify(b.profile ?? {})
  )
}

/** يترجم أكواد أخطاء Firebase Auth لرسائل عربية مفهومة */
function mapFirebaseAuthError(error) {
  const code = error?.code || ''
  switch (code) {
    case 'auth/email-already-in-use':
      return 'البريد الإلكتروني مسجّل مسبقاً.'
    case 'auth/invalid-email':
      return 'صيغة البريد الإلكتروني غير صحيحة.'
    case 'auth/weak-password':
      return 'كلمة المرور ضعيفة جداً (6 أحرف على الأقل).'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'البريد أو كلمة المرور غير صحيحة.'
    case 'auth/too-many-requests':
      return 'محاولات كثيرة، حاول لاحقاً.'
    default:
      return 'حدث خطأ غير متوقع. حاول مرة أخرى.'
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  // يستمع لأي تغيّر بحالة تسجيل الدخول — كل المستخدمين (بمن فيهم المدير)
  // بيُقرأوا بنفس الطريقة من وثيقة users/{uid} في Firestore.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setInitializing(false)
        return
      }

      try {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (snap.exists()) {
          const data = snap.data()
          setUser({
            uid: firebaseUser.uid,
            ...data,
            emailVerified: firebaseUser.emailVerified,
            profileComplete: computeProfileComplete(data),
          })
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      }
      setInitializing(false)
    })

    return unsubscribe
  }, [])

  /**
   * تسجيل حساب جديد عبر Firebase Auth + إنشاء وثيقة المستخدم في Firestore
   */
  const register = useCallback(async ({ role, companyName, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase()

    if (isAdminEmail(normalizedEmail)) {
      throw new Error('لا يمكن التسجيل ببريد المدير. استخدم تسجيل الدخول.')
    }

    let credential
    try {
      credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password)
    } catch (error) {
      throw new Error(mapFirebaseAuthError(error))
    }

    await sendEmailVerification(credential.user)

    const record = {
      email: normalizedEmail,
      role,
      companyName: companyName.trim(),
      displayName: companyName.trim(),
      status: ACCOUNT_STATUS.PENDING,
      profileComplete: false,
      profile: {},
      createdAt: new Date().toISOString(),
    }

    await setDoc(doc(db, 'users', credential.user.uid), record)

    return { uid: credential.user.uid, ...record }
  }, [])

  /**
   * تسجيل الدخول — نفس المسار لكل المستخدمين، المدير معفى فقط من شرط
   * توثيق البريد وحالة الانتظار (لأنه دائماً "نشط" بحكم دوره).
   */
  const login = useCallback(async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase()

    let credential
    try {
      credential = await signInWithEmailAndPassword(auth, normalizedEmail, password)
    } catch (error) {
      throw new Error(mapFirebaseAuthError(error))
    }

    const snap = await getDoc(doc(db, 'users', credential.user.uid))
    if (!snap.exists()) {
      await signOut(auth)
      throw new Error('لم يتم العثور على بيانات هذا الحساب.')
    }

    const data = snap.data()

    if (data.status === ACCOUNT_STATUS.BLOCKED) {
      await signOut(auth)
      throw new Error('تم حظر حسابك. تواصل مع الإدارة.')
    }

    const foundUser = { uid: credential.user.uid, ...data, emailVerified: credential.user.emailVerified }

    if (data.role === USER_ROLES.ADMIN) {
      return { user: foundUser, redirect: '/dashboard' }
    }

    if (!credential.user.emailVerified || data.status === ACCOUNT_STATUS.PENDING) {
      return { user: foundUser, redirect: '/verification-pending' }
    }

    return { user: foundUser, redirect: '/dashboard' }
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])

  /** إرسال إيميل استعادة كلمة المرور — يعمل لأي مستخدم بمن فيهم المدير */
  const resetPassword = useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase())
    } catch (error) {
      throw new Error(mapFirebaseAuthError(error))
    }
  }, [])

  const saveProfile = useCallback(
    async (profile) => {
      if (!user?.uid || user.role === USER_ROLES.ADMIN) return
      const updatedFields = {
        profile: { ...user.profile, ...profile },
        profileComplete: true,
        displayName: profile.companyName || user.displayName,
      }
      await updateDoc(doc(db, 'users', user.uid), updatedFields)
      setUser((prev) => ({ ...prev, ...updatedFields }))
    },
    [user],
  )

  /** يعيد التحقق من emailVerified + يجلب أحدث بيانات المستخدم من Firestore */
  const refreshUserFromStore = useCallback(async () => {
    const current = auth.currentUser
    if (!current) return

    await current.reload()

    const snap = await getDoc(doc(db, 'users', current.uid))
    if (!snap.exists()) return

    const data = snap.data()
    setUser((prev) => {
      const merged = { ...prev, ...data, emailVerified: current.emailVerified }
      return sessionUsersEqual(prev, merged) ? prev : merged
    })
  }, [])

  const activateUser = useCallback(async (uid) => {
    await updateDoc(doc(db, 'users', uid), { status: ACCOUNT_STATUS.ACTIVE })
  }, [])

  const blockUser = useCallback(async (uid) => {
    await updateDoc(doc(db, 'users', uid), { status: ACCOUNT_STATUS.BLOCKED })
  }, [])

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
      status: user?.status ?? null,
      initializing,
      login,
      register,
      logout,
      resetPassword,
      saveProfile,
      activateUser,
      blockUser,
      refreshUserFromStore,
      canAccess,
      isAuthenticated: Boolean(user),
      isProfileComplete: computeProfileComplete(user),
      isActive:
        user?.role === USER_ROLES.ADMIN ||
        (user?.status === ACCOUNT_STATUS.ACTIVE && user?.emailVerified === true),
      isPending: user?.status === ACCOUNT_STATUS.PENDING,
    }),
    [
      user,
      initializing,
      login,
      register,
      logout,
      resetPassword,
      saveProfile,
      activateUser,
      blockUser,
      refreshUserFromStore,
      canAccess,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('يجب استخدام useAuth داخل <AuthProvider>')
  return ctx
}