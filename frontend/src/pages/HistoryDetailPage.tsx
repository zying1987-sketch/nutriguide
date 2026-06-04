import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Loader2, AlertCircle, CheckCircle, Clock, User,
  Target, Apple, AlertTriangle, ThumbsUp, Activity, Moon, Zap,
  Download, FileText
} from 'lucide-react'
import { api } from '../lib/api'

interface DeficiencyRisk {
  nutrient?: string
  nutrientName?: string
  riskLevel?: string
  reason?: string
}

interface PopulationObj {
  populationId?: string
  populationName?: string
  category?: string
  confidence?: number
  reason?: string[]
}

interface AssessmentDetail {
  id: number
  stepData: Record<string, any>
  result: {
    userProfile?: any
    userDescription?: string
    primaryPopulation?: PopulationObj | string
    secondaryPopulations?: (PopulationObj | string)[]
    deficiencyRisks?: (DeficiencyRisk | string)[]
    generalBaseline?: any
    dietQualityScore?: number
    dietQualityLevel?: string
    dietStrengths?: string[]
    dietWeaknesses?: string[]
  } | null
  hasReport?: boolean
  createdAt: string
}

const coreNeedLabels: Record<string, string> = {
  muscle_gain: '增肌', weight_loss: '减脂', energy: '提升精力',
  immunity: '增强免疫', skin: '皮肤健康', sleep: '改善睡眠',
  hormone: '激素平衡', digestion: '消化健康', anti_aging: '抗衰老',
  mental: '情绪/脑力', bone: '骨骼健康', hair: '头发健康',
}

const exerciseLabels: Record<string, string> = {
  sedentary: '久坐少动', light: '轻度活动', moderate: '中等运动',
  active: '高度活跃', intense: '高强度训练',
}

const sleepLabels: Record<string, string> = {
  poor: '睡眠不足 (<6h)', normal: '正常 (6-8h)', good: '充足 (>8h)',
}

