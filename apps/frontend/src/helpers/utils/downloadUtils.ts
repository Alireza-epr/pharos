import { getLocaleISOString } from '@packages/utils';

export const downloadJSON = (a_Data: Record<any, any>, a_Filename: string) => {
  const blob = new Blob([JSON.stringify(a_Data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${a_Filename}_${getLocaleISOString(new Date(Date.now()))}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
