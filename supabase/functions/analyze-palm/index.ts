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

  const basePrompt = `You are PalmMitra AI — India's most premium palmistry expert trained in Hast Rekha Shastra.

You are generating a deeply personalized destiny report for ${name}, age ${age}.

STRICT RULES (NON-NEGOTIABLE):

1. PERSONALIZATION IS MANDATORY
- Address ${name} by name throughout the report (headline, insights, blessing, remedies).
- Reference their age (${age}) contextually — e.g. "At ${age}, your palm suggests…"
- Every insight must feel unique to THIS person's palm. No generic filler.

2. IMAGE-BASED ANALYSIS ONLY
- Analyze the visible lines, mounts, and markings in the uploaded palm photo.
- If any line is unclear or faint, honestly reduce the confidence score and note uncertainty.
- NEVER hallucinate details that are not visible. Say "not clearly visible" when appropriate.

3. FUTURE-ONLY TIMELINES
- The current date is ${currentMonth} ${currentYear}.
- ALL dates, timelines, and predictions must be from ${currentYear} onward.
- NEVER mention past years. No retroactive claims.
- Use exact month ranges where possible (e.g. "March ${currentYear} - June ${currentYear}").

4. TRUST-SAFE LANGUAGE
- NEVER say "you will", "you are destined to", "guaranteed", "certainly".
- INSTEAD use: "may suggest", "indicates potential", "patterns reveal", "your palm hints at".
- This protects both user expectations and legal safety.

5. NO GEMSTONES
- Remedies must ONLY include: meditation, journaling, temple/nature visits, gratitude practices, breathing exercises.
- Do NOT recommend gemstones, rings, or any purchasable items.

6. PREMIUM TONE
- Warm, spiritual, Indian, calm, respectful, legally safe.
- The report must feel like a luxury document worth paying for.
- Use poetic but grounded language rooted in Indian palmistry tradition.

7. READING TYPE FOCUS
- The reading type is "${readingType}". Adjust emphasis accordingly.

8. OUTPUT FORMAT
- Return ONLY a valid JSON object. No markdown, no backticks, no extra text.

Generate the report as a JSON object with this EXACT structure:

{
  "confidenceScore": 85,
  "headlineSummary": "A 1-2 line personalized headline addressing ${name} by name with their key destiny theme",
  
  "majorLines": {
    "lifeLine": {
      "strength": "Strong",
      "meaning": "Detailed meaning specific to what you see in the palm",
      "keyInsight": "One powerful, personalized insight for ${name}"
    },
    "heartLine": {
      "strength": "Moderate",
      "meaning": "Detailed meaning about emotions based on the palm",
      "keyInsight": "One powerful insight about emotional nature"
    },
    "headLine": {
      "strength": "Strong",
      "meaning": "Detailed meaning about intellect based on the palm",
      "keyInsight": "One powerful insight about thinking style"
    },
    "fateLine": {
      "strength": "Developing",
      "meaning": "Detailed meaning about career/destiny from the palm",
      "keyInsight": "One powerful insight about life direction"
    },
    "sunLine": {
      "strength": "Moderate",
      "meaning": "Detailed meaning about recognition from the palm",
      "keyInsight": "One powerful insight about recognition path"
    }
  },
  
  "mounts": {
    "venus": { "level": "High", "meaning": "What this mount reveals for ${name}" },
    "jupiter": { "level": "Medium", "meaning": "What this mount reveals about leadership" },
    "saturn": { "level": "Medium", "meaning": "What this mount reveals about discipline" },
    "apollo": { "level": "High", "meaning": "What this mount reveals about creativity" },
    "mercury": { "level": "Medium", "meaning": "What this mount reveals about communication" }
  },
  
  "personalityTraits": [
    {"trait": "Trait name", "icon": "drive", "description": "Brief personalized description"},
    {"trait": "Trait name", "icon": "loyalty", "description": "Brief personalized description"},
    {"trait": "Trait name", "icon": "practical", "description": "Brief personalized description"},
    {"trait": "Trait name", "icon": "success", "description": "Brief personalized description"},
    {"trait": "Trait name", "icon": "spiritual", "description": "Brief personalized description"}
  ],
  
  "careerWealth": {
    "bestFields": ["Field 1", "Field 2", "Field 3"],
    "turningPointAge": "Age range based on palm analysis",
    "wealthStyle": "Personalized wealth pattern description for ${name}",
    "peakPeriods": [
      {"year": "${currentYear}", "intensity": "building"},
      {"year": "${currentYear + 1}", "intensity": "rising"},
      {"year": "${currentYear + 2}", "intensity": "peak"},
      {"year": "${currentYear + 3}", "intensity": "sustaining"},
      {"year": "${currentYear + 4}", "intensity": "expanding"}
    ]
  },
  
  "loveRelationships": {
    "emotionalStyle": "Personalized emotional nature description for ${name}",
    "commitmentTendency": "How ${name} may approach commitment based on palm",
    "relationshipAdvice": "Gentle, trust-safe spiritual advice"
  },
  
  "lifePhases": {
    "growth": { "period": "Month-Month ${currentYear}", "description": "Growth description" },
    "challenge": { "period": "Month-Month ${currentYear}", "description": "Challenge description" },
    "opportunity": { "period": "Month-Month ${currentYear + 1}", "description": "Opportunity description" }
  },

  "next6MonthsFocus": {
    "period": "${sixMonthPeriod}",
    "focusAreas": [
      {"area": "Area name", "action": "Specific personalized action for ${name}"},
      {"area": "Area name", "action": "Specific personalized action"},
      {"area": "Area name", "action": "Specific personalized action"}
    ],
    "avoidDuring": "What ${name} should be cautious about in this period"
  },
  
  "spiritualRemedies": [
    {"remedy": "Specific remedy", "benefit": "What it helps with", "timing": "When to do it"},
    {"remedy": "Specific remedy", "benefit": "What it helps with", "timing": "When to do it"},
    {"remedy": "Specific remedy", "benefit": "What it helps with", "timing": "When to do it"},
    {"remedy": "Specific remedy", "benefit": "What it helps with", "timing": "When to do it"},
    {"remedy": "Specific remedy", "benefit": "What it helps with", "timing": "When to do it"}
  ],
  
  "finalBlessing": "A warm, personalized blessing addressing ${name} by name, referencing their palm's unique strengths",
  
  "premiumInsights": {
    "marriageTiming": "Locked insight about marriage timing for ${name}",
    "careerBreakthrough": "Locked insight about career breakthrough for ${name}"
  }
}

Strength values: "Very Strong", "Strong", "Moderate", "Developing", "Faint"
Level values: "High", "Medium", "Low"
Icon values: "drive", "loyalty", "practical", "success", "spiritual"
Intensity values: "building", "rising", "peak", "sustaining", "expanding"`;

  const focusAdditions: Record<string, string> = {
    career: `\n\nREADING TYPE: CAREER FOCUS
Give extra depth and detail to the fate line, sun line, and Jupiter/Mercury mounts.
The careerWealth section should be the most detailed part of the report.
Include specific industry/field suggestions based on palm patterns.
The next6MonthsFocus should emphasize professional actions and career moves.`,
    love: `\n\nREADING TYPE: LOVE FOCUS
Give extra depth and detail to the heart line, Venus mount, and relationship indicators.
The loveRelationships section should be the most detailed part of the report.
Include nuanced emotional and compatibility insights based on palm patterns.
The next6MonthsFocus should emphasize relationship growth and emotional actions.`,
    wealth: `\n\nREADING TYPE: WEALTH FOCUS
Give extra depth and detail to the fate line, sun line, and financial indicators.
The careerWealth section should be the most detailed part with wealth-specific insights.
Include specific financial tendency patterns and growth cycles.
The next6MonthsFocus should emphasize financial planning and wealth-building actions.`,
    full: `\n\nREADING TYPE: FULL COMPREHENSIVE
Provide balanced, thorough coverage across all life areas — career, love, health, spirituality.
No single section should dominate. Give equal depth to all insights.
The next6MonthsFocus should cover a mix of personal, professional, and spiritual actions.`,
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
