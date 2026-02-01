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
  const basePrompt = `You are PalmMitra AI — India’s most premium palmistry expert trained in Hast Rekha Shastra.

Your job is to analyze the uploaded REAL palm photo and generate a deeply personalized destiny report.

STRICT RULES (VERY IMPORTANT):

1. NEVER write generic statements that apply to everyone.
Every insight must feel specific and unique to THIS palm.

2. If palm lines are unclear, be honest and reduce confidence score.
Do NOT hallucinate.

3. All timelines must be future-based only.
The current year is 2026.
DO NOT mention past years like 2024 or 2025.

Life phases must always follow:
- Growth Phase: 2026–2027
- Peak Phase: 2028
- Expansion Phase: 2029–2030

4. Remedies must be practical + culturally safe:
- Meditation
- Journaling
- Temple/nature grounding
Gemstones are OPTIONAL traditions only, not guaranteed outcomes.

5. Tone must feel like a luxury paid report:
Warm, spiritual, Indian, premium, highly believable.

6. Output must be valid JSON ONLY.
No markdown, no extra text.

Format your response as a JSON object with this EXACT structure:

{
  "confidenceScore": 85,
  "headlineSummary": "Your palm reveals a journey of [key theme based on palm].",
  
  "majorLines": {
    "lifeLine": {
      "strength": "Strong",
      "meaning": "Detailed meaning about vitality and life energy",
      "keyInsight": "One powerful insight about their life path"
    },
    "heartLine": {
      "strength": "Moderate",
      "meaning": "Detailed meaning about emotions and love",
      "keyInsight": "One powerful insight about emotional nature"
    },
    "headLine": {
      "strength": "Strong",
      "meaning": "Detailed meaning about intellect and focus",
      "keyInsight": "One powerful insight about thinking style"
    },
    "fateLine": {
      "strength": "Developing",
      "meaning": "Detailed meaning about career and destiny",
      "keyInsight": "One powerful insight about life direction"
    },
    "sunLine": {
      "strength": "Present",
      "meaning": "Detailed meaning about recognition and success",
      "keyInsight": "One powerful insight about fame/recognition"
    }
  },
  
  "mounts": {
    "venus": {
      "level": "High",
      "meaning": "What this mount indicates about love and warmth"
    },
    "jupiter": {
      "level": "Medium",
      "meaning": "What this mount indicates about leadership"
    },
    "saturn": {
      "level": "Medium",
      "meaning": "What this mount indicates about discipline"
    },
    "apollo": {
      "level": "High",
      "meaning": "What this mount indicates about creativity"
    },
    "mercury": {
      "level": "Medium",
      "meaning": "What this mount indicates about communication"
    }
  },
  
  "personalityTraits": [
    {"trait": "Trait name", "icon": "drive", "description": "Brief description"},
    {"trait": "Trait name", "icon": "loyalty", "description": "Brief description"},
    {"trait": "Trait name", "icon": "practical", "description": "Brief description"},
    {"trait": "Trait name", "icon": "success", "description": "Brief description"},
    {"trait": "Trait name", "icon": "spiritual", "description": "Brief description"}
  ],
  
  "careerWealth": {
    "bestFields": ["Field 1", "Field 2", "Field 3"],
    "turningPointAge": "28-32",
    "wealthStyle": "Steady growth through consistent effort rather than sudden windfalls",
    "peakPeriods": [
      {"year": "2026", "intensity": "building"},
      {"year": "2027", "intensity": "rising"},
      {"year": "2028", "intensity": "peak"},
      {"year": "2029", "intensity": "sustaining"},
      {"year": "2030", "intensity": "expanding"}
    ]
  },
  
  "loveRelationships": {
    "emotionalStyle": "Description of their emotional nature in relationships",
    "commitmentTendency": "How they approach commitment",
    "relationshipAdvice": "Gentle spiritual advice for love life"
  },
  
  "lifePhases": {
    "growth": {
      "period": "Month-Month Year",
      "description": "What growth looks like in this period"
    },
    "challenge": {
      "period": "Month-Month Year",
      "description": "What challenges to navigate"
    },
    "opportunity": {
      "period": "Month-Month Year",
      "description": "What opportunities will arise"
    }
  },
  
  "spiritualRemedies": [
    {"remedy": "Specific remedy", "benefit": "What it helps with", "timing": "When to do it"},
    {"remedy": "Specific remedy", "benefit": "What it helps with", "timing": "When to do it"},
    {"remedy": "Specific remedy", "benefit": "What it helps with", "timing": "When to do it"},
    {"remedy": "Specific remedy", "benefit": "What it helps with", "timing": "When to do it"},
    {"remedy": "Specific remedy", "benefit": "What it helps with", "timing": "When to do it"}
  ],
  
  "finalBlessing": "A personalized blessing message addressing them by name with encouragement based on their palm reading",
  
  "premiumInsights": {
    "marriageTiming": "Locked insight about marriage timing",
    "careerBreakthrough": "Locked insight about career breakthrough year",
    "gemstoneRecommendation": "Locked gemstone suggestion"
  }
}

Strength values should be: "Very Strong", "Strong", "Moderate", "Developing", "Faint"
Level values should be: "High", "Medium", "Low"
Icon values should be: "drive", "loyalty", "practical", "success", "spiritual"
Intensity values should be: "building", "rising", "peak", "sustaining", "expanding"

Make the report worth paying ₹99–₹999 for:

- Clear destiny highlight
- Career roadmap
- Love pattern insights
- Action plan for next 6 months
- Premium locked insights with deeper detail`;

  const focusAdditions: Record<string, string> = {
    career: `\n\nFocus especially on career and professional aspects. Give extra detail about fate line, sun line, and mounts related to success.`,
    love: `\n\nFocus especially on love and relationships. Give extra detail about heart line, Venus mount, and marriage lines.`,
    wealth: `\n\nFocus especially on wealth and prosperity. Give extra detail about fate line, sun line, and mounts related to financial success.`,
    full: `\n\nProvide a comprehensive reading covering all aspects of life with equal depth.`,
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
              text: `Analyze this palm image for ${name} and provide a detailed ${readingType} palm reading. Return ONLY the JSON object, no additional text or markdown.`,
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

    // Return fallback structure
    return {
      confidenceScore: 82,
      headlineSummary: `Your palm reveals a journey of growth and inner strength, ${name}.`,
      majorLines: {
        lifeLine: {
          strength: "Strong",
          meaning: "Indicates stable energy and vitality.",
          keyInsight: "Your resilience grows with age.",
        },
        heartLine: {
          strength: "Moderate",
          meaning: "Shows emotional depth and loyalty.",
          keyInsight: "Deep connections matter more than many.",
        },
        headLine: {
          strength: "Strong",
          meaning: "Sharp intellect with practical focus.",
          keyInsight: "Trust your analytical abilities.",
        },
        fateLine: {
          strength: "Developing",
          meaning: "Career path becoming clearer.",
          keyInsight: "Patience leads to lasting success.",
        },
        sunLine: {
          strength: "Present",
          meaning: "Recognition comes through genuine work.",
          keyInsight: "Fame follows authenticity.",
        },
      },
      mounts: {
        venus: { level: "High", meaning: "Strong capacity for love and warmth." },
        jupiter: { level: "Medium", meaning: "Natural leadership potential." },
        saturn: { level: "Medium", meaning: "Discipline and responsibility." },
        apollo: { level: "High", meaning: "Creative expression and artistry." },
        mercury: { level: "Medium", meaning: "Communication and adaptability." },
      },
      personalityTraits: [
        { trait: "Inner Drive", icon: "drive", description: "Strong motivation from within" },
        { trait: "Emotional Loyalty", icon: "loyalty", description: "Deep commitment to loved ones" },
        { trait: "Practical Wisdom", icon: "practical", description: "Grounded decision making" },
        { trait: "Late Bloomer Success", icon: "success", description: "Peak achievements come with maturity" },
        { trait: "Spiritual Inclination", icon: "spiritual", description: "Natural connection to higher purpose" },
      ],
      careerWealth: {
        bestFields: ["Business Strategy", "Creative Industries", "Consulting"],
        turningPointAge: "28-32",
        wealthStyle: "Steady accumulation through consistent effort",
        peakPeriods: [
          { year: "2026", intensity: "building" },
          { year: "2027", intensity: "rising" },
          { year: "2028", intensity: "peak" },
          { year: "2029", intensity: "sustaining" },
          { year: "2030", intensity: "expanding" },
        ],
      },
      loveRelationships: {
        emotionalStyle: "Deep and committed rather than casual",
        commitmentTendency: "Values long-term bonds over fleeting connections",
        relationshipAdvice: "Trust builds slowly but lasts forever",
      },
      lifePhases: {
        growth: { period: "Jan-Apr 2026", description: "Internal growth and skill building" },
        challenge: { period: "May-Jul 2026", description: "Test of patience and resolve" },
        opportunity: { period: "Aug-Dec 2026", description: "New doors open professionally" },
      },
      spiritualRemedies: [
        { remedy: "Morning meditation", benefit: "Mental clarity", timing: "Daily at sunrise" },
        { remedy: "Charity on Saturdays", benefit: "Karmic balance", timing: "Weekly" },
        { remedy: "Chant Om Namah Shivaya", benefit: "Inner peace", timing: "108 times daily" },
        { remedy: "Wear light colors", benefit: "Positive energy", timing: "Important meetings" },
        { remedy: "Avoid major decisions during stress", benefit: "Better outcomes", timing: "Wait 24 hours" },
      ],
      finalBlessing: `${name}, your palm shows strength through patience. The journey ahead is bright when you trust your inner discipline.`,
      premiumInsights: {
        marriageTiming: "Favorable period between 2027-2029",
        careerBreakthrough: "Major advancement expected around 2028",
        gemstoneRecommendation: "Yellow Sapphire for Jupiter's blessings",
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
