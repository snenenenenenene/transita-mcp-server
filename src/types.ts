/**
 * Mirror of the Transita web app types we consume from the public
 * JSON API. Kept narrow on purpose — only the fields the MCP server
 * actually surfaces. Source of truth lives in apps/web/src/lib.
 */

export interface VisaEntry {
  id: string;
  country: string;
  countryName: string;
  countryFlag: string;
  name: string;
  code: string;
  category: string;
  description: string;
  processingTimeMonths: { min: number; max: number };
  costUSD: number;
  validityYears: number;
  pathToPR: boolean;
  prTimelineYears?: number;
  pointsBased: boolean;
  officialUrl: string;
  targetGoals: string[];
  requiresEmployerSponsor?: boolean;
}

export interface ChecklistDoc {
  name: string;
  where: string;
  url?: string;
  time?: string;
  cost?: string;
  selfHeld?: boolean;
}

export interface ChecklistSection {
  label: string;
  docs: ChecklistDoc[];
}

export interface ChecklistPreview {
  leadTime: string;
  ancillaryCost: string;
  totalSections: number;
  firstSection: ChecklistSection | null;
  paidPlanUrl: string;
}

export interface VisaPath {
  id: string;
  country: string;
  countryName: string;
  countryFlag: string;
  visaName: string;
  visaCode: string;
  matchScore: number;
  timelineMonths: string;
  costRange: string;
  description: string;
  highlights?: string[];
  blockers?: string[];
  pathToPR?: boolean;
  prTimelineYears?: number;
  officialUrl?: string;
  officialSource?: string;
  dataUpdatedAt?: string;
}

export interface CityCostOfLiving {
  city: string;
  monthlyUSD: string;
  note?: string;
}

export interface ScoreDimension {
  label: string;
  score: number;
}

export interface CountryConfig {
  code: string;
  iso2: string;
  name: string;
  flag: string;
  slug: string;
  isEUMember: boolean;
  isActive: boolean;
  cardDescription: string;
  guideIntro: string;
  guideHighlights: string[];
  scoreDimensions: ScoreDimension[];
  cities: CityCostOfLiving[];
  drawbacks: string[];
  prTimelineYears: number;
  citizenshipTimelineYears: number;
  visaCount?: number;
}

export interface NationalityPageData {
  slug: string;
  nationality: string;
  country: string;
  flag: string;
  headline: string;
  intro: string;
  topDestinations: {
    country: string;
    flag: string;
    visaName: string;
    why: string;
  }[];
  keyStats: { value: string; label: string }[];
  faq: { q: string; a: string }[];
  metaDescription: string;
}
