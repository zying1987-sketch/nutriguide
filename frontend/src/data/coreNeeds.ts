/**
 * 核心诉求数据 - 按性别+年龄分层
 * 基于 PRD 2026-06-02 重新设计
 *
 * 设计原则：
 * 1. 先画像，后诉求：必须收集性别、年龄、身高体重等基础信息
 * 2. 性别完全分离：男性与女性看到的核心诉求选项完全不同
 * 3. 年龄分层：同一性别内，青少年、中青年、更年期/老年群体的关注点不同
 * 4. 痛点+目标并重：不仅关注症状，也关注主动目标
 * 5. 动态简洁：根据用户选择的诉求，只追问必要的细节
 */

// ========== 类型定义 ==========

/** 追问问题选项 */
export interface FollowUpOption {
  label: string
  value: string
}

/** 追问问题 */
export interface FollowUpQuestion {
  /** 问题唯一标识 */
  id: string
  /** 问题文本 */
  question: string
  /** 是否必答 */
  required?: boolean
  /** 选项列表（单选/多选） */
  options?: FollowUpOption[]
  /** 问题类型 */
  inputType: 'radio' | 'multiselect' | 'number' | 'text' | 'select'
  /** placeholder（inputType=text/number 时用） */
  placeholder?: string
  /** 单位（inputType=number 时用） */
  unit?: string
  /** 最小值（inputType=number 时用） */
  min?: number
  /** 最大值（inputType=number 时用） */
  max?: number
}

/** 单个核心诉求 */
export interface CoreNeed {
  /** 唯一标识 */
  id: string
  /** 显示标签 */
  label: string
  /** 通俗描述（可选） */
  description?: string
  /** 追问问题列表（1-3个问题） */
  followUp?: FollowUpQuestion[]
}

/** 年龄组定义 */
export interface AgeGroupConfig {
  /** 年龄组 ID */
  id: string
  /** 显示名称 */
  label: string
  /** 年龄下限（含） */
  ageMin: number
  /** 年龄上限（含） */
  ageMax: number
  /** 该年龄组的核心诉求列表 */
  needs: CoreNeed[]
}

/** 性别配置 */
export interface GenderConfig {
  gender: 'female' | 'male'
  ageGroups: AgeGroupConfig[]
}

// ========== 追问问题模板 ==========

// —— 女性追问模板 ——

const followUpPregnancy: FollowUpQuestion[] = [
  {
    id: 'pregnancy_duration',
    question: '备孕多久了？',
    inputType: 'radio',
    required: true,
    options: [
      { label: '<6个月', value: '<6m' },
      { label: '6-12个月', value: '6-12m' },
      { label: '>1年', value: '>1y' },
    ],
  },
  {
    id: 'pregnancy_folate',
    question: '是否已在服用叶酸？',
    inputType: 'radio',
    required: true,
    options: [
      { label: '是', value: 'yes' },
      { label: '否', value: 'no' },
    ],
  },
]

const followUpPregnant: FollowUpQuestion[] = [
  {
    id: 'pregnant_weeks',
    question: '目前孕周？',
    inputType: 'number',
    required: true,
    placeholder: '请输入孕周',
    unit: '周',
    min: 1,
    max: 42,
  },
  {
    id: 'pregnant_nausea',
    question: '是否有严重孕吐？',
    inputType: 'radio',
    required: true,
    options: [
      { label: '几乎不', value: 'none' },
      { label: '偶尔', value: 'mild' },
      { label: '每天', value: 'severe' },
    ],
  },
  {
    id: 'pregnant_prenatal',
    question: '是否已服用孕期复合维生素？',
    inputType: 'radio',
    required: true,
    options: [
      { label: '是', value: 'yes' },
      { label: '否', value: 'no' },
    ],
  },
]

