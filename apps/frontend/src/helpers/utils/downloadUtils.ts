import { ELogType } from '@packages/enum';
import { getLocaleISOString, log_frontend } from '@packages/utils';

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

export const downloadFile = (a_Blob: Blob, a_Filename: string) => {
  const href = URL.createObjectURL(a_Blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = a_Filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 0);
};

// Opens the browser's file picker for a single JSON file, parses it, and hands
// the result to `a_OnLoad`. Parse/read failures go to `a_OnError` instead of
// throwing, so callers don't need their own try/catch around this.
export const openJSONFile = (
  a_OnLoad: (a_Data: unknown) => void,
  a_OnError?: (a_Error: unknown) => void,
) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        a_OnLoad(JSON.parse(reader.result as string));
      } catch (error) {
        a_OnError?.(error);
      }
    };
    reader.onerror = () => a_OnError?.(reader.error);
    reader.readAsText(file);
  };
  input.click();
};

export const importSectionConfig = <T,>(
  a_Label: string,
  a_Validate: (a_Data: unknown) => a_Data is T,
  a_Apply: (a_Data: T) => void,
  a_OnInvalid: () => void,
): void => {
  openJSONFile(
    (data) => {
      if (!a_Validate(data)) {
        log_frontend(`[import:${a_Label}] invalid params`, ELogType.warn);
        a_OnInvalid();
        return;
      }
      a_Apply(data);
      log_frontend(`[import:${a_Label}] applied`, ELogType.info);
    },
    (error) => {
      log_frontend(
        `[import:${a_Label}] failed to read/parse file: ${String(error)}`,
        ELogType.error,
      );
      a_OnInvalid();
    },
  );
};
