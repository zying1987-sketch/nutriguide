/**
 * 食材百科 API 路由
 */
const express = require('express')
const fs = require('fs')
const path = require('path')
const router = express.Router()

const FOODS_INDEX = path.join(__dirname, '../../knowledge-base/structured/foods/index.json')
const FOODS_DIR = path.join(__dirname, '../../knowledge-base/structured/foods')
const TRANSLATION_PATH = path.join(__dirname, '../../knowledge-base/food-name-translations.json')

// 加载食材名称翻译映射
let foodNameMap = {}
try {
  if (fs.existsSync(TRANSLATION_PATH)) {
    foodNameMap = JSON.parse(fs.readFileSync(TRANSLATION_PATH, 'utf8'))
    delete foodNameMap._description
  }
} catch (_) {}

/** 获取中文名称 */
function getNameZh(name) {
  if (!name) return ''
  if (/[\u4e00-\u9fa5]/.test(name)) return name
  return foodNameMap[name] || ''
}

// 懒加载缓存
let foodsCache = null
let indexCache = null

function loadIndex() {
  if (indexCache) return indexCache
  if (!fs.existsSync(FOODS_INDEX)) return null
  indexCache = JSON.parse(fs.readFileSync(FOODS_INDEX, 'utf8'))
  return indexCache
}

function loadAllFoods() {
  if (foodsCache) return foodsCache
  const index = loadIndex()
  if (!index) return []
  foodsCache = index.all_foods.map(f => {
    try {
      const filePath = path.join(FOODS_DIR, `${f.id}.json`)
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'))
      }
    } catch (_) {}
    return f
  }).filter(Boolean)
  return foodsCache
}

/**
 * GET /api/food-wiki
 * 获取食材百科数据
 * Query: ?category=蔬菜与蔬菜制品 (可选，按分类筛选)
 *        ?search=三文鱼 (可选，全文搜索)
 *        ?id=ginger_root_raw (可选，获取单个食材详情)
 */
router.get('/', (req, res) => {
  const { category, search, id } = req.query

  // 单个食材详情
  if (id) {
    const filePath = path.join(FOODS_DIR, `${id}.json`)
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '食材未找到' })
    }
    const food = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    food.name_zh = getNameZh(food.name)
    return res.json(food)
  }

  const index = loadIndex()
  if (!index) return res.json({ foods: [], categories: {}, total: 0 })

  let foods = loadAllFoods()

  // 按分类筛选
  if (category && index.categories[category]) {
    foods = foods.filter(f => f.category === category)
  }

  // 全文搜索
  if (search) {
    const q = search.toLowerCase()
    foods = foods.filter(f => {
      const text = [
        f.name, getNameZh(f.name), f.category,
        ...(f.tags || []),
        ...(f.active_compounds || []).map(c => c.name),
        ...(f.health_benefits || []).map(b => b.text)
      ].join(' ').toLowerCase()
      return text.includes(q)
    })
  }

  res.json({
    foods: foods.map(f => ({
      id: f.id,
      name: f.name,
      name_zh: getNameZh(f.name),
      category: f.category,
      tags: f.tags,
      deep_analysis: f.deep_analysis,
      nutrients: f.nutrients,
      active_compounds: f.active_compounds,
      health_benefits: f.health_benefits,
      daily_intake: f.daily_intake,
      cooking_tips: f.cooking_tips,
      synergy: f.synergy,
      contraindications: f.contraindications,
      tcm: f.tcm
    })),
    categories: Object.fromEntries(
      Object.entries(index.categories).map(([k, v]) => [k, { name: v.name, count: v.count }])
    ),
    total: foods.length
  })
})

/**
 * GET /api/food-wiki/categories
 * 获取所有分类
 */
router.get('/categories', (req, res) => {
  const index = loadIndex()
  if (!index) return res.json({ categories: [] })
  res.json({
    categories: Object.entries(index.categories).map(([key, val]) => ({
      key,
      name: val.name,
      count: val.count
    }))
  })
})

/**
 * GET /api/food-wiki/search?q=关键词
 * 快速搜索（返回精简结果）
 */
router.get('/search', (req, res) => {
  const { q, limit = 20 } = req.query
  if (!q) return res.json({ results: [] })

  const index = loadIndex()
  if (!index) return res.json({ results: [] })

  const query = q.toLowerCase()
  const results = index.all_foods
    .filter(f => {
      const text = [f.name, getNameZh(f.name), f.category, ...(f.tags || [])].join(' ').toLowerCase()
      return text.includes(query)
    })
    .slice(0, parseInt(limit))
    .map(f => ({
      id: f.id,
      name: f.name,
      name_zh: getNameZh(f.name),
      category: f.category,
      tags: f.tags,
      deep_analysis: f.deep_analysis
    }))

  res.json({ results, total: results.length })
})

module.exports = router
