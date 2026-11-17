/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the CodePulse backend. No default. */
  readonly VITE_API_BASE_URL?: string;
  /** "true" enables sample fixtures. Anything else disables them. */
  readonly VITE_USE_MOCK?: string;
  /** Mock mode only: "true" makes fixtures report a provisional model. */
  readonly VITE_MOCK_PROVISIONAL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
