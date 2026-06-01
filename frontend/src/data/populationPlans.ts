// 人群方案知识库 - 每个特殊人群的营养素、饮食和生活方式方案

export interface SupplementRecommendation {
  name: string
  nameEn: string
  dosage: string
  form: string
  timing: string
  level: 'core' | 'conditional' | 'optional'
  condition?: string
  drugInteraction?: string
}

export interface DietPrinciple {
  principle: string
  detail: string
}

export interface FoodItem {
  name: string
  reason: string
}

export interface LifestyleAdvice {
  category: string
  recommendation: string
  frequency?: string
  note?: string
}

export interface PopulationPlan {
  id: string
  name: string
  category: string
  categoryName: string
  description: string
  keyRisks: string[]
  supplements: SupplementRecommendation[]
  diet: {
    principles: DietPrinciple[]
    foodsToEat: FoodItem[]
    foodsToAvoid: FoodItem[]
    mealExample?: string[]
  }
  lifestyle: LifestyleAdvice[]
  monitoringPlan: string[]
  warningSigns: string[]
}

// ========== 1. 孕期人群 ==========
const pregnancyBase: PopulationPlan = {
  id: 'pregnancy_general',
  name: '孕期 - 通用',
  category: 'pregnancy',
  categoryName: '孕期',
  description: '孕期营养素需求显著增加，需分阶段调整补充方案',
  keyRisks: ['叶酸缺乏→神经管畸形', '铁缺乏→贫血', '钙缺乏→孕期高血压/骨质疏松', '碘缺乏→胎儿智力发育受影响'],
  supplements: [
    { name: '叶酸', nameEn: 'Folate', dosage: '400-800μg', form: 'L-5-甲基四氢叶酸', timing: '每日一次', level: 'core' },
    { name: '铁', nameEn: 'Iron', dosage: '孕中期起30-60mg', form: '富马酸亚铁/甘氨酸铁', timing: '空腹或与维C同服', level: 'core', condition: '根据血常规/铁蛋白调整' },
    { name: '钙', nameEn: 'Calcium', dosage: '1000-1200mg', form: '柠檬酸钙', timing: '分次随餐', level: 'core' },
    { name: '维生素D', nameEn: 'Vitamin D', dosage: '600-1000IU', form: 'D3', timing: '随含脂餐', level: 'core' },
    { name: '碘', nameEn: 'Iodine', dosage: '230μg', form: '碘化钾', timing: '每日一次', level: 'core' },
    { name: 'DHA', nameEn: 'DHA', dosage: '200-300mg', form: '藻油/鱼油', timing: '随餐', level: 'conditional' },
    { name: '镁', nameEn: 'Magnesium', dosage: '350-400mg', form: '甘氨酸镁/柠檬酸镁', timing: '睡前', level: 'optional', condition: '有抽筋或便秘' },
    { name: '维生素B6', nameEn: 'Vitamin B6', dosage: '25-50mg', form: '吡哆醇', timing: '每8小时', level: 'optional', condition: '孕吐明显' },
  ],
  diet: {
    principles: [
      { principle: '优质蛋白增量', detail: '每日增加15-25g蛋白质，优先选择鱼、禽、蛋、奶、豆制品' },
      { principle: '分餐少食多餐', detail: '5-6餐/日，控制孕期体重增长在合理范围' },
      { principle: '补充血红素铁', detail: '每周2-3次红肉或动物肝脏，搭配维C丰富蔬果促进吸收' },
      { principle: '避免高风险食物', detail: '生鱼片、未全熟蛋肉、未经巴氏消毒的奶制品' },
    ],
    foodsToEat: [
      { name: '深绿色叶菜', reason: '富含叶酸、铁、钙' },
      { name: '三文鱼/沙丁鱼', reason: 'DHA、维D，选低汞鱼类' },
      { name: '鸡蛋', reason: '优质蛋白、胆碱（胎儿脑发育）' },
      { name: '豆制品', reason: '植物蛋白、钙' },
      { name: '坚果', reason: '健康脂肪、维E、镁' },
      { name: '全谷物', reason: 'B族维生素、纤维（防便秘）' },
    ],
    foodsToAvoid: [
      { name: '高汞鱼类', reason: '鲨鱼、剑鱼、金枪鱼（大眼）—影响胎儿神经发育' },
      { name: '生/未熟食物', reason: '李斯特菌、弓形虫感染风险' },
      { name: '酒精', reason: '胎儿酒精综合征，绝对禁止' },
      { name: '过量咖啡因', reason: '每日<200mg（约1杯咖啡）' },
      { name: '高剂量维生素A', reason: '动物肝脏每周<1次，避免维A补充剂>3000μg' },
    ],
  },
  lifestyle: [
    { category: '运动', recommendation: '每周150分钟中等强度运动（散步、游泳、孕妇瑜伽）', frequency: '5天/周' },
    { category: '睡眠', recommendation: '左侧卧，使用孕妇枕支撑腹部', frequency: '每晚7-9小时' },
    { category: '压力管理', recommendation: '产前冥想/正念，参加孕妇课程', frequency: '每日10-15分钟' },
    { category: '体重监测', recommendation: '根据孕前BMI制定增重目标（正常BMI增重11.5-16kg）', frequency: '每周' },
  ],
  monitoringPlan: ['孕早期查血常规+血清铁蛋白', '孕中期OGTT筛查妊娠糖尿病', '每 trimester 查TSH（尤其有甲状腺病史）', '孕晚期查25(OH)D+铁蛋白'],
  warningSigns: ['剧烈头痛+视力模糊→子痫前期', '阴道出血→流产/早产风险', '胎动明显减少→胎儿窘迫', '持续呕吐无法进食→妊娠剧吐'],
}

// 孕早期（0-12周）
const pregnancyFirstTri: PopulationPlan = {
  ...pregnancyBase,
  id: 'pregnancy_t1',
  name: '孕早期（0-12周）',
  category: 'pregnancy',
  categoryName: '孕期',
  description: '胚胎器官形成关键期，重点补充叶酸、预防神经管畸形',
  keyRisks: ['叶酸缺乏→神经管畸形', '孕吐→电解质紊乱', '流产风险（15-20%）'],
  supplements: pregnancyBase.supplements.filter(s =>
    ['叶酸', '碘', '维生素D', '维生素B6'].includes(s.name)
  ).map(s => s.name === '维生素B6' ? { ...s, dosage: '10-25mg', level: 'conditional' as const } : s),
  diet: {
    ...pregnancyBase.diet,
    principles: [
      { principle: '叶酸优先', detail: '每日补充400-800μg叶酸，多吃深绿色叶菜、豆类、强化谷物' },
      { principle: '对抗孕吐', detail: '晨起吃干饼干/吐司，少量多餐，避免空腹；姜茶或维生素B6可缓解' },
      { principle: '不需要额外热量', detail: '孕早期无需增加热量摄入，注重营养素密度而非数量' },
    ],
  },
  lifestyle: [
    ...pregnancyBase.lifestyle.filter(l => !['体重监测'].includes(l.category)),
    { category: '运动', recommendation: '温和运动如散步、轻柔拉伸，避免剧烈运动和高风险活动', frequency: '每日30分钟' },
  ],
}

// 孕中期（13-27周）
const pregnancySecondTri: PopulationPlan = {
  ...pregnancyBase,
  id: 'pregnancy_t2',
  name: '孕中期（13-27周）',
  category: 'pregnancy',
  categoryName: '孕期',
  description: '胎儿快速生长期，需增加热量和关键营养素摄入',
  keyRisks: ['铁缺乏→贫血', '钙缺乏→腿抽筋', '妊娠糖尿病', '体重增长过快'],
  supplements: pregnancyBase.supplements.filter(s =>
    ['铁', '钙', '维生素D', 'DHA', '碘'].includes(s.name)
  ).map(s => {
    if (s.name === '铁') return { ...s, dosage: '30mg/d起始（依据铁蛋白调整）' }
    if (s.name === '钙') return { ...s, dosage: '1000mg' }
    return s
  }),
  diet: {
    ...pregnancyBase.diet,
    principles: [
      { principle: '增加热量300kcal/日', detail: '相当于1个鸡蛋+1杯牛奶+1个水果' },
      { principle: '补铁补钙同步', detail: '每周2-3次红肉+每日奶制品/豆制品，钙铁分开2小时服用' },
      { principle: '控糖', detail: '25-28周做OGTT，控制精制碳水和添加糖摄入' },
    ],
  },
}

