import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (b: object, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "unauthorized" }, 401);

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: userRes } = await supa.auth.getUser();
  const user = userRes.user;
  if (!user) return json({ error: "unauthorized" }, 401);

  // Ensure row exists then read
  await supa.from("ai_entitlements").upsert({ user_id: user.id }, { onConflict: "user_id" });
  const { data: ent } = await supa
    .from("ai_entitlements")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: monthlyCfg } = await supa
    .from("ai_pricing_config")
    .select("value")
    .eq("key", "subscription_monthly")
    .maybeSingle();
  const { data: annualCfg } = await supa
    .from("ai_pricing_config")
    .select("value")
    .eq("key", "subscription_annual")
    .maybeSingle();

  const monthlyQuota =
    ent?.subscription_plan === "ai_elite_annual"
      ? (annualCfg?.value as { quota?: number })?.quota ?? 200
      : (monthlyCfg?.value as { quota?: number })?.quota ?? 200;

  const now = Date.now();
  const hasActive =
    !!ent?.subscription_expires_at && new Date(ent.subscription_expires_at).getTime() > now;

  const subUsage = ent?.subscription_month_usage ?? 0;
  const subRemaining = hasActive ? Math.max(0, monthlyQuota - subUsage) : 0;

  const totalRemaining =
    (ent?.free_questions_remaining ?? 0) +
    (ent?.pack_questions_remaining ?? 0) +
    subRemaining;

  return json({
    free_questions_remaining: ent?.free_questions_remaining ?? 0,
    pack_questions_remaining: ent?.pack_questions_remaining ?? 0,
    subscription_plan: ent?.subscription_plan ?? null,
    subscription_expires_at: ent?.subscription_expires_at ?? null,
    subscription_month_usage: subUsage,
    monthly_quota: monthlyQuota,
    has_active_subscription: hasActive,
    total_remaining: totalRemaining,
  });
});
