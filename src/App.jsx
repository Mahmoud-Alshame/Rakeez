import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './components/auth/RequireAuth'
import { RequireRole } from './components/auth/RequireRole'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { useAuth } from './contexts/authContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerificationPendingPage from './pages/auth/VerificationPendingPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import DashboardHome from './pages/DashboardHome'
import ProfilePage from './pages/ProfilePage'
import UserManagementPage from './pages/UserManagementPage'
import CategoriesPage from './pages/admin/CategoriesPage'
import AdminTendersPage from './pages/admin/AdminTendersPage'
import DisputeReportsPage from './pages/admin/DisputeReportsPage'
import StartupTendersPage from './pages/startup/StartupTendersPage'
import CompareBidsPage from './pages/startup/CompareBidsPage'
import BrowseTendersPage from './pages/supplier/BrowseTendersPage'
import MyBidsPage from './pages/supplier/MyBidsPage'
import WonTendersPage from './pages/supplier/WonTendersPage'
import MessagesPage from './pages/MessagesPage'
import { BootLoader } from './components/ui/BootLoader'

function CatchAllRedirect() {
  const { user, initializing, isActive, isPending } = useAuth()
  if (initializing) return <BootLoader />
  if (!user) return <Navigate to="/" replace />
  if (isPending) return <Navigate to="/verification-pending" replace />
  if (isActive) return <Navigate to="/dashboard" replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verification-pending" element={<VerificationPendingPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<RequireRole />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/admin/categories" element={<CategoriesPage />} />
            <Route path="/admin/tenders" element={<AdminTendersPage />} />
            <Route path="/admin/disputes" element={<DisputeReportsPage />} />
            <Route path="/tenders" element={<StartupTendersPage />} />
            <Route path="/compare" element={<CompareBidsPage />} />
            <Route path="/compare/:tenderId" element={<CompareBidsPage />} />
            <Route path="/bidding" element={<BrowseTendersPage />} />
            <Route path="/my-bids" element={<MyBidsPage />} />
            <Route path="/won-tenders" element={<WonTendersPage />} />
            <Route path="/messages" element={<MessagesPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<CatchAllRedirect />} />
    </Routes>
  )
}
