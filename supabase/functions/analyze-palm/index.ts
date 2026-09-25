import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { captureAiGeneration, type AiCaptureContext } from "../_shared/posthog-ai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PalmAnalysisRequest {
  imageUrl: string;
  name: string;
  age: string;
  email: string;
  readingType: "full" | "career" | "love" | "wealth";
  language?: "english" | "hinglish";
  countryCode?: string;
  countryName?: string;
}

interface ValidationResult {
  is_palm: boolean;
  confidence: number;
  quality: "good" | "medium" | "poor";
  reason: string;
  next_step: "analyze" | "reupload";
}

const throwOpenAIError = (status: number, errorText: string): never => {
  const normalized = errorText.toLowerCase();
  if (
    normalized.includes("insufficient_quota") ||
    normalized.includes("credit_balance_exhausted") ||
    normalized.includes("billing_hard_limit_reached")
  ) {
    throw new Error("AI_CREDITS_EXHAUSTED");
  }
  if (status === 400 && (normalized.includes("invalid_image_format") || normalized.includes("unsupported image"))) {
    throw new Error("AI_UNSUPPORTED_IMAGE");
  }
  if (status === 429) throw new Error("AI_RATE_LIMITED");
  if (status >= 500) throw new Error("AI_TEMPORARILY_UNAVAILABLE");
  throw new Error("AI_REQUEST_FAILED");
};

// Step 1: Validate if image is a palm
const validatePalmImage = async (imageUrl: string, apiKey: string, context: AiCaptureContext): Promise<ValidationResult> => {
  console.log("Step 1: Validating palm image...");
  const startedAt = Date.now();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: `You are PalmMitra AI Validator. Your ONLY job is to verify if an uploaded image shows a clear human palm.

STRICT VALIDATION RULES:
- The image MUST show a human palm (inside of the hand, not the back)
- The palm lines should be visible (Life line, Heart line, Head line)
- The image should be clear, not blurry
- Only ONE palm should be visible (not both hands)
- The palm should be the main subject, not partially visible

REJECT images that show:
- Non-palm images (faces, objects, animals, landscapes, etc.)
- Back of hand instead of palm
- Blurry or unclear images
- Multiple hands
- Only fingers without palm visible
- Drawings or illustrations of hands

Return ONLY a JSON object with NO additional text or markdown.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image and determine if it shows a clear human palm suitable for palm reading.

Return this exact JSON structure:
{
  "is_palm": true/false,
  "confidence": 0-100,
  "quality": "good" or "medium" or "poor",
  "reason": "brief explanation",
  "next_step": "analyze" or "reupload"
}`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI validation error:", response.status, errorText);
    throwOpenAIError(response.status, errorText);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No validation response received");
  }

  await captureAiGeneration({
    context,
    spanName: "validate_palm_image",
    model: "gpt-4.1",
    input: [{ role: "user", content: [{ type: "image_url", image_url: { url: imageUrl } }] }],
    output: content,
    latencyMs: Date.now() - startedAt,
  });

  try {
    const cleanContent = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const result = JSON.parse(cleanContent);
    console.log("Validation result:", result);
    return result;
  } catch (e) {
    console.error("Failed to parse validation JSON:", content);
    // Default to rejection if parsing fails
    return {
      is_palm: false,
      confidence: 0,
      quality: "poor",
      reason: "Could not validate the image. Please upload a clear palm photo.",
      next_step: "reupload",
    };
  }
};

