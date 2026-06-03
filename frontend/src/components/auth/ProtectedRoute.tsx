import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { Loader2 } from 'lucide-react'

interface Props {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin }: Props) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D9C6F]" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
