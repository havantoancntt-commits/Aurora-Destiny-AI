// ==========================================
// AURORA DESTINY AI — AUTHENTICATED API CLIENT
// Production-grade client with session token persistence,
// multi-user isolation & automatic guest session bootstrap.
// ==========================================

import { UserProfile, UserPreferences, UserAccount } from '../types/user';
import { CalculationResult, BirthData, BehavioralContext } from '../types/destiny';
import { HistoricalEvent, BacktestResult } from '../types/backtest';
import { MultiAgentEnsemble, ChatMessage, ScenarioAnalysisResult, DailyDestiny } from '../types/ai';

const SESSION_TOKEN_KEY = 'aurora_session_token';

class ApiClient {
  private token: string | null = null;
  private sessionPromise: Promise<string> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.token = localStorage.getItem(SESSION_TOKEN_KEY);
      } catch (e) {
        console.warn('LocalStorage unavailable for token storage:', e);
      }
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SESSION_TOKEN_KEY, token);
      } catch (e) {
        console.warn('Failed to persist session token:', e);
      }
    }
  }

  public clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(SESSION_TOKEN_KEY);
      } catch (e) {
        console.warn('Failed to remove session token:', e);
      }
    }
  }

  // Ensure an authenticated session token exists (auto-provisions guest session if none, with concurrency deduplication)
  public async ensureSession(force = false): Promise<string> {
    if (this.token && !force) return this.token;

    if (this.sessionPromise) {
      return this.sessionPromise;
    }

    this.sessionPromise = (async () => {
      try {
        const res = await fetch('/api/auth/guest', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          if (data.token) {
            this.setToken(data.token);
            return data.token;
          }
        }
      } catch (err) {
        console.warn('Could not auto-provision guest session:', err);
      } finally {
        this.sessionPromise = null;
      }
      return this.token || '';
    })();

    return this.sessionPromise;
  }

  private async fetchWithAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    await this.ensureSession();

    const headers = new Headers(init?.headers || {});
    if (this.token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const credentials = init?.credentials || 'same-origin';
    let res = await fetch(input, { ...init, headers, credentials });

    // Auto-heal on 401 UNAUTHENTICATED: Token was rejected/expired, re-provision fresh session and retry
    if (res.status === 401) {
      this.clearToken();
      const freshToken = await this.ensureSession(true);
      if (freshToken) {
        const retryHeaders = new Headers(init?.headers || {});
        retryHeaders.set('Authorization', `Bearer ${freshToken}`);
        res = await fetch(input, { ...init, headers: retryHeaders, credentials });
      }
    }

    return res;
  }

  // Auth operations
  public async register(email: string, password: string, fullName: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Đăng ký thất bại (${res.status})`);
    }
    const data = await res.json();
    if (data.token) this.setToken(data.token);
    return data;
  }

  public async login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Đăng nhập thất bại (${res.status})`);
    }
    const data = await res.json();
    if (data.token) this.setToken(data.token);
    return data;
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
