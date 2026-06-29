import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ManageAction = "create" | "update" | "reset_password" | "delete";

interface ManageUserBody {
  action: ManageAction;
  portalUserId?: string;
  name?: string;
  email?: string;
  password?: string;
  role?: "staff";
}

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: new Response(JSON.stringify({ error: "Missing Authorization header" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }) };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const token = authHeader.replace("Bearer ", "");

  const callerClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: { user: caller }, error: callerErr } = await callerClient.auth.getUser(token);
  if (callerErr || !caller) {
    return { error: new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }) };
  }

  if (caller.app_metadata?.portal_role !== "admin") {
    return { error: new Response(JSON.stringify({ error: "Admin access required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }) };
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: adminPortal } = await adminClient
    .from("og_portal_users")
    .select("id, email")
    .eq("auth_user_id", caller.id)
    .maybeSingle();

  return { adminClient, caller, adminPortal };
}

function validatePassword(password: string | undefined): string | null {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const auth = await requireAdmin(req);
    if ("error" in auth && auth.error) return auth.error;

    const { adminClient, adminPortal } = auth;
    const body = (await req.json()) as ManageUserBody;
    const { action } = body;

    if (action === "create") {
      const { name, email, password } = body;
      if (!name || !email || !password) {
        return new Response(JSON.stringify({ error: "name, email, and password are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const pwErr = validatePassword(password);
      if (pwErr) {
        return new Response(JSON.stringify({ error: pwErr }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: { portal_role: "staff" },
        user_metadata: { name },
      });

      if (createErr || !newUser.user) {
        return new Response(JSON.stringify({ error: createErr?.message ?? "Create failed" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: portalUser, error: portalErr } = await adminClient
        .from("og_portal_users")
        .insert({
          auth_user_id: newUser.user.id,
          name,
          email,
          role: "staff",
          created_by: adminPortal?.id ?? null,
        })
        .select("id")
        .single();

      if (portalErr) {
        return new Response(JSON.stringify({ error: portalErr.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ id: portalUser.id, authUserId: newUser.user.id }), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!body.portalUserId) {
      return new Response(JSON.stringify({ error: "portalUserId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: target, error: targetErr } = await adminClient
      .from("og_portal_users")
      .select("id, auth_user_id, email, name, role, status")
      .eq("id", body.portalUserId)
      .maybeSingle();

    if (targetErr || !target) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      if (target.role === "admin") {
        return new Response(JSON.stringify({ error: "Cannot delete admin accounts" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await adminClient.from("og_portal_users").update({ status: "inactive" }).eq("id", target.id);

      if (target.auth_user_id) {
        await adminClient.auth.admin.updateUserById(target.auth_user_id, {
          ban_duration: "876000h",
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "reset_password" || action === "update") {
      const password = body.password?.trim();
      const name = body.name?.trim();
      const email = body.email?.trim().toLowerCase();

      if (action === "reset_password") {
        const pwErr = validatePassword(password);
        if (pwErr) {
          return new Response(JSON.stringify({ error: pwErr }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      if (!target.auth_user_id) {
        return new Response(JSON.stringify({ error: "User has no auth account" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const authPatch: Record<string, unknown> = {};
      if (password) authPatch.password = password;
      if (email) authPatch.email = email;
      if (email) authPatch.email_confirm = true;
      if (name) authPatch.user_metadata = { name };

      if (Object.keys(authPatch).length > 0) {
        const { error: authUpdateErr } = await adminClient.auth.admin.updateUserById(
          target.auth_user_id,
          authPatch,
        );
        if (authUpdateErr) {
          return new Response(JSON.stringify({ error: authUpdateErr.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      const portalPatch: Record<string, unknown> = {};
      if (name) portalPatch.name = name;
      if (email) portalPatch.email = email;

      if (Object.keys(portalPatch).length > 0) {
        const { error: portalUpdateErr } = await adminClient
          .from("og_portal_users")
          .update(portalPatch)
          .eq("id", target.id);
        if (portalUpdateErr) {
          return new Response(JSON.stringify({ error: portalUpdateErr.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