const followUpPeriod: FollowUpQuestion[] = [
  {
    id: 'period_cycle',
    question: '月经周期大约多少天？',
    inputType: 'radio',
    required: true,
    options: [
      { label: '<21天', value: '<21' },
      { label: '21-35天', value: '21-35' },
      { label: '>35天', value: '>35' },
      { label: '完全不规律', value: 'irregular' },
    ],
  },
  {
    id: 'period_pain',
    question: '痛经程度？',
    inputType: 'radio',
    required: true,
    options: [
      { label: '无', value: 'none' },
      { label: '轻度（不需吃药）', value: 'mild' },
      { label: '中度（需止痛药）', value: 'moderate' },
      { label: '重度（影响生活）', value: 'severe' },
    ],
  },
  {
    id: 'period_pcos',
    question: '是否曾被诊断为多囊卵巢综合征（PCOS）或子宫内膜异位症？',
    inputType: 'radio',
    required: false,
    options: [
      { label: '是', value: 'yes' },
      { label: '否', value: 'no' },
    ],
  },
]

const followUpPMS: FollowUpQuestion[] = [
  {
    id: 'pms_symptoms',
    question: '主要有哪些症状？（可多选）',
    inputType: 'multiselect',
    required: true,
    options: [
      { label: '情绪波动/易怒', value: 'mood' },
      { label: '乳房胀痛', value: 'breast' },
      { label: '水肿（体重增加1-2kg）', value: 'edema' },
      { label: '头痛', value: 'headache' },
      { label: '疲劳', value: 'fatigue' },
    ],
  },
  {
    id: 'pms_relief',
    question: '这些症状在月经开始后是否缓解？',
    inputType: 'radio',
    required: true,
    options: [
      { label: '完全缓解', value: 'full' },
      { label: '部分缓解', value: 'partial' },
      { label: '不缓解', value: 'none' },
    ],
  },
]

const followUpHotFlash: FollowUpQuestion[] = [
  {
    id: 'hotflash_frequency',
    question: '每天发作几次？',
    inputType: 'radio',
    required: true,
    options: [
      { label: '很少', value: 'rare' },
      { label: '3-10次', value: '3-10' },
      { label: '>10次', value: '>10' },
    ],
  },
  {
    id: 'hotflash_sleep',
    question: '是否影响睡眠？',
    inputType: 'radio',
    required: true,
    options: [
      { label: '是', value: 'yes' },
      { label: '否', value: 'no' },
    ],
  },
]

const followUpJointPain: FollowUpQuestion[] = [
  {
    id: 'joint_which',
    question: '哪些关节？',
    inputType: 'multiselect',
    required: true,
    options: [
      { label: '膝盖', value: 'knee' },
      { label: '手指', value: 'finger' },
      { label: '腰', value: 'waist' },
      { label: '肩', value: 'shoulder' },
    ],
  },
  {
    id: 'joint_dexa',
    question: '是否做过骨密度检查？',
    inputType: 'radio',
    required: false,
    options: [
      { label: '是', value: 'yes' },
      { label: '否', value: 'no' },
    ],
  },
]

const followUpWeightLoss: FollowUpQuestion[] = [
  {
    id: 'weight_target',
    question: '希望减多少公斤？',
    inputType: 'radio',
    required: true,
    options: [
      { label: '<5kg', value: '<5' },
      { label: '5-10kg', value: '5-10' },
      { label: '>10kg', value: '>10' },
    ],
  },
  {
    id: 'weight_tried',
    question: '是否尝试过节食或运动？',
    inputType: 'radio',
    required: false,
    options: [
      { label: '是', value: 'yes' },
      { label: '否', value: 'no' },
    ],
  },
]

const followUpMuscleGain: FollowUpQuestion[] = [
  {
    id: 'exercise_frequency',
    question: '目前每周运动几次？',
    inputType: 'radio',
    required: true,
    options: [
      { label: '0-1次', value: '0-1' },
      { label: '2-3次', value: '2-3' },
      { label: '≥4次', value: '>=4' },
    ],
  },
]

