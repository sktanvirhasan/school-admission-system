import React, { createContext, useContext, useState, useEffect } from 'react';
import { bn } from './bn';
import { en } from './en';

export type Language = 'bn' | 'en';

type Translations = typeof bn;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  format: (template: string, params: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'school_admission_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    return saved === 'en' ? 'en' : 'bn';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = language === 'en' ? en : bn;

  const format = (template: string, params: Record<string, string | number>): string => {
    let result = template;
    for (const [key, val] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, format }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

