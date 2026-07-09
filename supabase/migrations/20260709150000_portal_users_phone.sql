-- Add phone number to portal customer profiles (signup + account).
ALTER TABLE public.og_portal_users
  ADD COLUMN IF NOT EXISTS phone text;

COMMENT ON COLUMN public.og_portal_users.phone IS 'Customer mobile number collected at registration.';
