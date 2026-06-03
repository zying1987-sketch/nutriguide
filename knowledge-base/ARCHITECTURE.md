# NutriGuide 知识库提炼 Agent 系统 — 架构设计

> 版本: v1.0 | 设计日期: 2026-06-02
> 目标: 将营养学书籍、论文、网站转化为结构化知识库，支撑「饮食优先、补充为辅」的营养评估体系

---

## 一、问题诊断：现有系统的两大缺口

### 缺口 1: 缺少「普通人」营养基线

当前系统围绕 **12 类特殊人群**（孕期、素食、PCOS、桥本、糖尿病等）构建方案，但大量"无明显健康问题"的用户完成自测后，难以得到有价值的输出。系统需要一套 **面向性别-年龄分层的普通人群基础营养指导**。

### 缺口 2: 「饮食」被严重边缘化

现行系统的饮食部分仅以「推荐食物列表」形式存在于各人群方案中，缺少：
- 结构化的饮食评估（用户日常吃什么）
- 系统性的膳食模式指导（中国居民膳食指南 2022）
- 食物-营养素映射关系（缺什么营养素→吃什么食物→怎么吃）
- 「补充剂非必需品」的基本立场

**核心原则**: 营养学的基础是饮食，补充剂是饮食不足时的补充，不应喧宾夺主。

---

## 二、Agent 角色矩阵

系统由 **5 个 Agent** 协同工作，覆盖从原始知识到可部署数据的完整链路。

### Agent 1: 营养学首席科学家 (Chief Nutrition Scientist)

| 维度 | 描述 |
|------|------|
| **人格设定** | 严谨、循证、不妥协。熟悉中国居民膳食指南 (2022)、中国 DRIs (2023)、WHO/FAO 指南、NIH/ODS 数据库、UpToDate 临床营养板块。对每个主张要求文献支撑。 |
| **核心职责** | ① 审核所有知识条目的科学准确性 ② 为每条推荐分配证据等级 (A/B/C/D) ③ 确认 RNI/UL/AI 数据与最新 DRIs 一致 ④ 标记「争议领域」（如低碳 vs 低脂、饱和脂肪 vs CVD） |
| **输入** | 知识提炼师输出的原始知识块 |
| **输出** | 带证据等级的已验证知识条目 + 争议标注 |
| **工具** | 营养素数据库、DRIs 对照表、PubMed 检索能力 |

### Agent 2: 资深数据分析师 (Senior Data Analyst)

| 维度 | 描述 |
|------|------|
| **人格设定** | 精确、结构化、零容忍数据错误。擅长将模糊描述转化为可计算字段。对数值数据有洁癖——单位必须统一、来源必须标注、缺失值必须显式处理。 |
| **核心职责** | ① 将文本知识结构化为 JSON Schema 标准格式 ② 建立食物→营养素映射表（每 100g 含量） ③ 量化"高/中/低"为具体阈值 ④ 生成数据质量报告（完整度、置信度） |
| **输入** | 科学家验证后的知识条目 |
| **输出** | 结构化 JSON 数据文件 |
| **工具** | JSON Schema 验证器、数据归一化脚本、单位转换表 |

### Agent 3: 临床营养实战师 (Clinical Nutrition Practitioner)

| 维度 | 描述 |
|------|------|
| **人格设定** | 务实、面向用户、擅长沟通。15 年临床营养咨询经验，深知"科学上对"和"用户能做到"之间的鸿沟。能把 RCT 结论转化为具体的吃饭建议。 |
| **核心职责** | ① 将循证知识转化为可操作的饮食建议 ② 构建膳食模式模板（中国膳食模式、地中海、DASH、低碳） ③ 设计「饮食充足性」评估问卷 ④ 为每类人群设计一日/一周示范餐单 ⑤ 构建「优先饮食改善→其次补充剂」的推荐逻辑 |
| **输入** | 结构化数据 + 科学家验证的知识 |
| **输出** | 膳食模式模板、示范餐单、饮食评估问题集、食物替换建议 |
| **工具** | 中国食物成分表、膳食模式定义 |

### Agent 4: 知识审核与仲裁官 (Knowledge Auditor)

