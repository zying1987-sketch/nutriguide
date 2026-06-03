/**
 * NutriGuide 知识库加载器
 * 加载 knowledge-base/structured/ 目录下的所有 JSON 文件，
 * 提供关键词检索，将匹配结果注入 LLM 提示词。
 */

const fs = require('fs')
const path = require('path')

const KB_DIR = path.join(__dirname, '../knowledge-base/structured')
const BATCH_DIR = path.join(__dirname, '../knowledge-base/batches')

// 加载食材名称翻译映射
let foodNameMap = {}
try {
  const TRANSLATION_PATH = path.join(__dirname, '../knowledge-base/food-name-translations.json')
  if (fs.existsSync(TRANSLATION_PATH)) {
    foodNameMap = JSON.parse(fs.readFileSync(TRANSLATION_PATH, 'utf8'))
    // 过滤掉元数据键
    delete foodNameMap._description
    console.log(`[KB] 食材名称翻译映射加载完成: ${Object.keys(foodNameMap).length} 条`)
  }
} catch (err) {
  console.warn('[KB] 食材名称翻译映射加载失败，将使用原始名称:', err.message)
}

// 内存中的知识索引
let knowledgeIndex = []
let loaded = false

/**
 * 获取标题的中文版本
 * 如果标题已是中文（含汉字），返回同名；否则从翻译映射中查找
 */
function getTitleZh(title) {
  if (!title) return ''
  // 已含中文 -> 本身就是中文
  if (/[\u4e00-\u9fa5]/.test(title)) return title
  // 从映射查找
  return foodNameMap[title] || ''
}

/**
 * 初始化：加载所有结构化知识文件
 */
function loadKnowledgeBase() {
  if (loaded) return knowledgeIndex

  const allEntries = []

  // ---- 加载原有结构化知识 ----
  const subdirs = ['foods', 'principles', 'populations', 'meals', 'assessments', 'disease_nutrition']
  for (const subdir of subdirs) {
    const dirPath = path.join(KB_DIR, subdir)
    if (!fs.existsSync(dirPath)) continue

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'))
    for (const file of files) {
      try {
        const filePath = path.join(dirPath, file)
        const raw = fs.readFileSync(filePath, 'utf8')
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')  // Remove control chars except \t\n\r
        const data = JSON.parse(raw)

        // 食材百科格式：顶层数组（知识库扁平条目）
        if (Array.isArray(data) && data.length > 0 && data[0].id && data[0].content) {
          for (const item of data) {
            if (item.content) allEntries.push({
              id: item.id,
              title: item.title || '',
              content: item.content,
              tags: item.tags || [],
              category: item.category || 'food',
              source: item.source || '食材百科',
              evidence_level: item.evidence_level || 'B',
              meta_source: item.meta_source || '食材百科'
            })
          }
        }
        // 单食材 JSON（有 name + nutrients 结构）
        else if (data.name && data.nutrients) {
          const entries = foodEntryToKB(data)
          allEntries.push(...entries)
        }
        // 原有结构化格式
        else {
          const entries = extractEntries(data)
          allEntries.push(...entries)
        }
      } catch (err) {
        console.error(`[KB] 加载失败: ${file}`, err.message)
      }
    }
  }

  // ---- 加载批次知识库 ----
  if (fs.existsSync(BATCH_DIR)) {
    const batchDirs = fs.readdirSync(BATCH_DIR).filter(d => d.startsWith('batch_'))
    for (const batchDir of batchDirs) {
      const structuredDir = path.join(BATCH_DIR, batchDir, 'structured')
      if (!fs.existsSync(structuredDir)) continue
      const files = fs.readdirSync(structuredDir).filter(f => f.endsWith('.json'))
      for (const file of files) {
        try {
          const filePath = path.join(structuredDir, file)
          const raw = fs.readFileSync(filePath, 'utf8')
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')  // Remove control chars except \t\n\r
        const data = JSON.parse(raw)
          // 批次数据可能是数组或对象
          const items = Array.isArray(data) ? data : [data]
          for (const item of items) {
            const entry = convertBatchEntry(item)
            if (entry) allEntries.push(entry)
          }
        } catch (err) {
          console.error(`[KB] 批次加载失败: ${batchDir}/${file}`, err.message)
        }
      }
    }
  }

  // ---- 去重：合并同一 PDF 的分页条目 ----
  const dedupedEntries = deduplicatePdfPages(allEntries)
  const dedupeRemoved = allEntries.length - dedupedEntries.length
  if (dedupeRemoved > 0) {
    console.log(`[KB] PDF 分页去重: ${dedupeRemoved} 条合并为 ${dedupedEntries.length} 条`)
  }

  // ---- 过滤：移除所有 C 级证据条目 ----
  const filteredEntries = dedupedEntries.filter(e => e.evidence_level !== 'C')
  const cRemoved = dedupedEntries.length - filteredEntries.length
  if (cRemoved > 0) {
    console.log(`[KB] 移除 C 级证据条目: ${cRemoved} 条`)
  }

  // ---- 为所有条目注入双语标题 ----
  for (const entry of filteredEntries) {
    entry.title_zh = getTitleZh(entry.title)
  }

  knowledgeIndex = filteredEntries
  loaded = true
  console.log(`[KB] 知识库加载完成: ${filteredEntries.length} 条知识 (去重+C级过滤后, 含批次)`)
  return knowledgeIndex
}

