import React, { createContext, useState, useEffect } from 'react';
import { ELanguage } from '../helpers/enum/translationEnum';
import { ILanguageContextType } from '../helpers/types/translationTypes';
import { detectBrowserLanguage, translations } from '../helpers/utils/translationUtils';


export const LanguageContext = createContext<ILanguageContextType | undefined>(undefined);


export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<ELanguage>(ELanguage.en);

  useEffect(() => {
    const stored = localStorage.getItem('lang') as ELanguage;
    if (stored && translations[stored]) {
      setLanguage(stored);
    } else {
      const detected = detectBrowserLanguage();
      setLanguage(detected);
      localStorage.setItem('lang', detected);
    }
  }, []);

  const changeLanguage = (lang: ELanguage) => {
    localStorage.setItem('lang', lang);
    setLanguage(lang);
  };

  const t = (key: string, vars?: Record<string, string>): string => {
    const keys = key.split('.');
    let result: any = translations[language];

    for (const k of keys) {
      result = result?.[k];
      if (!result) return `~${key}`;
    }

    if (typeof result === 'string' && vars) {
      Object.keys(vars).forEach((v) => {
        result = result.replace(`{{${v}}}`, vars[v]);
      });
    }

    return result;
  };

  return (    
    <LanguageContext.Provider value={{ language, t, changeLanguage }} >
      {children}
    </LanguageContext.Provider>
  )
}