// 孕晚期（28周至分娩）
const pregnancyThirdTri: PopulationPlan = {
  ...pregnancyBase,
  id: 'pregnancy_t3',
  name: '孕晚期（28周至分娩）',
  category: 'pregnancy',
  categoryName: '孕期',
  description: '胎儿体重冲刺期，母体负担最大',
  keyRisks: ['铁需求峰值', '钙需求量最大', '便秘加重', '水肿', '妊娠高血压'],
  supplements: pregnancyBase.supplements.filter(s =>
    ['铁', '钙', 'DHA', '镁', '维生素D'].includes(s.name)
  ).map(s => {
    if (s.name === '铁') return { ...s, dosage: '30-60mg' }
    if (s.name === '钙') return { ...s, dosage: '1000-1200mg' }
    if (s.name === 'DHA') return { ...s, dosage: '200-300mg', level: 'core' as const }
    return s
  }),
  diet: {
    ...pregnancyBase.diet,
    principles: [
      { principle: '增加热量450kcal/日', detail: '增加优质蛋白+全谷物' },
      { principle: '高纤维防便秘', detail: '每日25-35g膳食纤维，大量饮水' },
      { principle: '控制钠摄入', detail: '如有水肿或高血压，限制食盐<5g/日' },
    ],
  },
}

// 备孕期
const pregnancyPreconception: PopulationPlan = {
  ...pregnancyBase,
  id: 'pregnancy_preconception',
  name: '备孕期（孕前3-6个月）',
  category: 'pregnancy',
  categoryName: '孕期',
  description: '优化母体营养状态为受孕和胚胎发育做准备',
  keyRisks: ['叶酸不足', '铁储备不足', 'BMI异常影响受孕率'],
  supplements: [
    { name: '叶酸', nameEn: 'Folate', dosage: '400-800μg', form: 'L-5-甲基四氢叶酸', timing: '每日一次', level: 'core' },
    { name: '辅酶Q10', nameEn: 'CoQ10', dosage: '200-300mg', form: '泛醇', timing: '随含脂餐', level: 'conditional', condition: '尤其>35岁或卵巢储备下降' },
    { name: '维生素D', nameEn: 'Vitamin D', dosage: '1000-2000IU', form: 'D3', timing: '随餐', level: 'core' },
    { name: 'Omega-3', nameEn: 'Omega-3', dosage: '500-1000mg', form: '鱼油/藻油', timing: '随餐', level: 'optional' },
  ],
  diet: {
    ...pregnancyBase.diet,
    principles: [
      { principle: '达到健康BMI', detail: 'BMI<18.5需增重，>25需减重后再备孕' },
      { principle: '抗炎饮食', detail: '地中海饮食模式，多摄入抗氧化食物、健康脂肪、全谷物' },
      { principle: '避免环境毒素', detail: '减少塑料容器使用，选择有机蔬果（尤其12种高农药残留）' },
    ],
  },
  lifestyle: [
    { category: '运动', recommendation: '每周150分钟中等强度运动，结合力量训练', frequency: '3-5天/周' },
    { category: '戒烟戒酒', recommendation: '双方至少孕前3个月完全戒烟戒酒', frequency: '必须' },
    { category: '排卵监测', recommendation: '基础体温+排卵试纸，找准排卵窗口期', frequency: '月经周期第10天起' },
    { category: '睡眠', recommendation: '规律作息，保持昼夜节律稳定', frequency: '每晚7-8小时' },
  ],
  monitoringPlan: ['孕前检查：血常规+铁蛋白+TSH+25(OH)D+血糖+TORCH', '双方基因携带者筛查（如有家族史）'],
  warningSigns: ['月经周期严重不规律(>35天或<21天)→需妇科评估', '尝试>12个月(>35岁>6个月)未孕→生育力评估'],
}

// 哺乳期
const pregnancyLactation: PopulationPlan = {
  ...pregnancyBase,
  id: 'pregnancy_lactation',
  name: '哺乳期（产后0-6个月）',
  category: 'pregnancy',
  categoryName: '孕期',
  description: '哺乳消耗大量营养素和热量，需持续补充关键微量营养素',
  keyRisks: ['钙流失', '铁储备恢复慢', 'DHA需求大', '脱水', '产后甲状腺炎'],
  supplements: [
    { name: '钙', nameEn: 'Calcium', dosage: '1000-1200mg', form: '柠檬酸钙', timing: '分次', level: 'core' },
    { name: '维生素D', nameEn: 'Vitamin D', dosage: '600-1000IU', form: 'D3', timing: '随餐', level: 'core' },
    { name: 'DHA', nameEn: 'DHA', dosage: '200-300mg', form: '藻油/鱼油', timing: '随餐', level: 'core' },
    { name: '铁', nameEn: 'Iron', dosage: '产后继续补充至铁蛋白正常', form: '富马酸亚铁', timing: '空腹+维C', level: 'conditional', condition: '根据产后血常规' },
    { name: '碘', nameEn: 'Iodine', dosage: '230μg', form: '碘化钾', timing: '每日', level: 'core' },
    { name: '葫芦巴', nameEn: 'Fenugreek', dosage: '1800-3600mg', form: '胶囊', timing: '分次', level: 'optional', condition: '奶水不足' },
  ],
  diet: {
    ...pregnancyBase.diet,
    principles: [
      { principle: '增加500kcal/日', detail: '哺乳消耗约500kcal/日，需增加优质蛋白和健康脂肪' },
      { principle: '大量饮水', detail: '每日2.5-3L，喂奶前后各一杯温水' },
      { principle: '催乳食物', detail: '燕麦、茴香、葫芦巴、啤酒酵母、木瓜' },
      { principle: '避免回奶食物', detail: '薄荷、鼠尾草大量可能回奶' },
    ],
    foodsToEat: [
      ...pregnancyBase.diet.foodsToEat,
      { name: '燕麦', reason: '催乳、稳定血糖、富铁' },
      { name: '骨头汤', reason: '胶原蛋白、矿物质、补水' },
      { name: '木瓜', reason: '催乳（含木瓜酶）' },
    ],
    foodsToAvoid: [
      ...pregnancyBase.diet.foodsToAvoid.filter(f => f.name !== '酒精'),
      { name: '酒精', reason: '进入母乳影响婴儿发育，如需饮酒后2-3小时再哺乳' },
      { name: '咖啡因', reason: '每日<300mg，注意观察婴儿是否烦躁' },
    ],
  },
  lifestyle: [
    { category: '睡眠', recommendation: '宝宝睡时你也睡，抓住一切碎片化睡眠时间', frequency: '累计7-8小时' },
    { category: '盆底康复', recommendation: '产后6周开始凯格尔运动+腹直肌分离修复', frequency: '每日' },
    { category: '情绪关注', recommendation: '留意产后抑郁信号（超过2周持续情绪低落、对宝宝无兴趣→求助）', frequency: '随时' },
  ],
  monitoringPlan: ['产后6周复查：血常规+铁蛋白+TSH（尤其有甲状腺病史）', '哺乳期持续补钙+维D'],
  warningSigns: ['产后>2周持续情绪低落/焦虑→产后抑郁', '哺乳时剧痛+乳房红肿发热→乳腺炎', '恶露超过6周或异味→感染'],
}

