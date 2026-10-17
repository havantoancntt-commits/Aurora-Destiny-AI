// ==========================================
// AURORA DESTINY AI — AUTHENTICATED API CLIENT
// Production-grade client with HttpOnly cookie session management,
// multi-user isolation & automatic guest session bootstrap.
// ==========================================

import { UserProfile, UserPreferences, UserAccount } from '../types/user';
import { CalculationResult, BirthData, BehavioralContext } from '../types/destiny';
import { HistoricalEvent, BacktestResult } from '../types/backtest';
import { MultiAgentEnsemble, ChatMessage, ScenarioAnalysisResult, DailyDestiny } from '../types/ai';
import { pwaProfileStorage } from './pwaProfileStorage';

class ApiClient {
  private sessionInitialized = false;
  private sessionPromise: Promise<boolean> | null = null;
  private token: string | null = null;
  private currentUserId: string | null = null;

  constructor() {
    if (this.isProductionAuthMode()) {
      this.token = null;
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('aurora_session_token');
          sessionStorage.removeItem('aurora_session_token');
        }
      } catch {}
    } else {
      try {
        this.token = typeof window !== 'undefined' ? localStorage.getItem('aurora_session_token') : null;
      } catch {
        this.token = null;
      }
    }
  }

  public isProductionAuthMode(): boolean {
    if (typeof window === 'undefined') return true;
    try {
      // 1. Explicit environment or runtime override
      if (
        (window as any).__AURORA_PRODUCTION_AUTH_MODE === true ||
        (import.meta as any)?.env?.VITE_PRODUCTION_AUTH_MODE === 'true' ||
        (typeof process !== 'undefined' && process.env?.PRODUCTION_AUTH_MODE === 'true')
      ) {
        return true;
      }
      // 2. Standard top-level browser window (not sandboxed inside an iframe)
      const isTopLevel = window.self === window.top;
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      return isTopLevel && !isLocalhost;
    } catch {
      return false; // Cross-origin iframe security restriction means embedded sandbox
    }
  }

  public setToken(token: string | null) {
    if (this.isProductionAuthMode()) {
      // In production browser mode, authentication strictly uses HttpOnly SameSite cookies
      this.token = null;
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('aurora_session_token');
          sessionStorage.removeItem('aurora_session_token');
        }
      } catch {}
      return;
    }

    this.token = token;
    try {
      if (typeof window !== 'undefined') {
        if (token) {
          localStorage.setItem('aurora_session_token', token);
        } else {
          localStorage.removeItem('aurora_session_token');
        }
      }
    } catch {
      // localStorage may fail in third-party sandboxed iframes
    }
  }

  private isSandboxEnvironment(): boolean {
    if (typeof window === 'undefined') return false;
    if (this.isProductionAuthMode()) return false;
    try {
      return (
        window.self !== window.top ||
        window.location.hostname.includes('.run.app') ||
        window.location.hostname.includes('localhost') ||
        window.location.hostname.includes('127.0.0.1') ||
        window.location.hostname.includes('webcontainer')
      );
    } catch {
      return true; // Cross-origin iframe security exception indicates sandboxed iframe
    }
  }

  public resetSessionState() {
    this.sessionInitialized = false;
    this.setToken(null);
  }

  public setCurrentUser(user: UserAccount | null) {
    const previousUserId = this.currentUserId;
    this.currentUserId = user?.id || null;
    if (previousUserId && user && previousUserId !== user.id) {
      // Purge previous user cache on account switch
      this.clearCachedProfilesForUser(previousUserId);
    }
  }

  public getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  private getProfileCacheKey(userId?: string | null): string {
    const targetId = userId !== undefined ? userId : this.currentUserId;
    return targetId ? `aurora_cached_profiles_${targetId}` : 'aurora_cached_profiles_guest';
  }

  // Ensure an authenticated session exists:
  // 1. Verifies if an existing authenticated session (registered or guest) is already active via /api/auth/me
  // 2. Only auto-provisions a guest session if no active session exists, preventing session overwrites
  public async ensureSession(force = false): Promise<boolean> {
    if (this.sessionInitialized && !force && (this.token || !this.isSandboxEnvironment())) return true;

    if (this.sessionPromise) {
      return this.sessionPromise;
    }

    this.sessionPromise = (async () => {
      try {
        const isSandbox = this.isSandboxEnvironment();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        if (isSandbox) {
          headers['x-client-mode'] = 'sandbox';
        }
        if (this.token) {
          headers['Authorization'] = `Bearer ${this.token}`;
          headers['x-session-token'] = this.token;
        }

        // Step 1: Check if an active session cookie or token already exists and is valid
        if (!force) {
          const meRes = await fetch('/api/auth/me', {
            method: 'GET',
            headers,
            credentials: 'include'
          });
          if (meRes.ok) {
            const meData = await meRes.json().catch(() => null);
            if (meData?.user) {
              this.setCurrentUser(meData.user);
            }
            this.sessionInitialized = true;
            return true;
          }
        }

        // Step 2: Auto-provision a new guest session if no valid session is active
        const guestHeaders: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        if (isSandbox) {
          guestHeaders['x-client-mode'] = 'sandbox';
        }
        const res = await fetch('/api/auth/guest', {
          method: 'POST',
          headers: guestHeaders,
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data?.user) {
            this.setCurrentUser(data.user);
          }
          const receivedToken = data?.token || data?.accessToken;
          if (receivedToken && isSandbox) {
            this.setToken(receivedToken);
          } else if (data?.sessionMode === 'cookie') {
            // Pure BROWSER_PRODUCTION_AUTH: relies strictly on HttpOnly Secure cookies
            this.setToken(null);
          }
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
    if (this.token) {
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${this.token}`);
      }
      if (!headers.has('x-session-token')) {
        headers.set('x-session-token', this.token);
      }
    }
    const credentials = init?.credentials || 'include';
    let res = await fetch(input, { ...init, headers, credentials });

    // Auto-heal on 401 UNAUTHENTICATED: Session expired or invalid, re-provision fresh guest session and retry once
    if (res.status === 401) {
      this.resetSessionState();
      const provisioned = await this.ensureSession(true);
      if (provisioned) {
        const retryHeaders = new Headers(init?.headers || {});
        if (this.token) {
          retryHeaders.set('Authorization', `Bearer ${this.token}`);
          retryHeaders.set('x-session-token', this.token);
        }
        res = await fetch(input, { ...init, headers: retryHeaders, credentials });
      }
    }

    return res;
  }

  // Auth operations
  public async register(email: string, password: string, fullName: string) {
    const isSandbox = this.isSandboxEnvironment();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (isSandbox) headers['x-client-mode'] = 'sandbox';

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ email, password, fullName })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Đăng ký thất bại (${res.status})`);
    }
    const data = await res.json();
    if (data?.user) {
      this.setCurrentUser(data.user);
    }
    const receivedToken = data?.token || data?.accessToken;
    if (receivedToken && isSandbox) {
      this.setToken(receivedToken);
    } else if (data?.sessionMode === 'cookie') {
      this.setToken(null);
    }
    this.sessionInitialized = true;
    return data;
  }

  public async login(email: string, password: string) {
    const isSandbox = this.isSandboxEnvironment();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (isSandbox) headers['x-client-mode'] = 'sandbox';
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      headers['x-session-token'] = this.token;
    }
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Đăng nhập thất bại (${res.status})`);
    }
    const data = await res.json();
    if (data?.user) {
      this.setCurrentUser(data.user);
    }
    const receivedToken = data?.token || data?.accessToken;
    if (receivedToken && isSandbox) {
      this.setToken(receivedToken);
    } else if (data?.sessionMode === 'cookie') {
      this.setToken(null);
    }
    this.sessionInitialized = true;
    return data;
  }

  public async logout() {
    const token = this.token;
    this.resetSessionState();
    this.clearAllCachedProfiles();
    this.currentUserId = null;

    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('aurora_session_token');
        sessionStorage.removeItem('aurora_session_token');
      }
    } catch {}

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-session-token'] = token;
    }
    const res = await fetch('/api/auth/logout', {
      method: 'POST',
      headers,
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error(`Đăng xuất thất bại (${res.status})`);
    }
    return res.json();
  }

  public async getMe(): Promise<{ user: UserAccount; preferences: UserPreferences }> {
    const res = await this.fetchWithAuth('/api/auth/me');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data?.user) {
      this.setCurrentUser(data.user);
    }
    return data;
  }

  public getCachedProfiles(): UserProfile[] {
    try {
      if (typeof window !== 'undefined') {
        const key = this.getProfileCacheKey();
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          // Schema & ownership validation
          if (parsed && typeof parsed === 'object') {
            if (Array.isArray(parsed.profiles)) {
              if (this.currentUserId && parsed.userId && parsed.userId !== this.currentUserId) {
                // Cross-user contamination prevented: do not return another user's profiles
                return [];
              }
              return parsed.profiles;
            } else if (Array.isArray(parsed)) {
              return parsed;
            }
          }
        }
      }
    } catch {}
    return [];
  }

  public cacheProfiles(profiles: UserProfile[]): void {
    try {
      if (typeof window !== 'undefined' && Array.isArray(profiles)) {
        const key = this.getProfileCacheKey();
        const payload = {
          version: 1,
          userId: this.currentUserId,
          timestamp: Date.now(),
          profiles
        };
        localStorage.setItem(key, JSON.stringify(payload));
        pwaProfileStorage.saveAllProfiles(profiles).catch(() => {});
      }
    } catch {}
  }

  public clearCachedProfilesForUser(userId: string): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`aurora_cached_profiles_${userId}`);
      }
    } catch {}
  }

  public clearAllCachedProfiles(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('aurora_cached_profiles');
        localStorage.removeItem('aurora_cached_profiles_guest');
        if (this.currentUserId) {
          localStorage.removeItem(`aurora_cached_profiles_${this.currentUserId}`);
        }
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('aurora_cached_profiles')) {
            localStorage.removeItem(k);
          }
        }
      }
    } catch {}
  }

  // Profile operations
  public async getProfiles(): Promise<UserProfile[]> {
    try {
      const res = await this.fetchWithAuth('/api/profiles');
      if (!res.ok) {
        console.warn(`[ApiClient] Server returned HTTP ${res.status} for getProfiles, using local cache.`);
        const local = this.getCachedProfiles();
        if (local.length > 0) return local;
        return await pwaProfileStorage.getProfiles().catch(() => []);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        this.cacheProfiles(data);
        return data;
      }
      return this.getCachedProfiles();
    } catch (err: any) {
      console.warn('[ApiClient] Failed to fetch profiles from network, using local cache:', err.message);
      const local = this.getCachedProfiles();
      if (local.length > 0) return local;
      return await pwaProfileStorage.getProfiles().catch(() => []);
    }
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
    const result = await res.json();
    if (result?.profile) {
      const cached = this.getCachedProfiles().filter((p) => p.id !== result.profile.id);
      this.cacheProfiles([result.profile, ...cached]);
      pwaProfileStorage.saveProfile(result.profile).catch(() => {});
      if (result.calculation) {
        pwaProfileStorage.saveCalculation(result.profile.id, result.calculation).catch(() => {});
      }
    }
    return result;
  }

  public async updateProfile(profileId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const res = await this.fetchWithAuth(`/api/profiles/${profileId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const updated = await res.json();
    if (updated?.id) {
      pwaProfileStorage.saveProfile(updated).catch(() => {});
    }
    return updated;
  }

  public async deleteProfile(profileId: string): Promise<boolean> {
    const res = await this.fetchWithAuth(`/api/profiles/${profileId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success) {
      pwaProfileStorage.deleteProfile(profileId).catch(() => {});
    }
    return data.success === true;
  }

  // Calculations & AI Ensemble
  public async getCalculation(profileId: string): Promise<{
    calculation: CalculationResult | null;
    ensemble: MultiAgentEnsemble | null;
    backtest: BacktestResult | null;
  }> {
    try {
      const res = await this.fetchWithAuth(`/api/calculations/${profileId}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.calculation) {
          pwaProfileStorage.saveCalculation(profileId, data.calculation).catch(() => {});
        }
        return data;
      }
    } catch (netErr) {
      console.warn('[ApiClient] Failed to fetch calculation from network, checking PWA offline storage:', netErr);
    }
    // Fallback to offline PWA storage
    const offlineCalc = await pwaProfileStorage.getCalculation(profileId).catch(() => null);
    return {
      calculation: offlineCalc,
      ensemble: null,
      backtest: null
    };
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

  public async getMetrics(): Promise<any> {
    const res = await this.fetchWithAuth('/api/metrics');
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) throw new Error('Cần quyền Quản trị viên (Admin/Super Admin)');
      throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
  }

  public async getSecurityThreats(): Promise<any> {
    const res = await this.fetchWithAuth('/api/admin/security-threats');
    if (res.ok) return res.json();
    return null;
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