// Step 2: Generate palm reading
const getReadingPrompt = (name: string, age: string, readingType: string, language: "english" | "hinglish", countryContext: string) => {
  const now = new Date();
  const currentMonth = now.toLocaleString("en-US", { month: "long" });
  const currentYear = now.getFullYear();
  const futureDate = new Date(now);
  futureDate.setMonth(futureDate.getMonth() + 6);
  const futureMonth = futureDate.toLocaleString("en-US", { month: "long" });
  const futureYear = futureDate.getFullYear();
  const sixMonthPeriod = `${currentMonth} ${currentYear} - ${futureMonth} ${futureYear}`;

  const languageInstruction = language === 'hinglish'
    ? 'Write every user-facing string in concise, natural Hinglish using Roman script. Blend familiar Hindi and English conversationally, avoid formal or difficult Hindi, and never use Devanagari. Keep every JSON key exactly as specified in English.'
    : 'Write every user-facing string in concise, warm, easy-to-read English. Avoid jargon and keep every JSON key exactly as specified.';
  const basePrompt = `You are PalmMitra AI — India's most respected digital palmistry expert, trained in the ancient science of Hast Rekha Shastra and modern psychological profiling.

LANGUAGE: ${languageInstruction}
LOCATION CONTEXT: ${countryContext}. Use this only for culturally neutral phrasing and familiar life context. Never infer religion, ethnicity, income, health, or legal status from location.

You are composing a premium destiny report for ${name}, age ${age}. This report must read like a deeply personal consultation from a seasoned palmist who has studied this individual's palm with great care — not a templated AI output.

═══════════════════════════════════════
WRITING STYLE & QUALITY STANDARDS
═══════════════════════════════════════

1. AUTHORITY & WARMTH
- Write with the calm confidence of a master palmist who has read 10,000+ palms.
- Use declarative, assured language: "Your palm reveals…", "The patterns in your hand point to…", "There is a distinctive quality to your fate line that…"
- Avoid excessive hedging. Use softening language sparingly and naturally — not in every sentence. One "may" per paragraph at most.
- Balance spiritual reverence with psychological insight.

2. CONCISE DEPTH & SPECIFICITY
- Keep the complete report focused and easy to scan. Most descriptive fields should be 1-2 short sentences; never exceed 3 sentences in one field.
- Aim for roughly 900-1,200 words across all customer-facing text. Do not repeat the same insight in multiple sections.
- Connect palmistry observations to real psychological and behavioral patterns.
- Describe WHAT you see in the palm (line depth, curve, length, intersections, markings) THEN interpret its meaning.
- Use vivid, evocative language: "a deeply etched life line that curves generously around the mount of Venus" not "a strong life line."

3. PERSONALIZATION WITHOUT REPETITION
- Address ${name} by name 3-5 times TOTAL across the entire report — in the headline, one mid-section insight, and the final blessing. NOT in every field.
- Reference age ${age} naturally in 1-2 places where developmentally relevant.
- Each insight must feel observational and specific, as if noting something unique about THIS particular palm.

4. EMOTIONAL & PSYCHOLOGICAL DEPTH
- Go beyond surface predictions. Explore the inner world: emotional patterns, unconscious drives, relationship dynamics, self-sabotage tendencies, hidden strengths.
- Use frameworks from depth psychology: attachment styles, resilience patterns, creative expression, fear vs. ambition dynamics.
- Example: Instead of "You are loyal" → "Your heart line's steady, unbroken arc suggests someone who loves with a quiet permanence — the kind of loyalty that doesn't announce itself but remains long after others have left."

5. NARRATIVE FLOW
- The report should tell a coherent story of this person's life trajectory — past patterns giving way to present potential, building toward future possibility.
- Each section should feel connected, not isolated. Reference themes across sections.

6. CONVERSION-FRIENDLY VALUE
- Lead with the most personally resonant observation, then give one useful implication or action.
- Make the reader feel seen through specificity, not hype, fear, urgency, or guaranteed outcomes.
- Premium locked insights must reveal a credible clue while preserving one meaningful unanswered detail that creates honest curiosity.
- Use clean, direct sentences that are easy to read on a phone.

7. TRUST-SAFE LANGUAGE (LEGAL)
- Never use "guaranteed", "will definitely", "destined to", "certain".
- Preferred: "your palm reveals", "the patterns suggest", "there are strong indications of", "this points toward".
- This is about sounding confident yet responsible — like a doctor giving an informed assessment, not a fortune teller making promises.

8. FUTURE-ONLY TIMELINES
- Current date: ${currentMonth} ${currentYear}. ALL predictions from ${currentYear} onward.
- Use specific month ranges where possible.

9. NO GEMSTONES
- Remedies: meditation, journaling, temple/nature visits, gratitude, breathing exercises, specific mantras, charitable acts, morning rituals.
- No gemstones, rings, or purchasable items.

10. OUTPUT FORMAT
- Return ONLY a valid JSON object. No markdown, no backticks, no commentary.

═══════════════════════════════════════
REPORT STRUCTURE
═══════════════════════════════════════

Generate the report as a JSON object with this EXACT structure:

{
  "confidenceScore": 85,
  
  "headlineSummary": "A compelling 2-sentence opening that makes ${name} feel immediately understood. Reference one specific palm observation and its most meaningful implication.",
  
  "majorLines": {
    "lifeLine": {
      "strength": "Strong",
      "meaning": "In 1-2 short sentences, describe the visible life line and interpret what it suggests about vitality, life approach, and resilience.",
      "keyInsight": "One memorable, psychologically perceptive insight in 1 short sentence."
    },
    "heartLine": {
      "strength": "Moderate",
      "meaning": "In 1-2 short sentences, connect the heart line's visible features to how this person loves, processes feelings, and bonds.",
      "keyInsight": "One emotionally resonant insight about attachment, courage, or relationship patterns in 1 short sentence."
    },
    "headLine": {
      "strength": "Strong",
      "meaning": "In 1-2 short sentences, connect the head line's characteristics to thinking and decision-making style.",
      "keyInsight": "One revealing insight about stress, decisions, or the balance of logic and intuition in 1 short sentence."
    },
    "fateLine": {
      "strength": "Developing",
      "meaning": "In 1-2 short sentences, connect the fate line's visible features to career direction, purpose, and ambition.",
      "keyInsight": "One specific career or purpose insight in 1 short sentence."
    },
    "sunLine": {
      "strength": "Moderate",
      "meaning": "In 1-2 short sentences, explain what the sun line suggests about recognition, creativity, and public presence.",
      "keyInsight": "One insight about success, visibility, or creative fulfillment in 1 short sentence."
    }
  },
  
  "mounts": {
    "venus": { "level": "High", "meaning": "1 concise sentence about passion, vitality, and capacity for joy." },
    "jupiter": { "level": "Medium", "meaning": "1 concise sentence about leadership, ambition, and authority." },
    "saturn": { "level": "Medium", "meaning": "1 concise sentence about discipline, responsibility, and solitude." },
    "apollo": { "level": "High", "meaning": "1 concise sentence about creativity, aesthetics, and recognition." },
    "mercury": { "level": "Medium", "meaning": "1 concise sentence about communication, curiosity, and adaptability." }
  },
  
  "personalityTraits": [
    {"trait": "Specific trait name", "icon": "drive", "description": "1 concise sentence connecting the trait to an observable palm feature and daily behavior."},
    {"trait": "Specific trait name", "icon": "loyalty", "description": "1 concise sentence with emotional and behavioral nuance."},
    {"trait": "Specific trait name", "icon": "practical", "description": "1 concise sentence revealing the shadow side or growth edge."},
    {"trait": "Specific trait name", "icon": "success", "description": "1 concise sentence about how this shapes achievement."},
    {"trait": "Specific trait name", "icon": "spiritual", "description": "1 concise sentence about meaning and purpose."}
  ],
  
  "careerWealth": {
    "bestFields": ["Specific field with reasoning", "Second field with reasoning", "Third field with reasoning"],
    "turningPointAge": "Specific age range like 28-32",
    "wealthStyle": "2 concise sentences connecting palm indicators to earning, saving, and spending patterns.",
    "peakPeriods": [
      {"year": "${currentYear}", "intensity": "building"},
      {"year": "${currentYear + 1}", "intensity": "rising"},
      {"year": "${currentYear + 2}", "intensity": "peak"},
      {"year": "${currentYear + 3}", "intensity": "sustaining"},
      {"year": "${currentYear + 4}", "intensity": "expanding"}
    ]
  },
  
  "loveRelationships": {
    "emotionalStyle": "2 concise sentences about attachment, vulnerability, and how they express love, grounded in the heart line and Venus mount.",
    "commitmentTendency": "1-2 concise sentences about commitment, trust, and long-term partnership.",
    "relationshipAdvice": "1-2 short, specific guidance sentences rooted in the palm."
  },
  
  "lifePhases": {
    "growth": { "period": "Month-Month ${currentYear}", "description": "1-2 concise sentences describing the growth theme and best action." },
    "challenge": { "period": "Month-Month ${currentYear}", "description": "1-2 concise sentences describing the challenge, hidden benefit, and response." },
    "opportunity": { "period": "Month-Month ${currentYear + 1}", "description": "1-2 concise sentences describing the opportunity and what it requires." }
  },

  "next6MonthsFocus": {
    "period": "${sixMonthPeriod}",
    "focusAreas": [
      {"area": "Area name", "action": "1 short, specific action personalized to the palm."},
      {"area": "Area name", "action": "1 short, specific action."},
      {"area": "Area name", "action": "1 short, specific action."}
    ],
    "avoidDuring": "1 concise sentence about what to watch for, framed as practical wisdom rather than fear."
  },
  
  "spiritualRemedies": [
    {"remedy": "Specific practice with detail", "benefit": "What it addresses in their specific palm pattern", "timing": "Precise timing guidance"},
    {"remedy": "Specific practice", "benefit": "Connected to a specific reading insight", "timing": "When and how often"},
    {"remedy": "Specific practice", "benefit": "Targeted benefit", "timing": "Specific timing"},
    {"remedy": "Specific practice", "benefit": "Targeted benefit", "timing": "Specific timing"},
    {"remedy": "Specific practice", "benefit": "Targeted benefit", "timing": "Specific timing"}
  ],
  
  "finalBlessing": "A warm 2-3 sentence closing that addresses ${name} by name, unifies the key theme, and ends with a memorable elder-like blessing worth saving.",
  
  "premiumInsights": {
    "marriageTiming": "A compelling 1-2 sentence locked insight: share one credible relationship-timing clue while preserving the exact window for the unlocked report.",
    "careerBreakthrough": "A compelling 1-2 sentence locked insight: share one credible career clue while preserving the decisive timing detail for the unlocked report."
  }
}

Strength values: "Very Strong", "Strong", "Moderate", "Developing", "Faint"
Level values: "High", "Medium", "Low"
Icon values: "drive", "loyalty", "practical", "success", "spiritual"
Intensity values: "building", "rising", "peak", "sustaining", "expanding"

CRITICAL QUALITY CHECK — Before returning, verify:
✓ headlineSummary is exactly 2 compelling sentences, not a tagline
✓ Most meaning/description fields are 1-2 short sentences and the report avoids repetition
✓ ${name} appears 3-5 times total, NOT in every field
✓ keyInsight fields contain genuine psychological depth
✓ finalBlessing is 2-3 sentences and feels like a personal benediction
✓ No two fields use identical sentence structures
✓ Personality traits have unique, non-generic names
✓ Career fields are specific, not generic categories
✓ The report tells a coherent narrative arc`;

  const focusAdditions: Record<string, string> = {
    career: `\n\nREADING TYPE: CAREER FOCUS
Give extraordinary depth to the fate line, sun line, Jupiter and Mercury mounts.
The careerWealth section should be the crown jewel — include industry-specific insights, leadership style analysis, entrepreneurial vs. corporate tendencies, and wealth accumulation patterns unique to this palm.
Personality traits should emphasize professional strengths and growth edges.
The next6MonthsFocus should provide a strategic career roadmap.`,
    love: `\n\nREADING TYPE: LOVE FOCUS
Give extraordinary depth to the heart line, Venus mount, and relationship indicators.
The loveRelationships section should be the crown jewel — explore attachment style, emotional availability, partner compatibility patterns, and the evolution of their romantic life as revealed by the palm.
Personality traits should emphasize emotional intelligence and relational patterns.
The next6MonthsFocus should guide emotional and relational growth.`,
    wealth: `\n\nREADING TYPE: WEALTH FOCUS
Give extraordinary depth to the fate line, sun line, Mercury mount, and financial indicators.
The careerWealth section should be the crown jewel — detail wealth accumulation style, risk tolerance, financial turning points, and abundance patterns specific to this palm.
Include money psychology insights: their relationship with security, generosity, and material comfort.
The next6MonthsFocus should emphasize strategic financial actions.`,
    full: `\n\nREADING TYPE: FULL COMPREHENSIVE
Provide rich, balanced coverage across all life dimensions — career, love, health, spirituality, personal growth.
No single section should dominate. Each area should feel thoroughly explored.
The next6MonthsFocus should weave together professional, personal, and spiritual guidance.`,
  };

  return basePrompt + (focusAdditions[readingType] || focusAdditions.full);
};

