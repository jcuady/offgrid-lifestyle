/** Build Supabase Edge Function headers (apikey + bearer). */
export function buildEdgeFunctionHeaders(
  sessionToken?: string,
  allowAnonFallback = true,
  anonKeyOverride?: string,
): Record<string, string> {
  const anonKey = anonKeyOverride ?? (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);
  const bearer = sessionToken ?? (allowAnonFallback && anonKey ? anonKey : "");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${bearer}`,
  };

  if (anonKey) {
    headers.apikey = anonKey;
  }

  return headers;
}

export async function readEdgeFunctionError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    if (body.error) return body.error;
  } catch {
    // ignore JSON parse errors
  }
  return `HTTP ${response.status}`;
}
