/**
 * 普通人群基线指导 — ARCHITECTURE.md 缺口 1
 *
 * 面向无明显健康问题的普通人群，按性别 × 年龄组分层，
 * 提供基于《中国居民膳食指南 2022》和《中国 DRIs 2023》的营养基线指导。
 *
 * 核心原则：饮食优先，补充剂仅在饮食无法满足时考虑。
 */

// ========== 类型定义 ==========

export interface DailyPortions {
  grains: [number, number]       // 谷薯类 g/天
  vegetables: [number, number]   // 蔬菜 g/天
  fruits: [number, number]       // 水果 g/天
  protein: [number, number]      // 畜禽鱼蛋 g/天
  dairy: [number, number]        // 奶及奶制品 g/天
  soyNuts: [number, number]      // 大豆坚果 g/天
  oils: [number, number]         // 烹调油 g/天
  salt: number                   // 盐 g/天 上限
  water: [number, number]        // 水 ml/天
}

export interface KeyNutrient {
  nutrient: string               // 营养素名
  rni: string                    // 推荐摄入量
  priorityFoods: string[]        // 优先食物来源
  whyImportant: string           // 为什么重要
}

export interface DietPrincipleItem {
  principle: string              // 原则
  detail: string                 // 具体做法
}

export interface GeneralBaseline {
  id: string
  gender: 'male' | 'female'
  ageGroup: string               // 年龄组标识
  ageLabel: string               // 年龄组显示名
  ageMin: number
  ageMax: number
  energyNeeds: {
    sedentary_kcal: number
    moderate_kcal: number
    active_kcal: number
  }
  macroDistribution: {
    carbsPercent: [number, number]
    proteinPercent: [number, number]
    fatPercent: [number, number]
  }
  dailyPortions: DailyPortions
  keyNutrients: KeyNutrient[]
  dietPrinciples: DietPrincipleItem[]
  supplementGuidance: string     // 补充剂立场
  lifestyleTips: string[]        // 生活方式建议
  bmiGuidance: string            // BMI 指导
}

// ========== 数据 ==========

const baselineTeenFemale: GeneralBaseline = {
  id: 'baseline_female_teen',
  gender: 'female',
  ageGroup: 'teen',
  ageLabel: '青少年女性 (10-19岁)',
  ageMin: 10,
  ageMax: 19,
  energyNeeds: {
    sedentary_kcal: 1800,
    moderate_kcal: 2100,
    active_kcal: 2400,
  },
  macroDistribution: {
    carbsPercent: [50, 65],
    proteinPercent: [12, 15],
    fatPercent: [20, 30],
  },
  dailyPortions: {
    grains: [250, 300],
    vegetables: [400, 500],
    fruits: [200, 350],
    protein: [120, 200],
    dairy: [300, 500],
    soyNuts: [15, 25],
    oils: [25, 30],
    salt: 5,
    water: [1200, 1500],
  },
  keyNutrients: [
    { nutrient: '铁', rni: '18 mg/天', priorityFoods: ['瘦红肉', '动物肝脏', '动物血', '黑木耳', '菠菜'], whyImportant: '月经开始后铁流失增加，青春期贫血高发' },
    { nutrient: '钙', rni: '1000 mg/天', priorityFoods: ['牛奶', '酸奶', '奶酪', '豆腐', '小油菜'], whyImportant: '青春期骨量峰值积累关键期，钙摄入不足影响终身骨健康' },
    { nutrient: '维生素 D', rni: '400-600 IU/天', priorityFoods: ['蛋黄', '三文鱼', '晒太阳 15-30 分钟/天'], whyImportant: '室内学习时间长，普遍日照不足' },
    { nutrient: '碘', rni: '120 μg/天', priorityFoods: ['加碘盐', '海带', '紫菜', '海鱼'], whyImportant: '甲状腺激素合成的必需元素，青春期需求增加' },
    { nutrient: '锌', rni: '8.5 mg/天', priorityFoods: ['牡蛎', '瘦牛肉', '南瓜子', '腰果'], whyImportant: '生长发育、免疫功能和皮肤健康的关键元素' },
    { nutrient: 'B 族维生素', rni: 'B1 1.2mg, B2 1.2mg, B6 1.2mg/天', priorityFoods: ['全谷物', '瘦肉', '蛋类', '豆类'], whyImportant: '能量代谢核心辅酶，学习压力大消耗增加' },
  ],
  dietPrinciples: [
    { principle: '三餐规律，早餐必吃', detail: '早餐占全天能量 25-30%，包含谷薯类 + 蛋白质 + 蔬果。不吃早餐会导致上午注意力下降和午餐暴食。' },
    { principle: '每天喝奶 300-500ml', detail: '奶类是钙的最佳来源。乳糖不耐受可选酸奶或零乳糖牛奶。' },
    { principle: '每周吃 1-2 次动物肝脏或血制品', detail: '每次 50g 左右，高效补铁。搭配富含维 C 的蔬果（番茄、青椒、柑橘）促进铁吸收。' },
    { principle: '主食至少一半是全谷物', detail: '燕麦、糙米、全麦面包、玉米、小米等，提供 B 族维生素和膳食纤维。' },
    { principle: '控制含糖饮料和零食', detail: '每日添加糖 <25g。含糖饮料是"空热量"的主要来源，且不利于钙平衡。' },
  ],
  supplementGuidance: '饮食优先。如饮食多样化且规律，无需常规补充剂。如有月经量过大或素食，建议检测铁蛋白后遵医嘱补充。秋冬季节日照不足可考虑维生素 D 400-600 IU/天。',
  lifestyleTips: [
    '每天户外活动 ≥ 60 分钟，其中至少 3 次有强度的运动',
    '保证 8-10 小时睡眠，规律作息',
    '限制屏幕时间 < 2 小时/天',
    '学习压力大时注意 B 族维生素摄入',
  ],
  bmiGuidance: 'BMI 正常范围 18.5-23.9。青春期不建议盲目节食减重，优先增加运动量和调整饮食结构。',
}

