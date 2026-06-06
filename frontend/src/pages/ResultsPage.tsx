import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Pill, Apple, Activity, ArrowRight, ChevronDown, ChevronUp, ShieldAlert, FlaskConical, Printer, Sparkles, Loader2 } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'
import { useAuthStore } from '../stores/useAuthStore'
import { api } from '../lib/api'
import { populationPlans } from '../data/populationPlans'
import type { GeneralBaseline } from '../data/generalBaseline'

type Tab = 'supplements' | 'diet' | 'lifestyle'

// 简单的 Markdown → HTML 渲染（仅处理标题、表格、粗体、列表、分隔线）
function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  // 标题
  html = html.replace(/^### (.+)$/gm, '<h4 class="text-base font-semibold text-[#1B2A4A] mt-4 mb-2">$1</h4>')
  html = html.replace(/^## (.+)$/gm, '<h3 class="text-lg font-bold text-[#1B2A4A] mt-6 mb-3">$1</h3>')
  html = html.replace(/^# (.+)$/gm, '<h2 class="text-xl font-bold text-[#1B2A4A] mt-8 mb-4">$1</h2>')
  // 粗体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[#1B2A4A]">$1</strong>')
  // 表格（简化：检测 | 开头的行，组成表格）
  html = html.replace(/(\|[^\n]+\|\n)+/g, (match) => {
    const rows = match.trim().split('\n').filter(r => r.includes('|'))
    if (rows.length < 2) return match
    const thead = `<thead><tr>${rows[0].split('|').filter(Boolean).map(c => `<th class="px-3 py-2 text-left text-xs font-semibold text-[#1B2A4A]/60 border-b border-[#E8E3DB]">${c.trim()}</th>`).join('')}</tr></thead>`
    const tbody = `<tbody>${rows.slice(2).map(r => `<tr>${r.split('|').filter(Boolean).map(c => `<td class="px-3 py-2 text-sm border-b border-[#E8E3DB]/50">${c.trim()}</td>`).join('')}</tr>`).join('')}</tbody>`
    return `<table class="w-full my-3 border-collapse">${thead}${tbody}</table>`
  })
  // 无序列表
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm text-[#1B2A4A]/80 my-1">$1</li>')
  // 有序列表
  html = html.replace(/^\d+\.\s(.+)$/gm, '<li class="ml-4 list-decimal text-sm text-[#1B2A4A]/80 my-1">$1</li>')
  // 水平线
  html = html.replace(/^---$/gm, '<hr class="my-4 border-[#E8E3DB]" />')
  // 段落
  const lines = html.split('\n')
  const result: string[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('<') || line.trim() === '') {
      result.push(line)
    } else {
      result.push(`<p class="text-sm text-[#1B2A4A]/70 my-2 leading-relaxed">${line}</p>`)
    }
  }
  return result.join('\n')
}

function AISection() {
  const { aiPlan, aiModel, aiLoading, aiError } = useAppStore()

  const modelLabel = (model: string): string => {
    const map: Record<string, string> = {
      'qwen-plus': '通义千问 qwen-plus',
      'qwen-turbo': '通义千问 qwen-turbo',
      'qwen-max': '通义千问 qwen-max',
      'deepseek-chat': 'DeepSeek V3',
      'deepseek-reasoner': 'DeepSeek R1',
      'gemini-2.0-flash': 'Gemini 2.0 Flash',
    }
    return map[model] || model
  }

  if (aiLoading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-100 p-6 mb-6 animate-fade-in-up">
        <div className="flex items-center gap-3 text-purple-600">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm font-medium">AI 正在为你生成个性化营养报告...</span>
        </div>
      </div>
    )
  }

  if (!aiPlan && aiError) {
    return (
      <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E3DB] p-4 mb-6 animate-fade-in-up">
        <div className="flex items-center gap-2 text-[#1B2A4A]/40 text-sm">
          <Sparkles size={14} />
          <span>以下为基于知识库的本地营养方案（无需 AI，不消耗积分）。如需 AI 增强报告，请检查网络连接后刷新页面。</span>
        </div>
      </div>
    )
  }

  if (!aiPlan) return null

  return (
    <div className="bg-white rounded-2xl border-2 border-purple-200 overflow-hidden mb-6 animate-fade-in-up shadow-lg shadow-purple-100/50">
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-white" />
          <span className="text-white font-semibold text-sm">AI 深度营养报告</span>
        </div>
        {aiModel && (
          <span className="text-white/70 text-xs bg-white/15 px-2 py-0.5 rounded-full">
            {modelLabel(aiModel)}
          </span>
        )}
      </div>
      <div
        className="p-6 max-h-[600px] overflow-y-auto prose-sm"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(aiPlan) }}
      />
      <div className="px-6 py-3 bg-[#FAF8F5] border-t border-[#E8E3DB] text-xs text-[#1B2A4A]/40 text-center">
        AI 生成内容仅供参考，不替代专业医疗建议。请在开始任何补充剂前咨询医生。
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { assessmentResult, generatedPlan, assessmentId, setAssessmentId } = useAppStore()
  const { user } = useAuthStore()

  // 通用人群兜底方案 — 确保所有板块始终有内容
  const fallbackPlan = populationPlans['general_population'] || null

  // 合并方案：优先用匹配到的方案，补充剂为空时用兜底
  const plan = generatedPlan ? {
    ...generatedPlan,
    // 如果 mergedSupplements 为空，使用兜底方案
    mergedSupplements: generatedPlan.mergedSupplements.length > 0
      ? generatedPlan.mergedSupplements
      : fallbackPlan?.supplements?.map(s => ({ ...s, fromPopulations: ['普通人群'] })) || [],
    // 同样兜底饮食和生活方式
    dietSummary: generatedPlan.dietSummary.length > 0 ? generatedPlan.dietSummary : fallbackPlan?.diet?.principles?.map(p => `${p.principle}: ${p.detail}`) || [],
    lifestyleSummary: generatedPlan.lifestyleSummary.length > 0 ? generatedPlan.lifestyleSummary : fallbackPlan?.lifestyle?.map(l => `${l.category}: ${l.recommendation}（${l.frequency}）`) || [],
    monitoringPlan: generatedPlan.monitoringPlan.length > 0 ? generatedPlan.monitoringPlan : fallbackPlan?.monitoringPlan || [],
    warningSigns: generatedPlan.warningSigns.length > 0 ? generatedPlan.warningSigns : fallbackPlan?.warningSigns || [],
  } : {
    userLabel: assessmentResult?.primaryPopulation?.populationName || '健康关注者',
    userDescription: '以下是基于中国居民膳食指南的通用营养建议。',
    priorityNote: '未匹配到特定人群，以下基于普通人群通用方案。如有特定健康问题，请重新自测并选择相关核心诉求。',
    plans: fallbackPlan ? [fallbackPlan] : [],
    mergedSupplements: fallbackPlan?.supplements?.map(s => ({ ...s, fromPopulations: ['普通人群'] })) || [],
    dietSummary: fallbackPlan?.diet?.principles?.map(p => `${p.principle}: ${p.detail}`) || [],
    lifestyleSummary: fallbackPlan?.lifestyle?.map(l => `${l.category}: ${l.recommendation}（${l.frequency}）`) || [],
    monitoringPlan: fallbackPlan?.monitoringPlan || [],
    warningSigns: fallbackPlan?.warningSigns || [],
    deficiencyAlerts: [],
  }
  const [activeTab, setActiveTab] = useState<Tab>('diet')
  const [expandedSupp, setExpandedSupp] = useState<string | null>(null)
  const [expandedDiet, setExpandedDiet] = useState(false)

  // 登录态自动保存自测结果
  useEffect(() => {
    if (!user || assessmentId || !assessmentResult) return
    api.saveAssessment({
      stepData: useAppStore.getState().assessmentData,
      result: assessmentResult,
    })
      .then(data => setAssessmentId(data.id))
      .catch(err => console.error('保存自测记录失败:', err))
  }, [user, assessmentResult, assessmentId, setAssessmentId])

  if (!assessmentResult) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-[#1B2A4A] mb-4">{t('results.noResult')}</h1>
        <p className="text-[#1B2A4A]/60 mb-8">{t('results.subtitle')}</p>
        <Link to="/assessment" className="px-6 py-3 bg-[#2D9C6F] text-white rounded-full font-medium no-underline">
          {t('results.goAssess')}
        </Link>
      </div>
    )
  }

  const { userProfile, primaryPopulation, secondaryPopulations, deficiencyRisks, generalBaseline } = assessmentResult

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'diet', label: t('results.diet'), icon: Apple },
    { key: 'lifestyle', label: t('results.lifestyle'), icon: Activity },
    { key: 'supplements', label: t('results.supplements'), icon: Pill },
  ]

  const levelColors: Record<string, string> = {
    core: 'bg-[#2D9C6F]/10 text-[#2D9C6F] border-[#2D9C6F]/20',
    conditional: 'bg-[#D4A853]/10 text-[#D4A853] border-[#D4A853]/20',
    optional: 'bg-gray-100 text-gray-500 border-gray-200',
  }

  const riskColors: Record<string, string> = {
    high: 'bg-[#E85D3A]/10 text-[#E85D3A] border-[#E85D3A]/20',
    moderate: 'bg-[#D4A853]/10 text-[#D4A853] border-[#D4A853]/20',
    low: 'bg-gray-100 text-gray-400 border-gray-200',
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D9C6F]/10 text-[#2D9C6F] text-xs font-medium mb-4">
          评估完成
        </div>
        <h1 className="text-3xl font-bold text-[#1B2A4A] tracking-tight">你的个性化营养画像</h1>
        <p className="mt-2 text-[#1B2A4A]/50">{plan.userDescription}</p>
      </div>

      {/* Health Label */}
      <div className="bg-white rounded-2xl border border-[#E8E3DB] p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <h2 className="text-xs font-semibold text-[#1B2A4A]/40 uppercase tracking-wider mb-3">你的健康标签</h2>
        <div className="flex flex-wrap gap-2">
          {primaryPopulation ? (
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-[#1B2A4A] text-white">
              {primaryPopulation.populationName}
            </span>
          ) : (
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-[#1B2A4A] text-white">
              健康成年人
            </span>
          )}
          {secondaryPopulations?.map(sp => (
            <span key={sp.populationId} className="px-4 py-2 rounded-full text-sm font-medium bg-[#FAF8F5] text-[#1B2A4A] border border-[#E8E3DB]">
              {sp.populationName}
            </span>
          ))}
          {plan.plans.slice(0, 2).map(p => {
            if (primaryPopulation && p.name === primaryPopulation.populationName) return null
            return (
              <span key={p.id} className="px-4 py-2 rounded-full text-sm font-medium bg-[#FAF8F5] text-[#1B2A4A] border border-[#E8E3DB]">
                {p.name}
              </span>
            )
          })}
        </div>
        {plan.priorityNote && (
          <p className="mt-4 text-sm text-[#1B2A4A]/60 flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[#D4A853]" />
            {plan.priorityNote}
          </p>
        )}
      </div>

      {/* Deficiency risks */}
      {deficiencyRisks.filter(r => r.riskLevel === 'high').length > 0 && (
        <div className="bg-[#E85D3A]/5 border border-[#E85D3A]/15 rounded-2xl p-5 mb-6 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <h3 className="text-sm font-semibold text-[#E85D3A] mb-3 flex items-center gap-2">
            <ShieldAlert size={16} />
            关键缺乏风险
          </h3>
          <div className="space-y-2">
            {deficiencyRisks.filter(r => r.riskLevel === 'high').map((r, i) => (
              <p key={i} className="text-sm text-[#1B2A4A]">
                <span className="font-medium text-[#E85D3A]">{r.nutrientName}</span>：{r.reason}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* AI 增强报告 */}
      <AISection />

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-[#E8E3DB] overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="flex border-b border-[#E8E3DB]">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-[#2D9C6F] border-b-2 border-[#2D9C6F] bg-[#2D9C6F]/3'
                  : 'text-[#1B2A4A]/50 hover:text-[#1B2A4A]'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'supplements' && (
            <div className="space-y-6">
              {/* 补充剂仅为饮食的补充 */}
              <div className="p-3 bg-[#E85D3A]/5 border border-[#E85D3A]/15 rounded-xl">
                <p className="text-xs text-[#E85D3A] flex items-center gap-1">
                  <AlertTriangle size={12} /> 补充剂仅在饮食调整无法满足营养需求时考虑。请优先通过天然食物获取营养素。
                </p>
              </div>

              {plan.mergedSupplements.filter(s => s.level === 'core').length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#2D9C6F] mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#2D9C6F] rounded-full" />
                    必须补充
                  </h3>
                  {plan.mergedSupplements.filter(s => s.level === 'core').map(supp => (
                    <SupplementCard key={supp.name} supp={supp} expanded={expandedSupp === supp.name} onToggle={() => setExpandedSupp(expandedSupp === supp.name ? null : supp.name)} />
                  ))}
                </div>
              )}
              {plan.mergedSupplements.filter(s => s.level === 'conditional').length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#D4A853] mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#D4A853] rounded-full" />
                    条件补充
                  </h3>
                  {plan.mergedSupplements.filter(s => s.level === 'conditional').map(supp => (
                    <SupplementCard key={supp.name} supp={supp} expanded={expandedSupp === supp.name} onToggle={() => setExpandedSupp(expandedSupp === supp.name ? null : supp.name)} />
                  ))}
                </div>
              )}
              {plan.mergedSupplements.filter(s => s.level === 'optional').length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-300 rounded-full" />
                    可选补充
                  </h3>
                  {plan.mergedSupplements.filter(s => s.level === 'optional').map(supp => (
                    <SupplementCard key={supp.name} supp={supp} expanded={expandedSupp === supp.name} onToggle={() => setExpandedSupp(expandedSupp === supp.name ? null : supp.name)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'diet' && (
            <div className="space-y-6">

              {/* 饮食质量评分 */}
              {assessmentResult.dietQualityScore !== undefined && (
                <div className="p-4 bg-white border border-[#E8E3DB] rounded-xl">
                  <h3 className="text-sm font-semibold text-[#1B2A4A] mb-2 flex items-center gap-2">
                    <Apple size={14} /> 饮食质量评分
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className={`text-2xl font-bold ${
                      assessmentResult.dietQualityLevel === 'excellent' ? 'text-[#2D9C6F]' :
                      assessmentResult.dietQualityLevel === 'good' ? 'text-[#D4A853]' :
                      'text-[#E85D3A]'
                    }`}>
                      {assessmentResult.dietQualityScore}/100
                    </div>
                    <span className="text-sm text-[#1B2A4A]/60">
                      {assessmentResult.dietQualityLevel === 'excellent' ? '优秀' :
                       assessmentResult.dietQualityLevel === 'good' ? '良好' :
                       assessmentResult.dietQualityLevel === 'fair' ? '一般' : '较差'}
                    </span>
                  </div>
                  {assessmentResult.dietStrengths && assessmentResult.dietStrengths.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-[#2D9C6F] font-medium">饮食优势：</p>
                      {assessmentResult.dietStrengths.map((s, i) => (
                        <p key={i} className="text-xs text-[#1B2A4A]/70 mt-0.5">· {s}</p>
                      ))}
                    </div>
                  )}
                  {assessmentResult.dietWeaknesses && assessmentResult.dietWeaknesses.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-[#E85D3A] font-medium">需改进：</p>
                      {assessmentResult.dietWeaknesses.map((w, i) => (
                        <p key={i} className="text-xs text-[#1B2A4A]/70 mt-0.5">· {w}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 普通人群基线 */}
              {generalBaseline && !primaryPopulation && (
                <div className="p-4 bg-[#F0EDE5] rounded-xl border border-[#E8E3DB]">
                  <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3 flex items-center gap-2">
                    <Apple size={14} />
                    普通人群营养基线（{generalBaseline.ageLabel}）
                  </h3>
                  <div className="space-y-3 text-sm text-[#1B2A4A]/80">
                    <div>
                      <p className="text-xs font-medium text-[#1B2A4A]/40 mb-1">每日食物份量（参考《中国居民膳食指南 2022》）</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <div>🍚 谷薯类：{generalBaseline.dailyPortions.grains[0]}–{generalBaseline.dailyPortions.grains[1]}g</div>
                        <div>🥬 蔬菜：{generalBaseline.dailyPortions.vegetables[0]}–{generalBaseline.dailyPortions.vegetables[1]}g</div>
                        <div>🍎 水果：{generalBaseline.dailyPortions.fruits[0]}–{generalBaseline.dailyPortions.fruits[1]}g</div>
                        <div>🥩 蛋白质：{generalBaseline.dailyPortions.protein[0]}–{generalBaseline.dailyPortions.protein[1]}g</div>
                        <div>🥛 奶及奶制品：{generalBaseline.dailyPortions.dairy[0]}–{generalBaseline.dailyPortions.dairy[1]}ml</div>
                        <div>🥜 大豆坚果：{generalBaseline.dailyPortions.soyNuts[0]}–{generalBaseline.dailyPortions.soyNuts[1]}g</div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#1B2A4A]/40 mb-1">关键营养素（Top 4）</p>
                      {generalBaseline.keyNutrients.slice(0, 4).map((n, i) => (
                        <div key={i} className="mt-1">
                          <span className="font-medium text-sm">{n.nutrient}</span>
                          <span className="text-xs text-[#1B2A4A]/50 ml-1">{n.rni}</span>
                          <p className="text-xs text-[#1B2A4A]/60 mt-0.5">{n.whyImportant}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#1B2A4A]/40 mb-1">补充剂立场</p>
                      <p className="text-xs text-[#1B2A4A]/70 leading-relaxed">{generalBaseline.supplementGuidance}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">核心饮食原则</h3>
                {plan.dietSummary.length > 0 ? (
                  <div className="space-y-3">
                    {plan.dietSummary.map((item, i) => (
                      <div key={i} className="p-4 bg-[#FAF8F5] rounded-xl">
                        <p className="text-sm text-[#1B2A4A] leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-[#FAF8F5] rounded-xl text-center">
                    <p className="text-sm text-[#1B2A4A]/50 mb-3">暂无个性化饮食原则</p>
                    <Link to="/population/general" className="text-sm text-[#2D9C6F] hover:underline font-medium">
                      查看普通人群营养方案 →
                    </Link>
                  </div>
                )}
                {/* 链接到人群详细方案 */}
                {primaryPopulation && (
                  <div className="mt-3 text-right">
                    <Link
                      to={`/population/${primaryPopulation.category || 'general'}`}
                      className="text-xs text-[#2D9C6F] hover:underline inline-flex items-center gap-1"
                    >
                      查看「{primaryPopulation.populationName}」完整方案 <ArrowRight size={12} />
                    </Link>
                  </div>
                )}
              </div>

              <button
                onClick={() => setExpandedDiet(!expandedDiet)}
                className="w-full flex items-center justify-between p-4 bg-white border border-[#E8E3DB] rounded-xl text-sm text-[#1B2A4A]/60 hover:text-[#1B2A4A] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Apple size={16} />
                  查看推荐食物清单
                </span>
                {expandedDiet ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {expandedDiet && plan.plans.length > 0 && plan.plans[0].diet && (
                <div className="space-y-4">
                  {plan.plans[0].diet.foodsToEat?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-[#2D9C6F] mb-2">推荐食物</h4>
                      <div className="grid gap-2">
                        {plan.plans[0].diet.foodsToEat.map((f, i) => (
                          <div key={i} className="flex items-start gap-2 p-2 text-sm">
                            <span className="text-[#2D9C6F] mt-0.5">+</span>
                            <span>
                              <span className="font-medium">{f.name}</span>
                              <span className="text-[#1B2A4A]/40 ml-1">— {f.reason}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {plan.plans[0].diet.foodsToAvoid.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-[#E85D3A] mb-2">避免/限制食物</h4>
                      <div className="grid gap-2">
                        {plan.plans[0].diet.foodsToAvoid.map((f, i) => (
                          <div key={i} className="flex items-start gap-2 p-2 text-sm">
                            <span className="text-[#E85D3A] mt-0.5">−</span>
                            <span>
                              <span className="font-medium">{f.name}</span>
                              <span className="text-[#1B2A4A]/40 ml-1">— {f.reason}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'lifestyle' && (
            <div className="space-y-6">
              {plan.lifestyleSummary.length > 0 ? (
                plan.lifestyleSummary.map((item, i) => (
                  <div key={i} className="p-4 bg-[#FAF8F5] rounded-xl">
                    <p className="text-sm text-[#1B2A4A] leading-relaxed">{item}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-[#FAF8F5] rounded-xl text-center">
                  <p className="text-sm text-[#1B2A4A]/50 mb-3">暂无个性化生活建议</p>
                  <Link to="/population/general" className="text-sm text-[#2D9C6F] hover:underline font-medium">
                    查看普通人群生活方案 →
                  </Link>
                </div>
              )}

              {plan.monitoringPlan.length > 0 && (
                <div className="mt-6 p-4 bg-[#F0EDE5] rounded-xl">
                  <h4 className="text-sm font-semibold text-[#1B2A4A] mb-2 flex items-center gap-2">
                    <FlaskConical size={14} />
                    建议监测计划
                  </h4>
                  <ul className="space-y-1">
                    {plan.monitoringPlan.map((item, i) => (
                      <li key={i} className="text-sm text-[#1B2A4A]/70 flex items-start gap-2">
                        <span className="text-[#2D9C6F]">·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {plan.warningSigns.length > 0 && (
                <div className="mt-4 p-4 bg-[#E85D3A]/5 rounded-xl border border-[#E85D3A]/15">
                  <h4 className="text-sm font-semibold text-[#E85D3A] mb-2 flex items-center gap-2">
                    <ShieldAlert size={14} />
                    需要就医的情况
                  </h4>
                  <ul className="space-y-1">
                    {plan.warningSigns.map((item, i) => (
                      <li key={i} className="text-sm text-[#1B2A4A]/70 flex items-start gap-2">
                        <span className="text-[#E85D3A]">·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <button
          onClick={() => navigate('/plan')}
          className="px-8 py-4 bg-[#2D9C6F] text-white rounded-full text-lg font-medium hover:bg-[#247A58] transition-all shadow-lg shadow-[#2D9C6F]/20 flex items-center justify-center gap-2"
        >
          生成28天营养素指导方案
          <ArrowRight size={20} />
        </button>
        <button
          onClick={() => window.print()}
          className="px-8 py-4 border-2 border-[#E8E3DB] text-[#1B2A4A] rounded-full text-lg font-medium hover:border-[#2D9C6F] hover:text-[#2D9C6F] transition-all flex items-center justify-center gap-2 no-print"
        >
          <Printer size={20} />
          打印方案
        </button>
      </div>

      <div className="mt-12 p-6 bg-[#FAF8F5] rounded-2xl border border-[#E8E3DB]">
        <p className="text-sm text-[#1B2A4A]/50 leading-relaxed">
          <span className="font-semibold text-[#E85D3A]">重要提示：</span>
          本方案由NutriGuide基于科学循证文献和膳食指南自动生成，仅供参考和教育目的。
          不构成医疗诊断或治疗建议。任何营养素补充剂的使用均应在医生或注册营养师指导下进行。
          如您有已确诊疾病或正在服用处方药物，请在调整饮食或补充剂前咨询您的医生。
        </p>
      </div>
    </div>
  )
}

// 补充剂卡片组件
function SupplementCard({ supp, expanded, onToggle }: { supp: any; expanded: boolean; onToggle: () => void }) {
  const levelLabels: Record<string, string> = {
    core: '必须',
    conditional: '条件',
    optional: '可选',
  }

  return (
    <div className="mb-3 bg-[#FAF8F5] rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-[#F3F0EB] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            supp.level === 'core' ? 'bg-[#2D9C6F]/10 text-[#2D9C6F]' :
            supp.level === 'conditional' ? 'bg-[#D4A853]/10 text-[#D4A853]' : 'bg-gray-100 text-gray-400'
          }`}>
            {levelLabels[supp.level]}
          </span>
          <span className="font-medium text-[#1B2A4A] text-sm">{supp.name}</span>
          <span className="text-xs text-[#1B2A4A]/40">{supp.nameEn}</span>
        </div>
        {expanded ? <ChevronUp size={16} className="text-[#1B2A4A]/30" /> : <ChevronDown size={16} className="text-[#1B2A4A]/30" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2 text-sm">
          <p><span className="text-[#1B2A4A]/40">推荐剂量：</span>{supp.dosage}</p>
          <p><span className="text-[#1B2A4A]/40">剂型：</span>{supp.form}</p>
          <p><span className="text-[#1B2A4A]/40">服用时间：</span>{supp.timing}</p>
          {supp.drugInteraction && (
            <p className="text-[#E85D3A] text-xs">⚠ 服药注意：{supp.drugInteraction}</p>
          )}
          {supp.conflicts && (
            <p className="text-[#D4A853] text-xs">⚠ 合并人群注意：{supp.conflicts}</p>
          )}
          {supp.fromPopulations.length > 1 && (
            <p className="text-[#1B2A4A]/30 text-xs">来源人群：{supp.fromPopulations.join('、')}</p>
          )}
        </div>
      )}
    </div>
  )
}