// ========== 2. 素食人群 ==========
const vegetarianStrict: PopulationPlan = {
  id: 'vegetarian_strict',
  name: '严格素食（纯素）',
  category: 'vegetarian',
  categoryName: '素食',
  description: '完全不摄入任何动物制品，需重点补充仅存在于动物性食物中的营养素',
  keyRisks: ['维生素B12缺乏', '铁缺乏（植物铁吸收率低）', '钙摄入不足', '锌缺乏', 'Omega-3缺乏', '蛋白质质量不足'],
  supplements: [
    { name: '维生素B12', nameEn: 'Vitamin B12', dosage: '25-100μg/d或2000μg/周', form: '甲钴胺/氰钴胺', timing: '任意时间', level: 'core' },
    { name: '维生素D', nameEn: 'Vitamin D', dosage: '800-2000IU', form: 'D3（地衣来源纯素）/D2', timing: '随含脂餐', level: 'core' },
    { name: '铁', nameEn: 'Iron', dosage: '根据铁蛋白决定，一般15-30mg', form: '甘氨酸铁', timing: '空腹+维C', level: 'conditional', condition: '月经期女性或已确认缺乏' },
    { name: '钙', nameEn: 'Calcium', dosage: '500-600mg（饮食+补充剂总1000mg）', form: '柠檬酸钙/海藻钙', timing: '分次随餐', level: 'core' },
    { name: '锌', nameEn: 'Zinc', dosage: '10-15mg', form: '甘氨酸锌/吡啶酸锌', timing: '随餐', level: 'core' },
    { name: 'Omega-3 DHA/EPA', nameEn: 'Algal DHA', dosage: '250-500mg', form: '藻油DHA', timing: '随餐', level: 'core' },
    { name: '碘', nameEn: 'Iodine', dosage: '75-150μg', form: '碘化钾/海带提取', timing: '每日', level: 'conditional', condition: '不使用碘盐者' },
  ],
  diet: {
    principles: [
      { principle: '蛋白质互补', detail: '谷物+豆类搭配（如米饭+豆腐、全麦面包+鹰嘴豆泥）提高蛋白质利用率' },
      { principle: '铁吸收最大化', detail: '每餐搭配维C来源（柠檬汁、番茄、青椒），避免与茶/咖啡/钙同餐' },
      { principle: '钙来源多样化', detail: '强化植物奶、石膏/盐卤豆腐、芝麻酱、羽衣甘蓝、西兰花' },
      { principle: 'B12必须补', detail: 'B12在植物性食物中几乎不存在，强化食品量不稳定，必须依赖补充剂' },
    ],
    foodsToEat: [
      { name: '豆腐/豆制品', reason: '优质植物蛋白、钙（石膏/盐卤）' },
      { name: '藜麦', reason: '完全蛋白质、铁、镁' },
      { name: '强化植物奶', reason: '钙、B12、维D强化' },
      { name: '亚麻籽/奇亚籽', reason: 'ALA（植物Omega-3）、纤维' },
      { name: '营养酵母', reason: 'B族维生素（部分强化B12）、蛋白质、鲜味' },
      { name: '南瓜籽', reason: '锌、镁、铁' },
      { name: '黑豆/小扁豆', reason: '铁、蛋白质、纤维' },
    ],
    foodsToAvoid: [
      { name: '高草酸食物单吃', reason: '菠菜、甜菜叶—草酸阻碍钙铁吸收，焯水或用柠檬汁搭配' },
      { name: '过量精制碳水', reason: '素食易偏重米面，需保证蛋白质和微量营养素密度' },
    ],
  },
  lifestyle: [
    { category: '定期检测', recommendation: '每年查血常规+铁蛋白+维生素B12+25(OH)D+同型半胱氨酸', frequency: '每年' },
    { category: '饮食记录', recommendation: '使用App记录3-5天饮食，检查营养素缺口', frequency: '每季度' },
  ],
  monitoringPlan: ['B12:每年测血清B12+MMA(甲基丙二酸,更敏感)', '铁:铁蛋白目标50-100μg/L', '25(OH)D:>75nmol/L', '同型半胱氨酸:<8μmol/L'],
  warningSigns: ['手脚麻木/刺痛→B12缺乏神经病变', '极度疲劳+苍白→贫血', '频繁感冒/感染→锌/蛋白不足'],
}

const vegetarianLactoOvo: PopulationPlan = {
  ...vegetarianStrict,
  id: 'vegetarian_lacto_ovo',
  name: '蛋奶素',
  category: 'vegetarian',
  categoryName: '素食',
  description: '吃蛋及奶制品，不吃肉类。B12和钙风险低于纯素，但仍需关注铁和Omega-3',
  keyRisks: ['铁缺乏（月经期女性重点关注）', 'Omega-3不足', '锌边缘缺乏'],
  supplements: vegetarianStrict.supplements.filter(s =>
    !['钙'].includes(s.name)
  ).map(s => {
    if (s.name === '维生素B12') return { ...s, dosage: '10-25μg/d', level: 'conditional' as const, condition: '蛋奶摄入不足时' }
    return s
  }),
}

// ========== 3. 健身人群 ==========
const fitnessBulking: PopulationPlan = {
  id: 'fitness_bulking',
  name: '增肌期',
  category: 'fitness',
  categoryName: '健身',
  description: '热量盈余+力量训练为主，重点支持肌肉蛋白合成和训练恢复',
  keyRisks: ['蛋白质摄入不足→增肌效率低', '热量盈余过多→脂肪堆积', '微量营养素不足→恢复慢'],
  supplements: [
    { name: '蛋白质', nameEn: 'Protein/Whey', dosage: '1.6-2.2g/kg体重', form: '乳清蛋白/植物蛋白', timing: '训练后30分钟内+睡前（酪蛋白）', level: 'core' },
    { name: '肌酸', nameEn: 'Creatine', dosage: '3-5g/d', form: '一水肌酸', timing: '任意时间（训练后吸收略优）', level: 'core' },
    { name: '维生素D', nameEn: 'Vitamin D', dosage: '2000-4000IU', form: 'D3', timing: '随含脂餐', level: 'core' },
    { name: '镁', nameEn: 'Magnesium', dosage: '300-400mg', form: '甘氨酸镁', timing: '睡前', level: 'core' },
    { name: '锌', nameEn: 'Zinc', dosage: '15-30mg', form: '甘氨酸锌', timing: '随餐', level: 'optional', condition: '睾酮优化' },
    { name: 'Omega-3', nameEn: 'Omega-3', dosage: '1-2g EPA+DHA', form: '鱼油', timing: '随餐', level: 'optional' },
    { name: 'β-丙氨酸', nameEn: 'Beta-Alanine', dosage: '3-5g/d', form: '粉末', timing: '分次或训练前', level: 'optional', condition: '高强度训练' },
  ],
  diet: {
    principles: [
      { principle: '热量盈余200-500kcal', detail: '超过维持热量，来源以优质蛋白+复合碳水为主' },
      { principle: '蛋白质均匀分布', detail: '每餐20-40g蛋白质，每日4-5餐，训练后30g快速吸收蛋白' },
      { principle: '碳水周期', detail: '训练日高碳水（4-6g/kg），休息日适中（3-4g/kg）' },
    ],
    foodsToEat: [
      { name: '鸡胸肉/瘦牛肉', reason: '优质完全蛋白、肌酸、铁、锌' },
      { name: '鸡蛋', reason: '完全蛋白、胆碱、维D' },
      { name: '希腊酸奶/茅屋芝士', reason: '酪蛋白（慢释放）—适合睡前' },
      { name: '燕麦/红薯', reason: '复合碳水、持续供能' },
      { name: '三文鱼', reason: '蛋白+Omega-3抗炎恢复' },
      { name: '白米饭（训练后）', reason: '快速碳水补充肌糖原' },
    ],
    foodsToAvoid: [
      { name: '过量添加糖', reason: '空热量，不助于增肌且增加脂肪堆积' },
      { name: '反式脂肪', reason: '油炸食品、人造黄油—促炎' },
    ],
  },
  lifestyle: [
    { category: '训练频率', recommendation: '力量训练4-6天/周，每肌群每周10-20组', frequency: '4-6天/周' },
    { category: '睡眠', recommendation: '7-9小时优质睡眠是肌肉合成的核心时段', frequency: '每晚' },
    { category: '恢复', recommendation: '每4-6周安排1周减载（deload），降低训练量50%', frequency: '每4-6周' },
  ],
  monitoringPlan: ['每月体脂+围度测量', '每3-6月血常规+肝肾功能（尤其使用补充剂者）'],
  warningSigns: ['持续疲劳+训练表现下降→过度训练', '关节疼痛→训练量/技术调整', '食欲下降+失眠→恢复不足'],
}

