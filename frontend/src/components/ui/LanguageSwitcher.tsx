import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { SUPPORTED_LANGUAGES } from '../../i18n'

interface Props {
  /** compact: 只显示旗帜，不显示文字（默认 false） */
  compact?: boolean
}

export default function LanguageSwitcher({ compact = false }: Props) {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language)
    ?? SUPPORTED_LANGUAGES[0]

  // 点击外部关闭
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code)
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5E0D8] hover:bg-[#F8F6F3] hover:border-[#D5D0C8] transition-all text-sm text-[#6B6560]"
        aria-label="Switch language"
        aria-expanded={open}
      >
        <span className="text-base leading-none">{current.flag}</span>
        {!compact && (
          <span className="hidden sm:inline font-medium text-xs text-[#1A1A1A]">
            {current.label}
          </span>
        )}
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-2xl shadow-lg border border-[#E5E0D8] py-1.5 overflow-hidden z-50 animate-fade-in-up">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors
                ${lang.code === i18n.language
                  ? 'bg-[#F5F2EC] text-[#1A1A1A] font-medium'
                  : 'text-[#6B6560] hover:bg-[#F8F6F3]'
                }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.label}</span>
              {lang.code === i18n.language && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#2D6B4F]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
