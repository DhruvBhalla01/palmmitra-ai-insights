import type { PalmReading } from "@/components/report/types";

export const sampleReading: PalmReading = {
  confidenceScore: 85,
  headlineSummary: "A steady, resilient path with meaningful growth ahead.",
  majorLines: {
    lifeLine: {
      strength: "Strong",
      meaning: "Balanced energy with steady vitality.",
      keyInsight: "Consistency is your advantage.",
    },
    heartLine: {
      strength: "Moderate",
      meaning: "Emotionally grounded and thoughtful.",
      keyInsight: "Trust grows with clarity.",
    },
    headLine: {
      strength: "Strong",
      meaning: "Practical, focused thinking.",
      keyInsight: "A clear plan unlocks momentum.",
    },
    fateLine: {
      strength: "Developing",
      meaning: "A path that strengthens with time.",
      keyInsight: "Stay open to unexpected turns.",
    },
    sunLine: {
      strength: "Moderate",
      meaning: "Recognition through steady work.",
      keyInsight: "Visibility builds gradually.",
    },
  },
  mounts: {
    venus: { level: "High", meaning: "Warm, magnetic energy." },
    jupiter: { level: "Medium", meaning: "Balanced ambition." },
    saturn: { level: "Medium", meaning: "Practical discipline." },
    apollo: { level: "Low", meaning: "Quiet creativity." },
    mercury: { level: "High", meaning: "Sharp communication." },
  },
  personalityTraits: [
    { trait: "Focused", icon: "drive", description: "You thrive with clear goals." },
    { trait: "Loyal", icon: "loyalty", description: "You value long-term bonds." },
  ],
  careerWealth: {
    bestFields: ["Technology", "Education"],
    turningPointAge: "32",
    wealthStyle: "Steady accumulation through skill-building.",
    peakPeriods: [{ year: "2030", intensity: "peak" }],
  },
  loveRelationships: {
    emotionalStyle: "Calm and sincere",
    commitmentTendency: "Long-term oriented",
    relationshipAdvice: "Communicate early and often.",
  },
  lifePhases: {
    growth: { period: "2026-2029", description: "Momentum builds." },
    challenge: { period: "2029-2031", description: "Refine priorities." },
    opportunity: { period: "2031-2034", description: "Breakthrough potential." },
  },
  spiritualRemedies: [
    { remedy: "Morning meditation", benefit: "Clarity and calm", timing: "Daily" },
    { remedy: "Gratitude journal", benefit: "Positive focus", timing: "Weekly" },
  ],
  finalBlessing: "May your path be guided by wisdom and patience.",
  premiumInsights: {
    marriageTiming: "Favorable alignment in your early 30s.",
    careerBreakthrough: "A leadership opportunity opens with preparation.",
  },
};
