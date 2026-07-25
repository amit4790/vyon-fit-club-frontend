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
import AdminPayments from '../pages/Admin/Payments'
import AdminReports from '../pages/Admin/Reports'
import AdminSettings from '../pages/Admin/Settings'
import Trainer from '../pages/Trainer'
import Member from '../pages/Member'

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
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: '/admin/dashboard',
        element: <Admin />,
      },
      {
        path: '/admin/members',
        element: <AdminMembers />,
      },
      {
        path: '/admin/membership-plans',
        element: <AdminMembershipPlans />,
      },
      {
        path: '/admin/payments',
        element: <AdminPayments />,
      },
      {
        path: '/admin/attendance',
        element: <AdminAttendance />,
      },
      {
        path: '/admin/reports',
        element: <AdminReports />,
      },
      {
        path: '/admin/settings',
        element: <AdminSettings />,
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

export function AppRouter() {
  return <RouterProvider router={router} />
}
