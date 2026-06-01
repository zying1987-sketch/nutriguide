import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Pill, Apple, Timer, Activity, AlertTriangle,
  Heart, Brain, Leaf, Baby, Flame, Dumbbell,
  Droplets, Shield, Zap, Moon, Stethoscope, Sparkles,
  ChevronRight, Info
} from 'lucide-react'
import { useState } from 'react'
import {
  populationPlans,
  populationCategories,
  type PopulationPlan,
  type SupplementRecommendation,
} from '../../data/populationPlans'

const categoryIconMap: Record<string, React.ElementType> = {
  baby: Baby, leaf: Leaf, dumbbell: Dumbbell, heart: Heart,
  flame: Flame, activity: Activity, stomach: Activity,
  brain: Brain, droplet: Droplets, shield: Shield,
  moon: Moon, zap: Zap,
}

const levelConfig: Record<SupplementRecommendation['level'], { label: string; bg: string; text: string }> = {
  core: { label: '核心', bg: 'bg-[#E8F0EB]', text: 'text-[#2D6B4F]' },
  conditional: { label: '按需', bg: 'bg-[#F0E6D8]', text: 'text-[#C17A5F]' },
  optional: { label: '可选', bg: 'bg-[#E0E4EC]', text: 'text-[#3A5060]' },
}

