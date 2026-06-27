interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** PayMongo public key fallback — prefer og_payment_settings.paymongo_public_key in production. */
  readonly VITE_PAYMONGO_PUBLIC_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
