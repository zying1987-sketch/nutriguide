/**
 * 饮食评估问卷 — ARCHITECTURE.md 缺口 2
 *
 * 10 道饮食评估题，覆盖六大维度：
 * 1. 三餐规律性
 * 2. 食物多样性
 * 3. 各食物组摄入频率
 * 4. 烹饪方式
 * 5. 外食/加工食品频率
 * 6. 饮水
 *
 * 每题有 0-10 分权重，满分 100。
 */

export interface DietAssessmentResult {
  score: number
  breakdown: { questionId: string; category: string; score: number; maxScore: number }[]
  level: 'poor' | 'fair' | 'good' | 'excellent'
  strengths: string[]
  weaknesses: string[]
}

export interface DietQuestion {
  id: string
  question: string
  category: 'meal_pattern' | 'food_diversity' | 'food_group' | 'cooking' | 'eating_out' | 'hydration'
  type: 'radio' | 'multiselect'
  options: {
    label: string
    value: string
    score: number
  }[]
  weight: number // 该题在总分中的权重 (满分 100 则 weight=该题满分)
}

export const dietQuestions: DietQuestion[] = [
  // ═══ 1. 三餐规律性 (10分) ═══
  {
    id: 'diet_meal_regularity',
    question: '您每天吃几餐？',
    category: 'meal_pattern',
    type: 'radio',
    weight: 10,
    options: [
      { label: '1 餐', value: '1', score: 2 },
      { label: '2 餐', value: '2', score: 5 },
      { label: '3 餐（基本规律）', value: '3', score: 8 },
      { label: '3 餐 + 加餐', value: '3+', score: 10 },
    ],
  },

  // ═══ 2. 早餐质量 (10分) ═══
  {
    id: 'diet_breakfast',
    question: '您的早餐通常包含哪些？',
    category: 'meal_pattern',
    type: 'multiselect',
    weight: 10,
    options: [
      { label: '不吃早餐', value: 'none', score: 0 },
      { label: '谷薯类（面包/粥/麦片/红薯等）', value: 'grain', score: 3 },
      { label: '蛋白质（蛋/奶/豆浆/肉等）', value: 'protein', score: 4 },
      { label: '蔬果', value: 'veg_fruit', score: 3 },
    ],
  },

  // ═══ 3. 食物多样性 (10分) ═══
  {
    id: 'diet_diversity',
    question: '您平均每天吃多少种不同的食物？',
    category: 'food_diversity',
    type: 'radio',
    weight: 10,
    options: [
      { label: '少于 5 种', value: '<5', score: 2 },
      { label: '5-8 种', value: '5-8', score: 5 },
      { label: '8-12 种', value: '8-12', score: 8 },
      { label: '12 种以上', value: '>12', score: 10 },
    ],
  },

  // ═══ 4. 蔬菜摄入频率 (10分) ═══
  {
    id: 'diet_vegetables',
    question: '您每天蔬菜的摄入量大约是？',
    category: 'food_group',
    type: 'radio',
    weight: 10,
    options: [
      { label: '几乎不吃蔬菜', value: 'none', score: 0 },
      { label: '少于半碗（<150g）', value: '<150', score: 3 },
      { label: '半碗到一碗（150-300g）', value: '150-300', score: 6 },
      { label: '一碗到两碗（300-500g）', value: '300-500', score: 8 },
      { label: '超过两碗（>500g）', value: '>500', score: 10 },
    ],
  },

  // ═══ 5. 蛋白质来源多样性 (10分) ═══
  {
    id: 'diet_protein_source',
    question: '您的蛋白质主要来自？（多选）',
    category: 'food_group',
    type: 'multiselect',
    weight: 10,
    options: [
      { label: '红肉（猪/牛/羊）', value: 'red_meat', score: 2 },
      { label: '禽肉（鸡/鸭）', value: 'poultry', score: 2 },
      { label: '鱼虾海鲜', value: 'seafood', score: 2 },
      { label: '蛋类', value: 'eggs', score: 1 },
      { label: '豆制品（豆腐/豆浆/豆干）', value: 'soy', score: 2 },
      { label: '奶制品', value: 'dairy', score: 1 },
    ],
  },

  // ═══ 6. 水果摄入 (10分) ═══
  {
    id: 'diet_fruits',
    question: '您每天水果的摄入量大约是？',
    category: 'food_group',
    type: 'radio',
    weight: 10,
    options: [
      { label: '几乎不吃水果', value: 'none', score: 0 },
      { label: '半个水果（约 100g）', value: 'half', score: 4 },
      { label: '1 个水果（约 200g）', value: 'one', score: 7 },
      { label: '2 个及以上（>250g）', value: 'two_plus', score: 10 },
    ],
  },

  // ═══ 7. 主食结构 (10分) ═══
  {
    id: 'diet_staples',
    question: '您的主食主要是？',
    category: 'food_group',
    type: 'radio',
    weight: 10,
    options: [
      { label: '几乎不吃主食', value: 'none', score: 1 },
      { label: '主要是精白米面', value: 'refined', score: 4 },
      { label: '精白米面为主，偶尔有粗粮', value: 'mostly_refined', score: 6 },
      { label: '粗粮和精粮各一半', value: 'half_whole', score: 8 },
      { label: '粗粮/全谷物为主', value: 'whole_grain', score: 10 },
    ],
  },

  // ═══ 8. 烹饪方式 (10分) ═══
  {
    id: 'diet_cooking',
    question: '您家常用的烹饪方式主要是？',
    category: 'cooking',
    type: 'multiselect',
    weight: 10,
    options: [
      { label: '蒸/煮/炖/凉拌', value: 'steam_boil', score: 4 },
      { label: '快炒', value: 'stir_fry', score: 3 },
      { label: '红烧/焖炖（油多）', value: 'braise', score: 1 },
      { label: '煎/炸/烤', value: 'fry', score: 0 },
    ],
  },

  // ═══ 9. 外食与加工食品 (10分) ═══
  {
    id: 'diet_eating_out',
    question: '您平均每周外出就餐或外卖的次数？',
    category: 'eating_out',
    type: 'radio',
    weight: 10,
    options: [
      { label: '几乎每餐都在外面吃', value: 'always', score: 1 },
      { label: '每周 7 次以上（含中晚餐外卖）', value: '>7', score: 3 },
      { label: '每周 3-7 次', value: '3-7', score: 5 },
      { label: '每周 1-3 次', value: '1-3', score: 8 },
      { label: '几乎不在外面吃', value: 'rarely', score: 10 },
    ],
  },

  // ═══ 10. 饮水 (10分) ═══
  {
    id: 'diet_hydration',
    question: '您每天大约喝多少水？（不含咖啡/茶/汤/饮料）',
    category: 'hydration',
    type: 'radio',
    weight: 10,
    options: [
      { label: '少于 500ml', value: '<500', score: 2 },
      { label: '500-1000ml', value: '500-1000', score: 4 },
      { label: '1000-1500ml', value: '1000-1500', score: 7 },
      { label: '1500-2000ml', value: '1500-2000', score: 9 },
      { label: '2000ml 以上', value: '>2000', score: 10 },
    ],
  },
]

