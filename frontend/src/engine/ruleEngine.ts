// 规则引擎 - PRD 2026-06-02 重新设计
// 新逻辑：核心诉求 + 追问答案 + 饮食评估 + 体检数据 → 人群匹配 + 饮食优先推荐

import type { CoreNeed } from '../data/coreNeeds'
import { getCoreNeeds, getFollowUpQuestions } from '../data/coreNeeds'
import { populationPlans, populationPriority, type PopulationPlan } from '../data/populationPlans'
import { calculateDietScore, type DietAssessmentResult } from '../data/dietAssessment'
import { getBaseline, type GeneralBaseline } from '../data/generalBaseline'

// ─── 用户画像（新）──

export interface UserProfile {
  age: number
  gender: 'male' | 'female'
  bmi: number
  pregnancyStatus?: string
  // 基础信息
  diagnoses: string[]
  medications: string[]
  // 新：核心诉求
  coreNeeds: string[]
  // 新：追问答案 { [needId]: { [questionId]: value } }
  followUpAnswers: Record<string, Record<string, any>>
  // 新：饮食评估答案 { [questionId]: value | string[] }
  dietAnswers: Record<string, string | string[]>
  // 体检数据
  labData: Record<string, number | null>
  // 保留：饮食/运动/睡眠/压力（用于生活方式建议）
  dietPattern?: string
  exerciseFrequency?: string
  sleepHours?: string
  stressLevel?: string
  /** 新版：健康分流状态 */
  healthStatus?: string
}

// ─── 人群匹配结果 ───

export interface PopulationMatch {
  populationId: string
  populationName: string
  category: string
  confidence: number // 0-1
  subType?: string
  reason: string[]
}

// ─── 评估结果 ───

export interface DeficiencyRisk {
  nutrient: string
  nutrientName: string
  riskLevel: 'high' | 'moderate' | 'low'
  reason: string
  /** 个性化剂量（如有体检数据） */
  personalizedDosage?: string
}

export interface AssessmentResult {
  primaryPopulation: PopulationMatch | null
  secondaryPopulations: PopulationMatch[]
  deficiencyRisks: DeficiencyRisk[]
  userProfile: UserProfile
  /** 用户画像描述（用于结果页展示） */
  userDescription: string
  /** 新增：饮食质量评分 (0-100) */
  dietQualityScore?: number
  dietQualityLevel?: 'poor' | 'fair' | 'good' | 'excellent'
  dietStrengths?: string[]
  dietWeaknesses?: string[]
  /** 新增：普通人群基线（无特殊人群匹配时的兜底） */
  generalBaseline?: GeneralBaseline | null
}

// ─── 主入口：评估用户 ───

export function evaluateUser(rawData: Record<string, any>): AssessmentResult {
  // 1. 构建 UserProfile
  const profile = buildUserProfile(rawData)

  // 2. 映射核心诉求 → 人群
  const matches = mapCoreNeedsToPopulations(profile)

  // 3. 按优先级排序
  matches.sort((a, b) => {
    const pa = populationPriority[a.category] || 0
    const pb = populationPriority[b.category] || 0
    if (pa !== pb) return pb - pa
    return b.confidence - a.confidence
  })

  // 4. 主人群 + 次人群
  const primary = matches.length > 0 ? matches[0] : null
  const secondary = matches.length > 1 ? matches.slice(1) : []

  // 5. 计算饮食质量评分
  const dietResult = calculateDietScore(profile.dietAnswers)
  const { score: dietScore, level: dietLevel, strengths: dietStrengths, weaknesses: dietWeaknesses } = dietResult

  // 6. 如无特殊人群匹配，使用普通人群基线
  let generalBaseline: GeneralBaseline | null = null
  if (!primary) {
    generalBaseline = getBaseline(profile.gender, profile.age)
  }

  // 7. 分析缺乏风险（含个性化剂量）
  const risks = analyzeDeficiencyRisks(profile)

  // 8. 生成用户描述
  const description = buildUserDescription(profile, primary, secondary, dietScore)

  return {
    primaryPopulation: primary,
    secondaryPopulations: secondary,
    deficiencyRisks: risks,
    userProfile: profile,
    userDescription: description,
    dietQualityScore: dietScore,
    dietQualityLevel: dietLevel,
    dietStrengths,
    dietWeaknesses,
    generalBaseline,
  }
}

// ─── 构建用户画像 ───

