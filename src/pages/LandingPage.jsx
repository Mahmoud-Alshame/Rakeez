import { Link } from 'react-router-dom'
import { BRAND_FULL, BRAND_NAME, BRAND_TAGLINE } from '../constants/brand'
import { Navbar } from '../components/layout/Navbar'
import { useData } from '../contexts/dataContext'
import { btnOutline, btnPrimary } from '../components/ui/FormField'

const STEPS = [
  { n: '01', title: 'إنشاء الحساب', desc: 'سجّل كشركة ناشئة أو مورد وانتظر تفعيل المدير لحسابك.' },
  { n: '02', title: 'إكمال الملف', desc: 'أكمل بيانات شركتك واختر التصنيف المناسب من قائمة المدير.' },
  { n: '03', title: 'النشر أو التقديم', desc: 'الناشئة تنشر مناقصات؛ المورد يقدّم عروضاً متنافسة.' },
  { n: '04', title: 'المقارنة والفوز', desc: 'قارن العروض، اختر الفائز، وتواصل عبر نظام الرسائل.' },
]

const AUDIENCES = [
  {
    title: 'الشركات الناشئة',
    desc: 'انشر مناقصاتك، استقبل عروض الموردين، وقارنها لاختيار الأنسب لمشروعك.',
    icon: '🚀',
  },
  {
    title: 'مزودو الخدمة والموردون',
    desc: 'استعرض الفرص المتوافقة مع تخصصك، قدّم عروضاً احترافية، وتابع فوزك بالمناقصات.',
    icon: '🤝',
  },
]

const FAQ = [
  {
    q: 'كيف يتم تفعيل الحساب؟',
    a: 'بعد التسجيل يراجع المدير بياناتك ويُفعّل الحساب. لن تصل للوحة التحكم قبل التفعيل.',
  },
  {
    q: 'هل يمكن نشر مناقصة دون إكمال الملف؟',
    a: 'لا. يجب على الشركة الناشئة إكمال الملف الشخصي وحفظه أولاً.',
  },
  {
    q: 'متى تُفعَّل صفحة الرسائل؟',
    a: 'بعد اختيار الشركة الناشئة للمورد الفائز في مناقصة معيّنة.',
  },
]

