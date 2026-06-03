import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail, Lock, User, ShieldCheck, ArrowRight, ArrowLeft, Loader2, Ticket } from 'lucide-react'
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
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
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
      await api.sendVerifyCode(email)
      setCodeSent(true)
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

    setLoading(true)
    try {
      const data = await api.register({ email, password, name: name || undefined, code, inviteCode })
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
