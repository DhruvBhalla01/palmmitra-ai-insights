import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type PlanType = 'report99' | 'palmmatch149' | 'monthly299' | 'unlimited999';

interface CreateOrderRequest {
  user_email: string;
  report_id?: string;
  palmmatch_report_id?: string;
  plan: PlanType;
}

// Amounts in paise (INR). Keep in sync with src/config/pricing.ts
// PalmMitra Insight ₹149 (launch) · PalmMatch ₹999 · PalmMitra Elite ₹4,999
const PLAN_AMOUNTS: Record<PlanType, number> = {
  report99:     14900,   // PalmMitra Insight — ₹149 launch price
  palmmatch149: 99900,   // PalmMatch         — ₹999
  monthly299:   14900,   // Legacy monthly    — kept in sync with Insight
  unlimited999: 499900,  // PalmMitra Elite   — ₹4,999
};

const ok = (body: object) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body: CreateOrderRequest = await req.json();
    const { user_email, report_id, palmmatch_report_id, plan } = body;

    if (!user_email || !plan) {
      return ok({ success: false, error: 'Missing required fields: user_email and plan' });
    }

    const validPlans: PlanType[] = ['report99', 'palmmatch149', 'monthly299', 'unlimited999'];
    if (!validPlans.includes(plan)) {
      return ok({ success: false, error: 'Invalid plan type' });
    }

    if (plan === 'report99' && !report_id) {
      return ok({ success: false, error: 'report_id is required for report99 plan' });
    }

    if (plan === 'palmmatch149' && !palmmatch_report_id) {
      return ok({ success: false, error: 'palmmatch_report_id is required for palmmatch149 plan' });
    }

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!razorpayKeyId || !razorpayKeySecret) {
      return ok({ success: false, error: 'Payment gateway not configured' });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const finalAmount = PLAN_AMOUNTS[plan];

    const planLabels: Record<PlanType, string> = {
      report99:     'PalmMitra Insight — Full Palm Reading',
      palmmatch149: 'PalmMatch — Compatibility Report',
      monthly299:   'PalmMitra Monthly Plan',
      unlimited999: 'PalmMitra Elite — Lifetime Access',
    };

    const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
      },
      body: JSON.stringify({
        amount: finalAmount,
        currency: 'INR',
        receipt: `palm_${Date.now()}`,
        notes: { user_email, plan, report_id: report_id || palmmatch_report_id || 'subscription' },
      }),
    }).then(r => r.json());

    if (!razorpayRes.id) {
      console.error('Razorpay order creation failed:', razorpayRes);
      return ok({ success: false, error: 'Failed to create payment order. Please try again.' });
    }

    const { data: payment, error: dbError } = await supabase
      .from('payments')
      .insert({
        user_email,
        report_id: plan === 'report99' ? report_id : null,
        palmmatch_report_id: plan === 'palmmatch149' ? palmmatch_report_id : null,
        plan_type: plan,
        razorpay_order_id: razorpayRes.id,
        amount: finalAmount,
        status: 'pending',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return ok({ success: false, error: 'Failed to save payment record. Please try again.' });
    }

    return ok({
      success: true,
      order_id: razorpayRes.id,
      amount: finalAmount,
      currency: 'INR',
      payment_id: payment.id,
      key_id: razorpayKeyId,
      description: planLabels[plan],
    });

  } catch (error) {
    console.error('Error in create-razorpay-order:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
