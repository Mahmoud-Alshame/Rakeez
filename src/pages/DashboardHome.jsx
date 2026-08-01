import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/authContext'
import { useData } from '../contexts/dataContext'
import { USER_ROLES } from '../constants/roles'
import { BRAND_NAME } from '../constants/brand'

function StatCard({ title, value, hint }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
      <p className="text-sm font-medium text-stone-500 dark:text-stone-400">{title}</p>
      <p className="mt-2 text-3xl font-bold text-primary dark:text-emerald-400">{value}</p>
      {hint ? <p className="mt-1 text-xs text-stone-400">{hint}</p> : null}
    </div>
  )
}

export default function DashboardHome() {
  const { role, user, isProfileComplete } = useAuth()
  const { stats, getTendersByOwner, getBidsBySupplier, getWonBids, getBidsForTender } = useData()

  const isAdmin = role === USER_ROLES.ADMIN
  const isSupplier = role === USER_ROLES.SUPPLIER
  const isStartup = role === USER_ROLES.STARTUP

  const myTenders = isStartup ? getTendersByOwner(user?.uid) : []
  const myBids = isSupplier ? getBidsBySupplier(user?.uid) : []
  const won = isSupplier ? getWonBids(user?.uid) : []

  const receivedBids = isStartup
    ? myTenders.reduce((n, t) => n + getBidsForTender(t.id).length, 0)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">مرحباً بك</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">نظرة سريعة على نشاطك في {BRAND_NAME}.</p>
      </div>

      {!isAdmin && !isProfileComplete ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          <Link to="/profile" className="font-semibold underline">
            أكمل ملفك الشخصي
          </Link>{' '}
          للوصول الكامل للميزات.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isAdmin && (
          <>
            <StatCard title="المستخدمون" value={stats.usersCount} hint={`${stats.pendingUsers} بانتظار التفعيل`} />
            <StatCard title="مناقصات نشطة" value={stats.activeTenders} />
            <StatCard title="عروض مقدّمة" value={stats.totalBids} />
            <StatCard title="التصنيفات" value={stats.categoriesCount} />
          </>
        )}
        {isStartup && (
          <>
            <StatCard title="مناقصاتي" value={myTenders.length} />
            <StatCard title="عروض مستلمة" value={receivedBids} hint="من صفحة مقارنة العروض" />
            <StatCard title="مُنحت" value={myTenders.filter((t) => t.status === 'awarded' || t.status === 'completed').length} />
          </>
        )}
        {isSupplier && (
          <>
            <StatCard title="عروضي" value={myBids.length} />
            <StatCard title="قيد الانتظار" value={myBids.filter((b) => b.status === 'pending').length} />
            <StatCard title="فوزت بـ" value={won.length} />
          </>
        )}
      </div>
    </div>
  )
}
