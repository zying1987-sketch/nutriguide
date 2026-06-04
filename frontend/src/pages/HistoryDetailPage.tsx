import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, Clock, User } from 'lucide-react'
import { api } from '../lib/api'

interface AssessmentDetail {
  id: number
  stepData: Record<string, any>
  result: {
    userProfile?: any
    primaryPopulation?: string
    secondaryPopulations?: string[]
    deficiencyRisks?: string[]
    generalBaseline?: any
    dietQualityScore?: number
    dietQualityLevel?: string
    dietStrengths?: string[]
    dietWeaknesses?: string[]
  } | null
  createdAt: string
}

export default function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [record, setRecord] = useState<AssessmentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    api.getAssessment(parseInt(id))
      .then((data: any) => setRecord(data))
      .catch((e: any) => setError(e.message || '加载失败'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#A8A199]" />
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-[#E85D3A] mx-auto mb-4 opacity-50" />
        <p className="text-[#6B6560] mb-4">{error || '记录不存在'}</p>
        <button onClick={() => navigate('/history')} className="text-[#2D9C6F] hover:underline text-sm">
          ← 返回记录列表
        </button>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr.replace(' ', 'T') + 'Z')
    return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  const stepData = record.stepData || {}
  const result = record.result

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Back */}
      <button
        onClick={() => navigate('/history')}
        className="flex items-center gap-2 text-sm text-[#6B6560] hover:text-[#1B2A4A] transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> 返回记录列表
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-[#A8A199] mb-2">
          <Clock className="w-4 h-4" />
          {formatDate(record.createdAt)}
        </div>
        <h1 className="font-serif text-2xl font-semibold text-[#1B2A4A]">自测记录详情</h1>
      </div>

      {/* 基本信息 */}
      <div className="bg-white rounded-2xl border border-[#E8E3DB] p-6 mb-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1B2A4A] mb-4">
          <User className="w-4 h-4 text-[#7A8B6F]" />
          基本信息
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {stepData.gender && (
            <div>
              <span className="text-[#A8A199] text-xs">性别</span>
              <p className="text-[#1B2A4A] font-medium">{stepData.gender === 'female' ? '女' : '男'}</p>
            </div>
          )}
          {stepData.age && (
            <div>
              <span className="text-[#A8A199] text-xs">年龄</span>
              <p className="text-[#1B2A4A] font-medium">{stepData.age} 岁</p>
            </div>
          )}
          {stepData.height && (
            <div>
              <span className="text-[#A8A199] text-xs">身高</span>
              <p className="text-[#1B2A4A] font-medium">{stepData.height} cm</p>
            </div>
          )}
          {stepData.weight && (
            <div>
              <span className="text-[#A8A199] text-xs">体重</span>
              <p className="text-[#1B2A4A] font-medium">{stepData.weight} kg</p>
            </div>
          )}
        </div>
      </div>

      {/* 评估结果 */}
      {result && (
        <div className="bg-white rounded-2xl border border-[#E8E3DB] p-6 mb-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1B2A4A] mb-4">
            <CheckCircle className="w-4 h-4 text-[#2D9C6F]" />
            评估结果
          </h2>
          <div className="space-y-4">
            {result.primaryPopulation && (
              <div>
                <span className="text-[#A8A199] text-xs">匹配人群</span>
                <p className="text-[#2D6B4F] font-medium">
                  {typeof result.primaryPopulation === 'object'
                    ? result.primaryPopulation.populationName || result.primaryPopulation.populationId
                    : result.primaryPopulation}
                </p>
              </div>
            )}
            {result.dietQualityScore !== undefined && (
              <div>
                <span className="text-[#A8A199] text-xs">饮食质量评分</span>
                <p className={`font-medium ${
                  result.dietQualityLevel === 'excellent' ? 'text-[#2D9C6F]' :
                  result.dietQualityLevel === 'good' ? 'text-[#D4A853]' : 'text-[#E85D3A]'
                }`}>{result.dietQualityScore}/100 {result.dietQualityLevel && `(${result.dietQualityLevel})`}</p>
              </div>
            )}
            {result.deficiencyRisks && result.deficiencyRisks.length > 0 && (
              <div>
                <span className="text-[#A8A199] text-xs">潜在缺乏风险</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {result.deficiencyRisks.map((r, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-[#FEF5F0] rounded-full text-[#C17A5F]">
                      {typeof r === 'object' ? (r.nutrientName || r.nutrient || '') : r}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          to="/assessment"
          className="px-6 py-2.5 bg-[#2D9C6F] text-white rounded-full text-sm font-medium hover:bg-[#258A5E] transition-colors no-underline"
        >
          重新自测
        </Link>
        <Link
          to="/history"
          className="px-6 py-2.5 border border-[#E8E3DB] text-[#1B2A4A] rounded-full text-sm font-medium hover:bg-[#F8F6F3] transition-colors no-underline"
        >
          返回列表
        </Link>
      </div>
    </div>
  )
}