const baselineTeenMale: GeneralBaseline = {
  id: 'baseline_male_teen',
  gender: 'male',
  ageGroup: 'teen',
  ageLabel: '青少年男性 (10-19岁)',
  ageMin: 10,
  ageMax: 19,
  energyNeeds: {
    sedentary_kcal: 2200,
    moderate_kcal: 2600,
    active_kcal: 3000,
  },
  macroDistribution: {
    carbsPercent: [50, 65],
    proteinPercent: [12, 15],
    fatPercent: [20, 30],
  },
  dailyPortions: {
    grains: [300, 400],
    vegetables: [400, 500],
    fruits: [250, 400],
    protein: [150, 250],
    dairy: [300, 500],
    soyNuts: [15, 25],
    oils: [25, 30],
    salt: 5,
    water: [1500, 2000],
  },
  keyNutrients: [
    { nutrient: '蛋白质', rni: '60-75 g/天', priorityFoods: ['鸡胸肉', '鱼', '鸡蛋', '牛奶', '豆腐', '瘦牛肉'], whyImportant: '青春期肌肉和骨骼快速生长，蛋白质需求高于成年' },
    { nutrient: '钙', rni: '1000 mg/天', priorityFoods: ['牛奶', '酸奶', '奶酪', '芝麻酱', '豆腐'], whyImportant: '骨量峰值积累关键期，影响终身骨骼健康' },
    { nutrient: '锌', rni: '11 mg/天', priorityFoods: ['牡蛎', '瘦牛肉', '南瓜子', '花生'], whyImportant: '男性青春期锌需求高于女性，参与性发育和免疫功能' },
    { nutrient: '铁', rni: '12 mg/天', priorityFoods: ['瘦红肉', '动物肝脏', '黑木耳', '豆类'], whyImportant: '肌肉量增加伴随血容量增加，铁需求上升' },
    { nutrient: '维生素 D', rni: '400-600 IU/天', priorityFoods: ['蛋黄', '三文鱼', '晒太阳'], whyImportant: '钙吸收的必需辅助因子' },
    { nutrient: 'B 族维生素', rni: 'B1 1.4mg, B2 1.4mg, B6 1.3mg/天', priorityFoods: ['全谷物', '瘦肉', '蛋类', '豆类'], whyImportant: '高强度运动和学习消耗增加' },
  ],
  dietPrinciples: [
    { principle: '蛋白质要吃够', detail: '每餐都有优质蛋白来源（肉/鱼/蛋/豆）。运动后 30 分钟内补充蛋白质 + 碳水有助于肌肉恢复。' },
    { principle: '主食要足量', detail: '青春期能量需求高，不要盲目低碳水。选择全谷物为主，提供持久能量和 B 族维生素。' },
    { principle: '每天喝奶 + 补钙食物', detail: '每天 300-500ml 奶制品 + 豆制品 + 深绿色蔬菜，保证钙摄入。' },
    { principle: '运动前中后注意补水和能量', detail: '运动前 2 小时吃一顿含碳水的正餐，运动中每 15-20 分钟补水，运动后补充蛋白质+碳水。' },
    { principle: '减少加工食品和含糖饮料', detail: '加工肉制品（火腿、培根）和含糖饮料增加不必要的钠、糖和添加剂摄入。' },
  ],
  supplementGuidance: '饮食优先。均衡饮食通常不需要补充剂。高强度运动者可考虑运动后蛋白质补充（优先食物，其次蛋白粉）。秋冬日照不足可考虑维生素 D 400-600 IU/天。',
  lifestyleTips: [
    '每天运动 ≥ 60 分钟，鼓励力量训练和团队运动',
    '保证 8-10 小时睡眠',
    '避免盲目使用增肌补剂（尤其是含激素的产品）',
    '运动后补水至少 500-1000ml',
  ],
  bmiGuidance: 'BMI 正常范围 18.5-23.9。青春期增重是正常现象，BMI 轻微超标可先通过增加运动量和优化饮食结构调整。',
}

