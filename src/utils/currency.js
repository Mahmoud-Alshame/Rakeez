/** العملة الأساسية للمنصة — الليرة السورية */
export const CURRENCY_LABEL = 'ل.س'
export const CURRENCY_CODE = 'SYP'

/** سعر الصرف التقريبي: كم ليرة سورية = 1 دولار أمريكي (عدّله حسب الحاجة) */
export const USD_RATE = 15000

const numberFormatter = new Intl.NumberFormat('ar-SY', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  useGrouping: true,
})

/**
 * تنسيق مبلغ بالليرة السورية مع فواصل آلاف واضحة.
 * @param {number|string|null|undefined} amount
 * @param {{ withLabel?: boolean }} [options]
 */
export function formatSYP(amount, options = {}) {
  const { withLabel = true } = options
  if (amount == null || amount === '' || Number.isNaN(Number(amount))) return '—'
  const formatted = numberFormatter.format(Number(amount))
  return withLabel ? `${formatted} ${CURRENCY_LABEL}` : formatted
}

/** نطاق ميزانية: من – إلى */
export function formatSYPRange(min, max) {
  if (min == null && max == null) return '—'
  const a = formatSYP(min, { withLabel: false })
  const b = formatSYP(max, { withLabel: false })
  return `${a} – ${b} ${CURRENCY_LABEL}`
}

/* ============================================================
   تطبيع الأرقام العربية/الفارسية داخل حقول الإدخال (input type="text")
   يحل مشكلة رسالة "يجب إدخال قيمة صحيحة" عند الكتابة بأرقام هندية/عربية
   ============================================================ */

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

/**
 * يحوّل أي أرقام عربية/فارسية داخل النص إلى أرقام لاتينية عادية.
 * يبقي فقط الأرقام ونقطة عشرية واحدة (بيشيل أي حرف أو رمز إضافي).
 */
export function normalizeDigits(input) {
  if (input === null || input === undefined) return ''
  let str = String(input)

  str = str.replace(/[٠-٩]/g, (d) => ARABIC_DIGITS.indexOf(d))
  str = str.replace(/[۰-۹]/g, (d) => PERSIAN_DIGITS.indexOf(d))

  // إزالة أي فاصلة آلاف أو مسافات قد تكون موجودة
  str = str.replace(/[,٬\s]/g, '')

  // السماح فقط بأرقام ونقطة عشرية واحدة
  str = str.replace(/[^0-9.]/g, '')

  return str
}

/**
 * يحوّل النص المُدخل إلى نص رقمي "نظيف" بعد التطبيع، جاهز للتخزين بالـ state.
 * يرجع '' لو الحقل فاضي، حتى نقدر نميّز "فاضي" عن "صفر".
 */
export function toCleanNumberString(input) {
  return normalizeDigits(input)
}

/**
 * تنسيق رقم بفواصل آلاف للعرض المباشر تحت حقل الإدخال (مو داخل الـ input نفسه).
 * مثال: "5000000" → "5,000,000"
 */
export function formatThousands(value) {
  const num = Number(normalizeDigits(value))
  if (!value || Number.isNaN(num)) return ''
  return num.toLocaleString('en-US')
}

/* ============================================================
   تحويل تقريبي بالدولار (للعرض فقط، لا يُستخدم للتخزين)
   ============================================================ */

/**
 * يحوّل مبلغاً بالليرة السورية إلى تقدير بالدولار الأمريكي، منسّق كنص.
 * @param {number|string|null|undefined} sypAmount
 */
export function toUSD(sypAmount) {
  const num = Number(normalizeDigits(sypAmount))
  if (!sypAmount || Number.isNaN(num)) return ''
  return (num / USD_RATE).toLocaleString('en-US', { maximumFractionDigits: 0 })
}

/** نطاق ميزانية تقريبي بالدولار: "$333 - $667" */
export function formatUSDRange(min, max) {
  if (min == null && max == null) return ''
  const a = toUSD(min)
  const b = toUSD(max)
  if (!a && !b) return ''
  return `$${a} - $${b}`
}