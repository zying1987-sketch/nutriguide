/**
 * 评估问卷数据 - v3.0（2026-06-06 优化版）
 *
 * 新流程（8步 + 分支）：
 * Step 0: 欢迎页
 * Step 1: 基础信息（性别/年龄/身高/体重）
 * Step 2: 健康状态分流（日常调理 / 已被诊断 / 特殊时期）
 * Step 3: 分支模块（模块A 亚健康 / 模块B 健康问题 / 模块C 特殊时期）
 * Step 4: 饮食快速评估（5问）
 * Step 5: 生活方式（5问）
 * Step 6: 补充剂与药物
 * Step 7: 体检数据（上传或跳过）
 * Step 8: 确认信息 → 提交
 */

// ========= 类型定义 =========

export interface AssessmentStep {
  id: string
  title: string
  description: string
  stepNumber: number
  fields: AssessmentField[]
  /** 是否跳过此步骤（分支用） */
  skipCondition?: (formData: Record<string, any>) => boolean
}

export interface AssessmentField {
  id: string
  type:
    | 'text'
    | 'number'
    | 'select'
    | 'multiselect'
    | 'radio'
    | 'upload'
    | 'summary'
  label: string
  description?: string
  placeholder?: string
  required?: boolean
  options?: { label: string; value: string }[]
  min?: number
  max?: number
  unit?: string
  showCondition?: { field: string; value: string | string[] }
}

// ========= 静态选项 =========

const genderOptions = [
  { label: '女', value: 'female' },
  { label: '男', value: 'male' },
]

export const pregnancyOptions = [
  { label: '无 / 未处于特殊时期', value: 'none' },
  { label: '备孕中', value: 'preconception' },
  { label: '已怀孕（孕早期 0-12 周）', value: 'pregnant_t1' },
  { label: '已怀孕（孕中期 13-27 周）', value: 'pregnant_t2' },
  { label: '已怀孕（孕晚期 28 周+）', value: 'pregnant_t3' },
  { label: '哺乳期', value: 'lactation' },
  { label: '围绝经期/更年期', value: 'perimenopause' },
]

export const diagnosisOptions = [
  { label: '甲状腺问题（甲减/桥本/甲亢）', value: 'thyroid' },
  { label: '糖尿病（1型或2型）', value: 'diabetes' },
  { label: '多囊卵巢（PCOS）', value: 'pcos' },
  { label: '肠易激（IBS）', value: 'ibs' },
  { label: '高血压', value: 'hypertension' },
  { label: '高血脂', value: 'hyperlipidemia' },
  { label: '心血管疾病', value: 'cardiovascular' },
  { label: '痛风', value: 'gout' },
  { label: '乳糜泻/麸质不耐受', value: 'celiac' },
  { label: '抑郁或焦虑倾向', value: 'depression_anxiety' },
  { label: '以上均无', value: 'none' },
]

export const medicationOptions = [
  { label: '优甲乐（左甲状腺素）', value: 'levothyroxine' },
  { label: '二甲双胍', value: 'metformin' },
  { label: '降糖药/胰岛素', value: 'antidiabetic' },
  { label: '他汀类降脂药', value: 'statins' },
  { label: '降压药', value: 'antihypertensive' },
  { label: '口服避孕药', value: 'ocp' },
  { label: '抗抑郁/抗焦虑药', value: 'antidepressant' },
  { label: '其他（请填写）', value: 'other' },
  { label: '没有服用处方药', value: 'none' },
]

export const supplementOptions = [
  { label: '复合维生素', value: 'multivitamin' },
  { label: '维生素 D', value: 'vitamin_d' },
  { label: '维生素 C', value: 'vitamin_c' },
  { label: 'B 族维生素', value: 'vitamin_b_complex' },
  { label: '钙片', value: 'calcium' },
  { label: '镁', value: 'magnesium' },
  { label: '锌', value: 'zinc' },
  { label: '铁剂', value: 'iron' },
  { label: 'Omega-3（鱼油/藻油）', value: 'omega3' },
  { label: '益生菌', value: 'probiotics' },
  { label: '辅酶 Q10', value: 'coq10' },
  { label: '肌醇', value: 'inositol' },
  { label: '蛋白粉', value: 'protein_powder' },
  { label: '褪黑素', value: 'melatonin' },
  { label: '其他（请填写）', value: 'other' },
  { label: '没有服用任何补充剂', value: 'none' },
]

