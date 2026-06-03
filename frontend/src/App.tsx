import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import HomePage from './pages/HomePage'
import AssessmentPage from './pages/AssessmentPage'
import ResultsPage from './pages/ResultsPage'
import PlanPage from './pages/PlanPage'
import NutrientListPage from './pages/NutrientListPage'
import NutrientDetailPage from './pages/NutrientDetailPage'
import PopulationDetailPage from './pages/population/PopulationDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminPage from './pages/AdminPage'
import FoodWikiPage from './pages/FoodWikiPage'
import NutritionDataPage from './pages/NutritionDataPage'
import NutritionDataDetailPage from './pages/NutritionDataDetailPage'
import ChatPage from './pages/ChatPage'
import HistoryPage from './pages/HistoryPage'
import HistoryDetailPage from './pages/HistoryDetailPage'
import WuxingPage from './pages/WuxingPage'
import { useAuthStore } from './stores/useAuthStore'

function App() {
  const loadUser = useAuthStore((s) => s.loadUser)

  useEffect(() => {
    loadUser()
  }, [])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/nutrients" element={<NutrientListPage />} />
        <Route path="/nutrient/:id" element={<NutrientDetailPage />} />
        <Route path="/assessment" element={<ProtectedRoute><AssessmentPage /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
        <Route path="/plan" element={<ProtectedRoute><PlanPage /></ProtectedRoute>} />
        <Route path="/population/:categoryKey" element={<PopulationDetailPage />} />
        <Route path="/food-wiki" element={<FoodWikiPage />} />
        <Route path="/nutrition-data" element={<NutritionDataPage />} />
        <Route path="/nutrition-data/:id" element={<NutritionDataDetailPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/history/:id" element={<ProtectedRoute><HistoryDetailPage /></ProtectedRoute>} />
        <Route path="/wuxing" element={<WuxingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>} />
      </Routes>
    </Layout>
  )
}

export default App
