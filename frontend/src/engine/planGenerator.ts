// 方案生成器 - PRD 2026-06-02 更新
// 支持三维度输出 + 体检数据个性化剂量

import type { AssessmentResult, DeficiencyRisk } from './ruleEngine'
import { populationPlans, type PopulationPlan, type SupplementRecommendation } from '../data/populationPlans'
import { nutrients, type Nutrient } from '../data/nutrients'

// ─── 输出接口 ───

export interface GeneratedPlan {
  /** 用户标签（主人群名） */
  userLabel: string
  /** 用户画像描述（结果页头部展示） */
  userDescription: string
  /** 优先级提示 */
  priorityNote: string
  /** 匹配到的人群方案（含亚型） */
  plans: PopulationPlan[]
  /** 合并后的补充剂列表（去重 + 等级） */
  mergedSupplements: MergedSupplement[]
  /** 饮食原则摘要 */
  dietSummary: string[]
  /** 生活方式摘要 */
  lifestyleSummary: string[]
  /** 监测计划 */
  monitoringPlan: string[]
  /** 就医提醒 */
  warningSigns: string[]
  /** 缺乏风险警示（含个性化剂量） */
  deficiencyAlerts: DeficiencyAlert[]
}

export interface MergedSupplement {
  name: string
  nameEn: string
  /** 剂量（如有体检数据则已个性化） */
  dosage: string
  form: string
  timing: string
  level: 'core' | 'conditional' | 'optional'
  fromPopulations: string[]
  drugInteraction?: string
  conflicts?: string
  /** 个性化剂量说明（如有体检数据） */
  personalizedNote?: string
}

export interface DeficiencyAlert {
  nutrient: string
  nutrientName: string
  riskLevel: 'high' | 'moderate' | 'low'
  reason: string
  /** 个性化补充建议（如有体检数据则精确） */
  recommendation: string
}

// ─── 辅助：合并补充剂（去重 + 升级等级）──

function mergeSupplements(
  plans: PopulationPlan[],
  deficiencyRisks: DeficiencyRisk[],
): MergedSupplement[] {
  const merged = new Map<string, MergedSupplement>()

  // 1. 从人群方案收集补充剂
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
        // 升级等级
        if (supp.level === 'core' && existing.level !== 'core') {
          existing.level = 'core'
        }
        existing.fromPopulations.push(plan.name)
        // 保留更详细的剂量说明
        if (supp.dosage.length > existing.dosage.length) {
          existing.dosage = supp.dosage
        }
        if (supp.drugInteraction && !existing.drugInteraction) {
          existing.drugInteraction = supp.drugInteraction
        }
      }
    }
  }

  // 2. 用体检数据个性化剂量
  for (const risk of deficiencyRisks) {
    if (risk.personalizedDosage) {
      const existing = merged.get(getNutrientName(risk.nutrient))
      if (existing) {
        existing.dosage = risk.personalizedDosage
        existing.personalizedNote = `根据您的体检数据（${risk.reason}）调整剂量`
      }
    }
  }

  // 3. 排序：core > conditional > optional
  const result = Array.from(merged.values())
  const levelOrder = { core: 0, conditional: 1, optional: 2 }
  result.sort((a, b) => {
    const oa = levelOrder[a.level] ?? 9
    const ob = levelOrder[b.level] ?? 9
    return oa - ob
  })

  return result
}

// ─── 辅助：生成饮食摘要 ───

function generateDietSummary(plans: PopulationPlan[]): string[] {
  const summary: string[] = []
  const seen = new Set<string>()

  for (const plan of plans) {
    for (const item of plan.diet.principles) {
      if (!seen.has(item.principle)) {
        seen.add(item.principle)
        summary.push(`${item.principle}：${item.detail}`)
      }
    }
  }

  return summary.slice(0, 8)
}

// ─── 辅助：生成生活方式摘要 ───

function generateLifestyleSummary(plans: PopulationPlan[]): string[] {
  const summary: string[] = []
  const seen = new Set<string>()

  for (const plan of plans) {
    for (const item of plan.lifestyle) {
      if (!seen.has(item.category)) {
        seen.add(item.category)
        summary.push(`${item.category}：${item.recommendation}${item.frequency ? `（${item.frequency}）` : ''}`)
      }
    }
  }

  return summary.slice(0, 6)
}

// ─── 辅助：生成监测计划 ───

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

// ─── 辅助：生成就医提醒 ───

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

// ─── 辅助：生成缺乏风险警示（含个性化建议）──

