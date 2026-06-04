import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { User, Save, Loader2, Mail, Phone, MessageCircle, MapPin } from 'lucide-react'
import { api } from '../lib/api'

export default function ProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // 资料字段
  const [displayName, setDisplayName] = useState('')
  const [gender, setGender] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [city, setCity] = useState('')

  // 不可修改字段
  const [wechatId, setWechatId] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await api.getProfile()
      const p = data.profile || {}
      setDisplayName(p.display_name || '')
      setGender(p.gender || '')
      setBirthDate(p.birth_date || '')
      setHeight(p.height ? String(p.height) : '')
      setWeight(p.weight ? String(p.weight) : '')
      setCity(p.city || '')
      setWechatId(data.wechatId || '')
      setEmail(data.email || '')
      setPhone(data.phone || '')
    } catch (e: any) {
      setMessage('加载失败: ' + (e.message || '请稍后重试'))
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      await api.updateUserProfile({
        displayName, gender, birthDate,
        height: height ? parseInt(height) : null,
        weight: weight ? parseFloat(weight) : null,
        city,
      })
      setMessage('保存成功')
      setTimeout(() => setMessage(''), 2000)
    } catch (e: any) {
      setMessage('保存失败: ' + (e.message || ''))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#A8A199]" /></div>
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-serif text-2xl font-semibold text-[#1B2A4A] mb-8">个人中心</h1>

      {/* 不可修改信息 */}
      <div className="bg-white rounded-2xl border border-[#E8E3DB] p-6 mb-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1B2A4A] mb-4">
          <User className="w-4 h-4 text-[#7A8B6F]" /> 账号信息
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <MessageCircle size={16} className="text-[#A8A199]" />
            <span className="text-[#A8A199] w-20">微信号</span>
            <span className="text-[#1B2A4A] font-medium">{wechatId || '未设置'}</span>
            <span className="text-xs text-[#C17A5F]">不可修改</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-[#A8A199]" />
            <span className="text-[#A8A199] w-20">邮箱</span>
            <span className="text-[#1B2A4A]">{email || '未设置'}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={16} className="text-[#A8A199]" />
            <span className="text-[#A8A199] w-20">手机号</span>
            <span className="text-[#1B2A4A]">{phone || '未设置'}</span>
          </div>
        </div>
      </div>

      {/* 健康资料 */}
      <div className="bg-white rounded-2xl border border-[#E8E3DB] p-6 mb-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1B2A4A] mb-4">
          <User className="w-4 h-4 text-[#2D9C6F]" /> 健康资料
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-xs text-[#A8A199]">显示名称</label>
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
              placeholder="你的昵称" className="mt-1 w-full px-3 py-2 border border-[#E5E0D8] rounded-lg focus:ring-1 focus:ring-[#2D9C6F] outline-none" />
          </div>
          <div>
            <label className="text-xs text-[#A8A199]">性别</label>
            <select value={gender} onChange={e => setGender(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-[#E5E0D8] rounded-lg focus:ring-1 focus:ring-[#2D9C6F] outline-none bg-white">
              <option value="">不愿透露</option>
              <option value="female">女</option>
              <option value="male">男</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[#A8A199]">出生日期</label>
            <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-[#E5E0D8] rounded-lg focus:ring-1 focus:ring-[#2D9C6F] outline-none" />
          </div>
          <div>
            <label className="text-xs text-[#A8A199]">身高 (cm)</label>
            <input type="number" value={height} onChange={e => setHeight(e.target.value)}
              placeholder="170" min={50} max={250} className="mt-1 w-full px-3 py-2 border border-[#E5E0D8] rounded-lg focus:ring-1 focus:ring-[#2D9C6F] outline-none" />
          </div>
          <div>
            <label className="text-xs text-[#A8A199]">体重 (kg)</label>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
              placeholder="65" min={10} max={300} step="0.1" className="mt-1 w-full px-3 py-2 border border-[#E5E0D8] rounded-lg focus:ring-1 focus:ring-[#2D9C6F] outline-none" />
          </div>
          <div>
            <label className="text-xs text-[#A8A199]">所在城市</label>
            <div className="relative mt-1">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A199]" />
              <input type="text" value={city} onChange={e => setCity(e.target.value)}
                placeholder="上海" className="w-full pl-8 pr-3 py-2 border border-[#E5E0D8] rounded-lg focus:ring-1 focus:ring-[#2D9C6F] outline-none" />
            </div>
          </div>
        </div>

        {message && (
          <div className={`mt-4 text-sm ${message.includes('成功') ? 'text-[#2D9C6F]' : 'text-[#E85D3A]'}`}>{message}</div>
        )}

        <button onClick={handleSave} disabled={saving}
          className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-[#2D9C6F] text-white rounded-full text-sm font-medium hover:bg-[#258A5E] transition-colors disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          保存资料
        </button>
      </div>

      {/* 快捷入口 */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => navigate('/history')} className="p-4 bg-white rounded-2xl border border-[#E8E3DB] text-sm text-[#1B2A4A] hover:bg-[#F8F6F3] transition-colors text-left">
          📋 我的测试记录
        </button>
        <button onClick={() => navigate('/assessment')} className="p-4 bg-white rounded-2xl border border-[#E8E3DB] text-sm text-[#1B2A4A] hover:bg-[#F8F6F3] transition-colors text-left">
          🧪 开始新自测
        </button>
      </div>
    </div>
  )
}
