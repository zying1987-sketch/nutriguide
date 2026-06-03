import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Copy, Download, RefreshCw, AlertCircle, CheckCircle, Clock, Pill, Apple, Dumbbell, Moon, Stethoscope } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'
import { useAuthStore } from '../stores/useAuthStore'
import { api } from '../lib/api'
import { generateAIPrompt } from '../engine/planGenerator'

const weekIcons = [Pill, Apple, Dumbbell, Moon]

export default function PlanPage() {
  const navigate = useNavigate()
  const { assessmentResult, generatedPlan, aiPlan, aiLoading, aiError, setAIPlan, setAILoading, setAIError } = useAppStore()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!assessmentResult || !generatedPlan) {
      navigate('/assessment')
      return
    }
  }, [assessmentResult, generatedPlan, navigate])

  const generateLLMPlan = useCallback(async () => {
    if (!assessmentResult || !generatedPlan) return

    setAILoading(true)
    setAIError(null)

    try {
      const prompt = generateAIPrompt(assessmentResult, generatedPlan)

      // 尝试调用后端 LLM API，失败则使用本地模板方案
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) throw new Error('API调用失败')

      const data = await response.json()
      setAIPlan(data.plan)
      savePlanToBackend(data.plan)
    } catch (error: any) {
      // API不可用时生成本地模板方案
      console.log('LLM API不可用，使用本地模板方案')
      const localPlan = generateLocalPlan()
      setAIPlan(localPlan)
      savePlanToBackend(localPlan)
    } finally {
      setAILoading(false)
    }
  }, [assessmentResult, generatedPlan, setAIPlan, setAILoading, setAIError])

  // 本地模板方案 - LLM不可用时的fallback
  function generateLocalPlan(): string {
    const plan = generatedPlan!
    const { userProfile } = assessmentResult!

    const coreSupps = (plan.mergedSupplements || []).filter(s => s.level === 'core')
    const condSupps = (plan.mergedSupplements || []).filter(s => s.level === 'conditional')

    let output = `# 28天个性化营养素指导方案

## 用户画像
- 年龄：${userProfile.age}岁 | BMI：${userProfile.bmi}
- 健康标签：${plan.userLabel}
- 生成日期：${new Date().toLocaleDateString('zh-CN')}

---

## 每周补充剂日程

### 核心补充剂（每日服用）
${coreSupps.map(s => `- **${s.name}**：${s.dosage} | ${s.form} | ${s.timing}${s.drugInteraction ? ` | ⚠️ ${s.drugInteraction}` : ''}`).join('\n')}

${condSupps.length > 0 ? `### 条件补充剂（按需服用）
${condSupps.map(s => `- **${s.name}**：${s.dosage} | ${s.form} | ${s.timing}`).join('\n')}` : ''}

---

## 第1周：建立基础

### 饮食重点
${plan.dietSummary.slice(0, 3).map(d => `- ${d}`).join('\n')}

### 生活方式目标
${plan.lifestyleSummary.slice(0, 2).map(l => `- ${l}`).join('\n')}

### 本周小目标
- 开始按日程服用核心补充剂，设置手机提醒
- 每日饮水1.5-2L
- 记录3天饮食日记，了解当前营养摄入

---

## 第2周：饮食优化

### 饮食重点
${plan.dietSummary.slice(3, 6).map(d => `- ${d}`).join('\n') || plan.dietSummary.slice(0, 3).map(d => `- ${d}`).join('\n')}

### 生活方式目标
${plan.lifestyleSummary.slice(2, 4). map(l => `- ${l}`).join('\n') || plan.lifestyleSummary.slice(0, 2).map(l => `- ${l}`).join('\n')}

### 本周小目标
- 实践推荐的饮食原则，每餐搭配优质蛋白+复合碳水
- 增加2-3种推荐食物进入日常菜单
- 开始温和运动计划

---

## 第3周：强化执行

### 饮食重点
- 回顾前两周饮食记录，识别薄弱环节
- 尝试1-2个推荐食谱
- 逐步减少避免食物清单中的项目

### 生活方式目标
${plan.lifestyleSummary.slice(4, 6).map(l => `- ${l}`).join('\n') || '- 保持运动习惯，逐步增加强度\n- 确保每晚7-9小时睡眠'}

### 本周小目标
- 本周至少4天完全按方案执行
- 增加运动频率或强度10%
- 开始正念冥想练习（每日5-10分钟）

---

## 第4周：巩固与评估

### 饮食回顾
- 评估28天以来的变化：精力、情绪、消化、月经（如适用）
- 确定可持续执行的饮食习惯
- 制定下月调整计划

### 监测提醒
${plan.monitoringPlan.map(m => `- ${m}`).join('\n')}

---

## 注意事项与就医提醒

${plan.warningSigns.map(w => `- ${w}`).join('\n')}

---

## 推荐食物清单
${plan.plans[0]?.diet.foodsToEat.map(f => `- **${f.name}**：${f.reason}`).join('\n') || '- 根据您的人群匹配，请参阅结果页推荐食物'}

## 避免食物
${plan.plans[0]?.diet.foodsToAvoid.map(f => `- **${f.name}**：${f.reason}`).join('\n') || '- 根据您的人群匹配，请参阅结果页避免食物'}

---

> ⚠️ **重要提示**：本方案由NutriGuide基于科学循证文献和膳食指南自动生成，仅供参考和教育目的。不构成医疗诊断或治疗建议。任何营养素补充剂的使用均应在医生或注册营养师指导下进行。请在开始任何补充剂前咨询您的医生。`

    return output
  }

  // 生成后自动保存到后端
  const savePlanToBackend = useCallback(async (planText: string) => {
    const { user } = useAuthStore.getState()
    const { assessmentId, generatedPlan, markPlanSaved } = useAppStore.getState()
    if (!user || !generatedPlan) return

    try {
      await api.savePlan({
        populationTags: generatedPlan.plans?.map(p => p.id).join(',') || '',
        planData: {
          generatedPlan,
          aiPlan: planText,
          assessmentId,
        },
      })
      markPlanSaved()
    } catch (err) {
      console.error('保存方案失败:', err)
    }
  }, [])

  const handleCopy = () => {
    if (aiPlan) {
      try {
        navigator.clipboard?.writeText(aiPlan)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // clipboard API 不可用（非HTTPS或权限不足），静默忽略
      }
    }
  }

  if (!assessmentResult || !generatedPlan) return null

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E85D3A]/10 text-[#E85D3A] text-xs font-medium mb-4">
          <Sparkles size={14} />
          AI 智能生成
        </div>
        <h1 className="text-3xl font-bold text-[#1B2A4A] tracking-tight">28天营养素指导方案</h1>
        <p className="mt-2 text-[#1B2A4A]/50">
          基于 {generatedPlan.userLabel} 的知识库，为你生成4周的个性化方案
        </p>
      </div>

      {/* Generate button */}
      {!aiPlan && !aiLoading && (
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <div className="bg-white rounded-2xl border border-[#E8E3DB] p-8 mb-6">
            <div className="w-16 h-16 bg-[#2D9C6F]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles size={32} className="text-[#2D9C6F]" />
            </div>
            <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2">准备生成你的专属28天方案</h2>
            <p className="text-sm text-[#1B2A4A]/50 mb-6">
              系统将从知识库中调取{generatedPlan.plans.map(p => p.name).join('、')}的详细方案，
              由AI整合生成包含补充剂日程、每周饮食重点、生活方式目标和监测计划的完整28天指导。
            </p>
            <button
              onClick={generateLLMPlan}
              className="px-8 py-4 bg-[#1B2A4A] text-white rounded-full text-base font-medium hover:bg-[#2A3A5A] transition-all shadow-lg shadow-[#1B2A4A]/20 flex items-center gap-2 mx-auto"
            >
              <Sparkles size={18} />
              生成我的28天方案
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['营养素补充', '饮食指导', '运动建议', '监测计划'].map((item, i) => (
              <div key={i} className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E3DB] text-center">
                <span className="text-xs text-[#1B2A4A]/50">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {aiLoading && (
        <div className="text-center py-16 animate-fade-in-up">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="w-16 h-16 border-4 border-[#E8E3DB] rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-[#2D9C6F] rounded-full border-t-transparent animate-spin" />
          </div>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2">正在生成你的专属方案...</h2>
          <p className="text-sm text-[#1B2A4A]/50">系统正在分析知识库数据并生成28天个性化方案</p>
          <div className="mt-6 flex justify-center gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 bg-[#2D9C6F] rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {aiError && (
        <div className="bg-[#E85D3A]/5 border border-[#E85D3A]/20 rounded-2xl p-6 text-center animate-fade-in-up">
          <AlertCircle size={32} className="text-[#E85D3A] mx-auto mb-3" />
          <h3 className="font-semibold text-[#1B2A4A] mb-2">生成失败</h3>
          <p className="text-sm text-[#1B2A4A]/60 mb-4">{aiError}</p>
          <button
            onClick={generateLLMPlan}
            className="px-6 py-2.5 bg-[#1B2A4A] text-white rounded-full text-sm font-medium hover:bg-[#2A3A5A] transition-all flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={16} />
            重试
          </button>
        </div>
      )}

      {/* AI Plan result */}
      {aiPlan && (
        <div className="animate-fade-in-up">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-xl border border-[#E8E3DB] no-print">
            <span className="text-sm text-[#2D9C6F] flex items-center gap-1.5">
              <CheckCircle size={14} />
              方案已生成
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-2 text-[#1B2A4A]/50 hover:text-[#1B2A4A] transition-colors rounded-lg hover:bg-[#F3F0EB]"
                title="复制"
              >
                {copied ? <CheckCircle size={18} className="text-[#2D9C6F]" /> : <Copy size={18} />}
              </button>
              <button
                onClick={generateLLMPlan}
                className="p-2 text-[#1B2A4A]/50 hover:text-[#1B2A4A] transition-colors rounded-lg hover:bg-[#F3F0EB]"
                title="重新生成"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {/* Plan content */}
          <div className="bg-white rounded-2xl border border-[#E8E3DB] p-8 prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-[#1B2A4A] leading-relaxed text-sm" style={{ fontFamily: 'system-ui, sans-serif' }}>
              {renderMarkdown(aiPlan)}
            </div>
          </div>

          {/* Bottom disclaimer */}
          <div className="mt-8 p-6 bg-[#FAF8F5] rounded-2xl border border-[#E8E3DB] text-center">
            <p className="text-sm text-[#1B2A4A]/50 leading-relaxed">
              <span className="font-semibold text-[#E85D3A]">重要提示：</span>
              本方案由NutriGuide基于知识库自动生成，仅供参考和教育目的。
              请在开始任何补充剂或饮食调整前咨询您的医生或注册营养师。
            </p>
          </div>

          <div className="mt-6 flex justify-center gap-4 no-print">
            <button
              onClick={() => window.print()}
              className="px-6 py-3 border-2 border-[#E8E3DB] text-[#1B2A4A] rounded-full font-medium hover:border-[#2D9C6F] hover:text-[#2D9C6F] transition-all flex items-center gap-2"
            >
              <Download size={18} />
              打印/导出PDF
            </button>
            <button
              onClick={() => navigate('/results')}
              className="px-6 py-3 text-[#1B2A4A]/50 hover:text-[#1B2A4A] transition-colors"
            >
              返回结果页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// 简易 Markdown 渲染
function renderMarkdown(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    // Headers
    if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold text-[#1B2A4A] mt-8 mb-4">{line.slice(2)}</h1>
    if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-[#1B2A4A] mt-6 mb-3 pb-2 border-b border-[#E8E3DB]">{line.slice(3)}</h2>
    if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold text-[#1B2A4A] mt-4 mb-2">{line.slice(4)}</h3>

    // Horizontal rule
    if (line === '---') return <hr key={i} className="my-6 border-[#E8E3DB]" />

    // Bold
    const parts = line.split(/(\*\*[^*]+\*\*)/g)

    return (
      <p key={i} className="mb-2 leading-relaxed">
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
          }
          // Warn emoji styling
          if (part.includes('⚠️')) {
            return <span key={j} className="text-[#E85D3A]">{part}</span>
          }
          return <span key={j}>{part}</span>
        })}
      </p>
    )
  })
}
