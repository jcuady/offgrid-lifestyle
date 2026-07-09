import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { authActionEmail } from "../_shared/emailTemplates.ts";
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
  user_metadata?: { name?: string };
};

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
    const redirectTo =
      email_data.redirect_to ||
      `${siteUrl}/account/sign-in?confirmed=1`;
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
      });
      await sendViaResend({ to, subject: mail.subject, html: mail.html, text: mail.text });
    };

    const action = email_data.email_action_type;

    if (action === "email_change" && email_data.token_hash_new && email_data.token_new) {
      await sendOne(user.email, action, email_data.token_hash_new, email_data.token);
      const newEmail = (user as HookUser & { new_email?: string }).new_email;
      if (newEmail) {
        await sendOne(newEmail, action, email_data.token_hash, email_data.token_new);
      }
    } else {
      await sendOne(user.email, action, email_data.token_hash, email_data.token);
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