const generatePalmReadingAttempt = async (
  imageUrl: string,
  name: string,
  age: string,
  readingType: string,
  apiKey: string,
  context: AiCaptureContext,
  language: "english" | "hinglish",
  countryContext: string,
  isRetry = false,
) => {
  console.log("Step 2: Generating palm reading...");
  const startedAt = Date.now();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: getReadingPrompt(name, age, readingType, language, countryContext),
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this palm image for ${name}, age ${age}. Generate a premium, concise, conversion-friendly ${readingType} destiny report that feels personal and is easy to scan on mobile. Use ${name}'s name sparingly (3-5 times total), avoid repetition, and return ONLY the JSON object.${isRetry && language === 'hinglish' ? ' IMPORTANT RETRY: The previous response was too English-heavy. Rewrite every customer-facing sentence in natural Roman-script Hinglish, using familiar Hindi words throughout while staying concise.' : ''}`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 4000,
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI reading error:", response.status, errorText);
    throwOpenAIError(response.status, errorText);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No reading content received");
  }

  await captureAiGeneration({
    context,
    spanName: "generate_palm_reading",
    model: "gpt-4.1",
    input: [{ role: "user", content: [{ type: "image_url", image_url: { url: imageUrl } }] }],
    output: content,
    latencyMs: Date.now() - startedAt,
  });

  try {
    const cleanContent = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    return JSON.parse(cleanContent);
  } catch (parseError) {
    console.error("Failed to parse GPT response as JSON:", parseError);
    throw new Error("AI_INVALID_REPORT_JSON");
  }
};