const baselineAdultFemale: GeneralBaseline = {
  id: 'baseline_female_adult',
  gender: 'female',
  ageGroup: 'adult',
  ageLabel: '育龄期女性 (20-49岁)',
  ageMin: 20,
  ageMax: 49,
  energyNeeds: {
    sedentary_kcal: 1800,
    moderate_kcal: 2100,
    active_kcal: 2400,
  },
  macroDistribution: {
    carbsPercent: [50, 65],
    proteinPercent: [10, 20],
    fatPercent: [20, 30],
  },
  dailyPortions: {
    grains: [250, 300],
    vegetables: [300, 500],
    fruits: [200, 350],
    protein: [120, 200],
    dairy: [300, 500],
    soyNuts: [25, 35],
    oils: [25, 30],
    salt: 5,
    water: [1500, 1700],
  },
  keyNutrients: [
    { nutrient: '铁', rni: '20 mg/天', priorityFoods: ['瘦红肉', '动物肝脏', '动物血', '黑木耳', '菠菜', '红枣'], whyImportant: '育龄女性月经铁流失，是最常见微量营养素缺乏。缺铁导致疲劳、注意力下降、免疫力降低。' },
    { nutrient: '叶酸', rni: '400 μg/天', priorityFoods: ['深绿色叶菜', '动物肝脏', '豆类', '芦笋', '牛油果'], whyImportant: '备孕期尤其重要，预防胎儿神经管畸形。所有育龄女性建议关注叶酸摄入。' },
    { nutrient: '钙', rni: '800 mg/天', priorityFoods: ['牛奶', '酸奶', '豆腐', '小油菜', '芝麻酱'], whyImportant: '30 岁后骨量开始下降，提前储备。乳糖不耐受可选酸奶或钙强化豆奶。' },
    { nutrient: '维生素 D', rni: '400-800 IU/天', priorityFoods: ['蛋黄', '三文鱼', '蘑菇(紫外线照射过的)', '强化奶'], whyImportant: '室内办公人群普遍缺乏，影响钙吸收和免疫功能。建议检测 25(OH)D 水平。' },
    { nutrient: '碘', rni: '120 μg/天', priorityFoods: ['加碘盐', '海带', '紫菜', '海鱼'], whyImportant: '甲状腺功能必需的微量元素，孕期需求增加到 230μg。建议使用加碘盐。' },
    { nutrient: 'Omega-3', rni: '250-500 mg EPA+DHA/天', priorityFoods: ['三文鱼', '鲭鱼', '沙丁鱼', '亚麻籽', '核桃', '奇亚籽'], whyImportant: '抗炎、心血管保护、情绪稳定。女性情绪障碍（PMS、产后抑郁）可能与此有关。' },
    { nutrient: '镁', rni: '330 mg/天', priorityFoods: ['深绿色叶菜', '南瓜子', '杏仁', '黑巧克力(>70%)', '全谷物'], whyImportant: '300+酵素反应的辅因子。经期偏头痛、PMS 情绪波动、肌肉紧张可能与低镁有关。' },
  ],
  dietPrinciples: [
    { principle: '每天 12 种、每周 25 种食物', detail: '早餐 3-4 种、午餐 4-5 种、晚餐 4-5 种、加餐 1-2 种。食物多样性是营养充足的基础保障。' },
    { principle: '每餐保证有"一巴掌蛋白"', detail: '女性每餐蛋白质约 20-30g（约一掌大小的鱼/鸡胸/豆腐）。蛋白质分布到三餐更有助于肌肉合成和饱腹感。' },
    { principle: '深色蔬菜占蔬菜总量一半', detail: '深绿色（菠菜/西兰花）、红橙色（番茄/胡萝卜）、紫色（紫甘蓝/茄子）轮换吃，覆盖不同植物化学物。' },
    { principle: '经期前后注意补铁', detail: '经期前 3 天至经期结束，增加红肉或动物肝脏 1-2 次，搭配维 C 丰富的食物。避免茶/咖啡与富铁食物同餐。' },
    { principle: '主食粗细搭配', detail: '精白米面占一半，另一半给全谷物和杂豆。全谷物提供 B 族维生素、膳食纤维和更平稳的血糖反应。' },
  ],
  supplementGuidance: '饮食优先。建议先通过优化饮食结构改善营养状况。以下情况可考虑补充剂：① 素食者 → B12 + 铁 + Omega-3；② 备孕 → 叶酸 400μg/天；③ 日照不足 → 维生素 D 800-2000 IU/天；④ 体检确认铁蛋白 < 30μg/L → 遵医嘱补铁。不建议自行组合多种补充剂。',
  lifestyleTips: [
    '每周 150 分钟中等强度有氧运动（快走/游泳/骑行）+ 2 次力量训练',
    '保证 7-9 小时睡眠',
    '每年体检关注：血常规、铁蛋白、25(OH)D、TSH',
    '管理压力：冥想、正念、社交 — 慢性压力消耗 B 族维生素和镁',
  ],
  bmiGuidance: 'BMI 正常范围 18.5-23.9。女性健康体重≠极端瘦，体脂率 21-33% 为正常。减重速度建议 0.5-1 kg/周，过快的减重会导致肌肉流失和月经紊乱。',
}

