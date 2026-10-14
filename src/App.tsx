// ==========================================
// AURORA DESTINY AI — MAIN APPLICATION ROOT
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, UserPlus, Volume2, ArrowRight, BookOpen, Compass, ShieldCheck, Layers, Flame } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Top3DTabBar } from './components/Top3DTabBar';
import { BottomNav, TabKey } from './components/BottomNav';
import { DestinyDashboard } from './components/DestinyDashboard';
import { LifeRadarView } from './components/LifeRadarView';
import { TimelineView } from './components/TimelineView';
import { BacktestingStudio } from './components/BacktestingStudio';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { CompatibilityStudio } from './components/CompatibilityStudio';
import { DestinyRemediesView } from './components/DestinyRemediesView';
import { DailyDestinyView } from './components/DailyDestinyView';
import { StrategicChronoNavigatorView } from './components/StrategicChronoNavigatorView';
import { CelestialBackground } from './components/CelestialBackground';
import { OnboardingWizard } from './components/OnboardingWizard';
import { SeniorDestinyGuideModal } from './components/SeniorDestinyGuideModal';
import { ReportGeneratorModal } from './components/ReportGeneratorModal';
import { PrivacyCenterModal } from './components/PrivacyCenterModal';
import { AdminDashboard } from './components/AdminDashboard';
import { RealTimeAlertCenter } from './components/RealTimeAlertCenter';
import { SacredCosmicCipher3D } from './components/SacredCosmicCipher3D';
import { AppFooter } from './components/AppFooter';
import { LegalEthicsModal } from './components/LegalEthicsModal';
import { InternationalizationModal } from './components/InternationalizationModal';
import { SocialShareCardModal } from './components/SocialShareCardModal';
import { SeoKnowledgeModal } from './components/SeoKnowledgeModal';
import { CelestialTalismanModal } from './components/CelestialTalismanModal';
import { SponsorshipModal } from './components/SponsorshipModal';
import { CommunitySocialModal } from './components/CommunitySocialModal';
import { PWAOfflineIndicator } from './components/PWAOfflineIndicator';
import { sacredSound } from './services/soundService';
import { sacredVoice } from './services/sacredVoiceService';
import { SacredSealBadge } from './components/SacredSealBadge';
import { SacredTaijiSpinner } from './components/SacredTaijiSpinner';

import { UserProfile, UserPreferences } from './types/user';
import { CalculationResult, BirthData, BehavioralContext, LanguageCode } from './types/destiny';
import { MultiAgentEnsemble, ChatMessage } from './types/ai';
import { HistoricalEvent, BacktestResult } from './types/backtest';
import { api } from './services/apiClient';
import { runFullDestinyCalculation } from './engine/destinyEngine';
import { generateMultiAgentEnsemble } from './services/aiSynthesizer';
import { runBacktestAnalysis } from './engine/backtesting';

