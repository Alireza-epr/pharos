import { TTranslationKey } from './translationTypes';

export type TTranslator = (
  key: TTranslationKey,
  vars?: Record<string, string> | undefined,
) => string;

export enum ELoadingSize {
  sm = 'sm',
  md = 'md',
  lg = 'lg',
}

export interface IExportBlob {
  filename: string;
  blob: Blob;
}
