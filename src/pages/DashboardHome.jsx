import { useAuth } from '../contexts/authContext'
import { USER_ROLES } from '../constants/roles'

/** بطاقة إحصائية في الصفحة الرئيسية */
function StatCard({ title, value, hint, accent }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-stone-500">{title}</p>
      <p className={`mt-2 text-3xl font-bold ${accent || 'text-stone-900'}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-stone-400">{hint}</p> : null}
    </div>
  )
}

/**
 * الصفحة الرئيسية — مؤشرات تجريبية حسب الدور (مطابقة Use Case: ناشئة تدير مناقصات / مورد يقدّم عروضاً).
 */
export default function DashboardHome() {
  const { role } = useAuth()

  const isAdmin = role === USER_ROLES.ADMIN
  const isSupplier = role === USER_ROLES.SUPPLIER
  const isStartup = role === USER_ROLES.STARTUP

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">مرحباً بك</h1>
        <p className="mt-1 text-sm text-stone-500">
          نظرة سريعة على أهم المؤشرات — البيانات للعرض فقط حتى ربط Firebase.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isAdmin && (
          <>
            <StatCard title="المستخدمون المسجلون" value="128" hint="7 بانتظار الموافقة" accent="text-primary" />
            <StatCard title="المناقصات النشطة" value="34" hint="عبر كل الأدوار" />
            <StatCard title="النزاعات المفتوحة" value="5" hint="2 عاجلة" accent="text-amber-700" />
            <StatCard title="التقارير الشهرية" value="12" hint="جاهزة للتصدير" />
          </>
        )}
        {isSupplier && (
          <>
            <StatCard title="مناقصات متاحة للمشاركة" value="21" hint="بحسب تخصصك وفلاتر البحث" accent="text-primary" />
            <StatCard title="عروض قيد المتابعة" value="5" hint="بانتظار قرار الناشئة" />
            <StatCard title="مناقصات فزت بها" value="7" hint="آخر 12 شهراً" />
            <StatCard title="تبليغات مفتوحة" value="1" hint="قيد المراجعة" accent="text-amber-700" />
          </>
        )}
        {isStartup && (
          <>
            <StatCard title="مناقصاتي المنشورة" value="9" hint="3 تستقبل عروضاً" accent="text-primary" />
            <StatCard title="عروض مستلمة" value="42" hint="عبر كل المناقصات النشطة" />
            <StatCard title="مناقصات مغلقة" value="14" hint="تم اختيار فائز / إغلاق" />
            <StatCard title="نزاعات بحاجة لمتابعة" value="2" hint="مرتبطة بمناقصاتك" accent="text-amber-700" />
          </>
        )}
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-5 text-sm text-stone-600">
        <p className="font-semibold text-stone-800">ملاحظة للمطور</p>
        <p className="mt-2 leading-relaxed">
          استبدل الأرقام الثابتة باستعلامات Firestore بعد تهيئة{' '}
          <code className="rounded bg-stone-100 px-1">src/services/firebase.js</code>.
        </p>
      </div>
    </div>
  )
}
