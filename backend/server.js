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
app.use('/api/admin', adminRoutes)
app.use('/api/credits', creditsRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/invite', require('./routes/invite'))
app.use('/api/food-wiki', require('./routes/food-wiki'))
app.use('/api/knowledge', require('./routes/knowledge'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

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
你的任务是基于用户的自测数据，生成一份专业、个性化、可执行的营养干预方案。

# 报告结构（必须严格按此输出）
## 一、用户画像摘要
用一段话总结用户的核心健康特征、风险因素、已确诊疾病。

## 二、核心营养问题诊断
列出 3-5 个最需要关注的营养/代谢问题，每个问题用 1-2 句话说明：
- 为什么这是问题
- 如果不干预可能的后果

## 三、营养素补充建议（分级）
按以下三类输出：

### 🔴 必须补充（强烈建议）
| 营养素 | 每日剂量 | 服用时间 | 注意事项 |
|--------|---------|---------|---------|

### 🟡 建议补充（根据情况）
| 营养素 | 每日剂量 | 服用时间 | 注意事项 |

### 🟢 可选补充（锦上添花）
| 营养素 | 每日剂量 | 服用时间 | 注意事项 |

## 四、28天饮食调整计划
按周输出核心原则：第1周 → 第2周 → 第3周 → 第4周
每周围绕一个主题，给出具体可执行的食物清单和避雷清单。

## 五、生活方式干预
- 运动建议（类型、频率、强度）
- 睡眠优化
- 压力管理
- 需要避开的习惯

## 六、监测指标与复诊建议
- 建议 4 周后复查的指标
- 什么情况需要就医
- 预期改善时间线

# 重要规则
- 所有建议必须基于科学证据，不推荐未经证实的疗法
- 如用户服用药物，必须标注营养素与药物的间隔时间
- 剂量用中国人熟悉的单位（mg、μg、IU、g）
- 语气温暖专业，像一位关心你的营养师在跟你说话
- 如无该信息，标注"信息缺失，建议补充"而不是编造`

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
              max_tokens: 2048,
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
