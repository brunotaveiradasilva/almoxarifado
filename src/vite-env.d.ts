/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base da API (almoxarifado-api). Sem barra no final. */
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
