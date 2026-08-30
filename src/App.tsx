// ==========================================
// AURORA DESTINY AI — MAIN APPLICATION ROOT
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
      return true;
    }
  });
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);

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
      const resProfiles = await fetch('/api/profiles').then((r) => r.json());
      setProfiles(resProfiles);

      const targetId = resProfiles[0]?.id || 'prof_primary';
      setActiveProfileId(targetId);

      // Fetch calculation & ensemble
      const calcData = await fetch(`/api/calculations/${targetId}`).then((r) => r.json());
      setCalculation(calcData.calculation);
      setEnsemble(calcData.ensemble);
      setBacktestResult(calcData.backtest);

      // Fetch historical events
      const btData = await fetch(`/api/backtests/${targetId}`).then((r) => r.json());
      setEvents(btData.events || []);

      // Fetch user preferences
      const userData = await fetch('/api/user').then((r) => r.json());
      if (userData?.preferences) setPreferences(userData.preferences);
    } catch (e) {
      // Offline / In-memory fallback
      const calc = runFullDestinyCalculation(SEED_BIRTH_DATA_1, 'prof_primary', SEED_HISTORICAL_EVENTS_1.length);
      const bt = runBacktestAnalysis(SEED_HISTORICAL_EVENTS_1, calc);
      const prof: UserProfile = {
        id: 'prof_primary',
        userId: 'usr_aurora_master',
        name: 'Bản Mệnh Chính (Bính Tý 1996)',
        isPrimary: true,
        avatarSeed: 'alex_aurora',
        birthData: SEED_BIRTH_DATA_1,
        behavioralContext: SEED_BEHAVIORAL_1,
        latestCalculationId: calc.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setProfiles([prof]);
      setActiveProfileId(prof.id);
      setCalculation(calc);
      setEvents(SEED_HISTORICAL_EVENTS_1);
      setBacktestResult(bt);
      setEnsemble(generateMultiAgentEnsemble(prof, calc, bt.destinyConsistencyScore));
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
      const [calcData, btData] = await Promise.all([
        fetch(`/api/calculations/${profileId}`).then((r) => r.json()),
        fetch(`/api/backtests/${profileId}`).then((r) => r.json())
      ]);
      setCalculation(calcData.calculation);
      setEnsemble(calcData.ensemble);
      setBacktestResult(calcData.backtest);
      setEvents(btData.events || []);
    } catch (e) {}
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
      const data = await res.json();
      setCalculation(data.calculation);
      setEnsemble(data.ensemble);
      setBacktestResult(data.backtest);
    } catch (e) {}
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
      } catch (e) {}

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

  // Add Historical Event for Backtesting
  const handleAddEvent = async (eventData: Partial<HistoricalEvent>) => {
    try {
      const res = await fetch('/api/backtests/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      const data = await res.json();
      setEvents((prev) => [data.event, ...prev]);
      setBacktestResult(data.backtestResult);

      // Refresh ensemble with updated consistency score
      if (activeProfile && calculation) {
        setEnsemble(generateMultiAgentEnsemble(activeProfile, calculation, data.backtestResult.destinyConsistencyScore));
      }
    } catch (e) {}
  };

  // Delete Historical Event
  const handleDeleteEvent = async (eventId: string) => {
    try {
      const res = await fetch(`/api/backtests/event/${activeProfileId}/${eventId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setBacktestResult(data.backtestResult);

      if (activeProfile && calculation) {
        setEnsemble(generateMultiAgentEnsemble(activeProfile, calculation, data.backtestResult.destinyConsistencyScore));
      }
    } catch (e) {}
  };

  // Export User Dossier
  const handleExportData = (profId: string) => {
    window.open(`/api/export/${profId}`, '_blank');
  };

  // Update Preferences
  const handleUpdatePreferences = async (pref: Partial<UserPreferences>) => {
    const res = await fetch('/api/user/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pref)
    });
    const updated = await res.json();
    setPreferences(updated);
  };

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

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

        {isLoading || !calculation || !ensemble || !activeProfile ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-purple-500 border-r-teal-400 animate-spin shadow-[0_0_20px_rgba(124,58,237,0.3)]" />
            <p className="text-xs text-teal-400/80 font-mono tracking-widest uppercase animate-pulse">
              Đang khởi tạo Universal Analysis Engine...
            </p>
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
            } catch (e) {}
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
    </div>
  );
}
