import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type PlanType = 'report99' | 'palmmatch149' | 'monthly299' | 'unlimited999';

interface CreateOrderRequest {
  user_email: string;
  report_id?: string;
  plan: PlanType;
  coupon_code?: string;
}

const PLAN_AMOUNTS: Record<PlanType, number> = {
  report99:     9900,  // ₹99 in paise
  palmmatch149: 14900, // ₹149 in paise
  monthly299:  29900,  // ₹299 in paise
  unlimited999: 99900, // ₹999 in paise (legacy)
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_email, report_id, plan, coupon_code }: CreateOrderRequest = await req.json();

    if (!user_email || !plan) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: user_email and plan' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validPlans: PlanType[] = ['report99', 'palmmatch149', 'monthly299', 'unlimited999'];
    if (!validPlans.includes(plan)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid plan type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if ((plan === 'report99' || plan === 'palmmatch149') && !report_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'report_id is required for this plan' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(
        JSON.stringify({ success: false, error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Coupon validation
    let discountAmount = 0;
    let appliedCouponCode: string | null = null;

    if (coupon_code) {
      const code = coupon_code.trim().toUpperCase();

      const { data: coupon, error: couponError } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('code', code)
        .maybeSingle();

      if (couponError || !coupon) {
        return new Response(
          JSON.stringify({ success: false, coupon_error: 'Invalid coupon code. Please check and try again.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        return new Response(
          JSON.stringify({ success: false, coupon_error: 'This coupon has expired.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
        return new Response(
          JSON.stringify({ success: false, coupon_error: 'This coupon has reached its usage limit.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const baseAmount = PLAN_AMOUNTS[plan];
      if (coupon.discount_type === 'flat') {
        discountAmount = Math.min(coupon.discount_value, baseAmount - 100); // keep ≥ ₹1
      } else if (coupon.discount_type === 'percent') {
        discountAmount = Math.floor(baseAmount * coupon.discount_value / 100);
        discountAmount = Math.min(discountAmount, baseAmount - 100);
      }

      appliedCouponCode = code;
      console.log(`Coupon ${code} applied: discount ${discountAmount} paise`);
    }

    const baseAmount = PLAN_AMOUNTS[plan];
    const finalAmount = baseAmount - discountAmount;

    const planLabels: Record<PlanType, string> = {
      report99:     'Detailed Palm Reading Report',
      palmmatch149: 'PalmMatch Compatibility Report',
      monthly299:   'PalmMitra Monthly Plan',
      unlimited999: 'Unlimited Palm Readings - Lifetime',
    };

    const razorpayOrder = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
      },
      body: JSON.stringify({
        amount: finalAmount,
        currency: 'INR',
        receipt: `palm_${Date.now()}`,
        notes: { user_email, plan, report_id: report_id || 'subscription' },
      }),
    }).then(r => r.json());

    if (!razorpayOrder.id) {
      console.error('Razorpay order creation failed:', razorpayOrder);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create payment order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: payment, error: dbError } = await supabase
      .from('payments')
      .insert({
        user_email,
        report_id: report_id || null,
        plan_type: plan,
        razorpay_order_id: razorpayOrder.id,
        amount: finalAmount,
        status: 'pending',
        coupon_code: appliedCouponCode,
        discount_amount: discountAmount,
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

    return new Response(
      JSON.stringify({
        success: true,
        order_id: razorpayOrder.id,
        amount: finalAmount,
        original_amount: baseAmount,
        discount_amount: discountAmount,
        coupon_applied: appliedCouponCode !== null,
        currency: 'INR',
        payment_id: payment.id,
        key_id: razorpayKeyId,
        description: planLabels[plan],
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
