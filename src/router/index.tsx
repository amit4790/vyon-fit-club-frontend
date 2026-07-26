/**
 * Router configuration for VYON FIT CLUB
 */

import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom'
import { ScrollToTop } from '../components/ScrollToTop'
import Landing from '../pages/Landing'
import Registration from '../pages/Registration'
import Memberships from '../pages/Memberships'
import Payment from '../pages/Payment'
import Login from '../pages/Login'
import Admin from '../pages/Admin'
import AdminAttendance from '../pages/Admin/Attendance'
import AdminMembers from '../pages/Admin/Members'
import AdminMembershipPlans from '../pages/Admin/MembershipPlans'
import MembershipPayment from '../pages/Admin/MembershipPayment'
import AdminPayments from '../pages/Admin/Payments'
import AdminReports from '../pages/Admin/Reports'
import AdminSettings from '../pages/Admin/Settings'
import AdminTrainers from '../pages/Admin/Trainers'
import AdminProfile from '../pages/Admin/Profile'
import AdminUsers from '../pages/Admin/Admins'
import AdminMemberDetails from '../pages/Admin/MemberDetails'
import AdminTrainerDetails from '../pages/Admin/TrainerDetails'
import Trainer from '../pages/Trainer'
import Member from '../pages/Member'
import { AuthService } from '../services/auth'
import { USER_ROLES } from '../auth/roles'

const router = createBrowserRouter([
  {
    element: <ScrollToTopLayout />,
    children: [
      {
        path: '/',
        element: <Landing />,
      },
      {
        path: '/register',
        element: <Registration />,
      },
      {
        path: '/memberships',
        element: <Memberships />,
      },
      {
        path: '/payment',
        element: <Payment />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/admin',
        element: <RequireAdminAccess />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <Admin /> },
          { path: 'members', element: <AdminMembers /> },
          { path: 'members/:memberId', element: <AdminMemberDetails /> },
          { path: 'membership-plans', element: <AdminMembershipPlans /> },
          { path: 'subscriptions/:subscriptionId/payment', element: <MembershipPayment /> },
          { path: 'trainers', element: <AdminTrainers /> },
          { path: 'trainers/:trainerId', element: <AdminTrainerDetails /> },
          { path: 'payments', element: <AdminPayments /> },
          { path: 'attendance', element: <AdminAttendance /> },
          { path: 'reports', element: <AdminReports /> },
          { path: 'admins', element: <RequireSuperAdminAccess><AdminUsers /></RequireSuperAdminAccess> },
          { path: 'settings', element: <RequireSuperAdminAccess><AdminSettings /></RequireSuperAdminAccess> },
          { path: 'profile', element: <AdminProfile /> },
          { path: 'change-password', element: <Navigate to="/admin/dashboard" replace /> },
        ],
      },
      {
        path: '/trainer',
        element: <Trainer />,
      },
      {
        path: '/trainer/dashboard',
        element: <Trainer />,
      },
      {
        path: '/member',
        element: <Member />,
      },
      {
        path: '/member/dashboard',
        element: <Member />,
      },
    ],
  },
])

function ScrollToTopLayout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  )
}

function RequireAdminAccess() {
  if (!AuthService.isAuthenticated() || !AuthService.canAccessAdmin()) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

function RequireSuperAdminAccess({ children }: { children: JSX.Element }) {
  if (!AuthService.isAuthenticated() || AuthService.getUserRole() !== USER_ROLES.SUPER_ADMIN) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return children
}

export function AppRouter() {
  return <RouterProvider router={router} />
}