const followUpLowMood: FollowUpQuestion[] = [
  {
    id: 'mood_duration',
    question: '这种情况持续多久？',
    inputType: 'radio',
    required: true,
    options: [
      { label: '<2周', value: '<2w' },
      { label: '2周-1个月', value: '2w-1m' },
      { label: '>1个月', value: '>1m' },
    ],
  },
  {
    id: 'mood_anhedonia',
    question: '是否对以前喜欢的事情失去兴趣？',
    inputType: 'radio',
    required: true,
    options: [
      { label: '是', value: 'yes' },
      { label: '否', value: 'no' },
    ],
  },
]

const followUpInsomnia: FollowUpQuestion[] = [
  {
    id: 'insomnia_type',
    question: '主要是哪种睡眠问题？',
    inputType: 'multiselect',
    required: true,
    options: [
      { label: '入睡困难（>30分钟）', value: 'onset' },
      { label: '早醒', value: 'early' },
      { label: '夜间易醒', value: 'awaken' },
      { label: '睡后仍疲惫', value: 'unrefreshing' },
    ],
  },
]

const followUpFatigue: FollowUpQuestion[] = [
  {
    id: 'fatigue_sleep',
    question: '是否睡够了仍觉得累？',
    inputType: 'radio',
    required: true,
    options: [
      { label: '是', value: 'yes' },
      { label: '否', value: 'no' },
    ],
  },
  {
    id: 'fatigue_cold',
    question: '是否怕冷？',
    inputType: 'radio',
    required: false,
    options: [
      { label: '是', value: 'yes' },
      { label: '否', value: 'no' },
    ],
  },
]

const followUpHairLoss: FollowUpQuestion[] = [
  {
    id: 'hairloss_pattern',
    question: '脱发主要部位？',
    inputType: 'multiselect',
    required: true,
    options: [
      { label: '前额', value: 'forehead' },
      { label: '头顶', value: 'top' },
      { label: '整体稀疏', value: 'general' },
    ],
  },
  {
    id: 'hairloss_family',
    question: '家族中有无类似情况？',
    inputType: 'radio',
    required: false,
    options: [
      { label: '有', value: 'yes' },
      { label: '无', value: 'no' },
    ],
  },
]

const followUpSkin: FollowUpQuestion[] = [
  {
    id: 'skin_type',
    question: '皮肤问题主要是什么？',
    inputType: 'multiselect',
    required: true,
    options: [
      { label: '痤疮/痘痘', value: 'acne' },
      { label: '湿疹/皮炎', value: 'eczema' },
      { label: '皮肤干燥', value: 'dry' },
      { label: '皮肤油腻', value: 'oily' },
    ],
  },
]

const followUpConstipation: FollowUpQuestion[] = [
  {
    id: 'bowel_frequency',
    question: '每周排便几次？',
    inputType: 'radio',
    required: true,
    options: [
      { label: '<3次', value: 'rare' },
      { label: '3-7次', value: 'normal' },
      { label: '>7次（腹泻）', value: 'diarrhea' },
    ],
  },
]

const followUpBrainFog: FollowUpQuestion[] = [
  {
    id: 'brainfog_impact',
    question: '脑雾对日常工作/生活的影响程度？',
    inputType: 'radio',
    required: true,
    options: [
      { label: '轻微，偶尔忘事', value: 'mild' },
      { label: '中度，影响工作效率', value: 'moderate' },
      { label: '严重，明显影响记忆力和注意力', value: 'severe' },
    ],
  },
]

const followUpLibido: FollowUpQuestion[] = [
  {
    id: 'libido_duration',
    question: '性欲减退持续多久了？',
    inputType: 'radio',
    required: true,
    options: [
      { label: '<3个月', value: '<3m' },
      { label: '3个月-1年', value: '3m-1y' },
      { label: '>1年', value: '>1y' },
    ],
  },
]

// —— 男性追问模板 ——