function generateDeficiencyAlerts(
  deficiencyRisks: DeficiencyRisk[],
  mergedSupplements: MergedSupplement[],
): DeficiencyAlert[] {
  return deficiencyRisks
    .filter(r => r.riskLevel === 'high' || r.riskLevel === 'moderate')
    .map(risk => {
      // 查找是否已在该补充剂中
      const supp = mergedSupplements.find(
        s => s.name.includes(getNutrientName(risk.nutrient))
      )

      let recommendation = ''

      if (risk.personalizedDosage) {
        // 有体检数据 → 精确建议
        recommendation = `根据您的数据（${risk.reason}），建议：${risk.personalizedDosage}`
      } else if (supp) {
        // 无体检数据但有补充剂方案 → 引用方案剂量
        recommendation = `建议：${supp.dosage}，${supp.timing}。${supp.form}`
      } else {
        // 查找营养素参考数据
        const nutri = nutrients.find(n => n.id === risk.nutrient)
        if (nutri) {
          recommendation = `食物来源：${nutri.sources.slice(0, 3).join('、')}。RNI：${nutri.rni.female}（女）/ ${nutri.rni.male}（男）`
        } else {
          recommendation = '建议咨询医生或注册营养师获取个性化方案。'
        }
      }

      return {
        ...risk,
        recommendation,
      }
    })
}

// ─── 辅助工具 ───

function getNutrientName(id: string): string {
  const map: Record<string, string> = {
    vitamin_d: '维生素 D',
    iron: '铁',
    vitamin_b12: '维生素 B12',
    calcium: '钙',
    magnesium: '镁',
    protein: '蛋白质',
    folate: '叶酸',
    omega3: 'Omega-3',
  }
  return map[id] || id
}

// ─── 主入口：生成方案 ───

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

  const plans = planIds
    .map(id => populationPlans[id])
    .filter((p): p is PopulationPlan => Boolean(p))

  // 合并补充剂（已含个性化剂量）
  const merged = mergeSupplements(plans, deficiencyRisks)

  // 生成三维度内容
  const dietSummary = generateDietSummary(plans)
  const lifestyleSummary = generateLifestyleSummary(plans)
  const monitoringPlan = generateMonitoringPlan(plans)
  const warningSigns = generateWarningSigns(plans)
  const deficiencyAlerts = generateDeficiencyAlerts(deficiencyRisks, merged)

  // 用户标签
  const userLabel = primaryPopulation?.populationName || '健康关注者'

  // 优先级提示
  let priorityNote = ''
  if (primaryPopulation && secondaryPopulations.length > 0) {
    const primaryCat = primaryPopulation.category
    const secNames = secondaryPopulations.map(s => s.populationName).join('、')
    if (primaryCat === 'pregnancy') {
      priorityNote = `怀孕期为最高优先级，所有补充剂和饮食建议均已按孕期调整。同时兼顾${secNames}需求。`
    } else if (primaryCat === 'hashimoto' || primaryCat === 'hypothyroidism') {
      priorityNote = `甲状腺健康为最高优先级。同时关注${secNames}的需求，避免碘过量。`
    } else if (primaryCat === 'diabetes') {
      priorityNote = `血糖管理为核心。${secNames}方案调整需在血糖控制前提下进行。`
    } else {
      priorityNote = `以${primaryPopulation.populationName}为核心方案，同时兼顾${secNames}。`
    }
  }

  return {
    userLabel,
    userDescription: result.userDescription,
    priorityNote,
    plans,
    mergedSupplements: merged,
    dietSummary,
    lifestyleSummary,
    monitoringPlan,
    warningSigns,
    deficiencyAlerts,
  }
}

// ─── 生成 AI 提示词（给 LLM 用）──

