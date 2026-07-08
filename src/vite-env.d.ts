interface ImportMetaEnv {
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_VAPID_PUBLIC_KEY?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_GSC_VERIFICATION?: string;
  /** PayMongo public key fallback — prefer og_payment_settings.paymongo_public_key in production. */
  readonly VITE_PAYMONGO_PUBLIC_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "leaflet/dist/leaflet.css";

/// <reference types="vite-plugin-pwa/client" />

declare module "virtual:pwa-register" {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: unknown) => void;
  }

  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}
