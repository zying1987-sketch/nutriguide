/**
 * 饮食评估问卷 — v2.0
 *
 * 15 道题，覆盖八大维度（满分 150，最终归一化到 0-100）：
 * 1. 三餐规律性 (10)
 * 2. 早餐质量 (10)
 * 3. 三餐构成 (15) — 新增：细化到每餐碳水/蛋白/蔬菜比例
 * 4. 食物多样性 (10)
 * 5. 蔬菜摄入 (10)
 * 6. 蛋白质来源 (10)
 * 7. 水果摄入 (10)
 * 8. 主食结构 (10)
 * 9. 烹饪方式 (10)
 * 10. 外食频率 (10)
 * 11. 饮水 (10)
 * 12. 含糖饮品 (10) — 新增
 * 13. 吸烟 (10) — 新增
 * 14. 饮酒 (10) — 新增
 * 15. 零食 (5) — 新增
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
  category: 'meal_pattern' | 'food_diversity' | 'food_group' | 'cooking' | 'eating_out' | 'hydration' | 'meal_comp' | 'snack' | 'health_habit'
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
      { label: '几乎不吃水果（<100g）', value: 'none', score: 0 },
      { label: '半个水果（约 100-150g）', value: 'half', score: 3 },
      { label: '1 个水果（约 150-250g）', value: 'one', score: 6 },
      { label: '1-2 个水果（约 250-350g，指南推荐）', value: 'one_two', score: 8 },
      { label: '2 个以上（>350g）', value: 'two_plus', score: 10 },
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

  // ═══ 11. 三餐构成 — 早餐比例 (5分) ═══
  {
    id: 'diet_meal_breakfast_comp',
    question: '早餐的搭配通常是？（碳水：蛋白：蔬菜的饱腹感比例）',
    category: 'meal_comp',
    type: 'radio',
    weight: 5,
    options: [
      { label: '主要碳水（面包/粥/饼为主，缺蛋白和蔬菜）', value: 'carb_heavy', score: 2 },
      { label: '碳水 + 蛋白（如面包+蛋/奶，缺蔬菜）', value: 'carb_protein', score: 3.5 },
      { label: '碳水 + 蛋白 + 蔬菜/水果，较均衡', value: 'balanced', score: 5 },
      { label: '不吃早餐 / 只喝液体', value: 'none', score: 0 },
    ],
  },

  // ═══ 12. 三餐构成 — 午餐比例 (5分) ═══
  {
    id: 'diet_meal_lunch_comp',
    question: '午餐的搭配通常是？（餐盘视觉比例）',
    category: 'meal_comp',
    type: 'radio',
    weight: 5,
    options: [
      { label: '碳水占一半以上（米饭/面为主，菜和肉偏少）', value: 'carb_heavy', score: 2 },
      { label: '肉多菜少，碳水适中', value: 'protein_heavy', score: 3 },
      { label: '菜占 1/2，碳水 1/4，蛋白 1/4（餐盘法则）', value: 'balanced', score: 5 },
      { label: '不固定，外卖/快餐为主', value: 'takeout', score: 1 },
    ],
  },

  // ═══ 13. 三餐构成 — 晚餐比例 (5分) ═══
  {
    id: 'diet_meal_dinner_comp',
    question: '晚餐的搭配通常是？',
    category: 'meal_comp',
    type: 'radio',
    weight: 5,
    options: [
      { label: '和午餐差不多，碳水+肉+菜', value: 'balanced', score: 5 },
      { label: '偏清淡，菜多肉少碳水少', value: 'light', score: 4 },
      { label: '吃得最多的一餐（丰盛晚餐）', value: 'heavy', score: 1 },
      { label: '简单对付 / 不吃晚餐', value: 'skip', score: 0 },
    ],
  },

  // ═══ 14. 零食习惯 (5分) ═══
  {
    id: 'diet_snack_pattern',
    question: '正餐之外吃零食/加餐的情况？',
    category: 'snack',
    type: 'radio',
    weight: 5,
    options: [
      { label: '几乎不吃零食', value: 'none', score: 5 },
      { label: '偶尔水果/坚果等健康零食', value: 'healthy', score: 4 },
      { label: '每天 1-2 次零食（含不健康零食）', value: 'moderate', score: 2 },
      { label: '经常吃薯片/饼干/甜点等加工零食', value: 'junk', score: 0 },
    ],
  },

  // ═══ 15. 含糖饮品 (10分) ═══
  {
    id: 'diet_sugar_drinks',
    question: '您喝含糖饮品的情况？（奶茶、含糖咖啡、汽水、果汁饮料等）',
    category: 'health_habit',
    type: 'radio',
    weight: 10,
    options: [
      { label: '几乎不喝', value: 'none', score: 10 },
      { label: '每周 1-2 次', value: '1-2/week', score: 7 },
      { label: '每周 3-5 次', value: '3-5/week', score: 4 },
      { label: '每天 1-2 杯', value: 'daily', score: 1 },
      { label: '每天 3 杯以上', value: 'heavy', score: 0 },
    ],
  },

  // ═══ 16. 吸烟 (10分) ═══
  {
    id: 'diet_smoking',
    question: '您吸烟吗？',
    category: 'health_habit',
    type: 'radio',
    weight: 10,
    options: [
      { label: '从不吸烟', value: 'none', score: 10 },
      { label: '已戒烟（超过 6 个月）', value: 'quit', score: 9 },
      { label: '偶尔社交吸烟', value: 'social', score: 6 },
      { label: '每天 < 10 支', value: 'light', score: 3 },
      { label: '每天 ≥ 10 支', value: 'heavy', score: 0 },
    ],
  },

  // ═══ 17. 饮酒 (10分) ═══
  {
    id: 'diet_alcohol',
    question: '您饮酒的情况？',
    category: 'health_habit',
    type: 'radio',
    weight: 10,
    options: [
      { label: '不喝酒', value: 'none', score: 10 },
      { label: '已戒酒', value: 'quit', score: 9 },
      { label: '偶尔社交饮酒（每周 < 3 天）', value: 'social', score: 7 },
      { label: '经常饮酒（每周 3-5 天）', value: 'frequent', score: 3 },
      { label: '每天饮酒 / 偶尔大量饮酒', value: 'heavy', score: 0 },
    ],
  },
]

// 总分范围计算
const TOTAL_MAX_SCORE = dietQuestions.reduce((sum, q) => sum + q.weight, 0)

/**
 * 计算饮食质量评分（归一化到 0-100）
 * multiselect 题目：选中项分数累加（上限为该题权重）
 * radio 题目：取选中项分数
 * 总分 150 → 归一化 × 100/150
 */