function buildUserProfile(raw: Record<string, any>): UserProfile {
  const age = parseInt(raw.age) || 30
  const gender: 'male' | 'female' = raw.gender || 'female'
  const height = parseFloat(raw.height) || 160
  const weight = parseFloat(raw.weight) || 55
  const bmi = Math.round((weight / ((height / 100) ** 2)) * 10) / 10

  // 核心诉求（新版本使用 health_status 分流，兼容旧版 _coreNeeds）
  const coreNeeds: string[] = Array.isArray(raw._coreNeeds) ? raw._coreNeeds : []
  const healthStatus = raw.health_status || ''

  // 追问答案（兼容旧版）
  const followUpAnswers: Record<string, Record<string, any>> = {}
  const rawFollowUp = raw._followUp || {}
  for (const [needId, answers] of Object.entries(rawFollowUp)) {
    if (answers && typeof answers === 'object') {
      followUpAnswers[needId] = answers as Record<string, any>
    }
  }

  // 饮食评估答案（新字段：d1_diet_mode, d2_vegetables 等；兼容旧版 diet_ 前缀）
  const dietAnswers: Record<string, string | string[]> = {}
  for (const key of Object.keys(raw)) {
    if (key.startsWith('d1_') || key.startsWith('d2_') || key.startsWith('d3_') || key.startsWith('d4_') || key.startsWith('d5_')) {
      dietAnswers[key] = raw[key]
    }
    // 兼容旧版 diet_ 前缀
    if (key.startsWith('diet_')) {
      const questionId = key.replace(/^diet_/, '')
      dietAnswers[questionId] = raw[key]
    }
  }

  // 体检数据
  const labData: Record<string, number | null> = {}
  const labFields = [
    'lab_vitamin_d', 'lab_ferritin', 'lab_tsh', 'lab_tpoab',
    'lab_fasting_glucose', 'lab_hba1c', 'lab_vitamin_b12', 'lab_hemoglobin',
    'lab_triglycerides', 'lab_total_cholesterol', 'lab_testosterone', 'lab_psa',
  ]
  for (const f of labFields) {
    if (raw[f] !== undefined && raw[f] !== '') {
      labData[f] = parseFloat(raw[f])
    }
  }

  // 诊断：新字段 b1_problems（分支B），兼容旧字段 diagnosis
  const diagnoses = Array.isArray(raw.b1_problems) ? raw.b1_problems.filter((d: string) => d !== 'none') : Array.isArray(raw.diagnosis) ? raw.diagnosis.filter((d: string) => d !== 'none') : []

  // 药物：新字段 f2_medications，兼容旧字段 medications
  const medications = Array.isArray(raw.f2_medications) ? raw.f2_medications.filter((m: string) => m !== 'none') : Array.isArray(raw.medications) ? raw.medications.filter((m: string) => m !== 'none') : []

  return {
    age,
    gender,
    bmi,
    pregnancyStatus: raw.c1_stage || raw.pregnancy_status || 'none',
    diagnoses,
    medications,
    coreNeeds,
    followUpAnswers,
    dietAnswers,
    labData,
    dietPattern: raw.d1_diet_mode || raw.diet_pattern || 'omnivore',
    exerciseFrequency: raw.e1_exercise || raw.a10_exercise || raw.exercise_frequency || 'moderate',
    sleepHours: raw.e2_sleep_hours || raw.sleep_hours || 'normal',
    stressLevel: raw.e3_stress || raw.stress_level || 'none',
    // 附加：新版分支数据
    healthStatus,
  }
}

// ─── 核心诉求 → 人群映射 ───

