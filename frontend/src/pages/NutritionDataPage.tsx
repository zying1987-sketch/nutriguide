import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, ChevronLeft, ChevronRight, BookOpen, FlaskConical, Tag, Database, Loader2 } from 'lucide-react'

interface KnowledgeItem {
  id: string
  title: string
  title_zh: string
  excerpt: string
  category: string
  categoryName: string
  categoryColor: string
  categoryIcon: string
  evidence_level: string
  confidence: number | null
  tags: string[]
  source: string
}

interface CategoryStat {
  key: string
  name: string
  icon: string
  color: string
  desc: string
  count: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

const EVIDENCE_COLORS: Record<string, string> = {
  A: 'bg-emerald-100 text-emerald-800',
  B: 'bg-amber-100 text-amber-800',
  C: 'bg-slate-100 text-slate-600',
}

const EVIDENCE_LABELS: Record<string, string> = {
  A: 'A级证据',
  B: 'B级证据',
  C: 'C级证据',
}

const ALL_CATEGORY: CategoryStat = {
  key: '', name: '全部', icon: '📚', color: '#1B2A4A', desc: '', count: 0,
}

export default function NutritionDataPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { t, i18n } = useTranslation()

  // 获取当前语言对应的显示标题
  const getDisplayTitle = (item: KnowledgeItem) => {
    return i18n.language === 'zh' && item.title_zh ? item.title_zh : item.title
  }

