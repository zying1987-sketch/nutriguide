// 方案生成器 - 基于评估结果生成个性化营养方案

import type { AssessmentResult, PopulationMatch, DeficiencyRisk } from './ruleEngine'
import { populationPlans, populationPriority, type PopulationPlan, type SupplementRecommendation } from '../data/populationPlans'
import { nutrients, labThresholds, type Nutrient } from '../data/nutrients'

export interface GeneratedPlan {
  userLabel: string
  userDescription: string
  priorityNote: string
  plans: PopulationPlan[]
  mergedSupplements: MergedSupplement[]
  dietSummary: string[]
  lifestyleSummary: string[]
  monitoringPlan: string[]
  warningSigns: string[]
  deficiencyAlerts: DeficiencyAlert[]
}

export interface MergedSupplement {
  name: string
  nameEn: string
  dosage: string
  form: string
  timing: string
  level: 'core' | 'conditional' | 'optional'
  fromPopulations: string[]
  conflicts?: string
  drugInteraction?: string
}

export interface DeficiencyAlert {
  nutrient: string
  nutrientName: string
  riskLevel: 'high' | 'moderate' | 'low'
  reason: string
  recommendation: string
}

// 方案合并规则
function mergeSupplements(plans: PopulationPlan[], deficiencyRisks: DeficiencyRisk[]): MergedSupplement[] {
  const merged = new Map<string, MergedSupplement>()

  for (const plan of plans) {
    for (const supp of plan.supplements) {
      const key = supp.name
      const existing = merged.get(key)

      if (!existing) {
        merged.set(key, {
          name: supp.name,
          nameEn: supp.nameEn,
          dosage: supp.dosage,
          form: supp.form,
          timing: supp.timing,
          level: supp.level,
          fromPopulations: [plan.name],
          drugInteraction: supp.drugInteraction,
        })
      } else {
        // 已存在，升级level（conditional在有core时升级）
        if (supp.level === 'core' && existing.level !== 'core') {
          existing.level = 'core'
        }
        existing.fromPopulations.push(plan.name)
        // 如果新剂量不同且更具体，保留更详细的
        if (supp.dosage.length > existing.dosage.length) {
          existing.dosage = supp.dosage
        }
        // 合并服药间隔提醒
        if (supp.drugInteraction && !existing.drugInteraction) {
          existing.drugInteraction = supp.drugInteraction
        }
      }
    }
  }

  // 检查冲突
  const result = Array.from(merged.values())

  // 桥本+孕期 碘冲突
  const hasHashimoto = plans.some(p => p.category === 'hashimoto')
  const hasPregnancy = plans.some(p => p.category === 'pregnancy')
  if (hasHashimoto && hasPregnancy) {
    const iodine = result.find(s => s.name === '碘')
    if (iodine) {
      iodine.conflicts = '桥本甲状腺炎患者应谨慎补碘，孕期又需要碘支持胎儿发育。建议在医生指导下根据尿碘和TPOAb水平个体化决定。'
    }
  }

  // 排序：core > conditional > optional
  result.sort((a, b) => {
    const order = { core: 0, conditional: 1, optional: 2 }
    return (order[a.level] || 0) - (order[b.level] || 0)
  })

  return result
}

function generateDietSummary(plans: PopulationPlan[]): string[] {
  const summary: string[] = []
  const seen = new Set<string>()

  for (const plan of plans) {
    for (const p of plan.diet.principles) {
      if (!seen.has(p.principle)) {
        seen.add(p.principle)
        summary.push(`${p.principle}: ${p.detail}`)
      }
    }
  }

  return summary.slice(0, 8) // 最多8条
}

function generateLifestyleSummary(plans: PopulationPlan[]): string[] {
  const summary: string[] = []
  const seen = new Set<string>()

  for (const plan of plans) {
    for (const l of plan.lifestyle) {
      const key = l.category
      if (!seen.has(key)) {
        seen.add(key)
        summary.push(`${l.category}: ${l.recommendation}${l.frequency ? ` (${l.frequency})` : ''}`)
      }
    }
  }

  return summary.slice(0, 6)
}

function generateMonitoringPlan(plans: PopulationPlan[]): string[] {
  const items: string[] = []
  const seen = new Set<string>()

  for (const plan of plans) {
    for (const item of plan.monitoringPlan) {
      if (!seen.has(item)) {
        seen.add(item)
        items.push(item)
      }
    }
  }

  return items
}

function generateWarningSigns(plans: PopulationPlan[]): string[] {
  const signs: string[] = []
  const seen = new Set<string>()

  for (const plan of plans) {
    for (const sign of plan.warningSigns) {
      if (!seen.has(sign)) {
        seen.add(sign)
        signs.push(sign)
      }
    }
  }

  return signs.slice(0, 6)
}

