import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, CheckCircle, Apple, Pill, Clock, Heart, ShieldCheck } from 'lucide-react'
import { nutrients, type Nutrient, labThresholds } from '../data/nutrients'

const categoryLabels: Record<Nutrient['category'], string> = {
  vitamin: '维生素',
  mineral: '矿物质',
  fatty_acid: '脂肪酸',
  fiber: '膳食纤维',
  macronutrient: '宏量营养素',
}

const categoryColors: Record<Nutrient['category'], string> = {
  vitamin: '#7A8B6F',
  mineral: '#C17A5F',
  fatty_acid: '#3A6B70',
  fiber: '#5A6B40',
  macronutrient: '#6B5A40',
}

const cycleLabels: Record<Nutrient['cycleType'], string> = {
  daily: '每日补充',
  periodic: '周期性补充',
  as_needed: '按需补充',
}

export default function NutrientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const nutrient = nutrients.find(n => n.id === id)

  if (!nutrient) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <p className="text-[#6B6560] mb-4">未找到该营养素</p>
        <Link to="/nutrients" className="text-[#7A8B6F] hover:underline text-sm no-underline">
          ← 返回营养素列表
        </Link>
      </div>
    )
  }

  const color = categoryColors[nutrient.category]
  const isULUnknown = nutrient.ul === '未确定' || nutrient.ul === '未设（食物中安全）' || nutrient.ul === '无'
  const labRef = labThresholds.find(t => t.param === nutrient.id)

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Back link */}
      <Link
        to="/nutrients"
        className="inline-flex items-center gap-2 text-sm text-[#6B6560] hover:text-[#1A1A1A] transition-colors mb-8 no-underline"
      >
        <ArrowLeft className="w-4 h-4" /> 返回营养素列表
      </Link>

      {/* Top card */}
      <div className="rounded-[32px] bg-white border border-[#E5E0D8] p-8 md:p-10 mb-8 overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full" style={{ backgroundColor: `${color}08` }} />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full" style={{ backgroundColor: `${color}05` }} />

        <div className="relative z-10">
          {/* Badge row */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: `${color}15`, color }}
            >
              {categoryLabels[nutrient.category]}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#F5F2EC] text-xs text-[#6B6560] font-medium">
              {cycleLabels[nutrient.cycleType]}
            </span>
            {nutrient.specialNotes && (
              <span className="px-3 py-1 rounded-full bg-[#F0E6D8]/60 text-xs text-[#C17A5F] font-medium">
                注意事项
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-[#1A1A1A] leading-tight">
            {nutrient.name}
          </h1>
          <p className="text-[#A8A199] mt-1">{nutrient.nameEn}</p>

          {/* Main function */}
          <div className="mt-6 p-5 rounded-2xl bg-[#F8F6F3] border-l-4" style={{ borderColor: color }}>
            <p className="text-sm text-[#1A1A1A] font-medium">主要功能</p>
            <p className="text-base text-[#6B6560] mt-1 leading-relaxed">{nutrient.mainFunction}</p>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card 1: Daily intake recommendation */}
        <div className="rounded-2xl bg-white border border-[#E5E0D8] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
              <CheckCircle className="w-4.5 h-4.5" style={{ color }} />
            </div>
            <h2 className="font-serif text-lg font-semibold text-[#1A1A1A]">日常摄入建议</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-[#A8A199] mb-1">推荐摄入量（RNI / AI）</p>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold font-serif" style={{ color }}>{nutrient.rni.male}</span>
                <span className="text-xs text-[#6B6560]">♂ 男性</span>
              </div>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-2xl font-bold font-serif" style={{ color }}>{nutrient.rni.female}</span>
                <span className="text-xs text-[#6B6560]">♀ 女性</span>
              </div>
              <p className="text-xs text-[#A8A199] mt-2">单位：{nutrient.rni.unit}</p>
            </div>

            <div className="h-px bg-[#E5E0D8]" />

            <div>
              <p className="text-xs text-[#A8A199] mb-1">补充周期</p>
              <p className="text-sm text-[#1A1A1A] font-medium">{cycleLabels[nutrient.cycleType]}</p>
            </div>

            {nutrient.specialNotes && (
              <>
                <div className="h-px bg-[#E5E0D8]" />
                <div className="p-3 rounded-xl bg-[#F0E6D8]/30 border border-[#E5E0D8]">
                  <p className="text-xs text-[#C17A5F] font-medium">💡 特别提示</p>
                  <p className="text-xs text-[#6B6560] mt-1 leading-relaxed">{nutrient.specialNotes}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Card 2: Overdose risk */}
        <div className="rounded-2xl bg-white border border-[#E5E0D8] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isULUnknown ? 'bg-[#E8F0EB]/60' : 'bg-[#F0E6D8]/60'
            }`}>
              <AlertTriangle className={`w-4.5 h-4.5 ${
                isULUnknown ? 'text-[#7A8B6F]' : 'text-[#C17A5F]'
              }`} />
            </div>
            <h2 className="font-serif text-lg font-semibold text-[#1A1A1A]">
              超量风险
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-[#A8A199] mb-1">可耐受最高摄入量（UL）</p>
              {isULUnknown ? (
                <p className="text-sm text-[#7A8B6F] font-medium">尚不明确（常规饮食不易过量）</p>
              ) : (
                <p className="text-2xl font-bold font-serif text-[#C17A5F]">{nutrient.ul}</p>
              )}
            </div>

            <div className="h-px bg-[#E5E0D8]" />

            <div>
              <p className="text-xs text-[#A8A199] mb-2">过量症状</p>
              <div className="flex flex-wrap gap-2">
                {nutrient.overdoseRisk.split('、').map((risk, i) => (
                  <span
                    key={i}
                    className={`px-2.5 py-1 rounded-full text-xs ${
                      isULUnknown
                        ? 'bg-[#E8F0EB]/40 text-[#7A8B6F]'
                        : 'bg-[#F0E6D8]/50 text-[#C17A5F]'
                    }`}
                  >
                    {risk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Food sources */}
      <div className="rounded-2xl bg-white border border-[#E5E0D8] p-6 md:p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
            <Apple className="w-4.5 h-4.5" style={{ color }} />
          </div>
          <h2 className="font-serif text-lg font-semibold text-[#1A1A1A]">获取途径（食物来源）</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {nutrient.sources.map((source, i) => (
            <div
              key={i}
              className="rounded-xl p-4 text-center border border-[#E5E0D8] hover:border-[#7A8B6F]/30 transition-colors"
            >
              <p className="text-sm text-[#1A1A1A] font-medium">{source}</p>
            </div>
          ))}
        </div>

        {nutrient.id === 'vitamin_d' && (
          <div className="mt-5 p-4 rounded-xl bg-[#E8F0EB]/30 border border-[#7A8B6F]/20">
            <p className="text-xs text-[#7A8B6F] font-medium">☀️ 特别提醒：维生素 D 食物来源有限</p>
            <p className="text-xs text-[#6B6560] mt-1 leading-relaxed">
              维生素 D 主要通过阳光照射皮肤合成，食物来源较少。建议每天户外活动 15–30 分钟，
              或在医生指导下补充维生素 D 制剂。
            </p>
          </div>
        )}

        {nutrient.id === 'vitamin_b12' && (
          <div className="mt-5 p-4 rounded-xl bg-[#F0E6D8]/30 border border-[#C17A5F]/20">
            <p className="text-xs text-[#C17A5F] font-medium">🌱 素食者注意</p>
            <p className="text-xs text-[#6B6560] mt-1 leading-relaxed">
              维生素 B12 几乎只存在于动物性食物中。严格素食者必须通过强化食品或补充剂获取，
              否则易缺乏。
            </p>
          </div>
        )}
      </div>

      {/* Card 4: At-risk groups */}
      <div className="rounded-2xl bg-white border border-[#E5E0D8] p-6 md:p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
            <Heart className="w-4.5 h-4.5" style={{ color }} />
          </div>
          <h2 className="font-serif text-lg font-semibold text-[#1A1A1A]">高风险缺乏人群</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          {nutrient.atRiskGroups.map((group, i) => (
            <span
              key={i}
              className="px-4 py-2 rounded-full border text-sm"
              style={{ borderColor: `${color}30`, color, backgroundColor: `${color}08` }}
            >
              {group}
            </span>
          ))}
        </div>
      </div>

      {/* Card 5: Lab test reference (if available) */}
      {labRef && (
        <div className="rounded-2xl bg-[#F8F6F3] border border-[#E5E0D8] p-6 md:p-8 mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[#7A8B6F]/10 flex items-center justify-center">
              <ShieldCheck className="w-4.5 h-4.5 text-[#7A8B6F]" />
            </div>
            <h2 className="font-serif text-lg font-semibold text-[#1A1A1A]">
              相关检测指标参考
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E0D8]">
                  <th className="text-left py-2 text-xs text-[#A8A199] font-medium uppercase tracking-wider">指标</th>
                  <th className="text-left py-2 text-xs text-[#A8A199] font-medium">缺乏</th>
                  <th className="text-left py-2 text-xs text-[#A8A199] font-medium">不足</th>
                  <th className="text-left py-2 text-xs text-[#A8A199] font-medium">理想范围</th>
                  <th className="text-left py-2 text-xs text-[#A8A199] font-medium">偏高</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#E5E0D8]/50">
                  <td className="py-3 text-[#1A1A1A] font-medium">{labRef.name}</td>
                  <td className="py-3 text-[#C17A5F]">{labRef.deficient}</td>
                  <td className="py-3 text-[#C17A5F]/70">{labRef.insufficient}</td>
                  <td className="py-3 text-[#7A8B6F] font-medium">{labRef.optimal}</td>
                  <td className="py-3 text-[#C17A5F]">{labRef.high}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#A8A199] mt-3">单位：{labRef.unit} · 数据仅供参考，请以医生解读为准</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-2xl bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 p-5">
        <p className="text-xs text-[#6B6560] leading-relaxed">
          ⚠️ <strong>免责声明：</strong>本页面信息基于中国居民膳食营养素参考摄入量（DRIs 2023）及公开科学文献，
          仅供教育和参考目的，不构成医疗诊断或治疗建议。任何营养素补充剂的使用均应在医生或注册营养师指导下进行。
          请在开始任何补充方案前咨询您的医生。
        </p>
      </div>
    </div>
  )
}
