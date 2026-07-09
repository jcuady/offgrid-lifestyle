export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendViaResend(input: SendEmailInput): Promise<{ id: string }> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const from = Deno.env.get("RESEND_FROM_EMAIL") ?? "OFF GRID Lifestyle <hello@oglifestyleph.com>";
  const recipients = Array.isArray(input.to) ? input.to : [input.to];

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: input.replyTo,
    }),
  });

  const body = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const message = typeof body?.message === "string" ? body.message : `Resend HTTP ${resp.status}`;
    throw new Error(message);
  }

  return { id: body.id ?? "unknown" };
}
