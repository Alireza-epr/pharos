import { TTranslationKey } from './translationTypes'

export type TTranslator = (key: TTranslationKey, vars?: Record<string, string> | undefined) => string
