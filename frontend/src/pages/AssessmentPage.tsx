import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Save, Check, HelpCircle, SkipForward, Loader2,
} from 'lucide-react'
import { assessmentSteps, type AssessmentField } from '../data/assessment'
import { getCoreNeeds, getFollowUpQuestions, type CoreNeed, type FollowUpQuestion } from '../data/coreNeeds'
import { useAppStore } from '../stores/useAppStore'
import { useAuthStore } from '../stores/useAuthStore'
import { evaluateUser } from '../engine/ruleEngine'
import { generatePlan, generateAIPrompt } from '../engine/planGenerator'
import { api } from '../lib/api'

// ─── 追问回答的本地 State 类型 ───
interface FollowUpAnswers {
  [needId: string]: Record<string, any>
}

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

  // 表单主数据
  const [formData, setFormData] = useState<Record<string, any>>({})
  // 报错
  const [errors, setErrors] = useState<string[]>([])
  // 是否有草稿
  const [hasDraft, setHasDraft] = useState(false)

  // ─── PRD 新字段 ───
  // 当前步骤已选的核心诉求 ID 列表
  const [coreNeeds, setCoreNeeds] = useState<string[]>([])
  // 追问回答：{ [needId]: { [questionId]: value } }
  const [followUpAnswers, setFollowUpAnswers] = useState<FollowUpAnswers>({})

  // 总步骤数
  const totalSteps = assessmentSteps.length
  // 当前步骤配置（防御性：越界时 fallback 到第一步）
  const step = assessmentSteps[currentStep - 1] || assessmentSteps[0]
  // 进度百分比
  const progress = Math.round(((currentStep - 1) / totalSteps) * 100)

  // 当前性别（用于动态渲染）
  const gender = formData['gender'] as 'female' | 'male' | undefined
  const age = parseInt(formData['age'])

  // ========== 初始化 ==========

  // 确保 currentStep 在有效范围内（防止升级后步数变化导致越界）
  useEffect(() => {
    if (currentStep < 1 || currentStep > totalSteps) {
      setCurrentStep(1)
    }
  }, [])

  // 检查草稿
  useEffect(() => {
    const draft = localStorage.getItem('nutriguide_draft')
    if (draft) setHasDraft(true)
  }, [])

  // 从全局 Store 恢复数据
  useEffect(() => {
    if (Object.keys(assessmentData).length > 0) {
      setFormData(prev => ({ ...prev, ...assessmentData }))
      // 恢复 coreNeeds
      if (assessmentData._coreNeeds) {
        setCoreNeeds(assessmentData._coreNeeds)
      }
      // 恢复 followUpAnswers
      if (assessmentData._followUp) {
        setFollowUpAnswers(assessmentData._followUp)
      }
    }
  }, [assessmentData])

  // 预填用户姓名
  useEffect(() => {
    if (user?.name && !formData.name) {
      setFormData(prev => ({ ...prev, name: user.name }))
    }
  }, [user])

  // ========== 字段变更 ==========

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    setErrors([])
  }, [])

  // ========== 核心诉求切换 ==========

  const handleCoreNeedToggle = useCallback((needId: string) => {
    setCoreNeeds(prev => {
      if (prev.includes(needId)) {
        // 取消选中 → 同时清除该诉求的追问回答
        setFollowUpAnswers(ans => {
          const next = { ...ans }
          delete next[needId]
          return next
        })
        return prev.filter(id => id !== needId)
      }
      return [...prev, needId]
    })
    setErrors([])
  }, [])

  // ========== 追问回答变更 ==========

  const handleFollowUpChange = useCallback(
    (needId: string, questionId: string, value: any) => {
      setFollowUpAnswers(prev => ({
        ...prev,
        [needId]: {
          ...(prev[needId] || {}),
          [questionId]: value,
        },
      }))
      setErrors([])
    },
    [],
  )

  // ========== 追问多选切换 ==========

  const handleFollowUpMultiToggle = useCallback(
    (needId: string, questionId: string, value: string) => {
      setFollowUpAnswers(prev => {
        const needAnswers = prev[needId] || {}
        const current: string[] = Array.isArray(needAnswers[questionId])
          ? [...needAnswers[questionId]]
          : []
        const next = current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value]
        return {
          ...prev,
          [needId]: { ...needAnswers, [questionId]: next },
        }
      })
      setErrors([])
    },
    [],
  )

  // ========== 步骤校验 ==========

  const validateStep = (): boolean => {
    const errs: string[] = []

    // Step 1：基础信息必填
    if (step.id === 'basic_info') {
      const requiredIds = step.fields
        .filter(f => f.required && !f.showCondition)
        .map(f => f.id)
      for (const id of requiredIds) {
        if (!formData[id] && formData[id] !== 0) {
          errs.push(`请填写/选择：${step.fields.find(f => f.id === id)?.label || id}`)
        }
      }
      // 女性且显示了怀孕状态 → 必填
      if (gender === 'female' && formData['pregnancy_status'] === undefined) {
        // showCondition 字段在 gender=female 时才显示，此时非 required，跳过
      }
    }

    // Step 2：至少选一个核心诉求
    if (step.id === 'core_needs') {
      if (coreNeeds.length === 0) {
        errs.push('请至少选择一个核心诉求')
      }
    }

    // Step 3：追问的必答题
    if (step.id === 'follow_up') {
      for (const needId of coreNeeds) {
        const questions = getFollowUpQuestions(gender!, age, needId)
        for (const q of questions) {
          if (q.required !== false) {
            // 必答
            const answer = followUpAnswers[needId]?.[q.id]
            if (answer === undefined || answer === '' || (Array.isArray(answer) && answer.length === 0)) {
              errs.push(`「${getNeedLabel(needId)}」${q.question}`)
            }
          }
        }
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
    if (!validateStep()) return
    // 保存当前步骤数据
    updateAssessmentData({
      ...formData,
      _coreNeeds: coreNeeds,
      _followUp: followUpAnswers,
    })
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    } else {
      handleSubmit()
    }
  }

  const handlePrev = () => {
    // 保存当前数据
    updateAssessmentData({
      ...formData,
      _coreNeeds: coreNeeds,
      _followUp: followUpAnswers,
    })
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  // ========== 提交 ==========

  const handleSubmit = async () => {
    setAILoading(true)
    setAIError(null)

    // 合并所有数据
    const allData: Record<string, any> = {
      ...formData,
      _coreNeeds: coreNeeds,
      _followUp: followUpAnswers,
    }

    updateAssessmentData(allData)

    // 运行规则引擎
    const result = evaluateUser(allData)
    setAssessmentResult(result)

    // 生成本地方案
    const plan = generatePlan(result)
    setGeneratedPlan(plan)

    // 清除草稿
    localStorage.removeItem('nutriguide_draft')

    // ⚡ 立即跳转结果页，不要让用户等待
    navigate('/results')

    // 后台保存自测结果
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
        }
      })
      savedId = saved.id
      console.log('自测结果已保存到服务器，ID:', savedId)
    } catch (e: any) {
      console.warn('保存自测结果失败:', e.message)
    }

    // 后台尝试调用 LLM 生成增强报告
    try {
      const aiPrompt = generateAIPrompt(result, plan)
      const aiResult = await api.generatePlan(aiPrompt)
      if (aiResult.plan) {
        setAIPlan(aiResult.plan)
        setAIModel(aiResult.model || null)
        // 将 AI 报告存入数据库
        if (savedId) {
          try {
            await api.updateAssessmentReport(savedId, aiResult.plan)
            console.log('AI 报告已存入数据库')
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
      if (draft._coreNeeds) setCoreNeeds(draft._coreNeeds)
      if (draft._followUp) setFollowUpAnswers(draft._followUp)
    }
  }

  const handleSaveDraft = () => {
    updateAssessmentData({
      ...formData,
      _coreNeeds: coreNeeds,
      _followUp: followUpAnswers,
    })
    saveDraft()
  }

  // ========== 动态获取当前性别+年龄的核心诉求列表 ==========

  const currentNeeds: CoreNeed[] = useMemo(() => {
    if (!gender || isNaN(age)) return []
    return getCoreNeeds(gender, age)
  }, [gender, age])

  // ========== 渲染 ==========

  /** 获取诉求显示名 */
  function getNeedLabel(needId: string): string {
    const n = currentNeeds.find(n => n.id === needId)
    if (n) return n.label
    // fallback：从女性配置中查找
    return needId
  }

  // 当前步骤可见字段（原来的 showCondition 逻辑）
  const visibleFields = step.fields.filter(f => {
    if (f.showCondition) {
      const fv = formData[f.showCondition.field]
      const cv = f.showCondition.value
      if (typeof cv === 'string') return fv === cv
      return cv.includes(fv)
    }
    return true
  })

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* ─── 进度条 ─── */}
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B2A4A] tracking-tight">{step.title}</h1>
        <p className="mt-2 text-[#1B2A4A]/60">{step.description}</p>
      </div>

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
        {/* ── 普通字段（非动态步骤）── */}
        {step.id !== 'core_needs' && step.id !== 'follow_up' && step.id !== 'summary' && (
          visibleFields.map((field) => (
            <div key={field.id} className="animate-fade-in-up" style={{ animationDelay: `${visibleFields.indexOf(field) * 50}ms` }}>
              <label htmlFor={field.id} className="block text-sm font-medium text-[#1B2A4A] mb-2">
                {field.label}
                {field.required && <span className="text-[#E85D3A] ml-1">*</span>}
              </label>
              {field.description && (
                <p className="text-xs text-[#1B2A4A]/40 mb-2">{field.description}</p>
              )}
              {renderNormalField(field)}
            </div>
          ))
        )}

        {/* ── Step 2：核心诉求（动态渲染）── */}
        {step.id === 'core_needs' && (
          <div className="space-y-3">
            {!gender || isNaN(age) ? (
              <div className="text-center py-8 text-[#1B2A4A]/40">
                <HelpCircle size={32} className="mx-auto mb-3 text-[#1B2A4A]/20" />
                <p>请先在「基础信息」中填写性别和年龄，再选择诉求。</p>
                <p className="text-xs mt-1">点击「上一步」返回填写。</p>
              </div>
            ) : (
              currentNeeds.map((need) => {
                const selected = coreNeeds.includes(need.id)
                return (
                  <label
                    key={need.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      selected
                        ? 'border-[#2D9C6F] bg-[#2D9C6F]/5'
                        : 'border-[#E8E3DB] bg-white hover:border-[#2D9C6F]/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => handleCoreNeedToggle(need.id)}
                      className="mt-0.5 w-4 h-4 text-[#2D9C6F] rounded accent-[#2D9C6F] shrink-0"
                    />
                    <div>
                      <span className="text-sm font-medium text-[#1B2A4A]">{need.label}</span>
                      {need.description && (
                        <p className="text-xs text-[#1B2A4A]/40 mt-0.5">{need.description}</p>
                      )}
                    </div>
                  </label>
                )
              })
            )}
          </div>
        )}

        {/* ── Step 3：追问（按诉求动态展开）── */}
        {step.id === 'follow_up' && (
          <div className="space-y-6">
            {coreNeeds.length === 0 ? (
              <div className="text-center py-8 text-[#1B2A4A]/40">
                <p>未选择任何核心诉求，无需追问。</p>
                <p className="text-xs mt-1">点击「下一步」继续。</p>
              </div>
            ) : (
              coreNeeds.map((needId, idx) => {
                const questions = getFollowUpQuestions(gender!, age, needId)
                if (questions.length === 0) return null
                const needLabel = getNeedLabel(needId)
                const needAnswers = followUpAnswers[needId] || {}

                return (
                  <div key={needId} className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#E8E3DB] animate-fade-in-up" style={{ animationDelay: `${idx * 80}ms` }}>
                    <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#2D9C6F]/10 text-[#2D9C6F] text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        {needLabel}
                      </h3>

                      <div className="space-y-4">
                        {questions.map((q) => (
                          <div key={q.id}>
                            <p className="text-sm text-[#1B2A4A] mb-2">
                              {q.question}
                              {q.required !== false && <span className="text-[#E85D3A] ml-1">*</span>}
                              {q.required === false && <span className="text-[#1B2A4A]/30 ml-1 text-xs">（可选）</span>}
                            </p>
                            {renderFollowUpInput(q, needId, needAnswers[q.id])}
                          </div>
                        ))}
                      </div>
                    </div>
                )
              })
            )}
          </div>
        )}

        {/* ── Step 6：确认信息 ─── */}
        {step.id === 'summary' && (
          <SummaryView
            formData={formData}
            coreNeeds={coreNeeds}
            followUpAnswers={followUpAnswers}
            gender={gender}
            age={age}
          />
        )}

        {/* 无可见字段时的提示 */}
        {step.id !== 'core_needs' && step.id !== 'follow_up' && step.id !== 'summary' && visibleFields.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[#1B2A4A]/50">当前步骤无需要填写的内容。</p>
            <p className="text-sm text-[#1B2A4A]/30 mt-1">点击"下一步"继续。</p>
          </div>
        )}
      </div>

      {/* ─── 导航按钮 ─── */}
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
          {/* 保存草稿 */}
          <button
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-4 py-3 text-sm text-[#1B2A4A]/50 hover:text-[#1B2A4A] transition-colors"
          >
            <Save size={16} />
            保存草稿
          </button>

          {/* 跳过（仅当步骤有可选内容时） */}
          {step.id === 'follow_up' && (
            <button
              onClick={() => {
                // 跳过所有未答的追问
                updateAssessmentData({
                  ...formData,
                  _coreNeeds: coreNeeds,
                  _followUp: followUpAnswers,
                })
                if (currentStep < totalSteps) {
                  setCurrentStep(currentStep + 1)
                  window.scrollTo(0, 0)
                }
              }}
              className="flex items-center gap-1.5 px-4 py-3 text-sm text-[#1B2A4A]/40 hover:text-[#1B2A4A]/60 transition-colors"
            >
              <SkipForward size={16} />
              跳过追问
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
    </div>
  )

  // ========== 普通字段渲染 ==========

  function renderNormalField(field: AssessmentField) {
    const value = formData[field.id] || ''

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
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map(opt => {
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {field.options?.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleFieldChange(field.id, opt.value)}
                className={`px-4 py-3 rounded-xl border text-sm transition-all ${
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
              placeholder="请输入"
            />
            {field.unit && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#1B2A4A]/40">{field.unit}</span>
            )}
          </div>
        )

      case 'lab_value':
        return (
          <div className="relative">
            <input
              type="number"
              step="any"
              id={field.id}
              value={value}
              onChange={e => handleFieldChange(field.id, e.target.value)}
              placeholder="跳过"
              className="w-full px-4 py-3 pr-24 rounded-xl border border-[#E8E3DB] bg-white text-[#1B2A4A] focus:border-[#2D9C6F] focus:ring-2 focus:ring-[#2D9C6F]/20 transition-all outline-none"
            />
            {field.unit && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#1B2A4A]/40">{field.unit}</span>
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
            className="w-full px-4 py-3 rounded-xl border border-[#E8E3DB] bg-white text-[#1B2A4A] focus:border-[#2D9C6F] focus:ring-2 focus:ring-[#2D9C6F]/20 transition-all outline-none"
          />
        )
    }
  }

  // ========== 追问字段渲染 ==========

  function renderFollowUpInput(q: FollowUpQuestion, needId: string, currentValue: any) {
    switch (q.inputType) {
      case 'radio':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {q.options?.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleFollowUpChange(needId, q.id, opt.value)}
                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                  currentValue === opt.value
                    ? 'border-[#2D9C6F] bg-[#2D9C6F]/5 text-[#2D9C6F] font-medium'
                    : 'border-[#E8E3DB] bg-white text-[#1B2A4A]/70 hover:border-[#2D9C6F]/30'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )

      case 'multiselect':
        const selectedValues: string[] = Array.isArray(currentValue) ? currentValue : []
        return (
          <div className="space-y-2">
            {q.options?.map(opt => {
              const selected = selectedValues.includes(opt.value)
              return (
                <label key={opt.value} className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all ${
                  selected ? 'border-[#2D9C6F] bg-[#2D9C6F]/5' : 'border-[#E8E3DB] bg-white hover:border-[#2D9C6F]/30'
                }`}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => handleFollowUpMultiToggle(needId, q.id, opt.value)}
                    className="w-4 h-4 text-[#2D9C6F] rounded accent-[#2D9C6F]"
                  />
                  <span className="text-sm text-[#1B2A4A]">{opt.label}</span>
                </label>
              )
            })}
          </div>
        )

      case 'number':
        return (
          <div className="relative w-40">
            <input
              type="number"
              min={q.min}
              max={q.max}
              value={currentValue || ''}
              onChange={e => handleFollowUpChange(needId, q.id, e.target.value)}
              placeholder={q.placeholder || '请输入'}
              className="w-full px-4 py-2 pr-16 rounded-lg border border-[#E8E3DB] bg-white text-[#1B2A4A] focus:border-[#2D9C6F] focus:ring-2 focus:ring-[#2D9C6F]/20 transition-all outline-none text-sm"
            />
            {q.unit && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#1B2A4A]/40">{q.unit}</span>
            )}
          </div>
        )

      case 'text':
        return (
          <input
            type="text"
            value={currentValue || ''}
            onChange={e => handleFollowUpChange(needId, q.id, e.target.value)}
            placeholder={q.placeholder || '请输入'}
            className="w-full px-4 py-2 rounded-lg border border-[#E8E3DB] bg-white text-[#1B2A4A] focus:border-[#2D9C6F] focus:ring-2 focus:ring-[#2D9C6F]/20 transition-all outline-none text-sm"
          />
        )

      case 'select':
        return (
          <select
            value={currentValue || ''}
            onChange={e => handleFollowUpChange(needId, q.id, e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-[#E8E3DB] bg-white text-[#1B2A4A] focus:border-[#2D9C6F] focus:ring-2 focus:ring-[#2D9C6F]/20 transition-all outline-none text-sm appearance-none"
          >
            <option value="">请选择...</option>
            {q.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )

      default:
        return <p className="text-xs text-[#E85D3A]">未知问题类型：{q.inputType}</p>
    }
  }
}

// ========== 确认信息组件 ==========

function SummaryView({
  formData, coreNeeds, followUpAnswers, gender, age,
}: {
  formData: Record<string, any>
  coreNeeds: string[]
  followUpAnswers: FollowUpAnswers
  gender?: 'female' | 'male'
  age: number
}) {
  const allNeeds = gender ? getCoreNeeds(gender, age) : []

  return (
    <div className="space-y-6">
      {/* 基础信息 */}
      <Section title="基础信息">
        <SummaryRow label="性别" value={formData['gender'] === 'female' ? '女' : formData['gender'] === 'male' ? '男' : '未填'} />
        <SummaryRow label="年龄" value={formData['age'] ? `${formData['age']} 岁` : '未填'} />
        <SummaryRow label="身高/体重" value={formData['height'] && formData['weight'] ? `${formData['height']}cm / ${formData['weight']}kg（BMI ${calcBMI(formData['height'], formData['weight'])}）` : '未填'} />
        {formData['pregnancy_status'] && (
          <SummaryRow label="怀孕/备孕" value={pregnancyLabel(formData['pregnancy_status'])} />
        )}
      </Section>

      {/* 已确诊疾病 */}
      {Array.isArray(formData['diagnosis']) && formData['diagnosis'].length > 0 && !formData['diagnosis'].includes('none') && (
        <Section title="已确诊疾病">
          {formData['diagnosis'].map((d: string) => (
            <span key={d} className="inline-block px-2 py-1 bg-[#E8F0EB]/40 text-[#7A8B6F] rounded-lg text-xs mr-2 mb-1">{diagnosisLabel(d)}</span>
          ))}
        </Section>
      )}

      {/* 核心诉求 */}
      <Section title={`核心诉求（已选 ${coreNeeds.length} 项）`}>
        {coreNeeds.map(nid => {
          const n = allNeeds.find(x => x.id === nid)
          return n ? (
            <div key={nid} className="mb-3">
              <p className="text-sm font-medium text-[#1B2A4A]">{n.label}</p>
              {/* 该诉求的追问回答 */}
              {followUpAnswers[nid] && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {Object.entries(followUpAnswers[nid]).map(([qid, ans]) => (
                    <p key={qid} className="text-xs text-[#1B2A4A]/50">
                      {formatAnswer(ans)}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ) : null
        })}
      </Section>

      {/* 补充剂/药物 */}
      {Array.isArray(formData['current_supplements']) && formData['current_supplements'].length > 0 && !formData['current_supplements'].includes('none') && (
        <Section title="正在服用">
          {formData['current_supplements'].map((s: string) => (
            <span key={s} className="inline-block px-2 py-1 bg-[#F3F0EB] text-[#1B2A4A]/70 rounded-lg text-xs mr-2 mb-1">{supplementLabel(s)}</span>
          ))}
        </Section>
      )}

      {/* 体检数据 */}
      <Section title="体检数据">
        {['lab_vitamin_d', 'lab_ferritin', 'lab_tsh', 'lab_vitamin_b12', 'lab_fasting_glucose'].map(key => {
          if (!formData[key]) return null
          return <SummaryRow key={key} label={labLabel(key)} value={formData[key]} />
        })}
        {!['lab_vitamin_d', 'lab_ferritin', 'lab_tsh', 'lab_vitamin_b12', 'lab_fasting_glucose'].some(k => formData[k]) && (
          <p className="text-xs text-[#1B2A4A]/30">无体检数据</p>
        )}
      </Section>

      <p className="text-xs text-[#1B2A4A]/40 text-center">如需修改，请点击「上一步」返回调整。</p>
    </div>
  )
}

// ─── Summary 辅助组件 ───

function Section({ title, children }: { title: string; children: React.ReactNode }) {
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

// ─── 工具函数 ───

function calcBMI(heightCm: number, weightKg: number): string {
  if (!heightCm || !weightKg) return '-'
  const h = heightCm / 100
  return (weightKg / (h * h)).toFixed(1)
}

function pregnancyLabel(v: string): string {
  const map: Record<string, string> = {
    none: '无', preconception: '备孕中', pregnant_t1: '孕早期（0-12周）',
    pregnant_t2: '孕中期（13-27周）', pregnant_t3: '孕晚期（28周+）', lactation: '哺乳期',
    perimenopause: '围绝经期/更年期',
  }
  return map[v] || v
}

function diagnosisLabel(v: string): string {
  const map: Record<string, string> = {
    hashimoto: '桥本甲状腺炎', hyperthyroidism: '甲亢', hypothyroidism: '甲减',
    diabetes: '糖尿病', pcos: 'PCOS', ibs: 'IBS', depression_anxiety: '抑郁/焦虑',
    hypertension: '高血压', hyperlipidemia: '高血脂', cardiovascular: '心血管疾病',
    gout: '痛风', kidney_disease: '慢性肾病', celiac: '乳糜泻',
  }
  return map[v] || v
}

function supplementLabel(v: string): string {
  const map: Record<string, string> = {
    multivitamin: '复合维生素', vitamin_d: '维生素D', vitamin_c: '维生素C',
    vitamin_b_complex: 'B族维生素', calcium: '钙片', magnesium: '镁', zinc: '锌',
    iron: '铁剂', omega3: 'Omega-3', probiotics: '益生菌', coq10: '辅酶Q10',
    inositol: '肌醇', protein_powder: '蛋白粉', melatonin: '褪黑素', herbal: '中草药',
  }
  return map[v] || v
}

function labLabel(key: string): string {
  const map: Record<string, string> = {
    lab_vitamin_d: '维生素 D', lab_ferritin: '铁蛋白', lab_tsh: 'TSH',
    lab_vitamin_b12: '维生素 B12', lab_fasting_glucose: '空腹血糖',
  }
  return map[key] || key
}

function formatAnswer(ans: any): string {
  if (Array.isArray(ans)) return ans.join('、')
  return String(ans)
}
