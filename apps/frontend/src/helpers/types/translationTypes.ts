import en from '../../locales/en.json';
import de from '../../locales/de.json';
import { TLanguage } from '../enum/translationEnum';

export type TTranslations = typeof en;

// Builds the union of every dot-notation path to a string leaf in the JSON.
// e.g. { sidebar: { titles: { filter: 'Filter' } } } -> 'sidebar.titles.filter'
type TLeafPaths<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : T[K] extends Record<string, unknown>
      ? `${K}.${TLeafPaths<T[K]>}`
      : never;
}[keyof T & string];

// Valid keys accepted by t(), derived from the translation JSON.
export type TTranslationKey = TLeafPaths<TTranslations>;

// en.json > { "welcome": "Hello, {{name}}!" }
// component > t('welcome', { name: 'USER' })
export interface ILanguageContextType {
  language: TLanguage;
  t: (key: TTranslationKey, vars?: Record<string, string>) => string;
  changeLanguage: (lang: TLanguage) => void;
}
