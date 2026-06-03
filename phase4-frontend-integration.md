# Phase 4: 前端集成 — 营养数据库

## 完成时间
2026-06-03

## 概述
将 3,622 条批次知识库数据（来自营养学教材 PDF）从仅 LLM 上下文使用，扩展为可浏览、可搜索的前端页面。

## 变更清单

### 后端（2 个文件）

| 文件 | 操作 | 说明 |
|------|------|------|
| `backend/routes/knowledge.js` | **新建** | 知识库浏览 REST API |
| `backend/knowledge-base-loader.js` | 修改 | `convertBatchEntry()` 新增 `subcategory`、`confidence` 字段 |
| `backend/server.js` | 修改 | 注册 `/api/knowledge` 路由 |

### 前端（5 个文件）

| 文件 | 操作 | 说明 |
|------|------|------|
| `frontend/src/pages/NutritionDataPage.tsx` | **新建** | 营养数据库浏览页 |
| `frontend/src/pages/NutritionDataDetailPage.tsx` | **新建** | 知识条目详情页 |
| `frontend/src/App.tsx` | 修改 | 新增 2 条路由 |
| `frontend/src/components/layout/Header.tsx` | 修改 | 新增"营养数据库"导航入口 |
| `frontend/src/lib/api.ts` | 修改 | 新增 knowledge API 封装 |

### API 端点

| 端点 | 说明 |
|------|------|
| `GET /api/knowledge/overview` | 按分类统计（8 大类，含条目数、子分类） |
| `GET /api/knowledge/categories` | 分类列表（含子分类统计） |
| `GET /api/knowledge?q=&category=&page=&limit=` | 搜索 + 分页列表 |
| `GET /api/knowledge/:id` | 单条详情 |

### 前端页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/nutrition-data` | NutritionDataPage | 分类标签筛选 + 搜索 + 卡片网格 + 分页 |
| `/nutrition-data/:id` | NutritionDataDetailPage | 完整内容 + 元数据（来源、证据等级、标签） |

### 知识库数据规模

| 分类 | 条目数 |
|------|--------|
| 临床营养 | 1,634 |
| 营养素百科 | 942 |
| 食物知识 | 876 |
| 饮食原则 | 116 |
| 补充剂 | 26 |
| 人群营养 | 19 |
| 疾病营养 | 5 |
| 饮食模式 | 4 |
| **总计** | **3,622** |

## 关键决策

1. **服务端内存索引**：知识路由直接复用 `knowledge-base-loader` 的 `getKnowledgeIndex()`，无需额外数据加载
2. **分页设计**：默认每页 20 条，最大 100 条，防止大数据量页面卡顿
3. **列表精简**：搜索/列表接口返回 200 字摘要（`excerpt`），详情接口返回完整内容
4. **URL 参数驱动**：分类、搜索词、页码均通过 URL search params 管理，支持浏览器前进后退

## 后续建议

- 搜索目前是简单子串匹配，未来可接入中文分词（如 `nodejieba`）
- 部分批次数据的 `title` 字段质量较差（截取原文前 40 字符），可考虑用 LLM 生成更好的标题
- 可添加"相关条目"推荐功能（基于标签共现）