| 维度 | 描述 |
|------|------|
| **人格设定** | 独立、不偏不倚、追求真理。不属于任何"学派"——低碳和低脂都看证据说话。对于争议领域，呈现双方的证据而非站队。 |
| **核心职责** | ① 交叉验证不同来源的知识一致性 ② 标记和记录矛盾点 ③ 为每条知识分配置信度分数 (0-100) ④ 维护「已知争议」知识库 ⑤ 当新证据出现时触发重新审核 |
| **输入** | 所有 Agent 的输出 |
| **输出** | 审核报告、矛盾记录、置信度标注 |
| **工具** | 差异检测算法、版本对比 |

### Agent 5: 知识提炼师 (Knowledge Distiller)

| 维度 | 描述 |
|------|------|
| **人格设定** | 高效、精准、不遗漏。能从 300 页书籍中提取 50 条可操作知识。理解营养学语境，能正确识别 RNI 数值、食物成分数据、临床建议。 |
| **核心职责** | ① 从书籍/论文/网站中提取结构化知识 ② 按预定义分类法打标签 ③ 标注信息来源（页码/URL/章节） ④ 区分「事实陈述」和「观点建议」 |
| **输入** | 原始材料（PDF 书籍、网页、论文） |
| **输出** | 带来源标注的原始知识块 |
| **工具** | 文档解析、OCR（如需要）、标签分类体系 |

---

## 三、知识提炼流水线

```
┌─────────────────────────────────────────────────────────────────┐
│                      KNOWLEDGE PIPELINE                          │
│                                                                  │
│  [Phase 1]          [Phase 2]         [Phase 3]    [Phase 4]   │
│  提取 →              结构化 →          审核 →       集成        │
│                                                                  │
│  Raw Materials    Raw Chunks      Structured Data  .ts Files    │
│  ────────────     ──────────      ───────────────  ─────────    │
│  Books (PDF)  →   Distiller  →    Analyst     →   Integrator   │
│  Papers       →   extracts       normalizes      generates      │
│  Websites     →   knowledge      & maps          frontend       │
│  Guidelines   →   chunks          quantities      data files     │
│                                    ↓                            │
│                              Scientist   Auditor                │
│                              validates   cross-checks           │
│                              evidence    confidence             │
│                                                                  │
│  [Parallel Track]  Practitioner  →  Meal Plans / Diet Q's      │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 1 — 提取

```
触发: 用户提交原材料（文件/URL）
执行: 知识提炼师 (Distiller)
输出: raw_chunks/ 目录下的 JSON 文件

每个 chunk 的格式:
{
  "id": "chunk_001",
  "source": {"type": "book", "title": "中国居民膳食指南2022", "page": 45, "chapter": "第三章"},
  "category": "diet_principle",
  "tags": ["general_population", "meal_pattern", "portion_guidance"],
  "raw_text": "每天的膳食应包括谷薯类、蔬菜水果、畜禽鱼蛋奶和豆类食物。平均每天摄入12种以上食物，每周25种以上。",
  "claim_type": "guideline",  // fact | guideline | opinion | data_point
  "extracted_date": "2026-06-02"
}
```

### Phase 2 — 结构化

```
触发: raw_chunks/ 有新文件
执行: 数据分析师 (Analyst) → 首席科学家 (Scientist) 并行验证
输出: structured/ 目录下的分类 JSON 文件

结构化知识条目格式:
{
  "id": "kb_food_001",
  "category": "food",
  "food_name": "菠菜",
  "food_name_en": "Spinach",
  "nutrients_per_100g": {
    "iron_mg": 2.9,
    "vitamin_c_mg": 28.1,
    "folate_ug": 194,
    "vitamin_k_ug": 483,
    "calcium_mg": 99,
    "fiber_g": 2.2
  },
  "bioavailability_notes": "非血红素铁，吸收率约2-5%，搭配维生素C可提高至5-15%",
  "evidence_level": "A",
  "sources": ["chunk_001", "chunk_045"],
  "confidence": 92,
  "last_updated": "2026-06-02"
}
```

### Phase 3 — 审核

```
触发: structured/ 有新数据
执行: 审核官 (Auditor) 交叉验证
输出: audit/ 目录下的审核报告