const followUpErectile: FollowUpQuestion[] = [
  {
    id: 'erectile_duration',
    question: '持续多久？',
    inputType: 'radio',
    required: true,
    options: [
      { label: '<3个月', value: '<3m' },
      { label: '3个月-1年', value: '3m-1y' },
      { label: '>1年', value: '>1y' },
    ],
  },
  {
    id: 'erectile_fatigue',
    question: '是否同时感觉疲劳、精力下降？',
    inputType: 'radio',
    required: false,
    options: [
      { label: '是', value: 'yes' },
      { label: '否', value: 'no' },
    ],
  },
]

const followUpProstate: FollowUpQuestion[] = [
  {
    id: 'prostate_nocutria',
    question: '夜尿次数？',
    inputType: 'radio',
    required: true,
    options: [
      { label: '0-1次', value: '0-1' },
      { label: '2-3次', value: '2-3' },
      { label: '≥4次', value: '>=4' },
    ],
  },
  {
    id: 'prostate_straining',
    question: '是否排尿费力？',
    inputType: 'radio',
    required: true,
    options: [
      { label: '是', value: 'yes' },
      { label: '否', value: 'no' },
    ],
  },
]

const followUpGout: FollowUpQuestion[] = [
  {
    id: 'gout_diagnosed',
    question: '是否确诊过痛风？',
    inputType: 'radio',
    required: true,
    options: [
      { label: '是', value: 'yes' },
      { label: '否（只是尿酸高）', value: 'no' },
    ],
  },
  {
    id: 'gout_frequency',
    question: '最近一年发作几次？',
    inputType: 'radio',
    required: false,
    options: [
      { label: '0次', value: '0' },
      { label: '1-2次', value: '1-2' },
      { label: '≥3次', value: '>=3' },
    ],
  },
]

const followUpAcne: FollowUpQuestion[] = [
  {
    id: 'acne_severity',
    question: '痤疮严重程度？',
    inputType: 'radio',
    required: true,
    options: [
      { label: '轻度（少量粉刺）', value: 'mild' },
      { label: '中度（有炎症丘疹）', value: 'moderate' },
      { label: '重度（结节/囊肿）', value: 'severe' },
    ],
  },
]

// ========== 女性核心诉求配置 ==========

