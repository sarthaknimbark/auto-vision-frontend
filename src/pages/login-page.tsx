import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/auth-context'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.msg || 'Login failed')
      login(data.user, data.token)
      navigate('/')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="mx-auto flex max-w-md items-center min-h-[80vh] px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-card w-full p-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#984216] rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
            <span className="text-white font-bold text-3xl">A</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-500 font-medium">Sign in to your AutoVision account</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-100">{error}</div>}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 ml-1">Email Address</label>
            <input 
              placeholder="name@company.com" 
              type="email" 
              className="input-glass w-full h-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 ml-1">Password</label>
            <input 
              placeholder="••••••••" 
              type="password" 
              className="input-glass w-full h-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="button-primary w-full h-12 mt-4 font-black text-lg shadow-xl">
            Sign In
          </button>
        </form>

        <p className="text-center text-sm font-medium text-slate-500 mt-8">
          Don't have an account?{' '}
          <Link className="font-bold text-[#984216] hover:text-[#823812] transition-colors" to="/signup">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  )
}
