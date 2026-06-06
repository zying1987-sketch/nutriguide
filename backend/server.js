const express = require('express')
const path = require('path')
const cors = require('cors')
require('dotenv').config()
const { getDb } = require('./db/setup')

const authRoutes = require('./routes/auth')
const assessmentRoutes = require('./routes/assessment')
const adminRoutes = require('./routes/admin')
const verifyRoutes = require('./routes/verify')
const creditsRoutes = require('./routes/credits')
const chatRoutes = require('./routes/chat')
const KB = require('./knowledge-base-loader')

const app = express()
const PORT = process.env.PORT || 3001

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:4173'].filter(Boolean)
    : true,
  credentials: true,
}
app.use(cors(corsOptions))
app.use(express.json({ limit: '10mb' }))

// 初始化数据库
getDb()
KB.loadKnowledgeBase()

// 路由挂载
app.use('/api/auth', authRoutes)
app.use('/api/verify', verifyRoutes)
app.use('/api/assessments', assessmentRoutes)
// 覆盖 admin users API: 确保返回 wechat_id 和 phone（必须在 adminRoutes mount 之前）
app.get('/api/admin/users', require('./middleware/auth').requireAdmin, (req, res) => {
  console.log('[INLINE ADMIN] users API hit!')
  const db = getDb()
  const page = parseInt(req.query.page) || 1
  const limit = 20
  const offset = (page - 1) * limit
  const search = req.query.search || ''
  let users, total
  if (search) {
    users = db.prepare(`
      SELECT u.id, u.email, u.name, u.phone, u.wechat_id, u.role, u.created_at,
        (SELECT COUNT(*) FROM assessments WHERE user_id = u.id) as assessment_count,
        (SELECT COUNT(*) FROM plans WHERE user_id = u.id) as plan_count
      FROM users u WHERE u.email LIKE ? OR u.name LIKE ?
      ORDER BY u.created_at DESC LIMIT ? OFFSET ?
    `).all('%' + search + '%', '%' + search + '%', limit, offset)
    total = db.prepare('SELECT COUNT(*) as count FROM users WHERE email LIKE ? OR name LIKE ?').get('%' + search + '%', '%' + search + '%')
  } else {
    users = db.prepare(`
      SELECT u.id, u.email, u.name, u.phone, u.wechat_id, u.role, u.created_at,
        (SELECT COUNT(*) FROM assessments WHERE user_id = u.id) as assessment_count,
        (SELECT COUNT(*) FROM plans WHERE user_id = u.id) as plan_count
      FROM users u ORDER BY u.created_at DESC LIMIT ? OFFSET ?
    `).all(limit, offset)
    total = db.prepare('SELECT COUNT(*) as count FROM users').get()
  }
  res.json({ users, total: total.count, page, totalPages: Math.ceil(total.count / limit) })
})