审核维度:
- 多源一致性: 同一主张在多少来源中出现？
- 证据等级: A(RCT meta) / B(cohort) / C(expert) / D(anecdotal)
- 数据新鲜度: 是否基于最新 DRIs/指南？
- 争议标记: 该主张是否存在对立证据？
- 地域适用性: 是否适合中国人饮食语境？
```

### Phase 4 — 集成

```
触发: 审核通过后
执行: 集成器 (Integrator)
输出: 前端可直接导入的 TypeScript 数据文件

生成文件列表:
frontend/src/data/
├── nutrients.ts          # 现有文件，增量更新
├── foods.ts              # [新建] 食物数据库
├── dietPrinciples.ts     # [新建] 饮食原则库
├── mealTemplates.ts      # [新建] 示范餐单模板
├── dietAssessment.ts     # [新建] 饮食评估问题
├── populationPlans.ts    # 现有文件，增强饮食部分
└── generalBaseline.ts    # [新建] 普通人群基线指导
```

---

## 四、知识库数据模型

### 4.1 食物数据库 (foods.ts)

```typescript
interface Food {
  id: string;                    // 唯一标识
  name: string;                  // 中文名
  nameEn?: string;               // 英文名
  category: FoodCategory;        // 分类
  nutrientsPer100g: NutrientProfile;  // 每100g营养素含量
  portion: Portion;              // 标准份量
  glycemicIndex?: number;        // GI值
  glycemicLoad?: number;         // GL值（标准份量）
  antinutrients?: string[];      // 抗营养因子
  cookingImpact?: string;        // 烹饪影响
  seasonalInfo?: string;         // 季节性
  commonIn: string[];            // 常见于哪些膳食模式
  evidenceLevel: EvidenceLevel;  // 数据来源可信度
}

type FoodCategory =
  | 'grains'         // 谷薯类
  | 'vegetables'     // 蔬菜
  | 'fruits'         // 水果
  | 'meat_poultry'   // 畜禽肉
  | 'seafood'        // 水产
  | 'eggs'           // 蛋类
  | 'dairy'          // 奶及奶制品
  | 'soy_products'   // 大豆及制品
  | 'nuts_seeds'     // 坚果种子
  | 'oils_fats'      // 油脂
  | 'beverages'      // 饮品
  | 'condiments';    // 调味品

interface NutrientProfile {
  energy_kcal: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  // 维生素
  vitaminA_ugRAE?: number;
  vitaminC_mg?: number;
  vitaminD_ug?: number;
  vitaminE_mg?: number;
  vitaminK_ug?: number;
  thiamin_mg?: number;       // B1
  riboflavin_mg?: number;    // B2
  niacin_mg?: number;        // B3
  vitaminB6_mg?: number;
  folate_ug?: number;        // B9
  vitaminB12_ug?: number;
  // 矿物质
  calcium_mg?: number;
  iron_mg?: number;
  zinc_mg?: number;
  magnesium_mg?: number;
  selenium_ug?: number;
  iodine_ug?: number;
  potassium_mg?: number;
  sodium_mg?: number;
  // 脂肪酸
  omega3_g?: number;
}
```

### 4.2 饮食原则库 (dietPrinciples.ts)

```typescript
interface DietPrinciple {
  id: string;
  principle: string;            // 原则描述
  category: 'macronutrient' | 'micronutrient' | 'meal_pattern' | 'food_choice' | 'cooking' | 'eating_habit';
  targetPopulation: 'general' | string[];  // 面向人群
  evidenceLevel: EvidenceLevel;
  practicalAdvice: string;      // 可操作建议
  rationale: string;            // 科学依据
  sources: string[];
}

