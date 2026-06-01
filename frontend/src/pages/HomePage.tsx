import { Link } from 'react-router-dom'
import {
  ArrowRight, Leaf, Brain, Heart, Shield, Apple,
  FlaskConical, Sparkles, Sun, Baby, Activity,
  Droplets, Smile, Timer, Users, Pill, Menu, X, Moon
} from 'lucide-react'
import { useState } from 'react'

const navLinks = [
  { label: '首页', href: '#/' },
  { label: '自测', href: '#/assessment' },
  { label: '知识库', href: '#/results' },
  { label: '方案', href: '#/plan' },
]

const features = [
  {
    num: '01',
    title: '智能人群匹配',
    desc: '基于症状自评与体检数据，精准识别 12 类特殊人群的营养需求缺口，不做泛泛推荐。',
    icon: Brain,
  },
  {
    num: '02',
    title: '三维度方案',
    desc: '营养素补充 + 饮食调节 + 生活方式调整，三个维度协同发力，全面覆盖你的健康需求。',
    icon: Apple,
  },
  {
    num: '03',
    title: '科学循证',
    desc: '基于中国 DRIs 2023 及国际权威指南，每一条建议都有据可查，不贩卖焦虑。',
    icon: FlaskConical,
  },
  {
    num: '04',
    title: '安全第一',
    desc: '冲突检测 + 药物间隔提醒 + 就医指征提示，不替代医生，但帮你更聪明地补充。',
    icon: Shield,
  },
]

