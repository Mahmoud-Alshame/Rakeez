import { PERMISSIONS } from '../constants/roles'

const ALL_NAV_ITEMS = [
  {
    id: 'landing',
    label: 'الصفحة الرئيسية',
    path: '/',
    permission: 'LANDING',
    icon: 'landing',
  },
  { id: 'dashboard', label: 'لوحة التحكم', path: '/dashboard', permission: 'DASHBOARD', icon: 'dashboard' },
  { id: 'profile', label: 'الملف الشخصي', path: '/profile', permission: 'PROFILE', icon: 'user' },
  { id: 'users', label: 'إدارة الحسابات', path: '/users', permission: 'USER_MANAGEMENT', icon: 'users' },
  { id: 'categories', label: 'التصنيفات', path: '/admin/categories', permission: 'CATEGORIES', icon: 'tag' },
  {
    id: 'admin-tenders',
    label: 'إدارة المناقصات',
    path: '/admin/tenders',
    permission: 'ADMIN_TENDERS',
    icon: 'file',
  },
  {
    id: 'startup-tenders',
    label: 'مناقصاتي',
    path: '/tenders',
    permission: 'STARTUP_TENDERS',
    icon: 'file',
  },
  { id: 'compare', label: 'مقارنة العروض', path: '/compare', permission: 'COMPARISON', icon: 'columns' },
  { id: 'bidding', label: 'المناقصات المتاحة', path: '/bidding', permission: 'BIDDING_MARKET', icon: 'search' },
  { id: 'my-bids', label: 'عروضي', path: '/my-bids', permission: 'MY_BIDS', icon: 'send' },
  { id: 'won', label: 'الفوز بالمناقصات', path: '/won-tenders', permission: 'WON_TENDERS', icon: 'trophy' },
  { id: 'messages', label: 'الرسائل', path: '/messages', permission: 'MESSAGES', icon: 'chat' },
  {
    id: 'disputes',
    label: 'إدارة النزاعات',
    path: '/admin/disputes',
    permission: 'DISPUTES',
    icon: 'shield',
  },
]

export function getNavItemsForRole(role) {
  if (!role) return []
  return ALL_NAV_ITEMS.filter((item) => PERMISSIONS[item.permission]?.includes(role))
}
