/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}
declare module '*.scss' {
  const content: string;
  export default content;
}