/**
 * 计算饮食质量评分 (0-100)
 * multiselect 题目：选中项分数累加（上限为该题权重）
 * radio 题目：取选中项分数
 */
export function calculateDietScore(answers: Record<string, string | string[]>): DietAssessmentResult {
  let totalScore = 0
  const breakdown: { questionId: string; category: string; score: number; maxScore: number }[] = []

  for (const q of dietQuestions) {
    const answer = answers[q.id]
    let questionScore = 0

    if (!answer) {
      // 未回答 = 0 分
    } else if (q.type === 'multiselect' && Array.isArray(answer)) {
      // 多选：累加分数，上限为 weight
      for (const val of answer) {
        const opt = q.options.find(o => o.value === val)
        if (opt) questionScore += opt.score
      }
      questionScore = Math.min(questionScore, q.weight)
    } else if (q.type === 'radio' && typeof answer === 'string') {
      // 单选：取匹配项的分数
      const opt = q.options.find(o => o.value === answer)
      if (opt) questionScore = opt.score
    }

    totalScore += questionScore
    breakdown.push({
      questionId: q.id,
      category: q.category,
      score: questionScore,
      maxScore: q.weight,
    })
  }

  // 饮食质量等级
  let level: 'poor' | 'fair' | 'good' | 'excellent'
  if (totalScore >= 80) level = 'excellent'
  else if (totalScore >= 60) level = 'good'
  else if (totalScore >= 35) level = 'fair'
  else level = 'poor'

  // 优势项：得分 ≥ 80% 满分的维度
  const strengths: string[] = []
  const weaknesses: string[] = []

  for (const item of breakdown) {
    const pct = item.maxScore > 0 ? item.score / item.maxScore : 0
    if (pct >= 0.8) {
      strengths.push(getStrengthMessage(item.questionId))
    } else if (pct <= 0.4) {
      weaknesses.push(getWeaknessMessage(item.questionId))
    }
  }

  return { score: Math.round(totalScore), breakdown, level, strengths, weaknesses }
}

function getStrengthMessage(questionId: string): string {
  const map: Record<string, string> = {
    diet_meal_regularity: '三餐规律性良好',
    diet_breakfast: '早餐质量较高',
    diet_diversity: '食物多样性好',
    diet_vegetables: '蔬菜摄入充足',
    diet_protein_source: '蛋白质来源多样',
    diet_fruits: '水果摄入充足',
    diet_staples: '主食结构健康',
    diet_cooking: '烹饪方式健康',
    diet_eating_out: '较少外食/外卖',
    diet_hydration: '饮水充足',
  }
  return map[questionId] || ''
}

function getWeaknessMessage(questionId: string): string {
  const map: Record<string, string> = {
    diet_meal_regularity: '三餐不规律，建议至少保证一日三餐',
    diet_breakfast: '早餐质量不足，建议包含谷薯+蛋白质+蔬果',
    diet_diversity: '食物种类偏少，建议每天至少 12 种不同食物',
    diet_vegetables: '蔬菜摄入不足，建议每天 300-500g',
    diet_protein_source: '蛋白质来源单一，建议增加鱼/豆/蛋/奶多样性',
    diet_fruits: '水果摄入不足，建议每天 200-350g',
    diet_staples: '主食过于精细，建议一半换成全谷物',
    diet_cooking: '烹饪方式偏油，建议增加蒸煮凉拌比例',
    diet_eating_out: '外食/外卖频率较高，建议增加家庭烹饪',
    diet_hydration: '饮水量不足，建议每天 1.5-2L',
  }
  return map[questionId] || ''
}
