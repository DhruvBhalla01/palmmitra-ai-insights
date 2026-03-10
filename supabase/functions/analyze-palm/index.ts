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
              text: `Analyze this palm image for ${name}, age ${age}. Generate a premium ${readingType} destiny report with deep psychological insight and rich detail in every field. Use ${name}'s name sparingly (3-5 times total). Return ONLY the JSON object.`,
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
      headlineSummary: `${name}, there is a quiet authority in the lines of your palm — a story of someone who has weathered inner storms and emerged with a rare kind of clarity. At ${age}, the patterns etched across your hand suggest you are entering a period where long-held potential begins to crystallize into tangible reality.`,
      majorLines: {
        lifeLine: { strength: "Strong", meaning: "Your life line traces a deep, confident arc around the mount of Venus, suggesting robust vitality and an instinctive connection to the physical world. The depth of this line points to someone who recovers from setbacks with surprising speed — not through denial, but through a grounded acceptance that fuels forward movement.", keyInsight: "There is a resilience coded into your palm that goes beyond mere toughness. It suggests someone who transforms difficulty into wisdom — the kind of person others turn to during crisis, not because you have answers, but because your presence itself is steadying." },
        heartLine: { strength: "Moderate", meaning: "The heart line extends with a gentle, steady curve — neither dramatically sweeping nor rigidly straight. This speaks to an emotional nature that values depth over drama, preferring meaningful connection to the intoxication of new romance.", keyInsight: "Your emotional architecture suggests someone who loves with quiet permanence. Trust does not come easily, but once given, it runs deep. The challenge revealed here is not about finding love — it is about allowing yourself to be fully seen within it." },
        headLine: { strength: "Strong", meaning: "A clearly defined head line with good length indicates sharp analytical abilities balanced by creative intuition. The slight downward slope hints at an imaginative mind that can see possibilities others miss, while maintaining enough pragmatism to act on them.", keyInsight: "Your thinking style appears to blend logic with intuition in a way that is distinctly your own. Under pressure, you likely access a calm, almost detached clarity — an ability to step back and see the larger pattern when others are consumed by details." },
        fateLine: { strength: "Developing", meaning: "The fate line shows progressive deepening, suggesting a career path that gains clarity and momentum over time rather than arriving fully formed. This is the mark of someone whose professional identity is self-authored rather than inherited or accidental.", keyInsight: "The developing nature of this line is not a weakness — it reveals someone who builds their path through experience and reflection rather than following a prescribed route. Your most significant professional contributions likely lie ahead, emerging from the intersection of your accumulated skills and evolving sense of purpose." },
        sunLine: { strength: "Moderate", meaning: "A visible sun line suggests that recognition and creative fulfillment are part of your life's trajectory, though they arrive through sustained effort rather than sudden fame. The moderate presence indicates someone who earns respect through substance rather than self-promotion.", keyInsight: "Your relationship with success appears to be private rather than performative. The palm suggests that your greatest satisfaction comes not from external validation but from the quiet knowledge that your work has genuine impact." },
      },
      mounts: {
        venus: { level: "High", meaning: "A well-developed Venus mount reveals a rich inner life of passion, warmth, and sensory appreciation. You likely have a strong aesthetic sensibility and a deep capacity for joy — the kind of person who notices beauty in ordinary moments and brings warmth to every room." },
        jupiter: { level: "Medium", meaning: "The Jupiter mount suggests natural leadership qualities tempered by humility. You lead not through dominance but through competence and quiet example — earning authority rather than demanding it." },
        saturn: { level: "Medium", meaning: "A balanced Saturn mount points to a healthy relationship with responsibility and discipline. You understand that meaningful achievement requires sustained effort, and you possess the patience to see long-term projects through to completion." },
        apollo: { level: "High", meaning: "The prominence of the Apollo mount reveals strong creative potential and an innate desire for self-expression. Whether through art, communication, or problem-solving, there is a distinctive creative signature to everything you undertake." },
        mercury: { level: "Medium", meaning: "The Mercury mount indicates strong communication abilities and intellectual curiosity. You likely excel at translating complex ideas into accessible language — a bridge-builder between different worlds of thought and experience." },
      },
      personalityTraits: [
        { trait: "Quiet Tenacity", icon: "drive", description: "Your palm reveals someone who pursues goals with a steady, almost invisible determination. Where others announce their ambitions, you quietly work toward them — and this understated drive is precisely what makes your achievements so enduring." },
        { trait: "Protective Loyalty", icon: "loyalty", description: "The patterns in your hand suggest a fierce loyalty to those in your inner circle. You do not give trust lightly, but once someone earns it, you become their most reliable anchor — even at personal cost." },
        { trait: "Grounded Pragmatism", icon: "practical", description: "There is a practical intelligence in your palm that keeps you rooted even when emotions run high. You have an instinct for what is workable versus what is merely attractive — a quality that saves you from many of the pitfalls that trap more impulsive natures." },
        { trait: "Delayed Mastery", icon: "success", description: "Your palm carries the signature of someone whose greatest achievements arrive through accumulation rather than sudden breakthrough. Each experience builds upon the last, creating a compound effect that accelerates significantly in your thirties and beyond." },
        { trait: "Intuitive Depth", icon: "spiritual", description: "Beneath the practical exterior, your palm reveals a contemplative nature with access to intuitive knowing. You sense things before you can articulate them — and learning to trust this inner guidance is one of your life's key developmental themes." },
      ],
      careerWealth: {
        bestFields: ["Strategic Advisory & Consulting", "Creative Leadership & Content Strategy", "Education & Knowledge-Based Entrepreneurship"],
        turningPointAge: "28-33",
        wealthStyle: "Your palm suggests a wealth pattern built on expertise and trust rather than speculation or inheritance. Financial growth comes through deepening mastery in your chosen field, with income rising in step with your growing reputation. There is an indication of multiple income streams developing naturally from a core competency.",
        peakPeriods: [
          { year: `${currentYear}`, intensity: "building" },
          { year: `${currentYear + 1}`, intensity: "rising" },
          { year: `${currentYear + 2}`, intensity: "peak" },
          { year: `${currentYear + 3}`, intensity: "sustaining" },
          { year: `${currentYear + 4}`, intensity: "expanding" },
        ],
      },
      loveRelationships: {
        emotionalStyle: "Your heart line and Venus mount together paint a picture of someone who loves with depth and discrimination. You are not drawn to surface-level connections — your emotional fulfillment comes from relationships that offer intellectual stimulation, emotional safety, and genuine mutual growth. You may take longer to open up, but the connections you build tend to be remarkably enduring.",
        commitmentTendency: "Commitment for you is not a decision made in a moment of passion but a gradual deepening of trust and understanding. Once committed, you bring a steadfast presence that becomes the foundation your partner builds their life around.",
        relationshipAdvice: "The palm suggests that your greatest growth in relationships comes from allowing vulnerability earlier in the process. Your natural self-sufficiency, while admirable, can sometimes create distance where closeness is needed. The practice of sharing your inner world before you feel entirely safe is where your deepest relational growth lies.",
      },
      lifePhases: {
        growth: { period: `Jan-Apr ${currentYear}`, description: "A concentrated period of internal development where foundational skills and self-knowledge deepen significantly. The investments you make in yourself during this window — whether through learning, reflection, or strategic planning — set the stage for everything that follows." },
        challenge: { period: `May-Jul ${currentYear}`, description: "A testing period that asks you to hold your course when external circumstances create uncertainty. The challenge here is not the difficulty itself but the temptation to abandon your longer-term vision for short-term relief. Patience is your greatest ally." },
        opportunity: { period: `Aug-Dec ${currentYear}`, description: "A window of expanded possibility where your accumulated preparation meets favorable conditions. New professional connections, creative projects, or leadership opportunities present themselves — the key is recognizing them quickly and committing fully." },
      },
      next6MonthsFocus: {
        period: `${currentMonth} ${currentYear} - ${futureMonth} ${futureYear}`,
        focusAreas: [
          { area: "Professional Positioning", action: "This is an ideal period to consolidate your expertise and make it visible. Whether through a project, presentation, or strategic conversation, ensure that the right people understand the depth of what you bring to the table." },
          { area: "Physical Vitality", action: "Your life line suggests strong baseline energy, but this period calls for intentional investment in physical wellbeing. A consistent morning practice — even 20 minutes of movement and breathwork — amplifies your mental clarity and emotional resilience." },
          { area: "Relationship Deepening", action: "Choose one or two key relationships and invest in them with deliberate attention. The connections you nurture during this period have the potential to become lifelong sources of support, collaboration, and joy." },
        ],
        avoidDuring: "This is not an ideal period for major financial risks or impulsive career changes. The palm patterns suggest that decisions made from anxiety or impatience during this window tend to require correction later. When in doubt, pause for 48 hours before committing to anything irreversible.",
      },
      spiritualRemedies: [
        { remedy: "Sunrise Stillness Practice", benefit: "Aligns with the contemplative depth your palm reveals, creating space for intuitive guidance to surface", timing: "Daily, within 30 minutes of waking — even 10 minutes of silent sitting" },
        { remedy: "Gratitude Journaling", benefit: "Counterbalances the analytical tendency in your head line with deliberate appreciation, opening channels for abundance", timing: "Every evening before sleep — write three specific moments of gratitude" },
        { remedy: "Weekly Nature Immersion", benefit: "Grounds the creative energy indicated by your Apollo mount, preventing mental overwhelm and restoring perspective", timing: "Once weekly — a walk in nature lasting at least 30 minutes, without devices" },
        { remedy: "Pranayama (Alternate Nostril Breathing)", benefit: "Balances the analytical and intuitive aspects revealed in your head line, improving decision-making clarity", timing: "Before important meetings or decisions — 5-7 minutes of Anulom Vilom" },
        { remedy: "Acts of Quiet Generosity", benefit: "Activates the warm, compassionate energy indicated by your Venus mount and supports karmic alignment", timing: "Weekly — one act of kindness performed without expectation of recognition or return" },
      ],
      finalBlessing: `${name}, your palm tells the story of someone whose greatest chapter is still being written. The lines etched into your hand speak of quiet strength, deep loyalty, and a creative intelligence that grows more powerful with time. At ${age}, you stand at a threshold — the foundations you have built are solid, and what rises from them now has the potential to exceed even your own expectations. Trust the pace of your unfolding. The world needs exactly the kind of light you carry — steady, warm, and enduring.`,
      premiumInsights: {
        marriageTiming: `Your heart line and Venus mount together reveal a significant relationship window opening between ${currentYear + 1} and ${currentYear + 3}. The patterns suggest a connection that begins through shared intellectual or creative interests before deepening into something profound.`,
        careerBreakthrough: `The progressive deepening of your fate line points to a notable career inflection around ${currentYear + 2}, where accumulated expertise and expanding visibility converge to create opportunities that significantly elevate your professional standing.`,
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
