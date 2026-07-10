import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import {
  AI_MODEL, AI_MAX_MESSAGE_CHARS, AI_HISTORY_WINDOW, AI_RATE_LIMIT_PER_MIN,
} from "../_shared/ai-pricing.ts";
import { verifyReportOwner } from "../_shared/ai-owner.ts";
import { buildReportContext, buildSystemPrompt } from "../_shared/ai-context.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (b: object, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

interface DebitRow { source: string; ok: boolean }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  const openaiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!openaiKey) return json({ error: "AI not configured" }, 500);

  let body: { reportId?: string; userEmail?: string; message?: string };
  try { body = await req.json(); } catch { return json({ error: "invalid json" }, 400); }

  const message = (body.message ?? "").trim();
  if (!message) return json({ error: "empty message" }, 400);
  if (message.length > AI_MAX_MESSAGE_CHARS) return json({ error: "message too long" }, 400);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const owner = await verifyReportOwner(admin, body.reportId, body.userEmail);
  if (!owner.ok) return json({ error: owner.error }, owner.status ?? 400);
  const report = owner.report!;
  const reportId = report.id;

  // Rate limit: per-report, last 60s
  const cutoff = new Date(Date.now() - 60_000).toISOString();
  const identifier = `report:${reportId}`;
  const { count } = await admin
    .from("api_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("identifier", identifier)
    .eq("endpoint", "ai-chat")
    .gte("created_at", cutoff);
  if ((count ?? 0) >= AI_RATE_LIMIT_PER_MIN) return json({ error: "rate_limited" }, 429);
  await admin.from("api_rate_limits").insert({ identifier, endpoint: "ai-chat" });

  // Load/create conversation (keyed by report_id, no user_id)
  const { data: convRow } = await admin
    .from("ai_conversations").select("id").eq("report_id", reportId).is("user_id", null).maybeSingle();
  let convId = convRow?.id as string | undefined;
  if (!convId) {
    const { data: cr } = await admin
      .from("ai_conversations").insert({ report_id: reportId }).select("id").single();
    convId = cr!.id;
  }

  // History window
  const { data: history } = await admin
    .from("ai_messages")
    .select("role, content")
    .eq("conversation_id", convId!)
    .order("created_at", { ascending: false })
    .limit(AI_HISTORY_WINDOW);
  const historyAsc = (history ?? []).reverse();

  // Persist user message
  const { data: userMsgRow } = await admin
    .from("ai_messages")
    .insert({ conversation_id: convId!, role: "user", content: message })
    .select("id").single();

  // Debit ONE question atomically (by report)
  const { data: debitRows, error: debitErr } = await admin.rpc("debit_ai_question_by_report", { _report_id: reportId });
  const debit = (debitRows as DebitRow[] | null)?.[0];
  if (debitErr || !debit?.ok) return json({ error: "quota_exhausted" }, 402);
  const source = debit.source;

  // Build structured Report Context (never send raw report_json to the model)
  const ctx = buildReportContext(
    report.user_name ?? null,
    report.user_age ?? null,
    null,
    report.report_json,
  );
  const systemPrompt = buildSystemPrompt(ctx);
  const messages: Array<{ role: string; content: string }> = [
    { role: "system", content: systemPrompt },
    ...historyAsc.map(m => ({
      role: m.role,
      content: m.role === "user" ? `<user_message>${m.content}</user_message>` : m.content,
    })),
    { role: "user", content: `<user_message>${message}</user_message>` },
  ];

  // Call OpenAI streaming
  let openaiRes: Response;
  try {
    openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: AI_MODEL,
        messages,
        stream: true,
        temperature: 0.6,
        top_p: 0.9,
        presence_penalty: 0.3,
        frequency_penalty: 0.2,
        max_tokens: 1000,
      }),
    });
  } catch (e) {
    await admin.rpc("refund_ai_question_by_report", { _report_id: reportId, _source: source });
    console.error("openai error", e);
    return json({ error: "ai_unavailable" }, 502);
  }

  if (!openaiRes.ok || !openaiRes.body) {
    await admin.rpc("refund_ai_question_by_report", { _report_id: reportId, _source: source });
    const t = await openaiRes.text().catch(() => "");
    console.error("openai non-ok", openaiRes.status, t);
    return json({ error: "ai_unavailable" }, 502);
  }

  // Stream to client + accumulate for DB write
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = openaiRes.body.getReader();
  let assistant = "";

  const stream = new ReadableStream({
    async start(controller) {
      let buf = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const parts = buf.split("\n");
          buf = parts.pop() ?? "";
          for (const line of parts) {
            const l = line.trim();
            if (!l.startsWith("data:")) continue;
            const payload = l.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const j = JSON.parse(payload);
              const delta = j.choices?.[0]?.delta?.content;
              if (delta) {
                assistant += delta;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
              }
            } catch { /* skip */ }
          }
        }
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      } catch (e) {
        console.error("stream error", e);
      } finally {
        controller.close();
        try {
          if (assistant.trim()) {
            const inTok = Math.ceil(systemPrompt.length / 4) + Math.ceil(message.length / 4);
            const outTok = Math.ceil(assistant.length / 4);
            const { data: aRow } = await admin.from("ai_messages").insert({
              conversation_id: convId!,
              role: "assistant",
              content: assistant,
              input_tokens: inTok,
              output_tokens: outTok,
              model: AI_MODEL,
            }).select("id").single();
            await admin.from("ai_conversations").update({
              last_message_at: new Date().toISOString(),
              message_count: (historyAsc.length + 2),
            }).eq("id", convId!);
            await admin.from("ai_usage_events").insert({
              report_id: reportId,
              conversation_id: convId!,
              message_id: aRow?.id ?? userMsgRow?.id,
              source,
              input_tokens: inTok,
              output_tokens: outTok,
            });
          } else {
            await admin.rpc("refund_ai_question_by_report", { _report_id: reportId, _source: source });
          }
        } catch (e) {
          console.error("persist error", e);
        }
      }
    },
    cancel() { try { reader.cancel(); } catch { /* noop */ } },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
});
