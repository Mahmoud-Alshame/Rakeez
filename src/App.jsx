import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './contexts/authContext'
import { RequireAuth } from './components/auth/RequireAuth'
import { DashboardLayout } from './components/layout/DashboardLayout'
import LoginPage from './pages/LoginPage'
import DashboardHome from './pages/DashboardHome'
import UserManagementPage from './pages/UserManagementPage'
import TenderManagementPage from './pages/TenderManagementPage'
import BiddingPage from './pages/BiddingPage'
import MyBidsPage from './pages/MyBidsPage'
import ComparisonPage from './pages/ComparisonPage'
import DisputeReportsPage from './pages/DisputeReportsPage'
import WonTendersPage from './pages/WonTendersPage'

/** مسارات غير المعرفة: توجيه حسب حالة الجلسة */
function CatchAllRedirect() {
  const { user, initializing } = useAuth()
  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }
  return <Navigate to={user ? '/dashboard' : '/login'} replace />
}

/**
 * جذر التطبيق — تعريف كل المسارات والتخطيط المحمي.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="tenders" element={<TenderManagementPage />} />
          <Route path="bidding" element={<BiddingPage />} />
          <Route path="my-bids" element={<MyBidsPage />} />
          <Route path="compare" element={<ComparisonPage />} />
          <Route path="won-tenders" element={<WonTendersPage />} />
          <Route path="disputes" element={<DisputeReportsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<CatchAllRedirect />} />
    </Routes>
  )
}
