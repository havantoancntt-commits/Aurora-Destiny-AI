// ==========================================================
// AURORA DESTINY AI — SACRED CELESTIAL TALISMAN & PATRON TYPES
// Official Platform: Kênh Huyền Phong Phật Đạo
// Conceived & Engineered by: Giáo Sư - Prof.TOAN
// ==========================================================

import { FiveElement } from './destiny';

export interface KarmicPivotAnalysis {
  knotPalace: string;
  knotName: string;
  knotDescription: string;
  rootCause: string;
  karmicLesson: string;
  remedyPalace: string;
  remedyElement: FiveElement;
  elementColor: string;
  favorableDirection: string;
  auspiciousHours: string;
  benefactorArchetype: string;
  catalystCareer: string;
  sacredMotto: string;
  cryptographicSeal: string;
  karmicScore: number; // 0 - 100
}

export type PatronTier = 'dong' | 'bac' | 'vang' | 'kim_cuong' | 'tam_tinh';

export interface CelestialPatron {
  id: string;
  name: string;
  tier: PatronTier;
  amount?: number;
  message?: string;
  sealHash: string;
  date: string;
  isAnonymous?: boolean;
}
