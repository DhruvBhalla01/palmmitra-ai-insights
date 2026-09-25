import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { captureAiGeneration, type AiCaptureContext } from "../_shared/posthog-ai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PalmMatchRequest {
  image1Url: string;
  image2Url: string;
  person1: { name: string; age: string };
  person2: { name: string; age: string };
  relationshipType: string;
  email: string;
  language?: "english" | "hinglish";
}

type PalmMatchLanguage = "english" | "hinglish";

const validatePalmImage = async (imageUrl: string, apiKey: string, context: AiCaptureContext): Promise<{ is_palm: boolean; confidence: number }> => {
  const startedAt = Date.now();
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: `You are PalmMitra AI Validator. Verify if an image shows a clear human palm. Return ONLY JSON, no markdown.`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Return: {"is_palm": true/false, "confidence": 0-100, "quality": "good"|"medium"|"poor", "reason": "brief", "next_step": "analyze"|"reupload"}` },
            { type: "image_url", image_url: { url: imageUrl, detail: "high" } },
          ],
        },
      ],
      max_tokens: 300,
      temperature: 0.2,
    }),
  });

  if (!response.ok) throw new Error("Failed to validate image");
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  await captureAiGeneration({
    context,
    spanName: "validate_palmmatch_image",
    model: "gpt-4.1",
    input: [{ role: "user", content: [{ type: "image_url", image_url: { url: imageUrl } }] }],
    output: content,
    latencyMs: Date.now() - startedAt,
  });
  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    console.error("validatePalmImage JSON parse error:", cleaned.slice(0, 200));
    return { is_palm: false, confidence: 0, quality: "poor", reason: "parse_error" };
  }
};

const HINGLISH_MARKERS = /\b(aap|aapka|aapki|aapke|hai|hain|ka|ki|ke|aur|mein|yeh|jo|liye|saath|apne|karta|karti|hoga|hogi|rahe|wali|wala|dono|rishta|bond|samajh|baat)\b/gi;

export const isHinglishCompatibilityReading = (reading: unknown): boolean => {
  const sample = JSON.stringify(reading).toLowerCase();
  const markerCount = (sample.match(HINGLISH_MARKERS) ?? []).length;
  const hasDevanagari = /[\u0900-\u097F]/.test(sample);
  return markerCount >= 10 && !hasDevanagari;
};

const isValidCompatibilityReading = (reading: unknown): reading is Record<string, unknown> => {
  if (!reading || typeof reading !== "object" || Array.isArray(reading)) return false;
  const value = reading as Record<string, unknown>;
  const dimensions = ["emotionalBond", "communication", "lifeGoals", "romance", "spiritualAlignment"];
  return typeof value.overallNarrative === "string" &&
    typeof value.compatibilityVerdict === "string" &&
    typeof value.overallScore === "number" &&
    dimensions.every((key) => {
      const dimension = value[key];
      return Boolean(dimension && typeof dimension === "object" &&
        typeof (dimension as Record<string, unknown>).text === "string" &&
        typeof (dimension as Record<string, unknown>).guidance === "string");
    }) && Array.isArray((value.strengthsAndChallenges as Record<string, unknown> | undefined)?.strengths) &&
    Array.isArray(value.remediesForPair) && typeof value.finalBlessing === "string";
};

// ── Score consistency ──
// The same couple (same two names + relationship) must always see the same scores,
// no matter how many times they re-upload. We look up their first reading and pin
// every score to it, so the result feels trustworthy instead of random.
export interface LockedScores {
  overallScore: number;
  compatibilityVerdict: string;
  emotionalBond: number;
  communication: number;
  lifeGoals: number;
  romance: number;
  spiritualAlignment: number;
}

const DIMENSION_KEYS = ["emotionalBond", "communication", "lifeGoals", "romance", "spiritualAlignment"] as const;

const normalizeName = (name: string) => name.replace(/\s+/g, " ").trim().toLowerCase();

export const extractLockedScores = (row: {
  overall_score?: number | null;
  reading?: unknown;
}): LockedScores | null => {
  const reading = row?.reading as Record<string, unknown> | undefined;
  if (!reading || typeof reading !== "object") return null;
  const dim = (key: string): number | null => {
    const value = (reading as Record<string, unknown>)[key] as Record<string, unknown> | undefined;
    const score = value && typeof value === "object" ? value.score : undefined;
    return typeof score === "number" && score >= 1 && score <= 100 ? Math.round(score) : null;
  };
  const overall = typeof reading.overallScore === "number"
    ? Math.round(reading.overallScore)
    : typeof row.overall_score === "number" ? row.overall_score : null;
  const scores = DIMENSION_KEYS.map(dim);
  if (overall === null || scores.some((s) => s === null)) return null;
  return {
    overallScore: overall,
    compatibilityVerdict: typeof reading.compatibilityVerdict === "string" ? reading.compatibilityVerdict : "",
    emotionalBond: scores[0]!,
    communication: scores[1]!,
    lifeGoals: scores[2]!,
    romance: scores[3]!,
    spiritualAlignment: scores[4]!,
  };
};

/** Apply the locked scores to a freshly generated reading so numbers never drift. */
export const applyLockedScores = (
  reading: Record<string, unknown>,
  locked: LockedScores,
  keepVerdict: boolean,
): Record<string, unknown> => {
  reading.overallScore = locked.overallScore;
  if (keepVerdict && locked.compatibilityVerdict) {
    reading.compatibilityVerdict = locked.compatibilityVerdict;
  }
  for (const key of DIMENSION_KEYS) {
    const dimension = reading[key];
    if (dimension && typeof dimension === "object") {
      (dimension as Record<string, unknown>).score = locked[key];
    }
  }
  return reading;
};

/** Find this couple's earliest reading (names in either order) and reuse its scores. */
const findLockedScores = async (
  // deno-lint-ignore no-explicit-any
  supabaseClient: any,
  p1: string,
  p2: string,
  relationshipType: string,
): Promise<LockedScores | null> => {
  try {
    const { data, error } = await supabaseClient
      .from("palmmatch_reports")
      .select("overall_score, reading, person1_name, person2_name")
      .eq("relationship_type", relationshipType)
      .order("created_at", { ascending: true })
      .limit(200);
    if (error || !Array.isArray(data)) return null;
    const a = normalizeName(p1);
    const b = normalizeName(p2);
    const match = data.find((row: { person1_name?: string; person2_name?: string }) => {
      const r1 = normalizeName(String(row.person1_name ?? ""));
      const r2 = normalizeName(String(row.person2_name ?? ""));
      return (r1 === a && r2 === b) || (r1 === b && r2 === a);
    });
    return match ? extractLockedScores(match) : null;
  } catch (e) {
    console.error("findLockedScores failed (non-fatal):", e);
    return null;
  }
};

const generateCompatibilityReadingAttempt = async (
  image1Url: string,
  image2Url: string,
  person1: { name: string; age: string },
  person2: { name: string; age: string },
  relationshipType: string,
  apiKey: string,
  context: AiCaptureContext,
  language: PalmMatchLanguage,
  isRetry: boolean,
  locked: LockedScores | null,
): Promise<Record<string, unknown>> => {
  const startedAt = Date.now();
  const lockedInstruction = locked
    ? `\nFIXED SCORES (MANDATORY): This pair already has an established reading. You MUST return exactly these values and build the narrative around them: overallScore = ${locked.overallScore}, emotionalBond.score = ${locked.emotionalBond}, communication.score = ${locked.communication}, lifeGoals.score = ${locked.lifeGoals}, romance.score = ${locked.romance}, spiritualAlignment.score = ${locked.spiritualAlignment}${locked.compatibilityVerdict ? `, compatibilityVerdict = "${locked.compatibilityVerdict}"` : ""}. Never invent different numbers.\n`
    : "";
  const languageInstruction = language === "hinglish"
    ? "Write every customer-facing value in natural conversational Hinglish using Roman script only. Blend familiar Hindi and English naturally; never use Devanagari or formal Hindi. Keep JSON keys and person names unchanged."
    : "Write every customer-facing value in warm, precise, easy-to-read English. Keep JSON keys unchanged.";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4.1",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are PalmMitra AI — a trusted relationship palmist trained in Indian Hast Rekha Shastra. Compare only palm features that are genuinely visible in the two images.

LANGUAGE: ${languageInstruction}
${lockedInstruction}


QUALITY AND CONVERSION RULES:
- Start with the most personally resonant contrast or alignment between the two palms, then explain one useful relationship implication.
- Make the free Emotional Bond section genuinely useful. For the paid dimensions, include a credible specific clue while preserving one meaningful detail for the complete report.
- Be concise and phone-readable: target 650-900 words total. Most text fields are 1-2 short sentences; overallNarrative and finalBlessing may use up to 3. Never repeat an insight.
- Compare both people rather than describing them separately. Mention each name naturally, no more than 4 times each across the report.
- Ground insights in visible heart/head/fate/life line or mount differences. Do not invent rare markings when unclear.
- Be emotionally specific and practical, not generic. Give actions the couple can actually use.
- Never use fear, pressure, guaranteed outcomes, manipulative urgency, or claims of certainty. This is reflective guidance, not a prediction.
- Keep scores credible and differentiated; do not make every dimension unusually high.
- Relationship type: ${relationshipType}.
${isRetry ? "- RETRY: The previous output was malformed or used the wrong language. Correct it fully while keeping the report concise." : ""}

Return ONLY valid JSON, no markdown or extra text.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze the compatibility between ${person1.name} (age ${person1.age}) and ${person2.name} (age ${person2.age}) — relationship type: ${relationshipType}.

The first image is ${person1.name}'s palm. The second image is ${person2.name}'s palm.

Return this exact JSON structure. All angle-bracket instructions must be replaced with finished customer-facing copy:
{
  "person1Name": "${person1.name}",
  "person2Name": "${person2.name}",
  "relationshipType": "${relationshipType}",
  "overallScore": <integer 55-95>,
  "compatibilityVerdict": "<a concise 2-4 word verdict in the selected language>",
  "overallNarrative": "<exactly 2-3 short sentences: strongest visible alignment, meaningful contrast, and practical implication>",
  "emotionalBond": {
    "score": <integer 50-98>,
    "title": "<localized title for Emotional Bond>",
    "text": "<2 short sentences comparing heart lines and emotional needs>",
    "guidance": "<1 short, specific action>"
  },
  "communication": {
    "score": <integer 50-98>,
    "title": "<localized title for Communication Harmony>",
    "text": "<1-2 short sentences comparing head lines and Mercury mounts; reveal a clue and one unresolved detail>",
    "guidance": "<1 short action>"
  },
  "lifeGoals": {
    "score": <integer 50-98>,
    "title": "<localized title for Life Goals Alignment>",
    "text": "<1-2 short sentences comparing fate lines and pace of ambition>",
    "guidance": "<1 short action>"
  },
  "romance": {
    "score": <integer 50-98>,
    "title": "<localized title for Romantic Resonance>",
    "text": "<1-2 short sentences comparing Venus mounts and affection styles>",
    "guidance": "<1 short action>"
  },
  "spiritualAlignment": {
    "score": <integer 50-98>,
    "title": "<localized title for Spiritual Alignment>",
    "text": "<1-2 short sentences on values and inner rhythm grounded in visible palm features>",
    "guidance": "<1 short shared practice>"
  },
  "strengthsAndChallenges": {
    "strengths": ["<3 concise strengths specific to their palm comparison>"],
    "challenges": ["<3 constructive growth areas specific to their palm comparison>"],
    "growthPath": "<1-2 short sentences describing how this pair can grow together>"
  },
  "timingGuidance": "<1-2 responsible sentences about a reflective window for decisions; avoid certainty>",
  "remediesForPair": [
    "<one concise shared ritual with what and when>",
    "<one concise communication or gratitude practice>"
  ],
  "finalBlessing": "<2-3 short personalized blessing sentences, poetic and warm>"
}`,
            },
            { type: "image_url", image_url: { url: image1Url, detail: "high" } },
            { type: "image_url", image_url: { url: image2Url, detail: "high" } },
          ],
        },
      ],
      max_tokens: 3200,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("OpenAI compatibility error:", response.status, err);
    throw new Error(`AI_PROVIDER_${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  await captureAiGeneration({
    context,
    spanName: "generate_palmmatch_reading",
    model: "gpt-4.1",
    input: [{ role: "user", content: [{ type: "image_url", image_url: { url: image1Url } }, { type: "image_url", image_url: { url: image2Url } }] }],
    output: content,
    latencyMs: Date.now() - startedAt,
  });
  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    const reading = JSON.parse(cleaned);
    if (!isValidCompatibilityReading(reading)) throw new Error("AI_INVALID_REPORT_SHAPE");
    return reading;
  } catch {
    console.error("generateCompatibilityReading JSON parse error:", cleaned.slice(0, 300));
    throw new Error("AI_INVALID_REPORT_JSON");
  }
};

const generateCompatibilityReading = async (
  image1Url: string,
  image2Url: string,
  person1: { name: string; age: string },
  person2: { name: string; age: string },
  relationshipType: string,
  apiKey: string,
  context: AiCaptureContext,
  language: PalmMatchLanguage,
  locked: LockedScores | null,
): Promise<Record<string, unknown>> => {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const reading = await generateCompatibilityReadingAttempt(
        image1Url, image2Url, person1, person2, relationshipType, apiKey, context, language, attempt > 0, locked,
      );
      if (language === "hinglish" && !isHinglishCompatibilityReading(reading)) {
        throw new Error("AI_LANGUAGE_MISMATCH");
      }
      // Hard guarantee: even if the model drifts, the stored scores win.
      // The verdict is only reused in the same language as the original reading.
      if (locked) applyLockedScores(reading, locked, language === lockedLanguageOf(locked));
      return reading;
    } catch (error) {
      lastError = error;
      const retryableOutputError = error instanceof Error &&
        ["AI_INVALID_REPORT_JSON", "AI_INVALID_REPORT_SHAPE", "AI_LANGUAGE_MISMATCH"].includes(error.message);
      if (attempt === 0 && retryableOutputError) {
        console.warn(`Retrying PalmMatch report after ${error instanceof Error ? error.message : "invalid output"}`);
        continue;
      }
      throw error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("AI_REPORT_GENERATION_FAILED");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!openaiApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // ── Rate limiting: max 5 palmmatch analyses per IP per hour ──
    // Prevents AI-cost abuse and mass generation of free readings.
    const identifier =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const windowStart = new Date();
    windowStart.setMinutes(0, 0, 0, 0);
    const { count: rlCount } = await supabaseClient
      .from("api_rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("identifier", identifier)
      .eq("endpoint", "analyze-palmmatch")
      .gte("created_at", windowStart.toISOString());
    if ((rlCount ?? 0) >= 15) {
      return new Response(
        JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again in an hour." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }


    let body: PalmMatchRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const { image1Url, image2Url, person1, person2, relationshipType, email, language } = body ?? {} as PalmMatchRequest;

    // ── Server-side validation ──
    const allowedPrefix = `${supabaseUrl}/storage/v1/object/public/palm-uploads/`;
    const isValidImageUrl = (u: unknown) => typeof u === "string" && u.length <= 512 && u.startsWith(allowedPrefix);
    const isValidName = (n: unknown): n is string =>
      typeof n === "string" &&
      (() => { const t = n.replace(/\s+/g, " ").trim(); return t.length >= 2 && t.length <= 60 && !/[<>{}$]/.test(t) && /[A-Za-z\u00C0-\u024F\u0900-\u097F]/.test(t); })();
    const parseAge = (a: unknown) => {
      const n = parseInt(String(a ?? "").trim(), 10);
      return Number.isInteger(n) && n >= 13 && n <= 100 ? n : null;
    };
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const validEmail = cleanEmail.length > 0 && cleanEmail.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
    const allowedRelationships = ["Partner", "Spouse", "Friend", "Sibling", "Parent-Child", "Business Partner"];
    const safeLanguage: PalmMatchLanguage = language === "hinglish" ? "hinglish" : "english";

    const fieldError =
      !isValidImageUrl(image1Url) || !isValidImageUrl(image2Url) ? "One of the palm photos didn't upload correctly. Please re-select it." :
      !isValidName(person1?.name) ? "Please enter a valid first name (at least 2 letters)." :
      parseAge(person1?.age) === null ? "First person's age must be between 13 and 100." :
      !isValidName(person2?.name) ? "Please enter a valid partner name (at least 2 letters)." :
      parseAge(person2?.age) === null ? "Partner's age must be between 13 and 100." :
      !validEmail ? "Please enter a valid email address." :
      !allowedRelationships.includes(relationshipType) ? "Please choose a relationship type." : null;
    if (fieldError) {
      console.warn("PalmMatch validation failed:", fieldError);
      return new Response(
        JSON.stringify({ success: false, error: fieldError }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanP1 = { name: person1.name.replace(/\s+/g, " ").trim(), age: String(parseAge(person1.age)) };
    const cleanP2 = { name: person2.name.replace(/\s+/g, " ").trim(), age: String(parseAge(person2.age)) };

    // Only count well-formed requests toward the hourly limit
    await supabaseClient.from("api_rate_limits").insert({ identifier, endpoint: "analyze-palmmatch" });

    console.log(`PalmMatch: Validating palms`);
    const aiCaptureContext = { sessionId: crypto.randomUUID(), traceId: crypto.randomUUID() };

    // Validate both palms in parallel
    const [validation1, validation2] = await Promise.all([
      validatePalmImage(image1Url, openaiApiKey, aiCaptureContext),
      validatePalmImage(image2Url, openaiApiKey, aiCaptureContext),
    ]);

    if (!validation1.is_palm || validation1.confidence < 50) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "invalid_palm",
          person: "person1",
          message: `${cleanP1.name}'s image doesn't appear to be a clear palm photo. Please re-upload.`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!validation2.is_palm || validation2.confidence < 50) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "invalid_palm",
          person: "person2",
          message: `${cleanP2.name}'s image doesn't appear to be a clear palm photo. Please re-upload.`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Both palms validated. Generating compatibility reading...");

    const reading = await generateCompatibilityReading(
      image1Url, image2Url, cleanP1, cleanP2, relationshipType, openaiApiKey, aiCaptureContext, safeLanguage
    );

    const reportId = `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const { error: dbError } = await supabaseClient.from("palmmatch_reports").insert({
      report_id: reportId,
      person1_name: cleanP1.name,
      person2_name: cleanP2.name,
      person1_age: parseInt(cleanP1.age) || null,
      person2_age: parseInt(cleanP2.age) || null,
      relationship_type: relationshipType,
      email: cleanEmail,
      overall_score: (reading as { overallScore?: number }).overallScore || 75,
      reading,
      language: safeLanguage,
      is_unlocked: false,
    });

    if (dbError) {
      console.error("DB insert error:", dbError);
      return new Response(
        JSON.stringify({ success: false, error: "We couldn't save your compatibility report. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, reading, reportId, language: safeLanguage, generatedAt: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("PalmMatch edge function error:", error);
    const message = error instanceof Error ? error.message : "";
    const isOutputError = ["AI_INVALID_REPORT_JSON", "AI_INVALID_REPORT_SHAPE", "AI_LANGUAGE_MISMATCH"].includes(message);
    return new Response(
      JSON.stringify({
        success: false,
        error: isOutputError
          ? "We couldn't complete the report in your selected language. Please try again."
          : "We couldn't generate your compatibility report right now. Please try again.",
      }),
      { status: isOutputError ? 503 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
