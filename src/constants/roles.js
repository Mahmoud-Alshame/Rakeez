/**
 * أنواع الحسابات — admin | supplier | startup
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  SUPPLIER: 'supplier',
  STARTUP: 'startup',
}

export const ROLE_LABELS_AR = {
  [USER_ROLES.ADMIN]: 'مدير النظام',
  [USER_ROLES.SUPPLIER]: 'مورد / شركة خدمات',
  [USER_ROLES.STARTUP]: 'شركة ناشئة',
}

/** صلاحيات المسارات — RBAC */
export const PERMISSIONS = {
  LANDING: [USER_ROLES.ADMIN, USER_ROLES.SUPPLIER, USER_ROLES.STARTUP],
  DASHBOARD: [USER_ROLES.ADMIN, USER_ROLES.SUPPLIER, USER_ROLES.STARTUP],
  PROFILE: [USER_ROLES.SUPPLIER, USER_ROLES.STARTUP],
  USER_MANAGEMENT: [USER_ROLES.ADMIN],
  ADMIN_TENDERS: [USER_ROLES.ADMIN],
  CATEGORIES: [USER_ROLES.ADMIN],
  STARTUP_TENDERS: [USER_ROLES.STARTUP],
  COMPARISON: [USER_ROLES.STARTUP],
  BIDDING_MARKET: [USER_ROLES.SUPPLIER],
  MY_BIDS: [USER_ROLES.SUPPLIER],
  WON_TENDERS: [USER_ROLES.SUPPLIER],
  MESSAGES: [USER_ROLES.SUPPLIER, USER_ROLES.STARTUP],
  DISPUTES: [USER_ROLES.ADMIN],
}

export function roleCan(role, permissionKey) {
  const allowed = PERMISSIONS[permissionKey]
  if (!allowed) return false
  return allowed.includes(role)
}

/** مسارات لوحة التحكم حسب الدور — للتحقق في RequireRole */
export const ROLE_ROUTE_PREFIX = {
  [USER_ROLES.ADMIN]: ['/dashboard', '/users', '/admin'],
  [USER_ROLES.STARTUP]: ['/dashboard', '/profile', '/tenders', '/compare', '/messages'],
  [USER_ROLES.SUPPLIER]: ['/dashboard', '/profile', '/bidding', '/my-bids', '/won-tenders', '/messages'],
}

/** مسارات محمية صريحة لكل دور — تتجاوز أخطاء بادئات المسارات المتشابهة */
export const ROLE_ALLOWED_PATHS = {
  [USER_ROLES.ADMIN]: [
    '/dashboard',
    '/users',
    '/admin/categories',
    '/admin/tenders',
    '/admin/disputes',
  ],
  [USER_ROLES.STARTUP]: ['/dashboard', '/profile', '/tenders', '/compare', '/messages'],
  [USER_ROLES.SUPPLIER]: [
    '/dashboard',
    '/profile',
    '/bidding',
    '/my-bids',
    '/won-tenders',
    '/messages',
  ],
}

function normalizePathname(pathname) {
  const base = (pathname || '/').split('?')[0].split('#')[0]
  if (base.length > 1 && base.endsWith('/')) return base.slice(0, -1)
  return base || '/'
}

export function roleMayAccessPath(role, pathname) {
  if (!role) return false
  const path = normalizePathname(pathname)
  const allowed = ROLE_ALLOWED_PATHS[role] || []
  return allowed.some((p) => path === p || path.startsWith(`${p}/`))
}