  const [items, setItems] = useState<KnowledgeItem[]>([])
  const [categories, setCategories] = useState<CategoryStat[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const activeCategory = searchParams.get('category') || ''
  const searchQuery = searchParams.get('q') || ''
  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 20, total: 0, totalPages: 1, hasMore: false,
  })

  const [inputValue, setInputValue] = useState(searchQuery)

  // 加载分类概览
  useEffect(() => {
    fetch('/api/knowledge/overview')
      .then(r => r.json())
      .then(data => {
        const cats = data.categories || []
        const totalAll = cats.reduce((sum: number, c: CategoryStat) => sum + c.count, 0)
        setCategories(cats)
        setTotalCount(data.total || totalAll)
      })
      .catch(() => {})
  }, [])

  // 加载数据
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeCategory) params.set('category', activeCategory)
      if (searchQuery) params.set('q', searchQuery)
      params.set('page', String(currentPage))
      params.set('limit', '20')

      const res = await fetch(`/api/knowledge?${params}`)
      const data = await res.json()
      setItems(data.items || [])
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1, hasMore: false })
    } catch (_) {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [activeCategory, searchQuery, currentPage])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCategoryClick = (key: string) => {
    const params = new URLSearchParams(searchParams)
    if (key) params.set('category', key); else params.delete('category')
    params.set('page', '1')
    setSearchParams(params)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (inputValue.trim()) params.set('q', inputValue.trim()); else params.delete('q')
    params.set('page', '1')
    setSearchParams(params)
  }

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(page))
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleItemClick = (id: string) => {
    navigate(`/nutrition-data/${id}`)
  }

  // 带标签激活状态的分类
  const displayCategories = [ALL_CATEGORY, ...categories]
  if (!activeCategory && totalCount > 0) {
    ALL_CATEGORY.count = totalCount
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* 页面头部 */}
      <div className="bg-white border-b border-[#E8E3DB]">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2D9C6F] to-[#1B8A5A] rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">营养数据库</h1>
          </div>
          <p className="text-[#6B7280] max-w-2xl">
            来自权威营养学教材、临床指南和学术文献的结构化知识库，
            涵盖临床营养、营养素百科、饮食原则、补充剂、食物知识和人群营养六大领域。
          </p>

          {/* 搜索栏 */}
          <form onSubmit={handleSearch} className="mt-6 relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A199]" />
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="搜索营养素、疾病、饮食模式..."
              className="w-full pl-10 pr-4 py-3 bg-[#F8F6F3] border border-[#E5E0D8] rounded-xl text-sm text-[#1B2A4A] placeholder-[#A8A199] 
                         focus:outline-none focus:ring-2 focus:ring-[#2D9C6F]/30 focus:border-[#2D9C6F] transition-all"
            />
          </form>
        </div>
      </div>

      {/* 分类标签 */}
      <div className="border-b border-[#E8E3DB] bg-white/60 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-6 overflow-x-auto">
          <div className="flex gap-1.5 py-3 min-w-max">
            {displayCategories.map(cat => (
              <button
                key={cat.key}
                onClick={() => handleCategoryClick(cat.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap
                  ${activeCategory === cat.key || (!activeCategory && cat.key === '')
                    ? 'bg-[#1B2A4A] text-white shadow-sm'
                    : 'bg-transparent text-[#6B7280] hover:bg-[#F0EDE8] hover:text-[#1B2A4A]'
                  }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                {cat.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeCategory === cat.key || (!activeCategory && cat.key === '')
                      ? 'bg-white/20'
                      : 'bg-[#F0EDE8]'
                  }`}>
                    {cat.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 内容区 */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#A8A199]">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">加载知识库...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#A8A199]">
            <BookOpen className="w-12 h-12 mb-4 opacity-40" />
            <p className="text-sm">没有找到匹配的知识条目</p>
            {searchQuery && (
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams)
                  params.delete('q')
                  params.set('page', '1')
                  setSearchParams(params)
                  setInputValue('')
                }}
                className="mt-3 text-xs text-[#2D9C6F] hover:underline"
              >
                清除搜索条件
              </button>
            )}
          </div>
        ) : (
          <>
            {/* 结果统计 */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs text-[#A8A199]">
                {searchQuery
                  ? `搜索"${searchQuery}" — 共 ${pagination.total} 条结果`
                  : `共 ${pagination.total} 条知识条目`
                }
              </p>
            </div>

            {/* 知识卡片网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className="bg-white rounded-xl border border-[#E8E3DB] p-5 hover:border-[#2D9C6F]/40 hover:shadow-md 
                             cursor-pointer transition-all group"
                >
                  {/* 顶部标签行 */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{ backgroundColor: item.categoryColor + '18', color: item.categoryColor }}
                    >
                      {item.categoryIcon} {item.categoryName}
                    </span>
                    {item.evidence_level && (
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${EVIDENCE_COLORS[item.evidence_level] || 'bg-gray-100 text-gray-600'}`}>
                        {EVIDENCE_LABELS[item.evidence_level] || item.evidence_level}
                      </span>
                    )}
                    {item.confidence && (
                      <span className="text-[10px] text-[#A8A199]">
                        置信度 {item.confidence}%
                      </span>
                    )}
                  </div>

                  {/* 标题 */}
                  <h3 className="text-sm font-semibold text-[#1B2A4A] mb-2 line-clamp-2 group-hover:text-[#2D9C6F] transition-colors">
                    {getDisplayTitle(item)}
                  </h3>

                  {/* 摘要 */}
                  <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-3 mb-3">
                    {item.excerpt}
                  </p>

                  {/* 底部标签和来源 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      {item.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-[10px] text-[#A8A199] bg-[#F8F6F3] px-1.5 py-0.5 rounded truncate">
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-[10px] text-[#A8A199]">+{item.tags.length - 3}</span>
                      )}
                    </div>
                    {item.source && (
                      <span className="text-[10px] text-[#A8A199] truncate max-w-[120px] text-right" title={item.source}>
                        {item.source}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 分页 */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1 px-3 py-2 text-xs rounded-lg border border-[#E5E0D8] text-[#6B7280]
                             hover:bg-[#F8F6F3] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  上一页
                </button>

                <div className="flex items-center gap-1">
                  {generatePageNumbers(currentPage, pagination.totalPages).map((p, i) =>
                    p === '...' ? (
                      <span key={`dots-${i}`} className="px-2 text-xs text-[#A8A199]">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => goToPage(p as number)}
                        className={`w-8 h-8 text-xs rounded-lg transition-colors ${
                          p === currentPage
                            ? 'bg-[#1B2A4A] text-white'
                            : 'text-[#6B7280] hover:bg-[#F0EDE8]'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={!pagination.hasMore}
                  className="flex items-center gap-1 px-3 py-2 text-xs rounded-lg border border-[#E5E0D8] text-[#6B7280]
                             hover:bg-[#F8F6F3] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  下一页
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/** 生成页码按钮列表（含省略号） */
function generatePageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | string)[] = []
  pages.push(1)
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}
