const express = require('express')
const { getDb } = require('../db/setup')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

// 查询积分余额
router.get('/balance', requireAuth, (req, res) => {
  const db = getDb()
  let credits = db.prepare('SELECT * FROM user_credits WHERE user_id = ?').get(req.user.id)

  // 如果用户没有积分记录，自动初始化
  if (!credits) {
    db.prepare('INSERT INTO user_credits (user_id, balance, total_purchased) VALUES (?, 3, 3)').run(req.user.id)
    credits = { user_id: req.user.id, balance: 3, total_purchased: 3, total_used: 0 }
  }

  res.json({
    balance: credits.balance,
    total_purchased: credits.total_purchased,
    total_used: credits.total_used,
  })
})

// 购买积分（模拟支付）
router.post('/purchase', requireAuth, (req, res) => {
  const { package: pkg } = req.body

  const packages = {
    small: { credits: 10, price: 9.9, label: '10 积分' },
    medium: { credits: 30, price: 19.9, label: '30 积分' },
    large: { credits: 100, price: 49.9, label: '100 积分' },
  }

  const selected = packages[pkg]
  if (!selected) {
    return res.status(400).json({ error: '无效的积分包', available: Object.keys(packages) })
  }

  const db = getDb()

  // 模拟支付成功
  let credits = db.prepare('SELECT * FROM user_credits WHERE user_id = ?').get(req.user.id)
  if (!credits) {
    db.prepare('INSERT INTO user_credits (user_id, balance, total_purchased, total_used) VALUES (?, ?, ?, 0)')
      .run(req.user.id, selected.credits, selected.credits)
  } else {
    db.prepare(
      'UPDATE user_credits SET balance = balance + ?, total_purchased = total_purchased + ?, updated_at = datetime(\'now\') WHERE user_id = ?'
    ).run(selected.credits, selected.credits, req.user.id)
  }

  credits = db.prepare('SELECT * FROM user_credits WHERE user_id = ?').get(req.user.id)

  console.log(`用户 ${req.user.id} 购买了 ${selected.label}，当前余额: ${credits.balance}`)

  res.json({
    success: true,
    package: selected.label,
    price: selected.price,
    balance: credits.balance,
    message: `成功购买 ${selected.label}，当前余额 ${credits.balance} 积分`,
  })
})

module.exports = router