function generateDeficiencyAlerts(deficiencyRisks: DeficiencyRisk[]): DeficiencyAlert[] {
  return deficiencyRisks
    .filter(r => r.riskLevel === 'high' || r.riskLevel === 'moderate')
    .map(risk => {
      const nutrientData = nutrients.find(n => n.id === risk.nutrient)
      return {
        ...risk,
        recommendation: nutrientData
          ? `${nutrientData.name}：推荐摄入量${nutrientData.rni.female}，${nutrientData.mainFunction}。${nutrientData.specialNotes || ''}食物来源：${nutrientData.sources.join('、')}。`
          : '请咨询营养师获取具体建议。',
      }
    })
}

export function generatePlan(result: AssessmentResult): GeneratedPlan {
  const { primaryPopulation, secondaryPopulations, deficiencyRisks, userProfile } = result

  // 收集所有匹配的人群方案
  const planIds: string[] = []
  if (primaryPopulation) planIds.push(primaryPopulation.populationId)
  for (const sec of secondaryPopulations) {
    if (!planIds.includes(sec.populationId)) {
      planIds.push(sec.populationId)
    }
  }

  const plans = planIds.map(id => populationPlans[id]).filter(Boolean)

  // 用户标签
  let userLabel = '健康关注者'
  if (primaryPopulation) {
    userLabel = primaryPopulation.populationName
  }

  // 优先级提示
  let priorityNote = ''
  if (primaryPopulation && secondaryPopulations.length > 0) {
    const primaryCat = primaryPopulation.category
    const secNames = secondaryPopulations.map(s => s.populationName).join('、')
    if (primaryCat === 'pregnancy') {
      priorityNote = `孕期营养为最高优先级。同时兼顾${secNames}的特殊需求。`
    } else if (primaryCat === 'diabetes') {
      priorityNote = `血糖管理为核心。${secNames}方案的调整需在控制血糖前提下进行。`
    } else if (primaryCat === 'hashimoto') {
      priorityNote = `甲状腺抗体管理优先。同时关注${secNames}的需求。`
    } else {
      priorityNote = `以${primaryPopulation.populationName}为核心方案，同时兼顾${secNames}。`
    }
  }

  // 合并补充剂
  const mergedSupplements = mergeSupplements(plans, deficiencyRisks)

  return {
    userLabel,
    userDescription: `年龄${userProfile.age}岁，BMI ${userProfile.bmi}`,
    priorityNote,
    plans,
    mergedSupplements,
    dietSummary: generateDietSummary(plans),
    lifestyleSummary: generateLifestyleSummary(plans),
    monitoringPlan: generateMonitoringPlan(plans),
    warningSigns: generateWarningSigns(plans),
    deficiencyAlerts: generateDeficiencyAlerts(deficiencyRisks),
  }
}

// 生成AI提示词（给LLM用）
export function generateAIPrompt(result: AssessmentResult, plan: GeneratedPlan): string {
  const { userProfile } = result

  let prompt = `你是一位专业的注册营养师。请基于以下用户信息，生成一个28天（4周）个性化营养素补充和饮食指导方案。

## 用户画像
- 年龄：${userProfile.age}岁
- 性别：${userProfile.gender === 'female' ? '女' : '男'}
- BMI：${userProfile.bmi}
- 饮食模式：${userProfile.dietPattern}
- 运动水平：${userProfile.exerciseLevel}
- 睡眠：${userProfile.sleepHours}
- 压力水平：${userProfile.stressLevel}

## 匹配人群
`
  if (plan.plans.length > 0) {
    for (const p of plan.plans) {
      prompt += `- ${p.name}：${p.description}\n`
    }
  }

  prompt += `
## 核心补充剂建议
`
  for (const s of plan.mergedSupplements.filter(s => s.level === 'core')) {
    prompt += `- ${s.name}：${s.dosage}，${s.form}，${s.timing}\n`
  }

  prompt += `
## 缺乏风险
`
  for (const d of plan.deficiencyAlerts) {
    prompt += `- ${d.nutrientName}：${d.riskLevel === 'high' ? '高风险' : '中风险'} - ${d.reason}\n`
  }

  prompt += `
## 任务要求
请生成一个28天（4周）营养素指导方案，包括：
1. 每周的补充剂服用日程（按天列出需要服用的补充剂和时间）
2. 每周的饮食重点原则
3. 每周的生活方式小目标
4. 监测指标建议
5. 注意事项和就医提醒

请以中文输出，语言专业但温暖亲切，使用结构化markdown格式。每次建议后简短说明科学理由。
方案结尾必须注明："本方案仅供参考，不替代医生诊断和治疗。请在开始任何补充剂前咨询您的医生。"

请确保方案严格基于上述用户画像和已匹配的人群特征，不要添加未经科学验证的建议。`

  return prompt
}
