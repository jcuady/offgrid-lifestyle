import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config();

/** Confirm a test customer's email via Supabase Admin API (requires service role in .env). */
export async function confirmCustomerEmail(email: string): Promise<void> {
  await setCustomerEmailConfirmed(email, true);
}

/** Mark a test customer's email as unconfirmed for sign-in gate E2E. */
export async function unconfirmCustomerEmail(email: string): Promise<void> {
  await setCustomerEmailConfirmed(email, false);
}

async function setCustomerEmailConfirmed(email: string, confirmed: boolean): Promise<void> {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return;

  const admin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) throw error;

  const user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error(`Test user not found: ${email}`);

  const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
    email_confirm: confirmed,
  });
  if (updateError) throw updateError;
}

/** Remove a test customer so registration E2E can run cleanly. */
export async function deleteCustomerByEmail(email: string): Promise<void> {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return;

  const admin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) throw error;

  const user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) return;

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) throw deleteError;
}
