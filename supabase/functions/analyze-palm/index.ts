import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
}

interface ValidationResult {
  is_palm: boolean;
  confidence: number;
  quality: "good" | "medium" | "poor";
  reason: string;
  next_step: "analyze" | "reupload";
}

// Step 1: Validate if image is a palm
const validatePalmImage = async (imageUrl: string, apiKey: string): Promise<ValidationResult> => {
  console.log("Step 1: Validating palm image...");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
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
    console.error("OpenAI validation error:", response.status, errorText);
    throw new Error("Failed to validate image");
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No validation response received");
  }

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
const getReadingPrompt = (name: string, age: string, readingType: string) => {
  const now = new Date();
  const currentMonth = now.toLocaleString("en-US", { month: "long" });
  const currentYear = now.getFullYear();
  const futureDate = new Date(now);
  futureDate.setMonth(futureDate.getMonth() + 6);
  const futureMonth = futureDate.toLocaleString("en-US", { month: "long" });
  const futureYear = futureDate.getFullYear();
  const sixMonthPeriod = `${currentMonth} ${currentYear} - ${futureMonth} ${futureYear}`;

  const basePrompt = `You are PalmMitra AI — India's most respected digital palmistry expert, trained in the ancient science of Hast Rekha Shastra and modern psychological profiling.

You are composing a premium destiny report for ${name}, age ${age}. This report must read like a deeply personal consultation from a seasoned palmist who has studied this individual's palm with great care — not a templated AI output.

═══════════════════════════════════════
WRITING STYLE & QUALITY STANDARDS
═══════════════════════════════════════

1. AUTHORITY & WARMTH
- Write with the calm confidence of a master palmist who has read 10,000+ palms.
- Use declarative, assured language: "Your palm reveals…", "The patterns in your hand point to…", "There is a distinctive quality to your fate line that…"
- Avoid excessive hedging. Use softening language sparingly and naturally — not in every sentence. One "may" per paragraph at most.
- Balance spiritual reverence with psychological insight.

2. DEPTH & SPECIFICITY
- Every field must contain 2-4 rich sentences minimum. One-line responses are UNACCEPTABLE.
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

6. TRUST-SAFE LANGUAGE (LEGAL)
- Never use "guaranteed", "will definitely", "destined to", "certain".
- Preferred: "your palm reveals", "the patterns suggest", "there are strong indications of", "this points toward".
- This is about sounding confident yet responsible — like a doctor giving an informed assessment, not a fortune teller making promises.

7. FUTURE-ONLY TIMELINES
- Current date: ${currentMonth} ${currentYear}. ALL predictions from ${currentYear} onward.
- Use specific month ranges where possible.

8. NO GEMSTONES
- Remedies: meditation, journaling, temple/nature visits, gratitude, breathing exercises, specific mantras, charitable acts, morning rituals.
- No gemstones, rings, or purchasable items.

9. OUTPUT FORMAT
- Return ONLY a valid JSON object. No markdown, no backticks, no commentary.

═══════════════════════════════════════
REPORT STRUCTURE
═══════════════════════════════════════

Generate the report as a JSON object with this EXACT structure:

{
  "confidenceScore": 85,
  
  "headlineSummary": "A compelling 2-3 line opening that reads like the first paragraph of a personal letter from a master palmist to ${name}. Set the emotional tone for the entire report. Reference a specific, striking observation from their palm that anchors the reading.",
  
  "majorLines": {
    "lifeLine": {
      "strength": "Strong",
      "meaning": "Describe the physical characteristics of the life line (depth, length, curve, any branches or islands) in 2-3 sentences. Then interpret what these specific features reveal about vitality, life approach, and resilience. Connect to psychological patterns.",
      "keyInsight": "One powerful, memorable insight that feels like a revelation — something the person would pause and reflect on. 2-3 sentences."
    },
    "heartLine": {
      "strength": "Moderate",
      "meaning": "Describe what you observe about the heart line's trajectory, depth, and any markings. Interpret the emotional architecture it reveals — how this person experiences love, processes feelings, and connects with others. 2-3 sentences.",
      "keyInsight": "A deep emotional insight that feels psychologically perceptive — about their attachment style, emotional courage, or relationship patterns. 2-3 sentences."
    },
    "headLine": {
      "strength": "Strong",
      "meaning": "Detail the head line's characteristics and what they reveal about cognitive style, decision-making patterns, and intellectual temperament. 2-3 sentences.",
      "keyInsight": "An insight about their thinking style that feels genuinely revealing — perhaps about how they process stress, make decisions under pressure, or balance logic with intuition. 2-3 sentences."
    },
    "fateLine": {
      "strength": "Developing",
      "meaning": "Describe the fate line's presence, depth, origin point, and trajectory. Interpret what this reveals about career direction, sense of purpose, and relationship with ambition and external validation. 2-3 sentences.",
      "keyInsight": "A career/purpose insight that connects their inner drive to external manifestation. 2-3 sentences."
    },
    "sunLine": {
      "strength": "Moderate",
      "meaning": "Detail what the sun line reveals about recognition, creative expression, and public presence. 2-3 sentences.",
      "keyInsight": "An insight about their relationship with success, visibility, and creative fulfillment. 2-3 sentences."
    }
  },
  
  "mounts": {
    "venus": { "level": "High", "meaning": "2-3 sentences describing what this mount's development reveals about passion, sensuality, vitality, and capacity for joy." },
    "jupiter": { "level": "Medium", "meaning": "2-3 sentences about leadership style, ambition patterns, and relationship with authority." },
    "saturn": { "level": "Medium", "meaning": "2-3 sentences about discipline, responsibility, relationship with structure and solitude." },
    "apollo": { "level": "High", "meaning": "2-3 sentences about creative expression, aesthetic sensibility, and desire for recognition." },
    "mercury": { "level": "Medium", "meaning": "2-3 sentences about communication style, intellectual curiosity, and adaptability." }
  },
  
  "personalityTraits": [
    {"trait": "Specific trait name", "icon": "drive", "description": "2-3 sentences describing how this trait manifests in daily life, with psychological depth. Connect it to observable palm features."},
    {"trait": "Specific trait name", "icon": "loyalty", "description": "2-3 sentences with emotional and behavioral nuance."},
    {"trait": "Specific trait name", "icon": "practical", "description": "2-3 sentences exploring the shadow side or growth edge of this trait."},
    {"trait": "Specific trait name", "icon": "success", "description": "2-3 sentences about how this trait shapes their path to achievement."},
    {"trait": "Specific trait name", "icon": "spiritual", "description": "2-3 sentences about their relationship with meaning, purpose, and transcendence."}
  ],
  
  "careerWealth": {
    "bestFields": ["Specific field with reasoning", "Second field with reasoning", "Third field with reasoning"],
    "turningPointAge": "Specific age range like 28-32",
    "wealthStyle": "3-4 sentences describing their unique relationship with money, abundance, and material security. Include psychological patterns around earning, saving, and spending. Reference palm indicators.",
    "peakPeriods": [
      {"year": "${currentYear}", "intensity": "building"},
      {"year": "${currentYear + 1}", "intensity": "rising"},
      {"year": "${currentYear + 2}", "intensity": "peak"},
      {"year": "${currentYear + 3}", "intensity": "sustaining"},
      {"year": "${currentYear + 4}", "intensity": "expanding"}
    ]
  },
  
  "loveRelationships": {
    "emotionalStyle": "3-4 sentences exploring their emotional landscape in relationships — attachment patterns, vulnerability, how they express and receive love. Reference heart line and Venus mount observations.",
    "commitmentTendency": "2-3 sentences about their approach to commitment, trust-building, and long-term partnership dynamics.",
    "relationshipAdvice": "2-3 sentences of warm, specific guidance rooted in what the palm reveals — not generic relationship advice."
  },
  
  "lifePhases": {
    "growth": { "period": "Month-Month ${currentYear}", "description": "2-3 sentences describing the specific growth theme, what it demands, and how to maximize it." },
    "challenge": { "period": "Month-Month ${currentYear}", "description": "2-3 sentences about the nature of the challenge, its hidden gift, and how to navigate it with grace." },
    "opportunity": { "period": "Month-Month ${currentYear + 1}", "description": "2-3 sentences about the opportunity window, what it requires, and its potential impact." }
  },

  "next6MonthsFocus": {
    "period": "${sixMonthPeriod}",
    "focusAreas": [
      {"area": "Area name", "action": "2-3 sentences with specific, actionable guidance personalized to their palm's indications."},
      {"area": "Area name", "action": "2-3 sentences with specific, actionable guidance."},
      {"area": "Area name", "action": "2-3 sentences with specific, actionable guidance."}
    ],
    "avoidDuring": "2-3 sentences about what to be cautious about, framed constructively as wisdom rather than fear."
  },
  
  "spiritualRemedies": [
    {"remedy": "Specific practice with detail", "benefit": "What it addresses in their specific palm pattern", "timing": "Precise timing guidance"},
    {"remedy": "Specific practice", "benefit": "Connected to a specific reading insight", "timing": "When and how often"},
    {"remedy": "Specific practice", "benefit": "Targeted benefit", "timing": "Specific timing"},
    {"remedy": "Specific practice", "benefit": "Targeted benefit", "timing": "Specific timing"},
    {"remedy": "Specific practice", "benefit": "Targeted benefit", "timing": "Specific timing"}
  ],
  
  "finalBlessing": "A warm, powerful 3-5 sentence closing that addresses ${name} by name. Synthesize the key themes of the reading into a cohesive message of encouragement. End with a memorable line that feels like a blessing from an elder — something they would screenshot and save. This should feel like the final words of a meaningful conversation, not a template.",
  
  "premiumInsights": {
    "marriageTiming": "A compelling 2-3 sentence locked insight about relationship timing that creates genuine curiosity.",
    "careerBreakthrough": "A compelling 2-3 sentence locked insight about career trajectory that motivates unlocking."
  }
}

Strength values: "Very Strong", "Strong", "Moderate", "Developing", "Faint"
Level values: "High", "Medium", "Low"
Icon values: "drive", "loyalty", "practical", "success", "spiritual"
Intensity values: "building", "rising", "peak", "sustaining", "expanding"

CRITICAL QUALITY CHECK — Before returning, verify:
✓ headlineSummary is 2-3 compelling sentences, not a tagline
✓ Every meaning/description field has 2+ rich sentences
✓ ${name} appears 3-5 times total, NOT in every field
✓ keyInsight fields contain genuine psychological depth
✓ finalBlessing is 3-5 sentences and feels like a personal benediction
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

const generatePalmReading = async (
  imageUrl: string,
  name: string,
  age: string,
  readingType: string,
  apiKey: string,
) => {
  console.log("Step 2: Generating palm reading...");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: getReadingPrompt(name, age, readingType),
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this palm image for ${name}, age ${age}. Generate a deeply personalized ${readingType} destiny report. Address ${name} by name throughout. Return ONLY the JSON object.`,
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
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI reading error:", response.status, errorText);
    throw new Error("Failed to generate palm reading");
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No reading content received");
  }

  try {
    const cleanContent = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    return JSON.parse(cleanContent);
  } catch (parseError) {
    console.error("Failed to parse GPT response as JSON:", parseError);
    console.log("Raw content:", content);

    const now = new Date();
    const currentMonth = now.toLocaleString("en-US", { month: "long" });
    const currentYear = now.getFullYear();
    const futureDate = new Date(now);
    futureDate.setMonth(futureDate.getMonth() + 6);
    const futureMonth = futureDate.toLocaleString("en-US", { month: "long" });
    const futureYear = futureDate.getFullYear();

    return {
      confidenceScore: 82,
      headlineSummary: `${name}, your palm reveals a journey of growth and inner strength ahead.`,
      majorLines: {
        lifeLine: { strength: "Strong", meaning: "Indicates stable energy and vitality.", keyInsight: "Your resilience may grow with age." },
        heartLine: { strength: "Moderate", meaning: "Suggests emotional depth and loyalty.", keyInsight: "Deep connections may matter more than many." },
        headLine: { strength: "Strong", meaning: "Hints at sharp intellect with practical focus.", keyInsight: "Trust your analytical abilities." },
        fateLine: { strength: "Developing", meaning: "Career path patterns suggest increasing clarity.", keyInsight: "Patience may lead to lasting success." },
        sunLine: { strength: "Moderate", meaning: "Recognition patterns suggest reward through genuine work.", keyInsight: "Visibility may build gradually." },
      },
      mounts: {
        venus: { level: "High", meaning: "Suggests strong capacity for love and warmth." },
        jupiter: { level: "Medium", meaning: "Indicates natural leadership potential." },
        saturn: { level: "Medium", meaning: "Points to discipline and responsibility." },
        apollo: { level: "High", meaning: "Hints at creative expression and artistry." },
        mercury: { level: "Medium", meaning: "Suggests communication and adaptability." },
      },
      personalityTraits: [
        { trait: "Inner Drive", icon: "drive", description: "Strong motivation from within" },
        { trait: "Emotional Loyalty", icon: "loyalty", description: "Deep commitment to loved ones" },
        { trait: "Practical Wisdom", icon: "practical", description: "Grounded decision making" },
        { trait: "Late Bloomer Success", icon: "success", description: "Peak achievements may come with maturity" },
        { trait: "Spiritual Inclination", icon: "spiritual", description: "Natural connection to higher purpose" },
      ],
      careerWealth: {
        bestFields: ["Business Strategy", "Creative Industries", "Consulting"],
        turningPointAge: "28-32",
        wealthStyle: "Steady accumulation through consistent effort",
        peakPeriods: [
          { year: `${currentYear}`, intensity: "building" },
          { year: `${currentYear + 1}`, intensity: "rising" },
          { year: `${currentYear + 2}`, intensity: "peak" },
          { year: `${currentYear + 3}`, intensity: "sustaining" },
          { year: `${currentYear + 4}`, intensity: "expanding" },
        ],
      },
      loveRelationships: {
        emotionalStyle: "Deep and committed rather than casual",
        commitmentTendency: "Values long-term bonds over fleeting connections",
        relationshipAdvice: "Trust builds slowly but may last forever",
      },
      lifePhases: {
        growth: { period: `Jan-Apr ${currentYear}`, description: "Internal growth and skill building" },
        challenge: { period: `May-Jul ${currentYear}`, description: "Test of patience and resolve" },
        opportunity: { period: `Aug-Dec ${currentYear}`, description: "New doors may open professionally" },
      },
      next6MonthsFocus: {
        period: `${currentMonth} ${currentYear} - ${futureMonth} ${futureYear}`,
        focusAreas: [
          { area: "Career Development", action: "Focus on skill-building and networking" },
          { area: "Health & Wellness", action: "Establish a consistent morning routine" },
          { area: "Relationships", action: "Invest time in meaningful connections" },
        ],
        avoidDuring: "Avoid impulsive financial decisions during this period",
      },
      spiritualRemedies: [
        { remedy: "Morning meditation", benefit: "Mental clarity", timing: "Daily at sunrise" },
        { remedy: "Gratitude journaling", benefit: "Positive energy", timing: "Every evening" },
        { remedy: "Temple or nature visit", benefit: "Karmic balance", timing: "Weekly" },
        { remedy: "Deep breathing exercises", benefit: "Inner peace", timing: "Before important meetings" },
        { remedy: "Avoid major decisions during stress", benefit: "Better outcomes", timing: "Wait 24 hours" },
      ],
      finalBlessing: `${name}, your palm suggests strength through patience. The journey ahead may be bright when you trust your inner discipline.`,
      premiumInsights: {
        marriageTiming: `Favorable period may appear between ${currentYear + 1}-${currentYear + 3}`,
        careerBreakthrough: `Major advancement patterns suggest growth around ${currentYear + 2}`,
      },
    };
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "OpenAI API key is not configured" }), {
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

    const { imageUrl, name, age, email, readingType }: PalmAnalysisRequest = await req.json();

    if (!imageUrl || !name || !age) {
      return new Response(JSON.stringify({ error: "Missing required fields: imageUrl, name, or age" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing palm reading for ${name}, age ${age}, type: ${readingType}`);

    // STEP 1: Validate the palm image
    const validation = await validatePalmImage(imageUrl, OPENAI_API_KEY);

    // Check if validation passed
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

    console.log("Palm validation passed, generating reading...");

    // STEP 2: Generate the palm reading
    const palmReading = await generatePalmReading(imageUrl, name, age, readingType, OPENAI_API_KEY);

    // STEP 3: Save to database
    const { data: reportData, error: dbError } = await supabase
      .from("palm_reports")
      .insert({
        user_name: name,
        user_age: age,
        user_email: email || null,
        reading_type: readingType,
        image_url: imageUrl,
        validation_confidence: validation.confidence,
        validation_quality: validation.quality,
        report_json: palmReading,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      // Continue even if DB save fails - still return the reading
    } else {
      console.log("Report saved to database:", reportData?.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        validated: true,
        validation,
        reading: palmReading,
        reportId: reportData?.id || null,
        name,
        age,
        readingType,
        generatedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in analyze-palm function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
