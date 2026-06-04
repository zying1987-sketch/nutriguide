import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Phone, Mail, Lock, User, ShieldCheck, ArrowRight, ArrowLeft, Loader2, Ticket } from 'lucide-react'
import { api, setToken } from '../lib/api'
import { useAuthStore } from '../stores/useAuthStore'

export default function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setUser } = useAuthStore()

  const [step, setStep] = useState<'email' | 'verify'>('email')
  const [email, setEmail] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [inviteValid, setInviteValid] = useState<boolean | null>(null)
  const [inviteChecking, setInviteChecking] = useState(false)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [wechatId, setWechatId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [devCode, setDevCode] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [showAgreement, setShowAgreement] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // 发送验证码（先校验邀请码）
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !email.includes('@')) {
      setError(t('register.invalidEmail'))
      return
    }
    if (!inviteCode || inviteCode.length !== 8) {
      // 留空表示当前无邀请码，交由后端判断（首个用户免码）
      if (!inviteCode || inviteCode.length === 0) {
        // 空邀请码：允许继续，后端会检查是否是首个用户
      } else {
        setError('请输入 8 位邀请码，如果没有请联系管理员')
        return
      }
    }

    // 先校验邀请码（如果填写了）
    if (inviteCode && inviteCode.length === 8) {
      setInviteChecking(true)
      try {
        const result = await api.validateInviteCode(inviteCode)
        if (!result.valid) {
          setInviteValid(false)
          setError(result.error || '邀请码无效')
          setInviteChecking(false)
          return
        }
        setInviteValid(true)
      } catch (err: any) {
        setInviteValid(false)
        setError(err.message || '邀请码校验失败')
        setInviteChecking(false)
        return
      }
      setInviteChecking(false)
    }

    setLoading(true)
    try {
      const result = await api.sendVerifyCode(email)
      setCodeSent(true)
      if (result._dev_code) {
        setDevCode(result._dev_code)
      }
      setStep('verify')
      // 60秒倒计时
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) { clearInterval(timer); return 0 }
          return c - 1
        })
      }, 1000)
    } catch (err: any) {
      setError(err.message || t('register.sendCodeFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 完成注册
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!code || code.length !== 6) {
      setError(t('register.invalidCode'))
      return
    }
    if (!password || password.length < 6) {
      setError(t('register.passwordTooShort'))
      return
    }
    if (!agreed) {
      setError('请阅读并同意用户协议和免责声明')
      return
    }

    setLoading(true)
    try {
      const data = await api.register({ email, password, name: name || undefined, phone: phone || undefined, wechatId, code, inviteCode, agreed })
      setToken(data.token)
      setUser(data.user, data.token)
      navigate('/assessment')
    } catch (err: any) {
      setError(err.message || t('register.registerFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 重新发送验证码
  const handleResend = async () => {
    if (countdown > 0) return
    setError('')
    setLoading(true)
    try {
      await api.sendVerifyCode(email)
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) { clearInterval(timer); return 0 }
          return c - 1
        })
      }, 1000)
    } catch (err: any) {
      setError(err.message || t('register.sendCodeFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1B2A4A]">NutriGuide</h1>
          <p className="text-[#1B2A4A]/60 mt-2">{t('register.subtitle')}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#1B2A4A]/10 p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'email' ? 'bg-[#E85D3A] text-white' : 'bg-[#2D9C6F] text-white'}`}>
              {step === 'email' ? '1' : '✓'}
            </div>
            <div className="flex-1 h-0.5 bg-[#1B2A4A]/10">
              <div className={`h-full bg-[#2D9C6F] transition-all ${step === 'verify' ? 'w-full' : 'w-0'}`} />
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'verify' ? 'bg-[#E85D3A] text-white' : 'bg-[#1B2A4A]/10 text-[#1B2A4A]/40'}`}>2</div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          {/* Step 1: Enter email */}
          {step === 'email' && (
            <form onSubmit={handleSendCode}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#1B2A4A] mb-2">邀请码 <span className="text-[#A8A199] text-xs">(内测用户必填)</span></label>
                <div className="relative">
                  <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1B2A4A]/30 w-5 h-5" />
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => { setInviteCode(e.target.value.toUpperCase()); setInviteValid(null) }}
                    placeholder="8 位邀请码（联系管理员获取）"
                    maxLength={8}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 outline-none transition bg-[#FAF8F5] font-mono tracking-[0.3em] text-center uppercase ${
                      inviteValid === true ? 'border-[#2D9C6F] focus:ring-[#2D9C6F]/30' :
                      inviteValid === false ? 'border-[#E85D3A] focus:ring-[#E85D3A]/30' :
                      'border-[#1B2A4A]/15 focus:ring-[#2D9C6F]/30 focus:border-[#2D9C6F]'
                    }`}
                  />
                </div>
                {inviteValid === true && (
                  <p className="text-xs text-[#2D9C6F] mt-1 flex items-center gap-1">邀请码有效</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#1B2A4A] mb-2">微信号 <span className="text-[#E85D3A]">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1B2A4A]/30 w-5 h-5" />
                  <input
                    type="text"
                    value={wechatId}
                    onChange={(e) => setWechatId(e.target.value)}
                    placeholder="用于社群联系，请确保准确"
                    minLength={3}
                    className="w-full pl-10 pr-4 py-3 border border-[#1B2A4A]/15 rounded-xl focus:ring-2 focus:ring-[#2D9C6F]/30 focus:border-[#2D9C6F] outline-none transition bg-[#FAF8F5]"
                    required
                  />
                </div>
                <p className="text-xs text-[#A8A199] mt-1">注册后不可修改，用于后续社群拉群</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#1B2A4A] mb-2">{t('register.email')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1B2A4A]/30 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-[#1B2A4A]/15 rounded-xl focus:ring-2 focus:ring-[#2D9C6F]/30 focus:border-[#2D9C6F] outline-none transition bg-[#FAF8F5]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || inviteChecking}
                className="w-full py-3 bg-[#2D9C6F] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#2D9C6F]/90 transition disabled:opacity-50"
              >
                {loading || inviteChecking ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {inviteChecking ? '校验邀请码中...' : t('register.getCode')}
                {!loading && !inviteChecking && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {/* Step 2: Verify code + register */}
          {step === 'verify' && (
            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#1B2A4A] mb-2">{t('register.verifyCode')}</label>
                <p className="text-xs text-[#1B2A4A]/50 mb-3">{t('register.codeSentTo')} {email}</p>
                {devCode && (
                  <div className="mb-3 p-2 bg-[#F0F7F2] border border-[#2D9C6F]/30 rounded-lg text-center">
                    <span className="text-xs text-[#6B6560]">未配置邮件服务，你的验证码是：</span>
                    <span className="text-lg font-mono font-bold text-[#2D9C6F] ml-2 tracking-wider">{devCode}</span>
                  </div>
                )}
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1B2A4A]/30 w-5 h-5" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-[#1B2A4A]/15 rounded-xl focus:ring-2 focus:ring-[#2D9C6F]/30 focus:border-[#2D9C6F] outline-none transition bg-[#FAF8F5] text-center text-2xl tracking-[0.5em] font-mono"
                    required
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || loading}
                  className="text-sm text-[#2D9C6F] hover:underline mt-2 disabled:text-[#1B2A4A]/30"
                >
                  {countdown > 0 ? `${countdown}s ${t('register.retryLater')}` : t('register.resendCode')}
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#1B2A4A] mb-2">{t('register.name')} <span className="text-[#1B2A4A]/40">({t('register.optional')})</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1B2A4A]/30 w-5 h-5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('register.namePlaceholder')}
                    className="w-full pl-10 pr-4 py-3 border border-[#1B2A4A]/15 rounded-xl focus:ring-2 focus:ring-[#2D9C6F]/30 focus:border-[#2D9C6F] outline-none transition bg-[#FAF8F5]"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#1B2A4A] mb-2">手机号 <span className="text-[#1B2A4A]/40">({t('register.optional')})</span></label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1B2A4A]/30 w-5 h-5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="用于接收重要通知（选填）"
                    maxLength={11}
                    className="w-full pl-10 pr-4 py-3 border border-[#1B2A4A]/15 rounded-xl focus:ring-2 focus:ring-[#2D9C6F]/30 focus:border-[#2D9C6F] outline-none transition bg-[#FAF8F5]"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#1B2A4A] mb-2">{t('register.password')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1B2A4A]/30 w-5 h-5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('register.passwordPlaceholder')}
                    className="w-full pl-10 pr-4 py-3 border border-[#1B2A4A]/15 rounded-xl focus:ring-2 focus:ring-[#2D9C6F]/30 focus:border-[#2D9C6F] outline-none transition bg-[#FAF8F5]"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* 用户协议 */}
              <div className="mb-6">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#2D9C6F] cursor-pointer shrink-0"
                  />
                  <span className="text-xs text-[#6B6560] leading-relaxed">
                    我已阅读并同意{' '}
                    <button
                      type="button"
                      onClick={() => setShowAgreement(!showAgreement)}
                      className="text-[#2D9C6F] underline hover:text-[#1B7A4A] transition-colors"
                    >
                      《用户协议与免责声明》
                    </button>
                  </span>
                </label>

                {showAgreement && (
                  <div className="mt-3 p-4 bg-[#FAF8F5] border border-[#E8E3DB] rounded-lg text-xs text-[#4A453E] leading-relaxed max-h-48 overflow-y-auto space-y-3">
                    <p className="font-semibold text-[#1B2A4A]">NutriGuide 用户协议与免责声明</p>

                    <p><strong>一、服务性质</strong><br/>
                    NutriGuide（以下简称"本工具"）是基于营养科学知识库和人工智能技术开发的饮食营养参考工具，<strong>不提供医疗诊断、治疗或处方服务</strong>。</p>

                    <p><strong>二、免责声明</strong><br/>
                    1. 本工具生成的所有营养建议、补充剂推荐、饮食方案仅供<strong>参考和教育目的</strong>，不构成医疗建议。<br/>
                    2. 用户应在使用任何补充剂或改变饮食习惯前<strong>咨询执业医师或注册营养师</strong>，尤其是患有疾病、正在服药、怀孕或哺乳期的用户。<br/>
                    3. 本工具的信息来源包括公开的学术文献和营养学数据库，但不保证信息的完整性、准确性和时效性。用户因依赖本工具信息而产生的任何健康问题或损失，NutriGuide 及开发者<strong>不承担法律责任</strong>。</p>

                    <p><strong>三、用户责任</strong><br/>
                    1. 用户提供的健康信息应当真实准确。隐瞒或虚报健康状况可能影响建议的有效性和安全性。<br/>
                    2. 如出现以下情况，请<strong>立即停止使用</strong>并就医：<br/>
                    &nbsp;&nbsp;• 服用补充剂后出现皮疹、呼吸困难、心悸等过敏反应<br/>
                    &nbsp;&nbsp;• 饮食调整后出现持续不适或症状加重<br/>
                    &nbsp;&nbsp;• 体重在短期内出现异常剧烈波动</p>

                    <p><strong>四、数据与隐私</strong><br/>
                    1. 您的自测数据仅用于生成个性化营养方案，不会与第三方共享。<br/>
                    2. 我们使用行业标准的安全措施保护您的个人信息，但无法保证绝对安全。</p>

                    <p><strong>五、AI 输出说明</strong><br/>
                    本工具可能使用大语言模型生成部分内容。AI 输出可能存在不准确或遗漏的情况，用户应以专业人士意见为最终依据。</p>

                    <p className="text-[#A8A199]">最后更新：2026 年 6 月</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setStep('email'); setError('') }}
                  className="px-4 py-3 border border-[#1B2A4A]/15 text-[#1B2A4A] rounded-xl font-medium flex items-center gap-2 hover:bg-[#1B2A4A]/5 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-[#E85D3A] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#E85D3A]/90 transition disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {t('register.createAccount')}
                </button>
              </div>
            </form>
          )}

          {/* Login link */}
          <p className="text-center text-sm text-[#1B2A4A]/50 mt-6">
            {t('register.hasAccount')}{' '}
            <Link to="/login" className="text-[#2D9C6F] hover:underline font-medium">{t('register.goLogin')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
