export type BusinessRubro =
  | 'Gastronomía'
  | 'Belleza / estética'
  | 'Retail'
  | 'Servicios'
  | 'Bodega / logística'
  | 'Otro';

export type UserType = 'entrepreneur' | 'owner';
export type UserLevel = 0 | 1;

export interface Document {
  id: string;
  userId: string;
  name: string;
  type: 'identity' | 'income' | 'legal' | 'property';
  status: 'empty' | 'pending' | 'verified';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  type: UserType;
  level: UserLevel;
  subType: 'natural' | 'juridica';
  documents: Document[];
}

export interface CommercialSpecs {
  hasGas: boolean;
  powerCapacity: 'Básica' | 'Trifásica';
  waterConnection: boolean;
  greaseTrap: boolean;
  frontageSize: number;
  footTraffic: 'Bajo' | 'Medio' | 'Alto';
  permittedUses: string[];
}

export interface Property {
  id: string;
  title: string;
  price: number;
  currency: string;
  sqm: number;
  location: string;
  lat: number;
  lng: number;
  image: string;
  description: string;
  specs: CommercialSpecs;
  nearbyPOIs: string[];
  pastBusiness: string;
  renovationNeeded: string;
  ownerNotes: string;
  negotiable: boolean;
  neighborhoodInsights: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  sources?: Array<{ web: { uri: string; title: string } }>;
}

export interface MatchResponse {
  score: number;
  details: string[];
}

export interface MarketTrend {
  city: string;
  avgPriceSqm: number;
  demandLevel: string;
  summary: string;
  trends: Array<{ month: string; growth: number }>;
}

export interface RubroOption {
  label: BusinessRubro;
  icon: React.ReactNode;
  color: string;
  description: string;
}
