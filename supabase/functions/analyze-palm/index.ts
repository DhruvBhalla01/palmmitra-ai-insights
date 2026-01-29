import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface PalmAnalysisRequest {
  palmImage: string;
  name: string;
  age: string;
  readingType: 'full' | 'career' | 'love' | 'wealth';
}

const getReadingPrompt = (name: string, age: string, readingType: string) => {
  const basePrompt = `You are an expert palmist with deep knowledge of Indian palmistry (Hast Rekha Shastra). Analyze the palm image provided and give a highly detailed, personalized premium reading for ${name}, who is ${age} years old.

Your reading should be:
- Written in a warm, mystical but professional tone
- Include specific observations about the palm lines you can see
- Provide actionable insights and guidance
- Feel authentic to Indian spiritual traditions
- Include lucky periods and spiritual remedies

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

Make the reading feel authentic, specific to Indian palmistry traditions, and worth paying for.`;

  const focusAdditions: Record<string, string> = {
    career: `\n\nFocus especially on career and professional aspects. Give extra detail about fate line, sun line, and mounts related to success.`,
    love: `\n\nFocus especially on love and relationships. Give extra detail about heart line, Venus mount, and marriage lines.`,
    wealth: `\n\nFocus especially on wealth and prosperity. Give extra detail about fate line, sun line, and mounts related to financial success.`,
    full: `\n\nProvide a comprehensive reading covering all aspects of life with equal depth.`
  };

  return basePrompt + (focusAdditions[readingType] || focusAdditions.full);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { palmImage, name, age, readingType }: PalmAnalysisRequest = await req.json();

    if (!palmImage || !name || !age) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: palmImage, name, or age' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing premium palm reading for ${name}, age ${age}, type: ${readingType}`);

    let imageUrl = palmImage;
    if (!palmImage.startsWith('data:')) {
      imageUrl = `data:image/jpeg;base64,${palmImage}`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: getReadingPrompt(name, age, readingType)
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this palm image for ${name} and provide a detailed ${readingType} palm reading. Return ONLY the JSON object, no additional text or markdown.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to analyze palm image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in OpenAI response');
      return new Response(
        JSON.stringify({ error: 'No analysis content received' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let palmReading;
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      palmReading = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse GPT response as JSON:', parseError);
      console.log('Raw content:', content);
      
      // Fallback structure
      palmReading = {
        confidenceScore: 82,
        headlineSummary: `Your palm reveals a journey of growth and inner strength, ${name}.`,
        majorLines: {
          lifeLine: { strength: "Strong", meaning: "Indicates stable energy and vitality.", keyInsight: "Your resilience grows with age." },
          heartLine: { strength: "Moderate", meaning: "Shows emotional depth and loyalty.", keyInsight: "Deep connections matter more than many." },
          headLine: { strength: "Strong", meaning: "Sharp intellect with practical focus.", keyInsight: "Trust your analytical abilities." },
          fateLine: { strength: "Developing", meaning: "Career path becoming clearer.", keyInsight: "Patience leads to lasting success." },
          sunLine: { strength: "Present", meaning: "Recognition comes through genuine work.", keyInsight: "Fame follows authenticity." }
        },
        mounts: {
          venus: { level: "High", meaning: "Strong capacity for love and warmth." },
          jupiter: { level: "Medium", meaning: "Natural leadership potential." },
          saturn: { level: "Medium", meaning: "Discipline and responsibility." },
          apollo: { level: "High", meaning: "Creative expression and artistry." },
          mercury: { level: "Medium", meaning: "Communication and adaptability." }
        },
        personalityTraits: [
          { trait: "Inner Drive", icon: "drive", description: "Strong motivation from within" },
          { trait: "Emotional Loyalty", icon: "loyalty", description: "Deep commitment to loved ones" },
          { trait: "Practical Wisdom", icon: "practical", description: "Grounded decision making" },
          { trait: "Late Bloomer Success", icon: "success", description: "Peak achievements come with maturity" },
          { trait: "Spiritual Inclination", icon: "spiritual", description: "Natural connection to higher purpose" }
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
            { year: "2030", intensity: "expanding" }
          ]
        },
        loveRelationships: {
          emotionalStyle: "Deep and committed rather than casual",
          commitmentTendency: "Values long-term bonds over fleeting connections",
          relationshipAdvice: "Trust builds slowly but lasts forever"
        },
        lifePhases: {
          growth: { period: "Jan-Apr 2026", description: "Internal growth and skill building" },
          challenge: { period: "May-Jul 2026", description: "Test of patience and resolve" },
          opportunity: { period: "Aug-Dec 2026", description: "New doors open professionally" }
        },
        spiritualRemedies: [
          { remedy: "Morning meditation", benefit: "Mental clarity", timing: "Daily at sunrise" },
          { remedy: "Charity on Saturdays", benefit: "Karmic balance", timing: "Weekly" },
          { remedy: "Chant Om Namah Shivaya", benefit: "Inner peace", timing: "108 times daily" },
          { remedy: "Wear light colors", benefit: "Positive energy", timing: "Important meetings" },
          { remedy: "Avoid major decisions during stress", benefit: "Better outcomes", timing: "Wait 24 hours" }
        ],
        finalBlessing: `${name}, your palm shows strength through patience. The journey ahead is bright when you trust your inner discipline.`,
        premiumInsights: {
          marriageTiming: "Favorable period between 2027-2029",
          careerBreakthrough: "Major advancement expected around 2028",
          gemstoneRecommendation: "Yellow Sapphire for Jupiter's blessings"
        }
      };
    }

    console.log('Premium palm reading generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        reading: palmReading,
        name,
        age,
        readingType,
        generatedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-palm function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
