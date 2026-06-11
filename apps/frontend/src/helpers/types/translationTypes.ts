import en from '../../locales/en.json';
import de from '../../locales/de.json';
import { TLanguage } from '../enum/translationEnum';

export type TTranslations = typeof en;

// en.json > { "welcome": "Hello, {{name}}!" }
// component > t('welcome', { name: 'USER' })
export interface ILanguageContextType {
  language: TLanguage;
  t: (key: string, vars?: Record<string, string>) => string;
  changeLanguage: (lang: TLanguage) => void;
}
