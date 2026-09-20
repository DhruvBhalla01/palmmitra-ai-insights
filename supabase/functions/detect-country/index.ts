import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const SUPPORTED_COUNTRIES = new Set(['IN', 'US', 'GB', 'AE', 'CA', 'AU', 'SG']);

function readCountry(req: Request): string | null {
  const candidates = [
    req.headers.get('cf-ipcountry'),
    req.headers.get('x-vercel-ip-country'),
    req.headers.get('x-country-code'),
  ];

  for (const candidate of candidates) {
    const code = candidate?.trim().toUpperCase();
    if (code && SUPPORTED_COUNTRIES.has(code)) return code;
  }

  return null;
}

Deno.serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ countryCode: readCountry(req) }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'private, max-age=3600',
    },
  });
});