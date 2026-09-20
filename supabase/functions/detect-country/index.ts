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

function readClientIp(req: Request): string | null {
  const candidate = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')?.trim();
  if (!candidate || candidate.length > 45 || !/^[0-9a-fA-F:.]+$/.test(candidate)) return null;
  return candidate;
}

async function detectFromIp(req: Request): Promise<string | null> {
  const ip = readClientIp(req);
  if (!ip) return null;

  try {
    const response = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/country/`, {
      signal: AbortSignal.timeout(1800),
      headers: { 'Accept': 'text/plain' },
    });
    if (!response.ok) return null;
    const code = (await response.text()).trim().toUpperCase();
    return SUPPORTED_COUNTRIES.has(code) ? code : null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const countryCode = readCountry(req) ?? await detectFromIp(req);

  return new Response(JSON.stringify({ countryCode }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'private, max-age=3600',
    },
  });
});