function mapCoreNeedsToPopulations(profile: UserProfile): PopulationMatch[] {
  const matches: PopulationMatch[] = []
  const seen = new Set<string>()

  // ── 优先级 1：怀孕（最高）──
  if (profile.pregnancyStatus && profile.pregnancyStatus !== 'none') {
    const pregType = mapPregnancyType(profile.pregnancyStatus)
    addMatch(matches, seen, {
      populationId: pregType,
      populationName: populationPlans[pregType]?.name || '孕期',
      category: 'pregnancy',
      confidence: 0.98,
      reason: [`怀孕状态：${profile.pregnancyStatus}`],
    })
  }

  // ── 优先级 2：已确诊疾病（糖尿病/甲减等）──
  for (const diag of profile.diagnoses) {
    if (diag === 'diabetes') {
      const subType = profile.labData['lab_fasting_glucose'] && profile.labData['lab_fasting_glucose']! >= 7
        ? 'diabetes_type2'
        : 'diabetes_type2'
      addMatch(matches, seen, {
        populationId: subType,
        populationName: '2型糖尿病',
        category: 'diabetes',
        confidence: 0.95,
        reason: ['已确诊糖尿病'],
      })
    }
    if (diag === 'hashimoto' || diag === 'hypothyroidism') {
      const subType = profile.medications.includes('levothyroxine')
        ? 'hashimoto_hypothyroid'
        : 'hashimoto_euthyroid'
      addMatch(matches, seen, {
        populationId: subType,
        populationName: populationPlans[subType]?.name || '桥本甲状腺炎',
        category: 'hashimoto',
        confidence: 0.95,
        reason: ['已确诊桥本/甲减', ...(profile.medications.includes('levothyroxine') ? ['正在服用优甲乐'] : [])],
      })
    }
  }

  // ── 优先级 3：核心诉求映射 ──

  const needs = profile.coreNeeds

  // 备孕
  if (needs.includes('pregnancy_prep')) {
    addMatch(matches, seen, {
      populationId: 'pregnancy_preconception',
      populationName: '备孕期',
      category: 'pregnancy',
      confidence: 0.9,
      reason: ['核心诉求：备孕'],
    })
  }

  // 月经问题 + 多毛/痤疮 → PCOS
  if (
    needs.includes('period_irregular') &&
    (needs.includes('acne') || profile.gender === 'female')
  ) {
    const subType = profile.bmi >= 25 ? 'pcos_insulin_resistant' : 'pcos_insulin_resistant'
    addMatch(matches, seen, {
      populationId: subType,
      populationName: 'PCOS（多囊卵巢综合征）',
      category: 'pcos',
      confidence: 0.85,
      subType,
      reason: ['月经不规律', needs.includes('acne') ? '痤疮' : '', ...buildPCOSReasons(profile.followUpAnswers)],
    })
  }

  // 经期综合征 PMS
  if (needs.includes('pms')) {
    addMatch(matches, seen, {
      populationId: 'menstrual_pms',
      populationName: '经前综合征（PMS）',
      category: 'menstrual',
      confidence: 0.8,
      reason: ['核心诉求：PMS'],
    })
  }

  // 更年期：潮热盗汗 + 年龄 45+
  if (needs.includes('hot_flash') && profile.age >= 40) {
    const subType = profile.age >= 55 ? 'menopause_post' : 'menopause_peri'
    addMatch(matches, seen, {
      populationId: subType,
      populationName: '更年期',
      category: 'menopause',
      confidence: 0.9,
      subType,
      reason: ['核心诉求：潮热盗汗', ...buildMenopauseReasons(profile.followUpAnswers)],
    })
  }

  // 情绪问题
  if (needs.includes('low_mood') || needs.includes('anxiety_worry')) {
    addMatch(matches, seen, {
      populationId: 'anxiety_depression',
      populationName: '焦虑/抑郁倾向',
      category: 'mental_health',
      confidence: 0.75,
      reason: ['核心诉求：情绪低落/焦虑', ...buildMentalReasons(profile.followUpAnswers)],
    })
  }

  // IBS：肠胃不适 + 排便后缓解
  if (needs.includes('digestion') && profile.gender === 'female') {
    // 简化的 IBS 判断：如有肠胃不适诉求，标记为 IBS 风险
    addMatch(matches, seen, {
      populationId: 'ibs_d', // 默认腹泻型，实际应根据追问判断
      populationName: 'IBS（肠易激综合征）',
      category: 'ibs',
      confidence: 0.7,
      reason: ['核心诉求：肠胃不适', ...buildIBSReasons(profile.followUpAnswers)],
    })
  }

  // 男性：勃起问题
  if (needs.includes('erectile') && profile.gender === 'male') {
    addMatch(matches, seen, {
      populationId: 'male_low_testosterone',
      populationName: '睾酮低下（LOH）',
      category: 'male_health',
      confidence: 0.8,
      reason: ['核心诉求：性欲减退/勃起问题', ...buildErectileReasons(profile.followUpAnswers)],
    })
  }

  // 男性：前列腺问题
  if (needs.includes('prostate') && profile.gender === 'male') {
    addMatch(matches, seen, {
      populationId: 'male_bph',
      populationName: '良性前列腺增生（BPH）',
      category: 'male_health',
      confidence: 0.85,
      reason: ['核心诉求：前列腺问题', ...buildProstateReasons(profile.followUpAnswers)],
    })
  }

  // 男性：痛风
  if (needs.includes('gout') && profile.gender === 'male') {
    addMatch(matches, seen, {
      populationId: 'male_gout',
      populationName: '痛风/高尿酸',
      category: 'male_health',
      confidence: 0.85,
      reason: ['核心诉求：尿酸高/痛风', ...buildGoutReasons(profile.followUpAnswers)],
    })
  }

  // ── 优先级 4：健身人群 ──
  if (
    (needs.includes('muscle_gain') || needs.includes('weight_loss')) &&
    profile.exerciseFrequency &&
    !['sedentary', 'none'].includes(profile.exerciseFrequency)
  ) {
    const subType = needs.includes('muscle_gain') ? 'fitness_muscle_gain' : 'fitness_weight_loss'
    addMatch(matches, seen, {
      populationId: subType,
      populationName: needs.includes('muscle_gain') ? '健身增肌人群' : '健身减脂人群',
      category: 'fitness',
      confidence: 0.8,
      subType,
      reason: [needs.includes('muscle_gain') ? '核心诉求：增肌' : '核心诉求：减重', `运动频率：${profile.exerciseFrequency}`],
    })
  }

  // ── 优先级 5：素食人群 ──
  if (profile.dietPattern && ['strict_vegan', 'lacto_ovo', 'pescatarian', 'flexitarian'].includes(profile.dietPattern)) {
    const subType = profile.dietPattern === 'strict_vegan' ? 'vegetarian_strict' : 'vegetarian_lacto_ovo'
    addMatch(matches, seen, {
      populationId: subType,
      populationName: profile.dietPattern === 'strict_vegan' ? '严格素食人群' : '蛋奶素食人群',
      category: 'vegetarian',
      confidence: 0.9,
      subType,
      reason: [`饮食模式：${profile.dietPattern}`],
    })
  }

  // ── 优先级 6：老年人（≥60岁）──
  if (profile.age >= 60) {
    addMatch(matches, seen, {
      populationId: 'elderly_general',
      populationName: '老年人（60岁+）',
      category: 'elderly',
      confidence: 0.9,
      reason: [`年龄：${profile.age}岁`],
    })
  }

  // ── 优先级 7：青少年（10-19岁）──
  if (profile.age >= 10 && profile.age < 20) {
    addMatch(matches, seen, {
      populationId: 'adolescent',
      populationName: '青少年（10-19岁）',
      category: 'adolescent',
      confidence: 0.9,
      reason: [`年龄：${profile.age}岁`],
    })
  }

  return matches
}

