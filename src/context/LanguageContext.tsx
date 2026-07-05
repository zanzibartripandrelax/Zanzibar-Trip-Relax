import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TRANSLATIONS } from '../lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
  tDefault: (key: string, currentVal: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('ztr_language');
    const validLanguages = ['en', 'sw', 'fr', 'de', 'it', 'es', 'pl'];
    if (saved && validLanguages.includes(saved)) {
      return saved as Language;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ztr_language', lang);
  };

  const t = (key: string, defaultText?: string): string => {
    const dictionary = TRANSLATIONS[language];
    if (dictionary && dictionary[key]) {
      return dictionary[key];
    }
    // Fallback to English dictionary
    const enDictionary = TRANSLATIONS['en'];
    if (enDictionary && enDictionary[key]) {
      return enDictionary[key];
    }
    return defaultText || key;
  };

  const tDefault = (key: string, currentVal: string): string => {
    if (language === 'en') return currentVal;
    const dictionary = TRANSLATIONS['sw'];
    if (dictionary && dictionary[key]) {
      return dictionary[key];
    }
    return currentVal;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tDefault }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
