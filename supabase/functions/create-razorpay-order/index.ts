import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

type PlanType = 'basic299' | 'standard699' | 'premium1499';

const PLAN_AMOUNTS: Record<PlanType, number> = {
  basic299: 29900,      // ₹299 in paise
  standard699: 69900,   // ₹699 in paise
  premium1499: 149900,  // ₹1499 in paise
};

interface CreateOrderRequest {
  user_email: string;
  report_id?: string;
  plan: PlanType;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_email, report_id, plan }: CreateOrderRequest = await req.json();

    if (!user_email || !plan) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: user_email and plan' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!PLAN_AMOUNTS[plan]) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid plan type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!report_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'report_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Missing Razorpay credentials');
      return new Response(
        JSON.stringify({ success: false, error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const amount = PLAN_AMOUNTS[plan];
    const currency = 'INR';

    const razorpayOrderPayload = {
      amount,
      currency,
      receipt: `palm_${Date.now()}`,
      notes: {
        user_email,
        plan,
        report_id,
      },
    };

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
      },
      body: JSON.stringify(razorpayOrderPayload),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('Razorpay order creation failed:', errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create payment order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const razorpayOrder = await razorpayResponse.json();
    console.log('Razorpay order created:', razorpayOrder.id);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: payment, error: dbError } = await supabase
      .from('payments')
      .insert({
        user_email,
        report_id,
        plan_type: plan,
        razorpay_order_id: razorpayOrder.id,
        amount,
        status: 'pending',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to save payment record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Payment record created:', payment.id);

    return new Response(
      JSON.stringify({
        success: true,
        order_id: razorpayOrder.id,
        amount,
        currency,
        payment_id: payment.id,
        key_id: razorpayKeyId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-razorpay-order:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
