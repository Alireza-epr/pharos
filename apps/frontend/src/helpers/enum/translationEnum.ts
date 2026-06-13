export const ELanguage = {
  en: 'en',
  de: 'de',
} as const
export type TLanguage = typeof ELanguage[keyof typeof ELanguage];