const riskColors: Record<string, string> = {
  high: 'text-[#E85D3A] bg-[#FEF0EB]', moderate: 'text-[#D4A853] bg-[#FFF9ED]',
  low: 'text-[#A8A199] bg-[#F8F6F3]',
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
  const profile = result?.userProfile

  // 辅助函数：从对象获取人口名称
  const getPopName = (p: any) => typeof p === 'object' ? (p.populationName || p.populationId || '') : String(p || '')

  // 辅助函数：从对象获取风险名称
  const getRiskName = (r: any) => typeof r === 'object' ? (r.nutrientName || r.nutrient || '') : String(r || '')

  // 饮食等级颜色
  const dietColor = result?.dietQualityLevel === 'excellent' ? 'text-[#2D9C6F]' :
    result?.dietQualityLevel === 'good' ? 'text-[#D4A853]' : 'text-[#E85D3A]'

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Back */}
      <button onClick={() => navigate('/history')}
        className="flex items-center gap-2 text-sm text-[#6B6560] hover:text-[#1B2A4A] transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> 返回记录列表
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-[#A8A199] mb-2">
          <Clock className="w-4 h-4" /> {formatDate(record.createdAt)}
        </div>
        <h1 className="font-serif text-2xl font-semibold text-[#1B2A4A]">自测记录详情</h1>
        {result?.userDescription && (
          <p className="text-sm text-[#6B6560] mt-2">{result.userDescription}</p>
        )}
      </div>

      {/* ============ 基本信息 ============ */}
      <div className="bg-white rounded-2xl border border-[#E8E3DB] p-6 mb-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1B2A4A] mb-4">
          <User className="w-4 h-4 text-[#7A8B6F]" /> 基本信息
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><span className="text-[#A8A199] text-xs">性别</span>
            <p className="text-[#1B2A4A] font-medium">{stepData.gender === 'female' ? '女' : stepData.gender === 'male' ? '男' : '-'}</p></div>
          <div><span className="text-[#A8A199] text-xs">年龄</span>
            <p className="text-[#1B2A4A] font-medium">{stepData.age ?? '-'} 岁</p></div>
          <div><span className="text-[#A8A199] text-xs">身高</span>
            <p className="text-[#1B2A4A] font-medium">{stepData.height ? `${stepData.height} cm` : '-'}</p></div>
          <div><span className="text-[#A8A199] text-xs">体重</span>
            <p className="text-[#1B2A4A] font-medium">{stepData.weight ? `${stepData.weight} kg` : '-'}</p></div>
          {profile?.bmi && <div><span className="text-[#A8A199] text-xs">BMI</span>
            <p className="text-[#1B2A4A] font-medium">{profile.bmi}</p></div>}
          {profile?.exerciseFrequency && <div><span className="text-[#A8A199] text-xs">运动频率</span>
            <p className="text-[#1B2A4A] font-medium">{exerciseLabels[profile.exerciseFrequency] || profile.exerciseFrequency}</p></div>}
          {profile?.sleepHours && <div><span className="text-[#A8A199] text-xs">睡眠</span>
            <p className="text-[#1B2A4A] font-medium">{sleepLabels[profile.sleepHours] || profile.sleepHours}</p></div>}
          {profile?.dietPattern && <div><span className="text-[#A8A199] text-xs">饮食模式</span>
            <p className="text-[#1B2A4A] font-medium">{profile.dietPattern === 'omnivore' ? '杂食' : profile.dietPattern}</p></div>}
        </div>
      </div>

      {/* ============ 核心诉求 ============ */}
      {profile?.coreNeeds && profile.coreNeeds.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E8E3DB] p-6 mb-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1B2A4A] mb-4">
            <Target className="w-4 h-4 text-[#E85D3A]" /> 核心诉求
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.coreNeeds.map((n: string) => (
              <span key={n} className="text-xs px-3 py-1.5 bg-[#FEF5F0] text-[#C17A5F] rounded-full font-medium">
                {coreNeedLabels[n] || n}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ============ 匹配人群 ============ */}
      {result?.primaryPopulation && (
        <div className="bg-white rounded-2xl border border-[#E8E3DB] p-6 mb-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1B2A4A] mb-4">
            <Zap className="w-4 h-4 text-[#D4A853]" /> 匹配人群
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#A8A199]">主要匹配</span>
              <span className="text-sm font-semibold text-[#2D6B4F] px-3 py-1 bg-[#E8F0EB] rounded-full">
                {getPopName(result.primaryPopulation)}
              </span>
              {typeof result.primaryPopulation === 'object' && result.primaryPopulation.confidence && (
                <span className="text-xs text-[#A8A199]">置信度 {(result.primaryPopulation.confidence * 100).toFixed(0)}%</span>
              )}
            </div>
            {result.secondaryPopulations && result.secondaryPopulations.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-[#A8A199]">次要匹配</span>
                {result.secondaryPopulations.map((p, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-[#F8F6F3] text-[#6B6560] rounded-full">
                    {getPopName(p)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============ 饮食质量评估 ============ */}
      {result && (result.dietQualityScore !== undefined || (result.dietStrengths && result.dietStrengths.length > 0) || (result.dietWeaknesses && result.dietWeaknesses.length > 0)) && (
        <div className="bg-white rounded-2xl border border-[#E8E3DB] p-6 mb-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1B2A4A] mb-4">
            <Apple className="w-4 h-4 text-[#2D9C6F]" /> 饮食质量评估
          </h2>
          {result.dietQualityScore !== undefined && (
            <div className="mb-4 flex items-center gap-3">
              <span className="text-3xl font-bold text-[#1B2A4A]">{result.dietQualityScore}</span>
              <span className="text-sm text-[#A8A199]">/ 100</span>
              <span className={`text-sm font-semibold ${dietColor} px-2 py-0.5 rounded`}>
                {result.dietQualityLevel === 'excellent' ? '优秀' :
                 result.dietQualityLevel === 'good' ? '良好' :
                 result.dietQualityLevel === 'fair' ? '一般' : '需改善'}
              </span>
            </div>
          )}
          {result.dietStrengths && result.dietStrengths.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1 text-xs text-[#2D9C6F] mb-2">
                <ThumbsUp size={12} /> 饮食优势
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.dietStrengths.map((s, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-[#E8F0EB] text-[#2D6B4F] rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}
          {result.dietWeaknesses && result.dietWeaknesses.length > 0 && (
            <div>
              <div className="flex items-center gap-1 text-xs text-[#E85D3A] mb-2">
                <AlertTriangle size={12} /> 需要改善
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.dietWeaknesses.map((w, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-[#FEF5F0] text-[#C17A5F] rounded-full">{w}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ 营养素缺乏风险 ============ */}
      {result?.deficiencyRisks && result.deficiencyRisks.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E8E3DB] p-6 mb-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1B2A4A] mb-4">
            <AlertTriangle className="w-4 h-4 text-[#D4A853]" /> 营养素缺乏风险评估
          </h2>
          <div className="space-y-3">
            {result.deficiencyRisks.map((risk, i) => {
              const name = getRiskName(risk)
              const riskData = typeof risk === 'object' ? risk : null
              const level = riskData?.riskLevel || 'low'
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-[#F0EDE8]">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    level === 'high' ? 'bg-[#E85D3A]' : level === 'moderate' ? 'bg-[#D4A853]' : 'bg-[#A8A199]'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-[#1B2A4A]">{name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${riskColors[level] || ''}`}>
                        {level === 'high' ? '高风险' : level === 'moderate' ? '中等风险' : '低风险'}
                      </span>
                    </div>
                    {riskData?.reason && (
                      <p className="text-xs text-[#6B6560] leading-relaxed">{riskData.reason}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ============ AI 完整报告 ============ */}
      {record.hasReport && (
        <div className="bg-white rounded-2xl border border-[#E8E3DB] p-6 mb-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1B2A4A] mb-4">
            <FileText className="w-4 h-4 text-[#7A8B6F]" /> AI 完整评估报告
          </h2>
          <p className="text-sm text-[#6B6560] mb-4">由大语言模型生成的详细营养干预方案，包含补充建议、饮食调整计划和生活方式指导。</p>
          <button
            onClick={() => api.downloadReport(record.id)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2D9C6F] text-white rounded-full text-sm font-medium hover:bg-[#258A5E] transition-colors"
          >
            <Download size={16} /> 下载完整报告（TXT）
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link to="/assessment"
          className="px-6 py-2.5 bg-[#2D9C6F] text-white rounded-full text-sm font-medium hover:bg-[#258A5E] transition-colors no-underline">
          重新自测
        </Link>
        <Link to="/history"
          className="px-6 py-2.5 border border-[#E8E3DB] text-[#1B2A4A] rounded-full text-sm font-medium hover:bg-[#F8F6F3] transition-colors no-underline">
          返回列表
        </Link>
      </div>
    </div>
  )
}