/**
 * 将批次知识条目转换为统一格式
 */
function deduplicatePdfPages(entries) {
  // 匹配 PDF 页面标题模式: "Nutrients 2025, 17, 3068 7 of 39..."
  const pagePattern = /^(.+?)\s+(\d+)\s+of\s+(\d+)\b/

  const groups = {}
  const nonPageEntries = []

  for (const entry of entries) {
    const m = entry.title.match(pagePattern)
    if (m) {
      const prefix = m[1].trim()
      const category = entry.category || 'general'
      // 按 PDF来源 + 分类 分组，保留不同分类的条目
      const groupKey = `${category}::${prefix}`
      if (!groups[groupKey]) {
        groups[groupKey] = { meta: entry, pages: [], maxPage: 0 }
      }
      groups[groupKey].pages.push({ num: parseInt(m[2]), content: entry.content })
      groups[groupKey].maxPage = Math.max(groups[groupKey].maxPage, parseInt(m[2]))
    } else {
      nonPageEntries.push(entry)
    }
  }

  // 合并每组 PDF 条目
  const merged = []
  for (const [groupKey, group] of Object.entries(groups)) {
    if (group.pages.length <= 1) {
      nonPageEntries.push(group.meta)
      continue
    }
    group.pages.sort((a, b) => a.num - b.num)
    const mergedContent = group.pages
      .map(p => p.content)
      .join('\n\n')
      .slice(0, 10000)

    const prefix = groupKey.split('::')[1]
    merged.push({
      ...group.meta,
      id: group.meta.id || `merged_${prefix.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)}`,
      title: `${prefix}（${group.pages.length}页合并）`,
      content: mergedContent,
      tags: [...new Set([...(group.meta.tags || []), 'merged'])].slice(0, 10),
    })
  }

  return [...nonPageEntries, ...merged]
}

