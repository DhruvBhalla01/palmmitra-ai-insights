export interface MajorLine {
  strength: 'Very Strong' | 'Strong' | 'Moderate' | 'Developing' | 'Faint';
  meaning: string;
  keyInsight: string;
}

export interface Mount {
  level: 'High' | 'Medium' | 'Low';
  meaning: string;
}

export interface PersonalityTrait {
  trait: string;
  icon: 'drive' | 'loyalty' | 'practical' | 'success' | 'spiritual';
  description: string;
}

export interface PeakPeriod {
  year: string;
  intensity: 'building' | 'rising' | 'peak' | 'sustaining' | 'expanding';
}

export interface LifePhase {
  period: string;
  description: string;
}

export interface SpiritualRemedy {
  remedy: string;
  benefit: string;
  timing: string;
}

export interface PalmReading {
  confidenceScore: number;
  headlineSummary: string;
  
  majorLines: {
    lifeLine: MajorLine;
    heartLine: MajorLine;
    headLine: MajorLine;
    fateLine: MajorLine;
    sunLine: MajorLine;
  };
  
  mounts: {
    venus: Mount;
    jupiter: Mount;
    saturn: Mount;
    apollo: Mount;
    mercury: Mount;
  };
  
  personalityTraits: PersonalityTrait[];
  
  careerWealth: {
    bestFields: string[];
    turningPointAge: string;
    wealthStyle: string;
    peakPeriods: PeakPeriod[];
  };
  
  loveRelationships: {
    emotionalStyle: string;
    commitmentTendency: string;
    relationshipAdvice: string;
  };
  
  lifePhases: {
    growth: LifePhase;
    challenge: LifePhase;
    opportunity: LifePhase;
  };
  
  spiritualRemedies: SpiritualRemedy[];
  
  finalBlessing: string;
  
  premiumInsights: {
    marriageTiming: string;
    careerBreakthrough: string;
    gemstoneRecommendation: string;
  };
}

export interface StoredData {
  name: string;
  age: string;
  email: string;
  readingType: 'full' | 'career' | 'love' | 'wealth';
  palmImage: string;
}
