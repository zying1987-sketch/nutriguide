import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../stores/useAuthStore'
import { User, LogOut, Shield, Zap, PlusCircle, FileText } from 'lucide-react'
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

  return (
    <header className={`sticky top-0 z-50 ${isHome ? 'bg-transparent' : 'bg-white/80 backdrop-blur-sm border-b border-[#E8E3DB]'}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 bg-gradient-to-br from-[#7A8B6F] to-[#5A6B4F] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-[#1B2A4A]">NutriGuide</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link to="/nutrients" className="text-[#1B2A4A]/70 hover:text-[#7A8B6F] transition-colors no-underline">
            {t('nav.nutrients')}
          </Link>
          <Link to="/food-wiki" className="text-[#1B2A4A]/70 hover:text-[#E85D3A] transition-colors no-underline hidden sm:inline">
            食材百科
          </Link>
          <Link to="/nutrition-data" className="text-[#1B2A4A]/70 hover:text-[#2D9C6F] transition-colors no-underline hidden sm:inline">
            营养数据库
          </Link>
          <Link to="/wuxing" className="text-[#1B2A4A]/70 hover:text-[#C17A5F] transition-colors no-underline hidden sm:inline">
            东方营养
          </Link>
          <Link to="/chat" className="text-[#1B2A4A]/70 hover:text-[#E85D3A] transition-colors no-underline flex items-center gap-1">
            <Zap size={14} />AI咨询
          </Link>
          <Link to="/assessment" className="text-[#1B2A4A]/70 hover:text-[#7A8B6F] transition-colors no-underline">
            {t('nav.assessment')}
          </Link>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {user ? (
            <div className="relative flex items-center gap-2" ref={menuRef}>
              {/* Credits badge */}
              <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                <Zap size={10} />
                {user.credits ?? 0}
              </span>
              <button
                onClick={() => setShowPurchase(true)}
                className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-1.5 py-1 rounded-full transition-colors"
                title="购买积分"
              >
                <PlusCircle size={12} />
              </button>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E5E0D8] hover:bg-[#F8F6F3] transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#7A8B6F]/15 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-[#7A8B6F]" />
                </div>
                <span className="text-[#1A1A1A] hidden sm:inline text-xs">{user.name || user.email}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-lg border border-[#E5E0D8] py-1 overflow-hidden">
                  <div className="px-4 py-2 border-b border-[#F0EDE8]">
                    <p className="text-xs font-medium text-[#1A1A1A]">{user.name || user.email}</p>
                    <p className="text-xs text-[#A8A199]">{user.email}</p>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F8F6F3] no-underline"
                    >
                      <Shield className="w-4 h-4 text-[#C17A5F]" /> {t('nav.adminPanel')}
                    </Link>
                  )}
                  <Link
                    to="/history"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F8F6F3] no-underline"
                  >
                    <FileText className="w-4 h-4 text-[#7A8B6F]" /> 我的记录
                  </Link>
                  <button
                    onClick={() => { logout(); setMenuOpen(false) }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#6B6560] hover:bg-[#F8F6F3] w-full text-left"
                  >
                    <LogOut className="w-4 h-4" /> {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-[#1B2A4A]/70 hover:text-[#7A8B6F] text-sm no-underline">{t('nav.login')}</Link>
              <Link to="/register" className="px-4 py-2 bg-[#1A1A1A] text-white rounded-full text-sm font-medium hover:bg-[#333] transition-colors no-underline">
                {t('nav.register')}
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
