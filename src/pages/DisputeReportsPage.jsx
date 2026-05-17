import { useState } from 'react'
import { useAuth } from '../contexts/authContext'
import { USER_ROLES } from '../constants/roles'
import { RequirePermission } from '../components/auth/RequirePermission'
import { Link } from 'react-router-dom'

/**
 * النزاعات والتبليغات — حسب Use Case: المدير يرى كل شيء؛ الناشئة على مناقصاتها؛ المورد على عروضه.
 */
export default function DisputeReportsPage() {
  const { role } = useAuth()
  const [tab, setTab] = useState('disputes')

  const isAdmin = role === USER_ROLES.ADMIN
  const isSupplier = role === USER_ROLES.SUPPLIER
  const isStartup = role === USER_ROLES.STARTUP

  return (
    <RequirePermission permission="DISPUTES_REPORTS">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">النزاعات والتبليغات</h1>
          <p className="mt-1 text-sm text-stone-500">
            {isAdmin && 'إدارة النزاعات والتقارير والإحصائيات على مستوى النظام (المدير).'}
            {isSupplier && 'تقديم تبليغ ومتابعة النزاعات المرتبطة بالعروض التي قدّمتها (المورد).'}
            {isStartup && 'نزاعات وتبليغات مرتبطة بالمناقصات التي تنشرها ومتابعة النشاط (الشركة الناشئة).'}
          </p>
        </div>

        {isAdmin && (
          <div className="flex gap-2 border-b border-stone-200">
            {[
              { id: 'disputes', label: 'إدارة النزاعات' },
              { id: 'reports', label: 'التقارير والإحصائيات' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
                  tab === t.id ? 'border-primary text-primary-dark' : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          {((isAdmin && tab === 'disputes') || isStartup) && (
            <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-stone-900">نزاعات على مناقصاتك</h2>
              <p className="mt-1 text-xs text-stone-500">Use Case: إدارة النزاعات من منظور المناقصة المنشورة.</p>
              <ul className="mt-4 space-y-3 text-sm text-stone-600">
                <li className="flex justify-between rounded-lg bg-amber-50 px-3 py-2">
                  <span>خلاف على موعد التسليم — مناقصة TND-004</span>
                  <span className="text-xs font-medium text-amber-800">معلق</span>
                </li>
                <li className="flex justify-between rounded-lg bg-stone-50 px-3 py-2">
                  <span>طلب توضيح شروط فنية — TND-001</span>
                  <span className="text-xs font-medium text-stone-500">قيد المراجعة</span>
                </li>
              </ul>
            </section>
          )}

          {((isAdmin && tab === 'reports') || isStartup) && (
            <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-stone-900">{isStartup ? 'تبليغاتك وتقارير النشاط' : 'التقارير والإحصائيات'}</h2>
              <ul className="mt-4 space-y-3 text-sm text-stone-600">
                <li className="rounded-lg border border-stone-100 px-3 py-2">تقرير مناقصاتك المنشورة — الربع الحالي (PDF)</li>
                <li className="rounded-lg border border-stone-100 px-3 py-2">إحصائيات العروض المستلمة — تصدير Excel</li>
                {isStartup && (
                  <li className="rounded-lg border border-primary/20 bg-primary-light/50 px-3 py-2 text-primary-dark">
                    تبليغ #9 — شكوى على مستندات مرفقة — قيد المعالجة
                  </li>
                )}
              </ul>
            </section>
          )}

          {isSupplier && (
            <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="text-lg font-bold text-stone-900">تبليغاتي ونزاعات العروض</h2>
              <p className="mt-1 text-sm text-stone-500">
                Use Case: تقديم تبليغ — ومتابعة أي نزاع يخص عرضاً قدّمته على مناقصة ناشئة.
              </p>
              <ul className="mt-4 space-y-3 text-sm text-stone-600">
                <li className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-stone-50 px-3 py-2">
                  <span>تبليغ: تأخر إشعار بقرار العرض — TND-002</span>
                  <span className="text-xs font-medium text-primary-dark">مُرسل</span>
                </li>
                <li className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-amber-50 px-3 py-2">
                  <span>نزاع: اختلاف على تفسير السعر الإجمالي</span>
                  <span className="text-xs font-medium text-amber-800">مفتوح</span>
                </li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  to="/my-bids"
                  className="inline-flex rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-dark"
                >
                  الانتقال إلى إدارة العروض
                </Link>
                <Link
                  to="/won-tenders"
                  className="inline-flex rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
                >
                  المناقصات الفائز بها
                </Link>
              </div>
            </section>
          )}
        </div>
      </div>
    </RequirePermission>
  )
}
