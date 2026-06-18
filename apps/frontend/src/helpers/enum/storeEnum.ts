export const ETheme = {
  dark: 'dark',
  light: 'light',
} as const;
export type TTheme = (typeof ETheme)[keyof typeof ETheme];

export const ESidebarTab = {
  report: 'report',
  hotspot: 'hotspot',
  event: 'event',
} as const;
export type TSidebarTab = (typeof ESidebarTab)[keyof typeof ESidebarTab];

export const EDetailTab = {
  detail: 'detail',
  export: 'export'
} as const;
export type TDetailTab = (typeof EDetailTab)[keyof typeof EDetailTab];