// ========= 步骤定义 =========

export const assessmentSteps: AssessmentStep[] = [
  // ═══ Step 0：欢迎页 ═══
  {
    id: 'welcome',
    title: '欢迎',
    description: '回答几个简单问题（约3-4分钟），我们将为您生成专属的营养、饮食和生活方式方案。',
    stepNumber: 0,
    fields: [],
  },

  // ═══ Step 1：基础信息 ═══
  {
    id: 'basic_info',
    title: '基础信息',
    description: '首先，让我们了解一下您的基本情况',
    stepNumber: 1,
    fields: [
      {
        id: 'gender',
        type: 'select',
        label: '您的性别？',
        required: true,
        options: genderOptions,
      },
      {
        id: 'age',
        type: 'number',
        label: '您的年龄？',
        required: true,
        min: 10,
        max: 120,
        unit: '岁',
        placeholder: '请输入年龄',
      },
      {
        id: 'height',
        type: 'number',
        label: '您的身高？',
        required: true,
        min: 100,
        max: 250,
        unit: 'cm',
        placeholder: '请输入身高',
      },
      {
        id: 'weight',
        type: 'number',
        label: '您的体重？',
        required: true,
        min: 20,
        max: 300,
        unit: 'kg',
        placeholder: '请输入体重',
      },
    ],
  },

  // ═══ Step 2：健康状态分流 ═══
  {
    id: 'health_branch',
    title: '您的健康状态',
    description: '请选择最符合您目前情况的描述',
    stepNumber: 2,
    fields: [
      {
        id: 'health_status',
        type: 'radio',
        label: '请问您目前最符合哪种情况？',
        required: true,
        options: [
          {
            label: '日常想调理身体，改善精力、睡眠、体型等',
            value: 'daily_wellness',
          },
          {
            label: '已被医生诊断过某些健康问题（如甲状腺、糖尿病、多囊卵巢等）',
            value: 'diagnosed',
          },
          {
            label: '处于特殊时期：备孕、怀孕、哺乳或更年期',
            value: 'special_period',
          },
        ],
      },
    ],
  },

  // ═══ Step 3A：亚健康症状（日常调理）═══
  {
    id: 'sub_health',
    title: '身体感受',
    description: '请告诉我们您最近的身体感受，越详细我们越能精准帮助您。',
    stepNumber: 3,
    skipCondition: (fd) => fd['health_status'] !== 'daily_wellness',
    fields: [
      {
        id: 'a1_fatigue',
        type: 'radio',
        label: '您是否经常感到疲劳、精力不足？',
        required: false,
        options: [
          { label: '几乎没有', value: 'none' },
          { label: '偶尔', value: 'occasional' },
          { label: '经常', value: 'frequent' },
        ],
      },
      {
        id: 'a2_sleep',
        type: 'radio',
        label: '您有睡眠困扰吗？',
        required: false,
        options: [
          { label: '无', value: 'none' },
          { label: '入睡困难（躺下超30分钟睡不着）', value: 'hard_to_fall' },
          { label: '夜间易醒或早醒', value: 'wake_up' },
          { label: '两者都有', value: 'both' },
        ],
      },
      {
        id: 'a3_mood',
        type: 'radio',
        label: '最近1个月，您感觉情绪状态如何？',
        required: false,
        options: [
          { label: '平稳', value: 'stable' },
          { label: '偶尔低落或紧张', value: 'occasional' },
          { label: '持续低落或焦虑', value: 'persistent' },
        ],
      },
      {
        id: 'a4_weight_goal',
        type: 'radio',
        label: '您对目前的体重或体型？',
        required: false,
        options: [
          { label: '满意', value: 'satisfied' },
          { label: '希望减重', value: 'lose' },
          { label: '希望增肌/塑形', value: 'gain_muscle' },
          { label: '体重不明原因下降/上升', value: 'unexplained' },
        ],
      },
      {
        id: 'a5_gi',
        type: 'radio',
        label: '您是否有肠胃不适？（腹胀、腹痛、腹泻、便秘）',
        required: false,
        options: [
          { label: '无', value: 'none' },
          { label: '偶尔', value: 'occasional' },
          { label: '经常', value: 'frequent' },
        ],
      },
      {
        id: 'a6_skin_hair',
        type: 'radio',
        label: '您是否有脱发、痤疮或皮肤干燥？',
        required: false,
        options: [
          { label: '无', value: 'none' },
          { label: '轻度', value: 'mild' },
          { label: '中度以上', value: 'moderate' },
        ],
      },
      {
        id: 'a7_temp',
        type: 'radio',
        label: '您是否比周围人更怕冷或怕热？',
        required: false,
        options: [
          { label: '正常', value: 'normal' },
          { label: '怕冷', value: 'cold' },
          { label: '怕热', value: 'hot' },
          { label: '两者都有', value: 'both' },
        ],
      },
      {
        id: 'a8_pain',
        type: 'radio',
        label: '您是否有肌肉酸痛或关节不适？',
        required: false,
        options: [
          { label: '无', value: 'none' },
          { label: '偶尔', value: 'occasional' },
          { label: '经常', value: 'frequent' },
        ],
      },
      {
        id: 'a9_headache',
        type: 'radio',
        label: '您是否有头痛（非感冒引起）？',
        required: false,
        options: [
          { label: '无', value: 'none' },
          { label: '偶尔', value: 'occasional' },
          { label: '经常', value: 'frequent' },
        ],
      },
      {
        id: 'a10_exercise',
        type: 'radio',
        label: '您每周中等强度运动（如快走、慢跑、骑车）的总时长大约是？',
        required: false,
        options: [
          { label: '基本不运动', value: 'none' },
          { label: '少于30分钟', value: '<30' },
          { label: '30-150分钟', value: '30-150' },
          { label: '超过150分钟', value: '>150' },
        ],
      },
    ],
  },

  // ═══ Step 3B：已有健康问题（已被诊断）═══
  {
    id: 'health_problems',
    title: '已有健康问题',
    description: '请告诉我们您的健康问题及控制情况',
    stepNumber: 3,
    skipCondition: (fd) => fd['health_status'] !== 'diagnosed',
    fields: [
      {
        id: 'b1_problems',
        type: 'multiselect',
        label: '请选择您已有的健康问题（可多选）',
        required: true,
        options: diagnosisOptions,
      },
      {
        id: 'b2_control',
        type: 'radio',
        label: '对于您选择的这些问题，目前控制情况如何？',
        required: true,
        options: [
          { label: '良好（无症状或指标正常）', value: 'good' },
          { label: '一般（有症状但未规律管理）', value: 'fair' },
          { label: '需改善（症状明显或指标异常）', value: 'poor' },
        ],
      },
    ],
  },

  // ═══ Step 3C：特殊时期 ═══
  {
    id: 'special_period',
    title: '特殊时期',
    description: '请告诉我们您当前的生理阶段',
    stepNumber: 3,
    skipCondition: (fd) => fd['health_status'] !== 'special_period',
    fields: [
      {
        id: 'c1_stage',
        type: 'radio',
        label: '您目前处于？',
        required: true,
        options: [
          { label: '备孕（计划怀孕）', value: 'preconception' },
          { label: '怀孕中', value: 'pregnant' },
          { label: '哺乳期', value: 'lactation' },
          { label: '围绝经期/更年期', value: 'perimenopause' },
        ],
      },
      {
        id: 'c2_pregnant_week',
        type: 'number',
        label: '孕周',
        description: '如不确定可填大致周数',
        required: false,
        min: 1,
        max: 42,
        unit: '周',
        placeholder: '请输入孕周',
        showCondition: { field: 'c1_stage', value: 'pregnant' },
      },
      {
        id: 'c2_lactation_month',
        type: 'number',
        label: '产后几个月？',
        required: false,
        min: 0,
        max: 24,
        unit: '个月',
        placeholder: '请输入月数',
        showCondition: { field: 'c1_stage', value: 'lactation' },
      },
      {
        id: 'c2_morning_sickness',
        type: 'radio',
        label: '是否有严重孕吐？',
        required: false,
        options: [
          { label: '无', value: 'none' },
          { label: '偶尔', value: 'occasional' },
          { label: '每天', value: 'daily' },
        ],
        showCondition: { field: 'c1_stage', value: 'pregnant' },
      },
      {
        id: 'c3_menopause_symptoms',
        type: 'multiselect',
        label: '您最困扰的症状是？（多选）',
        required: false,
        options: [
          { label: '潮热、盗汗', value: 'hot_flashes' },
          { label: '情绪波动', value: 'mood_swings' },
          { label: '失眠', value: 'insomnia' },
          { label: '关节疼痛', value: 'joint_pain' },
          { label: '阴道干涩', value: 'dryness' },
        ],
        showCondition: { field: 'c1_stage', value: 'perimenopause' },
      },
    ],
  },

  // ═══ Step 4：饮食快速评估（5问）═══
  {
    id: 'diet_quick',
    title: '饮食快速评估',
    description: '饮食是基础。简单5个问题，帮我们了解您的饮食模式。',
    stepNumber: 4,
    fields: [
      {
        id: 'd1_diet_mode',
        type: 'radio',
        label: '您的日常饮食模式是？',
        required: false,
        options: [
          { label: '杂食（什么都吃）', value: 'omnivore' },
          { label: '蛋奶素（吃蛋和奶制品）', value: 'lacto_ovo' },
          { label: '纯素（不吃任何动物性食物）', value: 'vegan' },
          { label: '鱼素（吃鱼虾，不吃其他肉）', value: 'pescatarian' },
        ],
      },
      {
        id: 'd2_vegetables',
        type: 'radio',
        label: '您每天吃蔬菜的量大约是？',
        required: false,
        options: [
          { label: '很少吃（<150g，约一小碗）', value: '<150' },
          { label: '适中（150-300g）', value: '150-300' },
          { label: '较多（>300g）', value: '>300' },
        ],
      },
      {
        id: 'd3_fruits',
        type: 'radio',
        label: '您每天吃水果的量大约是？',
        required: false,
        options: [
          { label: '几乎不吃', value: 'none' },
          { label: '半个到1个（约100-200g）', value: '100-200' },
          { label: '2个以上（>250g）', value: '>250' },
        ],
      },
      {
        id: 'd4_staples',
        type: 'radio',
        label: '您的主食主要是什么？',
        required: false,
        options: [
          { label: '精白米面（白米饭、白面包等）', value: 'refined' },
          { label: '粗粮和精粮各半', value: 'half_half' },
          { label: '全谷物/粗粮为主（糙米、燕麦、藜麦等）', value: 'whole_grain' },
        ],
      },
      {
        id: 'd5_sugar_drinks',
        type: 'radio',
        label: '您喝含糖饮料（奶茶、汽水、果汁饮料）的频率？',
        required: false,
        options: [
          { label: '几乎不喝', value: 'none' },
          { label: '每周1-2次', value: '1-2/week' },
          { label: '每周3次以上', value: '>3/week' },
        ],
      },
    ],
  },

  // ═══ Step 5：生活方式 ═══
  {
    id: 'lifestyle',
    title: '生活方式',
    description: '运动、睡眠、生活习惯对营养状况影响很大',
    stepNumber: 5,
    fields: [
      {
        id: 'e1_exercise',
        type: 'radio',
        label: '您每周中等强度运动（快走、慢跑、骑车、游泳等）的总时长大约是？',
        required: false,
        options: [
          { label: '基本不运动', value: 'none' },
          { label: '少于30分钟', value: '<30' },
          { label: '30-150分钟', value: '30-150' },
          { label: '超过150分钟', value: '>150' },
        ],
      },
      {
        id: 'e2_sleep_hours',
        type: 'radio',
        label: '您平均每晚睡眠时长？',
        required: false,
        options: [
          { label: '少于6小时', value: '<6' },
          { label: '6-8小时', value: '6-8' },
          { label: '超过8小时', value: '>8' },
        ],
      },
      {
        id: 'e3_stress',
        type: 'radio',
        label: '您感觉最近一个月的压力程度？',
        required: false,
        options: [
          { label: '无/轻度', value: 'none_mild' },
          { label: '中度', value: 'moderate' },
          { label: '重度', value: 'severe' },
        ],
      },
      {
        id: 'e4_smoking',
        type: 'radio',
        label: '您吸烟吗？',
        required: false,
        options: [
          { label: '从不', value: 'none' },
          { label: '偶尔', value: 'occasional' },
          { label: '每天', value: 'daily' },
        ],
      },
      {
        id: 'e5_alcohol',
        type: 'radio',
        label: '您饮酒吗？',
        required: false,
        options: [
          { label: '不喝', value: 'none' },
          { label: '偶尔（每周<3次）', value: 'occasional' },
          { label: '经常（每周≥3次）', value: 'frequent' },
        ],
      },
    ],
  },

  // ═══ Step 6：补充剂与药物 ═══
  {
    id: 'supplements_meds',
    title: '补充剂与药物',
    description: '了解您目前正在使用的产品，避免重复推荐和相互作用',
    stepNumber: 6,
    fields: [
      {
        id: 'f1_supplements',
        type: 'multiselect',
        label: '您目前正在服用哪些营养补充剂？（可多选）',
        required: false,
        options: supplementOptions,
      },
      {
        id: 'f2_medications',
        type: 'multiselect',
        label: '您是否在服用以下处方药？（可多选）',
        description: '仅在您选择"已被诊断"或"特殊时期"时显示',
        required: false,
        options: medicationOptions,
        showCondition: { field: 'health_status', value: ['diagnosed', 'special_period'] },
      },
    ],
  },

  // ═══ Step 7：体检数据 ═══
  {
    id: 'exam_upload',
    title: '体检数据（可选）',
    description: '上传最近3个月内的体检报告（拍照或PDF），我们会提取关键指标，为您生成更精准的方案。没有报告请点击"跳过"。',
    stepNumber: 7,
    fields: [
      {
        id: 'exam_report',
        type: 'upload',
        label: '上传体检报告',
        description: '支持图片或PDF格式',
        required: false,
      },
    ],
  },

  // ═══ Step 8：确认信息 ═══
  {
    id: 'summary',
    title: '确认信息',
    description: '请确认您的回答，如需修改可返回上一步。确认无误后点击"查看结果"。',
    stepNumber: 8,
    fields: [
      {
        id: '_summary',
        type: 'summary',
        label: '回答预览',
        required: false,
      },
    ],
  },
]

