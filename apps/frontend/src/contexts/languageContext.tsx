import React, { createContext } from 'react';
import { TLanguage } from '../helpers/enum/translationEnum';
import {
  ILanguageContextType,
  TTranslationKey,
} from '../helpers/types/translationTypes';
import { translations } from '../helpers/utils/translationUtils';
import { useAppStore } from '@/stores/appStore';

export const LanguageContext = createContext<ILanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  const changeLanguage = (lang: TLanguage) => {
    setLanguage(lang);
  };

  const t = (key: TTranslationKey, vars?: Record<string, string>): string => {
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
