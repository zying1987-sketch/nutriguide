// 评估问卷数据 - 6步自测流程

export interface AssessmentStep {
  id: string
  title: string
  description: string
  stepNumber: number
  fields: AssessmentField[]
}

export interface AssessmentField {
  id: string
  type: 'text' | 'number' | 'select' | 'multiselect' | 'radio' | 'slider' | 'lab_value' | 'conditional'
  label: string
  description?: string
  required?: boolean
  options?: { label: string; value: string }[]
  min?: number
  max?: number
  unit?: string
  triggers?: string // For conditional fields
  showCondition?: { field: string; value: string | string[] }
}

export interface SymptomItem {
  id: string
  label: string
  description?: string
  targetPopulations: string[]
  weight: number // 症状与人群关联权重
}

export const symptomList: SymptomItem[] = [
  // 甲减/桥本相关
  { id: 'cold_intolerance', label: '手脚冰凉、怕冷', targetPopulations: ['hashimoto'], weight: 3 },
  { id: 'weight_gain_unexplained', label: '不明原因体重增加', targetPopulations: ['hashimoto', 'pcos', 'menopause', 'diabetes'], weight: 2 },
  { id: 'constipation', label: '便秘', targetPopulations: ['hashimoto', 'ibs', 'elderly'], weight: 1 },
  { id: 'dry_skin', label: '皮肤干燥粗糙', targetPopulations: ['hashimoto', 'menopause'], weight: 1 },
  { id: 'hair_loss', label: '脱发增加', targetPopulations: ['hashimoto', 'pcos', 'menopause'], weight: 2 },
  { id: 'memory_fog', label: '记忆力下降/脑雾', targetPopulations: ['hashimoto', 'menopause', 'mental_health'], weight: 2 },
  { id: 'fatigue', label: '长期疲劳（休息后不缓解）', targetPopulations: ['hashimoto', 'mental_health', 'pcos', 'anxiety_depression'], weight: 2 },

  // 甲亢相关
  { id: 'palpitations', label: '心慌、心跳加速', targetPopulations: ['hashimoto'], weight: 2 },
  { id: 'heat_intolerance', label: '怕热、多汗', targetPopulations: ['hashimoto'], weight: 2 },

  // PCOS相关
  { id: 'irregular_period', label: '月经不规律（周期<21天或>35天）', targetPopulations: ['pcos', 'menstrual', 'menopause'], weight: 3 },
  { id: 'hirsutism', label: '多毛（面部/胸部/腹部）', targetPopulations: ['pcos'], weight: 3 },
  { id: 'acne', label: '痤疮（成人期/下颌部位）', targetPopulations: ['pcos', 'menstrual', 'adolescent'], weight: 2 },
  { id: 'infertility', label: '不孕/备孕困难', targetPopulations: ['pcos', 'pregnancy', 'menstrual'], weight: 2 },

  // IBS相关
  { id: 'abdominal_pain', label: '经常腹痛/腹胀', targetPopulations: ['ibs'], weight: 3 },
  { id: 'bloating', label: '腹胀（餐后加重）', targetPopulations: ['ibs'], weight: 2 },
  { id: 'diarrhea', label: '腹泻（无感染原因）', targetPopulations: ['ibs'], weight: 3 },
  { id: 'alternating_bowel', label: '腹泻与便秘交替', targetPopulations: ['ibs'], weight: 3 },

  // 心理健康
  { id: 'low_mood', label: '情绪低落、兴趣减退（持续≥2周）', targetPopulations: ['mental_health'], weight: 3 },
  { id: 'anxiety_worry', label: '过度担忧、紧张不安', targetPopulations: ['mental_health'], weight: 3 },
  { id: 'insomnia', label: '入睡困难或早醒', targetPopulations: ['mental_health', 'menopause'], weight: 2 },
  { id: 'muscle_tension', label: '肌肉紧绷/酸痛', targetPopulations: ['mental_health'], weight: 1 },

  // 糖尿病相关
  { id: 'thirst_polyuria', label: '异常口渴/多尿', targetPopulations: ['diabetes'], weight: 3 },
  { id: 'blurred_vision', label: '视力模糊（血糖波动相关）', targetPopulations: ['diabetes'], weight: 2 },
  { id: 'slow_healing', label: '伤口愈合慢', targetPopulations: ['diabetes'], weight: 2 },
  { id: 'numbness', label: '手足麻木/刺痛', targetPopulations: ['diabetes'], weight: 2 },

  // 更年期相关
  { id: 'hot_flash', label: '潮热/盗汗', targetPopulations: ['menopause'], weight: 3 },
  { id: 'mood_swings', label: '情绪波动/易怒', targetPopulations: ['menopause', 'menstrual', 'mental_health'], weight: 2 },
  { id: 'joint_pain', label: '关节疼痛/僵硬', targetPopulations: ['menopause', 'elderly'], weight: 1 },
  { id: 'vaginal_dryness', label: '阴道干涩', targetPopulations: ['menopause'], weight: 2 },

  // 通用营养缺乏
  { id: 'muscle_cramps', label: '肌肉抽筋（尤其夜间）', targetPopulations: ['fitness', 'pregnancy', 'elderly'], weight: 1 },
  { id: 'brittle_nails', label: '指甲脆弱/有纵纹', targetPopulations: ['general'], weight: 1 },
  { id: 'frequent_infection', label: '频繁感冒/感染', targetPopulations: ['general'], weight: 1 },
  { id: 'poor_wound_healing', label: '伤口愈合慢', targetPopulations: ['elderly'], weight: 1 },
  { id: 'night_blindness', label: '夜盲/暗适应差', targetPopulations: ['general'], weight: 1 },
  { id: 'bleeding_gums', label: '牙龈易出血', targetPopulations: ['general'], weight: 1 },
  { id: 'loss_appetite', label: '食欲减退', targetPopulations: ['elderly', 'mental_health'], weight: 1 },
  { id: 'cravings', label: '强烈甜食/碳水渴望', targetPopulations: ['pcos', 'diabetes', 'mental_health'], weight: 1 },
]

