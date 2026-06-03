import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Clock, FileText, ChevronRight, Loader2, FlaskConical } from 'lucide-react'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/useAuthStore'

interface AssessmentRecord {
  id: number
  created_at: string
  gender: string | null
  age: number | null
  population: string | null
  diet_score: number | null
}

export default function HistoryPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [records, setRecords] = useState<AssessmentRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    api.getAssessments()
      .then((data: any) => setRecords(data.records || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (dateStr: string) => {
    // SQLite datetime('now') 格式: "YYYY-MM-DD HH:MM:SS"，补 T 和 Z 后才是合法 ISO 8601
    const d = new Date(dateStr.replace(' ', 'T') + 'Z')
    return d.toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })
  }

  // 格式化预览信息（后端已用 json_extract 提取关键字段）
  const getPreviewInfo = (record: AssessmentRecord) => ({
    gender: record.gender === 'female' ? '女' : record.gender === 'male' ? '男' : '',
    age: record.age || '',
    population: record.population || '',
    dietScore: record.diet_score !== null ? record.diet_score : undefined,
  })

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-[#6B6560] hover:text-[#1B2A4A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </button>
      </div>

      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-[#1B2A4A]">我的自测记录</h1>
        <p className="text-sm text-[#6B6560] mt-2">查看历史自测结果和营养方案</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#A8A199]" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-20">
          <FlaskConical className="w-12 h-12 text-[#A8A199] mx-auto mb-4 opacity-40" />
          <p className="text-[#6B6560] mb-4">还没有自测记录</p>
          <Link
            to="/assessment"
            className="px-6 py-2.5 bg-[#1B2A4A] text-white rounded-full text-sm font-medium hover:bg-[#2A3A5A] transition-colors no-underline"
          >
            开始第一次自测
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => {
            const info = getPreviewInfo(record)
            return (
              <Link
                key={record.id}
                to={`/history/${record.id}`}
                className="block bg-white rounded-xl border border-[#E8E3DB] p-5 hover:border-[#2D9C6F]/40 hover:shadow-sm transition-all group no-underline"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <Clock className="w-4 h-4 text-[#A8A199]" />
                      <span className="text-sm text-[#6B6560]">{formatDate(record.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {info.gender && (
                        <span className="text-xs px-2 py-0.5 bg-[#F8F6F3] rounded-full text-[#6B6560]">
                          {info.gender} · {info.age}岁
                        </span>
                      )}
                      {info.population && (
                        <span className="text-xs px-2 py-0.5 bg-[#E8F0EB] rounded-full text-[#2D6B4F]">
                          {info.population}
                        </span>
                      )}
                      {info.dietScore !== undefined && (
                        <span className="text-xs px-2 py-0.5 bg-[#F0EDE8] rounded-full text-[#7A5C4A]">
                          饮食 {info.dietScore}/100
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#A8A199] group-hover:text-[#2D9C6F] transition-colors shrink-0" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
