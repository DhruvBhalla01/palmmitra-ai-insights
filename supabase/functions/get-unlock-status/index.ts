import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_email, report_id } = await req.json();

    if (!user_email) {
      console.log('No user email provided, returning unlocked: false');
      return new Response(
        JSON.stringify({ 
          success: true, 
          isUnlocked: false, 
          hasSubscription: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Checking unlock status for:', user_email, 'report:', report_id);

    // Use service role to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check for active subscription first
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('id, plan, status')
      .eq('user_email', user_email)
      .eq('status', 'active')
      .maybeSingle();

    if (subError) {
      console.error('Error checking subscription:', subError);
    }

    if (subscription) {
      console.log('Active subscription found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          isUnlocked: true, 
          hasSubscription: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for specific report unlock
    if (report_id) {
      const { data: unlock, error: unlockError } = await supabase
        .from('report_unlocks')
        .select('id')
        .eq('user_email', user_email)
        .eq('report_id', report_id)
        .maybeSingle();

      if (unlockError) {
        console.error('Error checking unlock:', unlockError);
      }

      if (unlock) {
        console.log('Report unlock found');
        return new Response(
          JSON.stringify({ 
            success: true, 
            isUnlocked: true, 
            hasSubscription: false 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('No unlock found');
    return new Response(
      JSON.stringify({ 
        success: true, 
        isUnlocked: false, 
        hasSubscription: false 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
