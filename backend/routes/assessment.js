const express = require('express')
const { getDb } = require('../db/setup')
const { requireAuth, optionalAuth } = require('../middleware/auth')

const router = express.Router()

// 保存自测记录（需登录）
router.post('/', requireAuth, (req, res) => {
  const { stepData, result, fullReport } = req.body

  if (!stepData) {
    return res.status(400).json({ error: '缺少自测数据' })
  }

  const db = getDb()
  const r = db.prepare(
    'INSERT INTO assessments (user_id, step_data, result, full_report) VALUES (?, ?, ?, ?)'
  ).run(req.user.id, JSON.stringify(stepData), result ? JSON.stringify(result) : null, fullReport || '')

  // 自动更新/创建用户健康档案
  const sd = typeof stepData === 'object' ? stepData : {}
  const existing = db.prepare('SELECT id FROM user_profiles WHERE user_id = ?').get(req.user.id)
  if (existing) {
    db.prepare(`
      UPDATE user_profiles SET display_name = COALESCE(NULLIF(?, ''), display_name),
        gender = COALESCE(NULLIF(?, ''), gender), height = COALESCE(?, height),
        weight = COALESCE(?, weight), updated_at = datetime('now')
      WHERE user_id = ?
    `).run(sd.name || '', sd.gender || '', sd.height || null, sd.weight || null, req.user.id)
  } else {
    db.prepare(`
      INSERT INTO user_profiles (user_id, display_name, gender, height, weight)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.user.id, sd.name || sd.displayName || '', sd.gender || '', sd.height || null, sd.weight || null)
  }

  res.status(201).json({ id: r.lastInsertRowid })
})

// 获取用户的自测记录列表
router.get('/', requireAuth, (req, res) => {
  const db = getDb()
  const records = db.prepare(
    `SELECT id, created_at,
      json_extract(step_data, '$.gender') as gender,
      json_extract(step_data, '$.age') as age,
      COALESCE(
        json_extract(result, '$.primaryPopulation.populationName'),
        json_extract(result, '$.primaryPopulation')
      ) as population,
      json_extract(result, '$.dietQualityScore') as diet_score
    FROM assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`
  ).all(req.user.id)

  res.json({ records })
})

// 获取单条自测记录
router.get('/:id', requireAuth, (req, res) => {
  const db = getDb()
  const record = db.prepare(
    'SELECT * FROM assessments WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.user.id)

  if (!record) {
    return res.status(404).json({ error: '记录不存在' })
  }

  res.json({
    id: record.id,
    stepData: JSON.parse(record.step_data),
    result: record.result ? JSON.parse(record.result) : null,
    hasReport: !!(record.full_report),
    createdAt: record.created_at
  })
})

// 更新评估记录的报告内容
router.put('/:id/report', requireAuth, (req, res) => {
  const { fullReport } = req.body
  if (!fullReport) {
    return res.status(400).json({ error: '缺少报告内容' })
  }

  const db = getDb()
  const result = db.prepare(
    'UPDATE assessments SET full_report = ? WHERE id = ? AND user_id = ?'
  ).run(fullReport, req.params.id, req.user.id)

  if (result.changes === 0) {
    return res.status(404).json({ error: '记录不存在或无权限' })
  }

  res.json({ success: true })
})

// 保存28天方案
router.post('/plan', requireAuth, (req, res) => {
  const { populationTags, planData } = req.body

  if (!planData) {
    return res.status(400).json({ error: '缺少方案数据' })
  }

  const db = getDb()
  const r = db.prepare(
    'INSERT INTO plans (user_id, population_tags, plan_data) VALUES (?, ?, ?)'
  ).run(req.user.id, populationTags || '', JSON.stringify(planData))

  res.status(201).json({ id: r.lastInsertRowid })
})

// 获取用户的方案记录
router.get('/plan/history', requireAuth, (req, res) => {
  const db = getDb()
  const records = db.prepare(
    'SELECT id, population_tags, created_at FROM plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 20'
  ).all(req.user.id)

  res.json({ records })
})

// 获取单条方案记录
router.get('/plan/:id', requireAuth, (req, res) => {
  const db = getDb()
  const record = db.prepare(
    'SELECT * FROM plans WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.user.id)

  if (!record) {
    return res.status(404).json({ error: '方案记录不存在' })
  }

  res.json({
    id: record.id,
    populationTags: record.population_tags,
    planData: JSON.parse(record.plan_data),
    createdAt: record.created_at
  })
})

// 下载 AI 完整报告
router.get('/:id/report', optionalAuth, (req, res) => {
  // 支持 token 从 URL query 参数传入（方便浏览器直接下载）
  if (!req.user && req.query.token) {
    try {
      const jwt = require('jsonwebtoken')
      req.user = jwt.verify(req.query.token, process.env.JWT_SECRET || 'nutriguide-dev-secret-change-me')
    } catch (e) { /* token 无效则继续（下面会拦） */ }
  }

  if (!req.user) {
    return res.status(401).json({ error: '请先登录' })
  }
  const db = getDb()
  const record = db.prepare(
    'SELECT full_report, created_at FROM assessments WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.user.id)

  if (!record || !record.full_report) {
    return res.status(404).json({ error: '该记录暂无完整报告' })
  }

  const date = record.created_at ? record.created_at.slice(0, 10) : 'unknown'
  const filename = `NutriGuide_评估报告_${date}.txt`

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`)
  res.send(record.full_report)
})

module.exports = router
