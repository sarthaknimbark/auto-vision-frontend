import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AppLayout } from './layouts/app-layout'
import { AuthProvider } from './context/auth-context'

const DashboardPage = lazy(async () =>
  import('./pages/dashboard-page').then((module) => ({ default: module.DashboardPage })),
)
const UploadPage = lazy(async () =>
  import('./pages/upload-page').then((module) => ({ default: module.UploadPage })),
)
const ResultPage = lazy(async () =>
  import('./pages/result-page').then((module) => ({ default: module.ResultPage })),
)
const LoginPage = lazy(async () =>
  import('./pages/login-page').then((module) => ({ default: module.LoginPage })),
)
const SignupPage = lazy(async () =>
  import('./pages/signup-page').then((module) => ({ default: module.SignupPage })),
)
const HistoryPage = lazy(async () =>
  import('./pages/history-page').then((module) => ({ default: module.HistoryPage })),
)

const router = createBrowserRouter([
  {
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/upload', element: <UploadPage /> },
          { path: '/result', element: <ResultPage /> },
          { path: '/login', element: <LoginPage /> },
          { path: '/signup', element: <SignupPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<p className="p-6 text-sm text-[#4B4B4B]">Loading interface...</p>}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthProvider>
  )
}
