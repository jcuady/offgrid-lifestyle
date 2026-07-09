import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeadersFor } from "../_shared/cors.ts";
import { contactAutoReplyEmail, contactStaffEmail } from "../_shared/emailTemplates.ts";
import { sendViaResend } from "../_shared/resend.ts";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOPIC_LABELS: Record<string, string> = {
  general: "General",
  custom: "Custom / Team Order",
  wholesale: "Wholesale",
  partnership: "Partnership",
};

Deno.serve(async (req: Request) => {
  const corsHeaders = corsHeadersFor(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
    const topic = typeof body.topic === "string" ? body.topic.trim() : "general";
    const message = typeof body.message === "string" ? body.message.trim().slice(0, 5000) : "";
    const honeypot = typeof body.website === "string" ? body.website.trim() : "";

    if (honeypot) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!name || !EMAIL_RE.test(email) || message.length < 10) {
      return new Response(JSON.stringify({ error: "Invalid contact form data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const topicLabel = TOPIC_LABELS[topic] ?? "General";
    const inbox = Deno.env.get("CONTACT_INBOX_EMAIL") ?? "offxgrid2024@gmail.com";
    const siteUrl = (Deno.env.get("SITE_URL") ?? "https://www.oglifestyleph.com").replace(/\/$/, "");
    const replyTo = email;

    const staff = contactStaffEmail({ name, email, topic: topicLabel, message, siteUrl });
    await sendViaResend({
      to: inbox,
      subject: staff.subject,
      html: staff.html,
      text: staff.text,
      replyTo,
    });

    const auto = contactAutoReplyEmail({ name, topic: topicLabel, siteUrl });
    await sendViaResend({
      to: email,
      subject: auto.subject,
      html: auto.html,
      text: auto.text,
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
