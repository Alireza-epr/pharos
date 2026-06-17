export const ETheme = {
  dark: 'dark',
  light: 'light',
} as const;
export type TTheme = (typeof ETheme)[keyof typeof ETheme];
