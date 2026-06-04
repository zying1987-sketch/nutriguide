import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight, Leaf, Brain, Heart, Shield, Apple,
  FlaskConical, Sparkles, Sun, Baby, Activity,
  Droplets, Smile, Timer, Users, Pill, Moon,
  Zap, MessageCircle, CheckCircle, Globe
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../stores/useAuthStore'

export default function HomePage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)

  const features = [
    {
      num: '01',
      title: t('home.features.f1.title'),
      desc: t('home.features.f1.desc'),
      icon: Brain,
    },
    {
      num: '02',
      title: t('home.features.f2.title'),
      desc: t('home.features.f2.desc'),
      icon: Apple,
    },
    {
      num: '03',
      title: t('home.features.f3.title'),
      desc: t('home.features.f3.desc'),
      icon: FlaskConical,
    },
    {
      num: '04',
      title: t('home.features.f4.title'),
      desc: t('home.features.f4.desc'),
      icon: Shield,
    },
  ]

  const populationGroups = [
    { name: t('populations.pregnancy.name'), desc: t('populations.pregnancy.desc'), icon: Baby, color: 'from-[#E8D5C4] to-[#F0E6D8]', textColor: '#7A5C4A', categoryKey: 'pregnancy' },
    { name: t('populations.vegetarian.name'), desc: t('populations.vegetarian.desc'), icon: Leaf, color: 'from-[#C8D9C4] to-[#E0EBDC]', textColor: '#4A6B40', categoryKey: 'vegetarian' },
    { name: t('populations.fitness.name'), desc: t('populations.fitness.desc'), icon: Activity, color: 'from-[#C4D4E0] to-[#DCE6EE]', textColor: '#3A5A70', categoryKey: 'fitness' },
    { name: t('populations.menopause.name'), desc: t('populations.menopause.desc'), icon: Sun, color: 'from-[#E0D4C8] to-[#EDE5DC]', textColor: '#6B5040', categoryKey: 'menopause' },
    { name: t('populations.pcos.name'), desc: t('populations.pcos.desc'), icon: Droplets, color: 'from-[#D4C8D8] to-[#E8E0EC]', textColor: '#5A4060', categoryKey: 'pcos' },
    { name: t('populations.ibs.name'), desc: t('populations.ibs.desc'), icon: Smile, color: 'from-[#C8D8D4] to-[#DCE8E4]', textColor: '#3A6050', categoryKey: 'ibs' },
    { name: t('populations.mental_health.name'), desc: t('populations.mental_health.desc'), icon: Heart, color: 'from-[#D8C8C4] to-[#ECE0DC]', textColor: '#604040', categoryKey: 'mental_health' },
    { name: t('populations.diabetes.name'), desc: t('populations.diabetes.desc'), icon: Shield, color: 'from-[#C4D0D8] to-[#DCE4EA]', textColor: '#3A5060', categoryKey: 'diabetes' },
    { name: t('populations.hashimoto.name'), desc: t('populations.hashimoto.desc'), icon: Sparkles, color: 'from-[#D8D4C8] to-[#ECE8DC]', textColor: '#605040', categoryKey: 'hashimoto' },
    { name: t('populations.menstrual.name'), desc: t('populations.menstrual.desc'), icon: Moon, color: 'from-[#E8D0DA] to-[#F0E0E8]', textColor: '#8B5A6B', categoryKey: 'menstrual' },
    { name: t('populations.elderly.name'), desc: t('populations.elderly.desc'), icon: Users, color: 'from-[#D4D0C8] to-[#E8E4DC]', textColor: '#5A5040', categoryKey: 'elderly' },
    { name: t('populations.adolescent.name'), desc: t('populations.adolescent.desc'), icon: Brain, color: 'from-[#C8DCE0] to-[#DCEAEE]', textColor: '#3A5A6B', categoryKey: 'adolescent' },
    { name: '普通人群', desc: '18-64岁健康成年人营养基准，基于《中国居民膳食指南》& US Guidelines', icon: Globe, color: 'from-[#C8D4E0] to-[#DCE4EE]', textColor: '#2A4A6B', categoryKey: 'general' },
  ]

  return (
    <div className="overflow-hidden">
      {/* ===== HERO: 双入口 ===== */}
      <section className="relative pt-6 pb-16 md:pt-8 md:pb-24">
        <div className="max-w-[1000px] mx-auto px-6">
          {/* Headline */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-[#1A1A1A] leading-tight">
              {t('home.dualTitle')}
            </h1>
            <p className="mt-4 text-[#6B6560] text-lg">{t('home.dualSubtitle')}</p>
          </div>

          {/* Two Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-[800px] mx-auto">
            {/* Left: Free Assessment */}
            <div className="relative rounded-2xl border border-[#E5E0D8] bg-white overflow-hidden group hover:shadow-lg hover:shadow-[#2D6B4F]/5 transition-all">
              <div className="bg-[#2D6B4F] px-6 py-3 flex items-center gap-2">
                <CheckCircle size={16} className="text-white" />
                <span className="text-white font-semibold text-sm">{t('home.freeTest')}</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#E8F0EB] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] text-[#2D6B4F] font-semibold">1</span>
                    </div>
                    <p className="text-sm text-[#6B6560]">{t('home.freeTestStep1')}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#E8F0EB] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] text-[#2D6B4F] font-semibold">2</span>
                    </div>
                    <p className="text-sm text-[#6B6560]">{t('home.freeTestStep2')}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#E8F0EB] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] text-[#2D6B4F] font-semibold">3</span>
                    </div>
                    <p className="text-sm text-[#6B6560]">{t('home.freeTestStep3')}</p>
                  </div>
                </div>
                <a
                  href="#/assessment"
                  className="block text-center px-6 py-3 bg-[#1A1A1A] text-white rounded-full text-sm font-medium hover:bg-[#333] transition-all no-underline"
                >
                  {t('home.freeTestCTA')}
                </a>
              </div>
            </div>

            {/* Right: Paid AI Chat */}
            <div className="relative rounded-2xl border border-amber-200 bg-white overflow-hidden group hover:shadow-lg hover:shadow-amber-100/30 transition-all">
              <div className="bg-amber-500 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-white" />
                  <span className="text-white font-semibold text-sm">{t('home.aiChat')}</span>
                </div>
                <span className="text-white/80 text-xs bg-white/20 px-2 py-0.5 rounded-full">{t('home.perCredit')}</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MessageCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-[#6B6560]">{t('home.aiChatDesc')}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Brain size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-[#6B6560]">{t('home.aiChatDesc2')}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-[#6B6560]">{t('home.aiChatDesc3')}</p>
                  </div>
                </div>
                {user ? (
                  <a
                    href="#/chat"
                    className="block w-full text-center px-6 py-3 bg-amber-500 text-white rounded-full text-sm font-medium hover:bg-amber-600 transition-all no-underline"
                  >
                    {t('home.aiChatCTA')}
                  </a>
                ) : (
                  <a
                    href="#/register"
                    className="block text-center px-6 py-3 bg-amber-500 text-white rounded-full text-sm font-medium hover:bg-amber-600 transition-all no-underline"
                  >
                    {t('home.aiChatCTA')}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 积分购买弹窗 */}
      {showPurchase && <CreditPurchaseModal onClose={() => setShowPurchase(false)} />}

      {/* ===== WHY US ===== */}
      <section className="py-28 md:py-36">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Section header */}
          <div className="text-center mb-20">
            <span className="text-xs tracking-[0.2em] uppercase text-[#A8A199] font-medium">
              {t('home.whyUs.label')}
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#1A1A1A] mt-4 leading-tight">
              {t('home.whyUs.title')}
            </h2>
            <p className="text-[#6B6560] mt-4 max-w-md mx-auto leading-relaxed">
              {t('home.whyUs.subtitle')}
            </p>
          </div>

          {/* Numbered cards grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-[24px] p-8 border border-[#E5E0D8] hover:border-[#2D6B4F]/20 hover:shadow-lg hover:shadow-[#1A1A1A]/5 transition-all duration-500"
              >
                {/* Number */}
                <span className="absolute top-6 right-8 font-serif text-5xl font-semibold text-[#E5E0D8] group-hover:text-[#2D6B4F]/20 transition-colors">
                  {f.num}
                </span>

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-[#F5F2EC] flex items-center justify-center mb-6 group-hover:bg-[#E8F0EB] transition-colors">
                    <f.icon className="w-6 h-6 text-[#2D6B4F]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">{f.title}</h3>
                  <p className="text-[#6B6560] leading-relaxed text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== POPULATION GRID ===== */}
      <section className="py-28 md:py-36 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
            <div>
              <span className="text-xs tracking-[0.2em] uppercase text-[#A8A199] font-medium">
                {t('home.populations.label')}
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#1A1A1A] mt-4 leading-tight">
                {t('home.populations.title')}
              </h2>
              <p className="text-[#6B6560] mt-4 max-w-md leading-relaxed">
                {t('home.populations.subtitle')}
              </p>
            </div>
            <a
              href="#/assessment"
              className="mt-6 md:mt-0 inline-flex items-center gap-2 text-sm text-[#2D6B4F] font-medium hover:underline no-underline"
            >
              {t('home.populations.cta')} <ArrowRight size={14} />
            </a>
          </div>

          {/* Masonry-style grid — 12 cards, 4 columns on large */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {populationGroups.map((group, i) => {
              const isLarge = i === 0 || i === 3 || i === 9
              return (
                <Link
                  key={i}
                  to={`/population/${group.categoryKey}`}
                  className={`group relative rounded-[24px] overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-[#1A1A1A]/8 hover:-translate-y-1 no-underline ${
                    isLarge ? 'md:col-span-2 lg:col-span-1 aspect-[4/3]' : 'aspect-square'
                  }`}
                >
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${group.color}`} />

                  {/* Decorative circle */}
                  <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/20" />
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/15" />

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-between p-6">
                    <div className="w-10 h-10 rounded-xl bg-white/40 backdrop-blur-sm flex items-center justify-center">
                      <group.icon className="w-5 h-5" style={{ color: group.textColor }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">{group.name}</h3>
                      <p className="text-xs text-[#6B6560] leading-relaxed">{group.desc}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== PHILOSOPHY / ARC SECTION ===== */}
      <section className="relative py-28 md:py-36 overflow-hidden">
        {/* Decorative arc SVG */}
        <svg
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] pointer-events-none opacity-40"
          viewBox="0 0 1200 600"
          fill="none"
        >
          <path
            d="M-100 600C200 200 400 100 600 100C800 100 1000 200 1300 600"
            stroke="#2D6B4F"
            strokeWidth="1"
            strokeDasharray="8 8"
          />
          <circle cx="600" cy="280" r="180" stroke="#C17A5F" strokeWidth="1" fill="none" opacity="0.3" />
          <circle cx="600" cy="280" r="120" stroke="#2D6B4F" strokeWidth="1" fill="none" opacity="0.2" />
        </svg>

        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs tracking-[0.2em] uppercase text-[#A8A199] font-medium">
                {t('home.philosophy.label')}
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#1A1A1A] mt-4 leading-tight"
                dangerouslySetInnerHTML={{ __html: t('home.philosophy.title') }}
              />
              <p className="text-[#6B6560] mt-6 leading-relaxed">
                {t('home.philosophy.p1')}
              </p>
              <p className="text-[#6B6560] mt-4 leading-relaxed">
                {t('home.philosophy.p2')}
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                {(t('home.philosophy.tags', { returnObjects: true }) as string[]).map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 rounded-full bg-white border border-[#E5E0D8] text-xs text-[#6B6560]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[32px] bg-white border border-[#E5E0D8] p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#E8F0EB] flex items-center justify-center shrink-0 mt-1">
                    <Users className="w-5 h-5 text-[#2D6B4F]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#1A1A1A]">{t('home.philosophy.c1Title')}</h4>
                    <p className="text-sm text-[#6B6560] mt-1 leading-relaxed">
                      {t('home.philosophy.c1Desc')}
                    </p>
                  </div>
                </div>
                <div className="h-px bg-[#E5E0D8]" />
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#F0E6D8] flex items-center justify-center shrink-0 mt-1">
                    <Shield className="w-5 h-5 text-[#C17A5F]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#1A1A1A]">{t('home.philosophy.c2Title')}</h4>
                    <p className="text-sm text-[#6B6560] mt-1 leading-relaxed">
                      {t('home.philosophy.c2Desc')}
                    </p>
                  </div>
                </div>
                <div className="h-px bg-[#E5E0D8]" />
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#E0E4EC] flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-5 h-5 text-[#3A5060]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#1A1A1A]">{t('home.philosophy.c3Title')}</h4>
                    <p className="text-sm text-[#6B6560] mt-1 leading-relaxed">
                      {t('home.philosophy.c3Desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-28 md:py-36 bg-[#1A1A1A] text-white relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#2D6B4F]/10 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[#C17A5F]/10 translate-y-1/2 -translate-x-1/4" />

        <div className="max-w-[800px] mx-auto px-6 text-center relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl font-semibold leading-tight">
            {t('home.cta.title')}
          </h2>
          <p className="mt-6 text-white/50 leading-relaxed max-w-md mx-auto">
            {t('home.cta.subtitle')}
          </p>
          <a
            href="#/assessment"
            className="mt-10 inline-flex items-center gap-3 px-10 py-5 bg-white text-[#1A1A1A] rounded-full text-base font-medium hover:bg-[#F5F2EC] transition-colors no-underline shadow-xl shadow-black/20"
          >
            {t('home.cta.button')}
            <ArrowRight size={18} />
          </a>
          <p className="mt-6 text-white/30 text-xs">
            {t('home.cta.note')}
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-12 border-t border-[#E5E0D8]">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#2D6B4F] flex items-center justify-center">
              <Leaf className="w-3 h-3 text-white" />
            </div>
            <span className="font-serif text-sm font-semibold text-[#1A1A1A]">NutriGuide</span>
          </div>
          <p className="text-xs text-[#A8A199]">
            {t('home.footer.disclaimer')}
          </p>
          <div className="flex gap-6">
            <a href="#/" className="text-xs text-[#A8A199] hover:text-[#1A1A1A] transition-colors no-underline">{t('nav.home')}</a>
            <a href="#/assessment" className="text-xs text-[#A8A199] hover:text-[#1A1A1A] transition-colors no-underline">{t('nav.assessment')}</a>
            <a href="#/results" className="text-xs text-[#A8A199] hover:text-[#1A1A1A] transition-colors no-underline">{t('nav.results')}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