// ─── 辅助：添加匹配（去重）──

function addMatch(
  matches: PopulationMatch[],
  seen: Set<string>,
  match: PopulationMatch,
) {
  if (seen.has(match.category)) return
  seen.add(match.category)
  matches.push(match)
}

// ─── 辅助：怀孕类型映射 ───

function mapPregnancyType(status: string): string {
  const map: Record<string, string> = {
    preconception: 'pregnancy_preconception',
    pregnant_t1: 'pregnancy_t1',
    pregnant_t2: 'pregnancy_t2',
    pregnant_t3: 'pregnancy_t3',
    lactation: 'pregnancy_lactation',
  }
  return map[status] || 'pregnancy_general'
}

// ─── 辅助：追问答案 → 原因描述 ───

function buildPCOSReasons(answers: Record<string, Record<string, any>>): string[] {
  const reasons: string[] = []
  // 查找 period_irregular 的追问答案
  const period = answers['period_irregular']
  if (period) {
    if (period['period_cycle'] === '<21' || period['period_cycle'] === '>35') {
      reasons.push('月经周期不规律')
    }
  }
  return reasons
}

function buildMenopauseReasons(answers: Record<string, Record<string, any>>): string[] {
  const reasons: string[] = []
  const hotFlash = answers['hot_flash']
  if (hotFlash) {
    if (hotFlash['hotflash_frequency'] === '>10') {
      reasons.push('潮热每天>10次')
    }
    if (hotFlash['hotflash_sleep'] === 'yes') {
      reasons.push('潮热影响睡眠')
    }
  }
  return reasons
}

function buildMentalReasons(answers: Record<string, Record<string, any>>): string[] {
  const reasons: string[] = []
  const lowMood = answers['low_mood']
  if (lowMood) {
    if (lowMood['mood_anhedonia'] === 'yes') {
      reasons.push('对以前喜欢的事情失去兴趣')
    }
  }
  return reasons
}

function buildIBSReasons(answers: Record<string, Record<string, any>>): string[] {
  // 简化的 IBS 追问解析
  return []
}

