import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyPaymentRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  payment_id: string;
}

async function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC', cryptoKey, encoder.encode(`${orderId}|${paymentId}`)
  );
  const expected = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return expected === signature;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      payment_id,
    }: VerifyPaymentRequest = await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !payment_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required payment verification fields' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!razorpayKeySecret) {
      return new Response(
        JSON.stringify({ success: false, error: 'Payment gateway not configured' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .single();

    if (fetchError || !payment) {
      return new Response(
        JSON.stringify({ success: false, error: 'Payment record not found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (payment.razorpay_order_id !== razorpay_order_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Order ID mismatch' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isValid = await verifySignature(
      razorpay_order_id, razorpay_payment_id, razorpay_signature, razorpayKeySecret
    );

    if (!isValid) {
      await supabase.from('payments').update({ status: 'failed' }).eq('id', payment_id);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid payment signature' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await supabase.from('payments')
      .update({ status: 'success', razorpay_payment_id })
      .eq('id', payment_id);

    let isSubscription = false;

    if (payment.plan_type === 'report99') {
      const { error: unlockError } = await supabase
        .from('report_unlocks')
        .insert({
          user_email: payment.user_email,
          report_id: payment.report_id,
          payment_id: payment.id,
        });
      if (unlockError) console.error('Failed to create report unlock:', unlockError);
      else console.log('Report unlock created for:', payment.report_id);

    } else if (payment.plan_type === 'palmmatch149') {
      if (!payment.report_id) {
        console.error('palmmatch149 payment missing report_id');
      } else {
        const { error: pmError } = await supabase
          .from('palmmatch_reports')
          .update({ is_unlocked: true, payment_id: payment.id })
          .eq('report_id', payment.report_id);
        if (pmError) console.error('Failed to unlock palmmatch report:', pmError);
        else console.log('PalmMatch report unlocked:', payment.report_id);
      }

    } else if (payment.plan_type === 'monthly299' || payment.plan_type === 'unlimited999') {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const { error: subError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_email: payment.user_email,
          plan: payment.plan_type,
          payment_id: payment.id,
          status: 'active',
          expires_at: expiresAt,
        }, { onConflict: 'user_email' });

      if (subError) console.error('Failed to create subscription:', subError);
      else {
        console.log(`Subscription (${payment.plan_type}) active until ${expiresAt} for:`, payment.user_email);
        isSubscription = true;
      }
    }

    // Increment coupon usage after confirmed successful payment
    if (payment.coupon_code) {
      const { data: coupon } = await supabase
        .from('referral_codes')
        .select('uses_count')
        .eq('code', payment.coupon_code)
        .single();

      if (coupon) {
        await supabase
          .from('referral_codes')
          .update({ uses_count: coupon.uses_count + 1 })
          .eq('code', payment.coupon_code);
        console.log(`Coupon ${payment.coupon_code} uses incremented to ${coupon.uses_count + 1}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        unlocked: true,
        subscription: isSubscription,
        plan: payment.plan_type,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-razorpay-payment:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