function convertBatchEntry(item) {
  if (!item || !item.content) return null
  return {
    id: item.id || `kb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: item.title || item.content.slice(0, 40),
    content: item.content || '',
    tags: item.tags || [],
    category: item.category || 'general',
    subcategory: item.subcategory || '',
    source: (item.source && item.source.title) || '批次知识库',
    evidence_level: item.evidence_level || 'C',
    confidence: item.confidence || null,
    meta_source: (item.source && `${item.source.title}${item.source.chapter ? ' - ' + item.source.chapter : ''}`) || '批次知识库',
  }
}

/**
 * 将单食材 JSON 转为知识库扁平条目
 */
function foodEntryToKB(food) {
  const entries = []
  const contentParts = [`分类: ${food.category || ''}`]

  // 营养素
  if (food.nutrients) {
    const nutStrs = Object.entries(food.nutrients).map(([k, v]) =>
      `${k}: ${typeof v === 'object' ? v.value + (v.unit || '') : v}`
    )
    contentParts.push(`每100g营养素: ${nutStrs.join(', ')}`)
  }

  // 活性成分
  if (food.active_compounds) {
    for (const comp of food.active_compounds) {
      contentParts.push(`活性成分 ${comp.name}: ${comp.content_text || ''} ${comp.mechanism || ''}`)
    }
  }

  // 健康功效
  if (food.health_benefits) {
    for (const b of food.health_benefits) {
      contentParts.push(`[${b.evidence_level}级] ${b.text}: ${b.description || ''}`)
    }
  }

  if (food.daily_intake) contentParts.push(`每日建议: ${food.daily_intake}`)
  if (food.contraindications && food.contraindications.length) {
    contentParts.push(`注意事项: ${food.contraindications.join('; ')}`)
  }

  entries.push({
    id: `food_${food.id}`,
    title: food.name,
    content: contentParts.join('\n'),
    tags: (food.tags || []).concat([food.category || '']),
    category: 'food',
    source: '食材百科',
    evidence_level: food.deep_analysis ? 'A' : 'B',
    meta_source: `食材百科 - ${food.category || ''}`
  })

  // 健康功效也作为独立条目
  if (food.health_benefits) {
    for (const b of food.health_benefits) {
      entries.push({
        id: `benefit_${food.id}_${b.text}`,
        title: `${food.name} - ${b.text}`,
        content: `[${b.evidence_level}级] ${b.description || ''}`,
        tags: (food.tags || []).concat([b.text]),
        category: 'food',
        source: '食材百科',
        evidence_level: b.evidence_level || 'B',
        meta_source: `食材百科 - ${food.category}`
      })
    }
  }

  return entries
}

/**
 * 从 JSON 数据中提取平铺知识条目
 */
function extractEntries(data) {
  const entries = []
  const meta = data.meta || {}

  // 提取 diet principles
  if (data.principles) {
    for (const p of data.principles) {
      entries.push({
        id: p.id,
        title: p.title,
        content: [p.summary, ...(p.recommendations || [])].join('\n'),
        tags: p.tags || [],
        category: meta.category || 'diet_principle',
        source: meta.source || '',
        evidence_level: meta.evidence_level || p.evidence_level || 'B',
        meta_source: meta.source || ''
      })
    }
  }

  // 提取 populations / nutrition_focus
  if (data.nutrition_focus) {
    for (const n of data.nutrition_focus) {
      const foodSources = (n.food_sources || []).map(f => f.food).join('、')
      entries.push({
        id: n.id,
        title: n.nutrient,
        content: [
          n.importance || '',
          `推荐摄入量: ${JSON.stringify(n.RNI_per_day).replace(/[{}"]/g, '')}`,
          `食物来源: ${foodSources}`,
          n.absorption_tip || '',
          n.note || ''
        ].filter(Boolean).join('\n'),
        tags: n.tags || [],
        category: meta.category || 'population',
        source: meta.source || '',
        evidence_level: meta.evidence_level || 'B',
        meta_source: meta.source || ''
      })
    }
  }

  // 提取 hormone_health_tips
  if (data.hormone_health_tips) {
    entries.push({
      id: 'hormone_tips',
      title: '女性激素健康综合建议',
      content: data.hormone_health_tips.join('\n'),
      tags: ['hormone_health', 'general_female'],
      category: 'population',
      source: meta.source || '',
      evidence_level: 'B',
      meta_source: meta.source || ''
    })
  }

  // 提取 anti-inflammatory core_principles
  if (data.core_principles) {
    for (const cp of data.core_principles) {
      const foods = (cp.recommended_foods || []).map(f => `${f.category}: ${f.examples}`).join('；')
      entries.push({
        id: cp.id,
        title: cp.principle,
        content: [cp.why || '', foods, cp.note || '', cp.limit ? `限制: ${JSON.stringify(cp.limit)}` : ''].filter(Boolean).join('\n'),
        tags: cp.tags || [],
        category: meta.category || 'diet_pattern',
        source: meta.source || '',
        evidence_level: meta.evidence_level || 'B',
        meta_source: meta.source || ''
      })
    }
  }

  // 提取 anti-inflammatory diet_patterns
  if (data.diet_patterns) {
    for (const dp of data.diet_patterns) {
      entries.push({
        id: `dp_${dp.name}`,
        title: dp.name,
        content: [dp.description || '', ...(dp.key_features || [])].join('\n'),
        tags: dp.tags || [],
        category: meta.category || 'diet_pattern',
        source: meta.source || '',
        evidence_level: meta.evidence_level || 'B',
        meta_source: meta.source || ''
      })
    }
  }

  // 提取 gut-brain axis interventions
  if (data.nutrition_interventions) {
    for (const ni of data.nutrition_interventions) {
      const foods = (ni.food_sources || ni.recommended_foods || []).join('、')
      entries.push({
        id: ni.id,
        title: ni.intervention,
        content: [ni.mechanism || '', `建议: ${ni.recommendation || ''}`, foods ? `食物来源: ${foods}` : '', ni.evidence || '', ni.note || ''].filter(Boolean).join('\n'),
        tags: ni.tags || [],
        category: meta.category || 'disease_nutrition',
        source: meta.source || '',
        evidence_level: meta.evidence_level || 'B',
        meta_source: meta.source || ''
      })
    }
  }

  // 提取 foods
  if (data.foods) {
    for (const f of data.foods) {
      const nut = f.nutrition_per_100g || {}
      const nutStr = Object.entries(nut).map(([k, v]) => `${k}: ${v}`).join(', ')
      entries.push({
        id: f.id,
        title: f.name,
        content: [
          `类别: ${f.category}`,
          `每100g营养: ${nutStr}`,
          f.health_notes || ''
        ].filter(Boolean).join('\n'),
        tags: f.tags || [],
        category: 'food',
        source: meta.source || '',
        evidence_level: meta.evidence_level || 'A',
        meta_source: meta.source || ''
      })
    }
  }

  // 如果没有提取到结构化条目，尝试把整个 data 作为一条知识
  if (entries.length === 0 && meta.title) {
    entries.push({
      id: data.meta?.title?.replace(/\s/g, '_') || 'unknown',
      title: meta.title,
      content: JSON.stringify(data).slice(0, 2000),
      tags: [],
      category: meta.category || 'general',
      source: meta.source || '',
      evidence_level: meta.evidence_level || 'B',
      meta_source: meta.source || ''
    })
  }

  return entries
}

