import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { verifyReportOwner } from "../_shared/ai-owner.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (b: object, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function buildSeedMessage(name: string, report: Record<string, unknown> | null): string {
  const firstName = (name || 'friend').split(/\s+/)[0];
  const signals: string[] = [];

  try {
    if (report) {
      const cw = report.careerWealth as Record<string, unknown> | undefined;
      if (cw?.wealthStyle) signals.push(`**Financial Path** — ${String(cw.wealthStyle).slice(0, 90)}`);
      else if (Array.isArray(cw?.bestFields) && cw.bestFields.length)
        signals.push(`**Career Strength** — best suited for ${(cw.bestFields as string[]).slice(0, 2).join(', ')}`);

      const lr = report.loveRelationships as Record<string, unknown> | undefined;
      if (lr?.commitmentTendency) signals.push(`**Relationships** — ${String(lr.commitmentTendency).slice(0, 90)}`);
      else if (lr?.emotionalStyle) signals.push(`**Emotional Nature** — ${String(lr.emotionalStyle).slice(0, 90)}`);

      const traits = report.personalityTraits as Array<{ trait?: string }> | undefined;
      if (Array.isArray(traits) && traits[0]?.trait) signals.push(`**Core Personality** — ${traits[0].trait}`);

      const lines = report.majorLines as Record<string, { strength?: string; keyInsight?: string }> | undefined;
      if (lines?.lifeLine?.keyInsight) signals.push(`**Vitality** — ${String(lines.lifeLine.keyInsight).slice(0, 90)}`);
    }
  } catch { /* ignore malformed report */ }

  if (signals.length === 0) {
    signals.push('**Career Growth Potential**', '**Relationship Insights**', '**Wealth Timeline**', '**Personal Growth Path**');
  }

  const bullets = signals.slice(0, 4).map(s => `• ${s}`).join('\n');
  return `Namaste ${firstName}.\n\nI've already studied your palm report in full. Your strongest indicators are:\n\n${bullets}\n\nWhat would you like to explore further?`;
}

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
  const report = owner.report!;
  const reportId = report.id;

  // Upsert conversation (keyed by report_id when there is no auth user)
  const { data: existing } = await admin
    .from("ai_conversations")
    .select("id")
    .eq("report_id", reportId)
    .is("user_id", null)
    .maybeSingle();

  let convId = existing?.id as string | undefined;
  if (!convId) {
    const { data: created, error: cErr } = await admin
      .from("ai_conversations")
      .insert({ report_id: reportId })
      .select("id")
      .single();
    if (cErr) return json({ error: cErr.message }, 500);
    convId = created.id;
  }

  // Grant complimentary questions on first entry (idempotent — insert only)
  const { data: freeCfg } = await admin
    .from("ai_pricing_config")
    .select("value")
    .eq("key", "free_questions_per_report")
    .maybeSingle();
  const freeN = Number((freeCfg?.value as { count?: number })?.count ?? freeCfg?.value ?? 3);
  await admin.rpc("grant_free_questions_by_report", { _report_id: reportId, _n: freeN });

  // Seed pre-briefed assistant message on first entry (does NOT debit quota)
  const { count: existingCount } = await admin
    .from("ai_messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", convId!);

  if ((existingCount ?? 0) === 0) {
    const seed = buildSeedMessage(
      report.user_name ?? "",
      (report.report_json ?? null) as Record<string, unknown> | null,
    );
    await admin.from("ai_messages").insert({
      conversation_id: convId!,
      role: "assistant",
      content: seed,
      model: "seed",
    });
  }

  const { data: messages } = await admin
    .from("ai_messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", convId!)
    .order("created_at", { ascending: true })
    .limit(200);

  return json({ conversationId: convId, messages: messages ?? [] });
});