const femaleConfig: GenderConfig = {
  gender: 'female',
  ageGroups: [
    // —— 青少年女性（10-19岁）——
    {
      id: 'female_teen',
      label: '青少年女性',
      ageMin: 10,
      ageMax: 19,
      needs: [
        { id: 'period_irregular', label: '月经不规律/痛经', followUp: followUpPeriod },
        { id: 'acne', label: '痤疮/皮肤油腻', followUp: followUpAcne },
        { id: 'mood_swing', label: '情绪波动大', followUp: followUpLowMood },
        { id: 'fatigue', label: '疲劳、精力差', followUp: followUpFatigue },
        { id: 'weight_issue', label: '体重问题（想减重/增重）', followUp: followUpWeightLoss },
        { id: 'exercise_performance', label: '运动表现/体能提升', followUp: followUpMuscleGain },
        { id: 'digestion', label: '肠胃不适（腹痛/便秘/腹泻）', followUp: followUpConstipation },
        { id: 'sleep_issue', label: '想改善睡眠', followUp: followUpInsomnia },
        { id: 'other_female_teen', label: '其他', followUp: [] },
      ],
    },
    // —— 育龄期女性（20-45岁，非更年期）——
    {
      id: 'female_reproductive',
      label: '育龄期女性',
      ageMin: 20,
      ageMax: 45,
      needs: [
        { id: 'pregnancy_prep', label: '备孕（计划怀孕）', followUp: followUpPregnancy },
        { id: 'pregnant', label: '怀孕中', followUp: followUpPregnant },
        { id: 'period_issue', label: '月经问题（周期不规律/经量过多/痛经）', followUp: followUpPeriod },
        { id: 'pms', label: '经前综合征（PMS）', followUp: followUpPMS },
        { id: 'low_mood', label: '情绪低落/焦虑', followUp: followUpLowMood },
        { id: 'chronic_fatigue', label: '慢性疲劳', followUp: followUpFatigue },
        { id: 'weight_loss', label: '减重/体重管理', followUp: followUpWeightLoss },
        { id: 'muscle_gain', label: '增肌/塑形', followUp: followUpMuscleGain },
        { id: 'hair_loss', label: '脱发', followUp: followUpHairLoss },
        { id: 'skin_issue', label: '皮肤问题（痤疮/湿疹）', followUp: followUpSkin },
        { id: 'digestion', label: '肠胃不适', followUp: followUpConstipation },
        { id: 'insomnia', label: '失眠', followUp: followUpInsomnia },
        { id: 'brain_fog', label: '精力不足/脑雾', followUp: followUpBrainFog },
        { id: 'libido_low', label: '性欲减退', followUp: followUpLibido },
        { id: 'other_female_repro', label: '其他', followUp: [] },
      ],
    },
    // —— 围绝经期/更年期女性（45-60岁）——
    {
      id: 'female_perimenopause',
      label: '围绝经期/更年期',
      ageMin: 45,
      ageMax: 60,
      needs: [
        { id: 'hot_flash', label: '潮热盗汗', followUp: followUpHotFlash },
        { id: 'mood_swing_mp', label: '情绪波动/易怒', followUp: followUpLowMood },
        { id: 'insomnia_mp', label: '失眠', followUp: followUpInsomnia },
        { id: 'joint_pain', label: '关节疼痛', followUp: followUpJointPain },
        { id: 'vaginal_dryness', label: '阴道干涩' },
        { id: 'weight_gain_mp', label: '体重增加/代谢变慢', followUp: followUpWeightLoss },
        { id: 'fatigue_mp', label: '疲劳', followUp: followUpFatigue },
        { id: 'memory_decline', label: '记忆力下降/脑雾', followUp: followUpBrainFog },
        { id: 'palpitation', label: '心悸' },
        { id: 'other_female_mp', label: '其他', followUp: [] },
      ],
    },
    // —— 老年女性（≥60岁）——
    {
      id: 'female_elderly',
      label: '老年女性',
      ageMin: 60,
      ageMax: 120,
      needs: [
        { id: 'cold_intolerance', label: '怕冷/乏力', followUp: followUpFatigue },
        { id: 'memory_decline_elderly', label: '记忆力下降', followUp: followUpBrainFog },
        { id: 'joint_pain_elderly', label: '关节疼痛/骨质疏松', followUp: followUpJointPain },
        { id: 'constipation_elderly', label: '便秘', followUp: followUpConstipation },
        { id: 'bp_cholesterol', label: '高血压/高血脂（管理）' },
        { id: 'blood_sugar', label: '血糖问题' },
        { id: 'sleep_poor', label: '睡眠差' },
        { id: 'muscle_loss', label: '肌肉流失/走路无力' },
        { id: 'low_mood_elderly', label: '情绪低落' },
        { id: 'other_female_elderly', label: '其他', followUp: [] },
      ],
    },
  ],
}

// ========== 男性核心诉求配置 ==========

