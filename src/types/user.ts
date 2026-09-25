// ==========================================
// USER, PROFILE & SESSION TYPES
// ==========================================

import { BirthData, BehavioralContext, CalculationResult } from './destiny';

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'GUEST';

export type SubscriptionTier = 'Free' | 'Premium' | 'Pro' | 'Enterprise';

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  isPrimary: boolean;
  avatarSeed: string;
  birthData: BirthData;
  behavioralContext: BehavioralContext;
  latestCalculationId?: string;
  idempotencyKey?: string;
  clientProfileId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  language: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  profilesCount: number;
  isGuest?: boolean;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'aurora';
  language: string;
  timezone: string;
  enableNotifications: boolean;
  enableAILearning: boolean;
  anonymizeData: boolean;
  scientificConfidenceMode: boolean;
  highContrast: boolean;
}

export interface AuthSession {
  token: string;
  user: UserAccount;
  expiresAt: string;
}

export interface StoredSession {
  token: string;
  userId: string;
  role?: UserRole;
  expiresAt: number; // Unix epoch ms
  createdAt: number;
  lastAccessedAt: number;
  isGuest?: boolean;
  clientType?: 'browser' | 'api' | 'mobile';
  refreshToken?: string;
  tokenHash?: string;
  refreshTokenHash?: string;
  tokenFamily?: string;
  revokedAt?: number | null;
}
