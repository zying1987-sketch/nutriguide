import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
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
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/population/:categoryKey" element={<PopulationDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Layout>
  )
}

export default App
