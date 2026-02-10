import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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
  const data = `${orderId}|${paymentId}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return expectedSignature === signature;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, payment_id }: VerifyPaymentRequest = await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !payment_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required payment verification fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!razorpayKeySecret) {
      return new Response(
        JSON.stringify({ success: false, error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .single();

    if (fetchError || !payment) {
      return new Response(
        JSON.stringify({ success: false, error: 'Payment record not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (payment.razorpay_order_id !== razorpay_order_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Order ID mismatch' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isValid = await verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature, razorpayKeySecret);

    if (!isValid) {
      await supabase.from('payments').update({ status: 'failed' }).eq('id', payment_id);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid payment signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Payment signature verified successfully');

    await supabase.from('payments').update({ status: 'success', razorpay_payment_id }).eq('id', payment_id);

    // Create report unlock for all plan types
    const { error: unlockError } = await supabase
      .from('report_unlocks')
      .insert({
        user_email: payment.user_email,
        report_id: payment.report_id,
        payment_id: payment.id,
      });

    if (unlockError) {
      console.error('Failed to create report unlock:', unlockError);
    } else {
      console.log('Report unlock created for:', payment.report_id);
    }

    // For premium plan, also create a subscription record
    let isSubscription = false;
    if (payment.plan_type === 'premium1499') {
      const { error: subError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_email: payment.user_email,
          plan: 'premium1499',
          payment_id: payment.id,
          status: 'active',
        }, { onConflict: 'user_email' });

      if (!subError) {
        isSubscription = true;
        console.log('Premium subscription created for:', payment.user_email);
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
