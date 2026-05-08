import { Link, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/upload', label: 'Upload' },
  { to: '/result', label: 'Result' },
  { to: '/login', label: 'Login' },
]

export function Navbar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/65 backdrop-blur-2xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="heading-gradient text-lg font-bold sm:text-xl">
          AutoVision
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${location.pathname === link.to
                  ? 'bg-[#60176F]/10 text-[#60176F]'
                  : 'text-[#4B4B4B] hover:bg-white hover:text-[#111111]'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="md:hidden"
          onClick={() => setMobileOpen((state) => !state)}
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      {mobileOpen && (
        <div className="mx-4 mb-4 space-y-2 rounded-2xl border border-white/80 bg-white/80 p-3 shadow-[0_8px_22px_rgba(17,17,17,0.08)] backdrop-blur-xl md:hidden">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-xl px-4 py-2.5 text-sm font-medium ${location.pathname === link.to
                  ? 'bg-[#60176F]/10 text-[#60176F]'
                  : 'text-[#4B4B4B] hover:bg-[#60176F]/5'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
