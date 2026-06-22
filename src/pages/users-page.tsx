import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import { useDetectionStore } from '../store/detection-store'
import { nodeApiUrl } from '../api/node-base-url'
import {
  Users,
  Mail,
  Shield,
  Calendar,
  User as UserIcon,
  Trash2,
  FileText,
  ArrowRight,
  BarChart3,
  TrendingUp,
  Car,
  AlertCircle,
} from 'lucide-react'
import { historyImageSrc } from '../utils/history-image'

type ReportRow = {
  _id: string
  userName?: string
  userEmail?: string
  ownerEmail?: string | null
  ownerName?: string | null
  userId?: { _id?: string; email?: string; name?: string } | string
  vehicleInfo?: { year?: number; make?: string; model?: string }
  results?: {
    severity?: { severity_report?: { severity_level?: string } }
    cost?: { cost_estimation?: { currency?: string; grand_total?: number } }
    predict?: unknown
    isMultiScan?: boolean
    multiScans?: { label: string; imageUrl: string }[]
  }
  imageUrl?: string
  createdAt?: string
}

type AdminTab = 'users' | 'reports' | 'analytics'

export function UsersPage() {
  const [tab, setTab] = useState<AdminTab>('users')
  const [users, setUsers] = useState([])
  const [reports, setReports] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [reportsLoading, setReportsLoading] = useState(false)
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const fetchUsers = async () => {
    try {
      const res = await fetch(nodeApiUrl('/data/users'), {
        headers: { 'x-auth-token': token || '' }
      })
      const data = await res.json()
      if (Array.isArray(data)) {
        setUsers(data)
      }
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllReports = async () => {
    setReportsLoading(true)
    try {
      const res = await fetch(nodeApiUrl('/data'), {
        headers: { 'x-auth-token': token || '' }
      })
      const data = await res.json()
      console.log('Admin Fetched Reports:', data)
      if (Array.isArray(data)) {
        setReports(data)
      }
    } catch (err) {
      console.error('Reports fetch error:', err)
    } finally {
      setReportsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers()
    }
  }, [token, user])

  useEffect(() => {
    if (user?.role === 'admin' && (tab === 'reports' || tab === 'analytics')) {
      fetchAllReports()
    }
  }, [token, user, tab])

  const reportUserEmail = (row: ReportRow) => {
    const fromApi = [row.ownerEmail, row.userEmail].find(
      (v) => v != null && String(v).trim().length > 0
    )
    if (fromApi != null) return String(fromApi).trim()
    const u = row.userId
    if (u && typeof u === 'object' && 'email' in u && (u as { email?: string }).email) {
      return String((u as { email?: string }).email).trim()
    }
    return '—'
  }

  const reportUserName = (row: ReportRow) => {
    if (row.ownerName != null && String(row.ownerName).trim()) return String(row.ownerName).trim()
    const u = row.userId
    if (u && typeof u === 'object' && 'name' in u && (u as { name?: string }).name) {
      return String((u as { name?: string }).name).trim()
    }
    return row.userName ?? 'Unknown'
  }

  const handleViewReport = (item: ReportRow) => {
    console.log('Admin Opening Report:', item)
    if (!item.results) return
    const img = historyImageSrc(item.imageUrl)
    useDetectionStore.setState({
      isMultiScan: !!item.results.isMultiScan,
      file: null,
      previewUrl: img,
      scans: (item.results.multiScans || []).map((s: any) => ({
        file: null,
        previewUrl: s.imageUrl,
        label: s.label
      })),
      upload: { message: 'Loaded from history', filename: 'assessment.jpg' },
      predict: item.results.predict as any,
      severity: item.results.severity as any,
      cost: item.results.cost as any,
    })
    navigate('/result')
  }

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also remove all their assessment history.')) {
      return
    }

    try {
      const res = await fetch(nodeApiUrl(`/data/users/${id}`), {
        method: 'DELETE',
        headers: { 'x-auth-token': token || '' }
      })
      if (res.ok) {
        setUsers(users.filter((u: any) => u._id !== id))
        fetchAllReports()
      } else {
        const data = await res.json()
        alert(data.msg || 'Failed to delete user')
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Error deleting user')
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-slate-500 mt-2">You do not have permission to view this page.</p>
      </div>
    )
  }

  const tabBtn =
    'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#984216]/40'

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">Admin</h1>
          <p className="text-slate-500 font-medium">
            User accounts and platform-wide assessment reports
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-1"
            role="tablist"
            aria-label="Admin sections"
          >
            <button
              id="admin-tab-users"
              type="button"
              role="tab"
              aria-selected={tab === 'users'}
              onClick={() => setTab('users')}
              className={`${tabBtn} ${
                tab === 'users'
                  ? 'bg-white text-[#984216] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users size={18} />
              Users
            </button>
            <button
              id="admin-tab-reports"
              type="button"
              role="tab"
              aria-selected={tab === 'reports'}
              onClick={() => setTab('reports')}
              className={`${tabBtn} ${
                tab === 'reports'
                  ? 'bg-white text-[#984216] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText size={18} />
              Reports
            </button>
            <button
              id="admin-tab-analytics"
              type="button"
              role="tab"
              aria-selected={tab === 'analytics'}
              onClick={() => setTab('analytics')}
              className={`${tabBtn} ${
                tab === 'analytics'
                  ? 'bg-white text-[#984216] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 size={18} />
              Analytics
            </button>
          </div>
          {tab === 'users' ? (
            <div className="px-4 py-2 bg-brand-50 rounded-full border border-brand-100 flex items-center gap-2">
              <Users className="text-[#984216]" size={16} />
              <span className="text-xs font-bold text-[#984216] uppercase tracking-wider">
                {users.length} users
              </span>
            </div>
          ) : (
            <div className="px-4 py-2 bg-slate-50 rounded-full border border-slate-100 flex items-center gap-2">
              <FileText className="text-[#984216]" size={16} />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                {reports.length} reports
              </span>
            </div>
          )}
        </div>
      </div>

      {tab === 'users' && (
        <div role="tabpanel" aria-labelledby="admin-tab-users">
          <p className="text-slate-500 text-sm font-medium mb-6">Manage registered users and roles</p>
          {loading ? (
            <div className="text-center py-20 glass-card">
              <p className="text-slate-400 font-medium">Loading users...</p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">User</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Contact</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Role</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Joined</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((u: any) => (
                    <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-[#984216]">
                            <UserIcon size={18} />
                          </div>
                          <span className="font-bold text-slate-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail size={14} className="text-slate-400" />
                          {u.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          u.role === 'admin' ? 'bg-[#984216]/10 text-[#984216]' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Shield size={10} />
                          {u.role}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          {new Date(u.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u._id !== user?.id && (
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'reports' && (
        <div role="tabpanel" aria-labelledby="admin-tab-reports">
          <p className="text-slate-500 text-sm font-medium mb-6">
            Every assessment on the platform, with the submitting user
          </p>

          {reportsLoading ? (
            <div className="text-center py-16 glass-card">
              <p className="text-slate-400 font-medium">Loading reports…</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-500 font-medium">
              No assessments yet.
            </div>
          ) : (
            <div className="glass-card overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest w-20">
                      Image
                    </th>
                    <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                      Date
                    </th>
                    <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                      User
                    </th>
                    <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                      Email
                    </th>
                    <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                      Vehicle
                    </th>
                    <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                      Severity
                    </th>
                    <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                      Estimate
                    </th>
                    <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reports.map((row) => {
                    const level = row.results?.severity?.severity_report?.severity_level ?? '—'
                    const est = row.results?.cost?.cost_estimation
                    const vehicle = row.vehicleInfo
                    const high = level === 'High' || level === 'Critical'
                    const thumb = historyImageSrc(row.imageUrl)
                    console.log('Row Image URL:', { id: row._id, url: row.imageUrl ? (row.imageUrl.startsWith('data:') ? 'data:...' : row.imageUrl) : 'MISSING' })
                    return (
                      <tr key={row._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2 align-middle">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt=""
                              className="h-12 w-16 rounded-lg object-cover bg-slate-100 ring-1 ring-slate-100"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-400">
                              —
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar size={14} className="text-slate-400 shrink-0" />
                            {row.createdAt
                              ? new Date(row.createdAt).toLocaleString()
                              : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-slate-900">
                          {reportUserName(row)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-1.5 min-w-0">
                            <Mail size={14} className="text-slate-400 shrink-0" />
                            <span className="truncate max-w-[200px]" title={reportUserEmail(row)}>
                              {reportUserEmail(row)}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {vehicle
                            ? `${vehicle.year ?? ''} ${vehicle.make ?? ''} ${vehicle.model ?? ''}`.trim() ||
                              '—'
                            : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              high ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                            }`}
                          >
                            {level}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-slate-900 whitespace-nowrap">
                          {est
                            ? `${est.currency ?? ''}${est.grand_total ?? '—'}`
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleViewReport(row)}
                            disabled={!row.results}
                            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#984216] hover:opacity-80 disabled:opacity-40 disabled:pointer-events-none"
                          >
                            View <ArrowRight size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {tab === 'analytics' && (
        <div role="tabpanel" aria-labelledby="admin-tab-analytics">
          <p className="text-slate-500 text-sm font-medium mb-8">Platform-wide insights and performance metrics</p>
          
          {reportsLoading ? (
            <div className="text-center py-16 glass-card">
              <p className="text-slate-400 font-medium">Calculating insights...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-500 font-medium">
              Not enough data for analytics.
            </div>
          ) : (() => {
            // Analytics Logic
            const totalReports = reports.length;
            const costs = reports.map(r => r.results?.cost?.cost_estimation?.grand_total || 0).filter(c => c > 0);
            const avgCost = costs.length > 0 ? (costs.reduce((a, b) => a + b, 0) / costs.length).toFixed(2) : '0';
            
            const modelCounts: Record<string, number> = {};
            const damageCounts: Record<string, number> = {};
            
            reports.forEach(r => {
              // Car Models
              const model = `${r.vehicleInfo?.make || ''} ${r.vehicleInfo?.model || ''}`.trim() || 'Unknown';
              modelCounts[model] = (modelCounts[model] || 0) + 1;
              
              // Damage Types
              const predictions = (r.results?.predict as any)?.predictions || [];
              predictions.forEach((p: any) => {
                const type = p.class || 'Unknown';
                damageCounts[type] = (damageCounts[type] || 0) + 1;
              });
            });

            const topModels = Object.entries(modelCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5);

            const topDamage = Object.entries(damageCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3);

            return (
              <div className="space-y-8">
                {/* Top Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="glass-card p-6 border-l-4 border-[#984216]">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-[#984216]">
                        <TrendingUp size={20} />
                      </div>
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Average Repair</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900">
                      INR {avgCost}
                    </div>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Based on {costs.length} paid estimates</p>
                  </div>

                  <div className="glass-card p-6 border-l-4 border-blue-500">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <FileText size={20} />
                      </div>
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Reports</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900">
                      {totalReports}
                    </div>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Platform-wide assessments</p>
                  </div>

                  <div className="glass-card p-6 border-l-4 border-green-500">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                        <Users size={20} />
                      </div>
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Users</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900">
                      {users.length}
                    </div>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Registered accounts</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Most Common Models */}
                  <div className="glass-card p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <Car className="text-[#984216]" size={24} />
                      <h3 className="text-xl font-black text-slate-900">Top Car Models</h3>
                    </div>
                    <div className="space-y-4">
                      {topModels.map(([model, count], idx) => (
                        <div key={model} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-slate-700">{model}</span>
                          </div>
                          <span className="text-sm font-black text-[#984216]">{count} scans</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Common Damage Types */}
                  <div className="glass-card p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <AlertCircle className="text-red-500" size={24} />
                      <h3 className="text-xl font-black text-slate-900">Most Common Damage</h3>
                    </div>
                    <div className="space-y-6">
                      {topDamage.map(([type, count]) => {
                        const percentage = Math.round((count / reports.reduce((acc, r) => acc + ((r.results?.predict as any)?.predictions?.length || 0), 0)) * 100);
                        return (
                          <div key={type}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-slate-700 uppercase text-xs tracking-widest">{type}</span>
                              <span className="font-black text-slate-900">{count} instances</span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-red-500 rounded-full" 
                                style={{ width: `${Math.min(percentage, 100) || 5}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-8 text-xs text-slate-400 font-medium leading-relaxed italic">
                      Percentages represent the frequency of this damage type relative to all detected anomalies across all vehicles.
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  )
}