const populationGroups = [
  { name: '备孕 / 孕期', desc: '叶酸、铁、DHA 精准补充', icon: Baby, color: 'from-[#E8D5C4] to-[#F0E6D8]', textColor: '#7A5C4A', categoryKey: 'pregnancy' },
  { name: '严格素食者', desc: 'B12、铁、锌、Omega-3 方案', icon: Leaf, color: 'from-[#C8D9C4] to-[#E0EBDC]', textColor: '#4A6B40', categoryKey: 'vegetarian' },
  { name: '健身增肌 / 减脂', desc: '蛋白、肌酸、电解质管理', icon: Activity, color: 'from-[#C4D4E0] to-[#DCE6EE]', textColor: '#3A5A70', categoryKey: 'fitness' },
  { name: '更年期女性', desc: '钙、维D、植物雌激素支持', icon: Sun, color: 'from-[#E0D4C8] to-[#EDE5DC]', textColor: '#6B5040', categoryKey: 'menopause' },
  { name: 'PCOS 多囊', desc: '肌醇、维D、低 GI 饮食策略', icon: Droplets, color: 'from-[#D4C8D8] to-[#E8E0EC]', textColor: '#5A4060', categoryKey: 'pcos' },
  { name: 'IBS 肠易激', desc: '低 FODMAP + 益生菌修复', icon: Smile, color: 'from-[#C8D8D4] to-[#DCE8E4]', textColor: '#3A6050', categoryKey: 'ibs' },
  { name: '焦虑 / 抑郁', desc: 'Omega-3、镁、B 族、脑肠轴', icon: Heart, color: 'from-[#D8C8C4] to-[#ECE0DC]', textColor: '#604040', categoryKey: 'mental_health' },
  { name: '糖尿病管理', desc: '铬、镁、α-硫辛酸、低 GI', icon: Shield, color: 'from-[#C4D0D8] to-[#DCE4EA]', textColor: '#3A5060', categoryKey: 'diabetes' },
  { name: '桥本甲状腺炎', desc: '硒、锌、维D、无麸质饮食', icon: Sparkles, color: 'from-[#D8D4C8] to-[#ECE8DC]', textColor: '#605040', categoryKey: 'hashimoto' },
  { name: '月经周期优化', desc: '周期同步营养，缓解PMS', icon: Moon, color: 'from-[#E8D0DA] to-[#F0E0E8]', textColor: '#8B5A6B', categoryKey: 'menstrual' },
  { name: '老年人', desc: '肌少症、骨骼、认知支持', icon: Users, color: 'from-[#D4D0C8] to-[#E8E4DC]', textColor: '#5A5040', categoryKey: 'elderly' },
  { name: '青少年', desc: '生长发育 + 学业脑力支持', icon: Brain, color: 'from-[#C8DCE0] to-[#DCEAEE]', textColor: '#3A5A6B', categoryKey: 'adolescent' },
]

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="overflow-hidden">
      {/* ===== NAVIGATION ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F5F2EC]/80 backdrop-blur-md border-b border-[#E5E0D8]/60">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 rounded-full bg-[#2D6B4F] flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif text-lg font-semibold text-[#1A1A1A]">NutriGuide</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-[#6B6560] hover:text-[#1A1A1A] transition-colors no-underline tracking-wide"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#/assessment"
              className="px-5 py-2 bg-[#1A1A1A] text-white text-sm rounded-full hover:bg-[#333] transition-colors no-underline"
            >
              开始自测
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#F5F2EC] border-b border-[#E5E0D8] px-6 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block text-sm text-[#6B6560] no-underline"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen pt-24 flex items-center">
        <div className="max-w-[1200px] mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Text */}
            <div className="lg:col-span-7 space-y-8">
              {/* Tag pills */}
              <div className="flex flex-wrap gap-2 animate-fade-in-up">
                <span className="px-4 py-1.5 rounded-full border border-[#E5E0D8] text-xs text-[#6B6560] tracking-wide">
                  个性化营养
                </span>
                <span className="px-4 py-1.5 rounded-full border border-[#E5E0D8] text-xs text-[#6B6560] tracking-wide">
                  科学循证
                </span>
                <span className="px-4 py-1.5 rounded-full border border-[#E5E0D8] text-xs text-[#6B6560] tracking-wide">
                  28 天方案
                </span>
              </div>

              {/* Main headline */}
              <h1 className="font-serif text-5xl md:text-6xl lg:text-[72px] font-semibold text-[#1A1A1A] leading-[1.1] tracking-tight animate-fade-in-up delay-100">
                你的身体
                <br />
                <span className="text-[#2D6B4F]">值得一套</span>
                <br />
                专属方案
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-[#6B6560] leading-relaxed max-w-lg animate-fade-in-up delay-200">
                不再盲目跟风吃补剂。通过 6 步智能自测，
                精准匹配你所属的特殊人群，生成营养素补充、饮食调节、
                生活方式调整的三维度 28 天个性化方案。
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-start gap-4 pt-2 animate-fade-in-up delay-300">
                <a
                  href="#/assessment"
                  className="group px-8 py-4 bg-[#1A1A1A] text-white rounded-full text-base font-medium hover:bg-[#333] transition-all flex items-center gap-3 no-underline shadow-lg shadow-[#1A1A1A]/10"
                >
                  开始免费自测
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#/assessment"
                  className="px-8 py-4 border border-[#E5E0D8] text-[#1A1A1A] rounded-full text-base font-medium hover:border-[#1A1A1A] transition-all no-underline"
                >
                  查看示例报告
                </a>
              </div>

              {/* Stats */}
              <div className="flex gap-10 pt-6 animate-fade-in-up delay-400">
                <div>
                  <div className="font-serif text-3xl font-semibold text-[#1A1A1A]">12</div>
                  <div className="text-xs text-[#A8A199] mt-1">类特殊人群</div>
                </div>
                <div>
                  <div className="font-serif text-3xl font-semibold text-[#1A1A1A]">26+</div>
                  <div className="text-xs text-[#A8A199] mt-1">种营养素</div>
                </div>
                <div>
                  <div className="font-serif text-3xl font-semibold text-[#1A1A1A]">6</div>
                  <div className="text-xs text-[#A8A199] mt-1">步自测流程</div>
                </div>
              </div>
            </div>

            {/* Right: Decorative visual */}
            <div className="lg:col-span-5 relative animate-slide-right delay-200">
              {/* Main card */}
              <div className="relative rounded-[32px] bg-gradient-to-br from-[#E8F0EB] to-[#F0EBE3] p-8 aspect-[4/5] flex flex-col justify-between overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-[-40px] right-[-40px] w-40 h-40 rounded-full border-2 border-[#2D6B4F]/10 animate-rotate-slow" />
                <div className="absolute bottom-[-60px] left-[-60px] w-48 h-48 rounded-full bg-[#2D6B4F]/5" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-[#C17A5F]/10 animate-float" />

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-[#2D6B4F] flex items-center justify-center mb-6">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-serif text-2xl text-[#1A1A1A] leading-snug">
                    每个人的营养需求
                    <br />
                    都独一无二
                  </p>
                </div>

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-2xl p-4">
                    <div className="w-10 h-10 rounded-xl bg-[#E8F0EB] flex items-center justify-center shrink-0">
                      <Pill className="w-5 h-5 text-[#2D6B4F]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#1A1A1A]">营养素补充</div>
                      <div className="text-xs text-[#A8A199]">精准剂量与时机</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-2xl p-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F0E6D8] flex items-center justify-center shrink-0">
                      <Apple className="w-5 h-5 text-[#C17A5F]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#1A1A1A]">饮食调节</div>
                      <div className="text-xs text-[#A8A199]">个性化膳食方案</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-2xl p-4">
                    <div className="w-10 h-10 rounded-xl bg-[#E0E4EC] flex items-center justify-center shrink-0">
                      <Timer className="w-5 h-5 text-[#3A5060]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#1A1A1A]">生活方式</div>
                      <div className="text-xs text-[#A8A199]">睡眠、运动、压力</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHY US ===== */}
      <section className="py-28 md:py-36">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Section header */}
          <div className="text-center mb-20">
            <span className="text-xs tracking-[0.2em] uppercase text-[#A8A199] font-medium">
              我们的优势
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#1A1A1A] mt-4 leading-tight">
              不只是补剂推荐
            </h2>
            <p className="text-[#6B6560] mt-4 max-w-md mx-auto leading-relaxed">
              从测试到方案，每个环节都为你的健康量身定制
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
                覆盖人群
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#1A1A1A] mt-4 leading-tight">
                12 类特殊人群
              </h2>
              <p className="text-[#6B6560] mt-4 max-w-md leading-relaxed">
                每个人的身体状态不同，需要不同的营养策略。选择最贴近你的人群，获得精准建议。
              </p>
            </div>
            <a
              href="#/assessment"
              className="mt-6 md:mt-0 inline-flex items-center gap-2 text-sm text-[#2D6B4F] font-medium hover:underline no-underline"
            >
              开始自测匹配 <ArrowRight size={14} />
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
                我们的理念
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#1A1A1A] mt-4 leading-tight">
                科学循证
                <br />
                <span className="text-[#2D6B4F]">个性化营养</span>
              </h2>
              <p className="text-[#6B6560] mt-6 leading-relaxed">
                营养补充不是越多越好。基于中国居民膳食营养素参考摄入量（DRIs 2023）
                及国际权威指南，我们为每一类特殊人群制定精准的营养策略。
              </p>
              <p className="text-[#6B6560] mt-4 leading-relaxed">
                同时检测营养素之间的冲突（如桥本需限碘而孕期需碘），
                提醒与药物的服用间隔，并在必要时建议你咨询医生。
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                {['DRIs 2023', 'WHO 指南', 'AHRQ 循证', '个性化算法'].map((tag) => (
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
                    <h4 className="font-semibold text-[#1A1A1A]">多人群合并</h4>
                    <p className="text-sm text-[#6B6560] mt-1 leading-relaxed">
                      一个人可能同时属于多个特殊人群（如孕期 + 素食），
                      我们的算法会自动合并方案、检测冲突。
                    </p>
                  </div>
                </div>
                <div className="h-px bg-[#E5E0D8]" />
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#F0E6D8] flex items-center justify-center shrink-0 mt-1">
                    <Shield className="w-5 h-5 text-[#C17A5F]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#1A1A1A]">安全优先</h4>
                    <p className="text-sm text-[#6B6560] mt-1 leading-relaxed">
                      所有方案均标注药物相互作用和就医指征，
                      在确保安全的前提下提供最优营养建议。
                    </p>
                  </div>
                </div>
                <div className="h-px bg-[#E5E0D8]" />
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#E0E4EC] flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-5 h-5 text-[#3A5060]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#1A1A1A]">AI 增强方案</h4>
                    <p className="text-sm text-[#6B6560] mt-1 leading-relaxed">
                      接入大模型生成 28 天个性化指导，
                      从每日补充提醒到膳食搭配建议，全方位陪伴。
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
            准备好了解
            <br />
            你的身体真正需要什么了吗？
          </h2>
          <p className="mt-6 text-white/50 leading-relaxed max-w-md mx-auto">
            完成 6 步自测，大约需要 5–8 分钟。
            你的所有数据仅保存在本地浏览器中。
          </p>
          <a
            href="#/assessment"
            className="mt-10 inline-flex items-center gap-3 px-10 py-5 bg-white text-[#1A1A1A] rounded-full text-base font-medium hover:bg-[#F5F2EC] transition-colors no-underline shadow-xl shadow-black/20"
          >
            立即开始自测
            <ArrowRight size={18} />
          </a>
          <p className="mt-6 text-white/30 text-xs">
            完全免费 · 无需注册 · 本地存储
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
            本工具仅供参考，不替代专业医疗建议。如有健康问题请咨询医生。
          </p>
          <div className="flex gap-6">
            <a href="#/" className="text-xs text-[#A8A199] hover:text-[#1A1A1A] transition-colors no-underline">首页</a>
            <a href="#/assessment" className="text-xs text-[#A8A199] hover:text-[#1A1A1A] transition-colors no-underline">自测</a>
            <a href="#/results" className="text-xs text-[#A8A199] hover:text-[#1A1A1A] transition-colors no-underline">结果</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
