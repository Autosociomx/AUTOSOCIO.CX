
export type SubscriptionTier = 'FREE' | 'PRO_EXECUTIVE' | 'TITAN_ELITE';
export type UserIntent = 'Personal_Curiosity' | 'Company_Employee' | 'Workshop_Owner' | 'Fleet_Manager';
export type Language = 'es' | 'en' | 'pt' | 'fr' | 'de' | 'zh' | 'ja';
export type AuditScenario = 'EDUCATION' | 'MONETIZATION' | 'CREATOR_API';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  residence: string;
  intent: UserIntent;
  tier: SubscriptionTier;
  avatar: string;
  joinedDate: string;
  trialExpiresAt: string; // ISO String
  isTrialActive: boolean;
  language: Language;
  stats: {
    errorsAvoided: number;
    sessionsCompleted: number;
    roiGenerated: number;
  };
}

export interface NutriTaquita {
  calories: string; // Energy potential
  technicalFiber: string; // Durability
  purity: string; // OEM quality %
  roiVitamin: string; // Profitability
}

export interface CIAModuleOutput {
  intent: {
    primary: string;
    domain: string;
    risk: 'low' | 'medium' | 'high';
    urgency: boolean;
    purchaseSignals: boolean;
    summary12Words: string;
    clarityScore: number;
  };
  knowledge: {
    analogy: string;
    technicalLevel: string;
    commonErrors: string[];
    actionableSteps: string[];
    childVersion: string;
  };
  trust: {
    physicalRisk: string;
    financialRisk: string;
    legalRisk: string;
    stopSignals: string[];
    preventiveMaintenance: string;
    confidenceScore: number;
  };
  monetization?: {
    verifiedSeller: boolean;
    priceQualityRatio: string;
    affiliateTransparency: string;
    roiJustification: string;
    oneLineRecommendation: string;
  };
}

export interface AuditResult {
  score: number;
  findings: {
    type: 'FRICTION' | 'OPPORTUNITY' | 'RISK';
    severity: 'LOW' | 'MEDIUM' | 'CRITICAL';
    description: string;
    fixAction: string;
  }[];
  summary: string;
  commercialViability: string;
}

export interface DiagnosticGuide {
  title: string;
  locationDescription: string;
  locationImageUrl?: string;
  failureAnalysis: string;
  symptoms: string[]; 
  diagnosticSteps: string[];
  toolsRequired: string[];
  recommendedPartKeywords: string[];
  scenario?: AuditScenario;
  ciaReport?: CIAModuleOutput;
  nutriTaquita?: NutriTaquita;
}

export interface Mentorship {
  id: string;
  title: string;
  description: string;
  isFree: boolean;
  level: number;
  duration: string;
  price?: number;
}

export interface AcademyCourse {
  id: string;
  agentId: number;
  title: string;
  duration: string;
  level: string;
  category: string;
  enrolled: number;
  rating: number;
  image: string;
  roiEstimate: string;
  isHighTicket: boolean;
}

export interface Agent {
  id: number;
  name: string;
  title: string;
  description: string;
  indication: string;
  prompt: string;
  avatar: string;
  expertise: string[];
  communitySize: number;
  reputation: {
    rating: number; 
    reviewCount: number;
    successRate: number; 
    status: string;
  };
  mentorships: Mentorship[];
}

export interface Part {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  affiliateUrl: string;
  loyaltyCommissionRate: number;
  salesCommissionRate: number;
  keywords: string[];
  compatibility: string[];
  price: number;
  stock: number;
  platform?: string; 
}

export interface EnrichedPartRecommendation {
  part: Part;
  recommendation: string;
  viabilityScore: number;
  isMostRecommended: boolean;
  partId?: string;
}

export interface DecodedVehicle {
  vin: string;
  make: string;
  model: string;
  year: string;
  engine: string;
  fuelType: string;
  transmission: string;
  driveType: string;
  bodyClass: string;
  trim: string;
}

export interface AdvisorMessage {
  id: string;
  role: 'user' | 'advisor';
  content: string;
  sources?: { title: string; url: string }[];
  timestamp: Date;
}
