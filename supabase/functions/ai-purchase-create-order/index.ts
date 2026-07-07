import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { AI_PLAN_AMOUNTS_PAISE, AI_LABELS } from "../_shared/ai-pricing.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (b: object, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  const auth = req.headers.get("Authorization");
  if (!auth) return json({ error: "unauthorized" }, 401);

  let body: { plan?: string };
  try { body = await req.json(); } catch { return json({ error: "invalid json" }, 400); }
  const plan = body.plan?.trim() ?? "";
  if (!AI_PLAN_AMOUNTS_PAISE[plan]) return json({ success: false, error: "invalid plan" }, 400);

  const kid = Deno.env.get("RAZORPAY_KEY_ID");
  const secret = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!kid || !secret) return json({ success: false, error: "payment not configured" }, 500);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { global: { headers: { Authorization: auth } } },
  );
  const { data: userRes } = await admin.auth.getUser();
  const user = userRes.user;
  if (!user?.email) return json({ error: "unauthorized" }, 401);

  const amount = AI_PLAN_AMOUNTS_PAISE[plan];
  const rz = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${btoa(`${kid}:${secret}`)}` },
    body: JSON.stringify({
      amount, currency: "INR", receipt: `ai_${Date.now()}`,
      notes: { user_email: user.email, plan, user_id: user.id },
    }),
  }).then(r => r.json());

  if (!rz?.id) {
    console.error("razorpay err", rz);
    return json({ success: false, error: "failed to create order" }, 502);
  }

  const { data: payment, error: dbErr } = await admin.from("payments").insert({
    user_email: user.email,
    plan_type: plan,
    razorpay_order_id: rz.id,
    amount,
    status: "pending",
  }).select().single();

  if (dbErr) {
    console.error("db err", dbErr);
    return json({ success: false, error: "db error" }, 500);
  }

  return json({
    success: true,
    order_id: rz.id,
    amount,
    currency: "INR",
    payment_id: payment.id,
    key_id: kid,
    description: AI_LABELS[plan] ?? "PalmMitra AI",
  });
});