function buildErectileReasons(answers: Record<string, Record<string, any>>): string[] {
  const reasons: string[] = []
  const erect = answers['erectile']
  if (erect) {
    if (erect['erectile_duration'] && erect['erectile_duration'] !== '<3m') {
      reasons.push(`持续${erect['erectile_duration']}`)
    }
  }
  return reasons
}

function buildProstateReasons(answers: Record<string, Record<string, any>>): string[] {
  const reasons: string[] = []
  const pros = answers['prostate']
  if (pros) {
    if (pros['prostate_nocutria'] && pros['prostate_nocutria'] !== '0-1') {
      reasons.push(`夜尿${pros['prostate_nocutria']}次`)
    }
  }
  return reasons
}

function buildGoutReasons(answers: Record<string, Record<string, any>>): string[] {
  const reasons: string[] = []
  const gout = answers['gout']
  if (gout) {
    if (gout['gout_diagnosed'] === 'yes') {
      reasons.push('已确诊痛风')
    } else {
      reasons.push('尿酸高（未确诊）')
    }
  }
  return reasons
}

// ─── 分析缺乏风险（含个性化剂量）──

export function analyzeDeficiencyRisks(profile: UserProfile): DeficiencyRisk[] {
  const risks: DeficiencyRisk[] = []
  const lab = profile.labData

  // ── 维生素 D ───
  if (lab['lab_vitamin_d'] !== undefined && lab['lab_vitamin_d'] !== null) {
    const vd = lab['lab_vitamin_d']!
    if (vd < 30) {
      risks.push({
        nutrient: 'vitamin_d',
        nutrientName: '维生素 D',
        riskLevel: 'high',
        reason: `25(OH)D=${vd} nmol/L，严重缺乏（<30）`,
        personalizedDosage: vd < 25
          ? '2000-4000 IU/天，持续3个月，复查25(OH)D'
          : '1500-2000 IU/天，持续3个月，复查25(OH)D',
      })
    } else if (vd < 50) {
      risks.push({
        nutrient: 'vitamin_d',
        nutrientName: '维生素 D',
        riskLevel: 'moderate',
        reason: `25(OH)D=${vd} nmol/L，不足（30-50）`,
        personalizedDosage: '1000-2000 IU/天，建议复查',
      })
    }
  } else {
    // 无检测值：通用风险
    risks.push({
      nutrient: 'vitamin_d',
      nutrientName: '维生素 D',
      riskLevel: 'moderate',
      reason: '现代生活方式日照普遍不足，建议检测25(OH)D',
    })
  }

  // ── 铁蛋白 ───
  if (lab['lab_ferritin'] !== undefined && lab['lab_ferritin'] !== null) {
    const fer = lab['lab_ferritin']!
    if (fer < 15) {
      risks.push({
        nutrient: 'iron',
        nutrientName: '铁',
        riskLevel: 'high',
        reason: `铁蛋白=${fer} μg/L，明确缺乏（<15）`,
        personalizedDosage: '铁剂 100-200mg元素铁/天，空腹服用，维生素C辅助吸收',
      })
    } else if (fer < 50) {
      risks.push({
        nutrient: 'iron',
        nutrientName: '铁',
        riskLevel: 'moderate',
        reason: `铁蛋白=${fer} μg/L，偏低（15-50）`,
        personalizedDosage: '饮食上增加红肉、动物肝脏；必要时补充铁剂30-60mg/天',
      })
    }
  } else if (profile.gender === 'female' && profile.age >= 12 && profile.age <= 50) {
    risks.push({
      nutrient: 'iron',
      nutrientName: '铁',
      riskLevel: 'moderate',
      reason: '育龄女性月经期铁流失，建议检测铁蛋白',
    })
  }

  // ── 维生素 B12 ───
  if (lab['lab_vitamin_b12'] !== undefined && lab['lab_vitamin_b12'] !== null) {
    const b12 = lab['lab_vitamin_b12']!
    if (b12 < 150) {
      risks.push({
        nutrient: 'vitamin_b12',
        nutrientName: '维生素 B12',
        riskLevel: 'high',
        reason: `B12=${b12} pmol/L，缺乏（<150）`,
        personalizedDosage: 'B12 1000μg 舌下含服/肌肉注射，每周1-2次',
      })
    } else if (b12 < 258) {
      risks.push({
        nutrient: 'vitamin_b12',
        nutrientName: '维生素 B12',
        riskLevel: 'moderate',
        reason: `B12=${b12} pmol/L，偏低（150-258）`,
        personalizedDosage: 'B12 500-1000μg/天，舌下含服',
      })
    }
  } else if (profile.dietPattern === 'strict_vegan') {
    risks.push({
      nutrient: 'vitamin_b12',
      nutrientName: '维生素 B12',
      riskLevel: 'high',
      reason: '严格素食者几乎无法从饮食中获取B12，必须补充',
    })
  }

  // ── TSH（桥本/甲减）──
  if (lab['lab_tsh'] !== undefined && lab['lab_tsh'] !== null) {
    const tsh = lab['lab_tsh']!
    if (tsh > 4.0) {
      risks.push({
        nutrient: 'tsh_elevated',
        nutrientName: 'TSH',
        riskLevel: 'high',
        reason: `TSH=${tsh} mIU/L，偏高（>4.0），建议复查并检测TPOAb`,
      })
    }
  }

  // ── 空腹血糖 ───
  if (lab['lab_fasting_glucose'] !== undefined && lab['lab_fasting_glucose'] !== null) {
    const fg = lab['lab_fasting_glucose']!
    if (fg >= 7.0) {
      risks.push({
        nutrient: 'fasting_glucose',
        nutrientName: '空腹血糖',
        riskLevel: 'high',
        reason: `空腹血糖=${fg} mmol/L，符合糖尿病诊断标准（≥7.0）`,
      })
    } else if (fg >= 5.6) {
      risks.push({
        nutrient: 'fasting_glucose',
        nutrientName: '空腹血糖',
        riskLevel: 'moderate',
        reason: `空腹血糖=${fg} mmol/L，糖尿病前期（5.6-6.9）`,
      })
    }
  }

  // ── 通用风险（无检测值时）──
  // 老年人
  if (profile.age >= 60) {
    if (!lab['lab_vitamin_d']) {
      risks.push({
        nutrient: 'vitamin_d',
        nutrientName: '维生素 D',
        riskLevel: 'moderate',
        reason: '老年人皮肤合成维D能力下降，建议检测25(OH)D',
      })
    }
    if (!lab['lab_ferritin']) {
      risks.push({
        nutrient: 'protein',
        nutrientName: '蛋白质',
        riskLevel: 'moderate',
        reason: '老年人蛋白质合成效率下降，肌少症风险',
      })
    }
  }

  // 素食者
  if (profile.dietPattern === 'strict_vegan') {
    const hasB12Risk = !risks.some(r => r.nutrient === 'vitamin_b12')
    if (hasB12Risk) {
      risks.push({
        nutrient: 'vitamin_b12',
        nutrientName: '维生素 B12',
        riskLevel: 'high',
        reason: '严格素食者必须补充B12',
      })
    }
  }

  return risks
}

