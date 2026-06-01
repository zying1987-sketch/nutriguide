import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { User, LogOut, Shield, Menu, X } from 'lucide-react'

export default function Header() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const [menuOpen, setMenuOpen] = useState(false)
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
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/assessment" className="text-[#1B2A4A]/70 hover:text-[#7A8B6F] transition-colors no-underline">
            自测
          </Link>
          <Link to="/population/pregnancy" className="text-[#1B2A4A]/70 hover:text-[#7A8B6F] transition-colors no-underline hidden sm:inline">
            人群方案
          </Link>

          {user ? (
            <div className="relative" ref={menuRef}>
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
                      <Shield className="w-4 h-4 text-[#C17A5F]" /> 管理后台
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setMenuOpen(false) }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#6B6560] hover:bg-[#F8F6F3] w-full text-left"
                  >
                    <LogOut className="w-4 h-4" /> 退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-[#1B2A4A]/70 hover:text-[#7A8B6F] text-sm no-underline">登录</Link>
              <Link to="/register" className="px-4 py-2 bg-[#1A1A1A] text-white rounded-full text-sm font-medium hover:bg-[#333] transition-colors no-underline">
                注册
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