const HINGLISH_MARKERS = /\b(aap|aapka|aapki|aapke|hai|hain|ka|ki|ke|aur|mein|yeh|jo|liye|saath|apne|karta|karti|hoga|hogi|rahe|wali|wala)\b/gi;

const isHinglishReading = (reading: unknown): boolean => {
  const sample = JSON.stringify(reading).toLowerCase();
  return (sample.match(HINGLISH_MARKERS) ?? []).length >= 8;
};

const generatePalmReading = async (
  imageUrl: string,
  name: string,
  age: string,
  readingType: string,
  apiKey: string,
  context: AiCaptureContext,
  language: "english" | "hinglish",
  countryContext: string,
) => {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const reading = await generatePalmReadingAttempt(
        imageUrl, name, age, readingType, apiKey, context, language, countryContext, attempt > 0,
      );
      if (language === "hinglish" && !isHinglishReading(reading)) {
        throw new Error("AI_LANGUAGE_MISMATCH");
      }
      return reading;
    } catch (error) {
      lastError = error;
      if (attempt === 0 && error instanceof Error && ["AI_INVALID_REPORT_JSON", "AI_LANGUAGE_MISMATCH"].includes(error.message)) {
        console.warn(`Retrying palm report after ${error.message}`);
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
    const requestStartedAt = Date.now();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "AI is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Supabase credentials not configured");
      return new Response(JSON.stringify({ error: "Database configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Rate limiting: max 15 analyze-palm calls per IP in a rolling hour
    const identifier =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const windowStart = new Date(Date.now() - 60 * 60 * 1000);

    const { count: requestCount } = await supabase
      .from("api_rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("identifier", identifier)
      .eq("endpoint", "analyze-palm")
      .gte("created_at", windowStart.toISOString());

    if ((requestCount ?? 0) >= 15) {
      console.warn(`Rate limit exceeded for identifier: ${identifier}`);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again in an hour." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    await supabase.from("api_rate_limits").insert({ identifier, endpoint: "analyze-palm" });

    let body: PalmAnalysisRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { imageUrl, name, age, email, readingType, language, countryCode, countryName, ref } = body ?? {} as PalmAnalysisRequest & { ref?: string };

    // ── Server-side input validation (never trust the client) ──
    if (typeof imageUrl !== "string" || typeof name !== "string" || typeof age !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid fields: imageUrl, name, age" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const cleanName = name.replace(/\s+/g, " ").trim();
    if (cleanName.length < 2 || cleanName.length > 60 || /[<>{}$]/.test(cleanName) || !/[A-Za-z\u00C0-\u024F\u0900-\u097F]/.test(cleanName)) {
      return new Response(JSON.stringify({ error: "Please enter a valid name." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const ageNum = parseInt(String(age).trim(), 10);
    if (!Number.isInteger(ageNum) || ageNum < 13 || ageNum > 100) {
      return new Response(JSON.stringify({ error: "Age must be a whole number between 13 and 100." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (cleanEmail && (cleanEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))) {
      return new Response(JSON.stringify({ error: "Please enter a valid email address." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const validReadingTypes = ["full", "career", "love", "wealth"];
    const safeReadingType = validReadingTypes.includes(readingType) ? readingType : "full";
    const safeLanguage: "english" | "hinglish" = language === 'hinglish' ? 'hinglish' : 'english';
    const safeCountryCode = typeof countryCode === 'string' && /^[A-Za-z]{2}$/.test(countryCode.trim())
      ? countryCode.trim().toUpperCase()
      : null;
    const normalizedCountryName = typeof countryName === 'string'
      ? countryName.replace(/[^\p{L}\p{M} .'-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 80)
      : '';
    const safeCountryName = normalizedCountryName || null;
    const countryContext = safeCountryName
      ? `The reader is in ${safeCountryName}${safeCountryCode ? ` (${safeCountryCode})` : ''}`
      : safeCountryCode ? `The reader's country code is ${safeCountryCode}` : 'No location was provided';

    // Validate imageUrl belongs to our Supabase storage to prevent SSRF abuse of OpenAI API
    const allowedStoragePrefix = `${SUPABASE_URL}/storage/v1/object/public/palm-uploads/`;
    if (!imageUrl.startsWith(allowedStoragePrefix) || imageUrl.length > 512) {
      console.warn(`Rejected invalid imageUrl from ${identifier}`);
      return new Response(
        JSON.stringify({ error: "Invalid image URL. Please upload through PalmMitra." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`Processing palm reading, age ${ageNum}, type: ${safeReadingType}`);

    const aiCaptureContext = { sessionId: crypto.randomUUID(), traceId: crypto.randomUUID() };

    // STEP 1: Validate the palm image
    const validationStartedAt = Date.now();
    const validation = await validatePalmImage(imageUrl, OPENAI_API_KEY, aiCaptureContext);
    const validationMs = Date.now() - validationStartedAt;
    console.log(`Palm validation completed in ${validationMs}ms`);

    if (!validation.is_palm || validation.confidence < 70) {
      console.log("Palm validation failed:", validation);
      return new Response(
        JSON.stringify({
          success: false,
          validated: false,
          validation,
          message:
            validation.reason ||
            "This does not appear to be a clear palm photo. Please upload a front-facing palm image with visible palm lines.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // STEP 2: Generate the palm reading
    const generationStartedAt = Date.now();
    const palmReading = await generatePalmReading(
      imageUrl,
      cleanName,
      String(ageNum),
      safeReadingType,
      OPENAI_API_KEY,
      aiCaptureContext,
      safeLanguage,
      countryContext,
    );
    const generationMs = Date.now() - generationStartedAt;
    console.log(`Palm report generation completed in ${generationMs}ms`);

    // STEP 3: Save to database
    const { data: reportData, error: dbError } = await supabase
      .from("palm_reports")
      .insert({
        user_name: cleanName,
        user_age: String(ageNum),
        user_email: cleanEmail || null,
        reading_type: safeReadingType,
        image_url: imageUrl,
        validation_confidence: validation.confidence,
        validation_quality: validation.quality,
        report_json: palmReading,
        language: safeLanguage,
        country_code: safeCountryCode,
        country_name: safeCountryName,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
    }

    // Referral reward: if this reading came via a shared report link (?ref=<sharerReportId>),
    // grant 1 free AI question to both the sharer's report and this new report — once per new report.
    // Never let a referral failure break the analysis response.
    try {
      const newReportId = reportData?.id;
      const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (newReportId && typeof ref === "string" && uuidRe.test(ref) && ref !== newReportId) {
        const { data: sharer } = await supabase
          .from("palm_reports").select("id").eq("id", ref).maybeSingle();
        if (sharer?.id) {
          const { data: reward, error: rewardError } = await supabase
            .from("referral_rewards")
            .insert({ sharer_report_id: sharer.id, new_report_id: newReportId })
            .select("id")
            .single();
          if (reward && !rewardError) {
            await supabase.rpc("grant_free_questions_by_report", { _report_id: sharer.id, _n: 1 });
            await supabase.rpc("grant_free_questions_by_report", { _report_id: newReportId, _n: 1 });
            console.log(`Referral reward granted: sharer=${sharer.id} new=${newReportId}`);
          }
        }
      }
    } catch (referralError) {
      console.error("Referral reward failed (non-fatal):", referralError);
    }

    console.log(`Palm analysis completed in ${Date.now() - requestStartedAt}ms`);
    return new Response(
      JSON.stringify({
        success: true,
        validated: true,
        validation,
        reading: palmReading,
        reportId: reportData?.id || null,
        name: cleanName,
        age: ageNum,
        readingType: safeReadingType,
        language: safeLanguage,
        countryCode: safeCountryCode,
        countryName: safeCountryName,
        generatedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in analyze-palm function:", error);
    const msg = error instanceof Error ? error.message : "";
    if (msg === "AI_CREDITS_EXHAUSTED") {
      return new Response(
        JSON.stringify({
          error: "Palm readings are temporarily unavailable while AI capacity is restored. Please try again shortly.",
          code: "AI_CREDITS_EXHAUSTED",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "300" } },
      );
    }
    if (msg === "AI_RATE_LIMITED") {
      return new Response(
        JSON.stringify({ error: "The reading engine is briefly busy. Please try again in a minute.", code: "AI_RATE_LIMITED" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } },
      );
    }
    if (msg === "AI_UNSUPPORTED_IMAGE") {
      return new Response(
        JSON.stringify({ error: "This photo format isn't supported. Please upload a JPG or PNG photo of your palm.", code: "AI_UNSUPPORTED_IMAGE" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (msg === "AI_TEMPORARILY_UNAVAILABLE") {
      return new Response(
        JSON.stringify({ error: "The reading engine is temporarily unavailable. Please try again shortly.", code: "AI_TEMPORARILY_UNAVAILABLE" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } },
      );
    }
    if (["AI_INVALID_REPORT_JSON", "AI_LANGUAGE_MISMATCH", "AI_REPORT_GENERATION_FAILED"].includes(msg)) {
      return new Response(
        JSON.stringify({ error: "The reading could not be completed in your selected language. Please try again.", code: msg }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "10" } },
      );
    }
    return new Response(
      JSON.stringify({ error: "We couldn't process your reading right now. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