export const assessmentSteps: AssessmentStep[] = [
  {
    id: 'basic_info',
    title: '基础信息',
    description: '这些信息帮助我们初步了解您的身体状况',
    stepNumber: 1,
    fields: [
      { id: 'age', type: 'number', label: '年龄', min: 10, max: 120, required: true, unit: '岁' },
      { id: 'gender', type: 'select', label: '性别', required: true, options: [
        { label: '女', value: 'female' },
        { label: '男', value: 'male' },
      ]},
      { id: 'height', type: 'number', label: '身高', min: 100, max: 250, required: true, unit: 'cm' },
      { id: 'weight', type: 'number', label: '体重', min: 30, max: 300, required: true, unit: 'kg' },
      { id: 'pregnancy_status', type: 'select', label: '是否怀孕/备孕/哺乳', required: false, options: [
        { label: '无', value: 'none' },
        { label: '备孕中', value: 'preconception' },
        { label: '已怀孕（孕早期0-12周）', value: 'pregnant_t1' },
        { label: '已怀孕（孕中期13-27周）', value: 'pregnant_t2' },
        { label: '已怀孕（孕晚期28周+）', value: 'pregnant_t3' },
        { label: '哺乳期', value: 'lactation' },
      ], showCondition: { field: 'gender', value: 'female' } },
      { id: 'diagnosis', type: 'multiselect', label: '已确诊疾病（可多选）', required: false, options: [
        { label: '桥本甲状腺炎', value: 'hashimoto' },
        { label: '甲亢/Graves病', value: 'hyperthyroidism' },
        { label: '甲减', value: 'hypothyroidism' },
        { label: '糖尿病（1型/2型）', value: 'diabetes' },
        { label: 'PCOS（多囊卵巢综合征）', value: 'pcos' },
        { label: 'IBS（肠易激综合征）', value: 'ibs' },
        { label: '抑郁/焦虑症', value: 'depression_anxiety' },
        { label: '高血压', value: 'hypertension' },
        { label: '高血脂', value: 'hyperlipidemia' },
        { label: '肾病', value: 'kidney_disease' },
        { label: '乳糜泻/麸质不耐受', value: 'celiac' },
        { label: '以上均无', value: 'none' },
      ]},
      { id: 'medications', type: 'multiselect', label: '长期服用药物（可多选）', required: false, options: [
        { label: '优甲乐（左甲状腺素）', value: 'levothyroxine' },
        { label: '二甲双胍', value: 'metformin' },
        { label: '他汀类降脂药', value: 'statins' },
        { label: '口服避孕药', value: 'ocp' },
        { label: '抗抑郁/抗焦虑药', value: 'antidepressant' },
        { label: '利尿剂', value: 'diuretics' },
        { label: '阿司匹林', value: 'aspirin' },
        { label: '以上均无', value: 'none' },
      ]},
    ]
  },
  {
    id: 'lifestyle',
    title: '生活方式评估',
    description: '了解您的日常饮食、运动和睡眠习惯',
    stepNumber: 2,
    fields: [
      { id: 'diet_pattern', type: 'select', label: '饮食模式', required: true, options: [
        { label: '杂食（什么都吃）', value: 'omnivore' },
        { label: '蛋奶素（吃蛋和奶）', value: 'lacto_ovo' },
        { label: '纯素食（严格素食）', value: 'strict_vegan' },
        { label: '鱼素（吃鱼不吃其他肉）', value: 'pescatarian' },
        { label: '弹性素食（偶尔吃肉）', value: 'flexitarian' },
      ]},
      { id: 'exercise_frequency', type: 'select', label: '每周中等强度运动时长', required: true, options: [
        { label: '<30分钟', value: 'sedentary' },
        { label: '30-150分钟', value: 'moderate' },
        { label: '>150分钟', value: 'active' },
        { label: '>300分钟（高强度训练）', value: 'athlete' },
      ]},
      { id: 'sleep_hours', type: 'select', label: '平均每晚睡眠时长', required: true, options: [
        { label: '<6小时', value: 'insufficient' },
        { label: '6-8小时', value: 'normal' },
        { label: '>8小时', value: 'excessive' },
      ]},
      { id: 'stress_level', type: 'radio', label: '近一个月精神压力水平', required: true, options: [
        { label: '几乎无压力', value: 'none' },
        { label: '轻度压力', value: 'mild' },
        { label: '中度压力', value: 'moderate' },
        { label: '重度压力', value: 'severe' },
      ]},
      { id: 'smoking', type: 'select', label: '吸烟情况', required: true, options: [
        { label: '从不吸烟', value: 'never' },
        { label: '偶尔吸烟', value: 'occasional' },
        { label: '每天吸烟', value: 'daily' },
      ]},
      { id: 'alcohol', type: 'select', label: '饮酒情况', required: true, options: [
        { label: '从不饮酒', value: 'never' },
        { label: '偶尔饮酒（每周≤3次）', value: 'occasional' },
        { label: '经常饮酒', value: 'frequent' },
      ]},
    ]
  },
  {
    id: 'symptoms',
    title: '症状自评',
    description: '请对过去1个月出现过的症状进行评分（0=从未, 1=偶尔, 2=经常, 3=几乎每天）',
    stepNumber: 3,
    fields: symptomList.map(s => ({
      id: s.id,
      type: 'slider' as const,
      label: s.label,
      description: s.description,
      min: 0,
      max: 3,
    }))
  },
  {
    id: 'special_screening',
    title: '专项筛查',
    description: '根据您的症状，需要进一步了解以下情况',
    stepNumber: 4,
    fields: [
      { id: 'ibs_rome_iv', type: 'conditional', label: '腹痛是否在排便后缓解？', triggers: 'ibs', options: [
        { label: '是，明显缓解', value: 'yes_relief' },
        { label: '部分缓解', value: 'partial' },
        { label: '无明显变化', value: 'no_change' },
      ]},
      { id: 'stool_type', type: 'conditional', label: '过去3个月，粪便性状多数时间接近？', triggers: 'ibs', options: [
        { label: '偏稀/水样（布里斯托5-7型）', value: 'loose' },
        { label: '偏干/硬球（布里斯托1-2型）', value: 'hard' },
        { label: '正常（布里斯托3-4型）', value: 'normal' },
        { label: '干稀交替', value: 'alternating' },
      ]},
      { id: 'phq2_mood', type: 'conditional', label: '过去2周，做事时提不起劲或没有兴趣的频率？', triggers: 'mental_health', options: [
        { label: '完全没有', value: '0' },
        { label: '有几天', value: '1' },
        { label: '一半以上天数', value: '2' },
        { label: '几乎每天', value: '3' },
      ]},
      { id: 'phq2_pleasure', type: 'conditional', label: '过去2周，感到心情低落、沮丧或绝望的频率？', triggers: 'mental_health', options: [
        { label: '完全没有', value: '0' },
        { label: '有几天', value: '1' },
        { label: '一半以上天数', value: '2' },
        { label: '几乎每天', value: '3' },
      ]},
      { id: 'gad2_nervous', type: 'conditional', label: '过去2周，感到紧张、焦虑或急切不安的频率？', triggers: 'mental_health', options: [
        { label: '完全没有', value: '0' },
        { label: '有几天', value: '1' },
        { label: '一半以上天数', value: '2' },
        { label: '几乎每天', value: '3' },
      ]},
      { id: 'gad2_worry', type: 'conditional', label: '过去2周，无法停止或控制担忧的频率？', triggers: 'mental_health', options: [
        { label: '完全没有', value: '0' },
        { label: '有几天', value: '1' },
        { label: '一半以上天数', value: '2' },
        { label: '几乎每天', value: '3' },
      ]},
      { id: 'diabetes_family', type: 'conditional', label: '直系亲属（父母/兄弟姐妹）是否有糖尿病？', triggers: 'diabetes', options: [
        { label: '是', value: 'yes' },
        { label: '否', value: 'no' },
        { label: '不确定', value: 'unknown' },
      ]},
      { id: 'hashimoto_family', type: 'conditional', label: '直系亲属是否有自身免疫性甲状腺疾病？', triggers: 'hashimoto', options: [
        { label: '是', value: 'yes' },
        { label: '否', value: 'no' },
        { label: '不确定', value: 'unknown' },
      ]},
      { id: 'menstrual_cycle_length', type: 'conditional', label: '您的月经周期一般为多少天？', triggers: 'pcos,menstrual', options: [
        { label: '<21天', value: 'short' },
        { label: '21-35天（正常）', value: 'normal' },
        { label: '>35天', value: 'long' },
        { label: '不规则，难以判断', value: 'irregular' },
        { label: '已停经', value: 'menopause' },
      ]},
      { id: 'menopause_age', type: 'conditional', label: '您处于哪个阶段？', triggers: 'menopause', options: [
        { label: '围绝经期（月经开始不规律）', value: 'perimenopause' },
        { label: '绝经后期（停经12个月以上）', value: 'postmenopause' },
        { label: '<40岁已停经（早发更年期）', value: 'early_menopause' },
        { label: '暂无相关症状', value: 'not_applicable' },
      ]},
    ]
  },
  {
    id: 'lab_data',
    title: '体检数据',
    description: '如有近期体检报告，请输入以下关键指标（可跳过）',
    stepNumber: 5,
    fields: [
      { id: 'lab_vitamin_d', type: 'lab_value', label: '25-羟基维生素D', unit: 'nmol/L' },
      { id: 'lab_ferritin', type: 'lab_value', label: '铁蛋白', unit: 'μg/L' },
      { id: 'lab_tsh', type: 'lab_value', label: 'TSH（促甲状腺激素）', unit: 'mIU/L' },
      { id: 'lab_tpoab', type: 'lab_value', label: 'TPOAb（甲状腺过氧化物酶抗体）', unit: 'IU/mL' },
      { id: 'lab_fasting_glucose', type: 'lab_value', label: '空腹血糖', unit: 'mmol/L' },
      { id: 'lab_hba1c', type: 'lab_value', label: '糖化血红蛋白（HbA1c）', unit: '%' },
      { id: 'lab_vitamin_b12', type: 'lab_value', label: '维生素B12', unit: 'pmol/L' },
      { id: 'lab_hemoglobin', type: 'lab_value', label: '血红蛋白', unit: 'g/L' },
    ]
  },
  {
    id: 'diet_diary',
    title: '饮食回顾',
    description: '请勾选过去一周各类食物的平均摄入频率（可跳过）',
    stepNumber: 6,
    fields: [
      { id: 'food_greens', type: 'radio', label: '深绿色叶菜（菠菜、西兰花、羽衣甘蓝等）', options: [
        { label: '几乎不吃', value: 'rarely' },
        { label: '每周1-3次', value: 'sometimes' },
        { label: '几乎每天', value: 'daily' },
      ]},
      { id: 'food_dairy', type: 'radio', label: '奶制品（牛奶、酸奶、奶酪）', options: [
        { label: '几乎不吃', value: 'rarely' },
        { label: '每周1-3次', value: 'sometimes' },
        { label: '几乎每天', value: 'daily' },
      ]},
      { id: 'food_soy', type: 'radio', label: '豆制品（豆腐、豆浆、豆干）', options: [
        { label: '几乎不吃', value: 'rarely' },
        { label: '每周1-3次', value: 'sometimes' },
        { label: '几乎每天', value: 'daily' },
      ]},
      { id: 'food_red_meat', type: 'radio', label: '红肉（猪牛羊肉）', options: [
        { label: '几乎不吃', value: 'rarely' },
        { label: '每周1-3次', value: 'sometimes' },
        { label: '每周>3次', value: 'frequent' },
      ]},
      { id: 'food_fish', type: 'radio', label: '鱼类/海鲜', options: [
        { label: '几乎不吃', value: 'rarely' },
        { label: '每周1-2次', value: 'sometimes' },
        { label: '每周>3次', value: 'frequent' },
      ]},
      { id: 'food_wholegrain', type: 'radio', label: '全谷物（燕麦、糙米、藜麦、全麦面包）', options: [
        { label: '几乎不吃', value: 'rarely' },
        { label: '每周几次', value: 'sometimes' },
        { label: '几乎每天', value: 'daily' },
      ]},
      { id: 'food_nuts', type: 'radio', label: '坚果/种子', options: [
        { label: '几乎不吃', value: 'rarely' },
        { label: '每周几次', value: 'sometimes' },
        { label: '几乎每天', value: 'daily' },
      ]},
      { id: 'food_sweets', type: 'radio', label: '甜饮料/甜点/奶茶', options: [
        { label: '几乎不吃', value: 'rarely' },
        { label: '每周1-3次', value: 'sometimes' },
        { label: '每周>3次', value: 'frequent' },
      ]},
    ]
  },
]
