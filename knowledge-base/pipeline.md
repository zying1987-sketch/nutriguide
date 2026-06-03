# Agent 协作协议 (Pipeline Protocol)

> 定义 5 个 Agent 之间的消息格式、流转规则和冲突解决机制。

---

## 消息格式

所有 Agent 间通信使用 JSON 消息，格式如下：

```json
{
  "from": "distiller|analyst|scientist|auditor|practitioner|integrator",
  "to": "agent_name",
  "type": "knowledge_chunk|structured_data|evidence_report|audit_report|practical_guidance|integration_output",
  "payload": { },
  "metadata": {
    "batch_id": "batch_20260602_001",
    "priority": "high|medium|low",
    "dependencies": ["chunk_001", "chunk_002"],
    "deadline": null
  }
}
```

---

## 流转规则

### 规则 1: 提取→结构化 (Distiller → Analyst + Scientist)

Distiller 产出 raw_chunk 后，同时发送给 Analyst 和 Scientist（并行处理）。

```
Distiller 产出 chunk_001.json
  ├→ Analyst: 结构化为 food/diet_principles 条目
  └→ Scientist: 验证科学性 + 证据分级
```

### 规则 2: 结构化→审核 (Analyst + Scientist → Auditor)

Analyst 和 Scientist 分别产出后，Auditor 收到两份数据，进行交叉比对。

```
Analyst 产出 food_001.json
Scientist 产出 evidence_food_001.json
  └→ Auditor: 比对一致性 → 产出 audit_001.json
```

### 规则 3: 审核→实战 (Auditor → Practitioner + Integrator)

审核通过的知识条目同时送入实战师和集成器。

```
Auditor 产出 audit_001.json (approved)
  ├→ Practitioner: 转化为餐单/饮食建议
  └→ Integrator: 生成 .ts 数据文件
```

### 规则 4: 实战→集成 (Practitioner → Integrator)

Practitioner 产出的餐单模板和饮食建议最终交给 Integrator 统一编译。

---

## 冲突解决机制

当 Scientist 和 Auditor 产生分歧时：

| 情况 | 处理方式 |
|------|---------|
| 证据等级不同 | 更高等级优先 |
| 同等证据，不同结论 | Auditor 标记为「争议」+ 保留双方立场 |
| 新证据与旧结论矛盾 | 优先新证据，标记旧结论为「待复核」 |
| 来源不可靠 | Auditor 降级置信度 + 注释警告 |

实战师在遇到「争议」标记时：
- 如影响用户安全 → 采用更保守的建议
- 如仅为学术分歧 → 说明两种观点，让用户知情选择

---

## 批次管理

每个批次（batch）对应一次完整知识摄入周期：

```
batch_20260602_001/
├── manifest.json          # 批次清单
├── raw_chunks/            # Distiller 输出
├── structured/            # Analyst 输出
├── evidence/              # Scientist 输出
├── audit/                 # Auditor 输出
├── practical/             # Practitioner 输出
└── output/                # Integrator 最终输出 (.ts 文件)
```

---

## 状态流转

每条知识的状态生命周期：

```
[raw] → [structured] → [validated] → [audited] → [integrated]
  │         │              │             │             │
  │         │              │             │             └─ 已部署到前端
  │         │              │             └─ 审核通过/驳回
  │         │              └─ 科学家验证完成
  │         └─ 数据结构化完成
  └─ 从原材料提取
```

任何阶段发现重大问题 → 回退到上游重新处理。
