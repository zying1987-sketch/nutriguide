# NutriGuide 知识库 — 目录总览

```
knowledge-base/
├── ARCHITECTURE.md           # 系统架构设计文档（完整）
├── taxonomy.json             # 知识分类体系
├── pipeline.md               # Agent 协作协议
│
├── raw_chunks/               # Phase 1 输出: 原始知识块
│   └── .gitkeep
│
├── structured/               # Phase 2 输出: 结构化数据
│   ├── foods/                #   食物条目
│   ├── principles/           #   饮食原则
│   ├── populations/          #   人群基线
│   ├── meals/                #   示范餐单
│   └── assessments/          #   饮食评估问题
│
├── evidence/                 # Phase 2 输出: 证据等级标注
│   └── .gitkeep
│
├── audit/                    # Phase 3 输出: 审核报告
│   └── .gitkeep
│
└── schemas/                  # JSON Schema 模板
    ├── raw-chunk.json        #   原始知识块 Schema
    ├── food-entry.json       #   食物条目 Schema
    ├── diet-principle.json   #   饮食原则 Schema
    ├── meal-template.json    #   示范餐单 Schema
    ├── general-baseline.json #   普通人群基线 Schema
    ├── diet-assessment.json  #   饮食评估问题 Schema
    └── audit-report.json     #   审核报告 Schema
```

## 已完成的文件清单

| 文件 | 用途 | 状态 |
|------|------|------|
| `ARCHITECTURE.md` | 系统架构设计、Agent角色、实施路线图 | ✅ |
| `taxonomy.json` | 知识分类体系（9大类、50+子类） | ✅ |
| `pipeline.md` | Agent 协作协议、消息格式、流转规则 | ✅ |
| `schemas/raw-chunk.json` | 原始知识块的数据模板 | ✅ |
| `schemas/food-entry.json` | 食物营养素数据的标准格式 | ✅ |
| `schemas/diet-principle.json` | 饮食原则条目的标准格式 | ✅ |
| `schemas/meal-template.json` | 示范餐单的标准格式 | ✅ |
| `schemas/general-baseline.json` | 普通人基线指导的标准格式 | ✅ |
| `schemas/diet-assessment.json` | 饮食评估问题的标准格式 | ✅ |
| `schemas/audit-report.json` | 知识审核报告的标准格式 | ✅ |

## 下一步行动

等待你提供第一批原材料（书籍/网站），按 Phase B 开始知识摄入：

1. 中国居民膳食指南 2022
2. 中国食物成分表
3. 你持有的其他营养学书籍
4. 你关注的营养学网站

告诉我文件路径或URL，我会启动 Agent 流水线。