const baselineAdultMale: GeneralBaseline = {
  id: 'baseline_male_adult',
  gender: 'male',
  ageGroup: 'adult',
  ageLabel: '成年男性 (20-49岁)',
  ageMin: 20,
  ageMax: 49,
  energyNeeds: {
    sedentary_kcal: 2250,
    moderate_kcal: 2600,
    active_kcal: 3000,
  },
  macroDistribution: {
    carbsPercent: [50, 65],
    proteinPercent: [10, 20],
    fatPercent: [20, 30],
  },
  dailyPortions: {
    grains: [300, 400],
    vegetables: [300, 500],
    fruits: [200, 350],
    protein: [150, 250],
    dairy: [300, 500],
    soyNuts: [25, 35],
    oils: [25, 30],
    salt: 5,
    water: [1700, 2000],
  },
  keyNutrients: [
    { nutrient: '蛋白质', rni: '65 g/天', priorityFoods: ['鸡胸肉', '鱼', '瘦牛肉', '鸡蛋', '豆腐', '牛奶'], whyImportant: '维持肌肉量必需。成年男性肌肉量高于女性，蛋白质需求也相应更高。' },
    { nutrient: '锌', rni: '12.5 mg/天', priorityFoods: ['牡蛎', '牛肉', '南瓜子', '腰果'], whyImportant: '男性锌需求高于女性，参与睾酮合成、免疫和精子生成。锌缺乏可能导致性欲减退和免疫力下降。' },
    { nutrient: '硒', rni: '60 μg/天', priorityFoods: ['巴西坚果(1-2颗即够)', '金枪鱼', '鸡蛋', '蘑菇'], whyImportant: '强抗氧化剂，保护精子质量和甲状腺功能。' },
    { nutrient: '钾', rni: '2000 mg/天', priorityFoods: ['香蕉', '土豆', '菠菜', '牛油果', '豆类'], whyImportant: '中国男性钠摄入普遍偏高（盐+酱油+加工食品），钾有助于平衡钠，降低血压风险。' },
    { nutrient: '镁', rni: '350 mg/天', priorityFoods: ['南瓜子', '杏仁', '菠菜', '黑巧克力', '全谷物'], whyImportant: '运动人群容易流失。参与肌肉放松、能量代谢和睡眠调节。' },
    { nutrient: '维生素 D', rni: '400-800 IU/天', priorityFoods: ['蛋黄', '三文鱼', '晒太阳'], whyImportant: '室内工作男性普遍缺乏。与睾酮水平、免疫功能相关。' },
    { nutrient: 'Omega-3', rni: '250-500 mg EPA+DHA/天', priorityFoods: ['三文鱼', '鲭鱼', '沙丁鱼', '亚麻籽', '核桃'], whyImportant: '心血管保护，抗炎。男性心血管疾病发病率高于同龄女性。' },
  ],
  dietPrinciples: [
    { principle: '控盐是第一要务', detail: '中国男性日均盐摄入约 11g，是推荐量 5g 的两倍以上。减少酱油、蚝油、加工食品。用葱姜蒜、醋、香料替代部分盐调味。' },
    { principle: '蔬菜要足量', detail: '男性蔬菜摄入普遍低于推荐量。每天 300-500g 蔬菜，其中深色蔬菜占一半。' },
    { principle: '红肉适量，优选白肉和鱼肉', detail: '红肉每周 2-3 次，每次掌心大小。优先选择鱼、去皮禽肉和豆制品作为蛋白质来源。' },
    { principle: '减少酒精', detail: '中国男性饮酒率远高于女性。酒精是"空热量"，且影响睾酮水平、肝脏代谢和睡眠质量。建议男性每日酒精 ≤ 25g（约啤酒 750ml 或白酒 50ml）。' },
    { principle: '主食别太少', detail: '减重≠不吃主食。碳水化合物是大脑和肌肉的主要燃料。选择低 GI 的全谷物、薯类和豆类。' },
  ],
  supplementGuidance: '饮食优先。以下情况可考虑：① 日照不足 → 维生素 D 800-2000 IU/天；② 高强度运动 → 运动后蛋白质补充（食物优先，蛋白粉次之）；③ 素食 → B12 + 锌；④ 痛风/高尿酸 → 严格饮食管理，不建议自行补剂。不建议常规补充复合维生素 — 补充单一缺乏的营养素远优于复合制剂。',
  lifestyleTips: [
    '每周 150 分钟中等强度 + 2 次力量训练',
    '保证 7-9 小时睡眠',
    '管理压力：运动是男性最有效的减压方式',
    '定期体检关注：血压、血脂、尿酸、肝功能',
  ],
  bmiGuidance: 'BMI 正常范围 18.5-23.9。男性"啤酒肚"（内脏脂肪）比 BMI 更能预测健康风险。腰围建议 < 90cm（中国标准）。',
}

