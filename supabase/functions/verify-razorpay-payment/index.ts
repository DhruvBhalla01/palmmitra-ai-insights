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
  const data = `${orderId}|${paymentId}`;
  
  // Use Web Crypto API for HMAC-SHA256
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return expectedSignature === signature;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      payment_id 
    }: VerifyPaymentRequest = await req.json();

    // Validate input
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !payment_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required payment verification fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!razorpayKeySecret) {
      console.error('Missing Razorpay secret');
      return new Response(
        JSON.stringify({ success: false, error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get payment record
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .single();

    if (fetchError || !payment) {
      console.error('Payment not found:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'Payment record not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the order ID matches
    if (payment.razorpay_order_id !== razorpay_order_id) {
      console.error('Order ID mismatch');
      return new Response(
        JSON.stringify({ success: false, error: 'Order ID mismatch' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify signature
    const isValid = await verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpayKeySecret
    );

    if (!isValid) {
      console.error('Invalid payment signature');
      
      // Update payment status to failed
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', payment_id);

      return new Response(
        JSON.stringify({ success: false, error: 'Invalid payment signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Payment signature verified successfully');

    // Update payment status to success
    const { error: updateError } = await supabase
      .from('payments')
      .update({ 
        status: 'success',
        razorpay_payment_id
      })
      .eq('id', payment_id);

    if (updateError) {
      console.error('Failed to update payment:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update payment status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let isSubscription = false;

    // Create unlock based on plan type
    if (payment.plan_type === 'report99') {
      // Create report unlock
      const { error: unlockError } = await supabase
        .from('report_unlocks')
        .insert({
          user_email: payment.user_email,
          report_id: payment.report_id,
          payment_id: payment.id,
        });

      if (unlockError) {
        console.error('Failed to create report unlock:', unlockError);
        // Don't fail - payment was successful
      } else {
        console.log('Report unlock created for:', payment.report_id);
      }
    } else if (payment.plan_type === 'unlimited999') {
      // Create or update subscription
      const { error: subError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_email: payment.user_email,
          plan: 'unlimited999',
          payment_id: payment.id,
          status: 'active',
        }, {
          onConflict: 'user_email'
        });

      if (subError) {
        console.error('Failed to create subscription:', subError);
        // Don't fail - payment was successful
      } else {
        console.log('Subscription created for:', payment.user_email);
        isSubscription = true;
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
