import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
}

const validatePalmImage = async (imageUrl: string, apiKey: string): Promise<{ is_palm: boolean; confidence: number }> => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
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
  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    console.error("validatePalmImage JSON parse error:", cleaned.slice(0, 200));
    return { is_palm: false, confidence: 0, quality: "poor", reason: "parse_error" };
  }
};

const generateCompatibilityReading = async (
  image1Url: string,
  image2Url: string,
  person1: { name: string; age: string },
  person2: { name: string; age: string },
  relationshipType: string,
  apiKey: string
): Promise<object> => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are PalmMitra AI — a master palmist trained in ancient Indian Hast Rekha Shastra with deep knowledge of compatibility analysis between two palms. Analyze both palm images provided and generate a detailed, personalized compatibility reading.

Your analysis must be:
- Deeply personalized using both people's names throughout
- Rooted in traditional palmistry (life line, heart line, head line, fate line, mounts of Venus/Jupiter/Mercury)
- Warm, insightful, and emotionally resonant
- Specific to the relationship type: ${relationshipType}
- Honest about both strengths AND growth areas

Return ONLY valid JSON, no markdown or extra text.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze the compatibility between ${person1.name} (age ${person1.age}) and ${person2.name} (age ${person2.age}) — relationship type: ${relationshipType}.

The first image is ${person1.name}'s palm. The second image is ${person2.name}'s palm.

Return this exact JSON structure with rich, personalized content (minimum 3 sentences per text field):
{
  "person1Name": "${person1.name}",
  "person2Name": "${person2.name}",
  "relationshipType": "${relationshipType}",
  "overallScore": <integer 55-95>,
  "compatibilityVerdict": "<one of: Soulmate Connection | Complementary Partners | Growth Mirrors | Harmonious Bond | Dynamic Duo | Kindred Spirits>",
  "overallNarrative": "<3-4 sentence overview of their compatibility story referencing both names and specific palm observations>",
  "emotionalBond": {
    "score": <integer 50-98>,
    "title": "Emotional Bond",
    "text": "<3-4 sentence analysis of their emotional compatibility based on heart line comparison>",
    "guidance": "<1-2 sentence actionable guidance for strengthening emotional bond>"
  },
  "communication": {
    "score": <integer 50-98>,
    "title": "Communication Harmony",
    "text": "<3-4 sentence analysis of communication styles based on head line and Mercury mount>",
    "guidance": "<1-2 sentence actionable guidance>"
  },
  "lifeGoals": {
    "score": <integer 50-98>,
    "title": "Life Goals Alignment",
    "text": "<3-4 sentence analysis of destiny alignment based on fate lines>",
    "guidance": "<1-2 sentence actionable guidance>"
  },
  "romance": {
    "score": <integer 50-98>,
    "title": "Romantic Resonance",
    "text": "<3-4 sentence analysis of romantic energy based on Venus mount and heart line>",
    "guidance": "<1-2 sentence actionable guidance>"
  },
  "spiritualAlignment": {
    "score": <integer 50-98>,
    "title": "Spiritual Alignment",
    "text": "<3-4 sentence analysis of spiritual energy compatibility>",
    "guidance": "<1-2 sentence actionable guidance>"
  },
  "strengthsAndChallenges": {
    "strengths": ["<strength 1 specific to their palms>", "<strength 2>", "<strength 3>"],
    "challenges": ["<challenge 1 specific to their palms>", "<challenge 2>", "<challenge 3>"],
    "growthPath": "<2-3 sentence description of how this pair can grow together>"
  },
  "timingGuidance": "<2-3 sentence description of the best window/period for this pair to make major decisions or commitments together, referencing current year>",
  "remediesForPair": [
    "<specific spiritual remedy 1 for this pair — name, what to do, when>",
    "<specific spiritual remedy 2 for this pair>"
  ],
  "finalBlessing": "<3-4 sentence personalized divine blessing for ${person1.name} and ${person2.name} together, poetic and warm>"
}`,
            },
            { type: "image_url", image_url: { url: image1Url, detail: "high" } },
            { type: "image_url", image_url: { url: image2Url, detail: "high" } },
          ],
        },
      ],
      max_tokens: 3000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("OpenAI compatibility error:", response.status, err);
    throw new Error("Failed to generate compatibility reading");
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    console.error("generateCompatibilityReading JSON parse error:", cleaned.slice(0, 300));
    throw new Error("AI response parsing failed — please try again.");
  }
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
    const body: PalmMatchRequest = await req.json();
    const { image1Url, image2Url, person1, person2, relationshipType, email } = body;

    if (!image1Url || !image2Url || !person1?.name || !person2?.name || !email) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`PalmMatch: Validating palms for ${person1.name} & ${person2.name}`);

    // Validate both palms in parallel
    const [validation1, validation2] = await Promise.all([
      validatePalmImage(image1Url, openaiApiKey),
      validatePalmImage(image2Url, openaiApiKey),
    ]);

    if (!validation1.is_palm || validation1.confidence < 50) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "invalid_palm",
          person: "person1",
          message: `${person1.name}'s image doesn't appear to be a clear palm photo. Please re-upload.`,
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
          message: `${person2.name}'s image doesn't appear to be a clear palm photo. Please re-upload.`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Both palms validated. Generating compatibility reading...");

    const reading = await generateCompatibilityReading(
      image1Url, image2Url, person1, person2, relationshipType, openaiApiKey
    );

    const reportId = `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const { error: dbError } = await supabaseClient.from("palmmatch_reports").insert({
      report_id: reportId,
      person1_name: person1.name,
      person2_name: person2.name,
      person1_age: parseInt(person1.age) || null,
      person2_age: parseInt(person2.age) || null,
      relationship_type: relationshipType,
      email,
      overall_score: (reading as { overallScore?: number }).overallScore || 75,
      reading,
      is_unlocked: false,
    });

    if (dbError) {
      console.error("DB insert error:", dbError);
    }

    return new Response(
      JSON.stringify({ success: true, reading, reportId, generatedAt: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("PalmMatch edge function error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