function SupplementCard({ s }: { s: SupplementRecommendation }) {
  const cfg = levelConfig[s.level]
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E5E0D8] hover:border-[#2D6B4F]/20 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-[#1A1A1A]">{s.name}</h4>
          <p className="text-xs text-[#A8A199]">{s.nameEn}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
          {cfg.label}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <Pill className="w-4 h-4 text-[#2D6B4F] mt-0.5 shrink-0" />
          <span className="text-[#1A1A1A] font-medium">{s.dosage}</span>
          <span className="text-[#A8A199]">· {s.form}</span>
        </div>
        <div className="flex items-start gap-2">
          <Timer className="w-4 h-4 text-[#C17A5F] mt-0.5 shrink-0" />
          <span className="text-[#6B6560]">{s.timing}</span>
        </div>
        {s.condition && (
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-[#3A5060] mt-0.5 shrink-0" />
            <span className="text-[#6B6560] text-xs italic">{s.condition}</span>
          </div>
        )}
        {s.drugInteraction && (
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-[#C17A5F] mt-0.5 shrink-0" />
            <span className="text-[#C17A5F] text-xs font-medium">{s.drugInteraction}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function FoodList({ title, items, type }: { title: string; items: { name: string; reason: string }[]; type: 'eat' | 'avoid' }) {
  const isEat = type === 'eat'
  return (
    <div>
      <h4 className={`text-sm font-semibold mb-3 ${isEat ? 'text-[#2D6B4F]' : 'text-[#C17A5F]'}`}>
        {title}
      </h4>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${isEat ? 'bg-[#2D6B4F]' : 'bg-[#C17A5F]'}`} />
            <span className="text-[#1A1A1A] font-medium">{item.name}</span>
            <span className="text-[#A8A199]">— {item.reason}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PlanDetailView({ plan }: { plan: PopulationPlan }) {
  return (
    <div className="space-y-10">
      {/* Plan header */}
      <div>
        <h2 className="font-serif text-2xl font-semibold text-[#1A1A1A] mb-2">{plan.name}</h2>
        <p className="text-[#6B6560] leading-relaxed">{plan.description}</p>
      </div>

      {/* Key Risks */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] mb-3">
          <AlertTriangle className="w-4 h-4 text-[#C17A5F]" />
          关键营养风险
        </h3>
        <div className="flex flex-wrap gap-2">
          {plan.keyRisks.map((risk, i) => (
            <span key={i} className="px-3 py-1.5 bg-[#FEF5F0] border border-[#F0D8C8] text-[#7A5C4A] text-xs rounded-full">
              {risk}
            </span>
          ))}
        </div>
      </div>

      {/* Supplements */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] mb-4">
          <Pill className="w-4 h-4 text-[#2D6B4F]" />
          补充剂方案
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {plan.supplements.map((s, i) => (
            <SupplementCard key={i} s={s} />
          ))}
        </div>
      </div>

      {/* Diet */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] mb-4">
          <Apple className="w-4 h-4 text-[#C17A5F]" />
          饮食方案
        </h3>
        <div className="bg-[#F5F2EC] rounded-2xl p-6 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-[#2D6B4F] mb-3">核心原则</h4>
            <div className="space-y-3">
              {plan.diet.principles.map((p, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#2D6B4F]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-[#2D6B4F]">{i + 1}</span>
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">{p.principle}</p>
                    <p className="text-xs text-[#6B6560] mt-0.5">{p.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-2">
            <FoodList title="推荐食物" items={plan.diet.foodsToEat} type="eat" />
            <FoodList title="避免 / 限制" items={plan.diet.foodsToAvoid} type="avoid" />
          </div>
        </div>
      </div>

      {/* Lifestyle */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] mb-4">
          <Activity className="w-4 h-4 text-[#3A5060]" />
          生活方式
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {plan.lifestyle.map((item, i) => (
            <div key={i} className="bg-white border border-[#E5E0D8] rounded-2xl p-4">
              <span className="text-xs font-semibold text-[#2D6B4F] uppercase tracking-wide">{item.category}</span>
              <p className="text-sm text-[#1A1A1A] mt-1 leading-relaxed">{item.recommendation}</p>
              {item.frequency && (
                <p className="text-xs text-[#A8A199] mt-1">{item.frequency}</p>
              )}
              {item.note && (
                <p className="text-xs text-[#6B6560] mt-1 italic">{item.note}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Monitoring + Warnings */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#F5F2EC] rounded-2xl p-6">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] mb-3">
            <Stethoscope className="w-4 h-4 text-[#2D6B4F]" />
            监测计划
          </h4>
          <ul className="space-y-2">
            {plan.monitoringPlan.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#6B6560]">
                <ChevronRight className="w-4 h-4 text-[#2D6B4F] mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-[#FEF5F0] to-[#FFF5F5] rounded-2xl p-6 border border-[#F0D8C8]">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] mb-3">
            <AlertTriangle className="w-4 h-4 text-[#C17A5F]" />
            就医指征
          </h4>
          <ul className="space-y-2">
            {plan.warningSigns.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#7A5C4A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C17A5F] mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function PopulationDetailPage() {
  const { categoryKey } = useParams<{ categoryKey: string }>()
  const [activeSubTab, setActiveSubTab] = useState(0)

  const category = populationCategories.find(c => c.key === categoryKey)
  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#6B6560] mb-4">未找到该人群分类</p>
          <Link to="/" className="text-[#2D6B4F] hover:underline">返回首页</Link>
        </div>
      </div>
    )
  }

  const IconComp = categoryIconMap[category.icon] || Heart
  const plans = Object.values(populationPlans).filter(p => p.category === categoryKey)
  const currentPlan = plans[activeSubTab] || plans[0]

  return (
    <div>
      {/* Top Banner */}
      <div className="relative overflow-hidden" style={{ backgroundColor: category.color + '10' }}>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-white/20 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] rounded-full bg-white/15 translate-y-1/2 -translate-x-1/4" />

        <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-20 relative z-10">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-[#6B6560] hover:text-[#1A1A1A] transition-colors no-underline mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>

          <div className="flex items-start gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: category.color + '20' }}
            >
              <IconComp className="w-8 h-8" style={{ color: category.color }} />
            </div>
            <div>
              <h1 className="font-serif text-4xl md:text-5xl font-semibold text-[#1A1A1A] mb-3">
                {category.name}
              </h1>
              <p className="text-[#6B6560] leading-relaxed max-w-2xl">
                {currentPlan?.description || '了解该人群的特殊营养需求和科学补充方案'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      {plans.length > 1 && (
        <div className="border-b border-[#E5E0D8] bg-white sticky top-16 z-40">
          <div className="max-w-[1200px] mx-auto px-6 flex overflow-x-auto gap-1">
            {plans.map((plan, i) => (
              <button
                key={plan.id}
                onClick={() => setActiveSubTab(i)}
                className={`px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  i === activeSubTab
                    ? 'border-[#2D6B4F] text-[#2D6B4F]'
                    : 'border-transparent text-[#6B6560] hover:text-[#1A1A1A]'
                }`}
              >
                {plan.name.replace(category.name + ' - ', '').replace(category.name, '')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <PlanDetailView plan={currentPlan} />

        {/* Bottom CTA */}
        <div className="mt-16 p-10 bg-[#1A1A1A] rounded-[32px] text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
          <Sparkles className="w-8 h-8 mx-auto mb-4 text-[#2D6B4F]" />
          <h3 className="font-serif text-2xl font-semibold mb-3">不确定自己属于哪类人群？</h3>
          <p className="text-white/50 mb-6 max-w-md mx-auto">
            完成 6 步自测，精准匹配你的营养需求
          </p>
          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#1A1A1A] rounded-full text-sm font-medium hover:bg-[#F5F2EC] transition-colors no-underline"
          >
            开始免费自测
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  )
}
