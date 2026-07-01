/** Build Supabase Edge Function headers for send-push (requires apikey + bearer). */
export function buildSendPushHeaders(
  sessionToken: string | undefined,
  anonKey: string | undefined,
  hasOperationalAlert: boolean,
): Record<string, string> {
  const bearer =
    sessionToken ?? (hasOperationalAlert && anonKey ? anonKey : "");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${bearer}`,
  };

  if (anonKey) {
    headers.apikey = anonKey;
  }

  return headers;
}

export async function readPushSendError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    if (body.error) return body.error;
  } catch {
    // ignore JSON parse errors
  }
  return `HTTP ${response.status}`;
}
