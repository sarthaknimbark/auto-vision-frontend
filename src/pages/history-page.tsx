import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import { ShieldCheck, Activity, Calendar, User as UserIcon, ArrowRight } from 'lucide-react'

export function HistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const { token, user } = useAuth()

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/data', {
          headers: { 'x-auth-token': token || '' }
        })
        const data = await res.json()
        setHistory(data)
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [token])

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">
            {user?.role === 'admin' ? 'Master Inspection History' : 'Your History'}
          </h1>
          <p className="text-slate-500 font-medium">
            {user?.role === 'admin' ? 'Reviewing all vehicle assessments across the platform' : 'Track your past vehicle damage assessments'}
          </p>
        </div>
        {user?.role === 'admin' && (
           <div className="px-4 py-2 bg-brand-50 rounded-full border border-brand-100 flex items-center gap-2">
              <UserIcon className="text-[#984216]" size={16} />
              <span className="text-xs font-bold text-[#984216] uppercase tracking-wider">Admin Panel</span>
           </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <p className="text-slate-400 font-medium">Loading history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="glass-card p-20 text-center">
          <p className="text-xl font-bold text-slate-400 mb-6">No assessment history found</p>
          <Link to="/upload">
            <button className="button-primary h-12 px-8 font-bold">Start First Assessment</button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item: any) => (
            <div key={item._id} className="glass-card p-6 group hover:border-[#984216]/30 transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-[#984216] transition-colors">
                  <ShieldCheck size={24} />
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  item.results.severity.severity_report.severity_level === 'High' || item.results.severity.severity_report.severity_level === 'Critical'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-green-50 text-green-600'
                }`}>
                  {item.results.severity.severity_report.severity_level}
                </div>
              </div>
              
              <h3 className="text-lg font-black text-slate-900 mb-1">
                {item.vehicleInfo.year} {item.vehicleInfo.make} {item.vehicleInfo.model}
              </h3>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <Calendar size={14} />
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
                {user?.role === 'admin' && (
                  <div className="flex items-center gap-2 text-xs text-[#984216] font-bold">
                    <UserIcon size={14} />
                    Owner: {item.userName}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="text-sm font-bold text-slate-900">
                  {item.results.cost.cost_estimation.currency}{item.results.cost.cost_estimation.grand_total}
                </div>
                <div className="text-brand-600 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 text-xs font-bold uppercase tracking-widest">
                  View Report <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
