// 营养素核心信息库 - 基于中国居民膳食营养素参考摄入量（2023版）
// 所有推荐摄入量为一般成年人（18-49岁，非孕期/哺乳期）参考值

export interface Nutrient {
  id: string
  name: string
  nameEn: string
  category: 'vitamin' | 'mineral' | 'fatty_acid' | 'fiber' | 'macronutrient'
  mainFunction: string
  cycleType: 'daily' | 'periodic' | 'as_needed'
  atRiskGroups: string[]
  rni: { male: string; female: string; unit: string }
  ul: string
  overdoseRisk: string
  sources: string[]
  specialNotes?: string
}

export const nutrients: Nutrient[] = [
  {
    id: 'vitamin_a',
    name: '维生素A',
    nameEn: 'Vitamin A',
    category: 'vitamin',
    mainFunction: '维持视力、皮肤黏膜完整、免疫功能',
    cycleType: 'daily',
    atRiskGroups: ['孕妇', '哺乳期', '儿童', '夜盲症', '长期腹泻者'],
    rni: { male: '800μg RAE', female: '700μg RAE', unit: 'μg RAE' },
    ul: '3000μg RAE',
    overdoseRisk: '肝损伤、骨质疏松、胎儿畸形',
    sources: ['动物肝脏', '蛋黄', '深绿色叶菜', '胡萝卜', '南瓜'],
    specialNotes: '一般不缺，避免长期高剂量补充'
  },
  {
    id: 'vitamin_c',
    name: '维生素C',
    nameEn: 'Vitamin C',
    category: 'vitamin',
    mainFunction: '抗氧化、促进胶原合成、增强免疫',
    cycleType: 'daily',
    atRiskGroups: ['吸烟者', '压力大', '术后', '易感染人群'],
    rni: { male: '100mg', female: '100mg', unit: 'mg' },
    ul: '2000mg',
    overdoseRisk: '腹泻、肾结石（长期大剂量）',
    sources: ['猕猴桃', '柑橘', '草莓', '青椒', '西兰花']
  },
  {
    id: 'vitamin_d',
    name: '维生素D',
    nameEn: 'Vitamin D',
    category: 'vitamin',
    mainFunction: '促进钙吸收、骨骼健康、免疫调节',
    cycleType: 'daily',
    atRiskGroups: ['婴幼儿', '老年人', '孕妇', '深色皮肤', '长期室内工作', '肥胖者'],
    rni: { male: '10μg(400IU)', female: '10μg(400IU)', unit: 'μg' },
    ul: '50μg(2000IU)',
    overdoseRisk: '高钙血症、肾钙化',
    sources: ['阳光照射', '深海鱼', '蛋黄', '强化奶', '蘑菇（晒过）'],
    specialNotes: '缺乏极其普遍，建议检测25(OH)D水平'
  },
  {
    id: 'vitamin_e',
    name: '维生素E',
    nameEn: 'Vitamin E',
    category: 'vitamin',
    mainFunction: '抗氧化、保护细胞膜',
    cycleType: 'daily',
    atRiskGroups: ['脂肪吸收不良', '早产儿', '高脂血症'],
    rni: { male: '14mg α-TE', female: '14mg α-TE', unit: 'mg α-TE' },
    ul: '700mg α-TE',
    overdoseRisk: '出血倾向（抗凝血）',
    sources: ['坚果', '种子', '植物油', '牛油果', '菠菜']
  },
  {
    id: 'vitamin_k',
    name: '维生素K',
    nameEn: 'Vitamin K',
    category: 'vitamin',
    mainFunction: '凝血、骨骼代谢',
    cycleType: 'daily',
    atRiskGroups: ['新生儿', '长期使用抗生素', '肝病', '吸收障碍者'],
    rni: { male: '80μg', female: '80μg', unit: 'μg' },
    ul: '未确定',
    overdoseRisk: '大剂量合成K3可致溶血',
    sources: ['深绿色叶菜', '纳豆', '西兰花', '菜籽油']
  },
  {
    id: 'vitamin_b1',
    name: '维生素B1',
    nameEn: 'Vitamin B1 (Thiamine)',
    category: 'vitamin',
    mainFunction: '能量代谢、神经功能',
    cycleType: 'daily',
    atRiskGroups: ['酗酒者', '甲亢', '长期吃精白米面', '孕妇'],
    rni: { male: '1.4mg', female: '1.2mg', unit: 'mg' },
    ul: '未确定',
    overdoseRisk: '罕见，过量排出',
    sources: ['全谷物', '豆类', '瘦肉', '坚果', '酵母']
  },
  {
    id: 'vitamin_b2',
    name: '维生素B2',
    nameEn: 'Vitamin B2 (Riboflavin)',
    category: 'vitamin',
    mainFunction: '能量代谢、黏膜健康',
    cycleType: 'daily',
    atRiskGroups: ['素食者', '孕妇', '偏食儿童'],
    rni: { male: '1.4mg', female: '1.2mg', unit: 'mg' },
    ul: '未确定',
    overdoseRisk: '尿黄（无害）',
    sources: ['奶制品', '蛋', '瘦肉', '绿叶蔬菜', '豆类']
  },
  {
    id: 'vitamin_b3',
    name: '维生素B3（烟酸）',
    nameEn: 'Vitamin B3 (Niacin)',
    category: 'vitamin',
    mainFunction: '能量代谢、皮肤神经健康',
    cycleType: 'daily',
    atRiskGroups: ['糙皮病', '腹泻', '酗酒者'],
    rni: { male: '15mg', female: '12mg', unit: 'mg' },
    ul: '35mg',
    overdoseRisk: '皮肤潮红、肝损伤',
    sources: ['禽肉', '鱼', '花生', '全谷物', '蘑菇']
  },
  {
    id: 'vitamin_b6',
    name: '维生素B6',
    nameEn: 'Vitamin B6',
    category: 'vitamin',
    mainFunction: '氨基酸代谢、神经递质合成、造血',
    cycleType: 'daily',
    atRiskGroups: ['孕妇', '口服避孕药者', '异烟肼使用者'],
    rni: { male: '1.4mg', female: '1.4mg', unit: 'mg' },
    ul: '60mg',
    overdoseRisk: '神经毒性（可逆）',
    sources: ['禽肉', '鱼', '土豆', '香蕉', '鹰嘴豆'],
    specialNotes: '可缓解孕吐，B6+镁协同'
  },
  {
    id: 'vitamin_b12',
    name: '维生素B12',
    nameEn: 'Vitamin B12',
    category: 'vitamin',
    mainFunction: '造血、神经鞘形成',
    cycleType: 'daily',
    atRiskGroups: ['严格素食者', '老年人（吸收差）', '胃切除者'],
    rni: { male: '2.4μg', female: '2.4μg', unit: 'μg' },
    ul: '未确定',
    overdoseRisk: '极低毒性',
    sources: ['动物肝脏', '鱼', '蛋', '奶', '强化食品'],
    specialNotes: '仅存在于动物性食物，素食者必须补充'
  },
  {
    id: 'folate',
    name: '叶酸',
    nameEn: 'Folate (B9)',
    category: 'vitamin',
    mainFunction: 'DNA合成、预防胎儿神经管畸形',
    cycleType: 'periodic',
    atRiskGroups: ['备孕及孕妇', '巨幼细胞贫血', '酗酒者'],
    rni: { male: '400μg DFE', female: '400μg DFE', unit: 'μg DFE' },
    ul: '1000μg DFE',
    overdoseRisk: '掩盖B12缺乏症状',
    sources: ['深绿色叶菜', '豆类', '动物肝脏', '强化谷物', '橙汁'],
    specialNotes: '备孕至孕早期每日补充400-800μg'
  },
  {
    id: 'biotin',
    name: '生物素',
    nameEn: 'Biotin (B7)',
    category: 'vitamin',
    mainFunction: '脂肪糖代谢、皮肤头发健康',
    cycleType: 'daily',
    atRiskGroups: ['生吃蛋清者', '长期肠外营养', '孕妇'],
    rni: { male: '30μg', female: '30μg', unit: 'μg' },
    ul: '未确定',
    overdoseRisk: '罕见',
    sources: ['蛋黄', '坚果', '种子', '三文鱼', '牛油果']
  },
  {
    id: 'pantothenic_acid',
    name: '泛酸',
    nameEn: 'Pantothenic Acid (B5)',
    category: 'vitamin',
    mainFunction: '能量代谢、激素合成',
    cycleType: 'daily',
    atRiskGroups: ['很少缺乏'],
    rni: { male: '5mg', female: '5mg', unit: 'mg' },
    ul: '未确定',
    overdoseRisk: '腹泻',
    sources: ['几乎所有食物', '全谷物', '牛油果', '蘑菇', '蛋']
  },
  {
    id: 'calcium',
    name: '钙',
    nameEn: 'Calcium',
    category: 'mineral',
    mainFunction: '骨骼牙齿、神经肌肉传导、凝血',
    cycleType: 'daily',
    atRiskGroups: ['儿童', '青少年', '孕妇', '老年人', '素食者'],
    rni: { male: '800mg', female: '800mg', unit: 'mg' },
    ul: '2000mg',
    overdoseRisk: '肾结石、血管钙化、便秘',
    sources: ['奶制品', '豆腐', '深绿色叶菜', '芝麻', '沙丁鱼'],
    specialNotes: '40岁以上女性每日建议1000-1200mg'
  },
  {
    id: 'iron',
    name: '铁',
    nameEn: 'Iron',
    category: 'mineral',
    mainFunction: '造血、携氧',
    cycleType: 'daily',
    atRiskGroups: ['月经期女性', '孕妇', '婴幼儿', '素食者', '贫血者'],
    rni: { male: '12mg', female: '20mg', unit: 'mg' },
    ul: '42mg',
    overdoseRisk: '肝损伤、便秘、心脏损伤',
    sources: ['红肉', '动物肝脏', '蛤蜊', '豆类', '菠菜'],
    specialNotes: '动物性铁（血红素铁）吸收率远高于植物铁；维C促进铁吸收'
  },
  {
    id: 'zinc',
    name: '锌',
    nameEn: 'Zinc',
    category: 'mineral',
    mainFunction: '免疫、伤口愈合、味觉、生殖',
    cycleType: 'daily',
    atRiskGroups: ['素食者', '孕妇', '儿童', '腹泻者', '老年人'],
    rni: { male: '12.5mg', female: '7.5mg', unit: 'mg' },
    ul: '40mg',
    overdoseRisk: '铜缺乏、免疫功能下降',
    sources: ['牡蛎', '红肉', '南瓜籽', '腰果', '鹰嘴豆']
  },
  {
    id: 'magnesium',
    name: '镁',
    nameEn: 'Magnesium',
    category: 'mineral',
    mainFunction: '神经肌肉、心律、骨骼、血糖调节',
    cycleType: 'daily',
    atRiskGroups: ['压力大', '糖尿病患者', '酗酒者', '使用利尿剂者'],
    rni: { male: '330mg', female: '330mg', unit: 'mg' },
    ul: '700mg（来自补充剂）',
    overdoseRisk: '腹泻、低血压、呼吸抑制',
    sources: ['南瓜籽', '杏仁', '菠菜', '黑巧克力', '牛油果'],
    specialNotes: '甘氨酸镁/柠檬酸镁吸收好；氧化镁易腹泻'
  },
  {
    id: 'selenium',
    name: '硒',
    nameEn: 'Selenium',
    category: 'mineral',
    mainFunction: '抗氧化、甲状腺功能',
    cycleType: 'daily',
    atRiskGroups: ['低硒地区居民', '克山病', '甲状腺疾病'],
    rni: { male: '60μg', female: '60μg', unit: 'μg' },
    ul: '400μg',
    overdoseRisk: '脱发、指甲变形、蒜味呼吸',
    sources: ['巴西坚果', '海鲜', '蛋', '瘦肉', '全谷物'],
    specialNotes: '每天1-2颗巴西坚果即可满足需求'
  },
  {
    id: 'iodine',
    name: '碘',
    nameEn: 'Iodine',
    category: 'mineral',
    mainFunction: '甲状腺激素合成',
    cycleType: 'daily',
    atRiskGroups: ['孕妇', '哺乳期', '甲状腺疾病患者（需医嘱）'],
    rni: { male: '120μg', female: '120μg', unit: 'μg' },
    ul: '600μg',
    overdoseRisk: '甲亢/甲减',
    sources: ['碘盐', '海带', '紫菜', '海鲜', '蛋'],
    specialNotes: '桥本患者需谨慎补碘，避免高碘食物'
  },
  {
    id: 'potassium',
    name: '钾',
    nameEn: 'Potassium',
    category: 'mineral',
    mainFunction: '血压调节、神经肌肉传导',
    cycleType: 'daily',
    atRiskGroups: ['高血压患者', '大量出汗者', '使用利尿剂者'],
    rni: { male: '2000mg', female: '2000mg', unit: 'mg' },
    ul: '未设（食物中安全）',
    overdoseRisk: '高钾血症（肾功能不全者）',
    sources: ['香蕉', '土豆', '牛油果', '菠菜', '椰子水']
  },
  {
    id: 'omega3',
    name: 'Omega-3 (EPA/DHA)',
    nameEn: 'Omega-3 Fatty Acids',
    category: 'fatty_acid',
    mainFunction: '抗炎、心血管保护、脑发育',
    cycleType: 'daily',
    atRiskGroups: ['孕妇', '婴幼儿', '老年人', '高血脂', '抑郁倾向'],
    rni: { male: '250mg EPA+DHA', female: '250mg EPA+DHA', unit: 'mg' },
    ul: '未明确',
    overdoseRisk: '抗凝血（极高剂量）',
    sources: ['深海鱼（三文鱼、沙丁鱼）', '亚麻籽', '奇亚籽', '核桃', '藻油'],
    specialNotes: '素食者可用藻油DHA替代'
  },
  {
    id: 'fiber',
    name: '膳食纤维',
    nameEn: 'Dietary Fiber',
    category: 'fiber',
    mainFunction: '肠道健康、血糖血脂控制',
    cycleType: 'daily',
    atRiskGroups: ['便秘者', '肥胖', '糖尿病', '高血脂'],
    rni: { male: '25-35g', female: '25-35g', unit: 'g' },
    ul: '无',
    overdoseRisk: '腹胀、影响矿物质吸收（过量）',
    sources: ['全谷物', '豆类', '蔬菜', '水果', '坚果'],
    specialNotes: 'IBS-D患者宜选可溶性纤维；IBS-C增加不可溶性纤维'
  },
  {
    id: 'protein',
    name: '蛋白质',
    nameEn: 'Protein',
    category: 'macronutrient',
    mainFunction: '组织修复、酶/激素合成',
    cycleType: 'daily',
    atRiskGroups: ['健身人群', '术后', '老年人', '素食者'],
    rni: { male: '65g', female: '55g', unit: 'g' },
    ul: '无（过量增加肾负担）',
    overdoseRisk: '肾损伤（已有肾病者）',
    sources: ['瘦肉', '鱼', '蛋', '奶', '豆类', '豆制品'],
    specialNotes: '健身增肌期建议1.6-2.2g/kg体重'
  }
]

