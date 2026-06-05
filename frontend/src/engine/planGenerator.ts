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

  let prompt = `你是一位有15年临床经验的注册营养师（RD）。请基于以下用户数据，生成一份专业营养评估与补充方案。\n\n`

  prompt += `## 核心原则\n`
  prompt += `1. **饮食为先**：营养问题优先通过饮食结构调整解决。\n`
  prompt += `2. **补充为辅**：只有饮食确实无法满足、或有明确体检指标支持时，才推荐补充剂。\n`
  prompt += `3. **禁止跳过饮食直接推荐补充剂**。\n`
  prompt += `4. **剂量必须具体**：标注mg、μg、IU等精确单位，不可模糊。\n`
  prompt += `5. **注明证据等级**：A=强证据(meta/RCT)，B=中等证据，C=专家经验。\n\n`

  // 用户画像 — 压缩版
  prompt += `## 用户画像\n`
  prompt += `- ${result.userDescription}\n`
  if (result.dietQualityScore !== undefined) {
    const levelLabel = result.dietQualityLevel === 'excellent' ? '优秀' : result.dietQualityLevel === 'good' ? '良好' : result.dietQualityLevel === 'fair' ? '一般' : '需改善'
    prompt += `- 饮食评分：${result.dietQualityScore}/100（${levelLabel}）\n`
  }
  // 饮食弱点（只挑最关键3条）
  if (result.dietWeaknesses && result.dietWeaknesses.length > 0) {
    prompt += `- 饮食关键短板：${result.dietWeaknesses.slice(0, 3).join('；')}\n`
  }
  prompt += `- 饮食模式：${userProfile.dietPattern || '杂食'} | 运动：${userProfile.exerciseFrequency || '中等'}\n\n`

  // 生活习惯数据
  const dietAnswers = (userProfile as any).dietAnswers || {}
  if (dietAnswers.diet_sugar_drinks) {
    prompt += `- 含糖饮品：${dietAnswers.diet_sugar_drinks}\n`
  }
  if (dietAnswers.diet_smoking) {
    prompt += `- 吸烟：${dietAnswers.diet_smoking}\n`
  }
  if (dietAnswers.diet_alcohol) {
    prompt += `- 饮酒：${dietAnswers.diet_alcohol}\n`
  }
  prompt += `\n`

  // 普通人群基线 — 压缩
  if (result.generalBaseline && !result.primaryPopulation) {
    prompt += `## 营养基线\n`
    prompt += `- 能量：${result.generalBaseline.energyNeeds.sedentary_kcal}-${result.generalBaseline.energyNeeds.active_kcal} kcal/天\n`
    prompt += `- 宏量：碳水${result.generalBaseline.macroDistribution.carbsPercent[0]}-${result.generalBaseline.macroDistribution.carbsPercent[1]}% / 蛋白${result.generalBaseline.macroDistribution.proteinPercent[0]}-${result.generalBaseline.macroDistribution.proteinPercent[1]}%\n\n`
  }

  prompt += `## 匹配人群\n`
  for (const p of plan.plans) {
    prompt += `- ${p.name}\n`
  }

  // 缺乏风险 — 强化展示
  prompt += `\n## 营养素缺乏风险\n`
  for (const d of plan.deficiencyAlerts) {
    prompt += `- ${d.nutrientName}：${d.riskLevel === 'high' ? '🔴高风险' : '🟡需关注'} — ${d.recommendation}\n`
  }

  // 补充剂建议 — 核心输出，详细
  prompt += `\n## 补充剂建议（核心）\n`
  prompt += `请按以下格式为每项补充剂给出详细建议：\n\n`

  for (const s of plan.mergedSupplements) {
    const levelTag = s.level === 'core' ? '[核心]' : s.level === 'conditional' ? '[条件]' : '[可选]'
    prompt += `**${levelTag} ${s.name}（${s.nameEn}）**\n`
    prompt += `- 推荐剂量：${s.dosage}\n`
    prompt += `- 推荐剂型：${s.form}\n`
    prompt += `- 服用时间：${s.timing}\n`
    if (s.drugInteraction) prompt += `- 药物相互作用：${s.drugInteraction}\n`
    if (s.conflicts) prompt += `- 注意冲突：${s.conflicts}\n`
    if (s.personalizedNote) prompt += `- 个性化说明：${s.personalizedNote}\n`
    prompt += `\n`
  }

  // 饮食建议 — 精简版
  prompt += `## 饮食改善重点（精简）\n`
  prompt += `列出3-5条最关键、最可执行的饮食改善建议，每条不超过30字。\n\n`

  // 生活方式 — 精简版
  prompt += `## 生活方式\n`
  prompt += `列出2-3条关键生活方式建议（运动/睡眠/压力管理），每条不超过20字。\n\n`

  // 输出要求
  prompt += `## 输出格式\n`
  prompt += `请生成一份结构化报告，包含以下章节（用markdown）：\n`
  prompt += `1. **营养素补充方案**（最重要，占50%篇幅）：逐项列出补充剂，含剂量/剂型/时间/证据等级/注意事项\n`
  prompt += `2. **缺乏风险评估**：检验指标建议 + 饮食替代方案\n`
  prompt += `3. **饮食改善建议**（精简，最多5条）\n`
  prompt += `4. **生活方式建议**（精简，最多3条）\n`
  prompt += `5. **复查建议**：需复查的项目和时间\n\n`

  prompt += `语言要求：专业精准、信息密度高、避免冗余。以中文输出。\n`
  prompt += `结尾注明："本方案由AI生成，不替代执业医师诊断。补充剂使用前请咨询医生或注册营养师。"\n`

  return prompt
}