// 示例条目
const generalPrinciples: DietPrinciple[] = [
  {
    id: "dp_001",
    principle: "每天摄入不少于12种食物，每周不少于25种",
    category: "food_choice",
    targetPopulation: "general",
    evidenceLevel: "A",
    practicalAdvice: "早餐3-4种、午餐4-5种、晚餐4-5种、加餐1-2种",
    rationale: "食物多样性确保营养素摄入全面，降低微量营养素缺乏风险",
    sources: ["中国居民膳食指南2022"]
  },
  // ... 更多条目
];
```

### 4.3 普通人基线指导 (generalBaseline.ts)

```typescript
interface GeneralBaseline {
  gender: 'male' | 'female';
  ageGroup: string;             // "18-49" | "50-64" | "65+"
  energyNeeds: {
    sedentary_kcal: number;
    moderate_kcal: number;
    active_kcal: number;
  };
  macroDistribution: {
    carbsPercent: [number, number];   // [min, max]
    proteinPercent: [number, number];
    fatPercent: [number, number];
  };
  dailyPortions: {
    grains: [number, number];         // 份/天
    vegetables: [number, number];
    fruits: [number, number];
    protein: [number, number];        // 畜禽鱼蛋
    dairy: [number, number];
    soyNuts: [number, number];
    oils: [number, number];           // g/天
    salt: number;                     // g/天上限
    water: [number, number];          // ml/天
  };
  keyNutrients: {
    nutrient: string;
    rni: string;
    priorityFoods: string[];          // 优先食物来源
    warningSigns: string;             // 缺乏警示
  }[];
  dietPrinciplesSummary: string[];    // 核心饮食原则
  supplementGuidance: string;         // 补充剂立场（通常为"饮食优先"）
}
```

### 4.4 示范餐单模板 (mealTemplates.ts)

```typescript
interface MealTemplate {
  id: string;
  name: string;
  targetPopulation: 'general' | string[];
  energyLevel: '1600' | '1800' | '2000' | '2200' | '2400';  // kcal
  meals: {
    [mealTime: string]: {            // "breakfast" | "lunch" | "dinner" | "snack"
      foods: {
        name: string;
        portion: string;
        category: FoodCategory;
        keyNutrients: string[];
      }[];
      nutritionSummary: string;      // 该餐营养亮点
    };
  };
  dailyNutritionSummary: {
    energy_kcal: number;
    protein_g: number;
    fiber_g: number;
    highlights: string[];            // 营养亮点
  };
  notes: string;                     // 备选替换、注意事项
}
```

### 4.5 饮食评估问题库 (dietAssessment.ts)

```typescript
interface DietQuestion {
  id: string;
  question: string;
  category: 'meal_pattern' | 'food_group' | 'cooking' | 'eating_habit' | 'supplement';
  type: 'single' | 'multiple' | 'frequency' | 'portion';
  options: { value: string; label: string; score?: number }[];
  scoring?: {
    method: 'cumulative' | 'threshold' | 'pattern';
    deficient?: number;          // 低于此分数为不足
  };
  targetPopulation: 'general' | string[];
  followUp?: string[];           // 相关追问问题ID
}

// 示例：饮食频率评估
const dietFrequencyQuestions: DietQuestion[] = [
  {
    id: "df_01",
    question: "您每天吃几餐？",
    category: "meal_pattern",
    type: "single",
    options: [
      { value: "1", label: "1餐", score: 1 },
      { value: "2", label: "2餐", score: 2 },
      { value: "3", label: "3餐（规律）", score: 4 },
      { value: "3+", label: "3餐+加餐", score: 5 },
    ],
    targetPopulation: "general",
  },
  // ... 更多问题
];
```

---

## 五、与现有系统的集成路径

### 5.1 当前状态

```
用户自测(6步) → 规则引擎 → 人群匹配 → 方案生成
                    ↑              ↑
              人口学+疾病      populationPlans.ts
              核心诉求          (19个方案，12类人群)
              
【缺失】
  - 饮食评估步骤
  - 普通人基线方案
  - 食物→营养素映射查询
```

### 5.2 目标状态

```
用户自测(8步) → 规则引擎 → 人群匹配 + 基线评估 → 方案生成
    │               ↑              ↑                    ↑
    │         人口学+疾病    populationPlans.ts    planGenerator.ts
    │         核心诉求       generalBaseline.ts    (增强饮食部分)
    │         饮食频率       foods.ts
    │         饮食质量       dietPrinciples.ts
    │                        mealTemplates.ts
    │
    └── Step 2.5 [新建]: 饮食评估 (Diet Assessment)
         - 三餐规律性
         - 食物多样性
         - 各食物组摄入频率
         - 烹饪方式
         - 外食频率
