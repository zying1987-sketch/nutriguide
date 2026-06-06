/**
 * 评估问卷数据 - PRD 2026-06-02 重新设计
 *
 * 新流程（7步）：
 * Step1: 基础信息（性别/年龄/身高/体重/怀孕状态）
 * Step2: 核心诉求（按性别+年龄动态渲染，多选）
 * Step3: 追问（按已选诉求动态展开 1-3 题）
 * Step4: 饮食评估（新增 - ARCHITECTURE.md 缺口 2）
 * Step5: 补充剂与药物（多选）
 * Step6: 体检数据（可选）
 * Step7: 确认信息 → 提交
 */

import { dietQuestions } from './dietAssessment'

// ========= 类型定义 =========

export interface AssessmentStep {
  id: string
  title: string
  description: string
  stepNumber: number
  fields: AssessmentField[]
}

export interface AssessmentField {
  id: string
  type:
    | 'text'
    | 'number'
    | 'select'
    | 'multiselect'
    | 'radio'
    | 'slider'
    | 'lab_value'
    | 'core_needs'   // 新增：动态核心诉求（性别+年龄分层）
    | 'follow_up'    // 新增：动态追问（按诉求展开）
    | 'summary'       // 新增：答案预览确认
  label: string
  description?: string
  placeholder?: string
  required?: boolean
  options?: { label: string; value: string }[]
  min?: number
  max?: number
  unit?: string
  /** 条件显示：仅当指定字段等于指定值时显示 */
  showCondition?: { field: string; value: string | string[] }
}

// ========= 静态字段选项 =========

const pregnancyOptions = [
  { label: '无', value: 'none' },
  { label: '备孕中', value: 'preconception' },
  { label: '已怀孕（孕早期 0-12 周）', value: 'pregnant_t1' },
  { label: '已怀孕（孕中期 13-27 周）', value: 'pregnant_t2' },
  { label: '已怀孕（孕晚期 28 周+）', value: 'pregnant_t3' },
  { label: '哺乳期', value: 'lactation' },
  { label: '围绝经期/更年期', value: 'perimenopause' },
]

const diagnosisOptions = [
  { label: '桥本甲状腺炎', value: 'hashimoto' },
  { label: '甲亢/Graves 病', value: 'hyperthyroidism' },
  { label: '甲减', value: 'hypothyroidism' },
  { label: '糖尿病（1型/2型）', value: 'diabetes' },
  { label: 'PCOS（多囊卵巢综合征）', value: 'pcos' },
  { label: 'IBS（肠易激综合征）', value: 'ibs' },
  { label: '抑郁/焦虑症', value: 'depression_anxiety' },
  { label: '高血压', value: 'hypertension' },
  { label: '高血脂', value: 'hyperlipidemia' },
  { label: '心血管疾病（冠心病/心梗/中风等）', value: 'cardiovascular' },
  { label: '痛风', value: 'gout' },
  { label: '慢性肾病', value: 'kidney_disease' },
  { label: '乳糜泻/麸质不耐受', value: 'celiac' },
  { label: '以上均无', value: 'none' },
]

const medicationOptions = [
  { label: '优甲乐（左甲状腺素）', value: 'levothyroxine' },
  { label: '二甲双胍', value: 'metformin' },
  { label: '降糖药/胰岛素', value: 'antidiabetic' },
  { label: '他汀类降脂药', value: 'statins' },
  { label: '降压药', value: 'antihypertensive' },
  { label: '口服避孕药', value: 'ocp' },
  { label: '抗抑郁/抗焦虑药', value: 'antidepressant' },
  { label: '利尿剂', value: 'diuretics' },
  { label: '阿司匹林', value: 'aspirin' },
  { label: '以上均无', value: 'none' },
]

const supplementOptions = [
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
  { label: '中草药（如圣约翰草、锯棕榈等）', value: 'herbal' },
  { label: '没有服用任何产品', value: 'none' },
]

const labFields: AssessmentField[] = [
  {
    id: 'lab_vitamin_d',
    type: 'lab_value',
    label: '25-羟基维生素 D',
    description: '数值如未知可跳过',
    unit: 'nmol/L',
  },
  {
    id: 'lab_ferritin',
    type: 'lab_value',
    label: '铁蛋白',
    unit: 'μg/L',
  },
  {
    id: 'lab_vitamin_b12',
    type: 'lab_value',
    label: '维生素 B12',
    unit: 'pmol/L',
  },
  {
    id: 'lab_tsh',
    type: 'lab_value',
    label: 'TSH（促甲状腺激素）',
    unit: 'mIU/L',
  },
  {
    id: 'lab_fasting_glucose',
    type: 'lab_value',
    label: '空腹血糖',
    unit: 'mmol/L',
  },
  {
    id: 'lab_hba1c',
    type: 'lab_value',
    label: '糖化血红蛋白（HbA1c）',
    unit: '%',
  },
  {
    id: 'lab_triglycerides',
    type: 'lab_value',
    label: '甘油三酯',
    unit: 'mmol/L',
    description: '如无可跳过',
  },
  {
    id: 'lab_total_cholesterol',
    type: 'lab_value',
    label: '总胆固醇',
    unit: 'mmol/L',
    description: '如无可跳过',
  },
  // 男性可选
  {
    id: 'lab_testosterone',
    type: 'lab_value',
    label: '总睾酮（男性可选）',
    unit: 'nmol/L',
    description: '如无可跳过',
  },
  {
    id: 'lab_psa',
    type: 'lab_value',
    label: 'PSA（男性可选，50 岁+）',
    unit: 'ng/mL',
    description: '如无可跳过',
  },
]

