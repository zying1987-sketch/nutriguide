const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { getDb } = require('../db/setup')
const { requireAuth, JWT_SECRET } = require('../middleware/auth')

const router = express.Router()

// 注册（需先验证邮箱 + 邀请码 + 同意协议）
router.post('/register', async (req, res) => {
  const { email, password, name, phone, code, inviteCode, agreed } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: '邮箱和密码不能为空' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少6位' })
  }

  if (!code) {
    return res.status(400).json({ error: '请先完成邮箱验证' })
  }

  if (!agreed) {
    return res.status(400).json({ error: '请阅读并同意用户协议与免责声明' })
  }

  const db = getDb()

  // 检查邮箱是否已注册
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) {
    return res.status(409).json({ error: '该邮箱已注册' })
  }

  // 验证邀请码（首个用户无需邀请码，自动成为管理员）
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get()
  let inviteRecord = null

  if (userCount.count === 0) {
    // 第一个用户：不需要邀请码，自动设为管理员
    console.log('第一个注册用户，跳过邀请码校验，自动设为管理员')
  } else {
    if (!inviteCode || typeof inviteCode !== 'string' || inviteCode.length !== 8) {
      return res.status(400).json({ error: '请提供有效的邀请码' })
    }
    inviteRecord = db.prepare(
      'SELECT id, used_by FROM invite_codes WHERE code = ?'
    ).get(inviteCode.toUpperCase())
    if (!inviteRecord) {
      return res.status(400).json({ error: '邀请码无效' })
    }
    if (inviteRecord.used_by !== null) {
      return res.status(400).json({ error: '该邀请码已被使用' })
    }
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

  const role = userCount.count === 0 ? 'admin' : 'user'

  const result = db.prepare(
    'INSERT INTO users (email, password_hash, name, phone, role) VALUES (?, ?, ?, ?, ?)'
  ).run(email, passwordHash, name || email.split('@')[0], phone || '', role)

  // 记录协议签署
  db.prepare(
    'INSERT INTO agreement_records (user_id, agreement_type, version, ip_address) VALUES (?, ?, ?, ?)'
  ).run(result.lastInsertRowid, 'privacy', '2026.06', req.ip || '')

  // 新用户赠送 3 积分
  db.prepare(
    'INSERT INTO user_credits (user_id, balance, total_purchased) VALUES (?, 3, 3)'
  ).run(result.lastInsertRowid)

  // 标记邀请码已使用（首个管理员注册时没有邀请码，跳过）
  if (inviteRecord) {
    db.prepare("UPDATE invite_codes SET used_by = ?, used_at = datetime('now') WHERE id = ?")
      .run(result.lastInsertRowid, inviteRecord.id)
  }

  const token = jwt.sign(
    { id: result.lastInsertRowid, email, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  const credits = db.prepare('SELECT balance FROM user_credits WHERE user_id = ?').get(result.lastInsertRowid)

  res.status(201).json({
    token,
    user: { id: result.lastInsertRowid, email, name: name || email.split('@')[0], phone: phone || '', role, credits: credits?.balance ?? 0 }
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

  const credits = db.prepare('SELECT balance FROM user_credits WHERE user_id = ?').get(user.id)

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, phone: user.phone || '', role: user.role, credits: credits?.balance ?? 0 }
  })
})

// 获取当前用户信息
router.get('/me', requireAuth, (req, res) => {
  const db = getDb()
  const user = db.prepare('SELECT id, email, name, phone, role, created_at FROM users WHERE id = ?').get(req.user.id)

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
