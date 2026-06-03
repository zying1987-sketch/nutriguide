/**
 * 知识库浏览 API
 * 将 knowledge-base-loader 加载的知识库通过 REST 接口暴露给前端
 *
 * 端点：
 *   GET /api/knowledge/overview       — 按分类统计
 *   GET /api/knowledge?q=&category=&page=&limit=  — 搜索+分页
 *   GET /api/knowledge/:id            — 单条详情
 *   GET /api/knowledge/categories     — 分类列表（含子分类）
 */

const express = require('express')
const router = express.Router()
const KB = require('../knowledge-base-loader')

// ============================================================
// 分类元数据（前端展示用）
// ============================================================
const CATEGORY_META = {
  clinical:       { name: '临床营养',       icon: '🩺', color: '#E85D3A', desc: '疾病与营养干预的循证知识' },
  nutrient:       { name: '营养素百科',     icon: '💊', color: '#2D9C6F', desc: '维生素、矿物质、植物化合物' },
  diet_principle: { name: '饮食原则',       icon: '📋', color: '#6B8F3A', desc: '饮食模式、膳食指南、营养策略' },
  supplement:     { name: '补充剂',         icon: '🧪', color: '#8B5CF6', desc: '益生菌、功能性补充剂' },
  food:           { name: '食物知识',       icon: '🥗', color: '#F59E0B', desc: '食材营养、食物成分数据' },
  population:     { name: '人群营养',       icon: '👥', color: '#3B82F6', desc: '特定人群营养需求与干预' },
  diet_pattern:   { name: '饮食模式',       icon: '🍽️', color: '#EC4899', desc: '地中海、抗炎等饮食模式' },
  disease_nutrition:{ name: '疾病营养',     icon: '🏥', color: '#EF4444', desc: '疾病相关的营养管理' },
  general:        { name: '综合知识',       icon: '📚', color: '#6B7280', desc: '通用营养学知识' },
}

// 数据加载（首次访问时触发）
let _indexReady = false
function ensureLoaded() {
  if (!_indexReady) {
    KB.loadKnowledgeBase()
    _indexReady = true
  }
}

// ============================================================
// GET /overview — 按分类统计 + 总览
// ============================================================
router.get('/overview', (_req, res) => {
  ensureLoaded()
  const index = KB.getKnowledgeIndex()

  const categoryStats = {}
  let total = 0

  for (const entry of index) {
    const cat = entry.category || 'general'
    if (!categoryStats[cat]) {
      categoryStats[cat] = { count: 0, subcategories: new Set(), tags: new Set() }
    }
    categoryStats[cat].count++
    if (entry.subcategory) categoryStats[cat].subcategories.add(entry.subcategory)
    if (entry.tags) entry.tags.forEach(t => categoryStats[cat].tags.add(t))
    total++
  }

  // 构建返回数据
  const categories = Object.entries(categoryStats)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([key, val]) => ({
      key,
      name: CATEGORY_META[key]?.name || key,
      icon: CATEGORY_META[key]?.icon || '📄',
      color: CATEGORY_META[key]?.color || '#6B7280',
      desc: CATEGORY_META[key]?.desc || '',
      count: val.count,
      subcategories: [...val.subcategories].slice(0, 20),
    }))

  res.json({ total, categories })
})

// ============================================================
// GET /categories — 分类列表（含子分类详情）
// ============================================================
router.get('/categories', (_req, res) => {
  ensureLoaded()
  const index = KB.getKnowledgeIndex()

  const catMap = {}
  for (const entry of index) {
    const cat = entry.category || 'general'
    if (!catMap[cat]) catMap[cat] = { subcategories: new Map(), tags: new Set(), count: 0 }
    catMap[cat].count++

    const sub = entry.subcategory || '未分类'
    if (!catMap[cat].subcategories.has(sub)) {
      catMap[cat].subcategories.set(sub, 0)
    }
    catMap[cat].subcategories.set(sub, catMap[cat].subcategories.get(sub) + 1)

    if (entry.tags) entry.tags.forEach(t => catMap[cat].tags.add(t))
  }

  const categories = Object.entries(catMap)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([key, val]) => ({
      key,
      name: CATEGORY_META[key]?.name || key,
      icon: CATEGORY_META[key]?.icon || '📄',
      color: CATEGORY_META[key]?.color || '#6B7280',
      count: val.count,
      subcategories: [...val.subcategories.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
    }))

  res.json(categories)
})