// ========= 步骤定义（新流程） =========

export const assessmentSteps: AssessmentStep[] = [
  // ── Step 1：基础信息 ──
  {
    id: 'basic_info',
    title: '基础信息',
    description: '这些信息帮助我们了解您的基本情况',
    stepNumber: 1,
    fields: [
      {
        id: 'name',
        type: 'text',
        label: '姓名/昵称',
        required: true,
        placeholder: '请输入您的姓名或昵称',
      },
      {
        id: 'gender',
        type: 'select',
        label: '性别',
        required: true,
        options: [
          { label: '女', value: 'female' },
          { label: '男', value: 'male' },
        ],
      },
      {
        id: 'age',
        type: 'number',
        label: '年龄',
        required: true,
        min: 10,
        max: 120,
        unit: '岁',
      },
      {
        id: 'height',
        type: 'number',
        label: '身高',
        required: true,
        min: 100,
        max: 250,
        unit: 'cm',
      },
      {
        id: 'weight',
        type: 'number',
        label: '体重',
        required: true,
        min: 20,
        max: 300,
        unit: 'kg',
      },
      {
        id: 'pregnancy_status',
        type: 'select',
        label: '怀孕/备孕/哺乳状态',
        required: false,
        options: pregnancyOptions,
        showCondition: { field: 'gender', value: 'female' },
      },
      {
        id: 'diagnosis',
        type: 'multiselect',
        label: '已确诊疾病（可多选）',
        required: false,
        options: diagnosisOptions,
      },
      {
        id: 'medications',
        type: 'multiselect',
        label: '长期服用的药物（可多选）',
        required: false,
        options: medicationOptions,
      },
    ],
  },

  // ── Step 2：核心诉求（动态渲染）──
  {
    id: 'core_needs',
    title: '核心诉求',
    description: '请选择您最关注的健康诉求（可多选）',
    stepNumber: 2,
    fields: [
      {
        id: '_core_needs',
        type: 'core_needs',
        label: '核心诉求',
        required: true,
      },
    ],
  },

  // ── Step 3：追问（按诉求动态展开）──
  {
    id: 'follow_up',
    title: '补充信息',
    description: '根据您选择的诉求，我们需要进一步了解',
    stepNumber: 3,
    fields: [
      {
        id: '_follow_up',
        type: 'follow_up',
        label: '追问',
        required: false,
      },
    ],
  },

  // ── Step 4：饮食评估（新增 - ARCHITECTURE.md 缺口 2）──
  {
    id: 'diet_assessment',
    title: '饮食评估',
    description: '饮食是基础。了解您的饮食习惯，系统才能给出真正有用的建议。',
    stepNumber: 4,
    fields: dietQuestions.map(q => ({
      id: `diet_${q.id}`,
      type: q.type === 'multiselect' ? 'multiselect' as const : 'radio' as const,
      label: q.question,
      required: false,
      options: q.options.map(o => ({ label: o.label, value: o.value })),
    })),
  },

  // ── Step 5：补充剂与药物 ──
  {
    id: 'supplements_meds',
    title: '补充剂与药物',
    description: '了解您目前正在使用的产品，避免重复推荐和相互作用',
    stepNumber: 5,
    fields: [
      {
        id: 'current_supplements',
        type: 'multiselect',
        label: '您目前正在服用哪些产品？（可多选）',
        required: false,
        options: supplementOptions,
      },
      {
        id: 'custom_medication',
        type: 'text',
        label: '处方药（如有，请填写药名）',
        description: '例如：优甲乐、二甲双胍等',
        required: false,
      },
    ],
  },

  // ── Step 6：体检数据（可选）──
  {
    id: 'lab_data',
    title: '体检数据（可选）',
    description:
      '填写后系统会给出精准剂量（例如维生素 D 从"800-2000 IU"变成"2000 IU/天，持续 3 个月"）。\n如不方便跳过即可，系统将根据您的描述给出通用建议。\n\n推荐关注指标：维生素 D、铁蛋白、TSH。',
    stepNumber: 5,
    fields: labFields,
  },

  // ── Step 7：确认信息 ──
  {
    id: 'summary',
    title: '确认信息',
    description: '请确认您的回答，如需修改可返回上一步。确认无误后点击"查看结果"。',
    stepNumber: 7,
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

// ========= 兼容性导出 =========
// 保留旧接口名称，避免其他文件大量修改

/** 旧版 symptomList —— 逐步迁移至 coreNeeds，暂保留供 ruleEngine 参考 */
export const symptomList: { id: string; label: string; targetPopulations: string[]; weight: number }[] = []
