import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import hi from './locales/hi.json'
import mr from './locales/mr.json'

const savedLanguage = localStorage.getItem('jalnacare-language') || 'en'

void i18n
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, hi: { translation: hi }, mr: { translation: mr } },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  })

export const setLanguage = (language) => {
  localStorage.setItem('jalnacare-language', language)
  return i18n.changeLanguage(language)
}

export default i18n
