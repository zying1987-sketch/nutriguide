import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, AlertCircle, Zap, ArrowLeft, Plus, PlusCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/useAuthStore'
import CreditPurchaseModal from '../components/ui/CreditPurchaseModal'

interface Message {
  role: 'user' | 'assistant'
  content: string
  model?: string
}

const HINTS = [
  '最近总是疲劳乏力，可能缺什么营养素？',
  '运动后恢复很慢，饮食上怎么调整？',
  '睡眠质量不好，有什么营养建议？',
  '经期不适怎么通过饮食调理？',
  '经常口腔溃疡，是缺维生素吗？',
]

export default function ChatPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const cached = sessionStorage.getItem('nutriguide_chat')
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [balance, setBalance] = useState(user?.credits ?? 0)
  const [showPurchase, setShowPurchase] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 保存消息到 sessionStorage
  useEffect(() => {
    sessionStorage.setItem('nutriguide_chat', JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (balance > 0) {
      inputRef.current?.focus()
    }
  }, [balance])

  const handleSend = async () => {
    const q = input.trim()
    if (!q || q.length < 10 || loading) return

    setError(null)
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: q }])
    setLoading(true)

    try {
      const result = await api.askAI(q)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: result.answer, model: result.model },
      ])
      setBalance(result.balance)
      if (user) {
        useAuthStore.getState().setUser(
          { ...user, credits: result.balance },
          localStorage.getItem('nutriguide_token') || ''
        )
      }
    } catch (e: any) {
      const msg = e.message || '请求失败'
      if (msg.includes('402') || msg.includes('积分不足')) {
        setError('积分不足，请先购买积分')
        setMessages((prev) => prev.slice(0, -1))
        setInput(q)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    sessionStorage.removeItem('nutriguide_chat')
    setError(null)
    inputRef.current?.focus()
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mx-auto mb-6">
            <Zap className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-serif font-semibold text-[#1B2A4A] mb-3">AI 即时咨询</h2>
          <p className="text-[#6B6560] mb-8 leading-relaxed">
            登录后即可使用 AI 营养顾问，直接描述你的身体状况，获得专业级营养分析和建议。新用户注册即送 3 积分。
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/login"
              className="px-8 py-3 bg-[#1B2A4A] text-white rounded-full text-sm font-medium hover:bg-[#2A3A5A] transition-colors no-underline"
            >
              登录
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 border border-[#E5E0D8] text-[#1B2A4A] rounded-full text-sm font-medium hover:bg-[#F8F6F3] transition-colors no-underline"
            >
              注册新账号（送 3 积分）
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-6">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-[#6B6560] hover:text-[#1B2A4A] transition-colors"
        >
          <ArrowLeft size={16} />
          返回首页
        </button>

        <div className="flex items-center gap-3">
          {/* 积分 */}
          <div className="flex items-center gap-1.5">
            <Zap size={14} className={balance < 3 ? 'text-red-400' : 'text-amber-500'} />
            <span className={`text-sm font-semibold ${balance < 3 ? 'text-red-500' : 'text-[#1B2A4A]'}`}>
              {balance} 积分
            </span>
            <button
              onClick={() => setShowPurchase(true)}
              className="text-amber-500 hover:text-amber-600 hover:bg-amber-50 p-0.5 rounded-full transition-colors"
              title="购买积分"
            >
              <PlusCircle size={14} />
            </button>
          </div>

          {/* 新对话 */}
          {messages.length > 0 && (
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1 text-xs text-[#6B6560] hover:text-[#1B2A4A] transition-colors"
            >
              <Plus size={14} />
              新对话
            </button>
          )}
        </div>
      </div>

      {/* 积分购买提示 */}
      {balance < 1 && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500" />
            <span className="text-sm text-red-700">积分已用完，无法继续咨询</span>
          </div>
          <button
            onClick={() => setShowPurchase(true)}
            className="px-4 py-1.5 bg-red-600 text-white text-sm rounded-full font-medium hover:bg-red-700 transition-colors"
          >
            购买积分
          </button>
        </div>
      )}

      {/* 聊天区域 */}
      <div className="bg-white rounded-2xl border border-[#E8E3DB] shadow-sm overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 200px)', minHeight: '420px' }}>
        {/* 消息区 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mb-4">
                <Sparkles size={28} className="text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">NutriGuide AI 营养顾问</h3>
              <p className="text-sm text-[#6B6560] mb-6 max-w-sm">
                由通义千问驱动，结合营养学知识库。直接描述你的身体状况、饮食习惯或健康目标。
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {HINTS.map((hint) => (
                  <button
                    key={hint}
                    onClick={() => setInput(hint)}
                    className="text-sm px-4 py-2 bg-[#F8F6F3] hover:bg-[#F0EDE8] rounded-full text-[#1B2A4A] transition-colors text-left"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#1B2A4A] text-white rounded-br-md'
                    : 'bg-[#F8F6F3] text-[#1B2A4A] rounded-bl-md'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.model && (
                  <p className="text-[11px] text-[#A8A199] mt-2">
                    AI 营养顾问 · 已消耗 1 积分
                  </p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#F8F6F3] rounded-2xl rounded-bl-md px-5 py-3.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-[#A8A199] rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-[#A8A199] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2 h-2 bg-[#A8A199] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-2 rounded-full">
                <AlertCircle size={14} />
                {error}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 输入区 */}
        <div className="border-t border-[#E8E3DB] p-4 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={loading ? 'AI 正在思考...' : balance < 1 ? '积分不足，请先购买 →' : '输入你的身体状况、饮食问题或健康目标...'}
              disabled={loading || balance < 1}
              className="flex-1 px-5 py-3 bg-[#F8F6F3] rounded-full text-sm outline-none focus:ring-2 focus:ring-[#7A8B6F]/30 transition-shadow disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={loading || input.trim().length < 10 || balance < 1}
              className="w-11 h-11 flex items-center justify-center bg-[#1B2A4A] text-white rounded-full hover:bg-[#2A3A5A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
          {balance >= 1 && (
            <p className="text-[11px] text-[#A8A199] text-center mt-2">
              每次对话消耗 1 积分（剩余 {balance} 积分）
            </p>
          )}
        </div>
      </div>

      {/* 积分购买弹窗 */}
      {showPurchase && <CreditPurchaseModal onClose={() => setShowPurchase(false)} />}
    </div>
  )
}
