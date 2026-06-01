import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(email.trim(), password)
      navigate('/')
    } catch (err: any) {
      setError(err.message || '登录失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#7A8B6F]/10 mb-4">
            <LogIn className="w-6 h-6 text-[#7A8B6F]" />
          </div>
          <h1 className="text-3xl serif font-semibold text-[#1A1A1A] mb-2">欢迎回来</h1>
          <p className="text-[#6B6560] text-sm">登录以查看你的营养方案</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[24px] p-8 shadow-sm border border-[#E5E0D8]">
          {error && (
            <div className="flex items-center gap-2 bg-[#FDF0ED] text-[#C0392B] text-sm px-4 py-3 rounded-xl mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#6B6560] mb-1.5">邮箱</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C4BFB8]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#F8F6F3] border border-[#E5E0D8] rounded-xl text-sm focus:outline-none focus:border-[#7A8B6F] focus:ring-2 focus:ring-[#7A8B6F]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B6560] mb-1.5">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C4BFB8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少6位"
                  required
                  className="w-full pl-10 pr-12 py-3 bg-[#F8F6F3] border border-[#E5E0D8] rounded-xl text-sm focus:outline-none focus:border-[#7A8B6F] focus:ring-2 focus:ring-[#7A8B6F]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-[#C4BFB8]" />
                  ) : (
                    <Eye className="w-4 h-4 text-[#C4BFB8]" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#1A1A1A] text-white rounded-xl font-medium text-sm hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
            >
              {submitting ? '登录中...' : '登录'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#6B6560] mt-6">
          还没有账号？{' '}
          <Link to="/register" className="text-[#7A8B6F] font-medium hover:underline">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  )
}
