const express = require('express')
const { getDb } = require('../db/setup')
const { requireAuth } = require('../middleware/auth')
const KB = require('../knowledge-base-loader')

const router = express.Router()

const CHAT_SYSTEM_PROMPT = `你是一位经验丰富的营养学顾问，拥有临床营养学背景。你的任务是用对话的方式帮助用户分析他们的身体状况，给出专业但易懂的营养学建议。

## 角色定位
- 你的风格：温暖、专业、务实。像一位真正关心你的营养师朋友
- 用中文回复，避免过于学术化的术语，但保持专业性
- 如果信息不足，你可以追问，但也要敢于给出基于常见情况的初步判断

## 回答框架
每次回复应包含：
1. **初步分析**：根据用户描述，可能涉及哪些营养素问题（2-3 点）
2. **饮食建议**：具体到食物层面的改善建议（3-5 条）
3. **补充注意事项**：如果涉及补充剂，说明合理剂量和安全范围
4. **追问**：如果有信息不足，礼貌追问 1-2 个关键问题

## 重要规则
- 所有建议基于循证营养学，不推荐未经验证的疗法
- 剂量使用中国人熟悉的单位（mg、μg、IU、g）
- 如用户服用药物，提醒营养素与药物的间隔
- 如症状严重，建议就医（不要替代医疗诊断）
- 回复长度控制在 300-500 字，保持对话感
- 如果不确定，诚实说"这超出了我的知识范围"`

// AI 即时咨询
router.post('/ask', requireAuth, async (req, res) => {
  const { question } = req.body

  // 搜索知识库
  const kbEntries = KB.searchKnowledge(question, 5)
  const knowledgeContext = KB.formatKnowledgeContext(kbEntries)

  if (!question || question.trim().length < 10) {
    return res.status(400).json({ error: '请至少输入 10 个字描述你的情况' })
  }

  const db = getDb()

  // 检查积分
  let credits = db.prepare('SELECT * FROM user_credits WHERE user_id = ?').get(req.user.id)
  if (!credits || credits.balance < 1) {
    return res.status(402).json({
      error: '积分不足',
      balance: credits?.balance || 0,
      hint: '请购买积分后继续咨询',
    })
  }

  // 扣积分
  db.prepare(
    'UPDATE user_credits SET balance = balance - 1, total_used = total_used + 1, updated_at = datetime(\'now\') WHERE user_id = ?'
  ).run(req.user.id)

  // 调用 LLM
  try {
    const result = await callChatLLM(question, knowledgeContext)

    // 保存对话记录
    db.prepare(
      'INSERT INTO ai_chats (user_id, question, answer, model, credits_used) VALUES (?, ?, ?, ?, 1)'
    ).run(req.user.id, question, result.answer, result.model)

    // 返回最新余额
    credits = db.prepare('SELECT * FROM user_credits WHERE user_id = ?').get(req.user.id)

    res.json({
      answer: result.answer,
      model: result.model,
      balance: credits.balance,
    })
  } catch (e) {
    // LLM 调用失败，退还积分
    db.prepare(
      'UPDATE user_credits SET balance = balance + 1, total_used = total_used - 1, updated_at = datetime(\'now\') WHERE user_id = ?'
    ).run(req.user.id)

    console.error('AI 咨询调用失败:', e.message)
    res.status(500).json({
      error: 'AI 服务暂时不可用，积分已退还',
      detail: e.message,
    })
  }
})

// 对话历史
router.get('/history', requireAuth, (req, res) => {
  const db = getDb()
  const chats = db.prepare(
    'SELECT id, question, answer, model, credits_used, created_at FROM ai_chats WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
  ).all(req.user.id)

  res.json({ chats })
})

async function callChatLLM(question, knowledgeContext = '') {
  if (!process.env.DASHSCOPE_API_KEY) {
    throw new Error('未配置 DASHSCOPE_API_KEY')
  }

  const res = await fetch(
    'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages: [
          { role: 'system', content: CHAT_SYSTEM_PROMPT },
          { role: 'user', content: knowledgeContext ? `${knowledgeContext}\n\n用户问题：${question}` : question },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
      signal: AbortSignal.timeout(90000),
    }
  )

  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    throw new Error(`Qwen HTTP ${res.status}: ${errBody.slice(0, 200)}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content

  if (!text) throw new Error('Qwen 返回空内容')

  return { answer: text, model: 'qwen-plus' }
}

module.exports = router
