const express = require('express')
const router = express.Router()
const { getDb } = require('../db/setup')
const { sendVerificationCode } = require('../services/email')
const crypto = require('crypto')

// 生成6位数字验证码
function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

// 发送验证码
router.post('/send-code', async (req, res) => {
  try {
    const { email } = req.body
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: '请提供有效的邮箱地址' })
    }

    const db = getDb()

    // 检查是否已有注册用户（邮箱已存在且已验证）
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existingUser) {
      return res.status(409).json({ error: '该邮箱已注册' })
    }

    // 检查60秒内是否已发送过验证码（防刷）
    const recent = db.prepare(
      "SELECT id FROM verification_codes WHERE email = ? AND created_at > datetime('now', '-60 seconds')"
    ).get(email)
    if (recent) {
      return res.status(429).json({ error: '请60秒后再试' })
    }

    // 生成并存储验证码
    const code = generateCode()
    db.prepare(
      "INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, datetime('now', '+10 minutes'))"
    ).run(email, code)

    // 发送邮件
    const result = await sendVerificationCode(email, code)

    // 开发模式下返回验证码（生产环境 SMTP 配置后不会返回）
    res.json({
      message: '验证码已发送',
      ...(result.preview ? { _dev_code: result.preview } : {}),
    })
  } catch (err) {
    console.error('发送验证码失败:', err)
    res.status(500).json({ error: '发送验证码失败，请稍后重试' })
  }
})

// 验证验证码
router.post('/verify-code', (req, res) => {
  try {
    const { email, code } = req.body
    if (!email || !code) {
      return res.status(400).json({ error: '请提供邮箱和验证码' })
    }

    const db = getDb()

    // 查找有效的验证码
    const record = db.prepare(
      "SELECT * FROM verification_codes WHERE email = ? AND code = ? AND used = 0 AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1"
    ).get(email, code)

    if (!record) {
      return res.status(400).json({ error: '验证码无效或已过期' })
    }

    // 标记为已使用
    db.prepare('UPDATE verification_codes SET used = 1 WHERE id = ?').run(record.id)

    res.json({ message: '验证成功', verified: true })
  } catch (err) {
    console.error('验证码校验失败:', err)
    res.status(500).json({ error: '验证失败，请稍后重试' })
  }
})

module.exports = router
