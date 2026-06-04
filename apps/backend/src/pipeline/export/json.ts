import { fs_writeFileSync } from './fs';

export const writeJSON = (a_OutputPath: string, a_Data: any) => {
  fs_writeFileSync(a_OutputPath + '.json', a_Data);
};