export default function App() {
  // Navigation & Language
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [language, setLanguage] = useState<LanguageCode>('vi');

  // Modals state
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    // Check if user has already entered/dismissed or wants to see info window on initial entry
    try {
      const hasSeen = sessionStorage.getItem('aurora_destiny_visited');
      return !hasSeen;
    } catch (e) {
      console.error('API Error details (sessionStorage):', e);
      return true;
    }
  });
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [showRealtimeAlertModal, setShowRealtimeAlertModal] = useState<boolean>(false);
  const [showLegalModal, setShowLegalModal] = useState<boolean>(false);
  const [showInternationalModal, setShowInternationalModal] = useState<boolean>(false);
  const [showShareCardModal, setShowShareCardModal] = useState<boolean>(false);
  const [showSeoModal, setShowSeoModal] = useState<boolean>(false);
  const [showTalismanModal, setShowTalismanModal] = useState<boolean>(false);
  const [showSponsorshipModal, setShowSponsorshipModal] = useState<boolean>(false);
  const [showCommunityModal, setShowCommunityModal] = useState<boolean>(false);
  const [showSeniorGuideModal, setShowSeniorGuideModal] = useState<boolean>(false);

  // App Core State
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>('prof_primary');
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [ensemble, setEnsemble] = useState<MultiAgentEnsemble | null>(null);
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'dark',
    language: 'vi',
    timezone: 'Asia/Bangkok',
    enableNotifications: true,
    enableAILearning: true,
    anonymizeData: true,
    scientificConfidenceMode: true,
    highContrast: false
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'local_only' | 'syncing' | 'sync_error'>('synced');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [localProfileIds, setLocalProfileIds] = useState<Set<string>>(new Set());

  // Initial Load from API
  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      await api.ensureSession();

      // Fetch profiles with explicit error propagation
      let loadedProfiles: UserProfile[] = [];
      try {
        loadedProfiles = await api.getProfiles();
        setProfiles(loadedProfiles);
        setSyncStatus('synced');
      } catch (profErr: any) {
        console.warn('Notice: Server profile sync deferred, checking local offline profiles:', profErr);
        loadedProfiles = api.getCachedProfiles();
        setProfiles(loadedProfiles);
        setSyncStatus(loadedProfiles.length > 0 ? 'local_only' : 'synced');
      }

      if (loadedProfiles.length === 0) {
        // Hoàn toàn không có lá số demo, mở ngay ô nhập thông tin khi người dùng vừa truy cập
        setShowOnboarding(true);
        setActiveProfileId('');
        setCalculation(null);
        setEnsemble(null);
        setBacktestResult(null);
        setEvents([]);
        setLoadError(null);
        setIsLoading(false);
        return;
      }

      const targetId = loadedProfiles[0]?.id;
      setActiveProfileId(targetId);

      // Fetch calculation & ensemble & backtest
      const calcData = await api.getCalculation(targetId).catch(() => ({ calculation: null, ensemble: null, backtest: null }));
      const btData = await api.getBacktests(targetId).catch(() => ({ events: [], result: null }));

      let currentCalc = calcData.calculation;
      if (!currentCalc && loadedProfiles[0]?.birthData) {
        currentCalc = runFullDestinyCalculation(loadedProfiles[0].birthData, targetId, (btData.events || []).length);
      }
      setCalculation(currentCalc);

      let currentBt = calcData.backtest || btData.result;
      if (!currentBt && currentCalc) {
        currentBt = runBacktestAnalysis(btData.events || [], currentCalc);
      }
      setBacktestResult(currentBt);
      setEvents(btData.events || []);

      let currentEnsemble = calcData.ensemble;
      if (!currentEnsemble && currentCalc && loadedProfiles[0]) {
        currentEnsemble = generateMultiAgentEnsemble(loadedProfiles[0], currentCalc, currentBt?.destinyConsistencyScore ?? null);
      }
      setEnsemble(currentEnsemble);

      // Fetch user preferences
      const me = await api.getMe().catch(() => null);
      if (me?.preferences) setPreferences(me.preferences);
    } catch (e) {
      console.error('API Error details:', e);
      // Explicitly mark offline mode
      setSyncStatus('local_only');
      // Offline fallback: giữ trạng thái sạch, mở ô nhập thông tin
      setShowOnboarding(true);
      setProfiles([]);
      setActiveProfileId('');
      setCalculation(null);
      setEnsemble(null);
      setBacktestResult(null);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Retry synchronizing local-only profiles to server
  const handleRetrySync = async () => {
    if (localProfileIds.size === 0) {
      setSyncStatus('synced');
      return;
    }
    setSyncStatus('syncing');
    try {
      await api.ensureSession();
      const idsToSync = Array.from(localProfileIds);
      for (const localId of idsToSync) {
        const localProf = profiles.find((p) => p.id === localId);
        if (!localProf) continue;
        const res = await api.createProfile({
          name: localProf.name,
          birthData: localProf.birthData,
          behavioralContext: localProf.behavioralContext,
          isPrimary: localProf.isPrimary
        });
        setProfiles((prev) => prev.map((p) => (p.id === localId ? res.profile : p)));
        if (activeProfileId === localId) {
          setActiveProfileId(res.profile.id);
          setCalculation(res.calculation);
        }
        setLocalProfileIds((prev) => {
          const next = new Set(prev);
          next.delete(localId);
          return next;
        });
      }
      setSyncStatus('synced');
    } catch (err) {
      console.error('[Sync] Retry synchronization failed:', err);
      setSyncStatus('sync_error');
    }
  };

  useEffect(() => {
    loadInitialData();

    // Check for ?admin URL parameter
    if (typeof window !== 'undefined' && window.location.search.includes('admin=1')) {
      setShowAdminModal(true);
    }

    // Keyboard shortcut (Ctrl+Alt+A or Cmd+Alt+A) for developer/audit access without cluttering the UI
    const handleAdminShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setShowAdminModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleAdminShortcut);
    return () => window.removeEventListener('keydown', handleAdminShortcut);
  }, []);

  // Handle Profile Switch
  const handleSelectProfile = async (profileId: string) => {
    setActiveProfileId(profileId);
    try {
      const [calcData, btData] = await Promise.all([
        api.getCalculation(profileId).catch(() => ({ calculation: null, ensemble: null, backtest: null })),
        api.getBacktests(profileId).catch(() => ({ events: [], result: null }))
      ]);
      const prof = profiles.find((p) => p.id === profileId);

      let currentCalc = calcData.calculation;
      if (!currentCalc && prof?.birthData) {
        currentCalc = runFullDestinyCalculation(prof.birthData, profileId, (btData.events || []).length);
      }
      setCalculation(currentCalc);

      let currentBt = calcData.backtest || btData.result;
      if (!currentBt && currentCalc) {
        currentBt = runBacktestAnalysis(btData.events || [], currentCalc);
      }
      setBacktestResult(currentBt);
      setEvents(btData.events || []);

      let currentEnsemble = calcData.ensemble;
      if (!currentEnsemble && currentCalc && prof) {
        currentEnsemble = generateMultiAgentEnsemble(prof, currentCalc, currentBt?.destinyConsistencyScore ?? null);
      }
      setEnsemble(currentEnsemble);
    } catch (e) {
      console.error('API Error details (handleSelectProfile):', e);
    }
  };

  // Recalculate
  const handleRecalculate = async () => {
    if (!activeProfileId) return;
    try {
      const data = await api.recalculate(activeProfileId);
      setCalculation(data.calculation);
      setEnsemble(data.ensemble);
      setBacktestResult(data.backtest);
    } catch (e) {
      console.error('API Error details (handleRecalculate):', e);
      // Fallback deterministic recalculation
      const prof = profiles.find((p) => p.id === activeProfileId);
      if (prof?.birthData) {
        const newCalc = runFullDestinyCalculation(prof.birthData, activeProfileId, events.length);
        const newBt = runBacktestAnalysis(events, newCalc);
        const newEnsemble = generateMultiAgentEnsemble(prof, newCalc, newBt.destinyConsistencyScore);
        setCalculation(newCalc);
        setBacktestResult(newBt);
        setEnsemble(newEnsemble);
      }
    }
  };

  // Create Profile from Onboarding
  const handleCreateProfile = async (
    name: string,
    birthData: BirthData,
    behavioral: BehavioralContext
  ) => {
    try {
      try {
        sessionStorage.setItem('aurora_destiny_visited', 'true');
      } catch (e) {
        console.error('API Error details (sessionStorage):', e);
      }

      await api.ensureSession();

      const data = await api.createProfile({
        name,
        birthData,
        behavioralContext: behavioral,
        isPrimary: profiles.length === 0
      });

      setProfiles((prev) => [...prev, data.profile]);
      setActiveProfileId(data.profile.id);
      setCalculation(data.calculation);
      setSyncStatus('synced');

      const bt = runBacktestAnalysis([], data.calculation);
      setBacktestResult(bt);
      setEvents([]);
      setEnsemble(generateMultiAgentEnsemble(data.profile, data.calculation, bt.destinyConsistencyScore));
      setShowOnboarding(false);
    } catch (e) {
      console.error('API Error details (handleCreateProfile):', e);
      // Deterministic calculation if network drops
      const newCalc = runFullDestinyCalculation(birthData, 'prof_' + Date.now(), 0);
      const newProfile: UserProfile = {
        id: 'prof_' + Date.now(),
        userId: 'usr_guest',
        name,
        isPrimary: profiles.length === 0,
        avatarSeed: name.toLowerCase().replace(/\s+/g, '_'),
        birthData,
        behavioralContext: behavioral,
        latestCalculationId: newCalc.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setProfiles((prev) => [...prev, newProfile]);
      setActiveProfileId(newProfile.id);
      setCalculation(newCalc);
      setSyncStatus('local_only');
      setLocalProfileIds((prev) => new Set(prev).add(newProfile.id));
      const bt = runBacktestAnalysis([], newCalc);
      setBacktestResult(bt);
      setEvents([]);
      setEnsemble(generateMultiAgentEnsemble(newProfile, newCalc, bt.destinyConsistencyScore));
      setShowOnboarding(false);
    }
  };

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  // Add Historical Event for Backtesting
  const handleAddEvent = async (eventData: Partial<HistoricalEvent>) => {
    if (!activeProfile || !calculation) {
      console.warn('[Backtesting] Cannot add event: activeProfile or calculation is not yet loaded.');
      return;
    }

    try {
      if (localProfileIds.has(activeProfileId)) {
        throw new Error('LOCAL_PROFILE');
      }

      const data = await api.addHistoricalEvent({
        ...eventData,
        profileId: activeProfileId
      });

      setEvents((prev) => [data.event, ...prev]);
      setBacktestResult(data.backtestResult);

      // Refresh ensemble with updated consistency score
      if (activeProfile && calculation) {
        setEnsemble(generateMultiAgentEnsemble(activeProfile, calculation, data.backtestResult.destinyConsistencyScore));
      }
    } catch (e) {
      console.warn('[Backtesting] Recording event in local offline state:', e);
      const newEvent: HistoricalEvent = {
        id: 'evt_' + Date.now(),
        profileId: activeProfileId,
        year: eventData.year || new Date().getFullYear(),
        category: eventData.category || 'Career',
        title: eventData.title || 'Sự kiện cục bộ',
        description: eventData.description || '',
        impact: eventData.impact || 'Positive',
        intensity: eventData.intensity || 3,
        userConfidence: eventData.userConfidence || 5,
        createdAt: new Date().toISOString()
      };
      const updatedEvents = [newEvent, ...events];
      setEvents(updatedEvents);
      const updatedBt = runBacktestAnalysis(updatedEvents, calculation);
      setBacktestResult(updatedBt);
      if (activeProfile && calculation) {
        setEnsemble(generateMultiAgentEnsemble(activeProfile, calculation, updatedBt.destinyConsistencyScore));
      }
    }
  };

  // Delete Historical Event
  const handleDeleteEvent = async (eventId: string) => {
    if (!activeProfile || !calculation) {
      console.warn('[Backtesting] Cannot delete event: activeProfile or calculation is not yet loaded.');
      return;
    }

    try {
      if (localProfileIds.has(activeProfileId)) {
        throw new Error('LOCAL_PROFILE');
      }

      const data = await api.deleteHistoricalEvent(activeProfileId, eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setBacktestResult(data.backtestResult);

      if (activeProfile && calculation) {
        setEnsemble(generateMultiAgentEnsemble(activeProfile, calculation, data.backtestResult.destinyConsistencyScore));
      }
    } catch (e) {
      console.warn('[Backtesting] Deleting event in local offline state:', e);
      const updatedEvents = events.filter((e) => e.id !== eventId);
      setEvents(updatedEvents);
      const updatedBt = runBacktestAnalysis(updatedEvents, calculation);
      setBacktestResult(updatedBt);
      if (activeProfile && calculation) {
        setEnsemble(generateMultiAgentEnsemble(activeProfile, calculation, updatedBt.destinyConsistencyScore));
      }
    }
  };

  // Export User Dossier
  const handleExportData = async (profId: string) => {
    try {
      const res = await fetch(`/api/export/${profId}`, {
        credentials: 'same-origin'
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aurora_destiny_${profId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error('Export error:', e);
    }
  };

  // Update Preferences
  const handleUpdatePreferences = async (pref: Partial<UserPreferences>) => {
    try {
      const updated = await api.updatePreferences(pref);
      setPreferences(updated);
    } catch (e) {
      console.error('API Error details:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-slate-200 font-sans selection:bg-purple-500/30 selection:text-teal-200 relative overflow-hidden flex flex-col">
      {/* 0. Celestial Animated Particles & Constellation Engine */}
      <CelestialBackground />

      {/* Immersive UI Ambient Mesh Glow Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-purple-900/15 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[55%] h-[55%] bg-teal-900/12 blur-[160px] rounded-full" />
        <div className="absolute top-[25%] right-[5%] w-[35%] h-[35%] bg-blue-900/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-immersive-radial opacity-25 pointer-events-none" />
      </div>

      {/* 2. Top Header Navigation (Clean, unobstructed professional top bar) */}

      {/* 2. Top Header Navigation */}
      <div className="relative z-30">
        <Navbar
          language={language}
          onLanguageChange={setLanguage}
          profiles={profiles}
          activeProfileId={activeProfileId}
          onSelectProfile={handleSelectProfile}
          onOpenNewProfileModal={() => setShowOnboarding(true)}
          onOpenPrivacyCenter={() => setShowPrivacyModal(true)}
          onOpenAdminModal={() => setShowAdminModal(true)}
          onOpenReportModal={() => setShowReportModal(true)}
          onRunTestAudit={() => setShowAdminModal(true)}
          calculation={calculation}
          onOpenAlertCenter={() => setShowRealtimeAlertModal(true)}
          onOpenInternationalModal={() => setShowInternationalModal(true)}
          onOpenTalismanModal={() => setShowTalismanModal(true)}
          onOpenSponsorshipModal={() => setShowSponsorshipModal(true)}
          onOpenCommunityModal={() => setShowCommunityModal(true)}
          onNavigateTab={setActiveTab}
          onOpenSeniorGuide={() => setShowSeniorGuideModal(true)}
        />
      </div>

      {/* 3. Main Workspace Content Area */}
      <main className={`relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-4 flex-1 w-full flex flex-col ${
        activeProfile && calculation && ensemble
          ? 'pb-28 sm:pb-32'
          : 'pb-6 sm:pb-10 min-h-[calc(100vh-120px)] justify-center'
      }`}>
        {/* Top 3D Navigation Tab Bar (Only when active profile exists) */}
        {activeProfile && calculation && ensemble && (
          <Top3DTabBar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              sacredSound.playCelestialChime(768);
              setActiveTab(tab);
            }}
            language={language}
            consistencyScore={ensemble?.overallConsistencyScore}
          />
        )}

        {loadError && (
          <div className="mb-4 p-4 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold text-xs uppercase tracking-wider">CHẾ ĐỘ THIẾT BỊ</span>
              <span className="text-xs sm:text-sm text-slate-200">
                {loadError.includes('500') || loadError.includes('HTTP')
                  ? 'Hệ thống đang hoạt động ở chế độ thiết bị an toàn. Bạn có thể lập lá số và xem luận giải chiêm tinh bình thường.'
                  : loadError}
              </span>
            </div>
            <button
              onClick={() => {
                setLoadError(null);
                if (!activeProfile) setShowOnboarding(true);
                else loadInitialData();
              }}
              className="px-3.5 py-1.5 bg-purple-500/20 hover:bg-purple-500/40 border border-purple-500/60 rounded-lg text-xs font-mono font-bold tracking-wider transition-colors text-white whitespace-nowrap cursor-pointer shadow-sm"
            >
              {activeProfile ? 'Thử Lại' : 'Lập Lá Số Ngay'}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-purple-500 border-r-teal-400 animate-spin shadow-[0_0_20px_rgba(124,58,237,0.3)]" />
            <p className="text-xs text-teal-400/80 font-mono tracking-widest uppercase animate-pulse">
              Đang khởi tạo Universal Analysis Engine...
            </p>
          </div>
        ) : !activeProfile || !calculation || !ensemble ? (
          <div className="flex flex-col items-center justify-center my-auto w-full max-w-xl mx-auto text-center px-4 py-2 relative">
            {/* Sacred Ambient Atmospheric Backlight (Êm dịu, tĩnh tại, hoàn toàn không có vòng tròn chồng lấn) */}
            <div className="absolute -top-6 inset-x-0 h-80 pointer-events-none flex items-center justify-center -z-10 overflow-hidden">
              <div className="w-full max-w-lg h-60 bg-gradient-to-b from-amber-500/10 via-yellow-600/5 to-transparent blur-3xl pointer-events-none" />
            </div>

            {/* Dignified Kicker & Title Header */}
            <div className="space-y-1.5 mb-2 relative z-10">
              <div className="flex items-center justify-center gap-2 text-[11px] sm:text-xs font-mono tracking-widest text-amber-400/90 uppercase">
                <span>Huyền Phong Phật Đạo</span>
                <span className="text-amber-500/60">·</span>
                <span>Tử Vi Đẩu Số Toàn Thư</span>
              </div>

              <div className="flex items-center justify-center gap-2.5 flex-wrap">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-white font-medium tracking-wide">
                  Khai Mở Bản Đồ <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent font-semibold">Thiên Cơ Bản Mệnh</span>
                </h2>
                <SacredSealBadge text="THIÊN CƠ" subtext="KHAI QUANG" size="sm" className="hidden sm:inline-flex" />
              </div>

              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-lg mx-auto font-light">
                Chiêm bái cuốn cổ thư nghìn năm để giải mã trọn vẹn <span className="text-amber-300 font-medium">12 Cung Tử Vi</span>, <span className="text-teal-300 font-medium">Tứ Trụ Bát Tự</span> và <span className="text-amber-300 font-medium">Vận Hạn 2026</span> cùng Hội Đồng 7 Tác Tử Chuyên Môn AI (Multi-Agent Perspectives).
              </p>
            </div>

            {/* The Centerpiece: Cuốn Cổ Thư Tử Vi Hoàng Gia Ngự Trên Bệ Sen Kim Cương */}
            <SacredCosmicCipher3D onActivate={() => {
              sacredSound.playSacredTap(528);
              setShowOnboarding(true);
            }} />

            {/* Sacred Voice Guidance Option (Tế nhị, truyền cảm, không gây phiền) */}
            <div className="my-2">
              <button
                type="button"
                onClick={() => {
                  sacredVoice.speak('welcome_invitation');
                }}
                className="px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-amber-500/15 border border-white/10 hover:border-amber-400/40 text-amber-200/90 hover:text-amber-100 text-xs font-medium transition-all flex items-center gap-2 cursor-pointer shadow-sm mx-auto"
                title="Lắng nghe lời thỉnh mệnh truyền cảm từ Huyền Phong Phật Đạo"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Lắng Nghe Lời Khai Tâm (Giọng Truyền Cảm)</span>
              </button>
            </div>

            {/* ================= ULTRA-PRESTIGIOUS ROYAL CTA BUTTON ================= */}
            <div className="w-full max-w-md mx-auto my-2">
              <motion.button
                id="btn-open-onboarding-empty-state"
                whileHover={{
                  scale: 1.025,
                  rotate: [0, -1.8, 1.8, -1.1, 0.7, -0.3, 0],
                  y: [0, -2, -3, -2, -1, 0],
                  transition: { duration: 0.85, ease: "easeInOut" }
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  sacredSound.playSacredTap(528);
                  setShowOnboarding(true);
                }}
                className="group relative w-full overflow-hidden px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 hover:from-yellow-300 hover:via-amber-300 hover:to-orange-400 text-slate-950 font-bold shadow-[0_0_35px_rgba(245,158,11,0.5)] hover:shadow-[0_0_60px_rgba(245,158,11,0.8)] hover-sacred-wobble transition-all cursor-pointer border-2 border-amber-200/90 ring-1 ring-amber-400/50 flex flex-col items-center justify-center gap-1 z-10"
              >
                {/* Internal Shimmering Light Sweep Beam */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                  <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent sacred-light-sweep-beam" />
                </div>

                {/* Main Action Text + Rotating Sacred Taiji Icon */}
                <div className="flex items-center justify-center gap-2.5 text-base sm:text-lg font-extrabold tracking-wide text-slate-950">
                  <SacredTaijiSpinner size={26} speed={6} className="shrink-0" />
                  <span className="drop-shadow-xs">LẬT MỞ THIÊN THƯ • LẬP LÁ SỐ BẢN MỆNH</span>
                  <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform shrink-0" />
                </div>

                {/* Subtitle Guarantee (Clean, reassuring) */}
                <span className="text-[11px] sm:text-xs text-slate-900/85 font-medium font-sans">
                  Giải mã 12 Cung Số, Tứ Trụ Bát Tự & Vận Hạn 120 Năm Đời Người • Miễn Phí 100%
                </span>
              </motion.button>
            </div>

            {/* Micro Feature Proof Pillars (Clean, unboxed text with subtle dividers) */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-2 text-xs text-slate-400 font-sans">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="text-amber-400 font-bold">✓</span> Cổ Học Chính Bản
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="text-teal-400 font-bold">✓</span> 7 Tác Tử AI Chuyên Môn
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="text-emerald-400 font-bold">✓</span> Bảo Mật Cục Bộ 100%
              </span>
            </div>

            {/* 4 Sacred Pillars Unlocked Preview (Tăng ham muốn xem tử vi lên mức tối đa) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-2xl mt-4 text-left">
              <button
                type="button"
                onClick={() => {
                  sacredSound.playSacredTap(528);
                  setShowOnboarding(true);
                }}
                className="p-3 rounded-2xl bg-white/[0.03] hover:bg-amber-500/10 border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-200">12 Cung Tử Vi</div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                    Mệnh, Tài, Quan, Thân · Tinh tú Miếu Hãm
                  </p>
                </div>
                <span className="text-[10px] text-amber-400/90 font-medium mt-2 flex items-center gap-0.5">
                  Khai mở ngay <span>→</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sacredSound.playSacredTap(528);
                  setShowOnboarding(true);
                }}
                className="p-3 rounded-2xl bg-white/[0.03] hover:bg-teal-500/10 border border-white/10 hover:border-teal-400/40 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-teal-200">Bát Tự & Dụng Thần</div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                    Ngũ Hành chân khí · Quý nhân trợ mệnh
                  </p>
                </div>
                <span className="text-[10px] text-teal-400/90 font-medium mt-2 flex items-center gap-0.5">
                  Khai mở ngay <span>→</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sacredSound.playSacredTap(528);
                  setShowOnboarding(true);
                }}
                className="p-3 rounded-2xl bg-white/[0.03] hover:bg-rose-500/10 border border-white/10 hover:border-rose-400/40 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                    <Flame className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-rose-200">Vận Hạn 2026</div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                    Lưu Niên Bính Ngọ · Tháng đại cát & hóa giải
                  </p>
                </div>
                <span className="text-[10px] text-rose-400/90 font-medium mt-2 flex items-center gap-0.5">
                  Khai mở ngay <span>→</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sacredSound.playSacredTap(528);
                  setShowOnboarding(true);
                }}
                className="p-3 rounded-2xl bg-white/[0.03] hover:bg-purple-500/10 border border-white/10 hover:border-purple-400/40 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-purple-200">7 AI Chuyên Môn</div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                    Hội đồng Đa góc nhìn · Không bịa đặt
                  </p>
                </div>
                <span className="text-[10px] text-purple-400/90 font-medium mt-2 flex items-center gap-0.5">
                  Khai mở ngay <span>→</span>
                </span>
              </button>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.99 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'dashboard' && (
                <DestinyDashboard
                  profile={activeProfile}
                  calculation={calculation}
                  ensemble={ensemble}
                  language={language}
                  onRecalculate={handleRecalculate}
                  onNavigateTab={setActiveTab}
                  onOpenReportModal={() => setShowReportModal(true)}
                  onOpenShareCardModal={() => setShowShareCardModal(true)}
                  onOpenAlertCenter={() => setShowRealtimeAlertModal(true)}
                  onOpenTalismanModal={() => setShowTalismanModal(true)}
                  onOpenSponsorshipModal={() => setShowSponsorshipModal(true)}
                  onOpenSeniorGuide={() => setShowSeniorGuideModal(true)}
                />
              )}

              {activeTab === 'radar' && (
                <LifeRadarView
                  ensemble={ensemble}
                  calculation={calculation}
                  language={language}
                />
              )}

              {activeTab === 'timeline' && (
                <TimelineView
                  calculation={calculation}
                  language={language}
                />
              )}

              {activeTab === 'compatibility' && (
                <CompatibilityStudio
                  activeProfile={activeProfile}
                  calculation={calculation}
                  allProfiles={profiles}
                  language={language}
                />
              )}

              {activeTab === 'remedies' && (
                <DestinyRemediesView
                  profile={activeProfile}
                  calculation={calculation}
                  language={language}
                  onOpenSponsorshipModal={() => setShowSponsorshipModal(true)}
                />
              )}

              {/* Legacy fallbacks if triggered programmatically */}
              {(activeTab as string) === 'backtest' && backtestResult && (
                <BacktestingStudio
                  events={events}
                  backtestResult={backtestResult}
                  calculation={calculation}
                  language={language}
                  onAddEvent={handleAddEvent}
                  onDeleteEvent={handleDeleteEvent}
                />
              )}

              {(activeTab as string) === 'scenarios' && (
                <ScenarioSimulator
                  calculation={calculation}
                  language={language}
                />
              )}

              {activeTab === 'daily' && (
                <StrategicChronoNavigatorView
                  calculation={calculation}
                  language={language}
                  onOpenAlertCenter={() => setShowRealtimeAlertModal(true)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* 4. Luxury Academic Footer */}
      <AppFooter
        language={language}
        onOpenPrivacyCenter={() => setShowPrivacyModal(true)}
        onOpenReportModal={() => setShowReportModal(true)}
        onOpenInternationalModal={() => setShowInternationalModal(true)}
        onOpenTalismanModal={() => setShowTalismanModal(true)}
        onOpenLegalModal={() => setShowLegalModal(true)}
        onOpenSponsorshipModal={() => setShowSponsorshipModal(true)}
        onOpenCommunityModal={() => setShowCommunityModal(true)}
        hasFloatingDock={Boolean(activeProfile && calculation && ensemble)}
      />

      {/* 5. Bottom Thumb Navigation (Only rendered when a profile calculation exists) */}
      {activeProfile && calculation && ensemble && (
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            sacredSound.playCelestialChime(768);
            setActiveTab(tab);
          }}
          language={language}
        />
      )}

      {/* MODALS */}
      {showOnboarding && (
        <OnboardingWizard
          language={language}
          onLanguageChange={setLanguage}
          onComplete={handleCreateProfile}
          onCancel={() => {
            try {
              sessionStorage.setItem('aurora_destiny_visited', 'true');
            } catch (e) {
              console.error('API Error details (sessionStorage):', e);
            }
            setShowOnboarding(false);
          }}
          existingProfiles={profiles}
          activeProfileId={activeProfileId}
          onSelectProfile={handleSelectProfile}
        />
      )}

      {showSeniorGuideModal && (
        <SeniorDestinyGuideModal
          isOpen={showSeniorGuideModal}
          onClose={() => setShowSeniorGuideModal(false)}
          onComplete={handleCreateProfile}
        />
      )}

      {showReportModal && activeProfile && calculation && ensemble && backtestResult && (
        <ReportGeneratorModal
          profile={activeProfile}
          calculation={calculation}
          ensemble={ensemble}
          backtest={backtestResult}
          language={language}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {showPrivacyModal && (
        <PrivacyCenterModal
          profileId={activeProfileId}
          preferences={preferences}
          onUpdatePreferences={handleUpdatePreferences}
          onExportData={handleExportData}
          onClose={() => setShowPrivacyModal(false)}
        />
      )}

      {showAdminModal && (
        <AdminDashboard onClose={() => setShowAdminModal(false)} />
      )}

      {/* Real-time Celestial Alert Radar Modal */}
      {showRealtimeAlertModal && (
        <RealTimeAlertCenter
          calculation={calculation}
          language={language}
          onClose={() => setShowRealtimeAlertModal(false)}
        />
      )}

      {/* Legal & Moral Ethics Statement Modal */}
      <LegalEthicsModal
        isOpen={showLegalModal}
        language={language}
        onClose={() => setShowLegalModal(false)}
      />

      {/* Global Internationalization & Astronomy Studio Modal */}
      {showInternationalModal && (
        <InternationalizationModal
          language={language}
          onLanguageChange={setLanguage}
          onClose={() => setShowInternationalModal(false)}
          onSettingsApplied={(newSettings) => {
            setPreferences((prev) => ({
              ...prev,
              language: newSettings.language,
              timezone: newSettings.location.timezone
            }));
          }}
        />
      )}

      {/* Social Discovery & Privacy-Safe Share Card Modal */}
      {showShareCardModal && activeProfile && calculation && ensemble && (
        <SocialShareCardModal
          profile={activeProfile}
          calculation={calculation}
          ensemble={ensemble}
          onClose={() => setShowShareCardModal(false)}
        />
      )}

      {/* Global SEO & Astrological Knowledge Architecture Modal */}
      <SeoKnowledgeModal
        isOpen={showSeoModal}
        onClose={() => setShowSeoModal(false)}
        language={language}
      />

      {/* Thiên Bản Khai Mệnh & Pháp Bảo Vận Hạn Độc Bản (Golden Talisman & Hall of Patrons) */}
      {showTalismanModal && activeProfile && calculation && (
        <CelestialTalismanModal
          isOpen={showTalismanModal}
          onClose={() => setShowTalismanModal(false)}
          calculation={calculation}
          profile={activeProfile}
          language={language}
          onOpenSponsorshipModal={() => setShowSponsorshipModal(true)}
        />
      )}

      {/* Tùy Hỷ Gieo Duyên & Bảo Trợ Kênh (Sponsorship Modal) */}
      <SponsorshipModal
        isOpen={showSponsorshipModal}
        onClose={() => setShowSponsorshipModal(false)}
        language={language}
      />

      {/* Mạng Xã Hội Chính Thức Kênh Huyền Phong Phật Đạo (TikTok, YouTube, Facebook) */}
      <CommunitySocialModal
        isOpen={showCommunityModal}
        onClose={() => setShowCommunityModal(false)}
        language={language}
      />

      {/* PWA Enterprise Connectivity & Update Status Floating Toast */}
      <PWAOfflineIndicator />
    </div>
  );
}
