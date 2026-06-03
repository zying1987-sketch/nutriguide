import { X, Zap, Check } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../lib/api'
import { useAuthStore } from '../../stores/useAuthStore'

interface Props {
  onClose: () => void
}

const packages = [
  { key: 'small', credits: 10, price: 9.9, popular: false },
  { key: 'medium', credits: 30, price: 19.9, popular: true },
  { key: 'large', credits: 100, price: 49.9, popular: false },
]

export default function CreditPurchaseModal({ onClose }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { user, setUser } = useAuthStore()

  const handlePurchase = async (pkg: typeof packages[0]) => {
    setLoading(pkg.key)
    try {
      const result = await api.purchaseCredits(pkg.key)
      setSuccess(`${result.message}`)
      // 更新本地用户积分
      if (user) {
        setUser({ ...user, credits: result.balance }, localStorage.getItem('nutriguide_token') || '')
      }
    } catch (e: any) {
      alert(e.message || '购买失败')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
            <Zap className="w-7 h-7 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">购买积分</h2>
          <p className="text-sm text-gray-500 mt-2">1 次 AI 咨询消耗 1 积分</p>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-gray-900 font-medium">{success}</p>
            <button
              onClick={onClose}
              className="mt-6 px-8 py-2 bg-gray-900 text-white rounded-full text-sm hover:bg-gray-800"
            >
              完成
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {packages.map((pkg) => (
              <button
                key={pkg.key}
                onClick={() => handlePurchase(pkg)}
                disabled={loading !== null}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  pkg.popular
                    ? 'border-amber-400 bg-amber-50/30'
                    : 'border-gray-100 hover:border-gray-300 bg-gray-50/50'
                }`}
              >
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{pkg.credits} 积分</span>
                    {pkg.popular && (
                      <span className="text-[10px] bg-amber-400 text-white px-2 py-0.5 rounded-full font-medium">
                        热门
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    ¥{pkg.price} · 约 ¥{(pkg.price / pkg.credits).toFixed(2)}/次
                  </span>
                </div>
                <span className="text-gray-400 text-sm">
                  {loading === pkg.key ? '处理中...' : '购买 →'}
                </span>
              </button>
            ))}
            <p className="text-[11px] text-gray-400 text-center pt-2">
              当前为模拟支付，确认后直接到账
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