const baselineMiddleFemale: GeneralBaseline = {
  id: 'baseline_female_middle',
  gender: 'female',
  ageGroup: 'middle',
  ageLabel: '围绝经期/中年女性 (45-64岁)',
  ageMin: 45,
  ageMax: 64,
  energyNeeds: {
    sedentary_kcal: 1600,
    moderate_kcal: 1900,
    active_kcal: 2200,
  },
  macroDistribution: {
    carbsPercent: [45, 60],
    proteinPercent: [15, 25],
    fatPercent: [25, 35],
  },
  dailyPortions: {
    grains: [200, 250],
    vegetables: [400, 500],
    fruits: [200, 300],
    protein: [120, 200],
    dairy: [300, 500],
    soyNuts: [25, 35],
    oils: [20, 25],
    salt: 5,
    water: [1500, 1700],
  },
  keyNutrients: [
    { nutrient: '钙', rni: '800-1000 mg/天', priorityFoods: ['牛奶', '酸奶', '豆腐', '芝麻酱', '小油菜', '无花果干'], whyImportant: '雌激素下降加速骨流失。绝经后前 5 年骨量流失最快，此时补钙+维D至关重要。' },
    { nutrient: '维生素 D', rni: '800-1200 IU/天', priorityFoods: ['三文鱼', '蛋黄', '晒太阳 + D3 补充剂'], whyImportant: '更年期后维生素 D 需求翻倍。皮肤合成能力下降，补充 D3 是最具成本效益的干预。' },
    { nutrient: '蛋白质', rni: '55-65 g/天 (建议 1.2g/kg)', priorityFoods: ['鱼', '鸡胸肉', '鸡蛋', '豆腐', '希腊酸奶'], whyImportant: '更年期后蛋白质合成效率下降，需要更高摄入量维持肌肉。建议每公斤体重 1.2g。' },
    { nutrient: 'Omega-3', rni: '500-1000 mg EPA+DHA/天', priorityFoods: ['三文鱼', '鲭鱼', '沙丁鱼', '核桃', '奇亚籽'], whyImportant: '抗炎，可能缓解关节疼痛和潮热。更年期炎症水平往往升高。' },
    { nutrient: '镁', rni: '330 mg/天', priorityFoods: ['南瓜子', '杏仁', '菠菜', '黑巧克力', '牛油果'], whyImportant: '改善睡眠、情绪稳定和肌肉紧张。更年期失眠和焦虑可能与低镁有关。' },
    { nutrient: '维生素 B12', rni: '2.4 μg/天', priorityFoods: ['蛤蜊', '动物肝脏', '鱼', '蛋类', '奶制品'], whyImportant: '年龄增长 B12 吸收率下降。长期服用抑酸药（PPI）者 B12 缺乏风险增高。' },
    { nutrient: '大豆异黄酮', rni: '60-100 mg/天', priorityFoods: ['豆腐', '豆浆', '毛豆', '味噌'], whyImportant: '植物雌激素，可能缓解潮热盗汗等症状。亚洲女性更年期症状低于西方，传统大豆摄入可能是保护因素。' },
  ],
  dietPrinciples: [
    { principle: '蛋白质每餐 25-30g', detail: '更年期后每餐蛋白质摄入要足量（25-30g/餐），均匀分配在三餐中，对抗肌肉流失。早餐尤其不要忽视蛋白质。' },
    { principle: '主食适当减少，但不要不吃', detail: '基础代谢率下降约 100-200 kcal/天，可适当减少精制碳水，但全谷物和薯类仍然是膳食纤维和 B 族维生素的重要来源。' },
    { principle: '增加大豆制品', detail: '每天一杯豆浆（250ml）+ 一块豆腐（100g），或毛豆/豆腐干/味噌。大豆异黄酮是亚洲饮食的独特优势。' },
    { principle: '多摄入抗炎食物', detail: '彩色蔬果、深海鱼、坚果、橄榄油、姜黄、生姜。减少精制碳水、加工食品和油炸食品。' },
    { principle: '关注骨骼营养', detail: '每天 300-500ml 钙来源 + 维生素 D + 负重运动 = 骨健康的"铁三角"。' },
  ],
  supplementGuidance: '建议检测后精准补充：① 维生素 D：建议检测 25(OH)D，理想水平 50-75 nmol/L；② 钙：先计算饮食钙摄入（日均 500-800mg 常见），不足部分补充，总量不超过 1200mg/天；③ 镁：如睡眠差或肌肉紧张可考虑 200-400mg/天甘氨酸镁；④ 大豆异黄酮：优先食补，其次考虑标准化提取物。不建议自行使用激素替代疗法或高风险草本。',
  lifestyleTips: [
    '负重运动和阻力训练对抗骨流失和肌肉流失，每周至少 2-3 次',
    '睡眠：更年期失眠常见，建立规律作息，睡前避免蓝光和酒精',
    '压力管理：正念冥想、瑜伽、太极 — 研究显示对潮热有改善',
    '每年体检：25(OH)D、骨密度(DEXA)、血脂全套、血糖',
  ],
  bmiGuidance: 'BMI 正常范围 18.5-23.9。更年期体重增加是常见现象（年均增重约 0.5kg），主要通过增加蛋白质摄入和力量训练维持肌肉量，而非单纯节食。',
}

