// 规则引擎 - 基于用户评估结果匹配人群方案

import { symptomList, type SymptomItem } from '../data/assessment'
import { populationPlans, populationPriority, type PopulationPlan } from '../data/populationPlans'

export interface UserProfile {
  age: number
  gender: 'male' | 'female'
  bmi: number
  pregnancyStatus?: string
  diagnoses: string[]
  medications: string[]
  dietPattern: string
  exerciseLevel: string
  sleepHours: string
  stressLevel: string
  smoking: string
  alcohol: string
  symptoms: Record<string, number>
  labData: Record<string, number | null>
  dietDiary: Record<string, string>
  specialScreening: Record<string, string>
}

export interface PopulationMatch {
  populationId: string
  populationName: string
  category: string
  confidence: number // 0-1
  subType?: string
  reason: string[]
}

export interface AssessmentResult {
  primaryPopulation: PopulationMatch | null
  secondaryPopulations: PopulationMatch[]
  deficiencyRisks: DeficiencyRisk[]
  userProfile: UserProfile
}

export interface DeficiencyRisk {
  nutrient: string
  nutrientName: string
  riskLevel: 'high' | 'moderate' | 'low'
  reason: string
}

// 基于症状评分计算各人群匹配置信度
function calculateSymptomScore(symptoms: Record<string, number>): Map<string, { score: number; hitCount: number; details: string[] }> {
  const populationScores = new Map<string, { score: number; hitCount: number; details: string[] }>()

  for (const symptom of symptomList) {
    const userScore = symptoms[symptom.id] || 0
    if (userScore === 0) continue

    for (const pop of symptom.targetPopulations) {
      const existing = populationScores.get(pop) || { score: 0, hitCount: 0, details: [] }
      const weightedScore = userScore * symptom.weight
      existing.score += weightedScore
      existing.hitCount += 1
      existing.details.push(`${symptom.label}(评分:${userScore},权重:${symptom.weight})`)
      populationScores.set(pop, existing)
    }
  }

  return populationScores
}

// 判断是否为素食者
function isVegetarian(dietPattern: string): boolean {
  return ['lacto_ovo', 'strict_vegan', 'pescatarian', 'flexitarian'].includes(dietPattern)
}

// 判断素食亚型
function getVegetarianSubType(dietPattern: string): string {
  switch (dietPattern) {
    case 'strict_vegan': return 'vegetarian_strict'
    case 'lacto_ovo': return 'vegetarian_lacto_ovo'
    case 'pescatarian': return 'vegetarian_strict' // 近似纯素
    case 'flexitarian': return 'vegetarian_lacto_ovo' // 近似蛋奶素
    default: return 'vegetarian_lacto_ovo'
  }
}

// 判断健身亚型
function getFitnessSubType(exerciseLevel: string): string | null {
  if (exerciseLevel === 'athlete') return 'fitness_bulking' // 简化：高强度默认增肌
  if (exerciseLevel === 'active') return 'fitness_bulking'
  return null
}

// 判断PCOS亚型
function getPCOSSubType(user: UserProfile): string {
  // 基于BMI和症状判断
  if (user.bmi >= 25) return 'pcos_insulin_resistant'
  return 'pcos_insulin_resistant' // 默认胰岛素抵抗型（最常见）
}

// 判断IBS亚型
function getIBSSubType(specialScreening: Record<string, string>): string {
  const stoolType = specialScreening.stool_type
  if (stoolType === 'loose' || stoolType === 'alternating') return 'ibs_d'
  if (stoolType === 'hard') return 'ibs_d' // 简化：只有IBS-D方案
  return 'ibs_d' // 默认
}

// 判断桥本亚型
function getHashimotoSubType(user: UserProfile): string {
  const onLevo = user.medications.includes('levothyroxine')
  if (onLevo) return 'hashimoto_hypothyroid'

  const tsh = user.labData.lab_tsh
  if (tsh !== null && tsh !== undefined) {
    if (tsh > 4.0) return 'hashimoto_hypothyroid'
  }

  return 'hashimoto_euthyroid'
}

// 判断孕期亚型
function getPregnancySubType(user: UserProfile): string {
  switch (user.pregnancyStatus) {
    case 'preconception': return 'pregnancy_preconception'
    case 'pregnant_t1': return 'pregnancy_t1'
    case 'pregnant_t2': return 'pregnancy_t2'
    case 'pregnant_t3': return 'pregnancy_t3'
    case 'lactation': return 'pregnancy_lactation'
    default: return 'pregnancy_general'
  }
}

