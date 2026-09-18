-- security-: edge-only contact form rate limit ledger (no anon/authenticated access)

CREATE TABLE IF NOT EXISTS public.og_contact_rate_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS og_contact_rate_log_bucket_created_idx
  ON public.og_contact_rate_log (bucket_key, created_at DESC);

ALTER TABLE public.og_contact_rate_log ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.og_contact_rate_log IS
  'Contact form rate-limit buckets (ip:/email:). Written by submit-contact edge only.';
