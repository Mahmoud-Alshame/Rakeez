/** العملة الأساسية للمنصة — الليرة السورية */
export const CURRENCY_LABEL = 'ل.س'
export const CURRENCY_CODE = 'SYP'

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
