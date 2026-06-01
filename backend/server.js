const express = require('express')
const path = require('path')
const cors = require('cors')
const { getDb } = require('./db/setup')

const authRoutes = require('./routes/auth')
const assessmentRoutes = require('./routes/assessment')
const adminRoutes = require('./routes/admin')

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

// 路由挂载
app.use('/api/auth', authRoutes)
app.use('/api/assessments', assessmentRoutes)
app.use('/api/admin', adminRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 托管前端静态文件（必须在 API 路由之后、SPA fallback 之前）
const PUBLIC_DIR = path.join(__dirname, 'public')
app.use(express.static(PUBLIC_DIR))

// SPA fallback：非 /api 请求返回 index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  const indexPath = path.join(PUBLIC_DIR, 'index.html')
  res.sendFile(indexPath, err => {
    if (err) next()
  })
})

// Generate plan endpoint - 调用免费 LLM API
app.post('/api/generate-plan', async (req, res) => {
  const { prompt } = req.body

  if (!prompt) {
    return res.status(400).json({ error: '缺少prompt参数' })
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY

  // 如果没有API key，尝试使用免费模型或者直接返回错误让前端fallback到本地方案
  if (!apiKey) {
    // 尝试 Google Gemini 免费 API (无需key的低配额模式在某些条件下可能)
    // 或 DeepSeek 免费 API
    try {
      // 尝试 DeepSeek 免费 API
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // DeepSeek 免费API - 如果没有key，尝试不发送Authorization
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一位专业的注册营养师，精通功能医学、营养科学和循证医学。请基于用户画像和知识库数据，生成专业、温暖、实用的营养方案。你的建议应基于科学证据，同时注意区分必须/可选补充，标注药物间隔和注意事项。'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 3000,
        }),
      })

      if (!response.ok) throw new Error('DeepSeek API调用失败')

      const data = await response.json()
      const plan = data.choices?.[0]?.message?.content

      if (plan) {
        return res.json({ plan, model: 'deepseek-chat' })
      }
    } catch (e) {
      console.log('DeepSeek API不可用:', e.message)
    }

    // 所有API都不可用，返回错误让前端使用本地模板
    return res.status(503).json({
      error: 'LLM服务暂时不可用，请使用本地生成的方案。需要设置 GEMINI_API_KEY 或 DEEPSEEK_API_KEY 环境变量。'
    })
  }

  // 有API key时尝试调用
  try {
    // 优先尝试 DeepSeek（因为便宜）
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的注册营养师，精通功能医学、营养科学和循证医学。请基于用户画像和知识库数据，生成专业、温暖、实用的营养方案。'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    })

    if (deepseekResponse.ok) {
      const data = await deepseekResponse.json()
      return res.json({ plan: data.choices?.[0]?.message?.content, model: 'deepseek-chat' })
    }

    // Fallback: 尝试 Gemini
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 3000 },
        }),
      }
    )

    if (!geminiResponse.ok) throw new Error('所有LLM API调用失败')

    const geminiData = await geminiResponse.json()
    const plan = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!plan) throw new Error('Gemini 返回空内容')

    return res.json({ plan, model: 'gemini-2.0-flash' })

  } catch (error) {
    console.error('LLM API错误:', error.message)
    return res.status(503).json({ error: '生成方案失败，请使用本地方案或稍后重试。' })
  }
})

app.listen(PORT, () => {
  console.log(`NutriGuide Backend running on http://localhost:${PORT}`)
  console.log(`API endpoint: http://localhost:${PORT}/api/generate-plan`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
  console.log('')
  if (!process.env.GEMINI_API_KEY && !process.env.DEEPSEEK_API_KEY && !process.env.LLM_API_KEY) {
    console.log('⚠️  未设置LLM API Key，将使用本地模板方案')
    console.log('   设置环境变量启用AI方案: GEMINI_API_KEY 或 DEEPSEEK_API_KEY')
    console.log('   Gemini免费额度: https://aistudio.google.com/apikey')
    console.log('   DeepSeek: https://platform.deepseek.com/api_keys')
  }
})
