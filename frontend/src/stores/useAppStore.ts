import { create } from 'zustand'
import type { AssessmentResult } from '../engine/ruleEngine'
import type { GeneratedPlan } from '../engine/planGenerator'

interface AppState {
  // Assessment
  currentStep: number
  assessmentData: Record<string, any>
  isDraft: boolean

  // Results
  assessmentResult: AssessmentResult | null
  generatedPlan: GeneratedPlan | null

  // AI
  aiPlan: string | null
  aiLoading: boolean
  aiError: string | null

  // Persistence
  assessmentId: number | null
  planSaved: boolean

  // Actions
  setCurrentStep: (step: number) => void
  updateAssessmentData: (data: Record<string, any>) => void
  saveDraft: () => void
  loadDraft: () => boolean
  setAssessmentResult: (result: AssessmentResult) => void
  setGeneratedPlan: (plan: GeneratedPlan) => void
  setAIPlan: (plan: string | null) => void
  setAILoading: (loading: boolean) => void
  setAIError: (error: string | null) => void
  setAssessmentId: (id: number) => void
  markPlanSaved: () => void
  reset: () => void
}

const DRAFT_KEY = 'nutriguide_draft'

export const useAppStore = create<AppState>((set, get) => ({
  currentStep: 1,
  assessmentData: {},
  isDraft: false,
  assessmentResult: null,
  generatedPlan: null,
  aiPlan: null,
  aiLoading: false,
  aiError: null,
  assessmentId: null,
  planSaved: false,

  setCurrentStep: (step) => set({ currentStep: step }),

  updateAssessmentData: (data) =>
    set((state) => ({
      assessmentData: { ...state.assessmentData, ...data },
    })),

  saveDraft: () => {
    const { assessmentData } = get()
    localStorage.setItem(DRAFT_KEY, JSON.stringify(assessmentData))
    set({ isDraft: true })
  },

  loadDraft: () => {
    const draft = localStorage.getItem(DRAFT_KEY)
    if (draft) {
      try {
        const data = JSON.parse(draft)
        set({ assessmentData: data, isDraft: true })
        return true
      } catch {
        return false
      }
    }
    return false
  },

  setAssessmentResult: (result) => set({ assessmentResult: result }),
  setGeneratedPlan: (plan) => set({ generatedPlan: plan }),
  setAIPlan: (plan) => set({ aiPlan: plan }),
  setAILoading: (loading) => set({ aiLoading: loading }),
  setAIError: (error) => set({ aiError: error }),

  setAssessmentId: (id) => set({ assessmentId: id }),
  markPlanSaved: () => set({ planSaved: true }),

  reset: () =>
    set({
      currentStep: 1,
      assessmentData: {},
      isDraft: false,
      assessmentResult: null,
      generatedPlan: null,
      aiPlan: null,
      aiLoading: false,
      aiError: null,
      assessmentId: null,
      planSaved: false,
    }),
}))
