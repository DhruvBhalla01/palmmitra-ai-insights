import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { report_id, email } = await req.json();

    if (!report_id) {
      return new Response(
        JSON.stringify({ success: true, isUnlocked: false, hasSubscription: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Active subscription grants access to everything (including PalmMatch)
    if (email) {
      const now = new Date().toISOString();
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_email', email)
        .eq('status', 'active')
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .maybeSingle();

      if (subscription) {
        return new Response(
          JSON.stringify({ success: true, isUnlocked: true, hasSubscription: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 2. Check if this specific palmmatch report was individually unlocked
    const { data: report } = await supabase
      .from('palmmatch_reports')
      .select('is_unlocked')
      .eq('report_id', report_id)
      .maybeSingle();

    const isUnlocked = report?.is_unlocked ?? false;

    return new Response(
      JSON.stringify({ success: true, isUnlocked, hasSubscription: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('get-palmmatch-status error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