const baselineMiddleMale: GeneralBaseline = {
  id: 'baseline_male_middle',
  gender: 'male',
  ageGroup: 'middle',
  ageLabel: '中年男性 (45-64岁)',
  ageMin: 45,
  ageMax: 64,
  energyNeeds: {
    sedentary_kcal: 2100,
    moderate_kcal: 2450,
    active_kcal: 2800,
  },
  macroDistribution: {
    carbsPercent: [45, 60],
    proteinPercent: [15, 25],
    fatPercent: [25, 35],
  },
  dailyPortions: {
    grains: [250, 300],
    vegetables: [400, 500],
    fruits: [200, 350],
    protein: [150, 250],
    dairy: [300, 500],
    soyNuts: [25, 35],
    oils: [20, 25],
    salt: 5,
    water: [1700, 2000],
  },
  keyNutrients: [
    { nutrient: '蛋白质', rni: '65 g/天 (建议 1.2g/kg)', priorityFoods: ['鱼', '鸡胸肉', '鸡蛋', '豆腐', '希腊酸奶'], whyImportant: '45 岁后肌肉量年均流失 1%。高蛋白摄入 + 力量训练是保持肌肉的关键组合。' },
    { nutrient: '钾', rni: '2000 mg/天', priorityFoods: ['香蕉', '土豆', '菠菜', '牛油果', '番茄'], whyImportant: '对抗高钠饮食导致的血压升高。中国男性中年高血压患病率快速上升。' },
    { nutrient: 'Omega-3', rni: '500-1000 mg EPA+DHA/天', priorityFoods: ['三文鱼', '鲭鱼', '沙丁鱼', '核桃', '奇亚籽'], whyImportant: '心血管保护，降低甘油三酯。45 岁后心血管风险显著增加。' },
    { nutrient: '镁', rni: '350 mg/天', priorityFoods: ['南瓜子', '杏仁', '菠菜', '黑巧克力', '全谷物'], whyImportant: '有利血压控制和睡眠质量。中国男性饮食中镁摄入普遍低于推荐量。' },
    { nutrient: '维生素 D', rni: '800-1200 IU/天', priorityFoods: ['三文鱼', '蛋黄', '晒太阳 + D3'], whyImportant: '与睾酮水平、心血管健康和免疫功能相关。中年男性普遍缺乏。' },
    { nutrient: '番茄红素', rni: '无正式 RNI，建议每日摄入', priorityFoods: ['番茄(煮熟)', '西瓜', '粉红葡萄柚'], whyImportant: '流行病学研究显示与前列腺健康相关。烹饪后吸收率提高。' },
  ],
  dietPrinciples: [
    { principle: '严格控盐控油', detail: '中年是血压/血脂/尿酸分水岭。家庭烹饪用盐 ≤ 5g/天，烹调油 ≤ 25g/天。减少红烧、油炸，增加蒸煮凉拌。' },
    { principle: '红肉减量，增加鱼类和豆类', detail: '红肉每周 1-2 次即可，每次不超过掌心大小。深海鱼每周 2 次，豆制品每天都有。' },
    { principle: '减少酒精，最好戒酒', detail: '酒精与高血压、高尿酸、脂肪肝、消化道肿瘤均相关。即使少量饮酒也不存在"安全阈值"。' },
    { principle: '关注植物化学物', detail: '番茄（番茄红素）、绿茶（儿茶素）、大蒜（大蒜素）、彩色蔬果（多酚）— 这些非必需营养素对中年男性有特殊保护作用。' },
    { principle: '维持肌肉 = 维持代谢', detail: '每公斤体重 1.2g 蛋白质 + 每周 2-3 次力量训练。肌肉是中年最保值的"资产"——它决定了你的基础代谢率和胰岛素敏感性。' },
  ],
  supplementGuidance: '优先饮食调整和规律体检。以下可考虑：① 维生素 D：建议检测后按需补充；② Omega-3：如不吃深海鱼可考虑鱼油补充 1g/天；③ 辅酶 Q10：如服用他汀类药物可考虑（他汀消耗辅酶 Q10）；④ 不推荐常规"壮阳"或"补肾"类保健品。',
  lifestyleTips: [
    '力量训练对抗肌肉流失和睾酮下降，每周 2-3 次',
    '有氧运动 150 分钟/周 + 监测血压',
    '管理压力：中年男性是心理危机高发人群，运动 + 社交是有效缓冲',
    '年度体检必查：血压、血脂全套、空腹血糖+HbA1c、尿酸、肝功能、PSA(50岁+)',
  ],
  bmiGuidance: 'BMI 正常范围 18.5-23.9。腰围是更关键的指标：男性腰围应 < 90cm（中国标准）。"向心性肥胖"（肚子大）是代谢综合征的核心特征。',
}

