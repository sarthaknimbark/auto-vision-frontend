import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/auth-context'

const links = [
  { to: '/', label: 'Home' },
  { to: '/upload', label: 'Analyze' },
  { to: '/history', label: 'Reports' },
]

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/40 backdrop-blur-md border-b border-white/20">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-[#984216] rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <span className="heading-gradient text-2xl font-black tracking-tight">AutoVision</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-semibold transition-all hover:text-[#984216] ${
                location.pathname === link.to
                  ? 'text-[#984216]'
                  : 'text-[#64748b]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          {user ? (
            <div className="flex items-center gap-6 pl-6 border-l border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-[#984216]">
                  <UserIcon size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-900 leading-none">{user.name}</span>
                  <span className="text-[10px] font-bold text-[#984216] uppercase tracking-wider mt-1">{user.role}</span>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login">
              <button className="button-primary !py-2 !px-6 text-sm">
                Login
              </button>
            </Link>
          )}
        </div>

        <button
          className="md:hidden text-[#984216]"
          onClick={() => setMobileOpen((state) => !state)}
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-20 left-0 right-0 glass-card mx-6 p-6 md:hidden animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-6">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`text-lg font-bold ${
                  location.pathname === link.to ? 'text-[#984216]' : 'text-[#64748b]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-[#984216]">
                    <UserIcon size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900">{user.name}</span>
                    <span className="text-[10px] font-bold text-[#984216] uppercase tracking-wider">{user.role}</span>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 font-bold text-sm"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <button className="button-primary w-full">Login</button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

