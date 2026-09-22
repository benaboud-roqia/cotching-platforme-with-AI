export interface TranscriptEntry {
  id: string;
  speaker: 'Speaker A' | 'Speaker B';
  speakerName: string;
  speakerRole: 'Sales Rep' | 'Prospect';
  timestampSeconds: number;
  timestampLabel: string;
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'hesitant';
  confidenceScore?: number;
  tag?: string; // e.g. "Discovery Question", "Objection Raised", "Value Proposition", "Pricing Discussion", "Closing Commitment"
}

export interface SentimentPoint {
  timestampSeconds: number;
  timestampLabel: string;
  prospectEngagement: number; // 0 to 100
  repEnergy: number; // 0 to 100
  overallSentiment: number; // -100 to 100
  speaker: 'Speaker A' | 'Speaker B';
  milestoneNote?: string;
  quoteSnippet?: string;
}

export interface CoachingStrength {
  id: string;
  title: string;
  category: string;
  quote: string;
  impactAnalysis: string;
  timestampLabel: string;
  timestampSeconds: number;
}

export interface CoachingOpportunity {
  id: string;
  title: string;
  category: string;
  timestampLabel: string;
  timestampSeconds: number;
  issueDescription: string;
  recommendedAlternative: string;
}

export interface CallMetrics {
  talkRatioRep: number; // e.g. 46
  talkRatioProspect: number; // e.g. 54
  wordsPerMinuteRep: number; // e.g. 138
  wordsPerMinuteProspect: number; // e.g. 122
  questionsAskedRep: number; // e.g. 11
  longestMonologueSeconds: number; // e.g. 48
  fillerWordsCount: number; // e.g. 6
  prospectEngagementScore: number; // 0 - 100 (e.g. 84)
  overallCallScore: number; // 0 - 100 (e.g. 88)
  buyingSignalsCount: number;
  riskSignalsCount: number;
}

export interface CoachingCardData {
  summaryScore: number; // 0-100
  dealStage: string;
  callOutcome: 'High Momentum' | 'Moderate Progress' | 'Needs Follow-Up' | 'Deal at Risk';
  thingsDoneWell: CoachingStrength[]; // exactly 3
  missedOpportunities: CoachingOpportunity[]; // exactly 3
  suggestedFollowUpEmailSubject: string;
  suggestedFollowUpEmailBody: string;
}

export interface SalesCallAnalysis {
  id: string;
  title: string;
  fileName: string;
  audioDurationSeconds: number;
  audioDurationFormatted: string;
  audioUrl?: string;
  analyzedAt: string;
  repName: string;
  prospectName: string;
  prospectCompany: string;
  dealSize?: string;
  metrics: CallMetrics;
  transcript: TranscriptEntry[];
  sentimentTimeline: SentimentPoint[];
  coachingCard: CoachingCardData;
}
