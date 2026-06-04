const express = require('express')
const { getDb } = require('../db/setup')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

// 获取当前用户资料
router.get('/', requireAuth, (req, res) => {
  const db = getDb()
  let profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.user.id)

  if (!profile) {
    // 从 users 表补充基础信息
    const user = db.prepare('SELECT name, gender, age, phone FROM users WHERE id = ?').get(req.user.id)
    profile = {
      user_id: req.user.id,
      display_name: user?.name || '',
      gender: user?.gender || '',
      age: user?.age || null,
      height: null,
      weight: null,
      city: '',
      birth_date: '',
    }
  }

  // 同时返回 wechat_id（从 users 表取，不可修改）
  const user = db.prepare('SELECT wechat_id, email, phone FROM users WHERE id = ?').get(req.user.id)
  res.json({
    profile,
    wechatId: user?.wechat_id || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
})

// 更新用户资料（昵称、性别、出生日期、身高、体重、城市）
router.put('/', requireAuth, (req, res) => {
  const { displayName, gender, birthDate, height, weight, city } = req.body
  const db = getDb()

  // upsert user_profiles
  const existing = db.prepare('SELECT id FROM user_profiles WHERE user_id = ?').get(req.user.id)

  if (existing) {
    db.prepare(`
      UPDATE user_profiles SET
        display_name = ?, gender = ?, birth_date = ?, height = ?, weight = ?, city = ?,
        updated_at = datetime('now')
      WHERE user_id = ?
    `).run(
      displayName ?? '', gender ?? '', birthDate ?? '', height ?? null, weight ?? null, city ?? '',
      req.user.id
    )
  } else {
    db.prepare(`
      INSERT INTO user_profiles (user_id, display_name, gender, birth_date, height, weight, city)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id, displayName ?? '', gender ?? '', birthDate ?? '', height ?? null, weight ?? null, city ?? ''
    )
  }

  // 同步更新 users.name
  if (displayName !== undefined) {
    db.prepare('UPDATE users SET name = ? WHERE id = ?').run(displayName, req.user.id)
  }

  res.json({ success: true, message: '资料已更新' })
})

module.exports = router
