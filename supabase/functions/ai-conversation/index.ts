import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (b: object, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

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

  const auth = req.headers.get("Authorization");
  if (!auth) return json({ error: "unauthorized" }, 401);

  let body: { reportId?: string };
  try { body = await req.json(); } catch { return json({ error: "invalid json" }, 400); }
  const reportId = body.reportId?.trim() ?? "";
  if (!isUuid(reportId)) return json({ error: "invalid reportId" }, 400);

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { global: { headers: { Authorization: auth } } },
  );

  const { data: userRes } = await supa.auth.getUser();
  const user = userRes.user;
  if (!user) return json({ error: "unauthorized" }, 401);

  const email = user.email?.toLowerCase();
  const { data: report } = await supa
    .from("palm_reports")
    .select("id, user_name, user_email, report_json")
    .eq("id", reportId)
    .maybeSingle();
  if (!report) return json({ error: "report not found" }, 404);

  const ownsByEmail = email && report.user_email && report.user_email.toLowerCase() === email;
  if (!ownsByEmail) {
    const [{ data: unlock }, { data: sub }] = await Promise.all([
      supa.from("report_unlocks").select("id").eq("report_id", reportId).eq("user_email", email ?? "").maybeSingle(),
      supa.from("user_subscriptions").select("id").eq("user_email", email ?? "").eq("status", "active").maybeSingle(),
    ]);
    if (!unlock && !sub) return json({ error: "forbidden" }, 403);
  }

  // Upsert conversation
  const { data: existing } = await supa
    .from("ai_conversations")
    .select("id")
    .eq("user_id", user.id)
    .eq("report_id", reportId)
    .maybeSingle();

  let convId = existing?.id as string | undefined;
  if (!convId) {
    const { data: created, error: cErr } = await supa
      .from("ai_conversations")
      .insert({ user_id: user.id, report_id: reportId })
      .select("id")
      .single();
    if (cErr) return json({ error: cErr.message }, 500);
    convId = created.id;
  }

  // Grant complimentary questions on first entry (idempotent per report_id)
  const { data: freeCfg } = await supa
    .from("ai_pricing_config")
    .select("value")
    .eq("key", "free_questions_per_report")
    .maybeSingle();
  const freeN = Number(freeCfg?.value ?? 3);
  await supa.rpc("grant_report_free_questions", {
    _user_id: user.id, _report_id: reportId, _n: freeN,
  });

  // Seed pre-briefed assistant message on first entry (does NOT debit quota)
  const { count: existingCount } = await supa
    .from("ai_messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", convId!);

  if ((existingCount ?? 0) === 0) {
    const seed = buildSeedMessage(
      report.user_name ?? "",
      (report.report_json ?? null) as Record<string, unknown> | null,
    );
    await supa.from("ai_messages").insert({
      conversation_id: convId!,
      role: "assistant",
      content: seed,
      model: "seed",
    });
  }

  const { data: messages } = await supa
    .from("ai_messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", convId!)
    .order("created_at", { ascending: true })
    .limit(200);

  return json({ conversationId: convId, messages: messages ?? [] });
});