const maleConfig: GenderConfig = {
  gender: 'male',
  ageGroups: [
    // —— 青少年男性（10-19岁）——
    {
      id: 'male_teen',
      label: '青少年男性',
      ageMin: 10,
      ageMax: 19,
      needs: [
        { id: 'fatigue_male_teen', label: '精力差/容易累', followUp: followUpFatigue },
        { id: 'exercise_performance_male', label: '运动表现/增肌', followUp: followUpMuscleGain },
        { id: 'acne_male', label: '痤疮', followUp: followUpAcne },
        { id: 'weight_issue_male', label: '体重问题（减重/增重）', followUp: followUpWeightLoss },
        { id: 'mood_swing_male_teen', label: '情绪波动', followUp: followUpLowMood },
        { id: 'sleep_poor_male_teen', label: '睡眠差', followUp: followUpInsomnia },
        { id: 'digestion_male_teen', label: '肠胃不适' },
        { id: 'hair_loss_male_teen', label: '脱发（早秃）', followUp: followUpHairLoss },
        { id: 'other_male_teen', label: '其他', followUp: [] },
      ],
    },
    // —— 成年男性（20-59岁）——
    {
      id: 'male_adult',
      label: '成年男性',
      ageMin: 20,
      ageMax: 59,
      needs: [
        { id: 'weight_loss_male', label: '减重/体重管理', followUp: followUpWeightLoss },
        { id: 'muscle_gain_male', label: '增肌/健身表现', followUp: followUpMuscleGain },
        { id: 'fatigue_male', label: '疲劳/精力不足', followUp: followUpFatigue },
        { id: 'sleep_issue_male', label: '睡眠问题', followUp: followUpInsomnia },
        { id: 'low_mood_male', label: '情绪低落/焦虑', followUp: followUpLowMood },
        { id: 'erectile', label: '性欲减退/勃起问题', followUp: followUpErectile },
        { id: 'hair_loss_male', label: '脱发', followUp: followUpHairLoss },
        { id: 'digestion_male', label: '肠胃不适' },
        { id: 'bp_cholesterol_male', label: '高血脂/高血压管理' },
        { id: 'gout', label: '尿酸高/痛风', followUp: followUpGout },
        { id: 'prostate', label: '前列腺问题（尿频/夜尿多）', followUp: followUpProstate },
        { id: 'other_male_adult', label: '其他', followUp: [] },
      ],
    },
    // —— 老年男性（≥60岁）——
    {
      id: 'male_elderly',
      label: '老年男性',
      ageMin: 60,
      ageMax: 120,
      needs: [
        { id: 'urination', label: '排尿问题（夜尿多/排尿费力）', followUp: followUpProstate },
        { id: 'strength_decline', label: '体力下降/肌肉流失', followUp: followUpMuscleGain },
        { id: 'joint_pain_male_elderly', label: '关节疼痛', followUp: followUpJointPain },
        { id: 'cold_intolerance_male', label: '怕冷' },
        { id: 'memory_decline_male', label: '记忆力下降', followUp: followUpBrainFog },
        { id: 'constipation_male_elderly', label: '便秘', followUp: followUpConstipation },
        { id: 'bp_cholesterol_elderly', label: '血压/血脂/血糖管理' },
        { id: 'sleep_poor_male_elderly', label: '睡眠差' },
        { id: 'libido_low_male_elderly', label: '性功能减退', followUp: followUpLibido },
        { id: 'other_male_elderly', label: '其他', followUp: [] },
      ],
    },
  ],
}

// ========== 导出 ==========

/** 所有性别配置 */
export const genderConfigs: GenderConfig[] = [femaleConfig, maleConfig]

/**
 * 根据性别和年龄获取对应的年龄组配置
 */
export function getAgeGroup(gender: 'female' | 'male', age: number): AgeGroupConfig | null {
  const config = gender === 'female' ? femaleConfig : maleConfig
  return config.ageGroups.find(g => age >= g.ageMin && age <= g.ageMax) || null
}

/**
 * 根据性别和年龄获取核心诉求列表
 */
export function getCoreNeeds(gender: 'female' | 'male', age: number): CoreNeed[] {
  const ageGroup = getAgeGroup(gender, age)
  return ageGroup?.needs || []
}

/**
 * 根据诉求 ID 获取该诉求的追问问题
 */
export function getFollowUpQuestions(
  gender: 'female' | 'male',
  age: number,
  needId: string,
): FollowUpQuestion[] {
  const needs = getCoreNeeds(gender, age)
  const need = needs.find(n => n.id === needId)
  return need?.followUp || []
}