const fitnessCutting: PopulationPlan = {
  ...fitnessBulking,
  id: 'fitness_cutting',
  name: '减脂期',
  category: 'fitness',
  categoryName: '健身',
  description: '热量赤字+有氧/力量训练，保留肌肉同时减脂',
  keyRisks: ['蛋白质不足→肌肉流失', '微量营养素摄入不足→代谢下降', '肌酸+运动表现下降'],
  supplements: fitnessBulking.supplements.map(s => {
    if (s.name === '蛋白质') return { ...s, dosage: '1.8-2.4g/kg体重（减脂期需更高）' }
    return s
  }),
  diet: {
    principles: [
      { principle: '热量赤字300-500kcal', detail: '每周减0.5-1%体重，保持蛋白质高摄入' },
      { principle: '高蛋白保肌', detail: '每餐30-40g蛋白质，维持饱腹感和肌肉' },
      { principle: '高纤低能量密度', detail: '大量蔬菜+适量水果增加饱腹感' },
      { principle: '碳水循环', detail: '训练日碳水偏高，休息日低碳' },
    ],
    foodsToEat: [
      ...fitnessBulking.diet.foodsToEat.filter(f => !['白米饭（训练后）'].includes(f.name)),
      { name: '大量绿叶蔬菜', reason: '低卡高纤高微量营养素' },
      { name: '鸡蛋白', reason: '纯蛋白，几乎零脂肪' },
      { name: '魔芋/海带', reason: '极低卡、高饱腹' },
    ],
    foodsToAvoid: [
      ...fitnessBulking.diet.foodsToAvoid,
      { name: '液态热量', reason: '果汁、奶茶、酒精—高卡低饱腹' },
    ],
  },
  lifestyle: [
    { category: '有氧', recommendation: '低强度有氧（快走）每日8000-12000步+HIIT每周1-2次', frequency: '每日+1-2次/周' },
    { category: '睡眠', recommendation: '睡眠不足增加饥饿素、降低瘦素→更难减脂', frequency: '每晚7-9小时' },
  ],
  monitoringPlan: ['每周称重+围度测量+照片记录', '每4周调整热量摄入'],
  warningSigns: ['体重下降>1%/周→可能在掉肌肉', '女性月经停止→能量不足（RED-S风险）'],
}

// ========== 4. PCOS 人群 ==========
const pcosInsulinResistant: PopulationPlan = {
  id: 'pcos_insulin_resistant',
  name: 'PCOS - 胰岛素抵抗型',
  category: 'pcos',
  categoryName: 'PCOS',
  description: '多囊卵巢综合征最常见的亚型，核心问题是胰岛素抵抗驱动的高雄激素',
  keyRisks: ['胰岛素抵抗→高胰岛素→高雄激素', '排卵障碍→不孕', '代谢综合征', '维生素D缺乏（极其普遍）'],
  supplements: [
    { name: '肌醇', nameEn: 'Inositol', dosage: '2000-4000mg', form: '40:1 Myo:DCI', timing: '随餐分两次', level: 'core' },
    { name: '维生素D', nameEn: 'Vitamin D', dosage: '2000-4000IU', form: 'D3', timing: '随含脂餐', level: 'core' },
    { name: 'Omega-3', nameEn: 'Omega-3', dosage: '1-2g EPA+DHA', form: '鱼油', timing: '随餐', level: 'core' },
    { name: '镁', nameEn: 'Magnesium', dosage: '300-400mg', form: '甘氨酸镁', timing: '睡前', level: 'core' },
    { name: '锌', nameEn: 'Zinc', dosage: '15-30mg', form: '甘氨酸锌', timing: '随餐', level: 'core' },
    { name: '铬', nameEn: 'Chromium', dosage: '200-400μg', form: '吡啶酸铬', timing: '随餐', level: 'conditional', condition: '血糖控制不佳' },
    { name: 'NAC', nameEn: 'N-Acetylcysteine', dosage: '600-1800mg', form: '胶囊', timing: '空腹', level: 'optional', condition: '高雄激素/氧化应激' },
    { name: '小檗碱', nameEn: 'Berberine', dosage: '500mg tid', form: '盐酸小檗碱', timing: '餐前30分钟', level: 'optional', condition: '胰岛素抵抗明显（效果类似二甲双胍）' },
  ],
  diet: {
    principles: [
      { principle: '低GI饮食', detail: '选择低升糖指数碳水，每餐搭配蛋白质+健康脂肪减缓血糖上升' },
      { principle: '抗炎饮食', detail: '地中海饮食模式，减少精制碳水、加工食品和促炎 omega-6' },
      { principle: '稳定血糖', detail: '3餐+2小食，避免长时间空腹和血糖大幅波动' },
    ],
    foodsToEat: [
      { name: '全谷物（燕麦、藜麦）', reason: '低GI碳水、纤维稳定血糖' },
      { name: '绿叶蔬菜', reason: '镁、叶酸、抗氧化' },
      { name: '三文鱼/沙丁鱼', reason: 'Omega-3抗炎、维D' },
      { name: '坚果（核桃、杏仁）', reason: '健康脂肪+镁+稳定血糖' },
      { name: '豆类', reason: '植物蛋白、纤维、改善胰岛素敏感性' },
      { name: '肉桂', reason: '辅助改善胰岛素敏感性' },
    ],
    foodsToAvoid: [
      { name: '精制碳水', reason: '白米白面→血糖飙升→胰岛素飙升→雄激素升高' },
      { name: '添加糖/含糖饮料', reason: '加剧胰岛素抵抗' },
      { name: '乳制品（部分人）', reason: '部分PCOS女性对乳制品中IGF-1敏感→可能加重痤疮' },
    ],
  },
  lifestyle: [
    { category: '运动', recommendation: '力量训练+HIIT每周3-4次，增加肌肉量改善胰岛素敏感性', frequency: '3-4次/周' },
    { category: '体重管理', recommendation: '减重5-10%即可显著改善排卵和胰岛素抵抗', frequency: '目标导向' },
    { category: '睡眠', recommendation: '保证7-9小时睡眠，睡眠不足加剧胰岛素抵抗', frequency: '每晚' },
    { category: '压力管理', recommendation: '皮质醇升高加剧胰岛素抵抗，正念冥想每日10分钟', frequency: '每日' },
  ],
  monitoringPlan: ['空腹血糖+HbA1c每6个月', '25(OH)D+铁蛋白+性激素六项', 'OGTT（如备孕）'],
  warningSigns: ['月经>90天不来→子宫内膜增生风险', '严重痤疮+脱发→高雄未控→就医考虑抗雄药物'],
}

// ========== 5. IBS 人群 ==========
const ibsD: PopulationPlan = {
  id: 'ibs_d',
  name: 'IBS - 腹泻型（IBS-D）',
  category: 'ibs',
  categoryName: 'IBS',
  description: '以腹泻为主要表现的肠易激综合征，常与食物不耐受、肠道菌群失调、压力相关',
  keyRisks: ['营养素吸收不良', '电解质流失', '肠道菌群失衡', '食物恐惧症→营养不良'],
  supplements: [
    { name: '益生菌', nameEn: 'Probiotics', dosage: '100-400亿CFU', form: '多菌株（含乳酸杆菌+双歧杆菌）', timing: '空腹或睡前', level: 'core' },
    { name: '维生素D', nameEn: 'Vitamin D', dosage: '1000-2000IU', form: 'D3', timing: '随餐', level: 'core', drugInteraction: 'IBS患者维D缺乏率极高' },
    { name: '镁（柠檬酸镁除外）', nameEn: 'Magnesium', dosage: '200-300mg', form: '甘氨酸镁', timing: '睡前', level: 'core' },
    { name: '谷氨酰胺', nameEn: 'L-Glutamine', dosage: '5-10g', form: '粉末', timing: '空腹兑水', level: 'optional', condition: '肠道通透性/"肠漏"' },
    { name: '薄荷油肠溶胶囊', nameEn: 'Peppermint Oil', dosage: '0.2-0.4ml tid', form: '肠溶胶囊', timing: '餐前30分钟', level: 'optional', condition: '腹部绞痛' },
    { name: '消化酶', nameEn: 'Digestive Enzymes', dosage: '随餐服用', form: '广谱酶（含脂肪酶/蛋白酶/淀粉酶）', timing: '餐前', level: 'optional', condition: '餐后腹胀腹泻' },
  ],
  diet: {
    principles: [
      { principle: '低FODMAP饮食', detail: '严格阶段2-6周排除高FODMAP食物，然后逐步复食确定个人不耐受' },
      { principle: '可溶性纤维优先', detail: '燕麦、香蕉、胡萝卜、奇亚籽—可溶性纤维吸水形成凝胶，减缓肠道蠕动' },
      { principle: '避免肠道刺激物', detail: '咖啡因、酒精、辛辣食物、高脂食物、山梨糖醇等人工甜味剂' },
    ],
    foodsToEat: [
      { name: '白米饭/小米粥', reason: '易消化碳水，低FODMAP' },
      { name: '胡萝卜/南瓜', reason: '可溶性纤维，温和不刺激' },
      { name: '香蕉', reason: '可溶性纤维+钾（补电解质）' },
      { name: '去皮鸡胸肉', reason: '低脂优质蛋白' },
      { name: '燕麦（无麸质标记）', reason: '可溶性纤维，低FODMAP(<60g)' },
    ],
    foodsToAvoid: [
      { name: '不溶性纤维', reason: '麦麸、生蔬菜皮、坚果碎片→机械刺激肠道' },
      { name: '高FODMAP食物', reason: '洋葱、大蒜、小麦、豆类、苹果、奶—严格阶段全部避免' },
      { name: '咖啡/酒精', reason: '刺激肠道蠕动、增加肠道通透性' },
      { name: '高脂食物', reason: '油炸、奶油—刺激结肠收缩' },
    ],
  },
  lifestyle: [
    { category: '压力管理', recommendation: '脑肠轴是关键，CBT/IBS专门心理治疗或每日正念冥想', frequency: '每日10-20分钟' },
    { category: '饮食记录', recommendation: '记录饮食+症状日记，找出个人触发食物', frequency: '每日' },
    { category: '进食习惯', recommendation: '细嚼慢咽，每餐不超过7分饱，避免暴饮暴食', frequency: '每餐' },
  ],
  monitoringPlan: ['排除乳糜泻（血TTG-IgA）', '粪便钙卫蛋白排除IBD', '维生素B12+铁蛋白+25(OH)D'],
  warningSigns: ['夜间腹泻→需排除器质性肠病', '便血→立即就医', '不明原因体重下降→排除IBD/肿瘤'],
}