export function generateAIPrompt(result: AssessmentResult, plan: GeneratedPlan): string {
  const { userProfile } = result

  let prompt = `你是一位专业的注册营养师。请基于以下用户信息，生成一个28天（4周）个性化营养方案。\n\n`

  prompt += `## 核心原则（必须遵守）\n`
  prompt += `1. **饮食优先**：任何营养素需求，首先考虑通过食物满足。\n`
  prompt += `2. **补充剂为辅**：只有饮食无法满足时，才建议补充剂。\n`
  prompt += `3. **不跳过饮食直接给补充剂**：这是严重错误，请勿这样做。\n\n`

  prompt += `## 用户画像\n`
  prompt += `- ${result.userDescription}\n`
  if (result.dietQualityScore !== undefined) {
    const levelLabel = result.dietQualityLevel === 'excellent' ? '优秀' : result.dietQualityLevel === 'good' ? '良好' : result.dietQualityLevel === 'fair' ? '一般' : '较差'
    prompt += `- 饮食质量评分：${result.dietQualityScore}/100（${levelLabel}）\n`
  }
  if (result.dietStrengths && result.dietStrengths.length > 0) {
    prompt += `- 饮食优势：${result.dietStrengths.join('、')}\n`
  }
  if (result.dietWeaknesses && result.dietWeaknesses.length > 0) {
    prompt += `- 饮食需改进：${result.dietWeaknesses.join('；')}\n`
  }
  prompt += `- 饮食模式：${userProfile.dietPattern || '杂食'}\n`
  prompt += `- 运动水平：${userProfile.exerciseFrequency || '中等'}\n\n`

  // 普通人群基线
  if (result.generalBaseline && !result.primaryPopulation) {
    prompt += `## 普通人群营养基线（无特殊疾病/状态）\n`
    prompt += `- 能量需求：${result.generalBaseline.energyNeeds.sedentary_kcal}-${result.generalBaseline.energyNeeds.active_kcal} kcal/天\n`
    prompt += `- 宏量营养素：${result.generalBaseline.macroDistribution.carbsPercent[0]}-${result.generalBaseline.macroDistribution.carbsPercent[1]}% 碳水，` +
      `${result.generalBaseline.macroDistribution.proteinPercent[0]}-${result.generalBaseline.macroDistribution.proteinPercent[1]}% 蛋白质\n`
    prompt += `- 每日份量：蔬菜${result.generalBaseline.dailyPortions.vegetables[0]}-${result.generalBaseline.dailyPortions.vegetables[1]}g，` +
      `水果${result.generalBaseline.dailyPortions.fruits[0]}-${result.generalBaseline.dailyPortions.fruits[1]}g\n`
    prompt += `- 补充剂立场：${result.generalBaseline.supplementGuidance}\n\n`
  }

  prompt += `## 匹配人群\n`
  for (const p of plan.plans) {
    prompt += `- ${p.name}：${p.description}\n`
  }

  prompt += `\n## 第一步：饮食改善方案（最重要）\n`
  prompt += `请先给出具体的饮食改善建议，包括：\n`
  prompt += `1. 针对饮食评分中的弱点，逐条给出改善建议\n`
  prompt += `2. 每日食物选择建议（优先食物列表）\n`
  prompt += `3. 一日示范餐单（含具体食物名和份量）\n`
  prompt += `4. 烹饪方式建议\n\n`

  prompt += `## 第二步：缺乏风险警示\n`
  for (const s of plan.mergedSupplements.filter(s => s.level === 'core')) {
    prompt += `- ${s.name}（${s.nameEn}）：${s.dosage}，${s.form}，${s.timing}`
    if (s.personalizedNote) prompt += `（${s.personalizedNote}）`
    prompt += `\n`
  }

  prompt += `\n## 缺乏风险警示\n`
  for (const d of plan.deficiencyAlerts) {
    prompt += `- ${d.nutrientName}（${d.riskLevel === 'high' ? '高风险' : '中风险'}）：${d.reason}\n`
    prompt += `  建议：${d.recommendation}\n`
  }

  prompt += `\n## 第三步：补充剂建议（仅必要时）\n`
  prompt += `请明确说明：哪些补充剂是"饮食无法满足时"才考虑。\n`
  for (const s of plan.mergedSupplements.filter(s => s.level === 'core')) {
    prompt += `- [核心] ${s.name}（${s.nameEn}）：${s.dosage}，${s.form}，${s.timing}\n`
    if (s.personalizedNote) prompt += `  （${s.personalizedNote}）\n`
  }
  for (const s of plan.mergedSupplements.filter(s => s.level === 'conditional')) {
    prompt += `- [条件] ${s.name}（${s.nameEn}）：${s.dosage}，${s.form}，${s.timing}（条件性补充，仅在某些饮食无法满足时考虑）\n`
  }

  prompt += `\n## 任务要求\n请生成一个28天（4周）方案，严格按以下顺序：\n`
  prompt += `1. 第1周饮食改善重点（基于饮食质量评分的弱点）\n`
  prompt += `2. 第2-4周：维持 + 进阶建议\n`
  prompt += `3. 每日食物选择清单（表格形式）\n`
  prompt += `4. 补充剂服用日程（明确标注"饮食优先"）\n`
  prompt += `5. 生活方式小目标（运动、睡眠、压力管理）\n`
  prompt += `6. 复查时间点建议\n\n`

  prompt += `请以中文输出，语言专业但温暖亲切，使用结构化markdown格式。\n`
  prompt += `方案结尾必须注明："本方案仅供参考，不替代医生诊断和治疗。补充剂使用前请咨询您的医生。"\n\n`
  prompt += `重要：本方案必须体现"饮食是基础，补充剂是补充"的原则。如果用户饮食质量评分≥80，补充剂部分应标注"饮食已充足，以下补充剂可酌情考虑"。`
  
  return prompt
}
