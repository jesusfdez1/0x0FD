import { createContext, useContext, useEffect, useState } from 'react'
import { en } from '@/locales/en'
import { es } from '@/locales/es'

type Language = 'en' | 'es'

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, params?: Record<string, any>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
)

const translations = {
  en,
  es,
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('language')
    return (stored as Language) || 'en'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
  }

  const t = (key: string, params?: Record<string, any>): string => {
    const keys = key.split('.')
    let value: any = translations[language]

    for (const k of keys) {
      value = value?.[k]
    }

    if (value == null) return key

    if (params && typeof value === 'string') {
      return value.replace(/\{(\w+)\}/g, (_, name) => {
        return params[name] ?? `{${name}}`
      })
    }

    return typeof value === 'string' ? value : key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