export default function LandingPage() {
  const { stats } = useData()

  return (
    <div className="min-h-screen font-sans transition-colors duration-300 bg-surface text-stone-800 dark:bg-stone-950 dark:text-stone-100">
      <Navbar />

      <section className="relative overflow-hidden border-b border-stone-200 bg-gradient-to-bl from-primary-light via-white to-surface dark:border-stone-800 dark:from-emerald-950/50 dark:via-stone-900 dark:to-stone-950">
        <div className="grid max-w-6xl gap-10 px-4 py-16 mx-auto md:grid-cols-2 md:px-6 md:py-24">
          <div>
            <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-primary-light text-primary-dark dark:bg-emerald-950/80 dark:text-emerald-300">
              {BRAND_NAME} — عربية بالكامل
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-stone-900 dark:text-stone-50 md:text-5xl">
              {BRAND_TAGLINE}
              <span className="block mt-4 text-primary dark:text-emerald-400">باحترافية وشفافية</span>
            </h1>
            <p className="max-w-lg mt-5 text-base leading-relaxed text-stone-600 dark:text-stone-400">
              {BRAND_NAME} يربط الشركات الناشئة بمزودي الخدمات: نشر، تقديم، مقارنة، واختيار الفائز
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/register" className={btnPrimary + ' px-6 py-3'}>
                ابدأ الآن مجاناً
              </Link>
              <Link to="/login" className={btnOutline + ' px-6 py-3'}>
                تسجيل الدخول
              </Link>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="w-full max-w-md p-6 bg-white border shadow-xl rounded-3xl border-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:shadow-stone-950/50">
              <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">لوحة معاينة</p>
              <div className="mt-4 space-y-3">
                {['مناقصة تطوير تطبيق', 'توريد معدات مكتبية', 'حملة تسويق رقمي'].map((t) => (
                  <div
                    key={t}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-muted dark:bg-stone-800/80"
                  >
                    <span className="text-sm font-medium text-stone-800 dark:text-stone-200">{t}</span>
                    <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs text-primary-dark dark:bg-emerald-950 dark:text-emerald-300">
                      مفتوحة
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="stats" className="bg-white border-b border-stone-200 py-14 dark:border-stone-800 dark:bg-stone-900">
        <div className="grid max-w-6xl gap-6 px-4 mx-auto sm:grid-cols-2 md:grid-cols-4 md:px-6">
          {[
            { label: 'مستخدمون مسجّلون', value: stats.usersCount || '—' },
            { label: 'مناقصات نشطة', value: stats.activeTenders || '—' },
            { label: 'عروض مقدّمة', value: stats.totalBids || '—' },
            { label: 'تصنيفات', value: stats.categoriesCount || '—' },
          ].map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </section>

      <section id="how" className="py-16 bg-surface dark:bg-stone-950">
        <div className="max-w-6xl px-4 mx-auto md:px-6">
          <h2 className="text-3xl font-bold text-center text-stone-900 dark:text-stone-100">كيف يعمل النظام؟</h2>
          <p className="max-w-xl mx-auto mt-2 text-sm text-center text-stone-500 dark:text-stone-400">
            أربع خطوات من التسجيل حتى إتمام المشروع
          </p>
          <div className="grid gap-6 mt-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <article
                key={step.n}
                className="p-6 transition bg-white border shadow-sm rounded-2xl border-stone-200 hover:border-primary/40 dark:border-stone-700 dark:bg-stone-900 dark:hover:border-emerald-600/50"
              >
                <span className="text-2xl font-bold text-primary dark:text-emerald-400">{step.n}</span>
                <h3 className="mt-3 font-bold text-stone-900 dark:text-stone-100">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">{step.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="audience" className="py-16 bg-white border-y border-stone-200 dark:border-stone-800 dark:bg-stone-900">
        <div className="max-w-6xl px-4 mx-auto md:px-6">
          <h2 className="text-3xl font-bold text-center text-stone-900 dark:text-stone-100">الفئات المستهدفة</h2>
          <AudienceGrid items={AUDIENCES} />
        </div>
      </section>

      <section id="faq" className="py-16 bg-surface dark:bg-stone-950">
        <div className="max-w-3xl px-4 mx-auto md:px-6">
          <h2 className="text-3xl font-bold text-center text-stone-900 dark:text-stone-100">الأسئلة الشائعة</h2>
          <div className="mt-8 space-y-4">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="px-5 py-4 bg-white border group rounded-xl border-stone-200 open:ring-1 open:ring-primary/30 dark:border-stone-700 dark:bg-stone-900 dark:open:ring-emerald-500/30"
              >
                <summary className="font-semibold cursor-pointer text-stone-900 marker:content-none dark:text-stone-100">
                  {item.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 text-sm text-center border-t border-stone-800 bg-stone-900 text-stone-400 dark:border-stone-700 dark:bg-stone-950">
        <p>© {new Date().getFullYear()} {BRAND_FULL}</p>
      </footer>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="p-6 text-center border rounded-2xl border-stone-200 bg-surface-muted dark:border-stone-700 dark:bg-stone-800/60">
      <p className="text-3xl font-bold text-primary dark:text-emerald-400">{value}</p>
      <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{label}</p>
    </div>
  )
}

function AudienceGrid({ items }) {
  return (
    <div className="grid gap-6 mt-10 md:grid-cols-2">
      {items.map((a) => (
        <article
          key={a.title}
          className="p-8 bg-white border shadow-sm rounded-2xl border-stone-200 dark:border-stone-700 dark:bg-stone-900"
        >
          <span className="text-4xl">{a.icon}</span>
          <h3 className="mt-4 text-xl font-bold text-stone-900 dark:text-stone-100">{a.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">{a.desc}</p>
        </article>
      ))}
    </div>
  )
}
