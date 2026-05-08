import { Outlet } from 'react-router-dom'
import { Footer } from '../components/layout/footer'
import { Navbar } from '../components/layout/navbar'

export function AppLayout() {
  return (
    <div className="page-shell flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