// ─── 生成用户描述 ───

function buildUserDescription(
  profile: UserProfile,
  primary: PopulationMatch | null,
  secondary: PopulationMatch[],
  dietScore?: number,
): string {
  const parts: string[] = []

  // 年龄/性别
  parts.push(`${profile.gender === 'female' ? '女性' : '男性'}，age ${profile.age}岁`)

  // BMI
  if (profile.bmi) {
    parts.push(`BMI ${profile.bmi}`)
  }

  // 饮食质量
  if (dietScore !== undefined) {
    const dietLevel = dietScore >= 80 ? 'excellent' : dietScore >= 60 ? 'good' : dietScore >= 35 ? 'fair' : 'poor'
    const levelLabel: Record<string, string> = {
      excellent: '优秀',
      good: '良好',
      fair: '一般',
      poor: '较差',
    }
    parts.push(`饮食质量：${levelLabel[dietLevel]}(${dietScore}分)`)
  }

  // 主人群
  if (primary) {
    parts.push(`→ 主要匹配：【${primary.populationName}】`)
  }

  // 核心诉求
  if (profile.coreNeeds.length > 0) {
    parts.push(`核心诉求：${profile.coreNeeds.length}项`)
  }

  return parts.join(' | ')
}

// ─── 向后兼容：旧版症状评分（如有需要可启用）──

/**
 * 如果旧版数据（symptom_xxx 字段）存在，
 * 可用此函数计算症状评分。
 * 新版本优先使用 coreNeeds + followUpAnswers。
 */
export function calculateSymptomScoreLegacy(
  rawData: Record<string, any>,
): Map<string, { score: number; hitCount: number; details: string[] }> {
  // ...保留旧实现供迁移期使用...
  return new Map()
}
