import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../stores/useAuthStore'
import { User, LogOut, Shield, Zap, PlusCircle, FileText, ChevronDown } from 'lucide-react'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import CreditPurchaseModal from '../ui/CreditPurchaseModal'

export default function Header() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { t } = useTranslation()

  const [menuOpen, setMenuOpen] = useState(false)
  const [showPurchase, setShowPurchase] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const headerBg = isHome
    ? 'bg-white/60 backdrop-blur-md'
    : 'bg-white/80 backdrop-blur-sm border-b border-[#E8E3DB]'

  return (
    <header className={`sticky top-0 z-50 ${headerBg}`}>
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="w-7 h-7 bg-gradient-to-br from-[#7A8B6F] to-[#5A6B4F] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">N</span>
          </div>
          <span className="text-base font-semibold tracking-tight text-[#1B2A4A]">NutriGuide</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          {/* Language */}
          <LanguageSwitcher />

          {user ? (
            /* ===== 已登录：用户导览 ===== */
            <div className="relative flex items-center gap-1.5" ref={menuRef}>
              {/* 积分 */}
              <button
                onClick={() => setShowPurchase(true)}
                className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-full transition-colors"
                title="购买积分"
              >
                <Zap size={11} />
                <span>{user.credits ?? 0}</span>
                <PlusCircle size={10} className="opacity-50" />
              </button>

              {/* 用户按钮 */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1.5 pl-2 pr-2 py-1.5 rounded-full border border-[#E5E0D8] hover:bg-[#F8F6F3] transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#2D9C6F]/15 flex items-center justify-center text-xs font-medium text-[#2D9C6F]">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
                <span className="text-[#1A1A1A] text-xs font-medium hidden sm:inline">{user.name || user.email.split('@')[0]}</span>
                <ChevronDown size={12} className="text-[#A8A199]" />
              </button>

              {/* 下拉菜单 */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-2xl shadow-lg border border-[#E5E0D8] py-1 overflow-hidden z-50">
                  <div className="px-4 py-2.5 border-b border-[#F0EDE8]">
                    <p className="text-sm font-medium text-[#1A1A1A]">{user.name || user.email.split('@')[0]}</p>
                    <p className="text-xs text-[#A8A199]">{user.email}</p>
                  </div>

                  <Link to="/assessment" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#1A1A1A] hover:bg-[#F8F6F3] no-underline">
                    <span className="text-base">🧪</span> 开始自测
                  </Link>
                  <Link to="/chat" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#1A1A1A] hover:bg-[#F8F6F3] no-underline">
                    <span className="text-base">💬</span> AI 咨询
                  </Link>
                  <Link to="/history" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#1A1A1A] hover:bg-[#F8F6F3] no-underline">
                    <FileText size={16} className="text-[#7A8B6F]" /> 我的记录
                  </Link>
                  <Link to="/nutrients" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#A8A199] hover:bg-[#F8F6F3] no-underline">
                    营养素百科
                  </Link>
                  <Link to="/wuxing" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#A8A199] hover:bg-[#F8F6F3] no-underline">
                    东方营养
                  </Link>

                  <div className="border-t border-[#F0EDE8] mt-1 pt-1">
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#1A1A1A] hover:bg-[#F8F6F3] no-underline">
                        <Shield size={16} className="text-[#C17A5F]" /> {t('nav.adminPanel')}
                      </Link>
                    )}
                    <button onClick={() => { logout(); setMenuOpen(false) }}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#6B6560] hover:bg-[#F8F6F3] w-full text-left">
                      <LogOut size={16} /> 退出登录
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ===== 未登录：登录按钮 ===== */
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm text-[#6B6560] hover:text-[#1B2A4A] transition-colors no-underline">
                登录
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* 积分购买弹窗 */}
      {showPurchase && <CreditPurchaseModal onClose={() => setShowPurchase(false)} />}
    </header>
  )
}