// ========= 辅助工具函数 =========

/** 获取当前有效的步骤（排除 skipCondition 命中的步骤） */
export function getEffectiveSteps(formData: Record<string, any>): AssessmentStep[] {
  return assessmentSteps.filter(step => {
    if (step.skipCondition) {
      return !step.skipCondition(formData)
    }
    return true
  })
}

/** 标签映射工具 */
export const healthStatusLabel = (v: string): string => {
  const map: Record<string, string> = {
    daily_wellness: '日常调理',
    diagnosed: '已有健康问题',
    special_period: '特殊时期',
  }
  return map[v] || v
}

export const diagnosisLabel = (v: string): string => {
  const map: Record<string, string> = {
    thyroid: '甲状腺问题', diabetes: '糖尿病', pcos: 'PCOS', ibs: 'IBS',
    hypertension: '高血压', hyperlipidemia: '高血脂', cardiovascular: '心血管疾病',
    gout: '痛风', celiac: '乳糜泻', depression_anxiety: '抑郁/焦虑', none: '无',
  }
  return map[v] || v
}

export const medicationLabel = (v: string): string => {
  const map: Record<string, string> = {
    levothyroxine: '优甲乐', metformin: '二甲双胍', antidiabetic: '降糖药/胰岛素',
    statins: '他汀类', antihypertensive: '降压药', ocp: '口服避孕药',
    antidepressant: '抗抑郁/焦虑药', diuretics: '利尿剂', aspirin: '阿司匹林',
    other: '其他', none: '无',
  }
  return map[v] || v
}

export const supplementLabel = (v: string): string => {
  const map: Record<string, string> = {
    multivitamin: '复合维生素', vitamin_d: '维生素D', vitamin_c: '维生素C',
    vitamin_b_complex: 'B族维生素', calcium: '钙片', magnesium: '镁', zinc: '锌',
    iron: '铁剂', omega3: 'Omega-3', probiotics: '益生菌', coq10: '辅酶Q10',
    inositol: '肌醇', protein_powder: '蛋白粉', melatonin: '褪黑素',
    herbal: '中草药', other: '其他', none: '无',
  }
  return map[v] || v
}

export const c1StageLabel = (v: string): string => {
  const map: Record<string, string> = {
    preconception: '备孕（计划怀孕）', pregnant: '怀孕中',
    lactation: '哺乳期', perimenopause: '围绝经期/更年期',
  }
  return map[v] || v
}
