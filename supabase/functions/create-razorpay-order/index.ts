import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { emitServerEvent } from '../_shared/analytics.ts';
import { currencyForCountry, isPlanType, orderDescription, PLAN_LABELS, PLAN_PRICES, PLAN_RECEIPT_PREFIXES, PLAN_SHORT_NAMES } from '../_shared/pricing.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateOrderRequest {
  user_email?: unknown;
  report_id?: unknown;
  palmmatch_report_id?: unknown;
  plan?: unknown;
  country_code?: unknown;
  analytics_context?: {
    anonymous_id?: string;
    session_id?: string;
    environment?: string;
    page_path?: string;
  };
}

const respond = (body: object, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

const validId = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const validPalmMatchReportId = (value: unknown): value is string =>
  typeof value === 'string' && /^pm_[0-9]{10,}_[a-z0-9]{9}$/i.test(value);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return respond({ success: false, error: 'Method not allowed' }, 405);

  try {
    const body = await req.json() as CreateOrderRequest;
    const email = typeof body.user_email === 'string' ? body.user_email.trim().toLowerCase() : '';
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return respond({ success: false, error: 'Please provide a valid email address.' }, 400);
    }
    if (!isPlanType(body.plan)) return respond({ success: false, error: 'Invalid plan type' }, 400);

    const reportId = validId(body.report_id) ? body.report_id : null;
    const palmMatchReportId = validPalmMatchReportId(body.palmmatch_report_id) ? body.palmmatch_report_id : null;
    if (body.plan === 'report99' && !reportId) return respond({ success: false, error: 'A valid report_id is required.' }, 400);
    if (body.plan === 'palmmatch149' && !palmMatchReportId) return respond({ success: false, error: 'A valid palmmatch_report_id is required.' }, 400);

    const currency = currencyForCountry(body.country_code);
    const amount = PLAN_PRICES[body.plan][currency];
    const keyId = Deno.env.get('RAZORPAY_KEY_ID');
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!keyId || !keySecret || !supabaseUrl || !serviceRoleKey) {
      return respond({ success: false, error: 'Payment gateway not configured' }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const referenceId = reportId ?? palmMatchReportId ?? 'subscription';
    const notes: Record<string, string> = {
      user_email: email,
      plan: body.plan,
      plan_name: PLAN_SHORT_NAMES[body.plan],
      currency,
      country_code: String(body.country_code ?? '').slice(0, 2).toUpperCase(),
    };
    if (reportId) notes.report_id = reportId;
    if (palmMatchReportId) notes.palmmatch_report_id = palmMatchReportId;
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${keyId}:${keySecret}`)}`,
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt: `${PLAN_RECEIPT_PREFIXES[body.plan]}_${crypto.randomUUID().replaceAll('-', '').slice(0, 20)}`,
        description: orderDescription(body.plan, amount, currency),
        notes,
      }),
    });
    const razorpayOrder = await razorpayResponse.json();
    if (!razorpayResponse.ok || typeof razorpayOrder?.id !== 'string') {
      console.error('Razorpay order creation failed', razorpayResponse.status, razorpayOrder?.error?.code ?? 'unknown');
      const capabilityError = currency !== 'INR' && razorpayResponse.status === 400;
      return respond({
        success: false,
        error: capabilityError
          ? `${currency} payments are not currently available. Please select another currency or contact support.`
          : 'Failed to create payment order. Please try again.',
        code: capabilityError ? 'CURRENCY_NOT_AVAILABLE' : 'ORDER_CREATION_FAILED',
      }, capabilityError ? 422 : 502);
    }

    if (razorpayOrder.amount !== amount || razorpayOrder.currency !== currency) {
      console.error('Razorpay order mismatch', razorpayOrder.id);
      return respond({ success: false, error: 'Payment order validation failed.', code: 'ORDER_MISMATCH' }, 502);
    }

    const { data: payment, error: dbError } = await supabase.from('payments').insert({
      user_email: email,
      report_id: body.plan === 'report99' ? reportId : null,
      palmmatch_report_id: body.plan === 'palmmatch149' ? palmMatchReportId : null,
      plan_type: body.plan,
      razorpay_order_id: razorpayOrder.id,
      amount,
      currency,
      status: 'pending',
    }).select('id').single();

    if (dbError || !payment) {
      console.error('Payment record insert failed', dbError?.code ?? 'unknown');
      return respond({ success: false, error: 'Failed to save payment record. Please try again.' }, 500);
    }

    await emitServerEvent(supabase, 'order_created', {
      dedupeKey: `order:${razorpayOrder.id}`,
      userEmail: email,
      anonymousId: body.analytics_context?.anonymous_id,
      sessionId: body.analytics_context?.session_id,
      environment: body.analytics_context?.environment,
      pagePath: body.analytics_context?.page_path,
    }, {
      payment_id: payment.id,
      provider_order_id: razorpayOrder.id,
      plan_id: body.plan,
      amount,
      currency,
      report_id: referenceId,
      payment_provider: 'razorpay',
    });

    return respond({
      success: true,
      order_id: razorpayOrder.id,
      amount,
      currency,
      payment_id: payment.id,
      key_id: keyId,
      description: PLAN_LABELS[body.plan],
    });
  } catch (error) {
    console.error('Error in create-razorpay-order', error instanceof Error ? error.message : 'unknown');
    return respond({ success: false, error: 'Internal server error' }, 500);
  }
});