/**
 * 中文分词（简单版）：按字符 n-gram + 停用词过滤
 */
function tokenize(text) {
  if (!text) return []
  const stopWords = new Set(['的', '是', '在', '有', '和', '与', '或', '了', '我', '你', '他', '她', '它', '这', '那', '什么', '怎么', '如何', '为什么', '可以', '需要', '应该', '不要', '要', '会', '能', '可', '该', '地', '得', '着', '过'])
  const tokens = []

  // 英文/数字词：按空格分词
  const enWords = text.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length >= 2 && /[a-zA-Z]/.test(w))
  tokens.push(...enWords)

  // 中文词：用字符 n-gram (2-4字滑动窗口)
  const chineseChars = text.replace(/[^\u4e00-\u9fa5]/g, '')
  if (chineseChars.length >= 2) {
    for (let n = 2; n <= 4; n++) {
      for (let i = 0; i <= chineseChars.length - n; i++) {
        const gram = chineseChars.slice(i, i + n)
        if (!stopWords.has(gram)) tokens.push(gram)
      }
    }
  }

  // 混合中英 token
  const mixed = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length >= 2)
  tokens.push(...mixed)

  return [...new Set(tokens)]
}

/**
 * 搜索知识库，返回匹配的条目
 * @param {string} query - 用户问题
 * @param {number} limit - 最多返回条数
 * @returns {Array} 匹配的知识条目（含 score）
 */
function searchKnowledge(query, limit = 5) {
  if (!loaded) loadKnowledgeBase()
  if (knowledgeIndex.length === 0) return []

  const queryTokens = tokenize(query)
  if (queryTokens.length === 0) return []

  const scored = knowledgeIndex.map(entry => {
    const searchText = [entry.title, entry.content, ...(entry.tags || [])].join(' ')
    let score = 0
    for (const token of queryTokens) {
      if (searchText.includes(token)) {
        // 标题匹配权重更高
        if (entry.title && entry.title.includes(token)) score += 3
        // 标签匹配权重最高
        if (entry.tags && entry.tags.some(t => t.includes(token) || token.includes(t))) score += 5
        // 内容匹配
        if (entry.content && entry.content.includes(token)) score += 1
      }
    }
    // 证据等级加权
    if (entry.evidence_level === 'A') score *= 1.5
    else if (entry.evidence_level === 'B') score *= 1.2

    return { ...entry, score }
  })

  return scored
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * 格式化知识条目为 LLM 上下文文本
 */
function formatKnowledgeContext(entries) {
  if (!entries || entries.length === 0) return ''
  const lines = ['【知识库参考内容】（以下内容来自权威营养学资料，回答时请优先参考）:']
  for (const e of entries) {
    const evMark = e.evidence_level ? `[证据等级: ${e.evidence_level}]` : ''
    const srcMark = e.meta_source ? `（来源: ${e.meta_source}）` : ''
    lines.push(`\n■ ${e.title} ${evMark}${srcMark}\n${e.content.trim().slice(0, 500)}`)
  }
  return lines.join('\n')
}

module.exports = {
  loadKnowledgeBase,
  searchKnowledge,
  formatKnowledgeContext,
  getKnowledgeIndex: () => knowledgeIndex
}
