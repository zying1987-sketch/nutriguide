// API 客户端 — 同域部署用相对路径，本地开发可设 VITE_API_BASE 覆盖
const API_BASE = import.meta.env.VITE_API_BASE || '/api'

function getToken(): string | null {
  return localStorage.getItem('nutriguide_token')
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: '网络错误' }))
    throw new Error(body.error || `请求失败 (${res.status})`)
  }

  return res.json()
}

export const api = {
  // Auth
  register: (data: { email: string; password: string; name?: string; phone?: string; wechatId?: string; code: string; inviteCode?: string; agreed?: boolean }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  getMe: () => request('/auth/me'),

  updateProfile: (data: { name: string }) =>
    request('/auth/me', { method: 'PUT', body: JSON.stringify(data) }),

  // User Profile (health info)
  getProfile: () => request('/profile'),
  updateUserProfile: (data: any) => request('/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Verification
  sendVerifyCode: (email: string) =>
    request('/verify/send-code', { method: 'POST', body: JSON.stringify({ email }) }),

  verifyCode: (email: string, code: string) =>
    request('/verify/verify-code', { method: 'POST', body: JSON.stringify({ email, code }) }),

  // Assessments
  saveAssessment: (data: { stepData: any; result: any; fullReport?: string }) =>
    request('/assessments', { method: 'POST', body: JSON.stringify(data) }),

  updateAssessmentReport: (id: number, fullReport: string) =>
    request(`/assessments/${id}/report`, { method: 'PUT', body: JSON.stringify({ fullReport }) }),

  // Invite Codes
  generateInviteCodes: (count: number) =>
    request('/invite/generate', { method: 'POST', body: JSON.stringify({ count }) }),
  validateInviteCode: (code: string) =>
    request('/invite/validate', { method: 'POST', body: JSON.stringify({ code }) }),
  getInviteCodes: () => request('/invite/list'),

  getAssessments: () => request('/assessments'),

  getAssessment: (id: number) => request(`/assessments/${id}`),

  downloadReport: (id: number) => {
    const token = localStorage.getItem('nutriguide_token')
    window.open(`/api/assessments/${id}/report?token=${encodeURIComponent(token || '')}`, '_blank')
  },

  // Plans
  savePlan: (data: { populationTags: string; planData: any }) =>
    request('/assessments/plan', { method: 'POST', body: JSON.stringify(data) }),

  getPlanHistory: () => request('/assessments/plan/history'),

  getPlan: (id: number) => request(`/assessments/plan/${id}`),

  // AI Plan
  generatePlan: (prompt: string) =>
    request('/generate-plan', { method: 'POST', body: JSON.stringify({ prompt }) }),

  // Admin
  getAdminStats: () => request('/admin/stats'),

  getAdminUsers: (page = 1, search = '') =>
    request(`/admin/users?page=${page}&search=${encodeURIComponent(search)}`),

  getAdminUserDetail: (userId: number) => request(`/admin/users/${userId}`),

  getAdminUserAssessment: (userId: number, assessmentId: number) =>
    request(`/admin/users/${userId}/assessments/${assessmentId}`),

  // Credits
  getCredits: () => request('/credits/balance'),
  purchaseCredits: (pkg: string) =>
    request('/credits/purchase', { method: 'POST', body: JSON.stringify({ package: pkg }) }),

  // AI Chat
  askAI: (question: string) =>
    request('/chat/ask', { method: 'POST', body: JSON.stringify({ question }) }),
  getChatHistory: () => request('/chat/history'),

  // Knowledge Base
  getKnowledgeOverview: () => request('/knowledge/overview'),
  getKnowledgeList: (params?: { q?: string; category?: string; page?: number; limit?: number }) => {
    const sp = new URLSearchParams()
    if (params?.q) sp.set('q', params.q)
    if (params?.category) sp.set('category', params.category)
    if (params?.page) sp.set('page', String(params.page))
    if (params?.limit) sp.set('limit', String(params.limit))
    const qs = sp.toString()
    return request(`/knowledge${qs ? '?' + qs : ''}`)
  },
  getKnowledgeDetail: (id: string) => request(`/knowledge/${encodeURIComponent(id)}`),
}

export function setToken(token: string) {
  localStorage.setItem('nutriguide_token', token)
}

export function clearToken() {
  localStorage.removeItem('nutriguide_token')
}
