import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, Pill, Apple, Activity, ArrowRight, ChevronDown, ChevronUp, ShieldAlert, FlaskConical, Printer } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'
import { useAuthStore } from '../stores/useAuthStore'
import { api } from '../lib/api'

type Tab = 'supplements' | 'diet' | 'lifestyle'

export default function ResultsPage() {
  const navigate = useNavigate()
  const { assessmentResult, generatedPlan, assessmentId, setAssessmentId } = useAppStore()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>('supplements')
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

  if (!assessmentResult || !generatedPlan) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-[#1B2A4A] mb-4">暂无评估结果</h1>
        <p className="text-[#1B2A4A]/60 mb-8">请先完成自测问卷</p>
        <Link to="/assessment" className="px-6 py-3 bg-[#2D9C6F] text-white rounded-full font-medium no-underline">
          开始自测
        </Link>
      </div>
    )
  }

  const { userProfile, primaryPopulation, secondaryPopulations, deficiencyRisks } = assessmentResult
  const plan = generatedPlan

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'supplements', label: '营养素方案', icon: Pill },
    { key: 'diet', label: '饮食建议', icon: Apple },
    { key: 'lifestyle', label: '生活方式', icon: Activity },
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
          {plan.plans.map((p, i) => (
            <span key={p.id} className={`px-4 py-2 rounded-full text-sm font-medium ${
              i === 0
                ? 'bg-[#1B2A4A] text-white'
                : 'bg-[#FAF8F5] text-[#1B2A4A] border border-[#E8E3DB]'
            }`}>
              {p.name}
            </span>
          ))}
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
              <div>
                <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">核心饮食原则</h3>
                <div className="space-y-3">
                  {plan.dietSummary.map((item, i) => (
                    <div key={i} className="p-4 bg-[#FAF8F5] rounded-xl">
                      <p className="text-sm text-[#1B2A4A] leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
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

              {expandedDiet && plan.plans.length > 0 && (
                <div className="space-y-4">
                  {plan.plans[0].diet.foodsToEat.length > 0 && (
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
              {plan.lifestyleSummary.map((item, i) => (
                <div key={i} className="p-4 bg-[#FAF8F5] rounded-xl">
                  <p className="text-sm text-[#1B2A4A] leading-relaxed">{item}</p>
                </div>
              ))}

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
