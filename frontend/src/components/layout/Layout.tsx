import { ReactNode } from 'react'
import Header from './Header'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#FAF8F5]">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="py-8 text-center text-sm text-gray-400 border-t border-[#E8E3DB] no-print">
        <div className="max-w-4xl mx-auto px-6 space-y-2">
          <p className="font-medium text-gray-500">NutriGuide — 个性化营养补给与生活方式助手</p>
          <p className="text-xs">
            免责声明：本网站提供的内容仅供参考和教育目的，不构成医疗建议。
            任何营养素补充剂的使用均应在医生或注册营养师指导下进行。
            如果您有已确诊疾病或正在服用药物，请在调整饮食或补充剂前咨询您的医生。
          </p>
        </div>
      </footer>
    </div>
  )
}
