import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, ChevronDown, ChevronUp, FlaskConical, Heart, AlertTriangle, BookOpen, Wheat, Beaker } from 'lucide-react'

interface Food {
  id: string
  name: string
  name_zh: string
  category: string
  tags: string[]
  deep_analysis: boolean
  nutrients: Record<string, { value: number | string; unit: string }>
  active_compounds: { name: string; content_text: string; mechanism: string }[]
  health_benefits: { text: string; evidence_level: string; description: string; reference?: string }[]
  daily_intake: string
  cooking_tips: string[]
  synergy: string[]
  contraindications: string[]
  tcm: Record<string, string>
}

interface Category {
  key: string
  name: string
  count: number
}

const EVIDENCE_COLORS: Record<string, string> = {
  A: 'bg-green-100 text-green-800',
  B: 'bg-yellow-100 text-yellow-800',
  C: 'bg-gray-100 text-gray-600',
  D: 'bg-red-50 text-red-500'
}

const EVIDENCE_LABELS: Record<string, string> = {
  A: '强证据',
  B: '中等证据',
  C: '初步证据',
  D: '证据不足'
}

export default function FoodWikiPage() {
  const { t, i18n } = useTranslation()
  const [foods, setFoods] = useState<Food[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandedFoods, setExpandedFoods] = useState<Set<string>>(new Set())
  const [totalCount, setTotalCount] = useState(0)
  const [activeTab, setActiveTab] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchCategories()
    fetchFoods()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/food-wiki/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (_) {}
  }

  const fetchFoods = useCallback(async (category?: string, search?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      if (search) params.set('search', search)
      const res = await fetch(`/api/food-wiki?${params}`)
      const data = await res.json()
      setFoods(data.foods || [])
      setTotalCount(data.total || 0)
    } catch (_) {} finally {
      setLoading(false)
    }
  }, [])

  const handleCategoryClick = (key: string) => {
    const newCat = activeCategory === key ? '' : key
    setActiveCategory(newCat)
    fetchFoods(newCat, searchQuery)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchFoods(activeCategory, searchQuery)
  }

  const toggleFood = (id: string) => {
    setExpandedFoods(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const setFoodTab = (foodId: string, tab: string) => {
    setActiveTab(prev => ({ ...prev, [foodId]: tab }))
  }

  const getTab = (foodId: string) => activeTab[foodId] || 'benefits'

  const tabs = [
    { key: 'benefits', label: '健康功效', icon: Heart },
    { key: 'compounds', label: '活性成分', icon: FlaskConical },
    { key: 'tcm', label: '中医', icon: BookOpen },
    { key: 'safety', label: '禁忌', icon: AlertTriangle }
  ]

  // 统计分类食材数（所有分类始终显示）
  const categoryCounts = categories.reduce<Record<string, number>>((acc, c) => {
    acc[c.key] = c.count
    return acc
  }, {})

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
          <Wheat className="w-6 h-6 text-[#2D9C6F]" />
          食材百科
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          共收录 {totalCount || 107} 种食材，覆盖 {categories.length || 17} 个分类
        </p>
      </div>

      <div className="flex gap-6">
        {/* 左侧分类导航 */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="bg-white rounded-xl border border-[#E8E3DB] p-4 sticky top-6">
            <h3 className="font-medium text-[#1B2A4A] mb-3 text-sm">食材分类</h3>
            <button
              onClick={() => { setActiveCategory(''); fetchFoods('', searchQuery) }}
              className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors mb-1 ${
                !activeCategory ? 'bg-[#E85D3A]/10 text-[#E85D3A] font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              全部 ({totalCount || 107})
            </button>
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => handleCategoryClick(cat.key)}
                className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors flex justify-between ${
                  activeCategory === cat.key ? 'bg-[#2D9C6F]/10 text-[#2D9C6F] font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-xs opacity-60">{cat.count}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* 右侧主内容 */}
        <div className="flex-1 min-w-0">
          {/* 搜索栏 */}
          <form onSubmit={handleSearch} className="mb-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索食材、营养素、健康功效..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8E3DB] rounded-lg text-sm focus:outline-none focus:border-[#2D9C6F] focus:ring-1 focus:ring-[#2D9C6F]/20 transition-colors"
              />
            </div>
          </form>

          {/* 移动端分类选择器 */}
          <div className="lg:hidden mb-4 flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => { setActiveCategory(''); fetchFoods('', searchQuery) }}
              className={`shrink-0 px-3 py-1 rounded-full text-xs ${!activeCategory ? 'bg-[#E85D3A] text-white' : 'bg-white text-gray-600 border'}`}
            >
              全部
            </button>
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => handleCategoryClick(cat.key)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs ${activeCategory === cat.key ? 'bg-[#E85D3A] text-white' : 'bg-white text-gray-600 border'}`}
              >
                {cat.name}({cat.count})
              </button>
            ))}
          </div>

          {/* 食材卡片列表 */}
          {loading ? (
            <div className="text-center py-12 text-gray-400">加载中...</div>
          ) : foods.length === 0 ? (
            <div className="text-center py-12 text-gray-400">未找到匹配的食材</div>
          ) : (
            <div className="space-y-3">
              {foods.map(food => {
                const isExpanded = expandedFoods.has(food.id)
                const activeFoodTab = getTab(food.id)
                return (
                  <div key={food.id} className="bg-white rounded-xl border border-[#E8E3DB] overflow-hidden transition-shadow hover:shadow-sm">
                    {/* 卡片头部 */}
                    <button
                      onClick={() => toggleFood(food.id)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-[#1B2A4A]">{i18n.language === 'zh' && food.name_zh ? food.name_zh : food.name}</span>
                          {food.deep_analysis && (
                            <span className="shrink-0 px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[10px] rounded font-medium">
                              深度分析
                            </span>
                          )}
                          {food.tags.map(tag => (
                            <span key={tag} className="shrink-0 px-1.5 py-0.5 bg-[#2D9C6F]/10 text-[#2D9C6F] text-[10px] rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {food.daily_intake && (
                            <span className="text-xs text-gray-500">建议: {food.daily_intake.slice(0, 60)}{food.daily_intake.length > 60 ? '...' : ''}</span>
                          )}
                          {food.health_benefits.slice(0, 2).map((b, i) => (
                            <span key={i} className={`text-[10px] px-1 rounded ${EVIDENCE_COLORS[b.evidence_level] || 'bg-gray-100'}`}>
                              {b.text}
                            </span>
                          ))}
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                    </button>

                    {/* 展开详情 */}
                    {isExpanded && (
                      <div className="border-t border-[#E8E3DB]">
                        {/* Tab 切换 */}
                        <div className="flex border-b border-[#E8E3DB] px-2">
                          {tabs.map(tab => {
                            const Icon = tab.icon
                            const isActive = activeFoodTab === tab.key
                            return (
                              <button
                                key={tab.key}
                                onClick={() => setFoodTab(food.id, tab.key)}
                                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-[1px] ${
                                  isActive ? 'border-[#E85D3A] text-[#E85D3A]' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                                {tab.label}
                              </button>
                            )
                          })}
                        </div>

                        <div className="p-5 max-h-[400px] overflow-y-auto">
                          {/* 健康功效 Tab */}
                          {activeFoodTab === 'benefits' && (
                            <div className="space-y-3">
                              {/* 营养素概览 */}
                              {Object.keys(food.nutrients).length > 0 && (
                                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                  <h4 className="text-xs font-medium text-gray-500 mb-2">每100g营养素</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {Object.entries(food.nutrients).map(([k, v]) => (
                                      <span key={k} className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded text-xs border">
                                        <span className="text-gray-500">{k}</span>
                                        <span className="font-medium text-[#1B2A4A]">{typeof v === 'object' ? v.value : v}{typeof v === 'object' ? v.unit : ''}</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 健康功效列表 */}
                              {food.health_benefits.map((b, idx) => (
                                <div key={idx} className="flex gap-3">
                                  <span className={`shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium leading-tight ${EVIDENCE_COLORS[b.evidence_level]}`}>
                                    {EVIDENCE_LABELS[b.evidence_level]}
                                  </span>
                                  <div>
                                    <p className="text-sm font-medium text-[#1B2A4A]">{b.text}</p>
                                    {b.description && <p className="text-xs text-gray-500 mt-0.5">{b.description}</p>}
                                    {b.reference && <p className="text-[10px] text-gray-400 mt-0.5">📚 {b.reference}</p>}
                                  </div>
                                </div>
                              ))}
                              {food.health_benefits.length === 0 && (
                                <p className="text-xs text-gray-400">暂无数据</p>
                              )}
                            </div>
                          )}

                          {/* 活性成分 Tab */}
                          {activeFoodTab === 'compounds' && (
                            <div className="space-y-3">
                              {food.active_compounds.length > 0 ? (
                                food.active_compounds.map((comp, idx) => (
                                  <div key={idx} className="p-3 bg-blue-50/50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Beaker className="w-3.5 h-3.5 text-blue-500" />
                                      <span className="font-medium text-sm text-[#1B2A4A]">{comp.name}</span>
                                      {comp.content_text && (
                                        <span className="text-xs text-gray-500">{comp.content_text}</span>
                                      )}
                                    </div>
                                    {comp.mechanism && (
                                      <p className="text-xs text-gray-600 ml-5.5">{comp.mechanism}</p>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-gray-400">暂无数据</p>
                              )}
                            </div>
                          )}

                          {/* 中医 Tab */}
                          {activeFoodTab === 'tcm' && (
                            <div className="space-y-3">
                              {food.tcm && Object.keys(food.tcm).length > 0 ? (
                                <div className="p-3 bg-amber-50/50 rounded-lg">
                                  {Object.entries(food.tcm).map(([k, v]) => (
                                    <div key={k} className="flex gap-2 mb-1.5">
                                      <span className="text-xs font-medium text-amber-700 shrink-0">{k}:</span>
                                      <span className="text-xs text-gray-700">{v}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400">暂无中医属性数据</p>
                              )}
                            </div>
                          )}

                          {/* 禁忌 Tab */}
                          {activeFoodTab === 'safety' && (
                            <div className="space-y-3">
                              {food.cooking_tips.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-medium text-[#1B2A4A] mb-2">🍳 推荐吃法</h4>
                                  <ul className="space-y-1">
                                    {food.cooking_tips.map((tip, i) => (
                                      <li key={i} className="text-xs text-gray-600 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-[#2D9C6F]">{tip}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {food.synergy.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-medium text-[#1B2A4A] mb-2">🤝 搭配增效</h4>
                                  <ul className="space-y-1">
                                    {food.synergy.map((s, i) => (
                                      <li key={i} className="text-xs text-gray-600 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-[#2D9C6F]">{s}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {food.contraindications.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-medium text-red-600 mb-2">⚠️ 禁忌与注意事项</h4>
                                  <ul className="space-y-1">
                                    {food.contraindications.map((c, i) => (
                                      <li key={i} className="text-xs text-gray-600 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-red-400">{c}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {food.daily_intake && (
                                <div className="p-3 bg-green-50/50 rounded-lg">
                                  <p className="text-xs">
                                    <span className="font-medium text-[#2D9C6F]">📏 每日建议: </span>
                                    <span className="text-gray-700">{food.daily_intake}</span>
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
