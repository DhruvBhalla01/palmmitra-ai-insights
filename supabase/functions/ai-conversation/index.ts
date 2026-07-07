import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (b: object, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

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

  // Verify the user is entitled to this report:
  // owns the row by email OR has an unlock/subscription/active claim.
  const email = user.email?.toLowerCase();
  const { data: report } = await supa
    .from("palm_reports")
    .select("id, user_email")
    .eq("id", reportId)
    .maybeSingle();
  if (!report) return json({ error: "report not found" }, 404);

  const ownsByEmail = email && report.user_email && report.user_email.toLowerCase() === email;
  if (!ownsByEmail) {
    // Fall back: allow if there's an existing unlock or active subscription tied to this email.
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

  const { data: messages } = await supa
    .from("ai_messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", convId!)
    .order("created_at", { ascending: true })
    .limit(200);

  return json({ conversationId: convId, messages: messages ?? [] });
});
