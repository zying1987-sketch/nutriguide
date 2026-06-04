/**
 * 简单图形验证码服务（SVG 生成 + 内存存储）
 * 生成 4 位算术验证码，直接返回 SVG 图片
 */
const crypto = require('crypto')

// 内存存储（单实例够用，重启清空）
const captchaStore = new Map()

// 每 5 分钟清理过期
setInterval(() => {
  const now = Date.now()
  for (const [key, val] of captchaStore) {
    if (now > val.expires) captchaStore.delete(key)
  }
}, 5 * 60 * 1000)

function generateSimpleMath() {
  const a = Math.floor(Math.random() * 10) + 1
  const b = Math.floor(Math.random() * 10) + 1
  return { question: `${a} + ${b} = ?`, answer: String(a + b) }
}

function svgCaptcha(question) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40">
    <rect width="120" height="40" fill="#F8F6F3" rx="6"/>
    <text x="60" y="28" text-anchor="middle" font-family="monospace" font-size="20" font-weight="bold" fill="#1B2A4A">${question}</text>
    <line x1="10" y1="15" x2="110" y2="25" stroke="#E5E0D8" stroke-width="1"/>
    <line x1="15" y1="32" x2="100" y2="12" stroke="#D4CFC8" stroke-width="0.5"/>
  </svg>`
}

function captchaHandler(req, res) {
  const { question, answer } = generateSimpleMath()
  const token = crypto.randomBytes(12).toString('hex')
  captchaStore.set(token, { answer, expires: Date.now() + 5 * 60 * 1000 })

  res.json({
    token,
    question,
    svg: svgCaptcha(question),
  })
}

function verifyCaptcha(token, answer) {
  const record = captchaStore.get(token)
  if (!record) return false
  captchaStore.delete(token) // 一次性使用
  return record.answer === String(answer) && Date.now() < record.expires
}

module.exports = { captchaHandler, verifyCaptcha }
