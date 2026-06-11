import { ELanguage, TLanguage } from '../enum/translationEnum';
import { TTranslations } from '../types/translationTypes';

export const translations: Record<TLanguage, TTranslations> = {
  en: {},
  de: {},
};

export const detectBrowserLanguage = (): TLanguage => {
  const lang = navigator.language.slice(0, 2); // e.g., 'en', 'de'
  return lang in translations ? (lang as TLanguage) : ELanguage.en;
};
