/**
 * Router configuration for VYON FIT CLUB
 */

import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { ScrollToTop } from '../components/ScrollToTop'
import Landing from '../pages/Landing'
import Registration from '../pages/Registration'
import Memberships from '../pages/Memberships'
import Payment from '../pages/Payment'
import Login from '../pages/Login'
import Admin from '../pages/Admin'
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
        element: <Admin />,
      },
      {
        path: '/admin/dashboard',
        element: <Admin />,
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
