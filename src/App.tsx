import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/Layout'
import { Loading } from './components/ui'
import { Landing } from './pages/Landing'
import { Forgot, Login, Register } from './pages/Auth'
import { NotFound } from './pages/NotFound'
import { Summit } from './pages/Summit'
import { useApp } from './store/app'

const Arsenal = lazy(() => import('./pages/Arsenal').then((m) => ({ default: m.Arsenal })))
const Lab = lazy(() => import('./pages/Lab').then((m) => ({ default: m.Lab })))
const PathMap = lazy(() => import('./pages/PathMap').then((m) => ({ default: m.PathMap })))
const Analytics = lazy(() => import('./pages/Analytics').then((m) => ({ default: m.Analytics })))
const Profile = lazy(() => import('./pages/Profile').then((m) => ({ default: m.Profile })))

function GuestOnly({ children }: { children: ReactNode }) {
  const { user } = useApp()
  return user ? <Navigate to="/app" replace /> : <>{children}</>
}

export function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
        <Route path="/forgot" element={<GuestOnly><Forgot /></GuestOnly>} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Summit />} />
          <Route path="arsenal" element={<Arsenal />} />
          <Route path="lab" element={<Lab />} />
          <Route path="lab/:id" element={<Lab />} />
          <Route path="map" element={<PathMap />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<NotFound inApp />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
