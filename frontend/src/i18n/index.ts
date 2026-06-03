import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import zhTranslation from './locales/zh/translation.json'
import enTranslation from './locales/en/translation.json'
import frTranslation from './locales/fr/translation.json'
import esTranslation from './locales/es/translation.json'

import zhNutrients from './locales/zh/nutrients.json'
import enNutrients from './locales/en/nutrients.json'
import frNutrients from './locales/fr/nutrients.json'
import esNutrients from './locales/es/nutrients.json'

export const SUPPORTED_LANGUAGES = [
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
] as const

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code']

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      zh: { translation: zhTranslation, nutrients: zhNutrients },
      en: { translation: enTranslation, nutrients: enNutrients },
      fr: { translation: frTranslation, nutrients: frNutrients },
      es: { translation: esTranslation, nutrients: esNutrients },
    },
    fallbackLng: 'zh',
    supportedLngs: ['zh', 'en', 'fr', 'es'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'nutriguide_lang',
    },
    interpolation: {
      escapeValue: false,
    },
    ns: ['translation', 'nutrients'],
    defaultNS: 'translation',
  })

export default i18n
