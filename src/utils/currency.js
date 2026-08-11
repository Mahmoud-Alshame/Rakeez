/* ============================================================
   العملات المدعومة بالمنصة — الشركة الناشئة تختار عملة كل مناقصة
   وتُورَث تلقائياً لكل عرض يُقدَّم عليها
   ============================================================ */

export const CURRENCIES = {
  SYP: { code: 'SYP', label: 'الليرة السورية', symbol: 'ل.س' },
  USD: { code: 'USD', label: 'الدولار الأمريكي', symbol: '$' },
}

export const DEFAULT_CURRENCY = 'SYP'

function getCurrencyMeta(currency) {
  return CURRENCIES[currency] || CURRENCIES[DEFAULT_CURRENCY]
}

export function getCurrencySymbol(currency) {
  return getCurrencyMeta(currency).symbol
}

export function getCurrencyLabel(currency) {
  return getCurrencyMeta(currency).label
}

const arFormatter = new Intl.NumberFormat('ar-SY', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  useGrouping: true,
})

const enFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  useGrouping: true,
})

/**
 * تنسيق مبلغ بأي عملة مدعومة مع فواصل آلاف واضحة ورمز العملة.
 * @param {number|string|null|undefined} amount
 * @param {'SYP'|'USD'} [currency]
 * @param {{ withLabel?: boolean }} [options]
 */
export function formatMoney(amount, currency = DEFAULT_CURRENCY, options = {}) {
  const { withLabel = true } = options
  if (amount == null || amount === '' || Number.isNaN(Number(amount))) return '—'
  const meta = getCurrencyMeta(currency)
  const formatted =
    currency === 'USD' ? enFormatter.format(Number(amount)) : arFormatter.format(Number(amount))
  if (!withLabel) return formatted
  return currency === 'USD' ? `${meta.symbol}${formatted}` : `${formatted} ${meta.symbol}`
}

/** نطاق ميزانية: من – إلى، بنفس عملة المناقصة */
export function formatMoneyRange(min, max, currency = DEFAULT_CURRENCY) {
  if (min == null && max == null) return '—'
  const meta = getCurrencyMeta(currency)
  const a = formatMoney(min, currency, { withLabel: false })
  const b = formatMoney(max, currency, { withLabel: false })
  return currency === 'USD' ? `${meta.symbol}${a} – ${meta.symbol}${b}` : `${a} – ${b} ${meta.symbol}`
}

/* ============================================================
   دوال متوافقة مع الكود القديم (يُفضَّل استخدام formatMoney الجديدة،
   بس هذول موجودين لأي مكان تاني بالمشروع لسا بيستدعي الاسم القديم)
   ============================================================ */

export const CURRENCY_LABEL = CURRENCIES.SYP.symbol
export const CURRENCY_CODE = CURRENCIES.SYP.code

export function formatSYP(amount, options = {}) {
  return formatMoney(amount, 'SYP', options)
}

export function formatSYPRange(min, max) {
  return formatMoneyRange(min, max, 'SYP')
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
 * تنسيق رقم بفواصل آلاف للعرض المباشر (بدون رمز عملة)، مفيد لأي عرض عام.
 * مثال: "5000000" → "5,000,000"
 */
export function formatThousands(value) {
  const num = Number(normalizeDigits(value))
  if (!value || Number.isNaN(num)) return ''
  return num.toLocaleString('en-US')
}