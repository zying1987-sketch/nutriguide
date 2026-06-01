const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'nutriguide-dev-secret-change-me'

// 验证 JWT token
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '请先登录' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: '登录已过期，请重新登录' })
  }
}

// 验证管理员权限
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '需要管理员权限' })
    }
    next()
  })
}

// 可选认证（不强制，但如果有 token 就解析）
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    try {
      req.user = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      // token 无效也继续，只是不设置 user
    }
  }
  next()
}

module.exports = { requireAuth, requireAdmin, optionalAuth, JWT_SECRET }
