import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface PalmAnalysisRequest {
  palmImage: string; // base64 encoded image
  name: string;
  age: string;
  readingType: 'full' | 'career' | 'love' | 'wealth';
}

const getReadingPrompt = (name: string, age: string, readingType: string) => {
  const basePrompt = `You are an expert palmist with deep knowledge of Indian palmistry (Hast Rekha Shastra). Analyze the palm image provided and give a detailed, personalized reading for ${name}, who is ${age} years old.

Your reading should be:
- Written in a warm, mystical but professional tone
- Include specific observations about the palm lines you can see
- Provide actionable insights and guidance
- Include lucky periods and spiritual remedies where appropriate

Format your response as a JSON object with the following structure:
{
  "overview": "A 2-3 sentence personalized greeting and overall impression",
  "lifeLine": {
    "observation": "What you observe about their life line",
    "meaning": "What this means for their vitality, health, and major life changes"
  },
  "heartLine": {
    "observation": "What you observe about their heart line",
    "meaning": "What this means for their emotional nature and relationships"
  },
  "headLine": {
    "observation": "What you observe about their head line",
    "meaning": "What this means for their thinking style and intellectual pursuits"
  },
  "fateLine": {
    "observation": "What you observe about their fate/destiny line",
    "meaning": "What this means for their career and life path"
  },
  "personality": ["Array of 4-5 personality traits based on palm features"],
  "strengths": ["Array of 3-4 key strengths"],
  "challenges": ["Array of 2-3 potential challenges to be aware of"],
  "luckyPeriods": [
    {"period": "Month/Year range", "significance": "What makes this period lucky"}
  ],
  "spiritualRemedies": [
    {"remedy": "Specific remedy", "benefit": "What it helps with"}
  ],
  "finalMessage": "An inspiring closing message with blessings"
}`;

  const focusAdditions: Record<string, string> = {
    career: `\n\nFocus especially on career and professional aspects. Give extra detail about their fate line and mounts related to success, leadership, and financial prosperity.`,
    love: `\n\nFocus especially on love and relationships. Give extra detail about their heart line, marriage lines, and aspects related to romantic partnerships and emotional connections.`,
    wealth: `\n\nFocus especially on wealth and prosperity. Give extra detail about lines and mounts related to financial success, business acumen, and material abundance.`,
    full: `\n\nProvide a comprehensive reading covering all aspects of life equally.`
  };

  return basePrompt + (focusAdditions[readingType] || focusAdditions.full);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { palmImage, name, age, readingType }: PalmAnalysisRequest = await req.json();

    if (!palmImage || !name || !age) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: palmImage, name, or age' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing palm reading for ${name}, age ${age}, type: ${readingType}`);

    // Prepare the image for OpenAI API
    // Handle both base64 data URLs and raw base64
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
                text: `Please analyze this palm image and provide a detailed ${readingType} palm reading. Return ONLY the JSON object, no additional text.`
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
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to analyze palm image' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in OpenAI response');
      return new Response(
        JSON.stringify({ error: 'No analysis content received' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse the JSON response from GPT
    let palmReading;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      palmReading = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse GPT response as JSON:', parseError);
      console.log('Raw content:', content);
      
      // Return the raw content if JSON parsing fails
      palmReading = {
        overview: content,
        lifeLine: { observation: "Analysis included in overview", meaning: "" },
        heartLine: { observation: "Analysis included in overview", meaning: "" },
        headLine: { observation: "Analysis included in overview", meaning: "" },
        fateLine: { observation: "Analysis included in overview", meaning: "" },
        personality: [],
        strengths: [],
        challenges: [],
        luckyPeriods: [],
        spiritualRemedies: [],
        finalMessage: "May the stars guide your path."
      };
    }

    console.log('Palm reading generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        reading: palmReading,
        name,
        readingType 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in analyze-palm function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
