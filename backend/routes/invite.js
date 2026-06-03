const express = require('express')
const crypto = require('crypto')
const { getDb } = require('../db/setup')
const { requireAuth, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// 生成随机邀请码（8位，字母+数字，易读 — 排除 0/O/1/I）
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  const bytes = crypto.randomBytes(8)
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length]
  }
  return code
}

// 生成邀请码（仅管理员）
router.post('/generate', requireAuth, requireAdmin, (req, res) => {
  const { count = 1 } = req.body
  const num = Math.min(Math.max(parseInt(count) || 1, 1), 100) // 限制 1-100

  const db = getDb()
  const insert = db.prepare('INSERT INTO invite_codes (code, created_by) VALUES (?, ?)')
  const codes = []

  for (let i = 0; i < num; i++) {
    let code
    let attempts = 0
    // 防止碰撞，最多重试 10 次
    do {
      code = generateCode()
      attempts++
    } while (
      db.prepare('SELECT id FROM invite_codes WHERE code = ?').get(code) &&
      attempts < 10
    )
    if (attempts >= 10) continue // 极端情况跳过
    insert.run(code, req.user.id)
    codes.push(code)
  }

  res.json({ codes, count: codes.length })
})

// 校验邀请码（公开接口，注册时调用）
router.post('/validate', (req, res) => {
  const { code } = req.body
  if (!code || typeof code !== 'string' || code.length !== 8) {
    return res.status(400).json({ valid: false, error: '邀请码格式不正确' })
  }

  const db = getDb()
  const record = db.prepare(
    'SELECT id, used_by, used_at FROM invite_codes WHERE code = ?'
  ).get(code.toUpperCase())

  if (!record) {
    return res.json({ valid: false, error: '邀请码无效' })
  }

  if (record.used_by !== null) {
    const usedAt = record.used_at || '未知时间'
    return res.json({ valid: false, error: `该邀请码已于 ${usedAt} 被使用` })
  }

  res.json({ valid: true })
})

// 列出邀请码（仅管理员）
router.get('/list', requireAuth, requireAdmin, (req, res) => {
  const db = getDb()
  const codes = db.prepare(`
    SELECT ic.id, ic.code, ic.used_by, ic.used_at, ic.created_at,
      creator.name as creator_name,
      used_user.email as used_email
    FROM invite_codes ic
    LEFT JOIN users creator ON ic.created_by = creator.id
    LEFT JOIN users used_user ON ic.used_by = used_user.id
    ORDER BY ic.created_at DESC
    LIMIT 50
  `).all()

  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN used_by IS NOT NULL THEN 1 ELSE 0 END) as used,
      SUM(CASE WHEN used_by IS NULL THEN 1 ELSE 0 END) as available
    FROM invite_codes
  `).get()

  res.json({ codes, stats })
})

module.exports = router