// 检测值阈值库
export interface LabThreshold {
  param: string
  name: string
  unit: string
  deficient: string    // 缺乏范围
  insufficient: string // 不足范围
  optimal: string      // 理想范围
  high: string         // 偏高范围
}

export const labThresholds: LabThreshold[] = [
  { param: 'vitamin_d', name: '25(OH)D', unit: 'nmol/L', deficient: '<30', insufficient: '30-50', optimal: '>75', high: '>250' },
  { param: 'ferritin', name: '铁蛋白', unit: 'μg/L', deficient: '<15', insufficient: '15-30', optimal: '50-100', high: '>200' },
  { param: 'tsh', name: 'TSH', unit: 'mIU/L', deficient: '-', insufficient: '-', optimal: '0.5-2.5', high: '>4.0' },
  { param: 'tpoab', name: 'TPOAb', unit: 'IU/mL', deficient: '-', insufficient: '-', optimal: '<35', high: '>60' },
  { param: 'fasting_glucose', name: '空腹血糖', unit: 'mmol/L', deficient: '<3.9', insufficient: '-', optimal: '3.9-5.6', high: '>7.0' },
  { param: 'hba1c', name: '糖化血红蛋白', unit: '%', deficient: '-', insufficient: '-', optimal: '<5.7', high: '>6.5' },
  { param: 'vitamin_b12', name: '维生素B12', unit: 'pmol/L', deficient: '<148', insufficient: '148-258', optimal: '>258', high: '-=5' },
  { param: 'hemoglobin', name: '血红蛋白', unit: 'g/L', deficient: '男<130/女<120', insufficient: '-', optimal: '男130-175/女120-155', high: '>175/155' },
]