const baselineElderlyFemale: GeneralBaseline = {
  id: 'baseline_female_elderly',
  gender: 'female',
  ageGroup: 'elderly',
  ageLabel: '老年女性 (65岁+)',
  ageMin: 65,
  ageMax: 120,
  energyNeeds: {
    sedentary_kcal: 1500,
    moderate_kcal: 1800,
    active_kcal: 2100,
  },
  macroDistribution: {
    carbsPercent: [50, 60],
    proteinPercent: [15, 25],
    fatPercent: [20, 30],
  },
  dailyPortions: {
    grains: [200, 250],
    vegetables: [300, 400],
    fruits: [200, 300],
    protein: [120, 200],
    dairy: [300, 500],
    soyNuts: [25, 30],
    oils: [20, 25],
    salt: 5,
    water: [1500, 1700],
  },
  keyNutrients: [
    { nutrient: '蛋白质', rni: '55 g/天 (建议 1.2-1.5g/kg)', priorityFoods: ['鱼', '鸡蛋', '豆腐', '酸奶', '鸡肉'], whyImportant: '老年人蛋白质利用率下降（合成代谢抵抗），需更高剂量才能达到与年轻人相同的肌肉合成效果。预防肌少症。' },
    { nutrient: '钙 + 维生素 D', rni: '钙 1000 mg + D 800-1200 IU/天', priorityFoods: ['牛奶', '酸奶', '小鱼干', '豆腐', '维生素 D3 补充剂'], whyImportant: '骨质疏松和跌倒骨折是老年女性最大健康威胁之一。钙+D是预防的基石。' },
    { nutrient: '维生素 B12', rni: '2.4 μg/天 (可能需要更高)', priorityFoods: ['蛤蜊', '鱼', '蛋', 'B12 强化食品', '如胃酸低考虑补充剂'], whyImportant: '萎缩性胃炎导致 B12 吸收率大幅下降。B12 缺乏可表现为认知下降、贫血、乏力 — 容易被误认为是"老了"。' },
    { nutrient: '膳食纤维 + 水分', rni: '纤维 25g + 水 1.5-1.7L/天', priorityFoods: ['全谷物', '蔬菜', '水果', '豆类', '洋车前子壳'], whyImportant: '老年便秘常见。纤维+充足水分+适度活动是核心解决方案。' },
    { nutrient: '钾', rni: '2000 mg/天', priorityFoods: ['香蕉', '土豆', '菠菜', '豆类', '牛油果'], whyImportant: '帮助控制血压。老年人钠敏感性增加，钾摄入充足可部分抵消钠的升压效应。' },
    { nutrient: 'Omega-3', rni: '500-1000 mg EPA+DHA/天', priorityFoods: ['三文鱼', '鲭鱼', '核桃', '亚麻籽'], whyImportant: '抗炎，可能延缓认知衰退。地中海饮食对阿尔茨海默风险的保护已被多项研究支持。' },
  ],
  dietPrinciples: [
    { principle: '蛋白质要"吃够"，不要"清淡"', detail: '老年人最普遍的营养问题是蛋白质摄入不足。每餐都要有明确的蛋白质来源。选择软嫩易咀嚼的蛋白质：鱼肉、豆腐、鸡蛋、酸奶。' },
    { principle: '食物要软、要细、要香', detail: '牙齿不好、味觉下降是老年人进食减少的主因。食物切成小块、烹煮软烂、善用天然香料（葱姜蒜、香菇、番茄）提味。' },
    { principle: '少食多餐', detail: '每天 5-6 餐（3 正餐 + 2-3 次加餐），每餐量少但营养密度高。加餐可选酸奶、坚果粉、水果泥、鸡蛋羹。' },
    { principle: '关注维生素 D 和 B12', detail: '室内时间长 + 皮肤合成能力下降 = 维生素 D 几乎必然不足，建议补充。B12 也建议检测，尤其长期服抑酸药者。' },
    { principle: '维持肌肉就是维持独立生活能力', detail: '肌少症 = 跌倒风险 ↑ + 住院风险 ↑ + 死亡率 ↑。蛋白质 + 维生素 D + 抗阻运动是预防和治疗的核心策略。' },
  ],
  supplementGuidance: '老年人补充剂使用应更加审慎（肝肾代谢功能下降）。强烈建议在医生指导下使用：① 维生素 D 800-2000 IU/天（几乎人人需要）；② 钙：如饮食摄入不足考虑补充，总量 ≤ 1200mg/天；③ B12：检测后按需补充；④ 蛋白质补充：如进食困难可考虑乳清蛋白或大豆蛋白粉（每天 15-25g 额外补充）。',
  lifestyleTips: [
    '抗阻训练：弹力带、自重训练、轻哑铃 — 每周 2-3 次，每个动作 8-12 次',
    '平衡训练：太极、单腿站立 — 降低跌倒风险',
    '保持社交：独居和社交隔离是营养不良的危险因素',
    '定期检查和药物审核：有些药物（抑酸药、利尿剂、他汀）长期服用可能影响营养素吸收',
  ],
  bmiGuidance: '老年人 BMI 的理想范围略有不同：建议 20-26.9。"微胖"对老年人可能更有保护作用（能量储备）。BMI < 20 应警惕营养不良。',
}

