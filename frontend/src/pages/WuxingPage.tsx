import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Leaf, Flame, Wheat, Wind, Droplets, ChefHat, AlertTriangle, Calendar } from 'lucide-react'
import {
  fiveElements, getCurrentSeasonElement, getSeasonalFoods,
  allWuxingFoods, type WuxingFood, type FiveElement,
  organTendencyQuestions, wuxingDisclaimer
} from '../data/wuxing'

const seasonTabs = [
  { key: 'spring', label: '🌱 春季·木·肝', elementId: 1 },
  { key: 'summer', label: '🔥 夏季·火·心', elementId: 2 },
  { key: 'late_summer', label: '🌾 长夏·土·脾', elementId: 3 },
  { key: 'autumn', label: '🍂 秋季·金·肺', elementId: 4 },
  { key: 'winter', label: '❄️ 冬季·水·肾', elementId: 5 },
]

export default function WuxingPage() {
  const { t } = useTranslation()
  const current = getCurrentSeasonElement()
  const [activeSeason, setActiveSeason] = useState(current.season)
  const [selectedFood, setSelectedFood] = useState<WuxingFood | null>(null)

  const foods = useMemo(() => getSeasonalFoods(activeSeason), [activeSeason])
  const element = useMemo(() => fiveElements.find(e => e.season === activeSeason)!, [activeSeason])

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* 顶部横幅 */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${element.colorHex}15, ${element.colorHex}05)` }}>
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#6B6560] hover:text-[#1B2A4A] transition-colors no-underline mb-6">
            <ArrowLeft className="w-4 h-4" /> 返回首页
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: element.colorHex + '20' }}>
              {current.elementEmoji}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-semibold text-[#1B2A4A]">东方营养饮食</h1>
              <p className="text-[#6B6560] mt-1">基于《黄帝内经》五行理论 · 因季而食 · 性味归经</p>
            </div>
          </div>
        </div>
      </div>

      {/* 当前季节提示 */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ backgroundColor: element.colorHex + '10', color: element.colorHex }}>
          <Calendar size={16} />
          <span>当前：{current.seasonCn}｜五行属<span className="font-bold">{current.elementName}</span>｜主<span className="font-bold">{current.organ}</span>｜{current.organDesc}</span>
        </div>
      </div>

      {/* 季节标签栏 */}
      <div className="border-b border-[#E8E3DB] bg-white/60 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-6 overflow-x-auto">
          <div className="flex gap-1.5 py-3 min-w-max">
            {seasonTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveSeason(tab.key); setSelectedFood(null) }}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeSeason === tab.key
                    ? 'bg-[#1B2A4A] text-white shadow-sm'
                    : 'bg-transparent text-[#6B7280] hover:bg-[#F0EDE8] hover:text-[#1B2A4A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 五行图表 */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-[#E8E3DB] p-6 mb-8">
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">五行·五色·五味·五脏 对应图</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8E3DB]">
                  <th className="text-left py-2 px-3 font-semibold text-[#1B2A4A]/50 text-xs">五行</th>
                  <th className="text-left py-2 px-3 font-semibold text-[#1B2A4A]/50 text-xs">季节</th>
                  <th className="text-left py-2 px-3 font-semibold text-[#1B2A4A]/50 text-xs">五色</th>
                  <th className="text-left py-2 px-3 font-semibold text-[#1B2A4A]/50 text-xs">五味</th>
                  <th className="text-left py-2 px-3 font-semibold text-[#1B2A4A]/50 text-xs">五脏</th>
                  <th className="text-left py-2 px-3 font-semibold text-[#1B2A4A]/50 text-xs">养护说明</th>
                </tr>
              </thead>
              <tbody>
                {fiveElements.map(el => (
                  <tr key={el.id} className={`border-b border-[#F0EDE8] ${activeSeason === el.season ? 'font-medium' : ''}`}
                    style={{ backgroundColor: activeSeason === el.season ? el.colorHex + '08' : 'transparent' }}>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1">
                        <span className="text-lg">{el.elementEmoji}</span>
                        <span className="font-semibold">{el.elementName}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#6B6560]">{el.seasonCn}（{el.monthRange}）</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: el.colorHex }} />
                        {el.color}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#6B6560]">{el.taste}</td>
                    <td className="py-3 px-3 font-medium">{el.organ}</td>
                    <td className="py-3 px-3 text-[#6B6560] text-xs">{el.organDesc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 食材列表 */}
        <div>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-1">
            {element.elementEmoji} {element.seasonCn}应季食材（{foods.length}种）
          </h2>
          <p className="text-sm text-[#6B6560] mb-4">所有食谱均为温热烹饪，无生冷冰镇，低糖</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {foods.map(food => (
              <div key={food.id}
                onClick={() => setSelectedFood(selectedFood?.id === food.id ? null : food)}
                className="bg-white rounded-xl border border-[#E8E3DB] p-4 cursor-pointer hover:border-[#2D9C6F]/40 hover:shadow-sm transition-all group">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-[#1B2A4A] group-hover:text-[#2D9C6F] transition-colors">{food.name}</h3>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#F0EDE5] text-[#6B6560]">{food.nature}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: element.colorHex + '15', color: element.colorHex }}>归经：{food.meridians}</span>
                </div>
                <p className="text-xs text-[#6B6560] mb-2">{food.effect}</p>
                <p className="text-[10px] text-[#A8A199]">应季：{food.seasonMonths}</p>

                {/* 展开食谱 */}
                {selectedFood?.id === food.id && (
                  <div className="mt-3 pt-3 border-t border-[#F0EDE8] space-y-2 animate-fade-in-up">
                    <RecipeBlock type="中式" color="#E85D3A" recipe={food.recipes.chinese} />
                    <RecipeBlock type="西式" color="#3B82F6" recipe={food.recipes.western} />
                    <RecipeBlock type="融合" color="#8B5CF6" recipe={food.recipes.fusion} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 五脏倾向自测 */}
        <div className="bg-white rounded-2xl border border-[#E8E3DB] p-6 mt-8">
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">五脏偏颇自测</h2>
          <p className="text-sm text-[#6B6560] mb-4">选择你最近常出现的身体信号，我们会推荐对应的五行调理食材：</p>
          <div className="space-y-2">
            {organTendencyQuestions.map(q => (
              <div key={q.id} className="flex items-start gap-3 p-3 bg-[#FAF8F5] rounded-xl text-sm">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
                  style={{ backgroundColor: fiveElements.find(e => e.id === q.elementId)?.colorHex + '20' }}>
                  {fiveElements.find(e => e.id === q.elementId)?.elementEmoji}
                </span>
                <div>
                  <span className="font-medium text-[#1B2A4A]">{q.organ} — </span>
                  <span className="text-[#6B6560]">{q.label}</span>
                  <span className="text-[10px] text-[#A8A199] ml-2">
                    → 五行属{fiveElements.find(e => e.id === q.elementId)?.elementName}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[#A8A199] mt-3">
            以上自测结果可在完整的「AI自测」流程中结合西方营养学给出综合建议。
          </p>
        </div>

        {/* 免责声明 */}
        <div className="mt-8 p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E3DB]">
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-[#D4A853] mt-0.5 shrink-0" />
            <p className="text-xs text-[#6B6560] leading-relaxed">{wuxingDisclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function RecipeBlock({ type, color, recipe }: { type: string; color: string; recipe: { name: string; method: string } }) {
  return (
    <div className="p-2.5 rounded-lg" style={{ backgroundColor: color + '08' }}>
      <div className="flex items-center gap-1.5 mb-1">
        <ChefHat size={11} style={{ color }} />
        <span className="text-[10px] font-semibold" style={{ color }}>{type}</span>
        <span className="text-xs font-medium text-[#1B2A4A]">{recipe.name}</span>
      </div>
      <p className="text-[10px] text-[#6B6560] leading-relaxed">{recipe.method}</p>
    </div>
  )
}