// ========== 6. 焦虑/抑郁人群 ==========
const anxietyDepression: PopulationPlan = {
  id: 'anxiety_depression',
  name: '轻度焦虑/抑郁',
  category: 'mental_health',
  categoryName: '心理健康',
  description: '营养支持作为辅助手段，不可替代专业心理咨询和药物治疗',
  keyRisks: ['Omega-3不足→情绪调节受损', 'B族维生素缺乏→神经递质合成受阻', '维生素D缺乏→与抑郁高度相关', '镁不足→焦虑加重'],
  supplements: [
    { name: 'Omega-3', nameEn: 'Omega-3', dosage: '1-2g EPA+DHA（EPA>DHA比例对情绪更优）', form: '高EPA鱼油', timing: '随餐', level: 'core' },
    { name: '维生素D', nameEn: 'Vitamin D', dosage: '2000-4000IU', form: 'D3', timing: '随含脂餐', level: 'core' },
    { name: '镁', nameEn: 'Magnesium', dosage: '300-400mg', form: '甘氨酸镁/苏糖酸镁', timing: '睡前', level: 'core' },
    { name: '复合B族', nameEn: 'B-Complex', dosage: 'B6/叶酸/B12活性形式', form: '甲基化B族', timing: '早晨随餐', level: 'core' },
    { name: '锌', nameEn: 'Zinc', dosage: '15-30mg', form: '甘氨酸锌', timing: '随餐', level: 'conditional', condition: '抑郁（低锌与抑郁关联）' },
    { name: '益生菌', nameEn: 'Probiotics', dosage: '100-400亿CFU', form: '含乳酸杆菌+双歧杆菌（精神益生菌株）', timing: '空腹', level: 'optional' },
  ],
  diet: {
    principles: [
      { principle: '抗炎饮食', detail: '高炎症水平与抑郁正相关，地中海饮食模式被证实降低抑郁风险' },
      { principle: '稳定血糖', detail: '血糖波动影响情绪，避免精制碳水和添加糖引起情绪过山车' },
      { principle: '肠道-大脑轴', detail: '增加发酵食品（酸奶、泡菜、康普茶）和益生元纤维喂养肠道菌群' },
    ],
    foodsToEat: [
      { name: '深海鱼（三文鱼、沙丁鱼）', reason: 'EPA/DHA—抗炎、支持神经细胞膜' },
      { name: '深绿色叶菜', reason: '叶酸、镁—神经递质合成必需' },
      { name: '发酵食品', reason: '益生菌支持脑肠轴' },
      { name: '核桃', reason: 'ALA Omega-3、镁、抗氧化' },
      { name: '黑巧克力(>70%)', reason: '镁、多酚、苯乙胺（提升情绪）' },
      { name: '牛油果', reason: '健康脂肪、B族、镁' },
    ],
    foodsToAvoid: [
      { name: '精制糖/添加糖', reason: '血糖过山车→情绪波动；高糖饮食与抑郁风险正相关' },
      { name: '酒精', reason: '中枢神经抑制剂，干扰睡眠和神经递质' },
      { name: '超加工食品', reason: '促炎、低营养密度' },
    ],
  },
  lifestyle: [
    { category: '运动', recommendation: '每周150分钟中等强度有氧运动，运动对轻度抑郁效果不亚于药物', frequency: '3-5次/周' },
    { category: '睡眠', recommendation: '固定入睡/起床时间，睡前一小时远离屏幕', frequency: '每晚7-9小时' },
    { category: '阳光', recommendation: '早晨户外30分钟，促进血清素分泌+调节昼夜节律', frequency: '每日' },
    { category: '社交', recommendation: '定期面对面社交连接，对抗孤独和隔离感', frequency: '每周2-3次' },
  ],
  monitoringPlan: ['PHQ-9/GAD-7每月自评', '25(OH)D+铁蛋白+维生素B12+叶酸+同型半胱氨酸', 'TSH（排除甲减→抑郁）'],
  warningSigns: ['自杀念头/自伤行为→紧急求助心理危机热线', '症状持续>2周且影响日常生活→就医', '惊恐发作（心率过速+呼吸困难+濒死感）→就医'],
}

// ========== 7. 桥本甲状腺炎 ==========
const hashimotoEuthyroid: PopulationPlan = {
  id: 'hashimoto_euthyroid',
  name: '桥本 - 功能正常期',
  category: 'hashimoto',
  categoryName: '桥本甲状腺炎',
  description: 'TPOAb/TgAb阳性但TSH正常，重点目标：降低抗体、抗炎、保护甲状腺',
  keyRisks: ['自身免疫攻击甲状腺', '硒缺乏→抗体升高', '维生素D缺乏→免疫紊乱', '进展为甲减（年约5%）'],
  supplements: [
    { name: '硒', nameEn: 'Selenium', dosage: '200μg', form: '硒代蛋氨酸', timing: '每日一次', level: 'core' },
    { name: '维生素D', nameEn: 'Vitamin D', dosage: '2000-4000IU', form: 'D3', timing: '随含脂餐', level: 'core' },
    { name: '肌醇', nameEn: 'Inositol', dosage: '600mg + 硒', form: 'Myo-肌醇', timing: '每日', level: 'optional', condition: '抗体高+TSH边缘升高' },
    { name: '锌', nameEn: 'Zinc', dosage: '15-30mg', form: '甘氨酸锌', timing: '随餐', level: 'core' },
    { name: '镁', nameEn: 'Magnesium', dosage: '300-400mg', form: '甘氨酸镁', timing: '睡前', level: 'core' },
    { name: '铁', nameEn: 'Iron', dosage: '根据铁蛋白决定', form: '甘氨酸铁', timing: '空腹+维C', level: 'conditional', condition: '铁蛋白<50μg/L' },
  ],
  diet: {
    principles: [
      { principle: '无麸质（值得尝试）', detail: '部分桥本患者对麸质敏感（分子模拟），严格无麸质3个月观察抗体变化' },
      { principle: '抗炎饮食', detail: 'AIP饮食（自身免疫原始饮食）/地中海饮食，消除加工食品' },
      { principle: '避免过量碘', detail: '桥本患者不建议额外补碘（除非碘缺乏），避免海带/紫菜等高碘食物集中摄入' },
    ],
    foodsToEat: [
      { name: '巴西坚果（1-2颗/日）', reason: '提供每日硒需求（每颗约70-90μg）' },
      { name: '三文鱼/沙丁鱼', reason: 'Omega-3抗炎+维D+硒' },
      { name: '深绿色叶菜', reason: '镁、抗氧化' },
      { name: '骨汤', reason: '甘氨酸+矿物质支持肠道修复' },
      { name: '发酵蔬菜', reason: '益生菌支持肠道免疫' },
    ],
    foodsToAvoid: [
      { name: '海带/紫菜大量摄入', reason: '高碘→可能刺激自身免疫攻击' },
      { name: '麸质（试行）', reason: '麸质+甲状腺组织存在分子模拟' },
      { name: '大豆（部分人）', reason: '大豆异黄酮可能影响甲状腺过氧化物酶，且干扰优甲乐吸收' },
      { name: '超加工食品', reason: '促炎→加重自身免疫' },
    ],
  },
  lifestyle: [
    { category: '压力管理', recommendation: '每日冥想/正念10-15分钟', frequency: '每日', note: '慢性压力→皮质醇↑→免疫紊乱→抗体↑' },
    { category: '睡眠', recommendation: '每晚7-9小时优质睡眠', frequency: '每晚', note: '免疫修复在深度睡眠中发生' },
    { category: '温和运动', recommendation: '优先低强度（瑜伽、散步、太极），避免HIIT等引发过度疲劳/炎症', frequency: '4-5次/周' },
  ],
  monitoringPlan: ['TSH+FT3+FT4+TPOAb+TgAb每6-12个月', '25(OH)D+铁蛋白+硒每6-12个月', '甲状腺超声每1-2年'],
  warningSigns: ['疲劳加重+体重增加+怕冷→进展为甲减→查TSH', '颈部肿块/吞咽困难→甲状腺结节→超声'],
}

