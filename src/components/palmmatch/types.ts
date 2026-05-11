export interface CompatibilityDimension {
  score: number;
  title: string;
  text: string;
  guidance: string;
}

export interface PalmMatchReading {
  person1Name: string;
  person2Name: string;
  relationshipType: string;
  overallScore: number;
  compatibilityVerdict: string;
  overallNarrative: string;
  emotionalBond: CompatibilityDimension;
  communication: CompatibilityDimension;
  lifeGoals: CompatibilityDimension;
  romance: CompatibilityDimension;
  spiritualAlignment: CompatibilityDimension;
  strengthsAndChallenges: {
    strengths: string[];
    challenges: string[];
    growthPath: string;
  };
  timingGuidance: string;
  remediesForPair: string[];
  finalBlessing: string;
}

export interface PalmMatchStoredData {
  person1Name: string;
  person1Age: string;
  person2Name: string;
  person2Age: string;
  relationshipType: string;
  email: string;
  image1Url: string;
  image2Url: string;
}
