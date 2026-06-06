import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Save, Check, SkipForward, Upload, Clipboard,
} from 'lucide-react'
import {
  assessmentSteps, getEffectiveSteps,
  healthStatusLabel, diagnosisLabel, medicationLabel, supplementLabel, c1StageLabel,
  type AssessmentField,
} from '../data/assessment'
import { useAppStore } from '../stores/useAppStore'
import { useAuthStore } from '../stores/useAuthStore'
import { evaluateUser } from '../engine/ruleEngine'
import { generatePlan, generateAIPrompt } from '../engine/planGenerator'
import { api } from '../lib/api'

export default function AssessmentPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    currentStep, setCurrentStep,
    assessmentData, updateAssessmentData,
    saveDraft, loadDraft, isDraft,
    setAssessmentResult, setGeneratedPlan,
    setAIPlan, setAIModel, setAILoading, setAIError,
  } = useAppStore()

  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<string[]>([])
  const [hasDraft, setHasDraft] = useState(false)

  // 动态计算有效步骤（考虑分支跳过）
  const effectiveSteps = useMemo(
    () => getEffectiveSteps(formData),
    [formData['health_status']],
  )
  const totalSteps = effectiveSteps.length

  // 当前步骤配置
  const step = effectiveSteps[currentStep - 1] || effectiveSteps[0]
  // 进度
  const progress = totalSteps > 0 ? Math.round(((currentStep - 1) / totalSteps) * 100) : 0

  // ========== 初始化 ==========

  useEffect(() => {
    if (currentStep < 1 || currentStep > totalSteps) {
      setCurrentStep(1)
    }
  }, [totalSteps])

  // 检查草稿
  useEffect(() => {
    const draft = localStorage.getItem('nutriguide_draft')
    if (draft) setHasDraft(true)
  }, [])

  // 从全局 Store 恢复数据
  useEffect(() => {
    if (Object.keys(assessmentData).length > 0) {
      setFormData(prev => ({ ...prev, ...assessmentData }))
    }
  }, [assessmentData])

  // ========== 字段变更 ==========

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    setErrors([])
  }, [])

  // ========== 步骤校验 ==========

  const validateStep = (): boolean => {
    const errs: string[] = []

    if (step.id === 'basic_info') {
      const required = ['gender', 'age', 'height', 'weight']
      for (const id of required) {
        if (!formData[id] && formData[id] !== 0) {
          errs.push(`请填写：${step.fields.find(f => f.id === id)?.label || id}`)
        }
      }
    }

    if (step.id === 'health_branch') {
      if (!formData['health_status']) {
        errs.push('请选择最符合您目前情况的描述')
      }
    }

    if (step.id === 'health_problems') {
      const problems = formData['b1_problems']
      if (!Array.isArray(problems) || problems.length === 0) {
        errs.push('请选择至少一个健康问题或选择"以上均无"')
      }
    }

    if (step.id === 'special_period') {
      if (!formData['c1_stage']) {
        errs.push('请选择您目前的生理阶段')
      }
    }

    if (errs.length > 0) {
      setErrors(errs)
      return false
    }
    return true
  }

  // ========== 步骤导航 ==========

  const handleNext = () => {
    if (step.id !== 'welcome' && !validateStep()) return

    // 健康分流后重新计算有效步骤
    updateAssessmentData(formData)
    const newEffectiveSteps = getEffectiveSteps(formData)
    const newTotal = newEffectiveSteps.length

    if (currentStep < newTotal) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    } else {
      handleSubmit()
    }
  }

  const handlePrev = () => {
    updateAssessmentData(formData)
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  // 跳到下一步，同时更新 formData（用于 navigate 后立即生效）
  const handleSkipToNext = () => {
    updateAssessmentData(formData)
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  // ========== 提交 ==========

  const handleSubmit = async () => {
    setAILoading(true)
    setAIError(null)

    const allData: Record<string, any> = { ...formData }
    updateAssessmentData(allData)

    // 运行规则引擎
    const result = evaluateUser(allData)
    setAssessmentResult(result)

    // 生成本地方案
    const plan = generatePlan(result)
    setGeneratedPlan(plan)

    // 清除草稿
    localStorage.removeItem('nutriguide_draft')

    // 立即跳转结果页
    navigate('/results')

    // 后台保存
    let savedId: number | null = null
    try {
      const saved = await api.saveAssessment({
        stepData: allData,
        result: {
          userProfile: result.userProfile,
          primaryPopulation: result.primaryPopulation,
          secondaryPopulations: result.secondaryPopulations,
          deficiencyRisks: result.deficiencyRisks,
          generalBaseline: result.generalBaseline,
          dietQualityScore: result.dietQualityScore,
          dietQualityLevel: result.dietQualityLevel,
        },
      })
      savedId = saved.id
      console.log('自测结果已保存到服务器，ID:', savedId)
    } catch (e: any) {
      console.warn('保存自测结果失败:', e.message)
    }

    // 后台调用 LLM
    try {
      const aiPrompt = generateAIPrompt(result, plan)
      const aiResult = await api.generatePlan(aiPrompt)
      if (aiResult.plan) {
        setAIPlan(aiResult.plan)
        setAIModel(aiResult.model || null)
        if (savedId) {
          try {
            await api.updateAssessmentReport(savedId, aiResult.plan)
          } catch (e: any) {
            console.warn('保存 AI 报告失败:', e.message)
          }
        }
      }
    } catch (e: any) {
      console.log('AI 报告不可用，使用本地模板:', e.message)
      setAIError(e.message)
    } finally {
      setAILoading(false)
    }
  }

  // ========== 草稿 ==========

  const handleLoadDraft = () => {
    const ok = loadDraft()
    if (ok) {
      const draft = JSON.parse(localStorage.getItem('nutriguide_draft') || '{}')
      setFormData(draft)
    }
  }

  const handleSaveDraft = () => {
    updateAssessmentData(formData)
    saveDraft()
  }

  // ========== 动态可见字段 ==========

  const visibleFields = step.fields.filter(f => {
    if (f.showCondition) {
      const fv = formData[f.showCondition.field]
      const cv = f.showCondition.value
      if (typeof cv === 'string') return fv === cv
      return Array.isArray(cv) ? cv.includes(fv) : false
    }
    return true
  })

  // ========== 渲染 ==========

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* ─── 进度条 ─── */}
      {step.id !== 'welcome' && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#1B2A4A]/50">
              第 {currentStep} 步 / 共 {totalSteps} 步
            </span>
            <span className="text-sm text-[#1B2A4A]/50">{progress}%</span>
          </div>
          <div className="h-2 bg-[#E8E3DB] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2D9C6F] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* ─── 草稿提示 ─── */}
      {hasDraft && currentStep === 1 && (
        <div className="mb-6 p-4 bg-[#D4A853]/10 border border-[#D4A853]/30 rounded-xl flex items-center justify-between">
          <span className="text-sm text-[#1B2A4A]">检测到未完成的评估草稿</span>
          <button
            onClick={handleLoadDraft}
            className="text-sm font-medium text-[#D4A853] hover:underline"
          >
            恢复草稿
          </button>
        </div>
      )}

      {/* ─── 步骤标题 ─── */}
      {step.id !== 'welcome' && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1B2A4A] tracking-tight">{step.title}</h1>
          <p className="mt-2 text-[#1B2A4A]/60">{step.description}</p>
        </div>
      )}

      {/* ─── 错误提示 ─── */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-[#E85D3A]/5 border border-[#E85D3A]/20 rounded-xl">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-[#E85D3A]">{err}</p>
          ))}
        </div>
      )}

      {/* ─── 表单主体 ─── */}
      <div className="space-y-8">
        {/* ── 欢迎页 ── */}
        {step.id === 'welcome' && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#2D9C6F]/10 flex items-center justify-center">
              <Clipboard size={36} className="text-[#2D9C6F]" />
            </div>
            <h1 className="text-3xl font-bold text-[#1B2A4A] mb-4">欢迎开始营养评估</h1>
            <p className="text-[#1B2A4A]/60 max-w-md mx-auto leading-relaxed">
              {step.description}
              <br />
              <span className="text-sm text-[#1B2A4A]/40 mt-2 block">
                全程约 3-4 分钟，请根据实际情况作答。
              </span>
            </p>
            <button
              onClick={handleNext}
              className="mt-10 px-10 py-4 bg-[#2D9C6F] text-white rounded-full text-lg font-medium hover:bg-[#247A58] transition-all shadow-lg shadow-[#2D9C6F]/25"
            >
              开始评估
            </button>
          </div>
        )}

        {/* ── 确认页 ── */}
        {step.id === 'summary' && (
          <SummaryView
            formData={formData}
            effectiveSteps={effectiveSteps}
          />
        )}

        {/* ── 普通字段 ── */}
        {step.id !== 'welcome' && step.id !== 'summary' && (
          visibleFields.map((field, idx) => (
            <div key={field.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
              <label htmlFor={field.id} className="block text-sm font-medium text-[#1B2A4A] mb-2">
                {field.label}
                {field.required && <span className="text-[#E85D3A] ml-1">*</span>}
              </label>
              {field.description && (
                <p className="text-xs text-[#1B2A4A]/40 mb-2">{field.description}</p>
              )}
              {renderField(field)}
            </div>
          ))
        )}

        {/* 无内容时 */}
        {step.id !== 'welcome' && step.id !== 'summary' && visibleFields.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[#1B2A4A]/50">当前步骤无需要填写的内容。</p>
            <p className="text-sm text-[#1B2A4A]/30 mt-1">点击"下一步"继续。</p>
          </div>
        )}
      </div>

      {/* ─── 导航按钮 ─── */}
      {step.id !== 'welcome' && (
        <div className="mt-12 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all ${
              currentStep === 1
                ? 'text-[#1B2A4A]/20 cursor-not-allowed'
                : 'text-[#1B2A4A]/60 hover:text-[#1B2A4A] hover:bg-[#F3F0EB]'
            }`}
          >
            <ArrowLeft size={18} />
            上一步
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 px-4 py-3 text-sm text-[#1B2A4A]/50 hover:text-[#1B2A4A] transition-colors"
            >
              <Save size={16} />
              保存草稿
            </button>

            {/* 跳过按钮（可选步骤） */}
            {step.id === 'exam_upload' && (
              <button
                onClick={handleSkipToNext}
                className="flex items-center gap-1.5 px-4 py-3 text-sm text-[#1B2A4A]/40 hover:text-[#1B2A4A]/60 transition-colors"
              >
                <SkipForward size={16} />
                跳过
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-[#2D9C6F] text-white rounded-full text-sm font-medium hover:bg-[#247A58] transition-all shadow-md shadow-[#2D9C6F]/20"
            >
              {currentStep === totalSteps ? (
                <>
                  查看结果
                  <Check size={18} />
                </>
              ) : (
                <>
                  下一步
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )

  // ========== 字段渲染 ==========

  function renderField(field: AssessmentField) {
    const value = formData[field.id] || ''
    const gender = formData['gender'] as string | undefined

    // 根据性别过滤选项：男性隐藏 femaleOnly 选项
    const filteredOptions = (field.options || []).filter(opt => {
      if (opt.femaleOnly && gender === 'male') return false
      return true
    })

    switch (field.type) {
      case 'select':
        return (
          <select
            id={field.id}
            value={value}
            onChange={e => handleFieldChange(field.id, e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[#E8E3DB] bg-white text-[#1B2A4A] focus:border-[#2D9C6F] focus:ring-2 focus:ring-[#2D9C6F]/20 transition-all outline-none appearance-none"
          >
            <option value="">请选择...</option>
            {filteredOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )

      case 'multiselect':
        return (
          <div className="space-y-2">
            {filteredOptions.map(opt => {
              const selected = Array.isArray(value) ? value.includes(opt.value) : false
              return (
                <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selected ? 'border-[#2D9C6F] bg-[#2D9C6F]/5' : 'border-[#E8E3DB] bg-white hover:border-[#2D9C6F]/30'
                }`}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => {
                      const current = Array.isArray(value) ? [...value] : []
                      if (selected) {
                        handleFieldChange(field.id, current.filter(v => v !== opt.value))
                      } else {
                        if (opt.value === 'none') {
                          handleFieldChange(field.id, ['none'])
                        } else {
                          handleFieldChange(field.id, [...current.filter(v => v !== 'none'), opt.value])
                        }
                      }
                    }}
                    className="w-4 h-4 text-[#2D9C6F] rounded accent-[#2D9C6F]"
                  />
                  <span className="text-sm text-[#1B2A4A]">{opt.label}</span>
                </label>
              )
            })}
          </div>
        )

      case 'radio':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleFieldChange(field.id, opt.value)}
                className={`px-4 py-3 rounded-xl border text-sm transition-all text-left ${
                  value === opt.value
                    ? 'border-[#2D9C6F] bg-[#2D9C6F]/5 text-[#2D9C6F] font-medium'
                    : 'border-[#E8E3DB] bg-white text-[#1B2A4A]/70 hover:border-[#2D9C6F]/30'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )

      case 'number':
        return (
          <div className="relative">
            <input
              type="number"
              id={field.id}
              min={field.min}
              max={field.max}
              value={value}
              onChange={e => handleFieldChange(field.id, e.target.value)}
              className="w-full px-4 py-3 pr-16 rounded-xl border border-[#E8E3DB] bg-white text-[#1B2A4A] focus:border-[#2D9C6F] focus:ring-2 focus:ring-[#2D9C6F]/20 transition-all outline-none"
              placeholder={field.placeholder || '请输入'}
            />
            {field.unit && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#1B2A4A]/40">{field.unit}</span>
            )}
          </div>
        )

      case 'upload':
        return (
          <div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed border-[#E8E3DB] rounded-2xl bg-[#FAF8F5]">
            <Upload size={32} className="text-[#1B2A4A]/20" />
            <p className="text-sm text-[#1B2A4A]/50">点击或拖拽上传图片/PDF</p>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleFieldChange(field.id, { file, name: file.name })
              }}
              className="text-sm text-[#1B2A4A]/40 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-[#2D9C6F]/10 file:text-[#2D9C6F]"
            />
            {formData[field.id]?.name && (
              <p className="text-xs text-[#2D9C6F]">已选择：{formData[field.id].name}</p>
            )}
          </div>
        )

      default:
        return (
          <input
            type="text"
            id={field.id}
            value={value}
            onChange={e => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || ''}
            className="w-full px-4 py-3 rounded-xl border border-[#E8E3DB] bg-white text-[#1B2A4A] focus:border-[#2D9C6F] focus:ring-2 focus:ring-[#2D9C6F]/20 transition-all outline-none"
          />
        )
    }
  }
}

// ══════════════════════════════════════════════
// 确认信息组件
// ══════════════════════════════════════════════

function SummaryView({
  formData,
  effectiveSteps,
}: {
  formData: Record<string, any>
  effectiveSteps: { id: string }[]
}) {
  const gender = formData['gender']
  const healthStatus = formData['health_status']

  return (
    <div className="space-y-6">
      {/* 基础信息 */}
      <Section title="基础信息">
        <SummaryRow label="性别" value={gender === 'female' ? '女' : gender === 'male' ? '男' : '未填'} />
        <SummaryRow label="年龄" value={formData['age'] ? `${formData['age']} 岁` : '未填'} />
        <SummaryRow label="身高/体重" value={formData['height'] && formData['weight']
          ? `${formData['height']}cm / ${formData['weight']}kg（BMI ${calcBMI(formData['height'], formData['weight'])}）`
          : '未填'}
        />
        <SummaryRow label="健康状态" value={healthStatusLabel(healthStatus) || '未选'} />
      </Section>

      {/* 模块 A：亚健康症状 */}
      {healthStatus === 'daily_wellness' && (
        <Section title="身体感受">
          {formData['a4_weight_goal'] && <SummaryRow label="体重目标" value={weightGoalLabel(formData['a4_weight_goal'])} />}
          {formData['a1_fatigue'] && <SummaryRow label="疲劳" value={freqLabel(formData['a1_fatigue'])} />}
          {formData['a2_sleep'] && <SummaryRow label="睡眠" value={sleepLabel(formData['a2_sleep'])} />}
          {formData['a3_mood'] && <SummaryRow label="情绪" value={moodLabel(formData['a3_mood'])} />}
          {formData['a5_gi'] && <SummaryRow label="肠胃" value={freqLabel(formData['a5_gi'])} />}
          {formData['a6_skin_hair'] && <SummaryRow label="皮肤/脱发" value={severityLabel(formData['a6_skin_hair'])} />}
          {formData['a7_temp'] && <SummaryRow label="温度感知" value={tempLabel(formData['a7_temp'])} />}
          {formData['a8_pain'] && <SummaryRow label="肌肉/关节" value={freqLabel(formData['a8_pain'])} />}
          {formData['a9_headache'] && <SummaryRow label="头痛" value={freqLabel(formData['a9_headache'])} />}
        </Section>
      )}

      {/* 模块 B：健康问题 */}
      {healthStatus === 'diagnosed' && (
        <Section title="已有健康问题">
          {Array.isArray(formData['b1_problems']) && formData['b1_problems'].length > 0 && (
            <div className="flex flex-wrap gap-1">
              {formData['b1_problems'].map((d: string) => (
                <span key={d} className="inline-block px-2 py-1 bg-[#E8F0EB]/40 text-[#7A8B6F] rounded-lg text-xs">
                  {diagnosisLabel(d)}
                </span>
              ))}
            </div>
          )}
          {formData['b2_control'] && <SummaryRow label="控制情况" value={controlLabel(formData['b2_control'])} />}
        </Section>
      )}

      {/* 模块 C：特殊时期 */}
      {healthStatus === 'special_period' && (
        <Section title="特殊时期">
          {formData['c1_stage'] && <SummaryRow label="阶段" value={c1StageLabel(formData['c1_stage'])} />}
          {formData['c2_pregnant_week'] && <SummaryRow label="孕周" value={`${formData['c2_pregnant_week']} 周`} />}
          {formData['c2_lactation_month'] && <SummaryRow label="产后" value={`${formData['c2_lactation_month']} 个月`} />}
          {formData['c2_morning_sickness'] && <SummaryRow label="孕吐" value={freqLabel(formData['c2_morning_sickness'])} />}
          {Array.isArray(formData['c3_menopause_symptoms']) && formData['c3_menopause_symptoms'].length > 0 && (
            <div className="flex flex-wrap gap-1">
              {formData['c3_menopause_symptoms'].map((s: string) => (
                <span key={s} className="inline-block px-2 py-1 bg-[#E8F0EB]/40 text-[#7A8B6F] rounded-lg text-xs">
                  {menopauseSymptomLabel(s)}
                </span>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* 饮食 */}
      {formData['d1_diet_mode'] && (
        <Section title="饮食">
          <SummaryRow label="饮食模式" value={dietModeLabel(formData['d1_diet_mode'])} />
          {formData['d2_vegetables'] && <SummaryRow label="蔬菜" value={formData['d2_vegetables']} />}
          {formData['d3_fruits'] && <SummaryRow label="水果" value={formData['d3_fruits']} />}
          {formData['d4_staples'] && <SummaryRow label="主食" value={stapleLabel(formData['d4_staples'])} />}
          {formData['d5_sugar_drinks'] && <SummaryRow label="含糖饮品" value={formData['d5_sugar_drinks']} />}
        </Section>
      )}

      {/* 生活方式 */}
      {(formData['e1_exercise'] || formData['e4_smoking']) && (
        <Section title="生活方式">
          {formData['e1_exercise'] && <SummaryRow label="运动" value={formData['e1_exercise']} />}
          {formData['e2_sleep_hours'] && <SummaryRow label="睡眠" value={formData['e2_sleep_hours']} />}
          {formData['e3_stress'] && <SummaryRow label="压力" value={formData['e3_stress']} />}
          {formData['e4_smoking'] && <SummaryRow label="吸烟" value={formData['e4_smoking']} />}
          {formData['e5_alcohol'] && <SummaryRow label="饮酒" value={formData['e5_alcohol']} />}
        </Section>
      )}

      {/* 补充剂 & 药物 */}
      <Section title="补充剂与药物">
        {Array.isArray(formData['f1_supplements']) && formData['f1_supplements'].length > 0 && (
          <div className="flex flex-wrap gap-1">
            {formData['f1_supplements'].map((s: string) => (
              <span key={s} className="inline-block px-2 py-1 bg-[#F3F0EB] text-[#1B2A4A]/70 rounded-lg text-xs">
                {supplementLabel(s)}
              </span>
            ))}
          </div>
        )}
        {Array.isArray(formData['f2_medications']) && formData['f2_medications'].length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {formData['f2_medications'].map((m: string) => (
              <span key={m} className="inline-block px-2 py-1 bg-[#E85D3A]/10 text-[#E85D3A] rounded-lg text-xs">
                {medicationLabel(m)}
              </span>
            ))}
          </div>
        )}
      </Section>

      {/* 体检 */}
      {formData['exam_report']?.name && (
        <Section title="体检报告">
          <SummaryRow label="文件" value={formData['exam_report'].name} />
        </Section>
      )}

      <p className="text-xs text-[#1B2A4A]/40 text-center">如需修改，请点击「上一步」返回调整。</p>
    </div>
  )
}

// ─── Summary 辅助组件 ───

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  if (!children) return null
  return (
    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E3DB]">
      <h3 className="text-xs font-semibold text-[#1B2A4A]/40 uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-xs text-[#1B2A4A]/50">{label}</span>
      <span className="text-xs text-[#1B2A4A] font-medium">{value}</span>
    </div>
  )
}

// ─── 标签映射 ───

function calcBMI(hCm: number, wKg: number): string {
  if (!hCm || !wKg) return '-'
  return (wKg / ((hCm / 100) ** 2)).toFixed(1)
}

function freqLabel(v: string): string {
  const m: Record<string, string> = { none: '无', occasional: '偶尔', frequent: '经常', daily: '每天' }
  return m[v] || v
}

function sleepLabel(v: string): string {
  const m: Record<string, string> = { none: '无困扰', hard_to_fall: '入睡困难', wake_up: '夜间易醒/早醒', both: '入睡困难+易醒' }
  return m[v] || v
}

function moodLabel(v: string): string {
  const m: Record<string, string> = { stable: '平稳', occasional: '偶尔低落/紧张', persistent: '持续低落/焦虑' }
  return m[v] || v
}

function weightGoalLabel(v: string): string {
  const m: Record<string, string> = { satisfied: '满意', lose: '希望减重', gain_muscle: '希望增肌/塑形', unexplained: '不明原因变化' }
  return m[v] || v
}

function severityLabel(v: string): string {
  const m: Record<string, string> = { none: '无', mild: '轻度', moderate: '中度以上' }
  return m[v] || v
}

function tempLabel(v: string): string {
  const m: Record<string, string> = { normal: '正常', cold: '怕冷', hot: '怕热', both: '两者都有' }
  return m[v] || v
}

function controlLabel(v: string): string {
  const m: Record<string, string> = { good: '良好', fair: '一般', poor: '需改善' }
  return m[v] || v
}

function menopauseSymptomLabel(v: string): string {
  const m: Record<string, string> = {
    hot_flashes: '潮热盗汗', mood_swings: '情绪波动', insomnia: '失眠', joint_pain: '关节疼痛', dryness: '阴道干涩',
  }
  return m[v] || v
}

function dietModeLabel(v: string): string {
  const m: Record<string, string> = { omnivore: '杂食', lacto_ovo: '蛋奶素', vegan: '纯素', pescatarian: '鱼素' }
  return m[v] || v
}

function stapleLabel(v: string): string {
  const m: Record<string, string> = { refined: '精白米面', half_half: '粗精各半', whole_grain: '全谷物为主' }
  return m[v] || v
}
