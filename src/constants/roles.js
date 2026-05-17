/**
 * أنواع الحسابات — مطابقة لفاعلي Use Case + المدير (يُعيَّن إدارياً وليس عبر شاشة التسجيل).
 *
 * - startup = الشركة الناشئة: إدارة المناقصات، إنشاء مناقصة، استعراض العروض، اختيار فائز، إغلاق…
 * - supplier = المورد / شركة الخدمات: استعراض المناقصات المتاحة، تقديم عرض، إدارة العروض، الفوز، تبليغ…
 * - admin = المدير: إدارة الحسابات، النزاعات، التقارير (لا يظهر كخيار في نموذج الدخول التجريدي).
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  SUPPLIER: 'supplier',
  STARTUP: 'startup',
}

/** تسميات عربية لعرضها في الواجهة */
export const ROLE_LABELS_AR = {
  [USER_ROLES.ADMIN]: 'مدير النظام',
  [USER_ROLES.SUPPLIER]: 'مورد / شركة خدمات',
  [USER_ROLES.STARTUP]: 'شركة ناشئة',
}

/**
 * صلاحيات المسارات — محاذاة مع مخطط حالات الاستخدام.
 * المدير يُفترض أنه يرى كل الوظائف للإشراف (تعميم UML شائع)، ويُعرَّف خارج شاشة الدخول العامة.
 */
export const PERMISSIONS = {
  DASHBOARD: [USER_ROLES.ADMIN, USER_ROLES.SUPPLIER, USER_ROLES.STARTUP],
  USER_MANAGEMENT: [USER_ROLES.ADMIN],
  TENDER_MANAGEMENT: [USER_ROLES.ADMIN, USER_ROLES.STARTUP],
  BIDDING_MARKET: [USER_ROLES.ADMIN, USER_ROLES.SUPPLIER],
  MY_BIDS: [USER_ROLES.ADMIN, USER_ROLES.SUPPLIER],
  COMPARISON: [USER_ROLES.ADMIN, USER_ROLES.STARTUP],
  WON_TENDERS: [USER_ROLES.ADMIN, USER_ROLES.SUPPLIER],
  DISPUTES_REPORTS: [USER_ROLES.ADMIN, USER_ROLES.SUPPLIER, USER_ROLES.STARTUP],
}

/**
 * التحقق من أن الدور الحالي يملك صلاحية محددة.
 * @param {string} role
 * @param {keyof typeof PERMISSIONS} permissionKey
 */
export function roleCan(role, permissionKey) {
  const allowed = PERMISSIONS[permissionKey]
  if (!allowed) return false
  return allowed.includes(role)
}