const baselineElderlyMale: GeneralBaseline = {
  id: 'baseline_male_elderly',
  gender: 'male',
  ageGroup: 'elderly',
  ageLabel: '老年男性 (65岁+)',
  ageMin: 65,
  ageMax: 120,
  energyNeeds: {
    sedentary_kcal: 1900,
    moderate_kcal: 2200,
    active_kcal: 2500,
  },
  macroDistribution: {
    carbsPercent: [50, 60],
    proteinPercent: [15, 25],
    fatPercent: [20, 30],
  },
  dailyPortions: {
    grains: [250, 300],
    vegetables: [300, 400],
    fruits: [200, 300],
    protein: [120, 200],
    dairy: [300, 500],
    soyNuts: [25, 30],
    oils: [20, 25],
    salt: 5,
    water: [1700, 2000],
  },
  keyNutrients: [
    { nutrient: '蛋白质', rni: '65 g/天 (建议 1.2-1.5g/kg)', priorityFoods: ['鱼', '鸡蛋', '豆腐', '鸡胸肉', '酸奶'], whyImportant: '老年男性肌少症患病率高，蛋白质摄入不足是核心原因。优质蛋白每餐 25-30g。' },
    { nutrient: '维生素 D', rni: '800-2000 IU/天', priorityFoods: ['D3 补充剂', '三文鱼', '蛋黄'], whyImportant: '与肌肉力量、免疫、骨骼健康密切相关。老年男性普遍严重缺乏。' },
    { nutrient: '锌', rni: '12.5 mg/天', priorityFoods: ['牡蛎', '牛肉', '南瓜子'], whyImportant: '味觉减退可能导致进食减少，而锌缺乏会进一步加重味觉下降。前列腺健康和免疫功能也依赖锌。' },
    { nutrient: '维生素 B12', rni: '2.4 μg/天', priorityFoods: ['鱼', '蛋', '奶', 'B12 强化食品'], whyImportant: '老年男性 B12 缺乏常见，表现为乏力、神经病变和认知下降。' },
    { nutrient: '钾', rni: '2000 mg/天', priorityFoods: ['香蕉', '土豆', '番茄', '豆类'], whyImportant: '对抗高钠饮食，辅助血压控制。' },
  ],
  dietPrinciples: [
    { principle: '蛋白质不要"省"', detail: '传统观念中老年人常以"清淡"为名少吃肉蛋奶 — 这是对健康最大的误解。每天至少 65g 蛋白质，均匀分布在三餐中。' },
    { principle: '控盐但不要"无味"', detail: '使用香草、香料、柠檬汁、醋、番茄等天然调味品替代盐和酱油。定期测量血压调整盐摄入策略。' },
    { principle: '关注咀嚼和吞咽能力', detail: '如牙齿不好，选择软嫩食材和烹饪方式：鱼肉、碎肉、豆腐、蒸蛋羹、蔬菜泥、水果泥。必要时考虑营养补充饮品。' },
    { principle: '保持体重 = 保持健康', detail: '老年人体重无故下降是重要的健康警示。定期称体重，如 6 个月内下降 > 5% 应就医。' },
  ],
  supplementGuidance: '建议检测后补充：① 维生素 D 800-2000 IU/天（必需）；② B12：检测后遵医嘱；③ 锌：如味觉下降可考虑 15-30mg/天；④ 蛋白质补充：进食不足时使用蛋白质补充剂。',
  lifestyleTips: [
    '力量训练维持肌肉和骨密度，优先安全的方式',
    '定期参与社交活动，独居和社交隔离增加营养不良风险',
    '年度体检 + 药物审核：关注药物对营养吸收的长期影响',
    '预防跌倒：家居防滑、合理照明、拐杖/助步器不丢人',
  ],
  bmiGuidance: '老年男性 BMI 建议 20-26.9。"微胖"有一定保护作用。BMI < 20 需警惕肌少症和营养不良。',
}

// ========== 导出 ==========

/** 所有基线配置 */
export const generalBaselines: GeneralBaseline[] = [
  baselineTeenFemale,
  baselineTeenMale,
  baselineAdultFemale,
  baselineAdultMale,
  baselineMiddleFemale,
  baselineMiddleMale,
  baselineElderlyFemale,
  baselineElderlyMale,
]

/**
 * 根据性别和年龄获取普通人群基线指导
 */
export function getBaseline(gender: 'male' | 'female', age: number): GeneralBaseline | null {
  const configs = generalBaselines.filter(b => b.gender === gender)
  return configs.find(b => age >= b.ageMin && age <= b.ageMax) || null
}