// ============================================================
// GET / — 搜索 + 分页列表
// 参数: q (搜索词), category (分类筛选), page (页码, 默认1), limit (每页条数, 默认20)
// ============================================================
router.get('/', (req, res) => {
  ensureLoaded()
  const index = KB.getKnowledgeIndex()

  let results = [...index]
  const { q, category, page = '1', limit = '20' } = req.query
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20))

  // 分类筛选
  if (category && category !== 'all') {
    results = results.filter(e => e.category === category)
  }

  // 关键词搜索
  if (q && q.trim()) {
    const query = q.trim().toLowerCase()
    results = results.filter(e =>
      (e.title && e.title.toLowerCase().includes(query)) ||
      (e.content && e.content.toLowerCase().includes(query)) ||
      (e.tags && e.tags.some(t => t.toLowerCase().includes(query))) ||
      (e.meta_source && e.meta_source.toLowerCase().includes(query))
    )

    // 若结果多，按内容匹配优先级排序
    results.sort((a, b) => {
      const aTitle = (a.title || '').toLowerCase().includes(query) ? 3 : 0
      const bTitle = (b.title || '').toLowerCase().includes(query) ? 3 : 0
      const aTag = (a.tags || []).some(t => t.toLowerCase().includes(query)) ? 2 : 0
      const bTag = (b.tags || []).some(t => t.toLowerCase().includes(query)) ? 2 : 0
      return (bTitle + bTag) - (aTitle + aTag)
    })
  }

  // 分页
  const total = results.length
  const totalPages = Math.ceil(total / limitNum)
  const offset = (pageNum - 1) * limitNum
  const pageResults = results.slice(offset, offset + limitNum)

  // 精简返回字段（列表视图）
  const items = pageResults.map(e => ({
    id: e.id,
    title: e.title || '',
    title_zh: e.title_zh || '',
    excerpt: (e.content || '').slice(0, 200).replace(/\n/g, ' '),
    category: e.category,
    categoryName: CATEGORY_META[e.category]?.name || e.category,
    categoryColor: CATEGORY_META[e.category]?.color || '#6B7280',
    categoryIcon: CATEGORY_META[e.category]?.icon || '📄',
    evidence_level: e.evidence_level || 'C',
    confidence: e.confidence || null,
    tags: (e.tags || []).slice(0, 5),
    source: e.meta_source || e.source || '',
  }))

  res.json({
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasMore: pageNum < totalPages,
    },
  })
})

// ============================================================
// GET /:id — 单条详情
// ============================================================
router.get('/:id', (req, res) => {
  ensureLoaded()
  const index = KB.getKnowledgeIndex()
  const entry = index.find(e => e.id === req.params.id)

  if (!entry) {
    return res.status(404).json({ error: '未找到该知识条目' })
  }

  res.json({
    id: entry.id,
    title: entry.title || '',
    title_zh: entry.title_zh || '',
    content: entry.content || '',
    category: entry.category,
    categoryName: CATEGORY_META[entry.category]?.name || entry.category,
    categoryColor: CATEGORY_META[entry.category]?.color || '#6B7280',
    categoryIcon: CATEGORY_META[entry.category]?.icon || '📄',
    evidence_level: entry.evidence_level || 'C',
    confidence: entry.confidence || null,
    tags: entry.tags || [],
    source: entry.meta_source || entry.source || '',
    score: entry.score || null,
  })
})

module.exports = router
