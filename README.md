# NutriGuide — 个性化营养补给与生活方式助手

> 基于AI规则引擎+知识库的智能营养评估与方案生成系统

## 快速启动

### 前端（Vite + React + TypeScript + Tailwind）

```bash
cd frontend
npm install
npm run dev          # 开发模式 → http://localhost:5173
npm run build        # 构建生产版本
npm run preview      # 预览构建产物
```

### 后端（Express + LLM API代理）

```bash
cd backend
npm install
node server.js         # 启动后端 → http://localhost:3001
```

#### 配置 LLM API（可选）

在 `backend/.env` 中设置任一免费 API Key：

```bash
# Google Gemini（免费 1500次/天）— 推荐
GEMINI_API_KEY=你的key
# 申请地址：https://aistudio.google.com/apikey

# DeepSeek（价格低廉）
DEEPSEEK_API_KEY=你的key
# 申请地址：https://platform.deepseek.com/api_keys
```

> 未设置 API Key 时，方案将使用本地模板生成（不依赖任何外部服务）。

---

## 项目结构

```
nutriguide/
├── frontend/                # React 前端
│   ├── src/
│   │   ├── components/        # UI 组件
│   │   │   ├── layout/      # 布局（Layout, Header）
│   │   │   ├── ui/          # 通用 UI 组件
│   │   │   ├── assessment/ # 评估流程组件
│   │   │   └── results/     # 结果展示组件
│   │   ├── data/            # 知识库数据
│   │   │   ├── nutrients.ts      # 26种营养素数据
│   │   │   └── populationPlans.ts  # 12类人群方案
│   │   ├── engine/          # 规则引擎
│   │   │   ├── ruleEngine.ts     # 人群匹配规则引擎
│   │   │   └── planGenerator.ts  # 方案生成器
│   │   ├── pages/           # 页面
│   │   │   ├── HomePage.tsx
│   │   │   ├── AssessmentPage.tsx
│   │   │   ├── ResultsPage.tsx
│   │   │   └── PlanPage.tsx
│   │   ├── stores/          # Zustand 状态管理
│   │   └── styles/          # 全局样式
│   └── dist/               # 构建产物
├── backend/                # Express 后端
│   ├── server.js           # 主服务（LLM API 代理）
│   └── .env                # 环境变量配置
└── README.md
```

---

## 核心功能

### 1. 6步智能自测

| 步骤 | 内容 | 用途 |
|------|------|------|
| 基础信息 | 年龄/性别/BMI/怀孕状态/确诊疾病/长期用药 | 初步用户画像 |
| 生活方式 | 饮食模式/运动频率/睡眠/压力/烟酒 | 营养风险评估 |
| 症状自评 | 20+症状按0-3分评分 | 触发人群匹配规则 |
| 专项筛查 | 根据症状动态展开（IBS/PHQ-2/GAD-2等） | 精准分组 |
| 体检数据 | 空腹血糖/TSH/TPOAb/25(OH)D/铁蛋白等 | 调整补充剂剂量 |
| 饮食日记 | 9类食物摄入频率 | 营养缺口分析 |

### 2. 规则引擎（ruleEngine.ts）

- **12类人群** 精细化匹配（备孕/孕期/素食/健身/PCOS/IBS/焦虑抑郁/糖尿病/桥本/更年期/青少年/老年人）
- **优先级排序**：妊娠 > 糖尿病 > 桥本 > PCOS > IBS > 焦虑 > 更年期 > 老年 > 其他
- **合并人群处理**：去重合并 + 冲突检测（如桥本禁碘 vs 孕期需碘）
- **阈值库**：所有检测指标的缺乏/不足/理想/偏高范围

### 3. 知识库（populationPlans.ts）

每个特殊人群包含完整方案：

```typescript
interface PopulationPlan {
  supplements: SupplementRecommendation[]  // 营养素补充（core/conditional/optional）
  diet: {                                      // 饮食调节
    principles: DietPrinciple[]             // 阶段化饮食原则
    foodsToEat: FoodItem[]               // 推荐食物清单
    foodsToAvoid: FoodItem[]            // 避免/限制食物
  }
  lifestyle: LifestyleAdvice[]            // 生活方式调整
  monitoringPlan: string[]              // 建议监测计划
  warningSigns: string[]               // 就医提醒指征
}
```

### 4. 28天个性化方案生成

- **有 API Key**：调用 Google Gemini / DeepSeek 免费模型，生成个性化 AI 方案
- **无 API Key**：使用本地模板方案（基于知识库数据自动生成）

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | React 19 + TypeScript | Hooks + 函数式组件 |
| 构建工具 | Vite 8 | 极速 HMR |
| 样式方案 | Tailwind CSS 4 | 响应式 + 深色模式预备 |
| 状态管理 | Zustand | 轻量，支持草稿持久化 |
| 路由 | React Router 7 | 客户端路由 |
| 后端 | Express.js | LLM API 代理 + 未来扩展 |
| LLM | Gemini Flash 2.0 / DeepSeek Chat | 免费额度优先 |

---

## 设计系统

| Token | 色值 | 用途 |
|-------|------|------|
| 奶白 | `#FAF8F5` | 页面背景 |
| 深蓝 | `#1B2A4A` | 主文字 / 深色元素 |
| 橙红 | `#E85D3A` | 警示 / 高风险 / CTA 强调 |
| 绿色 | `#2D9C6F` | 主品牌色 / 安全操作 |
| 金棕 | `#D4A853` | 条件补充 / 中风险 |

---

## 下一步计划

- [ ] 接入真实 LLM API（Gemini Flash 或 DeepSeek）
- [ ] 用户账户系统（登录/历史记录）
- [ ] PDF 导出功能
- [ ] OCR 体检报告识别
- [ ] 饮食日记 AI 分析
- [ ] 更多人群亚型（IBS-C、PMS 专用方案等）
- [ ] PWA 支持（离线使用）
- [ ] 多语言支持（英文）

---

## 免责声明

**本网站提供的内容仅供参考和教育目的，不构成医疗建议。**

任何营养素补充剂的使用均应在医生或注册营养师指导下进行。如果您有已确诊疾病或正在服用处方药物，请在调整饮食或补充剂前咨询您的医生。

---

*NutriGuide &copy; 2026 — Built with React + TypeScript + Tailwind CSS*
