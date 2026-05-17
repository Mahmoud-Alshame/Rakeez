import { PERMISSIONS, USER_ROLES } from '../constants/roles'

/**
 * عناصر القائمة الجانبية — تُفلتر تلقائياً حسب PERMISSIONS لكل دور.
 */

const ALL_NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'لوحة التحكم',
    path: '/dashboard',
    permission: 'DASHBOARD',
    icon: 'home',
  },
  {
    id: 'users',
    label: 'إدارة الحسابات',
    path: '/users',
    permission: 'USER_MANAGEMENT',
    icon: 'users',
  },
  {
    id: 'tenders',
    label: 'إدارة المناقصات',
    path: '/tenders',
    permission: 'TENDER_MANAGEMENT',
    icon: 'file',
  },
  {
    id: 'bidding',
    label: 'المناقصات المتاحة',
    path: '/bidding',
    permission: 'BIDDING_MARKET',
    icon: 'search',
  },
  {
    id: 'my-bids',
    label: 'إدارة العروض',
    path: '/my-bids',
    permission: 'MY_BIDS',
    icon: 'send',
  },
  {
    id: 'won',
    label: 'المناقصات الفائز بها',
    path: '/won-tenders',
    permission: 'WON_TENDERS',
    icon: 'trophy',
  },
  {
    id: 'compare',
    label: 'مقارنة العروض',
    path: '/compare',
    permission: 'COMPARISON',
    icon: 'columns',
  },
  {
    id: 'disputes',
    label: 'النزاعات والتبليغات',
    path: '/disputes',
    permission: 'DISPUTES_REPORTS',
    icon: 'alert',
  },
]

/**
 * إرجاع عناصر القائمة المناسبة لدور المستخدم.
 * @param {string | null} role
 */
export function getNavItemsForRole(role) {
  if (!role) return []
  return ALL_NAV_ITEMS.filter((item) =>
    PERMISSIONS[item.permission]?.includes(role),
  )
}

/** المسار الافتراضي بعد تسجيل الدخول */
export function getDefaultHomePath(role) {
  if (role === USER_ROLES.ADMIN) return '/dashboard'
  if (role === USER_ROLES.SUPPLIER) return '/dashboard'
  if (role === USER_ROLES.STARTUP) return '/dashboard'
  return '/login'
}
