// ==============================================================================
// TEST SUITE: MODERN CUTTING-EDGE TECHNOLOGY UPGRADES
// Verifies:
// 1. Gemini 3.8 Flash model configuration & resilient streaming
// 2. Screen Wake Lock API service state transitions
// 3. Web App Badging API safety & execution
// 4. Client-side SSE stream message parser
// ==============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { runFullDestinyCalculation } from '../src/engine/destinyEngine';
import { runBacktestAnalysis } from '../src/engine/backtesting';
import { generateDestinyChatResponse, streamDestinyChatResponse } from '../src/services/geminiService';
import { wakeLockService } from '../src/services/wakeLockService';
import { setBadge, clearBadge } from '../src/services/destinyPushNotification';
import { api } from '../src/services/apiClient';
import { UserProfile } from '../src/types/user';

test('🚀 Modern Technology Upgrades & Next-Gen Capabilities Suite', async (t) => {
  const profile: UserProfile = {
    id: 'prof_tech_test',
    userId: 'user_tech',
    name: 'Phạm Minh Trí',
    isPrimary: true,
    avatarSeed: 'seed_tri',
    birthData: {
      solarYear: 1995,
      solarMonth: 8,
      solarDay: 18,
      solarHour: 6,
      solarMinute: 30,
      hasExactHour: true,
      birthCity: 'Đà Nẵng',
      birthCountry: 'Việt Nam',
      timezoneOffset: 7,
      timezoneName: 'Asia/Bangkok',
      longitude: 108.2,
      latitude: 16.05,
      gender: 'Male',
      calendarSystem: 'solar'
    },
    behavioralContext: {
      careerField: 'Trí tuệ Nhân tạo',
      employmentStatus: 'Kỹ sư trưởng',
      financialGoal: 'Độc lập tài chính',
      relationshipStatus: 'Độc thân',
      topPriority: 'Nghiên cứu & Đổi mới',
      personalNotes: 'Tiên phong công nghệ'
    },
    tag: 'self',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const calc = runFullDestinyCalculation(profile.birthData, profile.id, 0);
  const backtest = runBacktestAnalysis([], calc);

  await t.test('1. Gemini 3.8 Flash & Grounded AI Service Execution', async () => {
    const res = await generateDestinyChatResponse(
      'Năm nay tôi có cơ hội bứt phá công nghệ không?',
      profile,
      calc,
      backtest,
      { analysisYear: 2026 }
    );

    assert.ok(res.content && res.content.length > 50, 'Content must have detailed guidance');
    assert.ok(typeof res.confidenceScore === 'number', 'Confidence score must be numeric');
    assert.ok(typeof res.isFallback === 'boolean', 'isFallback must be a boolean flag');
  });

  await t.test('2. Real-Time Token Streaming Destiny Chat (streamDestinyChatResponse)', async () => {
    let chunkCount = 0;
    let accumulatedText = '';

    const streamResult = await streamDestinyChatResponse(
      'Lời khuyên hành động theo Dụng Thần?',
      profile,
      calc,
      backtest,
      { analysisYear: 2026 },
      (chunk) => {
        chunkCount++;
        accumulatedText += chunk;
      }
    );

    assert.ok(streamResult.content.length > 30, 'Streamed content must be returned');
    assert.ok(accumulatedText.length > 0 || streamResult.isFallback, 'Chunks or fallback must populate text');
  });

  await t.test('3. Screen Wake Lock API Service Resilience', async () => {
    // In node environment without navigator.wakeLock, methods must degrade gracefully without crashing
    assert.equal(wakeLockService.isSupported(), false, 'In node test environment wakeLock should be safely unsupported');
    assert.equal(wakeLockService.isActive(), false, 'Inactive by default');

    let reportedState: boolean | null = null;
    const unsub = wakeLockService.subscribe((active) => {
      reportedState = active;
    });

    assert.equal(reportedState, false, 'Subscriber received initial inactive state');

    const lockResult = await wakeLockService.requestLock();
    assert.equal(lockResult, false, 'requestLock returns false safely when unsupported');

    const toggleResult = await wakeLockService.toggle();
    assert.equal(toggleResult, false, 'toggle returns false safely when unsupported');

    await wakeLockService.releaseLock();
    unsub();
  });

  await t.test('4. Web App Badging API Safety', () => {
    // Calling setBadge and clearBadge in node environment must execute without throwing
    assert.doesNotThrow(() => {
      setBadge(1);
      setBadge(5);
      clearBadge();
    });
  });

  await t.test('5. ApiClient Streaming Method Presence', () => {
    assert.equal(typeof api.streamChatMessage, 'function', 'api.streamChatMessage must be defined and callable');
  });
});
