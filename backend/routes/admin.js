const express = require('express')
const { getDb } = require('../db/setup')
const { requireAuth, requireAdmin } = require('../middleware/auth')

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
    users = db.prepare(`
      SELECT u.id, u.email, u.name, u.phone, u.wechat_id, u.role, u.created_at,
        (SELECT COUNT(*) FROM assessments WHERE user_id = u.id) as assessment_count,
        (SELECT COUNT(*) FROM plans WHERE user_id = u.id) as plan_count
      FROM users u
      WHERE u.email LIKE ? OR u.name LIKE ?
      ORDER BY u.created_at DESC LIMIT ? OFFSET ?
    `).all(`%${search}%`, `%${search}%`, limit, offset)

    total = db.prepare(
      'SELECT COUNT(*) as count FROM users WHERE email LIKE ? OR name LIKE ?'
    ).get(`%${search}%`, `%${search}%`)
  } else {
    users = db.prepare(`
      SELECT u.id, u.email, u.name, u.phone, u.wechat_id, u.role, u.created_at,
        (SELECT COUNT(*) FROM assessments WHERE user_id = u.id) as assessment_count,
        (SELECT COUNT(*) FROM plans WHERE user_id = u.id) as plan_count
      FROM users u
      ORDER BY u.created_at DESC LIMIT ? OFFSET ?
    `).all(limit, offset)

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

  const user = db.prepare('SELECT id, email, name, phone, wechat_id, role, created_at FROM users WHERE id = ?').get(req.params.id)
  if (!user) return res.status(404).json({ error: '用户不存在' })

  const agreement = db.prepare(
    'SELECT agreement_type, version, accepted_at, ip_address FROM agreement_records WHERE user_id = ? ORDER BY accepted_at DESC LIMIT 1'
  ).get(req.params.id)

  const credits = db.prepare('SELECT balance, total_purchased, total_used FROM user_credits WHERE user_id = ?').get(req.params.id)

  const assessments = db.prepare(
    'SELECT id, created_at, result FROM assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT 10'
  ).all(req.params.id)

  const plans = db.prepare(
    'SELECT id, population_tags, created_at FROM plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 10'
  ).all(req.params.id)

  res.json({ user: { ...user, agreement, credits }, assessments, plans })
})

// 导出用户数据为 CSV
router.get('/export/users', requireAuth, requireAdmin, (req, res) => {
  const db = getDb()
  const users = db.prepare(`
    SELECT
      u.id, u.email, u.phone, u.wechat_id, u.name, u.role, u.created_at,
      p.display_name, p.gender, p.birth_date, p.height, p.weight, p.city,
      c.balance as credits,
      (SELECT COUNT(*) FROM assessments a WHERE a.user_id = u.id) as assessments,
      (SELECT MAX(a.created_at) FROM assessments a WHERE a.user_id = u.id) as last_test
    FROM users u
    LEFT JOIN user_profiles p ON u.id = p.user_id
    LEFT JOIN user_credits c ON u.id = c.user_id
    ORDER BY u.id
  `).all()

  const headers = ['用户ID', '邮箱', '手机号', '微信号', '名称', '角色', '注册时间',
    '显示名', '性别', '生日', '身高(cm)', '体重(kg)', '城市', '积分', '自测次数', '最后自测时间']

  const csvRows = [headers.join(',')]
  for (const u of users) {
    const row = [
      u.id, u.email || '', u.phone || '', u.wechat_id || '', u.name || '', u.role, u.created_at,
      u.display_name || '', u.gender || '', u.birth_date || '', u.height || '', u.weight || '',
      u.city || '', u.credits || 0, u.assessments, u.last_test || ''
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    csvRows.push(row)
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="nutriguide_users_${new Date().toISOString().slice(0,10)}.csv"`)
  res.send('\uFEFF' + csvRows.join('\n'))
})

module.exports = router