const hashimotoHypothyroid: PopulationPlan = {
  ...hashimotoEuthyroid,
  id: 'hashimoto_hypothyroid',
  name: '桥本 - 临床甲减期（服优甲乐中）',
  category: 'hashimoto',
  categoryName: '桥本甲状腺炎',
  description: '已进展为甲减，正在服用左甲状腺素（优甲乐）。核心目标：优化药物吸收、管理残留症状',
  keyRisks: ['优甲乐吸收受干扰', '即使TSH正常仍可能有残留症状', '铁/维D//B12缺乏→疲劳加重'],
  supplements: hashimotoEuthyroid.supplements.map(s => {
    if (s.name === '硒') return { ...s, dosage: '200μg', drugInteraction: '与优甲乐间隔4小时' }
    if (s.name === '铁') return { ...s, drugInteraction: '与优甲乐间隔至少4小时' }
    if (s.name === '钙') return { ...s, drugInteraction: '与优甲乐间隔至少4小时' }
    return s
  }),
  diet: {
    ...hashimotoEuthyroid.diet,
    principles: [
      ...hashimotoEuthyroid.diet.principles,
      { principle: '优甲乐服用规则', detail: '清晨空腹，仅用白水送服，等待30-60分钟后进食/咖啡/其他药物' },
    ],
  },
}

// ========== 8. 糖尿病 ==========
const diabetesType2: PopulationPlan = {
  id: 'diabetes_type2',
  name: '2型糖尿病',
  category: 'diabetes',
  categoryName: '糖尿病',
  description: '核心是改善胰岛素敏感性和血糖控制，营养干预为一线治疗手段',
  keyRisks: ['血糖波动→血管损伤', '维生素D缺乏率高', '镁缺乏→加重胰岛素抵抗', 'B12缺乏（使用二甲双胍者）'],
  supplements: [
    { name: '维生素D', nameEn: 'Vitamin D', dosage: '2000-4000IU', form: 'D3', timing: '随含脂餐', level: 'core' },
    { name: '镁', nameEn: 'Magnesium', dosage: '300-400mg', form: '甘氨酸镁/柠檬酸镁', timing: '睡前', level: 'core' },
    { name: '维生素B12', nameEn: 'Vitamin B12', dosage: '500-1000μg', form: '甲钴胺', timing: '任意时间', level: 'core', condition: '使用二甲双胍≥1年者' },
    { name: '铬', nameEn: 'Chromium', dosage: '200-400μg', form: '吡啶酸铬', timing: '随餐', level: 'optional', condition: '血糖控制不佳' },
    { name: '小檗碱', nameEn: 'Berberine', dosage: '500mg tid', form: '盐酸小檗碱', timing: '餐前', level: 'optional', condition: '降糖效果可对标二甲双胍(需监测)' },
    { name: 'Omega-3', nameEn: 'Omega-3', dosage: '1-2g EPA+DHA', form: '鱼油', timing: '随餐', level: 'core' },
    { name: 'α-硫辛酸', nameEn: 'Alpha-Lipoic Acid', dosage: '600mg', form: 'R-ALA', timing: '空腹', level: 'optional', condition: '周围神经病变' },
  ],
  diet: {
    principles: [
      { principle: '碳水计数+低GI', detail: '掌握碳水计数法，每餐碳水控制在30-60g（个体化），优选低GI来源' },
      { principle: '进食顺序', detail: '蔬菜→蛋白质→碳水，可降低餐后血糖峰值40%' },
      { principle: '定时定量', detail: '不要跳过正餐，避免低血糖和暴饮暴食' },
      { principle: '高纤维', detail: '每日25-35g膳食纤维，可溶性纤维尤佳' },
    ],
    foodsToEat: [
      { name: '非淀粉蔬菜', reason: '零GI、高纤、丰富微量营养素—可任意吃' },
      { name: '豆类', reason: '低GI碳水+蛋白+纤维组合，改善血糖' },
      { name: '坚果', reason: '健康脂肪降低餐后血糖峰值' },
      { name: '肉桂', reason: '辅助改善胰岛素敏感性' },
      { name: '醋', reason: '餐前或随餐2勺醋→降低餐后血糖反应' },
    ],
    foodsToAvoid: [
      { name: '含糖饮料', reason: '液态糖→血糖瞬间飙升' },
      { name: '精白米面', reason: '高GI→血糖峰值' },
      { name: '果汁（即使是鲜榨）', reason: '去除纤维后=糖水' },
    ],
  },
  lifestyle: [
    { category: '运动', recommendation: '餐后15分钟散步即可显著降低餐后血糖，力量训练+有氧每周共150+分钟', frequency: '每日+3-5次/周' },
    { category: '血糖监测', recommendation: '空腹+餐后2小时，了解食物个体反应', frequency: '每日多次' },
    { category: '足部护理', recommendation: '每日检查足部，保持干燥，避免赤脚行走', frequency: '每日' },
  ],
  monitoringPlan: ['HbA1c每3-6个月', '空腹血糖+餐后血糖每日', '每年眼底+肾功能+足部检查', '每年查B12（用二甲双胍者）'],
  warningSigns: ['视力突然变化→眼底病变', '足部伤口不愈合→就医', '低血糖（颤抖、冷汗、意识模糊）→立即进食15g速效碳水'],
}

// ========== 9. 女性荷尔蒙周期 ==========
const menstrualCycle: PopulationPlan = {
  id: 'menstrual_cycle',
  name: '月经周期优化',
  category: 'menstrual',
  categoryName: '荷尔蒙周期',
  description: '基于月经周期各阶段调整营养和生活方式，优化荷尔蒙平衡',
  keyRisks: ['经期铁流失', 'PMS（黄体期）', '痛经', '黄体功能不全'],
  supplements: [
    { name: '铁', nameEn: 'Iron', dosage: '经期每日补充（根据经量）', form: '甘氨酸铁', timing: '空腹+维C', level: 'core', condition: '经量多或已确认缺乏' },
    { name: '镁', nameEn: 'Magnesium', dosage: '300-400mg', form: '甘氨酸镁', timing: '睡前', level: 'core' },
    { name: '维生素B6', nameEn: 'Vitamin B6', dosage: '50-100mg', form: 'P5P（活性B6）', timing: '黄体期每日', level: 'core', condition: 'PMS' },
    { name: 'Omega-3', nameEn: 'Omega-3', dosage: '1-2g', form: '鱼油', timing: '随餐', level: 'core', condition: '痛经/PMS' },
    { name: '锌', nameEn: 'Zinc', dosage: '15-30mg', form: '甘氨酸锌', timing: '排卵期前后', level: 'optional', condition: '支持排卵和黄体功能' },
    { name: '圣洁莓', nameEn: 'Vitex/Chasteberry', dosage: '200-400mg', form: '标准提取物', timing: '早晨空腹', level: 'optional', condition: '黄体功能不全/PMS/周期不规律' },
    { name: '月见草油', nameEn: 'Evening Primrose Oil', dosage: '1000-2000mg', form: '冷压油', timing: '黄体期', level: 'optional', condition: '乳房胀痛/经前不适' },
  ],
  diet: {
    principles: [
      { principle: '卵泡期（经后至排卵）', detail: '雌激素上升期，支持卵泡发育：高质量蛋白+抗氧化食物+锌、硒' },
      { principle: '黄体期（排卵后至经前）', detail: '孕酮主导期，支持情绪和血糖稳定：镁+B6+复合碳水+钙→缓解PMS' },
      { principle: '经期', detail: '补铁+抗炎：血红素铁+维C、姜黄/姜茶缓解痛经、温暖食物' },
    ],
    foodsToEat: [
      { name: '经期：红肉/动物肝脏', reason: '补充流失的铁' },
      { name: '经期：姜/姜黄', reason: '天然抗炎，实验证明有效缓解痛经' },
      { name: '黄体期：黑巧克力(>70%)', reason: '镁→改善情绪波动' },
      { name: '黄体期：南瓜籽', reason: '镁+锌→支持黄体功能和情绪' },
      { name: '黄体期：酸奶/发酵食品', reason: '钙+益生菌→改善PMS' },
      { name: '卵泡期：豆制品', reason: '植物雌激素温和调节' },
    ],
    foodsToAvoid: [
      { name: '黄体期：咖啡因', reason: '加重乳房胀痛和焦虑' },
      { name: '黄体期：高盐食物', reason: '加重水肿和腹胀' },
      { name: '经期：冷饮/冰食', reason: '可能加重痛经（中医角度：寒凝血瘀）' },
      { name: '精制糖', reason: '加剧激素波动和情绪过山车' },
    ],
  },
  lifestyle: [
    { category: '运动周期化', recommendation: '卵泡期：高强度训练；黄体期：温和运动（瑜伽/散步）；经期：听取身体信号', frequency: '按周期阶段调整' },
    { category: '周期记录', recommendation: '记录基础体温+症状+情绪，理解周期规律', frequency: '每日' },
    { category: '睡眠', recommendation: '黄体期体温升高可能影响入睡，创造凉爽睡眠环境', frequency: '黄体期特别关注' },
  ],
  monitoringPlan: ['性激素六项（周期第2-4天）', '铁蛋白+25(OH)D+TSH', '月经周期长度和经量变化'],
  warningSigns: ['月经>90天不来（非孕）→就医', '经量过多（>80ml/周期，如每1-2小时换卫生巾）→妇科检查', '经期剧痛影响生活→排查子宫内膜异位症'],
}

