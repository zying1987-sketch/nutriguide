const express = require('express')
const { getDb } = require('../db/setup')
const { requireAuth, optionalAuth } = require('../middleware/auth')

const router = express.Router()

// 保存自测记录（需登录）
router.post('/', requireAuth, (req, res) => {
  const { stepData, result } = req.body

  if (!stepData) {
    return res.status(400).json({ error: '缺少自测数据' })
  }

  const db = getDb()
  const r = db.prepare(
    'INSERT INTO assessments (user_id, step_data, result) VALUES (?, ?, ?)'
  ).run(req.user.id, JSON.stringify(stepData), result ? JSON.stringify(result) : null)

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
    createdAt: record.created_at
  })
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

module.exports = router
