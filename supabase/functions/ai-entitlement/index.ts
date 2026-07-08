import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { verifyReportOwner } from "../_shared/ai-owner.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (b: object, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  let body: { reportId?: string; userEmail?: string };
  try { body = await req.json(); } catch { return json({ error: "invalid json" }, 400); }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const owner = await verifyReportOwner(admin, body.reportId, body.userEmail);
  if (!owner.ok) return json({ error: owner.error }, owner.status ?? 400);
  const reportId = owner.report!.id;

  // Ensure entitlement row exists (grant free questions on first read too, idempotent)
  const { data: freeCfg } = await admin
    .from("ai_pricing_config").select("value").eq("key", "free_questions_per_report").maybeSingle();
  const freeN = Number((freeCfg?.value as { count?: number })?.count ?? freeCfg?.value ?? 3);
  await admin.rpc("grant_free_questions_by_report", { _report_id: reportId, _n: freeN });

  const { data: ent } = await admin
    .from("ai_entitlements").select("*").eq("report_id", reportId).maybeSingle();

  const { data: monthlyCfg } = await admin
    .from("ai_pricing_config").select("value").eq("key", "subscription_monthly").maybeSingle();
  const { data: annualCfg } = await admin
    .from("ai_pricing_config").select("value").eq("key", "subscription_annual").maybeSingle();

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
