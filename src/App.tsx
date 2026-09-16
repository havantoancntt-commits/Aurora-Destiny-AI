// ==========================================
// AURORA DESTINY AI — MAIN APPLICATION ROOT
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, UserPlus } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Top3DTabBar } from './components/Top3DTabBar';
import { BottomNav, TabKey } from './components/BottomNav';
import { ResponsibleAIBanner } from './components/ResponsibleAIBanner';
import { DestinyDashboard } from './components/DestinyDashboard';
import { LifeRadarView } from './components/LifeRadarView';
import { TimelineView } from './components/TimelineView';
import { BacktestingStudio } from './components/BacktestingStudio';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { CompatibilityStudio } from './components/CompatibilityStudio';
import { DestinyRemediesView } from './components/DestinyRemediesView';
import { DailyDestinyView } from './components/DailyDestinyView';
import { CelestialBackground } from './components/CelestialBackground';
import { OnboardingWizard } from './components/OnboardingWizard';
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
import { sacredSound } from './services/soundService';

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

  // Initial Load from API
  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      await api.ensureSession();

      // Fetch profiles
      const loadedProfiles = await api.getProfiles().catch(() => []);
      setProfiles(loadedProfiles);

      if (loadedProfiles.length === 0) {
        // Hoàn toàn không có lá số demo, mở ngay ô nhập thông tin khi người dùng vừa truy cập
        setShowOnboarding(true);
        setActiveProfileId('');
        setCalculation(null);
        setEnsemble(null);
        setBacktestResult(null);
        setEvents([]);
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
        currentEnsemble = generateMultiAgentEnsemble(loadedProfiles[0], currentCalc, currentBt?.destinyConsistencyScore || 75);
      }
      setEnsemble(currentEnsemble);

      // Fetch user preferences
      const me = await api.getMe().catch(() => null);
      if (me?.preferences) setPreferences(me.preferences);
    } catch (e) {
      console.error('API Error details:', e);
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
        currentEnsemble = generateMultiAgentEnsemble(prof, currentCalc, currentBt?.destinyConsistencyScore || 75);
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
      console.error('API Error details (handleAddEvent):', e);
    }
  };

  // Delete Historical Event
  const handleDeleteEvent = async (eventId: string) => {
    if (!activeProfile || !calculation) {
      console.warn('[Backtesting] Cannot delete event: activeProfile or calculation is not yet loaded.');
      return;
    }

    try {
      const data = await api.deleteHistoricalEvent(activeProfileId, eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setBacktestResult(data.backtestResult);

      if (activeProfile && calculation) {
        setEnsemble(generateMultiAgentEnsemble(activeProfile, calculation, data.backtestResult.destinyConsistencyScore));
      }
    } catch (e) {
      console.error('API Error details (handleDeleteEvent):', e);
    }
  };

  // Export User Dossier
  const handleExportData = async (profId: string) => {
    try {
      const token = api.getToken();
      const res = await fetch(`/api/export/${profId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
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

      {/* 1. Scientific & Ethical Transparency Banner */}
      <div className="relative z-10">
        <ResponsibleAIBanner
          language={language}
          consistencyScore={ensemble?.overallConsistencyScore}
          uncertaintyIndex={calculation?.confidence.uncertaintyIndex}
        />
      </div>

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
        />
      </div>

      {/* 3. Main Workspace Content Area */}
      <main className={`relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-4 flex-1 w-full flex flex-col ${
        activeProfile && calculation && ensemble
          ? 'pb-6 sm:pb-10'
          : 'pb-4 sm:pb-8 min-h-[calc(100vh-120px)] justify-center'
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

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-purple-500 border-r-teal-400 animate-spin shadow-[0_0_20px_rgba(124,58,237,0.3)]" />
            <p className="text-xs text-teal-400/80 font-mono tracking-widest uppercase animate-pulse">
              Đang khởi tạo Universal Analysis Engine...
            </p>
          </div>
        ) : !activeProfile || !calculation || !ensemble ? (
          <div className="flex flex-col items-center justify-center my-auto w-full max-w-xl mx-auto text-center px-3 sm:px-4 py-2">
            <SacredCosmicCipher3D onActivate={() => setShowOnboarding(true)} />
            
            <div className="mt-3.5 mb-2.5 flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-200 text-xs font-mono tracking-wider shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
              <span className="uppercase tracking-widest text-[10px] sm:text-xs">Trí Tuệ Nhân Tạo Giao Thoa Huyền Học Phương Đông</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-white font-medium mb-2.5 tracking-wide">
              Khai Mở Bản Đồ <span className="bg-gradient-to-r from-teal-300 via-emerald-200 to-purple-300 bg-clip-text text-transparent font-semibold">Thiên Cơ Bản Mệnh</span>
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-slate-300/90 leading-relaxed mb-5 max-w-lg font-light">
              Trận đồ lượng tử đã sẵn sàng hòa nhịp cùng trường năng lượng của bạn. Hãy khởi tạo thời khắc sinh thần để khai mở ma trận <span className="text-teal-300 font-medium">Bát Tự Hà Lạc</span>, <span className="text-teal-300 font-medium">Tử Vi Đẩu Số</span> và đồng hành cùng <span className="text-amber-300 font-medium">Hội Đồng 7 Chuyên Gia AI</span> khai phóng tiềm năng vận mệnh.
            </p>

            {/* Micro Feature Proof Pillars */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full max-w-md mb-6 text-[11px] sm:text-xs text-slate-300 font-mono">
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.04] border border-white/10 text-center shadow-sm">
                <span className="text-teal-300 font-bold text-xs sm:text-sm">Bát Tự • Tử Vi</span>
                <span className="text-[9px] text-slate-400 mt-0.5">Thuật Toán Cổ Học</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.04] border border-white/10 text-center shadow-sm">
                <span className="text-purple-300 font-bold text-xs sm:text-sm">7 AI Chuyên Gia</span>
                <span className="text-[9px] text-slate-400 mt-0.5">Phân Tích Đồng Thuận</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.04] border border-white/10 text-center shadow-sm">
                <span className="text-emerald-300 font-bold text-xs sm:text-sm">Bảo Mật 100%</span>
                <span className="text-[9px] text-slate-400 mt-0.5">Riêng Tư Cục Bộ</span>
              </div>
            </div>

            <button
              id="btn-open-onboarding-empty-state"
              onClick={() => setShowOnboarding(true)}
              className="px-7 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600 text-white font-semibold text-sm sm:text-base shadow-[0_0_35px_rgba(45,212,191,0.4)] hover:shadow-[0_0_45px_rgba(168,85,247,0.5)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer border border-teal-400/50 group"
            >
              <UserPlus className="w-5 h-5 text-teal-200 group-hover:scale-110 transition-transform" />
              <span className="tracking-wide">Khởi Tạo Lá Số Bản Mệnh Ngay</span>
            </button>
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
                <DailyDestinyView
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
    </div>
  );
}
