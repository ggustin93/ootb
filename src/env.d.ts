// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="vite/client" />
/// <reference types="../vendor/integration/types.d.ts" />

interface ImportMetaEnv {
  readonly TINA_PUBLIC_CLIENT_ID: string;
  readonly TINA_TOKEN: string;
  readonly TINA_SEARCH_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
