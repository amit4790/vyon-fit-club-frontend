/**
 * Router configuration for VYON FIT CLUB
 */

import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom'
import { ScrollToTop } from '../components/ScrollToTop'
import Landing from '../pages/Landing'
import Registration from '../pages/Registration'
import Payment from '../pages/Payment'
import Login from '../pages/Login'
import Admin from '../pages/Admin'
import AdminEnquiries from '../pages/Admin/Enquiries'
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
import AdminBodyAssessmentNew from '../pages/Admin/AdminBodyAssessmentNew'
import AdminBodyAssessmentDetail from '../pages/Admin/AdminBodyAssessmentDetail'
import AdminBodyProgress from '../pages/Admin/AdminBodyProgress'
import AdminTrainerDetails from '../pages/Admin/TrainerDetails'
import Trainer from '../pages/Trainer'
import Member from '../pages/Member'
import GymMembers from '../pages/Gym/Members'
import GymMemberBodyAnalysis from '../pages/Gym/MemberBodyAnalysis'
import GymNewAssessment from '../pages/Gym/NewAssessment'
import GymProgress from '../pages/Gym/Progress'
import GymAssessmentDetail from '../pages/Gym/AssessmentDetail'
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
        element: <Navigate to="/#memberships" replace />,
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
          { path: 'enquiries', element: <AdminEnquiries /> },
          { path: 'members', element: <AdminMembers /> },
          { path: 'members/:memberId', element: <AdminMemberDetails /> },
          { path: 'members/:memberId/body-assessments/new', element: <AdminBodyAssessmentNew /> },
          { path: 'members/:memberId/body-assessments/:assessmentId', element: <AdminBodyAssessmentDetail /> },
          { path: 'members/:memberId/body-analysis/progress', element: <AdminBodyProgress /> },
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
        path: '/gym',
        element: <RequireGymTabletAccess />,
        children: [
          { index: true, element: <Navigate to="members" replace /> },
          { path: 'members', element: <GymMembers /> },
          { path: 'members/:memberId', element: <GymMemberBodyAnalysis /> },
          { path: 'members/:memberId/assessments/new', element: <GymNewAssessment /> },
          { path: 'members/:memberId/assessments/:assessmentId', element: <GymAssessmentDetail /> },
          { path: 'members/:memberId/progress', element: <GymProgress /> },
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

function RequireGymTabletAccess() {
  if (!AuthService.isAuthenticated() || !AuthService.canAccessGymTablet()) {
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
