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
import { DailyDestinyView } from './components/DailyDestinyView';
import { CelestialBackground } from './components/CelestialBackground';
import { OnboardingWizard } from './components/OnboardingWizard';
import { ReportGeneratorModal } from './components/ReportGeneratorModal';
import { PrivacyCenterModal } from './components/PrivacyCenterModal';
import { AdminDashboard } from './components/AdminDashboard';
import { RealTimeAlertCenter } from './components/RealTimeAlertCenter';
import { SacredCosmicCipher3D } from './components/SacredCosmicCipher3D';

import { UserProfile, UserPreferences } from './types/user';
import { CalculationResult, BirthData, BehavioralContext, LanguageCode } from './types/destiny';
import { MultiAgentEnsemble, ChatMessage } from './types/ai';
import { HistoricalEvent, BacktestResult } from './types/backtest';
import {
  DEFAULT_USER,
  SEED_BIRTH_DATA_1,
  SEED_BEHAVIORAL_1,
  SEED_HISTORICAL_EVENTS_1
} from './services/db';
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
      // Fetch profiles
      const resProfiles = await fetch('/api/profiles');
      if (!resProfiles.ok) throw new Error(`HTTP error ${resProfiles.status}: ${resProfiles.statusText}`);
      const dataProfiles = await resProfiles.json();
      const loadedProfiles: UserProfile[] = Array.isArray(dataProfiles) ? dataProfiles : [];
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

      // Fetch calculation & ensemble
      const resCalc = await fetch(`/api/calculations/${targetId}`);
      if (!resCalc.ok) throw new Error(`HTTP error ${resCalc.status}: ${resCalc.statusText}`);
      const calcData = await resCalc.json();
      setCalculation(calcData.calculation);
      setEnsemble(calcData.ensemble);
      setBacktestResult(calcData.backtest);

      // Fetch historical events
      const resBt = await fetch(`/api/backtests/${targetId}`);
      if (!resBt.ok) throw new Error(`HTTP error ${resBt.status}: ${resBt.statusText}`);
      const btData = await resBt.json();
      setEvents(btData.events || []);

      // Fetch user preferences
      const resUser = await fetch('/api/user');
      if (!resUser.ok) throw new Error(`HTTP error ${resUser.status}: ${resUser.statusText}`);
      const userData = await resUser.json();
      if (userData?.preferences) setPreferences(userData.preferences);
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
  }, []);

  // Handle Profile Switch
  const handleSelectProfile = async (profileId: string) => {
    setActiveProfileId(profileId);
    try {
      const resCalc = await fetch(`/api/calculations/${profileId}`);
      if (!resCalc.ok) throw new Error(`HTTP error ${resCalc.status}: ${resCalc.statusText}`);
      const resBt = await fetch(`/api/backtests/${profileId}`);
      if (!resBt.ok) throw new Error(`HTTP error ${resBt.status}: ${resBt.statusText}`);
      const [calcData, btData] = await Promise.all([resCalc.json(), resBt.json()]);
      setCalculation(calcData.calculation);
      setEnsemble(calcData.ensemble);
      setBacktestResult(calcData.backtest);
      setEvents(btData.events || []);
    } catch (e) {
      console.error('API Error details:', e);
    }
  };

  // Recalculate
  const handleRecalculate = async () => {
    if (!activeProfileId) return;
    try {
      const res = await fetch('/api/calculations/recalculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: activeProfileId })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setCalculation(data.calculation);
      setEnsemble(data.ensemble);
      setBacktestResult(data.backtest);
    } catch (e) {
      console.error('API Error details:', e);
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

      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          birthData,
          behavioralContext: behavioral,
          isPrimary: profiles.length === 0
        })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setProfiles((prev) => [...prev, data.profile]);
      setActiveProfileId(data.profile.id);
      setCalculation(data.calculation);

      const bt = runBacktestAnalysis([], data.calculation);
      setBacktestResult(bt);
      setEvents([]);
      setEnsemble(generateMultiAgentEnsemble(data.profile, data.calculation, bt.destinyConsistencyScore));
      setShowOnboarding(false);
    } catch (e) {
      console.error('API Error details:', e);
      // Local fallback calculation if fetch fails
      const newCalc = runFullDestinyCalculation(birthData, 'prof_' + Date.now(), 0);
      const newProfile: UserProfile = {
        id: 'prof_' + Date.now(),
        userId: 'usr_aurora_master',
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

  // FIX: Khởi tạo activeProfile trước các hàm xử lý sự kiện để guard clause và cập nhật ensemble hoạt động chính xác
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  // Add Historical Event for Backtesting
  const handleAddEvent = async (eventData: Partial<HistoricalEvent>) => {
    // FIX: Guard clause ngăn chặn silent failure hoặc crash khi dữ liệu chưa sẵn sàng
    if (!activeProfile || !calculation) {
      console.warn('[Backtesting] Cannot add event: activeProfile or calculation is not yet loaded.');
      return;
    }

    try {
      const res = await fetch('/api/backtests/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // FIX: Đảm bảo profileId: activeProfileId được truyền đầy đủ vào body của request
        body: JSON.stringify({ ...eventData, profileId: activeProfileId })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setEvents((prev) => [data.event, ...prev]);
      setBacktestResult(data.backtestResult);

      // Refresh ensemble with updated consistency score
      if (activeProfile && calculation) {
        setEnsemble(generateMultiAgentEnsemble(activeProfile, calculation, data.backtestResult.destinyConsistencyScore));
      }
    } catch (e) {
      // FIX: Thêm console.error chi tiết để dễ debug
      console.error('API Error details (handleAddEvent):', e);
    }
  };

  // Delete Historical Event
  const handleDeleteEvent = async (eventId: string) => {
    // FIX: Guard clause ngăn chặn silent failure hoặc crash khi dữ liệu chưa sẵn sàng
    if (!activeProfile || !calculation) {
      console.warn('[Backtesting] Cannot delete event: activeProfile or calculation is not yet loaded.');
      return;
    }

    try {
      const res = await fetch(`/api/backtests/event/${activeProfileId}/${eventId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setBacktestResult(data.backtestResult);

      if (activeProfile && calculation) {
        setEnsemble(generateMultiAgentEnsemble(activeProfile, calculation, data.backtestResult.destinyConsistencyScore));
      }
    } catch (e) {
      // FIX: Thêm console.error chi tiết để dễ debug
      console.error('API Error details (handleDeleteEvent):', e);
    }
  };

  // Export User Dossier
  const handleExportData = (profId: string) => {
    window.open(`/api/export/${profId}`, '_blank');
  };

  // Update Preferences
  const handleUpdatePreferences = async (pref: Partial<UserPreferences>) => {
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pref)
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      const updated = await res.json();
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
        />
      </div>

      {/* 3. Main Workspace Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-5 pb-36 sm:pb-40 flex-1 w-full">
        {/* Top 3D Navigation Tab Bar */}
        <Top3DTabBar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          language={language}
          consistencyScore={ensemble?.overallConsistencyScore}
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-purple-500 border-r-teal-400 animate-spin shadow-[0_0_20px_rgba(124,58,237,0.3)]" />
            <p className="text-xs text-teal-400/80 font-mono tracking-widest uppercase animate-pulse">
              Đang khởi tạo Universal Analysis Engine...
            </p>
          </div>
        ) : !activeProfile || !calculation || !ensemble ? (
          <div className="flex flex-col items-center justify-center min-h-[55vh] max-w-xl mx-auto text-center px-4 py-8">
            <SacredCosmicCipher3D onActivate={() => setShowOnboarding(true)} />
            <div className="mt-4 mb-2 flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/50 border border-purple-500/30 text-purple-200 text-xs font-mono tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
              <span className="uppercase tracking-widest text-[10px] sm:text-xs">Trí Tuệ Nhân Tạo Giao Thoa Huyền Học Phương Đông</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-white font-medium mb-3 tracking-wide">
              Khai Mở Bản Đồ <span className="bg-gradient-to-r from-teal-300 via-emerald-200 to-purple-300 bg-clip-text text-transparent font-semibold">Thiên Cơ Bản Mệnh</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed mb-6 max-w-lg font-light">
              Trận đồ lượng tử đã sẵn sàng hòa nhịp cùng trường năng lượng của bạn. Hãy khởi tạo thời khắc sinh thần để khai mở ma trận <span className="text-teal-300 font-medium">Bát Tự Hà Lạc</span>, <span className="text-teal-300 font-medium">Tử Vi Đẩu Số</span> và đồng hành cùng <span className="text-amber-300 font-medium">Hội Đồng 7 Chuyên Gia AI</span> khai phóng tiềm năng vận mệnh.
            </p>

            {/* Micro Feature Proof Pillars */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-md mb-7 text-[11px] sm:text-xs text-slate-300 font-mono">
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                <span className="text-teal-300 font-bold text-xs sm:text-sm">Bát Tự • Tử Vi</span>
                <span className="text-[9px] text-slate-400 mt-0.5">Thuật Toán Cổ Học</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                <span className="text-purple-300 font-bold text-xs sm:text-sm">7 AI Chuyên Gia</span>
                <span className="text-[9px] text-slate-400 mt-0.5">Phân Tích Đồng Thuận</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                <span className="text-emerald-300 font-bold text-xs sm:text-sm">Bảo Mật 100%</span>
                <span className="text-[9px] text-slate-400 mt-0.5">Riêng Tư Cục Bộ</span>
              </div>
            </div>

            <button
              id="btn-open-onboarding-empty-state"
              onClick={() => setShowOnboarding(true)}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600 text-white font-semibold text-base shadow-[0_0_35px_rgba(45,212,191,0.4)] hover:shadow-[0_0_45px_rgba(168,85,247,0.5)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer border border-teal-400/50 group"
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

              {activeTab === 'backtest' && backtestResult && (
                <BacktestingStudio
                  events={events}
                  backtestResult={backtestResult}
                  calculation={calculation}
                  language={language}
                  onAddEvent={handleAddEvent}
                  onDeleteEvent={handleDeleteEvent}
                />
              )}

              {activeTab === 'scenarios' && (
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

      {/* 4. Bottom Thumb Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        language={language}
      />

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
    </div>
  );
}
