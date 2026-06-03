import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Search, ArrowRight, Apple, Beef, Droplets, Wheat, Pill,
} from 'lucide-react'
import { nutrients, type Nutrient } from '../data/nutrients'

export default function NutrientListPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = (searchParams.get('category') || 'all') as string
  const [search, setSearch] = useState('')

  const categoryConfig: Record<Nutrient['category'], { labelKey: string; color: string; bg: string }> = {
    vitamin:   { labelKey: 'nutrients.categoryVitamin',   color: '#7A8B6F', bg: 'bg-[#E8F0EB]/60' },
    mineral:   { labelKey: 'nutrients.categoryMineral',   color: '#C17A5F', bg: 'bg-[#F0E6D8]/60' },
    fatty_acid: { labelKey: 'nutrients.categoryFattyAcid', color: '#3A6B70', bg: 'bg-[#DCE8E4]/60' },
    fiber:     { labelKey: 'nutrients.categoryFiber',     color: '#5A6B40', bg: 'bg-[#E0EBDC]/60' },
    macronutrient: { labelKey: 'nutrients.categoryMacro', color: '#6B5040', bg: 'bg-[#EDE5DC]/60' },
  }

  const categoryIcons: Record<Nutrient['category'], typeof Pill> = {
    vitamin: Pill,
    mineral: Beef,
    fatty_acid: Droplets,
    fiber: Wheat,
    macronutrient: Apple,
  }

  const filtered = useMemo(() => {
    return nutrients.filter(n => {
      const matchCategory = activeCategory === 'all' || n.category === activeCategory
      const matchSearch = !search.trim()
        || n.name.includes(search.trim())
        || n.nameEn.toLowerCase().includes(search.toLowerCase())
        || n.mainFunction.includes(search.trim())
      return matchCategory && matchSearch
    })
  }, [activeCategory, search])

  const categories = [
    { key: 'all', label: t('nutrients.allCategory') },
    { key: 'vitamin',       label: t('nutrients.categoryVitamin') },
    { key: 'mineral',       label: t('nutrients.categoryMineral') },
    { key: 'fatty_acid',    label: t('nutrients.categoryFattyAcid') },
    { key: 'fiber',         label: t('nutrients.categoryFiber') },
    { key: 'macronutrient', label: t('nutrients.categoryMacro') },
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <span className="text-xs tracking-[0.2em] uppercase text-[#A8A199] font-medium">
          {t('nutrients.badge')}
        </span>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-[#1A1A1A] mt-3 leading-tight">
          {t('nutrients.title')}
        </h1>
        <p className="text-[#6B6560] mt-3 max-w-lg leading-relaxed">
          {t('nutrients.subtitle')}
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A199]" />
          <input
            type="text"
            placeholder={t('nutrients.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E5E0D8] bg-white text-sm text-[#1A1A1A] placeholder:text-[#A8A199] focus:outline-none focus:border-[#7A8B6F] transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => {
            const isActive = activeCategory === cat.key
            return (
              <button
                key={cat.key}
                onClick={() => { setSearch(''); setSearchParams(cat.key === 'all' ? {} : { category: cat.key }) }}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#1A1A1A] text-white'
                    : 'bg-[#F5F2EC] text-[#6B6560] hover:bg-[#E5E0D8]'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(n => {
          const cfg = categoryConfig[n.category]
          const Icon = categoryIcons[n.category]
          const isULUnknown = n.ul === '未确定' || n.ul === '未设（食物中安全）' || n.ul === '无'
          return (
            <Link
              key={n.id}
              to={`/nutrient/${n.id}`}
              className="group block rounded-2xl border border-[#E5E0D8] bg-white p-6 hover:border-[#7A8B6F]/30 hover:shadow-lg hover:shadow-[#1A1A1A]/5 hover:-translate-y-0.5 transition-all duration-300 no-underline"
            >
              {/* Top row: icon + category */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                </div>
                <span className="text-[10px] tracking-wider uppercase text-[#A8A199] font-medium">
                  {t(cfg.labelKey)}
                </span>
              </div>

              {/* Name */}
              <h3 className="font-serif text-lg font-semibold text-[#1A1A1A] group-hover:text-[#7A8B6F] transition-colors">
                {n.name}
              </h3>
              <p className="text-xs text-[#A8A199] mt-0.5">{n.nameEn}</p>

              {/* Function */}
              <p className="text-sm text-[#6B6560] mt-3 leading-relaxed line-clamp-2">
                {n.mainFunction}
              </p>

              {/* RNI + UL pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-2.5 py-1 rounded-full bg-[#F5F2EC] text-[10px] text-[#1A1A1A] font-medium">
                  RNI {n.rni.male}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
                  isULUnknown
                    ? 'bg-[#E8F0EB]/60 text-[#7A8B6F]'
                    : 'bg-[#F0E6D8]/80 text-[#C17A5F]'
                }`}>
                  {isULUnknown ? t('nutrients.ulUnknown') : `UL ${n.ul}`}
                </span>
              </div>

              {/* Arrow */}
              <div className="flex justify-end mt-3">
                <ArrowRight className="w-4 h-4 text-[#A8A199] group-hover:text-[#7A8B6F] group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-[#A8A199]">
          <p className="text-lg">{t('nutrients.noResults')}</p>
          <p className="text-sm mt-2">{t('nutrients.noResultsHint')}</p>
        </div>
      )}
    </div>
  )
}
