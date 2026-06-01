import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Save, Check } from 'lucide-react'
import { assessmentSteps, symptomList, type AssessmentField } from '../data/assessment'
import { useAppStore } from '../stores/useAppStore'
import { evaluateUser } from '../engine/ruleEngine'
import { generatePlan } from '../engine/planGenerator'

export default function AssessmentPage() {
  const navigate = useNavigate()
  const {
    currentStep, setCurrentStep,
    assessmentData, updateAssessmentData,
    saveDraft, loadDraft, isDraft,
    setAssessmentResult, setGeneratedPlan,
  } = useAppStore()

  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<string[]>([])
  const [hasDraft, setHasDraft] = useState(false)

  const totalSteps = assessmentSteps.length
  const step = assessmentSteps[currentStep - 1]
  const progress = Math.round((currentStep / totalSteps) * 100)

  // 检查是否有草稿
  useEffect(() => {
    const draft = localStorage.getItem('nutriguide_draft')
    if (draft) setHasDraft(true)
  }, [])

  // 初始化数据
  useEffect(() => {
    if (Object.keys(assessmentData).length > 0) {
      setFormData(prev => ({ ...prev, ...assessmentData }))
    }
  }, [assessmentData])

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    setErrors([])
  }, [])

  const validateStep = (): boolean => {
    const requiredFields = step.fields.filter(f => f.required && !f.showCondition)
    const missing = requiredFields.filter(f => !formData[f.id] || formData[f.id] === '')
    if (missing.length > 0) {
      setErrors(missing.map(f => `请填写: ${f.label}`))
      return false
    }
    return true
  }

  const handleNext = () => {
    if (!validateStep()) return
    updateAssessmentData(formData)
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    } else {
      // 完成评估
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

  const handleSubmit = () => {
    // 将所有formData扁平化：症状字段需要特殊处理
    const allData = { ...formData }
    
    // 确保症状数据正确格式
    for (const symptom of symptomList) {
      allData[`symptom_${symptom.id}`] = formData[`symptom_${symptom.id}`] || 0
    }

    updateAssessmentData(allData)

    // 运行规则引擎
    const result = evaluateUser(allData)
    setAssessmentResult(result)

    // 生成方案
    const plan = generatePlan(result)
    setGeneratedPlan(plan)

    // 清除草稿
    localStorage.removeItem('nutriguide_draft')

    // 跳转结果页
    navigate('/results')
  }

  const handleLoadDraft = () => {
    const loaded = loadDraft()
    if (loaded) {
      const draft = JSON.parse(localStorage.getItem('nutriguide_draft') || '{}')
      setFormData(draft)
    }
  }

  const handleSaveDraft = () => {
    updateAssessmentData(formData)
    saveDraft()
  }

  // 渲染字段
  const renderField = (field: AssessmentField) => {
    const value = formData[field.id] || ''

    switch (field.type) {
      case 'select':
        return (
          <select
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
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

      case 'slider':
        const sliderValue = parseInt(value) || 0
        const labels = ['从未', '偶尔', '经常', '几乎每天']
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={3}
                value={sliderValue}
                onChange={(e) => handleFieldChange(field.id, parseInt(e.target.value))}
                className="flex-1 h-2 bg-[#E8E3DB] rounded-full appearance-none cursor-pointer accent-[#2D9C6F]"
              />
              <span className={`text-sm font-medium min-w-[80px] text-right ${
                sliderValue >= 2 ? 'text-[#E85D3A]' : sliderValue === 1 ? 'text-[#D4A853]' : 'text-[#1B2A4A]/40'
              }`}>
                {labels[sliderValue]}
              </span>
            </div>
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
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
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
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className="w-full px-4 py-3 pr-24 rounded-xl border border-[#E8E3DB] bg-white text-[#1B2A4A] focus:border-[#2D9C6F] focus:ring-2 focus:ring-[#2D9C6F]/20 transition-all outline-none"
              placeholder="跳过"
            />
            {field.unit && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#1B2A4A]/40">{field.unit}</span>
            )}
          </div>
        )

      case 'conditional':
        // 条件字段：根据用户之前的症状或诊断决定是否显示
        const shouldShow = shouldShowConditional(field)
        if (!shouldShow) return null
        return (
          <div>
            {field.options?.map(opt => (
              <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all mb-2 ${
                value === opt.value ? 'border-[#2D9C6F] bg-[#2D9C6F]/5' : 'border-[#E8E3DB] bg-white hover:border-[#2D9C6F]/30'
              }`}>
                <input
                  type="radio"
                  name={field.id}
                  checked={value === opt.value}
                  onChange={() => handleFieldChange(field.id, opt.value)}
                  className="w-4 h-4 text-[#2D9C6F] accent-[#2D9C6F]"
                />
                <span className="text-sm text-[#1B2A4A]">{opt.label}</span>
              </label>
            ))}
          </div>
        )

      default:
        return (
          <input
            type="text"
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[#E8E3DB] bg-white text-[#1B2A4A] focus:border-[#2D9C6F] focus:ring-2 focus:ring-[#2D9C6F]/20 transition-all outline-none"
          />
        )
    }
  }

  // 判断条件字段是否显示
  const shouldShowConditional = (field: AssessmentField): boolean => {
    if (!field.triggers) return true

    const triggers = field.triggers.split(',')
    const symptomScores: Record<string, number> = {}
    for (const s of symptomList) {
      symptomScores[s.id] = parseInt(formData[`symptom_${s.id}`]) || 0
    }

    // 检查症状触发
    for (const trigger of triggers) {
      // 检查该类别是否有相关症状>=2分的
      if (['ibs', 'mental_health', 'diabetes', 'hashimoto', 'pcos', 'menstrual', 'menopause'].includes(trigger)) {
        const relatedSymptoms = symptomList.filter(s => s.targetPopulations.includes(trigger))
        const hasTrigger = relatedSymptoms.some(s => (symptomScores[s.id] || 0) >= 2)
        if (hasTrigger) return true
      }
    }

    // 检查确诊疾病触发
    const diagnoses: string[] = Array.isArray(formData.diagnosis) ? formData.diagnosis : []
    for (const trigger of triggers) {
      if (diagnoses.includes(trigger)) return true
    }

    // 检查年龄触发（更年期）
    if (triggers.includes('menopause')) {
      const age = parseInt(formData.age)
      const gender = formData.gender
      if (gender === 'female' && age >= 40) return true
    }

    return false
  }

  // 过滤当前步骤的可见字段
  const visibleFields = step.fields.filter(f => {
    if (f.showCondition) {
      const fieldValue = formData[f.showCondition.field]
      const conditionValue = f.showCondition.value
      if (typeof conditionValue === 'string') {
        return fieldValue === conditionValue
      }
      return conditionValue.includes(fieldValue)
    }
    return true
  })

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#1B2A4A]/50">
            步骤 {currentStep}/{totalSteps}
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

      {/* Draft notice */}
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

      {/* Step header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B2A4A] tracking-tight">{step.title}</h1>
        <p className="mt-2 text-[#1B2A4A]/60">{step.description}</p>
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-[#E85D3A]/5 border border-[#E85D3A]/20 rounded-xl">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-[#E85D3A]">{err}</p>
          ))}
        </div>
      )}

      {/* Form fields */}
      <div className="space-y-8">
        {visibleFields.map((field) => (
          <div key={field.id} className="animate-fade-in-up" style={{ animationDelay: `${visibleFields.indexOf(field) * 50}ms` }}>
            <label htmlFor={field.id} className="block text-sm font-medium text-[#1B2A4A] mb-2">
              {field.label}
              {field.required && <span className="text-[#E85D3A] ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-xs text-[#1B2A4A]/40 mb-2">{field.description}</p>
            )}
            {renderField(field)}
          </div>
        ))}

        {/* 如果当前步骤没有可见字段，自动跳过 */}
        {step.id === 'special_screening' && visibleFields.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[#1B2A4A]/50">根据您的症状自评，暂时不需要额外筛查。</p>
            <p className="text-sm text-[#1B2A4A]/30 mt-1">点击"下一步"继续。</p>
          </div>
        )}
      </div>

      {/* Navigation */}
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
}
