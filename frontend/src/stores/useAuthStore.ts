import { create } from 'zustand'
import { api, setToken, clearToken } from '../lib/api'

interface User {
  id: number
  email: string
  name: string
  phone?: string
  wechatId?: string
  role: 'user' | 'admin'
  credits?: number
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean

  // Actions
  login: (email: string, password: string) => Promise<void>
  setUser: (user: User, token: string) => void
  logout: () => void
  loadUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('nutriguide_token'),
  loading: true,

  login: async (email, password) => {
    const data = await api.login({ email, password })
    setToken(data.token)
    set({ user: data.user, token: data.token })
  },

  setUser: (user, token) => {
    setToken(token)
    set({ user, token })
  },

  logout: () => {
    clearToken()
    set({ user: null, token: null })
  },

  loadUser: async () => {
    const token = localStorage.getItem('nutriguide_token')
    if (!token) {
      set({ loading: false })
      return
    }
    try {
      const data = await api.getMe()
      set({ user: data.user, token, loading: false })
    } catch {
      clearToken()
      set({ user: null, token: null, loading: false })
    }
  },
}))