// 覆盖 admin user detail API
app.get('/api/admin/users/:id', require('./middleware/auth').requireAdmin, (req, res) => {
  const db = getDb()
  const user = db.prepare('SELECT id, email, name, phone, wechat_id, role, created_at FROM users WHERE id = ?').get(req.params.id)
  if (!user) return res.status(404).json({ error: '用户不存在' })
  const agreement = db.prepare('SELECT agreement_type, version, accepted_at, ip_address FROM agreement_records WHERE user_id = ? ORDER BY accepted_at DESC LIMIT 1').get(req.params.id)
  const credits = db.prepare('SELECT balance, total_purchased, total_used FROM user_credits WHERE user_id = ?').get(req.params.id)
  const assessments = db.prepare('SELECT id, created_at, result FROM assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT 10').all(req.params.id)
  const plans = db.prepare('SELECT id, population_tags, created_at FROM plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 10').all(req.params.id)
  res.json({ user: { ...user, agreement, credits }, assessments, plans })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 挂载其他路由
app.use('/api/admin', adminRoutes)
app.use('/api/credits', creditsRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/invite', require('./routes/invite'))
app.use('/api/profile', require('./routes/profile'))
app.use('/api/food-wiki', require('./routes/food-wiki'))
app.use('/api/knowledge', require('./routes/knowledge'))

// 托管前端静态文件（必须在 API 路由之后、SPA fallback 之前）
const PUBLIC_DIR = path.join(__dirname, 'public')
app.use(express.static(PUBLIC_DIR))

// SPA fallback：非 /api 请求返回 index.html
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  const indexPath = path.join(PUBLIC_DIR, 'index.html')
  res.sendFile(indexPath, err => {
    if (err) next()
  })
})

// ============================================================
// Generate Plan — LLM 增强报告
// ============================================================

const SYSTEM_PROMPT = `你是一位资深注册营养师（RDN），拥有15年功能医学和循证营养学临床经验。
你的任务是基于用户的自测数据，生成一份专业、简洁、可执行的营养干预方案。

# 报告结构（严格按此输出，必须简洁）
## 一、用户画像（1段，≤80字）
一句话总结用户核心特征+主要风险+已确诊疾病。

## 二、核心问题诊断（3-5条，每条≤40字）
用列表形式，每条格式：**问题** — 简要原因 → 若不干预的后果

## 三、营养素补充建议（表格，这是报告核心）
只输出真正需要的项目，用简洁表格：

### 🔴 必须补充
| 营养素 | 剂量 | 时间 | 注意 |
|--------|------|------|------|

### 🟡 建议补充
| 营养素 | 剂量 | 时间 | 注意 |

### 🟢 可选补充
| 营养素 | 剂量 | 时间 | 注意 |

## 四、饮食改善重点（精简，最多5条，每条≤35字）
不用按周拆分。列出最关键的行动项：
- 吃什么：具体食物（如"每天1个鸡蛋+1杯奶"）
- 不吃什么：具体避雷项
- 怎么吃：烹饪/搭配技巧

## 五、生活方式（3条，每条≤25字）
- 运动
- 睡眠
- 压力

## 六、复查建议（≤3行）
- 建议复查的项目和时间
- 什么情况需就医

# 输出规则
- **必须简洁**：整篇报告控制在600-800字以内，像一份快速参考卡片。
- **不要长篇大论**：避免"建议多吃蔬菜水果"之类的废话，要给出具体食物名称和用量。
- **表格优于文字**：补充剂必须用表格，便于用户快速查阅。
- **剂量准确**：标注mg、μg、IU等精确单位，不可模糊。
- **语气温暖专业**：像关心你的营养师在写便利贴。
- **未知信息标注**："未提供，建议补充"——不要编造。
- **用Markdown**：标题用##，表格用|，重点用**加粗**。
- **报告末尾必须附上**："> ⚠️ 本方案由AI生成，不替代执业医师诊断。使用补充剂前请咨询医生或注册营养师。"`

async function callLLM(prompt, knowledgeContext = '', retries = 2) {
  const errors = []

  // ---------- 通义千问（阿里云百炼，国内直连，免费额度充足）----------
  if (process.env.DASHSCOPE_API_KEY) {
    for (let i = 0; i <= retries; i++) {
      try {
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
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: knowledgeContext ? `${knowledgeContext}\n\n用户问题：${prompt}` : prompt },
              ],
              temperature: 0.7,
              max_tokens: 1200,
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
        if (text) return { plan: text, model: 'qwen-plus' }
        throw new Error('Qwen 返回空内容')
      } catch (e) {
        errors.push(`Qwen: ${e.message}`)
      }
    }
  }

  // ---------- DeepSeek（备选，便宜效果好）----------
  if (process.env.DEEPSEEK_API_KEY) {
    for (let i = 0; i <= retries; i++) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: knowledgeContext ? `${knowledgeContext}\n\n${SYSTEM_PROMPT}\n\n${prompt}` : SYSTEM_PROMPT + '\n\n' + prompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 4096, topP: 0.95 },
            }),
            signal: AbortSignal.timeout(30000),
          }
        )
        if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`)
        const data = await res.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) return { plan: text, model: 'gemini-2.0-flash' }
        throw new Error('Gemini 返回空内容')
      } catch (e) {
        errors.push(`Gemini: ${e.message}`)
      }
    }
  }

  // ---------- DeepSeek（便宜，效果好）----------
  if (process.env.DEEPSEEK_API_KEY) {
    for (let i = 0; i <= retries; i++) {
      try {
        const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: knowledgeContext ? `${knowledgeContext}\n\n用户问题：${prompt}` : prompt },
            ],
            temperature: 0.7,
            max_tokens: 4096,
          }),
          signal: AbortSignal.timeout(60000),
        })
        if (!res.ok) throw new Error(`DeepSeek HTTP ${res.status}`)
        const data = await res.json()
        const text = data.choices?.[0]?.message?.content
        if (text) return { plan: text, model: 'deepseek-chat' }
        throw new Error('DeepSeek 返回空内容')
      } catch (e) {
        errors.push(`DeepSeek: ${e.message}`)
      }
    }
  }

  return { error: `所有 LLM 不可用: ${errors.join('; ')}` }
}

app.post('/api/generate-plan', async (req, res) => {
  const { prompt, userData } = req.body

  if (!prompt && !userData) {
    return res.status(400).json({ error: '缺少评估数据' })
  }

  // 如果没有 API Key，直接返回让前端用本地模板
  if (!process.env.DASHSCOPE_API_KEY && !process.env.DEEPSEEK_API_KEY && !process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: '未配置 LLM API Key，使用本地模板方案',
      hint: '设置 DASHSCOPE_API_KEY（通义千问/阿里百炼，国内直连）、DEEPSEEK_API_KEY 或 GEMINI_API_KEY 环境变量即可启用 AI 报告',
    })
  }

  // 构建 prompt
  const finalPrompt = prompt || JSON.stringify(userData, null, 2)

  console.log(`生成方案中... (Qwen: ${!!process.env.DASHSCOPE_API_KEY}, DeepSeek: ${!!process.env.DEEPSEEK_API_KEY}, Gemini: ${!!process.env.GEMINI_API_KEY})`)
  const result = await callLLM(finalPrompt)

  if (result.error) {
    console.error('LLM 调用失败:', result.error)
    return res.status(503).json({ error: result.error })
  }

  console.log(`方案生成成功 (${result.model})，长度: ${result.plan.length} 字符`)
  res.json(result)
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`NutriGuide Backend running on http://localhost:${PORT}`)
  console.log(`API endpoint: http://localhost:${PORT}/api/generate-plan`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
  console.log('')
  if (!process.env.DASHSCOPE_API_KEY && !process.env.DEEPSEEK_API_KEY && !process.env.GEMINI_API_KEY) {
    console.log('⚠️  未设置LLM API Key，将使用本地模板方案')
    console.log('   设置环境变量启用AI方案: DASHSCOPE_API_KEY (通义千问) 或 DEEPSEEK_API_KEY')
    console.log('   通义千问/阿里百炼: https://dashscope.aliyun.com')
    console.log('   DeepSeek: https://platform.deepseek.com/api_keys')
  }
})
