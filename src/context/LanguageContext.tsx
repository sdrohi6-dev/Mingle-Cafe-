import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../i18n/locales/en.json';
import ta from '../i18n/locales/ta.json';
import te from '../i18n/locales/te.json';
import hi from '../i18n/locales/hi.json';
import ml from '../i18n/locales/ml.json';

export type SupportedLanguage = 'en' | 'ta' | 'te' | 'hi' | 'ml';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
];

const translations: Record<SupportedLanguage, any> = {
  en,
  ta,
  te,
  hi,
  ml,
};

export interface LocalizedString {
  en: string;
  ta?: string;
  te?: string;
  hi?: string;
  ml?: string;
}

interface LanguageContextType {
  language: SupportedLanguage;
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (keyPath: string, variables?: Record<string, string | number>) => string;
  getLocalized: (obj?: LocalizedString, fallback?: string) => string;
  showWelcomeModal: boolean;
  setShowWelcomeModal: (show: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cafeflow_language');
      if (saved && (saved === 'en' || saved === 'ta' || saved === 'te' || saved === 'hi' || saved === 'ml')) {
        return saved;
      }
    }
    return 'en';
  });

  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('cafeflow_lang_chosen');
    }
    return false;
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cafeflow_language', lang);
      localStorage.setItem('cafeflow_lang_chosen', 'true');
    }
  };

  const t = (keyPath: string, variables?: Record<string, string | number>): string => {
    const keys = keyPath.split('.');
    let current: any = translations[language];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English
        let fallbackCurrent: any = translations.en;
        for (const fbKey of keys) {
          if (fallbackCurrent && typeof fallbackCurrent === 'object' && fbKey in fallbackCurrent) {
            fallbackCurrent = fallbackCurrent[fbKey];
          } else {
            return '';
          }
        }
        current = fallbackCurrent;
        break;
      }
    }

    if (typeof current !== 'string') return '';

    let result = current;
    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        result = result.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
      });
    }

    return result;
  };

  const getLocalized = (obj?: LocalizedString, fallback = ''): string => {
    if (!obj) return fallback;
    const localized = obj[language];
    if (localized && localized.trim()) return localized;
    return obj.en || fallback;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        currentLanguage: language,
        setLanguage,
        t,
        getLocalized,
        showWelcomeModal,
        setShowWelcomeModal,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