// 判断更年期亚型
function getMenopauseSubType(specialScreening: Record<string, string>): string {
  const stage = specialScreening.menopause_age
  if (stage === 'early_menopause') return 'menopause'
  return 'menopause'
}

// 分析缺乏风险
function analyzeDeficiencyRisks(user: UserProfile): DeficiencyRisk[] {
  const risks: DeficiencyRisk[] = []

  // 素食 + B12风险
  if (isVegetarian(user.dietPattern)) {
    risks.push({ nutrient: 'vitamin_b12', nutrientName: '维生素B12', riskLevel: user.dietPattern === 'strict_vegan' ? 'high' : 'moderate', reason: '素食者仅靠饮食无法获取足量B12' })
  }

  // 素食 + 铁风险
  if (isVegetarian(user.dietPattern) && user.gender === 'female') {
    risks.push({ nutrient: 'iron', nutrientName: '铁', riskLevel: 'moderate', reason: '素食+月经期女性，植物铁吸收率低' })
  }

  // 女性 + 铁风险（经期）
  if (user.gender === 'female' && user.age >= 12 && user.age <= 50 && user.pregnancyStatus === 'none') {
    risks.push({ nutrient: 'iron', nutrientName: '铁', riskLevel: 'moderate', reason: '育龄女性月经期铁流失' })
  }

  // 室内工作 + 维D
  risks.push({ nutrient: 'vitamin_d', nutrientName: '维生素D', riskLevel: 'moderate', reason: '现代生活方式日照普遍不足' })

  // 老年人 + 多项风险
  if (user.age >= 60) {
    risks.push({ nutrient: 'vitamin_d', nutrientName: '维生素D', riskLevel: 'high', reason: '老年人皮肤合成维D能力下降' })
    risks.push({ nutrient: 'vitamin_b12', nutrientName: '维生素B12', riskLevel: 'moderate', reason: '老年人胃酸减少→B12吸收率下降' })
    risks.push({ nutrient: 'calcium', nutrientName: '钙', riskLevel: 'moderate', reason: '老年人骨钙流失加速' })
    risks.push({ nutrient: 'protein', nutrientName: '蛋白质', riskLevel: 'moderate', reason: '老年人蛋白质合成效率下降→肌少症风险' })
  }

  // 压力大 + 镁
  if (user.stressLevel === 'moderate' || user.stressLevel === 'severe') {
    risks.push({ nutrient: 'magnesium', nutrientName: '镁', riskLevel: 'moderate', reason: '压力→镁消耗增加' })
  }

  // 乳制品不吃 → 钙风险
  const dairyFreq = user.dietDiary.food_dairy
  if (dairyFreq === 'rarely') {
    risks.push({ nutrient: 'calcium', nutrientName: '钙', riskLevel: 'moderate', reason: '乳制品摄入不足→钙来源受限' })
  }

  // 检测值异常
  const lab = user.labData
  if (lab.lab_vitamin_d !== null && lab.lab_vitamin_d !== undefined && lab.lab_vitamin_d < 50) {
    risks.push({ nutrient: 'vitamin_d', nutrientName: '维生素D', riskLevel: lab.lab_vitamin_d < 30 ? 'high' : 'moderate', reason: `实测25(OH)D=${lab.lab_vitamin_d}nmol/L，低于理想值75` })
  }
  if (lab.lab_ferritin !== null && lab.lab_ferritin !== undefined) {
    if (lab.lab_ferritin < 15) risks.push({ nutrient: 'iron', nutrientName: '铁', riskLevel: 'high', reason: `铁蛋白=${lab.lab_ferritin}μg/L，明确缺乏` })
    else if (lab.lab_ferritin < 50) risks.push({ nutrient: 'iron', nutrientName: '铁', riskLevel: 'moderate', reason: `铁蛋白=${lab.lab_ferritin}μg/L，储备偏低` })
  }
  if (lab.lab_vitamin_b12 !== null && lab.lab_vitamin_b12 !== undefined && lab.lab_vitamin_b12 < 258) {
    risks.push({ nutrient: 'vitamin_b12', nutrientName: '维生素B12', riskLevel: lab.lab_vitamin_b12 < 148 ? 'high' : 'moderate', reason: `实测B12=${lab.lab_vitamin_b12}pmol/L` })
  }

  return risks
}

