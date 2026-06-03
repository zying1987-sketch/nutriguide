const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { getDb } = require('../db/setup')
const { requireAuth, JWT_SECRET } = require('../middleware/auth')

const router = express.Router()

// 注册（需先验证邮箱）
router.post('/register', async (req, res) => {
  const { email, password, name, code } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: '邮箱和密码不能为空' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少6位' })
  }

  if (!code) {
    return res.status(400).json({ error: '请先完成邮箱验证' })
  }

  const db = getDb()

  // 检查邮箱是否已注册
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) {
    return res.status(409).json({ error: '该邮箱已注册' })
  }

  // 验证验证码
  const record = db.prepare(
    "SELECT * FROM verification_codes WHERE email = ? AND code = ? AND used = 0 AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1"
  ).get(email, code)

  if (!record) {
    return res.status(400).json({ error: '验证码无效或已过期，请重新获取' })
  }

  // 标记验证码已使用
  db.prepare('UPDATE verification_codes SET used = 1 WHERE id = ?').run(record.id)

  const passwordHash = await bcrypt.hash(password, 10)

  const result = db.prepare(
    'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)'
  ).run(email, passwordHash, name || email.split('@')[0], 'user')

  // 新用户赠送 3 积分
  db.prepare(
    'INSERT INTO user_credits (user_id, balance, total_purchased) VALUES (?, 3, 3)'
  ).run(result.lastInsertRowid)

  const token = jwt.sign(
    { id: result.lastInsertRowid, email, role: 'user' },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.status(201).json({
    token,
    user: { id: result.lastInsertRowid, email, name: name || email.split('@')[0], role: 'user' }
  })
})

// 登录
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: '邮箱和密码不能为空' })
  }

  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)

  if (!user) {
    return res.status(401).json({ error: '邮箱或密码错误' })
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return res.status(401).json({ error: '邮箱或密码错误' })
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  })
})

// 获取当前用户信息
router.get('/me', requireAuth, (req, res) => {
  const db = getDb()
  const user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(req.user.id)

  if (!user) {
    return res.status(404).json({ error: '用户不存在' })
  }

  const credits = db.prepare('SELECT balance FROM user_credits WHERE user_id = ?').get(req.user.id)

  res.json({
    user: {
      ...user,
      credits: credits?.balance ?? 0,
    }
  })
})

// 更新用户信息
router.put('/me', requireAuth, (req, res) => {
  const { name } = req.body
  const db = getDb()

  db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name || '', req.user.id)

  const user = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(req.user.id)
  res.json({ user })
})

module.exports = router
