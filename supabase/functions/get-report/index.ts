import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { report_id, user_email } = await req.json().catch(() => ({}));

    if (!report_id || typeof report_id !== 'string' || !uuidRegex.test(report_id)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid report ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch minimal (non-sensitive) fields first — needed for preview UI.
    const { data: report, error } = await supabase
      .from('palm_reports')
      .select('id, user_name, user_age, user_email, reading_type, report_json, created_at, validation_confidence, validation_quality')
      .eq('id', report_id)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch report' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!report) {
      return new Response(
        JSON.stringify({ success: false, error: 'Report not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Access control: full report_json is only returned when the caller proves ownership
    // via a matching email that has either (a) an active subscription, or (b) a report_unlock row
    // for this report, or (c) matches the email attached to the report at generation time.
    // Anonymous callers (or wrong email) get preview metadata only — never the paid content.
    let isUnlocked = false;
    const providedEmail =
      typeof user_email === 'string' && emailRegex.test(user_email.trim().toLowerCase())
        ? user_email.trim().toLowerCase()
        : null;

    if (providedEmail) {
      const reportOwnerEmail =
        typeof report.user_email === 'string' ? report.user_email.trim().toLowerCase() : null;

      // The email attached to the report at generation grants read access to its owner.
      // Payment/unlock is enforced separately in the client via get-unlock-status.
      if (reportOwnerEmail && reportOwnerEmail === providedEmail) {
        isUnlocked = true;
      } else {
        const now = new Date().toISOString();
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('id')
          .eq('user_email', providedEmail)
          .eq('status', 'active')
          .or(`expires_at.is.null,expires_at.gt.${now}`)
          .maybeSingle();

        if (subscription) {
          isUnlocked = true;
        } else {
          const { data: unlock } = await supabase
            .from('report_unlocks')
            .select('id')
            .eq('user_email', providedEmail)
            .eq('report_id', report_id)
            .maybeSingle();
          if (unlock) isUnlocked = true;
        }
      }
    }

    // Strip PII and paid content for unauthenticated callers.
    const safeReport = {
      id: report.id,
      user_name: report.user_name,
      user_age: report.user_age,
      reading_type: report.reading_type,
      created_at: report.created_at,
      validation_confidence: report.validation_confidence,
      validation_quality: report.validation_quality,
      report_json: isUnlocked ? report.report_json : null,
    };

    return new Response(
      JSON.stringify({ success: true, report: safeReport, isUnlocked }),
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
