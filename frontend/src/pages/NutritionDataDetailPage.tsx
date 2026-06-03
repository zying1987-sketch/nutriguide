import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, BookOpen, FlaskConical, Tag, AlertCircle, Loader2, ExternalLink } from 'lucide-react'

interface KnowledgeDetail {
  id: string
  title: string
  title_zh: string
  content: string
  category: string
  categoryName: string
  categoryColor: string
  categoryIcon: string
  evidence_level: string
  confidence: number | null
  tags: string[]
  source: string
  score: number | null
}

const EVIDENCE_COLORS: Record<string, string> = {
  A: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  B: 'bg-amber-100 text-amber-800 border-amber-200',
  C: 'bg-slate-100 text-slate-600 border-slate-200',
}

const EVIDENCE_LABELS: Record<string, string> = {
  A: 'A级 — 强证据（RCT/荟萃分析）',
  B: 'B级 — 中等证据（队列/病例对照）',
  C: 'C级 — 初步证据（专家共识/教材）',
}

const CONFIDENCE_LABELS: Record<string, string> = {
  high: '高可信度',
  medium: '中等可信度',
  low: '低可信度',
}

function getConfidenceLevel(confidence: number | null): string {
  if (!confidence) return ''
  if (confidence >= 80) return 'high'
  if (confidence >= 60) return 'medium'
  return 'low'
}

function getConfidenceColor(confidence: number | null): string {
  if (!confidence) return 'text-slate-400'
  if (confidence >= 80) return 'text-emerald-600'
  if (confidence >= 60) return 'text-amber-600'
  return 'text-red-400'
}

export default function NutritionDataDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  // 获取当前语言对应的显示标题
  const getDisplayTitle = (entry: KnowledgeDetail) => {
    return i18n.language === 'zh' && entry.title_zh ? entry.title_zh : entry.title
  }

  const [entry, setEntry] = useState<KnowledgeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError('')

    fetch(`/api/knowledge/${encodeURIComponent(id)}`)
      .then(async res => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || '未找到该条目')
        }
        return res.json()
      })
      .then(data => setEntry(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const goBack = () => navigate(-1)

  // 加载中
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#A8A199]">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">加载中...</p>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error || !entry) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <AlertCircle className="w-12 h-12 text-[#E85D3A]/60" />
          <h2 className="text-lg font-semibold text-[#1B2A4A]">未找到该条目</h2>
          <p className="text-sm text-[#6B7280]">{error || '该知识条目可能已被移除或链接无效'}</p>
          <button
            onClick={goBack}
            className="mt-2 flex items-center gap-2 px-4 py-2 bg-[#1B2A4A] text-white text-sm rounded-lg hover:bg-[#2D3A5A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
        </div>
      </div>
    )
  }

  const confidenceLevel = getConfidenceLevel(entry.confidence)

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-[#E8E3DB]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1B2A4A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回营养数据库
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 元数据卡片 */}
        <div className="bg-white rounded-2xl border border-[#E8E3DB] p-6 mb-6">
          {/* 分类和证据等级 */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5"
              style={{ backgroundColor: entry.categoryColor + '18', color: entry.categoryColor, borderColor: entry.categoryColor + '30' }}
            >
              {entry.categoryIcon} {entry.categoryName}
            </span>

            {entry.evidence_level && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${EVIDENCE_COLORS[entry.evidence_level] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                {EVIDENCE_LABELS[entry.evidence_level] || entry.evidence_level}
              </span>
            )}

            {entry.confidence && (
              <span className={`flex items-center gap-1 text-xs font-medium ${getConfidenceColor(entry.confidence)}`}>
                <FlaskConical className="w-3 h-3" />
                置信度 {entry.confidence}%
                {confidenceLevel && (
                  <span className="opacity-60">（{CONFIDENCE_LABELS[confidenceLevel]}）</span>
                )}
              </span>
            )}
          </div>

          {/* 标题 */}
          <h1 className="text-xl font-bold text-[#1B2A4A] leading-snug mb-4">
            {entry ? getDisplayTitle(entry) : ''}
          </h1>

          {/* 来源 */}
          {entry.source && (
            <div className="flex items-start gap-2 text-xs text-[#A8A199] mb-4 pb-4 border-b border-[#F0EDE8]">
              <BookOpen className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>来源：{entry.source}</span>
            </div>
          )}

          {/* 正文 */}
          <div className="prose prose-sm max-w-none text-[#374151] leading-relaxed whitespace-pre-wrap">
            {entry.content}
          </div>
        </div>

        {/* 标签 */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E8E3DB] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-[#A8A199]" />
              <h3 className="text-sm font-semibold text-[#1B2A4A]">相关标签</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs text-[#6B7280] bg-[#F8F6F3] px-3 py-1.5 rounded-full hover:bg-[#EDE8E2] transition-colors cursor-default"
                >
                  {tag.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
