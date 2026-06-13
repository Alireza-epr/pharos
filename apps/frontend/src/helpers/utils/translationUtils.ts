import { ELanguage, TLanguage } from '../enum/translationEnum';
import { TTranslations } from '../types/translationTypes';
import en from '../../locales/en.json';
import de from '../../locales/de.json';

export const translations: Record<TLanguage, TTranslations> = {
  en: en,
  de: de,
};

export const detectBrowserLanguage = (): TLanguage => {
  const lang = navigator.language.slice(0, 2); // e.g., 'en', 'de'
  return lang in translations ? (lang as TLanguage) : ELanguage.en;
};
