// ====================================================
// AUDIT PHASES VERIFICATION TEST SUITE
// Validates:
// 1. Solar-Term Dynamic Da Yun Start Age (Phase 2 & Phase 3)
// 2. Backtest Null-Safety & Empirical Integrity (Phase 4)
// 3. Distributed Sliding-Window Rate Limiter & Fallback (Phase 8)
// 4. Telemetry Determinism & Claim Verification (Phase 17)
// 5. Database Repository Factory (Phase 6 & Phase 7)
// ====================================================

import assert from 'assert';
import { calculateDaYunStartAgeDetail, calculateDecadeCycles, DA_YUN_TIME_CONVERSION_RULE } from '../../src/engine/temporal';
import { runBacktestAnalysis } from '../../src/engine/backtesting';
import { runFullDestinyCalculation } from '../../src/engine/destinyEngine';
import { MemoryRateLimitStore } from '../../src/server/rateLimiter';
import { telemetry } from '../../src/telemetry/telemetryService';
import { createRepository } from '../../src/db/repository';
import { BirthData } from '../../src/types/destiny';

export async function runAuditPhaseVerificationTests(): Promise<void> {
  console.log('🛡️ [Audit Phase Test] Verifying Core Algorithmic & Architectural Invariants...');

  // Test 1: Dynamic Da Yun Calculation (Phases 2 & 3)
  {
    const birthDataMaleYang: BirthData = {
      gender: 'Male',
      solarYear: 1990, // Canh Ngọ (Yang Metal)
      solarMonth: 5,
      solarDay: 15,
      solarHour: 10,
      solarMinute: 30,
      hasExactHour: true,
      birthCity: 'Hà Nội',
      birthCountry: 'Việt Nam',
      timezoneName: 'Asia/Ho_Chi_Minh',
      calendarSystem: 'solar',
      timezoneOffset: 7
    };

    const daYunDetail = calculateDaYunStartAgeDetail(birthDataMaleYang);
    assert.strictEqual(daYunDetail.direction, 'forward', 'Yang Male must advance forward to next solar term');
    assert(daYunDetail.elapsedDays > 0, 'Elapsed days must be strictly positive');
    assert(daYunDetail.startAgeExact > 0 && daYunDetail.startAgeExact < 11, 'Start age should be within typical 1-10 range');
    assert.strictEqual(daYunDetail.conversionRule, DA_YUN_TIME_CONVERSION_RULE.name);

    const cycles = calculateDecadeCycles(birthDataMaleYang);
    assert.strictEqual(cycles.length, 8, 'Must calculate exactly 8 decade cycles');
    assert.strictEqual(cycles[0].startAgeExact, daYunDetail.startAgeExact, 'First decade start age must match exact calculation');
    assert(Math.abs(cycles[0].startAge - daYunDetail.startAgeExact) < 0.1, 'Rounded start age must be close to exact');
    assert.strictEqual(cycles[1].startAge, Number((cycles[0].startAge + 10).toFixed(1)), 'Next decade must be +10 years');

    console.log('  ✅ [PASS] Dynamic Solar-Term Da Yun Start Age (3 Days = 1 Year)');
  }

  // Test 2: Phase 4 Backtest Zero-Event Null Score & Status
  {
    const birthData: BirthData = {
      gender: 'Female',
      solarYear: 1995,
      solarMonth: 8,
      solarDay: 20,
      solarHour: 14,
      solarMinute: 0,
      hasExactHour: true,
      birthCity: 'Hồ Chí Minh',
      birthCountry: 'Việt Nam',
      timezoneName: 'Asia/Ho_Chi_Minh',
      calendarSystem: 'solar',
      timezoneOffset: 7
    };

    const calcResult = runFullDestinyCalculation(birthData);

    // Empty events test -> score MUST be null
    const emptyBacktest = runBacktestAnalysis([], calcResult);
    assert.strictEqual(emptyBacktest.totalEventsAnalyzed, 0, 'Zero events analyzed');
    assert.strictEqual(emptyBacktest.destinyConsistencyScore, null, 'destinyConsistencyScore must be strictly null when 0 events');
    assert.strictEqual(emptyBacktest.historicalHitRate, null, 'historicalHitRate must be strictly null when 0 events');
    assert.strictEqual(emptyBacktest.validationStatus, 'INSUFFICIENT_DATA', 'validationStatus must be INSUFFICIENT_DATA');
    assert.strictEqual(emptyBacktest.evidenceStatus, 'INSUFFICIENT_HISTORICAL_EVIDENCE', 'evidenceStatus must be INSUFFICIENT_HISTORICAL_EVIDENCE');

    // With events test
    const populatedBacktest = runBacktestAnalysis([
      {
        id: 'ev_1',
        profileId: calcResult.profileId,
        year: 2018,
        title: 'Thăng chức Giám đốc dự án',
        category: 'Career',
        impact: 'Breakthrough',
        intensity: 5,
        description: 'Được bổ nhiệm vị trí chủ chốt',
        userConfidence: 5,
        createdAt: new Date().toISOString()
      },
      {
        id: 'ev_2',
        profileId: calcResult.profileId,
        year: 2020,
        title: 'Biến cố đầu tư',
        category: 'Finance',
        impact: 'Negative',
        intensity: 4,
        description: 'Tổn thất thị trường',
        userConfidence: 4,
        createdAt: new Date().toISOString()
      }
    ], calcResult);

    assert.strictEqual(populatedBacktest.totalEventsAnalyzed, 2);
    assert(typeof populatedBacktest.destinyConsistencyScore === 'number', 'Score must be a number when events exist');
    assert(typeof populatedBacktest.historicalHitRate === 'number', 'Hit rate must be a number when events exist');
    assert.strictEqual(populatedBacktest.validationStatus, 'PRELIMINARY', '2 events should be PRELIMINARY validation');

    console.log('  ✅ [PASS] Backtest Empirical Null-Safety on Zero-Event Input');
  }

  // Test 3: Distributed Sliding Window Rate Limiter Store
  {
    const store = new MemoryRateLimitStore();
    const key = 'test_ip_127.0.0.1';

    const first = await store.increment(key, 1000);
    assert.strictEqual(first.count, 1, 'First request count should be 1');

    const second = await store.increment(key, 1000);
    assert.strictEqual(second.count, 2, 'Second request count should be 2');

    await store.reset(key);
    const afterReset = await store.increment(key, 1000);
    assert.strictEqual(afterReset.count, 1, 'After reset count should be 1');

    store.destroy();
    console.log('  ✅ [PASS] Sliding Window Rate Limiter Store & Boundary Protection');
  }

  // Test 4: Telemetry Determinism & Claim Tracking
  {
    telemetry.resetForTesting();
    telemetry.recordCalculation(15, true);

    // Invariant: when 0 determinism checks recorded, calculationDeterministicRate MUST be null, NOT calculationSuccessRate
    const zeroCheckSnap = telemetry.getSnapshot();
    assert.strictEqual(zeroCheckSnap.calculationSuccessRate, 100, 'calculationSuccessRate should be 100%');
    assert.strictEqual(zeroCheckSnap.calculationDeterministicRate, null, 'calculationDeterministicRate must be strictly null when 0 checks run');

    telemetry.recordDeterminismCheck(true);
    telemetry.recordDeterminismCheck(true);
    telemetry.recordClaimVerification(10, 9);

    const snapshot = telemetry.getSnapshot();
    assert.strictEqual(snapshot.calculationSuccessRate, 100);
    assert.strictEqual(snapshot.calculationDeterministicRate, 100);
    assert.strictEqual(snapshot.aiVerificationSuccessRate, 90);

    console.log('  ✅ [PASS] Telemetry Determinism and Grounded Claims Verification');
  }

  // Test 5: Database Repository Factory
  {
    const repo = createRepository();
    assert(repo !== null && typeof repo.getUserByEmail === 'function', 'Repository must implement IDatabaseRepository');
    console.log('  ✅ [PASS] Database Repository Factory Instantiation');
  }

  // Test 6: IANA Historical Timezone Resolution
  {
    const { resolveHistoricalTimezoneOffset } = await import('../../src/engine/temporalCorrection');
    
    // Vietnam: UTC+7 constant
    const vn = resolveHistoricalTimezoneOffset(1990, 5, 15, 10, 30, 'Asia/Ho_Chi_Minh');
    assert(vn !== null, 'Vietnam offset resolution must not be null');
    assert.strictEqual(vn.offsetHours, 7, 'Vietnam must resolve to UTC+7');

    // New York: Summer (EDT UTC-4) vs Winter (EST UTC-5)
    const nySummer = resolveHistoricalTimezoneOffset(1980, 7, 15, 10, 30, 'America/New_York');
    assert(nySummer !== null, 'NY Summer offset must resolve');
    assert.strictEqual(nySummer.offsetHours, -4, 'NY Summer must resolve to UTC-4 (EDT)');

    const nyWinter = resolveHistoricalTimezoneOffset(1980, 1, 15, 10, 30, 'America/New_York');
    assert(nyWinter !== null, 'NY Winter offset must resolve');
    assert.strictEqual(nyWinter.offsetHours, -5, 'NY Winter must resolve to UTC-5 (EST)');

    // London: Summer (BST UTC+1) vs Winter (GMT UTC+0)
    const lonSummer = resolveHistoricalTimezoneOffset(2020, 6, 15, 10, 30, 'Europe/London');
    assert(lonSummer !== null, 'London Summer offset must resolve');
    assert.strictEqual(lonSummer.offsetHours, 1, 'London Summer must resolve to UTC+1 (BST)');

    const lonWinter = resolveHistoricalTimezoneOffset(2020, 12, 15, 10, 30, 'Europe/London');
    assert(lonWinter !== null, 'London Winter offset must resolve');
    assert.strictEqual(lonWinter.offsetHours, 0, 'London Winter must resolve to UTC+0 (GMT)');

    console.log('  ✅ [PASS] IANA Historical Timezone Offset Resolution (DST & Winter/Summer)');
  }

  // Test 7: Rate Limiter Fail-Closed Policy on Disconnected Redis
  {
    const { RedisRateLimitStore } = await import('../../src/server/rateLimiter');
    const fakeRedisClient: any = {
      on: () => {},
      connect: async () => {},
      eval: async () => { throw new Error('Simulated Redis failure'); }
    };
    const redisStore = new RedisRateLimitStore(fakeRedisClient);
    
    // With RATE_LIMIT_FAIL_CLOSED=true, Redis failure throws instead of silent fallback
    process.env.RATE_LIMIT_FAIL_CLOSED = 'true';
    let failedClosed = false;
    try {
      await redisStore.increment('fail_test_key', 1000);
    } catch (e: any) {
      if (e.message.includes('fail-closed policy active')) {
        failedClosed = true;
      }
    } finally {
      delete process.env.RATE_LIMIT_FAIL_CLOSED;
    }
    assert.strictEqual(failedClosed, true, 'Redis failure under RATE_LIMIT_FAIL_CLOSED=true must fail closed');

    console.log('  ✅ [PASS] Rate Limiter Fail-Closed Policy Enforcement');
  }

  console.log('📊 [Audit Phase Result]: 7 PASSED, 0 FAILED.\n');
}

if (process.argv[1]?.includes('auditPhaseVerification.test.ts')) {
  runAuditPhaseVerificationTests().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
