import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { authActionEmail } from "../_shared/authEmailTemplates.ts";
import { sendViaResend } from "../_shared/resend.ts";

type EmailData = {
  token: string;
  token_hash: string;
  redirect_to: string;
  email_action_type: string;
  site_url: string;
  token_new: string;
  token_hash_new: string;
};

type HookUser = {
  email: string;
  new_email?: string;
  user_metadata?: { name?: string };
};

/** Keep in sync with src/lib/emailChangeDispatch.ts planEmailChangeSends. */
function planEmailChangeSends(input: {
  currentEmail: string;
  newEmail?: string | null;
  tokenHash: string;
  token?: string;
  tokenHashNew?: string;
  tokenNew?: string;
}): Array<{ to: string; tokenHash: string; otp?: string }> {
  const current = input.currentEmail.trim();
  const next = input.newEmail?.trim() || "";
  const hasDual = Boolean(input.tokenHashNew?.trim() && input.tokenNew?.trim());
  if (hasDual) {
    const sends: Array<{ to: string; tokenHash: string; otp?: string }> = [
      { to: current, tokenHash: input.tokenHashNew!.trim(), otp: input.token },
    ];
    if (next) sends.push({ to: next, tokenHash: input.tokenHash.trim(), otp: input.tokenNew });
    return sends;
  }
  return [{ to: next || current, tokenHash: input.tokenHash.trim(), otp: input.token }];
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const hookSecretRaw = Deno.env.get("SEND_EMAIL_HOOK_SECRET");
  if (!hookSecretRaw) {
    return new Response(JSON.stringify({ error: "SEND_EMAIL_HOOK_SECRET not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const hookSecret = hookSecretRaw.replace("v1,whsec_", "");
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  try {
    const wh = new Webhook(hookSecret);
    const { user, email_data } = wh.verify(payload, headers) as {
      user: HookUser;
      email_data: EmailData;
    };

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const siteUrl = (Deno.env.get("SITE_URL") ?? "https://www.oglifestyleph.com").replace(/\/$/, "");
    const action = email_data.email_action_type;
    const redirectTo =
      email_data.redirect_to ||
      (action === "email_change"
        ? `${siteUrl}/account/profile`
        : `${siteUrl}/account/sign-in?confirmed=1`);
    const name = (user.user_metadata?.name as string) ?? "";

    const sendOne = async (
      to: string,
      actionType: string,
      tokenHash: string,
      otp?: string,
    ) => {
      const verifyUrl =
        `${supabaseUrl}/auth/v1/verify?token=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(actionType)}&redirect_to=${encodeURIComponent(redirectTo)}`;
      const mail = authActionEmail({
        actionType,
        name,
        verifyUrl,
        otp,
        siteUrl,
      });
      await sendViaResend({ to, subject: mail.subject, html: mail.html, text: mail.text });
    };

    if (action === "email_change") {
      const sends = planEmailChangeSends({
        currentEmail: user.email,
        newEmail: user.new_email,
        tokenHash: email_data.token_hash,
        token: email_data.token,
        tokenHashNew: email_data.token_hash_new,
        tokenNew: email_data.token_new,
      });
      for (const send of sends) {
        await sendOne(send.to, action, send.tokenHash, send.otp);
      }
    } else {
      await sendOne(user.email, action, email_data.token_hash, action === "signup" ? undefined : email_data.token);
    }

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook verification failed";
    return new Response(JSON.stringify({ error: { message } }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
});
