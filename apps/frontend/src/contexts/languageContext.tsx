import React, { createContext, useEffect } from 'react';
import { ELanguage, TLanguage } from '../helpers/enum/translationEnum';
import { ILanguageContextType } from '../helpers/types/translationTypes';
import {
  detectBrowserLanguage,
  translations,
} from '../helpers/utils/translationUtils';
import { useAppStore } from '@/stores/appStore';

export const LanguageContext = createContext<ILanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const language = useAppStore(s => s.language );
  const setLanguage = useAppStore(s => s.setLanguage );

  useEffect(() => {
    const stored = localStorage.getItem('lang') as TLanguage;
    if (stored && translations[stored]) {
      setLanguage(stored);
    } else {
      const detected = detectBrowserLanguage();
      setLanguage(detected);
      localStorage.setItem('lang', detected);
    }
  }, []);

  useEffect( () => {
    changeLanguage(language)
  }, [language] )

  const changeLanguage = (lang: TLanguage) => {
    localStorage.setItem('lang', lang);
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
    <LanguageContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