// ========== 10. 更年期 ==========
const menopause: PopulationPlan = {
  id: 'menopause',
  name: '更年期（围绝经期+绝经后期）',
  category: 'menopause',
  categoryName: '更年期',
  description: '雌激素下降带来一系列代谢和健康变化，营养支持至关重要',
  keyRisks: ['骨质流失加速→骨质疏松', '心血管风险上升', '代谢下降→体重增加/腹型肥胖', '潮热盗汗影响生活质量'],
  supplements: [
    { name: '钙', nameEn: 'Calcium', dosage: '1000-1200mg（饮食+补充剂总计）', form: '柠檬酸钙', timing: '分次随餐', level: 'core' },
    { name: '维生素D', nameEn: 'Vitamin D', dosage: '1000-2000IU', form: 'D3', timing: '随含脂餐', level: 'core' },
    { name: '维生素K2', nameEn: 'Vitamin K2', dosage: '90-180μg', form: 'MK-7', timing: '随含脂餐', level: 'core' },
    { name: '镁', nameEn: 'Magnesium', dosage: '300-400mg', form: '甘氨酸镁', timing: '睡前', level: 'core' },
    { name: 'Omega-3', nameEn: 'Omega-3', dosage: '1-2g EPA+DHA', form: '鱼油', timing: '随餐', level: 'core' },
    { name: '大豆异黄酮', nameEn: 'Soy Isoflavones', dosage: '50-100mg', form: '标准提取物', timing: '每日', level: 'optional', condition: '潮热（部分人有效）' },
    { name: '黑升麻', nameEn: 'Black Cohosh', dosage: '20-40mg', form: '标准提取物', timing: '每日', level: 'optional', condition: '潮热盗汗（短期使用6个月内）' },
    { name: '胶原蛋白肽', nameEn: 'Collagen Peptides', dosage: '5-10g', form: 'I+III型水解胶原', timing: '空腹', level: 'optional', condition: '皮肤/关节支持' },
  ],
  diet: {
    principles: [
      { principle: '钙+D3+K2三联', detail: '钙+D助吸收+K2引导钙入骨而非血管' },
      { principle: '植物雌激素', detail: '豆制品、亚麻籽、芝麻—含植物雌激素可温和缓解潮热' },
      { principle: '增加蛋白质', detail: '随年龄增长需更多蛋白质对抗肌少症，建议1.2-1.5g/kg体重' },
      { principle: '抗炎饮食', detail: '地中海饮食模式，降低心血管风险和炎症' },
      { principle: '警惕体重增加', detail: '基础代谢每10年下降约2-3%，需调整热量或增加活动量' },
    ],
    foodsToEat: [
      { name: '豆腐/豆制品', reason: '植物雌激素+钙+优质蛋白' },
      { name: '亚麻籽', reason: '木酚素（植物雌激素）+Omega-3 ALA+纤维' },
      { name: '三文鱼/沙丁鱼', reason: '维D+钙（连骨吃）+Omega-3抗炎' },
      { name: '深绿色叶菜', reason: '钙+镁+维K+抗氧化' },
      { name: '发酵乳制品', reason: '钙+益生菌+K2' },
      { name: '芝麻', reason: '钙含量高+植物雌激素' },
    ],
    foodsToAvoid: [
      { name: '酒精', reason: '触发潮热、增加乳腺癌风险、影响骨密度' },
      { name: '辛辣食物', reason: '部分人触发潮热' },
      { name: '咖啡因', reason: '加重潮热盗汗、影响钙平衡' },
      { name: '高盐食物', reason: '增加钙排泄、升高血压' },
    ],
  },
  lifestyle: [
    { category: '力量训练', recommendation: '每周2-3次力量训练对抗肌少症和骨质流失', frequency: '2-3次/周' },
    { category: '负重运动', recommendation: '快走、爬楼梯、跳舞—刺激骨重建', frequency: '每日30分钟' },
    { category: '盆底肌训练', recommendation: '凯格尔运动预防尿失禁和盆腔器官脱垂', frequency: '每日' },
    { category: '睡眠管理', recommendation: '穿吸汗睡衣、保持卧室凉爽（18-20℃）、分层被子', frequency: '每晚' },
  ],
  monitoringPlan: ['骨密度DEXA每1-2年（>65岁或高风险者）', '25(OH)D+血钙每年', '血脂+空腹血糖每年', '乳腺+宫颈+结肠癌筛查按指南'],
  warningSigns: ['骨折→骨质疏松严重→就医评估药物治疗', '异常阴道出血→排查妇科肿瘤', '严重潮热影响生活→评估HRT适应症'],
}

