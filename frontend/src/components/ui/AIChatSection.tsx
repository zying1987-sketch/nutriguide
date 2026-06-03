import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, AlertCircle, Zap } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuthStore } from '../../stores/useAuthStore'

interface Message {
  role: 'user' | 'assistant'
  content: string
  model?: string
}

interface Props {
  onPurchaseClick: () => void
}

export default function AIChatSection({ onPurchaseClick }: Props) {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [balance, setBalance] = useState(user?.credits ?? 0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
      // 更新 store 中的积分
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
        setMessages((prev) => prev.slice(0, -1)) // 移除用户消息
        setInput(q) // 恢复输入
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="text-center py-16 px-6">
        <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">AI 即时咨询</h3>
        <p className="text-sm text-gray-500 mb-6">登录后即可使用 AI 营养顾问，直接描述你的身体状况</p>
        <a
          href="#/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 no-underline"
        >
          登录后使用 <Sparkles size={16} />
        </a>
      </div>
    )
  }

  return (
    <section className="max-w-[720px] mx-auto">
      {/* 积分状态栏 */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">积分余额</span>
          <span className={`text-sm font-semibold ${balance < 3 ? 'text-red-500' : 'text-gray-900'}`}>
            {balance}
          </span>
        </div>
        <button
          onClick={onPurchaseClick}
          className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
        >
          <Zap size={12} />
          购买积分
        </button>
      </div>

      {/* 聊天区域 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* 消息区 */}
        <div className="h-[320px] overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 px-4">
              <Sparkles size={28} className="mx-auto mb-3 text-purple-400" />
              <p className="text-sm text-gray-400">
                描述你的身体状况，AI 营养顾问为你分析
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {['最近总是疲劳乏力', '运动后恢复慢', '睡眠质量不好', '经期不适怎么调理'].map(
                  (hint) => (
                    <button
                      key={hint}
                      onClick={() => setInput(hint)}
                      className="text-xs px-3 py-1.5 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      {hint}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-gray-900 text-white rounded-br-md'
                    : 'bg-purple-50 text-gray-800 rounded-bl-md'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.model && (
                  <p className="text-[10px] text-purple-400 mt-1">
                    通义千问 · 已消耗 1 积分
                  </p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-purple-50 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-xs px-4 py-2 rounded-full">
                <AlertCircle size={12} />
                {error}
                {error.includes('积分不足') && (
                  <button
                    onClick={onPurchaseClick}
                    className="underline font-medium ml-1"
                  >
                    去购买
                  </button>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 输入区 */}
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={balance < 1 ? '积分不足，请先购买 →' : '描述你的身体状况...'}
              disabled={loading || balance < 1}
              className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={loading || input.trim().length < 10 || balance < 1}
              className="p-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            {balance >= 1
              ? `发送将消耗 1 积分（剩余 ${balance}）`
              : '积分不足，请先购买'}
          </p>
        </div>
      </div>
    </section>
  )
}