export function calculateDietScore(answers: Record<string, string | string[]>): DietAssessmentResult {
  const TOTAL_MAX = 150
  let totalScore = 0
  const breakdown: { questionId: string; category: string; score: number; maxScore: number }[] = []

  for (const q of dietQuestions) {
    const answer = answers[q.id]
    let questionScore = 0

    if (!answer) {
      // 未回答 = 0 分
    } else if (q.type === 'multiselect' && Array.isArray(answer)) {
      for (const val of answer) {
        const opt = q.options.find(o => o.value === val)
        if (opt) questionScore += opt.score
      }
      questionScore = Math.min(questionScore, q.weight)
    } else if (q.type === 'radio' && typeof answer === 'string') {
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

  // 归一化到 0-100
  const normalizedScore = Math.round((totalScore / TOTAL_MAX) * 100)

  // 饮食质量等级
  let level: 'poor' | 'fair' | 'good' | 'excellent'
  if (normalizedScore >= 80) level = 'excellent'
  else if (normalizedScore >= 60) level = 'good'
  else if (normalizedScore >= 35) level = 'fair'
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

  return { score: normalizedScore, breakdown, level, strengths, weaknesses }
}

function getStrengthMessage(questionId: string): string {
  const map: Record<string, string> = {
    diet_meal_regularity: '三餐规律性良好',
    diet_breakfast: '早餐质量较高',
    diet_meal_breakfast_comp: '早餐搭配均衡',
    diet_meal_lunch_comp: '午餐结构合理（餐盘法则）',
    diet_meal_dinner_comp: '晚餐搭配健康',
    diet_snack_pattern: '零食习惯良好',
    diet_diversity: '食物多样性好',
    diet_vegetables: '蔬菜摄入充足',
    diet_protein_source: '蛋白质来源多样',
    diet_fruits: '水果摄入充足',
    diet_staples: '主食结构健康',
    diet_cooking: '烹饪方式健康',
    diet_eating_out: '较少外食/外卖',
    diet_hydration: '饮水充足',
    diet_sugar_drinks: '不依赖含糖饮品',
    diet_smoking: '无吸烟习惯',
    diet_alcohol: '无饮酒习惯',
  }
  return map[questionId] || ''
}

function getWeaknessMessage(questionId: string): string {
  const map: Record<string, string> = {
    diet_meal_regularity: '三餐不规律，建议至少保证一日三餐',
    diet_breakfast: '早餐质量不足，建议包含谷薯+蛋白质+蔬果',
    diet_meal_breakfast_comp: '早餐搭配不均衡，建议加入蛋白质和蔬果',
    diet_meal_lunch_comp: '午餐结构需优化，建议按餐盘法则（菜1/2 + 碳水1/4 + 蛋白1/4）',
    diet_meal_dinner_comp: '晚餐过于丰盛或随意对付，建议适度清淡',
    diet_snack_pattern: '零食选择不健康，建议以水果/坚果/酸奶替代加工零食',
    diet_diversity: '食物种类偏少，建议每天至少 12 种不同食物',
    diet_vegetables: '蔬菜摄入不足，建议每天 300-500g',
    diet_protein_source: '蛋白质来源单一，建议增加鱼/豆/蛋/奶多样性',
    diet_fruits: '水果摄入不足，建议每天 200-350g',
    diet_staples: '主食过于精细，建议一半换成全谷物',
    diet_cooking: '烹饪方式偏油，建议增加蒸煮凉拌比例',
    diet_eating_out: '外食/外卖频率较高，建议增加家庭烹饪',
    diet_hydration: '饮水量不足，建议每天 1.5-2L',
    diet_sugar_drinks: '含糖饮品摄入过多，增加肥胖/糖尿病/心血管风险',
    diet_smoking: '吸烟加速营养素消耗（尤其是维C/维E/β-胡萝卜素）',
    diet_alcohol: '饮酒增加肝脏负担，影响多种营养素吸收代谢',
  }
  return map[questionId] || ''
}
