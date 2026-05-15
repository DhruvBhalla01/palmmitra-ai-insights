import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// No CORS headers — this endpoint is called by Razorpay servers, not browsers.
// Do NOT add Access-Control-Allow-Origin here.

async function verifyWebhookSignature(rawBody: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
  const expected = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return expected === signature;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
  if (!webhookSecret) {
    console.error('RAZORPAY_WEBHOOK_SECRET not configured');
    return new Response('Webhook not configured', { status: 500 });
  }

  const signature = req.headers.get('x-razorpay-signature');
  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  const rawBody = await req.text();

  const isValid = await verifyWebhookSignature(rawBody, signature, webhookSecret);
  if (!isValid) {
    console.error('Invalid webhook signature');
    return new Response('Invalid signature', { status: 400 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const eventType = event.event as string;
  console.log('Razorpay webhook event:', eventType);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Extract payment entity from payload
  const payload = event.payload as Record<string, unknown> | undefined;
  const paymentEntity = (payload?.payment as Record<string, unknown>)?.entity as Record<string, unknown> | undefined;

  if (!paymentEntity) {
    console.log('No payment entity in payload, skipping');
    return new Response('ok', { status: 200 });
  }

  const razorpayOrderId = paymentEntity.order_id as string;
  const razorpayPaymentId = paymentEntity.id as string;

  if (!razorpayOrderId) {
    console.log('No order_id in payment entity, skipping');
    return new Response('ok', { status: 200 });
  }

  // Find matching payment record
  const { data: payment, error: fetchError } = await supabase
    .from('payments')
    .select('*')
    .eq('razorpay_order_id', razorpayOrderId)
    .maybeSingle();

  if (fetchError || !payment) {
    console.error('Payment not found for order:', razorpayOrderId);
    return new Response('ok', { status: 200 }); // 200 so Razorpay stops retrying
  }

  if (eventType === 'payment.captured') {
    // Idempotency: skip if already processed
    if (payment.status === 'success') {
      console.log('Payment already processed, skipping:', razorpayOrderId);
      return new Response('ok', { status: 200 });
    }

    // Mark payment success
    await supabase
      .from('payments')
      .update({ status: 'success', razorpay_payment_id: razorpayPaymentId })
      .eq('id', payment.id);

    // Run unlock logic based on plan
    if (payment.plan_type === 'report99') {
      const { error } = await supabase.from('report_unlocks').insert({
        user_email: payment.user_email,
        report_id: payment.report_id,
        payment_id: payment.id,
      });
      if (error) console.error('Webhook: failed to create report unlock:', error);
      else console.log('Webhook: report unlocked via webhook:', payment.report_id);

    } else if (payment.plan_type === 'palmmatch149') {
      if (payment.palmmatch_report_id) {
        const { error } = await supabase
          .from('palmmatch_reports')
          .update({ is_unlocked: true, payment_id: payment.id })
          .eq('report_id', payment.palmmatch_report_id);
        if (error) console.error('Webhook: failed to unlock palmmatch:', error);
        else console.log('Webhook: palmmatch report unlocked:', payment.palmmatch_report_id);
      }

    } else if (payment.plan_type === 'monthly299' || payment.plan_type === 'unlimited999') {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase.from('user_subscriptions').upsert({
        user_email: payment.user_email,
        plan: payment.plan_type,
        payment_id: payment.id,
        status: 'active',
        expires_at: expiresAt,
      }, { onConflict: 'user_email' });
      if (error) console.error('Webhook: failed to create subscription:', error);
      else console.log('Webhook: subscription created, expires:', expiresAt);
    }

    // Increment coupon usage if applicable
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
      }
    }

  } else if (eventType === 'payment.failed') {
    if (payment.status !== 'success') {
      await supabase.from('payments').update({ status: 'failed' }).eq('id', payment.id);
      console.log('Webhook: payment marked failed:', razorpayOrderId);
    }
  }

  return new Response('ok', { status: 200 });
});
