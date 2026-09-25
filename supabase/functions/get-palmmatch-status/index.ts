import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const report_id = typeof body.report_id === 'string' ? body.report_id : '';
    const rawEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const email = emailRegex.test(rawEmail) ? rawEmail : '';
    const includeReport = body.include_report === true;

    if (!report_id || !/^pm_[0-9]{10,}_[a-z0-9]{9}$/i.test(report_id)) {
      return json({ success: true, isUnlocked: false, hasSubscription: false, report: null });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Active subscription grants access to everything (including PalmMatch)
    let hasSubscription = false;
    if (email) {
      const now = new Date().toISOString();
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_email', email)
        .eq('status', 'active')
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .maybeSingle();
      hasSubscription = !!subscription;
    }

    // 2. Load the report (needed for unlock state and, when authorised, cross-device restore)
    const { data: report } = await supabase
      .from('palmmatch_reports')
      .select('report_id, email, is_unlocked, language, reading, person1_name, person2_name')
      .eq('report_id', report_id)
      .maybeSingle();

    const isUnlocked = hasSubscription || (report?.is_unlocked ?? false);

    // Reading content is returned only to the owner's email (link carries it) or to
    // anyone with an active subscription. Everyone else gets status only.
    let payload: Record<string, unknown> | null = null;
    let sharedPreview: Record<string, unknown> | null = null;
    if (includeReport && report) {
      const ownerEmail = typeof report.email === 'string' ? report.email.trim().toLowerCase() : '';
      const isOwner = !!email && email === ownerEmail;
      if (isOwner || hasSubscription) {
        payload = {
          reading: report.reading,
          language: report.language === 'hinglish' ? 'hinglish' : 'english',
          email: ownerEmail,
        };
      } else {
        // Safe, free-tier preview for people opening a shared link. No email, no paid sections.
        const r = (report.reading ?? {}) as Record<string, unknown>;
        sharedPreview = {
          person1Name: r.person1Name ?? report.person1_name,
          person2Name: r.person2Name ?? report.person2_name,
          relationshipType: r.relationshipType ?? '',
          overallScore: typeof r.overallScore === 'number' ? r.overallScore : null,
          compatibilityVerdict: r.compatibilityVerdict ?? '',
          overallNarrative: r.overallNarrative ?? '',
          language: report.language === 'hinglish' ? 'hinglish' : 'english',
        };
      }
    }

    return json({
      success: true,
      isUnlocked: payload ? isUnlocked : false,
      hasSubscription,
      report: payload,
      shared_preview: sharedPreview,
      isShared: !!sharedPreview,
      exists: !!report,
    });
  } catch (err) {
    console.error('get-palmmatch-status error:', err);
    return json({ success: false, error: 'Internal server error' }, 500);
  }
});