// ========== 11. 老年人 ==========
const elderlyGeneral: PopulationPlan = {
  id: 'elderly_general',
  name: '老年人（60-74岁）',
  category: 'elderly',
  categoryName: '老年人',
  description: '对抗肌少症、骨质疏松、认知下降和免疫功能减退',
  keyRisks: ['蛋白质不足→肌少症', '钙+维D不足→骨质疏松/骨折', 'B12吸收差', '锌缺乏→免疫下降', '脱水'],
  supplements: [
    { name: '维生素D', nameEn: 'Vitamin D', dosage: '800-2000IU', form: 'D3', timing: '随餐', level: 'core' },
    { name: '钙', nameEn: 'Calcium', dosage: '500-600mg（补充剂）+饮食', form: '柠檬酸钙', timing: '分次随餐', level: 'core' },
    { name: '维生素B12', nameEn: 'Vitamin B12', dosage: '500-1000μg', form: '甲钴胺（舌下含服吸收优）', timing: '任意时间', level: 'core' },
    { name: '蛋白质', nameEn: 'Protein Supplement', dosage: '每餐补充至25-30g（如饮食不足）', form: '乳清/植物蛋白', timing: '随餐', level: 'conditional' },
    { name: 'Omega-3', nameEn: 'Omega-3', dosage: '1-2g EPA+DHA', form: '鱼油', timing: '随餐', level: 'core' },
    { name: '镁', nameEn: 'Magnesium', dosage: '200-300mg', form: '甘氨酸镁', timing: '睡前', level: 'core' },
    { name: '锌', nameEn: 'Zinc', dosage: '10-15mg', form: '甘氨酸锌', timing: '随餐', level: 'conditional', condition: '食欲差/免疫功能低下' },
    { name: '辅酶Q10', nameEn: 'CoQ10', dosage: '100-200mg', form: '泛醇', timing: '随含脂餐', level: 'optional', condition: '服用他汀者' },
  ],
  diet: {
    principles: [
      { principle: '高蛋白每餐', detail: '每餐25-30g蛋白质对抗肌少症，老年人蛋白质合成效率下降需更高摄入' },
      { principle: '高营养密度', detail: '食欲下降时优先选择高营养密度食物，减少空热量零食' },
      { principle: '充足水分', detail: '口渴感知下降→定时饮水（1.5-2L/日），汤粥羹可补水' },
      { principle: '易咀嚼消化', detail: '肉末/肉泥/鱼/蛋/豆腐/酸奶等软质高蛋白食物' },
    ],
    foodsToEat: [
      { name: '鱼（连骨吃的小鱼）', reason: '蛋白+DHA+钙（连骨）' },
      { name: '鸡蛋', reason: '完全蛋白、胆碱（认知支持）、维D、易咀嚼' },
      { name: '酸奶/牛奶', reason: '钙+蛋白+益生菌' },
      { name: '豆腐/豆花', reason: '易消化植物蛋白+钙' },
      { name: '深色浆果', reason: '花青素抗氧化保护大脑' },
      { name: '坚果酱', reason: '健康脂肪+维E+易食用' },
    ],
    foodsToAvoid: [
      { name: '过咸食物', reason: '高血压风险+钙流失' },
      { name: '过硬食物', reason: '噎呛风险' },
      { name: '含糖饮料/点心', reason: '空热量替代营养密度食物' },
    ],
  },
  lifestyle: [
    { category: '力量训练', recommendation: '每周2-3次阻力训练对抗肌少症', frequency: '2-3次/周' },
    { category: '平衡训练', recommendation: '太极/单脚站立—降低跌倒风险', frequency: '每日' },
    { category: '认知活动', recommendation: '阅读、学习新技能、社交活动—维护认知储备', frequency: '每日' },
    { category: '社交', recommendation: '孤独增加痴呆风险，保持社交参与', frequency: '每周多次' },
  ],
  monitoringPlan: ['骨密度DEXA每2年', '25(OH)D+维生素B12+铁蛋白每年', '肾功能+电解质（补充剂使用者）', '年度老年综合评估'],
  warningSigns: ['跌倒→骨折→立即就医', '短期内体重下降>5%→排查原因', '认知功能快速下降→神经科评估'],
}

// ========== 12. 青少年 ==========
const adolescent: PopulationPlan = {
  id: 'adolescent',
  name: '青少年（10-19岁）',
  category: 'adolescent',
  categoryName: '青少年',
  description: '快速生长期，营养素需求为人生最高阶段之一',
  keyRisks: ['钙摄入不足→影响峰值骨量', '铁缺乏（尤其女孩月经初潮后）', '维生素D不足', '锌不足→影响发育', '含糖饮料占胃→营养素密度下降'],
  supplements: [
    { name: '维生素D', nameEn: 'Vitamin D', dosage: '600-1000IU', form: 'D3', timing: '随餐', level: 'core' },
    { name: '钙', nameEn: 'Calcium', dosage: '饮食优先，不足时300-500mg补充', form: '柠檬酸钙', timing: '随餐', level: 'conditional', condition: '不喝奶/奶制品摄入不足' },
    { name: '铁', nameEn: 'Iron', dosage: '女孩初潮后考虑补充', form: '甘氨酸铁', timing: '空腹+维C', level: 'conditional', condition: '月经量多或已确认缺乏' },
    { name: '锌', nameEn: 'Zinc', dosage: '5-10mg', form: '甘氨酸锌', timing: '随餐', level: 'conditional', condition: '食欲差/发育迟缓/偏食' },
    { name: 'Omega-3', nameEn: 'Omega-3', dosage: '250-500mg EPA+DHA', form: '鱼油', timing: '随餐', level: 'optional', condition: '学业压力大/注意力问题' },
  ],
  diet: {
    principles: [
      { principle: '三餐必须规律', detail: '不吃早餐影响认知功能和学习表现，每餐含优质蛋白+复合碳水+蔬果' },
      { principle: '钙来源多样化', detail: '奶制品/强化豆奶/豆腐/绿叶菜/芝麻—青春期决定一生峰值骨量' },
      { principle: '铁+维C搭配', detail: '女孩初潮后铁需求为同龄男孩的2倍，每餐搭配维C来源' },
    ],
    foodsToEat: [
      { name: '牛奶/强化豆奶', reason: '钙+维D+蛋白' },
      { name: '鸡蛋', reason: '完全蛋白+胆碱（认知支持）' },
      { name: '红肉（适量）', reason: '血红素铁+锌+B12' },
      { name: '深绿色叶菜', reason: '铁+钙+叶酸+维K' },
      { name: '坚果/种子', reason: '健康脂肪+锌+镁' },
    ],
    foodsToAvoid: [
      { name: '含糖饮料', reason: '空热量→肥胖+影响骨密度+替代有营养食物' },
      { name: '超加工零食', reason: '高钠高糖高反式→促炎+影响专注力' },
      { name: '能量饮料', reason: '高咖啡因+高糖→影响睡眠+心脏风险' },
    ],
  },
  lifestyle: [
    { category: '运动', recommendation: '每日至少60分钟中高强度运动，包括负重运动促进骨骼发育', frequency: '每日' },
    { category: '屏幕时间', recommendation: '娱乐屏幕时间<2小时/日', frequency: '每日限制' },
    { category: '睡眠', recommendation: '青少年需要8-10小时睡眠，睡前1小时远离屏幕', frequency: '每晚' },
  ],
  monitoringPlan: ['年度体检：身高+体重+BMI曲线', '女孩初潮后关注铁状态（血常规+铁蛋白）', '25(OH)D筛查'],
  warningSigns: ['身高增长停滞+体重不增→发育迟缓', '女孩>15岁未初潮→就医', '严重痤疮+月经不调→排查PCOS'],
}

// 导出所有人群方案
export const populationPlans: Record<string, PopulationPlan> = {
  pregnancy_general: pregnancyBase,
  pregnancy_preconception: pregnancyPreconception,
  pregnancy_t1: pregnancyFirstTri,
  pregnancy_t2: pregnancySecondTri,
  pregnancy_t3: pregnancyThirdTri,
  pregnancy_lactation: pregnancyLactation,
  vegetarian_strict: vegetarianStrict,
  vegetarian_lacto_ovo: vegetarianLactoOvo,
  fitness_bulking: fitnessBulking,
  fitness_cutting: fitnessCutting,
  pcos_insulin_resistant: pcosInsulinResistant,
  ibs_d: ibsD,
  anxiety_depression: anxietyDepression,
  hashimoto_euthyroid: hashimotoEuthyroid,
  hashimoto_hypothyroid: hashimotoHypothyroid,
  diabetes_type2: diabetesType2,
  menstrual_cycle: menstrualCycle,
  menopause: menopause,
  elderly_general: elderlyGeneral,
  adolescent: adolescent,
}

// 人群分类
export const populationCategories = [
  { key: 'pregnancy', name: '孕期/备孕', icon: 'baby', color: '#E85D3A' },
  { key: 'vegetarian', name: '素食人群', icon: 'leaf', color: '#2D9C6F' },
  { key: 'fitness', name: '健身人群', icon: 'dumbbell', color: '#1B2A4A' },
  { key: 'elderly', name: '老年人', icon: 'heart', color: '#D4A853' },
  { key: 'menopause', name: '更年期', icon: 'flame', color: '#C9717D' },
  { key: 'pcos', name: 'PCOS', icon: 'activity', color: '#8B5CF6' },
  { key: 'ibs', name: 'IBS', icon: 'stomach', color: '#6366F1' },
  { key: 'mental_health', name: '焦虑/抑郁', icon: 'brain', color: '#7C7BAD' },
  { key: 'diabetes', name: '糖尿病', icon: 'droplet', color: '#EF4444' },
  { key: 'hashimoto', name: '桥本甲状腺炎', icon: 'shield', color: '#F59E0B' },
  { key: 'menstrual', name: '月经周期', icon: 'moon', color: '#EC4899' },
  { key: 'adolescent', name: '青少年', icon: 'zap', color: '#10B981' },
]

export const populationPriority: Record<string, number> = {
  pregnancy: 10,
  diabetes: 9,
  hashimoto: 8,
  pcos: 7,
  ibs: 6,
  mental_health: 5,
  menopause: 4,
  elderly: 3,
  menstrual: 3,
  fitness: 2,
  vegetarian: 1,
  adolescent: 1,
}
