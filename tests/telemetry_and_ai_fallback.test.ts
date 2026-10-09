// ==========================================
// AURORA DESTINY AI — TELEMETRY & AI FALLBACK VERIFICATION SUITE
// Strict verification of monotonic durations, zero-duration defense,
// distinct external vs fallback tracking, timeout and failure branches.
// ==========================================

import assert from 'node:assert';
import test from 'node:test';
import { telemetry } from '../src/telemetry/telemetryService';
import { DeterministicProvider, GeminiProvider, CompositeAIProvider } from '../src/services/aiProvider';
import { runFullDestinyCalculation } from '../src/engine/destinyEngine';

test('Telemetry & AI Resilient Fallback Engine Suite', async (t) => {
  const calc = runFullDestinyCalculation({
    solarYear: 1995,
    solarMonth: 10,
    solarDay: 24,
    solarHour: 14,
    solarMinute: 30,
    birthCity: 'Đà Nẵng',
    birthCountry: 'Việt Nam',
    gender: 'Male',
    timezoneOffset: 7,
    timezoneName: 'Asia/Ho_Chi_Minh',
    calendarSystem: 'solar',
    hasExactHour: true,
    timeConvention: 'civil'
  }, 'prof_telemetry_test', 0);

  const mockProfile: any = {
    id: 'prof_telemetry_test',
    name: 'Nguyễn Văn Minh',
    birthData: {
      solarYear: 1995,
      solarMonth: 10,
      solarDay: 24,
      solarHour: 14,
      solarMinute: 30,
      gender: 'Male',
      birthCity: 'Đà Nẵng',
      timezoneOffset: 7
    },
    behavioralContext: {
      topPriority: 'Phát triển sự nghiệp',
      careerField: 'Công nghệ thông tin'
    }
  };

  const mockBacktest: any = {
    totalEventsAnalyzed: 0,
    destinyConsistencyScore: 88,
    confidenceBand: 'High'
  };

  await t.test('1. Empty snapshot returns UNAVAILABLE metrics and null percentiles', () => {
    telemetry.resetForTesting();
    const snap = telemetry.getSnapshot();
    assert.strictEqual(snap.aiRequestsTotal, 0);
    assert.strictEqual(snap.aiSuccessTotal, 0);
    assert.strictEqual(snap.aiFailureTotal, 0);
    assert.strictEqual(snap.aiFallbackTotal, 0);
    assert.strictEqual(snap.aiLatencyAvgMs, null);
    assert.strictEqual(snap.aiPercentiles.p50, null);
    assert.strictEqual(snap.aiPercentiles.p95, null);
    assert.strictEqual(snap.aiPercentiles.p99, null);
    assert.strictEqual(snap.aiMetricStatus, 'UNAVAILABLE');
  });

  await t.test('2. External AI Success branch records accurately with monotonic latency', () => {
    telemetry.resetForTesting();
    telemetry.recordAiRequest(142.5, true, false, false);

    const snap = telemetry.getSnapshot();
    assert.strictEqual(snap.aiRequestsTotal, 1);
    assert.strictEqual(snap.aiSuccessTotal, 1);
    assert.strictEqual(snap.aiFailureTotal, 0);
    assert.strictEqual(snap.aiFallbackTotal, 0);
    assert.strictEqual(snap.aiLatencyAvgMs, 142.5);
    assert.strictEqual(snap.aiMetricStatus, 'REAL');
  });

  await t.test('3. Deterministic Fallback branch does NOT inflate external AI success count', () => {
    telemetry.resetForTesting();
    telemetry.recordAiRequest(3.2, true, false, true);

    const snap = telemetry.getSnapshot();
    assert.strictEqual(snap.aiRequestsTotal, 1);
    // External success must be 0 because this was served via deterministic fallback
    assert.strictEqual(snap.aiSuccessTotal, 0);
    assert.strictEqual(snap.aiFallbackTotal, 1);
    assert.strictEqual(snap.aiFailureTotal, 0);
    assert.strictEqual(snap.aiLatencyAvgMs, 3.2);
  });

  await t.test('4. Zero-duration defense: passing 0 ms duration is normalized to strictly positive duration', () => {
    telemetry.resetForTesting();
    // Simulate legacy buggy call passing 0
    telemetry.recordAiRequest(0, true, false, true);

    const snap = telemetry.getSnapshot();
    assert.ok(snap.aiLatencyAvgMs !== null && snap.aiLatencyAvgMs > 0, 'Duration must never be 0');
    assert.ok(snap.aiPercentiles.p50 !== null && snap.aiPercentiles.p50 > 0);
  });

  await t.test('5. External Provider Failure branch records failure and maintains latency', () => {
    telemetry.resetForTesting();
    telemetry.recordAiRequest(89.4, false, false, false);

    const snap = telemetry.getSnapshot();
    assert.strictEqual(snap.aiRequestsTotal, 1);
    assert.strictEqual(snap.aiSuccessTotal, 0);
    assert.strictEqual(snap.aiFailureTotal, 1);
    assert.strictEqual(snap.aiTimeoutTotal, 0);
    assert.strictEqual(snap.aiFallbackTotal, 0);
    assert.strictEqual(snap.aiLatencyAvgMs, 89.4);
  });

  await t.test('6. External Timeout branch increments both timeout and failure totals', () => {
    telemetry.resetForTesting();
    telemetry.recordAiRequest(8000.0, false, true, false);

    const snap = telemetry.getSnapshot();
    assert.strictEqual(snap.aiRequestsTotal, 1);
    assert.strictEqual(snap.aiSuccessTotal, 0);
    assert.strictEqual(snap.aiFailureTotal, 1);
    assert.strictEqual(snap.aiTimeoutTotal, 1);
    assert.strictEqual(snap.aiLatencyAvgMs, 8000.0);
  });

  await t.test('7. Fallback transition avoids double counting requests during failover', () => {
    telemetry.resetForTesting();
    telemetry.recordAiFallbackTransition({
      externalDurationMs: 450.2,
      fallbackDurationMs: 4.8,
      isTimeout: false,
      fallbackSuccess: true
    });

    const snap = telemetry.getSnapshot();
    // Only 1 user request cycle occurred!
    assert.strictEqual(snap.aiRequestsTotal, 1);
    assert.strictEqual(snap.aiExternalCallsTotal, 1);
    assert.strictEqual(snap.aiExternalSuccessTotal, 0);
    assert.strictEqual(snap.aiFailureTotal, 1);
    assert.strictEqual(snap.aiFallbackTotal, 1);
    assert.strictEqual(snap.aiFallbackSuccessTotal, 1);
    // Overall resolution success rate should be 100% since fallback resolved it
    assert.strictEqual(snap.aiSuccessRate, 100);
    assert.strictEqual(snap.aiLatencyAvgMs, 455);
  });

  await t.test('8. DeterministicProvider operates with 100% uptime without GEMINI_API_KEY', async () => {
    telemetry.resetForTesting();
    const provider = new DeterministicProvider();
    assert.strictEqual(provider.isAvailable(), true);

    const res = await provider.generateInterpretation({
      userMessage: 'Định hướng công việc năm 2026 thế nào?',
      profile: mockProfile,
      calc,
      backtest: mockBacktest,
      analysisYear: 2026
    });

    assert.ok(res.content.length > 100);
    assert.strictEqual(res.isFallback, true);
    assert.strictEqual(res.provider, 'deterministic');
    assert.ok(res.latencyMs > 0, 'Measured latency must be strictly positive');
    assert.ok(res.content.includes('Bát Tự'));
    assert.ok(res.content.includes('Tử Vi'));
    assert.ok(res.content.includes('Lưu Niên 2026'));
  });

  await t.test('9. GeminiProvider is disabled by default when ENABLE_EXTERNAL_AI is not set', () => {
    const originalEnv = process.env.ENABLE_EXTERNAL_AI;
    try {
      delete process.env.ENABLE_EXTERNAL_AI;
      const provider = new GeminiProvider();
      assert.strictEqual(provider.isAvailable(), false, 'GeminiProvider must be disabled without explicit opt-in');
    } finally {
      if (originalEnv !== undefined) process.env.ENABLE_EXTERNAL_AI = originalEnv;
    }
  });

  await t.test('10. CompositeAIProvider defaults safely to DeterministicProvider when external AI is unavailable', async () => {
    telemetry.resetForTesting();
    const composite = new CompositeAIProvider();
    assert.strictEqual(composite.isAvailable(), true);

    const res = await composite.generateInterpretation({
      userMessage: 'Tài lộc năm nay ra sao?',
      profile: mockProfile,
      calc,
      backtest: mockBacktest,
      analysisYear: 2026
    });

    assert.strictEqual(res.isFallback, true);
    assert.strictEqual(res.provider, 'deterministic');
    assert.ok(res.content.includes('Căn Cứ Bản Mệnh & Bát Tự'));
  });

  await t.test('11. Multi-sample percentile calculations are mathematically consistent', () => {
    telemetry.resetForTesting();
    const latencies = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    latencies.forEach(lat => telemetry.recordAiRequest(lat, true, false, false));

    const snap = telemetry.getSnapshot();
    assert.strictEqual(snap.aiRequestsTotal, 10);
    assert.strictEqual(snap.aiSuccessTotal, 10);
    assert.strictEqual(snap.aiLatencyAvgMs, 55);
    assert.strictEqual(snap.aiPercentiles.p50, 55);
    assert.ok(snap.aiPercentiles.p95 !== null && snap.aiPercentiles.p95 >= 90);
    assert.ok(snap.aiPercentiles.p99 !== null && snap.aiPercentiles.p99 >= 95);
  });
});
