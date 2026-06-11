import { useContext } from 'react';
import { LanguageContext } from '../contexts/languageContext';

export const useTranslator = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx)
    throw new Error('useTranslator must be used within a LanguageProvider');
  return ctx;
};
