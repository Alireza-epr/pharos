import { ELanguage } from "../enum/translationEnum";
import { TTranslations } from "../types/translationTypes";

export const translations: Record<ELanguage, TTranslations> = {
  en: {},
  de: {}
};

export const detectBrowserLanguage = (): ELanguage => {
  const lang = navigator.language.slice(0, 2); // e.g., 'en', 'de'
  return lang in translations ? (lang as ELanguage) : ELanguage.en;
}