```

### 5.3 推荐逻辑升级

**当前逻辑**: 匹配人群 → 匹配方案 → 直接给补充剂推荐

**升级后逻辑**:

```
1. 评估饮食充足性 → 计算 Diet Quality Score (0-100)
2. 识别饮食缺口 → 哪些食物组摄入不足 → 预测营养素缺乏风险
3. 优先级排序:
   a. 饮食改善建议（可操作、具体、带餐单）
   b. 如果饮食无法满足（如B12素食者）→ 补充剂建议
   c. 如果体检确认缺乏 → 补充剂 + 饮食双管齐下
4. 输出:
   ✅ 饮食优先方案（示范餐单 + 食物替换 + 烹饪建议）
   ✅ 补充剂作为"饮食不足时的补充"（非默认选项）
   ✅ 监测计划（3个月后复查饮食质量 + 相关指标）
```

---

## 六、实施路线图

### Phase A: 基础设施搭建（当前阶段）

| 步骤 | 内容 | Agent | 输出 |
|------|------|-------|------|
| A1 | 建立知识分类体系与标签树 | 数据分析师 | taxonomy.json |
| A2 | 设计 JSON Schema 验证模板 | 数据分析师 | schemas/ 目录 |
| A3 | 建立知识库目录结构 | 系统 | knowledge-base/ 目录 |
| A4 | 搭建 Agent 协作协议 | 系统 | pipeline.md |

### Phase B: 第一批知识摄入

| 步骤 | 内容 | Agent | 来源 |
|------|------|-------|------|
| B1 | 中国居民膳食指南 2022 | 提炼师 → 科学家 | 书籍 |
| B2 | 中国食物成分表（标准版） | 提炼师 → 数据分析师 | 数据库 |
| B3 | 中国 DRIs 2023 | 提炼师 → 科学家 | 标准 |
| B4 | WHO Healthy Diet Fact Sheet | 提炼师 → 科学家 | 网站 |

### Phase C: 知识结构化

| 步骤 | 内容 | Agent |
|------|------|-------|
| C1 | 构建 foods.ts（首批 200+ 常见食物） | 数据分析师 |
| C2 | 构建 dietPrinciples.ts（100+ 条原则） | 科学家 + 实战师 |
| C3 | 构建 generalBaseline.ts（性别×年龄分层） | 实战师 |
| C4 | 构建 mealTemplates.ts（20+ 示范餐单） | 实战师 |
| C5 | 构建 dietAssessment.ts（饮食评估问卷） | 实战师 |

### Phase D: 前端集成

| 步骤 | 内容 |
|------|------|
| D1 | 在自测流程中新增 Step 2.5「饮食评估」 |
| D2 | 在规则引擎中新增 `evaluateDietQuality()` |
| D3 | 在方案生成器中实现「饮食优先」推荐逻辑 |
| D4 | 新增普通人基线方案展示 |
| D5 | 结果页新增「饮食改善」Tab |

---

## 七、Agent 协作协议

### 7.1 消息格式

```json
{
  "from": "distiller",
  "to": "scientist",
  "type": "knowledge_chunk",
  "payload": { "chunk_id": "...", "content": "..." },
  "metadata": { "priority": "high", "deadline": null }
}
```

### 7.2 流转规则

```
Distiller → [chunks] → Analyst + Scientist (parallel)
Analyst → [structured] → Auditor
Scientist → [validated] → Auditor
Auditor → [approved] → Practitioner + Integrator (parallel)
Practitioner → [practical] → Integrator
Integrator → [.ts files] → Frontend Build
```

### 7.3 冲突解决

当 Scientist 和 Auditor 产生分歧时:
1. 证据等级更高的一方优先
2. 同等证据 → Auditor 标记为「争议」并保留双方立场
3. Practitioner 在实战建议中说明两种观点，让用户知情选择

---

## 八、下一步行动

请确认以下方向，我将立即开始执行:

1. **立即**: 创建知识库目录结构和 JSON Schema
2. **你准备好后**: 喂第一批食材——中国居民膳食指南 2022、中国食物成分表、或其他你持有的书籍/网站
3. **逐步**: 按 Phase B → C → D 顺序推进

**你需要决定的**:
- 第一批要喂的是哪些书籍/网站？（告诉我文件路径或 URL）
- 是否同意上述 Agent 角色设计和流水线？
- 对数据模型有什么补充或修改？
