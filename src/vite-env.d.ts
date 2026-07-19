/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROFILE: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_STORAGE_SECRET: string;
  readonly VITE_BASE_PATH: string;
  readonly VITE_USE_MOCK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
