// ==========================================
// AURORA DESTINY AI — AUTHENTICATED API CLIENT
// Production-grade client with HttpOnly cookie session management,
// multi-user isolation & automatic guest session bootstrap.
// ==========================================

import { UserProfile, UserPreferences, UserAccount } from '../types/user';
import { CalculationResult, BirthData, BehavioralContext } from '../types/destiny';
import { HistoricalEvent, BacktestResult } from '../types/backtest';
import { MultiAgentEnsemble, ChatMessage, ScenarioAnalysisResult, DailyDestiny } from '../types/ai';

class ApiClient {
  private sessionInitialized = false;
  private sessionPromise: Promise<boolean> | null = null;

  constructor() {
    // Pure HttpOnly cookie architecture: authentication tokens reside exclusively in HttpOnly cookies
  }

  public resetSessionState() {
    this.sessionInitialized = false;
  }

  // Ensure an authenticated session exists:
  // 1. Verifies if an existing authenticated session (registered or guest) is already active via /api/auth/me
  // 2. Only auto-provisions a guest session if no active session exists, preventing session overwrites
  public async ensureSession(force = false): Promise<boolean> {
    if (this.sessionInitialized && !force) return true;

    if (this.sessionPromise) {
      return this.sessionPromise;
    }

    this.sessionPromise = (async () => {
      try {
        // Step 1: Check if an active session cookie already exists and is valid
        if (!force) {
          const meRes = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'same-origin'
          });
          if (meRes.ok) {
            this.sessionInitialized = true;
            return true;
          }
        }

        // Step 2: Only provision a new guest session if no valid session is active
        const res = await fetch('/api/auth/guest', {
          method: 'POST',
          credentials: 'same-origin'
        });
        if (res.ok) {
          this.sessionInitialized = true;
          return true;
        }
      } catch (err) {
        console.warn('Could not auto-provision guest session:', err);
      } finally {
        this.sessionPromise = null;
      }
      return false;
    })();

    return this.sessionPromise;
  }

  private async fetchWithAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    await this.ensureSession();

    const headers = new Headers(init?.headers || {});
    const credentials = init?.credentials || 'same-origin';
    let res = await fetch(input, { ...init, headers, credentials });

    // Auto-heal on 401 UNAUTHENTICATED: Session expired, re-provision fresh guest session and retry once
    if (res.status === 401) {
      this.resetSessionState();
      const provisioned = await this.ensureSession(true);
      if (provisioned) {
        res = await fetch(input, { ...init, headers, credentials });
      }
    }

    return res;
  }

  // Auth operations
  public async register(email: string, password: string, fullName: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ email, password, fullName })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Đăng ký thất bại (${res.status})`);
    }
    this.sessionInitialized = true;
    return res.json();
  }

  public async login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Đăng nhập thất bại (${res.status})`);
    }
    this.sessionInitialized = true;
    return res.json();
  }

  public async logout() {
    this.resetSessionState();
    const res = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin'
    });
    if (!res.ok) {
      throw new Error(`Đăng xuất thất bại (${res.status})`);
    }
    return res.json();
  }

  public async getMe(): Promise<{ user: UserAccount; preferences: UserPreferences }> {
    const res = await this.fetchWithAuth('/api/auth/me');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // Profile operations
  public async getProfiles(): Promise<UserProfile[]> {
    const res = await this.fetchWithAuth('/api/profiles');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  public async createProfile(profileData: {
    name: string;
    birthData: BirthData;
    behavioralContext?: BehavioralContext;
    isPrimary?: boolean;
  }): Promise<{ profile: UserProfile; calculation: CalculationResult }> {
    const res = await this.fetchWithAuth('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Lỗi tạo hồ sơ (${res.status})`);
    }
    return res.json();
  }

  public async updateProfile(profileId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const res = await this.fetchWithAuth(`/api/profiles/${profileId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  public async deleteProfile(profileId: string): Promise<boolean> {
    const res = await this.fetchWithAuth(`/api/profiles/${profileId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.success === true;
  }

  // Calculations & AI Ensemble
  public async getCalculation(profileId: string): Promise<{
    calculation: CalculationResult | null;
    ensemble: MultiAgentEnsemble | null;
    backtest: BacktestResult | null;
  }> {
    const res = await this.fetchWithAuth(`/api/calculations/${profileId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  public async recalculate(profileId: string): Promise<{
    calculation: CalculationResult;
    ensemble: MultiAgentEnsemble;
    backtest: BacktestResult;
  }> {
    const res = await this.fetchWithAuth('/api/calculations/recalculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // Backtesting Studio
  public async getBacktests(profileId: string): Promise<{
    events: HistoricalEvent[];
    result: BacktestResult;
  }> {
    const res = await this.fetchWithAuth(`/api/backtests/${profileId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  public async addHistoricalEvent(eventData: Partial<HistoricalEvent>): Promise<{
    event: HistoricalEvent;
    backtestResult: BacktestResult;
  }> {
    const res = await this.fetchWithAuth('/api/backtests/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Lỗi thêm sự kiện (${res.status})`);
    }
    return res.json();
  }

  public async deleteHistoricalEvent(profileId: string, eventId: string): Promise<{
    success: boolean;
    backtestResult: BacktestResult;
  }> {
    const res = await this.fetchWithAuth(`/api/backtests/event/${profileId}/${eventId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // Scenarios & Daily
  public async evaluateScenario(profileId: string, question: string): Promise<ScenarioAnalysisResult> {
    const res = await this.fetchWithAuth('/api/scenarios/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, question })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  public async getDaily(profileId: string): Promise<DailyDestiny> {
    const res = await this.fetchWithAuth(`/api/daily/${profileId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // AI Chat Assistant
  public async sendChatMessage(profileId: string, message: string): Promise<ChatMessage> {
    const res = await this.fetchWithAuth('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, message })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Lỗi phản hồi AI (${res.status})`);
    }
    return res.json();
  }

  // Preferences & User
  public async updatePreferences(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
    const res = await this.fetchWithAuth('/api/user/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  public async getAuditLogs() {
    const res = await this.fetchWithAuth('/api/audit-logs');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  public async getFeatureFlags() {
    const res = await this.fetchWithAuth('/api/feature-flags');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  public async toggleFeatureFlag(key: string, enabled: boolean) {
    const res = await this.fetchWithAuth('/api/feature-flags/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, enabled })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
}

export const api = new ApiClient();