// 主入口：评估用户并输出匹配结果
export function evaluateUser(rawData: Record<string, any>): AssessmentResult {
  // 构建 UserProfile
  const bmi = rawData.weight / ((rawData.height / 100) ** 2)
  const user: UserProfile = {
    age: parseInt(rawData.age) || 30,
    gender: rawData.gender || 'female',
    bmi: Math.round(bmi * 10) / 10,
    pregnancyStatus: rawData.pregnancy_status || 'none',
    diagnoses: Array.isArray(rawData.diagnosis) ? rawData.diagnosis.filter((d: string) => d !== 'none') : [],
    medications: Array.isArray(rawData.medications) ? rawData.medications.filter((m: string) => m !== 'none') : [],
    dietPattern: rawData.diet_pattern || 'omnivore',
    exerciseLevel: rawData.exercise_frequency || 'sedentary',
    sleepHours: rawData.sleep_hours || 'normal',
    stressLevel: rawData.stress_level || 'none',
    smoking: rawData.smoking || 'never',
    alcohol: rawData.alcohol || 'never',
    symptoms: {} as Record<string, number>,
    labData: {} as Record<string, number | null>,
    dietDiary: {} as Record<string, string>,
    specialScreening: {} as Record<string, string>,
  }

  // 提取症状评分
  for (const symptom of symptomList) {
    user.symptoms[symptom.id] = parseInt(rawData[`symptom_${symptom.id}`]) || 0
  }

  // 提取实验室数据
  const labFields = ['lab_vitamin_d', 'lab_ferritin', 'lab_tsh', 'lab_tpoab', 'lab_fasting_glucose', 'lab_hba1c', 'lab_vitamin_b12', 'lab_hemoglobin']
  for (const field of labFields) {
    user.labData[field] = rawData[field] ? parseFloat(rawData[field]) : null
  }

  // 提取饮食日记
  const foodFields = ['food_greens', 'food_dairy', 'food_soy', 'food_red_meat', 'food_fish', 'food_wholegrain', 'food_nuts', 'food_sweets']
  for (const field of foodFields) {
    user.dietDiary[field] = rawData[field] || ''
  }

  // 提取专项筛查
  const screeningFields = ['ibs_rome_iv', 'stool_type', 'phq2_mood', 'phq2_pleasure', 'gad2_nervous', 'gad2_worry', 'diabetes_family', 'hashimoto_family', 'menstrual_cycle_length', 'menopause_age']
  for (const field of screeningFields) {
    user.specialScreening[field] = rawData[field] || ''
  }

  // 计算症状评分
  const symptomScores = calculateSymptomScore(user.symptoms)

  // 构建匹配结果
  const allMatches: PopulationMatch[] = []
  const matchedCategories = new Set<string>()

  // 1. 已确诊疾病 → 直接匹配
  for (const diagnosis of user.diagnoses) {
    if (diagnosis === 'hashimoto' && !matchedCategories.has('hashimoto')) {
      allMatches.push({
        populationId: getHashimotoSubType(user),
        populationName: populationPlans[getHashimotoSubType(user)]?.name || '桥本甲状腺炎',
        category: 'hashimoto',
        confidence: 0.95,
        reason: ['已确诊桥本甲状腺炎'],
      })
      matchedCategories.add('hashimoto')
    }
    if (diagnosis === 'diabetes' && !matchedCategories.has('diabetes')) {
      allMatches.push({
        populationId: 'diabetes_type2',
        populationName: '2型糖尿病',
        category: 'diabetes',
        confidence: 0.95,
        reason: ['已确诊糖尿病'],
      })
      matchedCategories.add('diabetes')
    }
    if (diagnosis === 'pcos' && !matchedCategories.has('pcos')) {
      allMatches.push({
        populationId: getPCOSSubType(user),
        populationName: 'PCOS',
        category: 'pcos',
        confidence: 0.95,
        reason: ['已确诊PCOS'],
      })
      matchedCategories.add('pcos')
    }
    if (diagnosis === 'ibs' && !matchedCategories.has('ibs')) {
      allMatches.push({
        populationId: getIBSSubType(user.specialScreening),
        populationName: 'IBS',
        category: 'ibs',
        confidence: 0.9,
        reason: ['已确诊IBS'],
      })
      matchedCategories.add('ibs')
    }
    if (diagnosis === 'depression_anxiety' && !matchedCategories.has('mental_health')) {
      allMatches.push({
        populationId: 'anxiety_depression',
        populationName: '焦虑/抑郁',
        category: 'mental_health',
        confidence: 0.9,
        reason: ['已确诊抑郁/焦虑'],
      })
      matchedCategories.add('mental_health')
    }
  }

  // 2. 孕期状态
  if (user.pregnancyStatus && user.pregnancyStatus !== 'none' && !matchedCategories.has('pregnancy')) {
    const pregType = getPregnancySubType(user)
    allMatches.push({
      populationId: pregType,
      populationName: populationPlans[pregType]?.name || '孕期',
      category: 'pregnancy',
      confidence: 0.98,
      reason: [`孕期状态: ${user.pregnancyStatus}`],
    })
    matchedCategories.add('pregnancy')
  }

  // 3. 症状评分 → 潜在匹配
  for (const [popCategory, scoreData] of symptomScores.entries()) {
    if (matchedCategories.has(popCategory)) continue

    const maxPossibleScore = symptomList
      .filter(s => s.targetPopulations.includes(popCategory))
      .reduce((sum, s) => sum + 3 * s.weight, 0)

    const confidence = maxPossibleScore > 0 ? Math.min(scoreData.score / (maxPossibleScore * 0.4), 0.85) : 0

    if (confidence >= 0.3) {
      let popId = ''
      let popName = ''

      switch (popCategory) {
        case 'hashimoto':
          popId = getHashimotoSubType(user)
          popName = populationPlans[popId]?.name || '桥本甲状腺炎'
          break
        case 'pcos':
          popId = getPCOSSubType(user)
          popName = 'PCOS'
          break
        case 'ibs':
          popId = getIBSSubType(user.specialScreening)
          popName = 'IBS'
          break
        case 'mental_health':
          popId = 'anxiety_depression'
          popName = '焦虑/抑郁倾向'
          break
        case 'diabetes':
          popId = 'diabetes_type2'
          popName = '糖尿病风险'
          break
        case 'menopause':
          popId = 'menopause'
          popName = '更年期'
          break
        case 'menstrual':
          popId = 'menstrual_cycle'
          popName = '月经周期优化'
          break
        default:
          continue
      }

      allMatches.push({
        populationId: popId,
        populationName: popName,
        category: popCategory,
        confidence: Math.round(confidence * 100) / 100,
        reason: scoreData.details.slice(0, 3),
      })
      matchedCategories.add(popCategory)
    }
  }

  // 4. 素食/健身/年龄等 lifestyle 匹配
  if (isVegetarian(user.dietPattern) && !matchedCategories.has('vegetarian')) {
    const vegType = getVegetarianSubType(user.dietPattern)
    allMatches.push({
      populationId: vegType,
      populationName: user.dietPattern === 'strict_vegan' ? '严格素食' : '蛋奶素食',
      category: 'vegetarian',
      confidence: 0.95,
      reason: [`饮食模式: ${user.dietPattern}`],
    })
    matchedCategories.add('vegetarian')
  }

  const fitnessSubType = getFitnessSubType(user.exerciseLevel)
  if (fitnessSubType && !matchedCategories.has('fitness')) {
    allMatches.push({
      populationId: fitnessSubType,
      populationName: '健身人群',
      category: 'fitness',
      confidence: 0.8,
      reason: ['高强度运动习惯'],
    })
    matchedCategories.add('fitness')
  }

  // 年龄匹配
  if (user.age >= 60 && !matchedCategories.has('elderly')) {
    allMatches.push({
      populationId: 'elderly_general',
      populationName: '老年人（60-74岁）',
      category: 'elderly',
      confidence: 0.9,
      reason: [`年龄: ${user.age}岁`],
    })
    matchedCategories.add('elderly')
  } else if (user.age >= 10 && user.age < 20 && !matchedCategories.has('adolescent')) {
    allMatches.push({
      populationId: 'adolescent',
      populationName: '青少年（10-19岁）',
      category: 'adolescent',
      confidence: 0.9,
      reason: [`年龄: ${user.age}岁`],
    })
    matchedCategories.add('adolescent')
  }

  // 按优先级排序
  allMatches.sort((a, b) => {
    const priorityA = populationPriority[a.category] || 0
    const priorityB = populationPriority[b.category] || 0
    if (priorityB !== priorityA) return priorityB - priorityA
    return b.confidence - a.confidence
  })

  // 主人群 = 第一匹配
  const primaryPopulation = allMatches.length > 0 ? allMatches[0] : null
  const secondaryPopulations = allMatches.length > 1 ? allMatches.slice(1) : []

  // 分析缺乏风险
  const deficiencyRisks = analyzeDeficiencyRisks(user)

  return {
    primaryPopulation,
    secondaryPopulations,
    deficiencyRisks,
    userProfile: user,
  }
}
