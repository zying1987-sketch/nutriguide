const express = require('express')
const { getDb } = require('../db/setup')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

// 所有管理路由都需要管理员权限
router.use(requireAdmin)

// 获取统计数据
router.get('/stats', (req, res) => {
  const db = getDb()
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get()
  const totalAssessments = db.prepare('SELECT COUNT(*) as count FROM assessments').get()
  const totalPlans = db.prepare('SELECT COUNT(*) as count FROM plans').get()
  const todayAssessments = db.prepare(
    "SELECT COUNT(*) as count FROM assessments WHERE date(created_at) = date('now')"
  ).get()

  res.json({
    totalUsers: totalUsers.count,
    totalAssessments: totalAssessments.count,
    totalPlans: totalPlans.count,
    todayAssessments: todayAssessments.count
  })
})

// 用户列表（分页）
router.get('/users', (req, res) => {
  const db = getDb()
  const page = parseInt(req.query.page) || 1
  const limit = 20
  const offset = (page - 1) * limit
  const search = req.query.search || ''

  let users, total
  if (search) {
    users = db.prepare(
      `SELECT u.id, u.email, u.name, u.role, u.created_at,
        (SELECT COUNT(*) FROM assessments WHERE user_id = u.id) as assessment_count,
        (SELECT COUNT(*) FROM plans WHERE user_id = u.id) as plan_count
      FROM users u
      WHERE u.email LIKE ? OR u.name LIKE ?
      ORDER BY u.created_at DESC LIMIT ? OFFSET ?`
    ).all(`%${search}%`, `%${search}%`, limit, offset)

    total = db.prepare(
      'SELECT COUNT(*) as count FROM users WHERE email LIKE ? OR name LIKE ?'
    ).get(`%${search}%`, `%${search}%`)
  } else {
    users = db.prepare(
      `SELECT u.id, u.email, u.name, u.role, u.created_at,
        (SELECT COUNT(*) FROM assessments WHERE user_id = u.id) as assessment_count,
        (SELECT COUNT(*) FROM plans WHERE user_id = u.id) as plan_count
      FROM users u
      ORDER BY u.created_at DESC LIMIT ? OFFSET ?`
    ).all(limit, offset)

    total = db.prepare('SELECT COUNT(*) as count FROM users').get()
  }

  res.json({
    users,
    total: total.count,
    page,
    totalPages: Math.ceil(total.count / limit)
  })
})

// 查看某个用户的详细数据
router.get('/users/:id', (req, res) => {
  const db = getDb()

  const user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(req.params.id)
  if (!user) {
    return res.status(404).json({ error: '用户不存在' })
  }

  const assessments = db.prepare(
    'SELECT id, created_at, result FROM assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT 10'
  ).all(req.params.id)

  const plans = db.prepare(
    'SELECT id, population_tags, created_at FROM plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 10'
  ).all(req.params.id)

  res.json({ user, assessments, plans })
})

// 获取某个用户的自测详情
router.get('/users/:userId/assessments/:id', (req, res) => {
  const db = getDb()
  const record = db.prepare(
    'SELECT * FROM assessments WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.params.userId)

  if (!record) {
    return res.status(404).json({ error: '记录不存在' })
  }

  res.json({
    id: record.id,
    stepData: JSON.parse(record.step_data),
    result: record.result ? JSON.parse(record.result) : null,
    createdAt: record.created_at
  })
})

module.exports = router
