import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/useAuthStore'
import { api } from '../lib/api'
import { Navigate } from 'react-router-dom'
import { Users, FileText, ClipboardList, Calendar, Search, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'

interface Stats { totalUsers: number; totalAssessments: number; totalPlans: number; todayAssessments: number }
interface AdminUser { id: number; email: string; name: string; role: string; created_at: string; assessment_count: number; plan_count: number }
interface AssessmentRecord { id: number; created_at: string; result: string | null }

export default function AdminPage() {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const logout = useAuthStore((s) => s.logout)

  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<{ user: AdminUser; assessments: AssessmentRecord[]; plans: any[] } | null>(null)
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null)

  useEffect(() => {
    if (!user || user.role !== 'admin') return
    api.getAdminStats().then(setStats).catch(console.error)
  }, [user])

  useEffect(() => {
    if (!user || user.role !== 'admin') return
    api.getAdminUsers(page, search).then((data: any) => {
      setUsers(data.users)
      setTotalPages(data.totalPages)
    }).catch(console.error)
  }, [user, page, search])

  if (loading) return <div className="flex justify-center py-20"><div className="text-[#6B6560]">加载中...</div></div>
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />

  const handleUserDetail = async (userId: number) => {
    const data = await api.getAdminUserDetail(userId)
    setSelectedUser(data)
    setSelectedAssessment(null)
  }

  const handleAssessmentDetail = async (assessmentId: number) => {
    if (!selectedUser) return
    const data = await api.getAdminUserAssessment(selectedUser.user.id, assessmentId)
    setSelectedAssessment(data)
  }

  return (
    <div className="px-6 py-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl serif font-semibold text-[#1A1A1A]">管理后台</h1>
          <p className="text-sm text-[#6B6560] mt-1">用户数据与自测统计</p>
        </div>
        <button onClick={logout} className="flex items-center gap-1.5 text-sm text-[#6B6560] hover:text-[#C0392B] transition-colors">
          <LogOut className="w-4 h-4" /> 退出
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: '总用户数', value: stats.totalUsers, icon: Users, color: '#7A8B6F' },
            { label: '自测总数', value: stats.totalAssessments, icon: ClipboardList, color: '#C17A5F' },
            { label: '方案总数', value: stats.totalPlans, icon: FileText, color: '#5A7A8B' },
            { label: '今日自测', value: stats.todayAssessments, icon: Calendar, color: '#8B6F7A' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[#E5E0D8]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + '15' }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <span className="text-xs text-[#A8A199]">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-[#1A1A1A]">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C4BFB8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="搜索用户..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E0D8] rounded-xl text-sm focus:outline-none focus:border-[#7A8B6F]"
          />
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E0D8] bg-[#F8F6F3]">
                <th className="text-left px-5 py-3 font-medium text-[#6B6560]">用户</th>
                <th className="text-left px-5 py-3 font-medium text-[#6B6560]">角色</th>
                <th className="text-left px-5 py-3 font-medium text-[#6B6560]">自测</th>
                <th className="text-left px-5 py-3 font-medium text-[#6B6560]">方案</th>
                <th className="text-left px-5 py-3 font-medium text-[#6B6560]">注册时间</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => handleUserDetail(u.id)}
                  className="border-b border-[#F0EDE8] hover:bg-[#F8F6F3] cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="font-medium text-[#1A1A1A]">{u.name || u.email.split('@')[0]}</div>
                    <div className="text-xs text-[#A8A199]">{u.email}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-[#7A8B6F]/10 text-[#7A8B6F]' : 'bg-[#E5E0D8] text-[#6B6560]'}`}>
                      {u.role === 'admin' ? '管理员' : '用户'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#6B6560]">{u.assessment_count}</td>
                  <td className="px-5 py-3 text-[#6B6560]">{u.plan_count}</td>
                  <td className="px-5 py-3 text-[#A8A199] text-xs">{u.created_at?.split('T')[0] || u.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#E5E0D8]">
            <span className="text-xs text-[#A8A199]">共 {totalPages} 页</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-[#F0EDE8] disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-[#F0EDE8] disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Panel */}
      {selectedUser && (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-[#1A1A1A]">{selectedUser.user.name || selectedUser.user.email}</h2>
              <p className="text-sm text-[#A8A199]">{selectedUser.user.email}</p>
            </div>
            <button onClick={() => { setSelectedUser(null); setSelectedAssessment(null) }} className="text-sm text-[#6B6560] hover:text-[#1A1A1A]">关闭</button>
          </div>

          {selectedAssessment ? (
            <div>
              <button onClick={() => setSelectedAssessment(null)} className="text-sm text-[#7A8B6F] mb-4 inline-flex items-center gap-1">
                <ChevronLeft className="w-3 h-3" /> 返回
              </button>
              <h3 className="font-medium mb-3">自测详情</h3>
              <div className="bg-[#F8F6F3] rounded-xl p-4">
                <pre className="text-xs text-[#1A1A1A] whitespace-pre-wrap font-mono">
                  {JSON.stringify(selectedAssessment, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-[#6B6560] mb-3">自测记录</h3>
                {selectedUser.assessments.length === 0 ? (
                  <p className="text-sm text-[#A8A199]">暂无记录</p>
                ) : (
                  <div className="space-y-2">
                    {selectedUser.assessments.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => handleAssessmentDetail(a.id)}
                        className="w-full text-left p-3 rounded-xl bg-[#F8F6F3] hover:bg-[#F0EDE8] transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">自测 #{a.id}</span>
                          <span className="text-xs text-[#A8A199]">{a.created_at}</span>
                        </div>
                        {a.result && (
                          <p className="text-xs text-[#6B6560] mt-1 line-clamp-1">
                            {JSON.parse(a.result).populationTags?.join(', ') || '查看详情'}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#6B6560] mb-3">方案记录</h3>
                {selectedUser.plans.length === 0 ? (
                  <p className="text-sm text-[#A8A199]">暂无方案</p>
                ) : (
                  <div className="space-y-2">
                    {selectedUser.plans.map((p: any) => (
                      <div key={p.id} className="p-3 rounded-xl bg-[#F8F6F3]">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">方案 #{p.id}</span>
                          <span className="text-xs text-[#A8A199]">{p.created_at}</span>
                        </div>
                        {p.population_tags && (
                          <p className="text-xs text-[#6B6560] mt-1">{p.population_tags}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
