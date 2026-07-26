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
import Trainer from '../pages/Trainer'
import Member from '../pages/Member'
import { AuthService } from '../services/auth'

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
          { path: 'membership-plans', element: <AdminMembershipPlans /> },
          { path: 'subscriptions/:subscriptionId/payment', element: <MembershipPayment /> },
          { path: 'trainers', element: <AdminTrainers /> },
          { path: 'payments', element: <AdminPayments /> },
          { path: 'attendance', element: <AdminAttendance /> },
          { path: 'reports', element: <AdminReports /> },
          { path: 'settings', element: <AdminSettings /> },
          { path: 'profile', element: <Navigate to="/admin/dashboard" replace /> },
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

export function AppRouter() {
  return <RouterProvider router={router} />
}
