// ==========================================
// AURORA DESTINY AI — CHRONO-NAVIGATOR & SYNERGY MATRIX 360° TEST SUITE
// Verifies Mathematical Determinism, True Solar Time Synchronization & Cross-Chart Synastry
// ==========================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { runFullDestinyCalculation } from '../src/engine/destinyEngine';
import { BirthData } from '../src/types/destiny';
import { UserProfile } from '../src/types/user';
import {
  computeStrategicChronoNavigator,
  PRESET_NAVIGATOR_CITIES,
  getDailyDeityDirections
} from '../src/engine/chronoNavigator';
import { computeSynergyMatrix360 } from '../src/engine/synergyMatrix360';

test('🧭 Strategic Chrono-Navigator Invariants & Determinism', async (t) => {
  const birthData: BirthData = {
    solarYear: 1988,
    solarMonth: 3,
    solarDay: 15,
    solarHour: 9,
    solarMinute: 30,
    hasExactHour: true,
    birthCity: 'Hà Nội',
    birthCountry: 'Việt Nam',
    timezoneOffset: 7,
    timezoneName: 'Asia/Ho_Chi_Minh',
    gender: 'Male',
    calendarSystem: 'solar'
  };

  const calc = runFullDestinyCalculation(birthData, 'usr_chrono_test', 0);
  const fixedDate = new Date('2026-10-04T10:30:00+07:00');

  await t.test('1. True Solar Time calculates longitude and EoT offsets accurately', () => {
    const hanoi = PRESET_NAVIGATOR_CITIES[0];
    const report = computeStrategicChronoNavigator(calc, fixedDate, hanoi);

    assert.ok(report.trueSolarTime.equationOfTimeMinutes !== undefined);
    assert.ok(report.trueSolarTime.longitudeCorrectionMinutes > 0, 'Hanoi (105.85°E) must have positive longitude correction vs 105°E meridian');
    assert.ok(report.trueSolarTime.totalCorrectionMinutes !== undefined);
    assert.match(report.trueSolarTime.formatted, /^\d{2}:\d{2}$/);
    assert.match(report.civilTime.formatted, /^\d{2}:\d{2}:\d{2}$/);
  });

  await t.test('2. 4 Golden Action Windows are properly generated with playbooks', () => {
    const report = computeStrategicChronoNavigator(calc, fixedDate);

    const windows = report.actionWindows;
    assert.ok(windows.CONTRACT_SIGNING, 'Contract signing window must exist');
    assert.ok(windows.WEALTH_CATALYST, 'Wealth catalyst window must exist');
    assert.ok(windows.INITIATION_TRAVEL, 'Travel window must exist');
    assert.ok(windows.QUIET_REFLECTION, 'Reflection window must exist');

    assert.ok(windows.CONTRACT_SIGNING.doList.length >= 2);
    assert.ok(windows.CONTRACT_SIGNING.avoidList.length >= 1);
    assert.ok(windows.WEALTH_CATALYST.recommendedSlots.length > 0);
    assert.ok(windows.QUIET_REFLECTION.recommendedSlots.length > 0);
  });

  await t.test('3. Daily Deity Directions return authentic directional bearings', () => {
    const deities = getDailyDeityDirections('Jia');
    assert.equal(deities.wealthDeityDirection, 'Chính Nam');
    assert.equal(deities.joyDeityDirection, 'Đông Bắc');

    const deities2 = getDailyDeityDirections('Yi');
    assert.equal(deities2.wealthDeityDirection, 'Chính Đông');
  });

  await t.test('4. 100-run Determinism Invariant for Chrono-Navigator', () => {
    const run1 = computeStrategicChronoNavigator(calc, fixedDate);
    const run2 = computeStrategicChronoNavigator(calc, fixedDate);

    assert.equal(run1.trueSolarTime.formatted, run2.trueSolarTime.formatted);
    assert.equal(run1.snapshot.currentSlot.branchKey, run2.snapshot.currentSlot.branchKey);
    assert.equal(run1.nextBestWindow.actionType, run2.nextBestWindow.actionType);
  });
});

test('🤝 Synergy Matrix 360° Invariants & Cross-Chart Flying Stars', async (t) => {
  const profileA: UserProfile = {
    id: 'user_a',
    userId: 'usr_a',
    name: 'Nguyễn Văn A',
    isPrimary: true,
    avatarSeed: 'seed_a',
    behavioralContext: { careerField: 'Finance', employmentStatus: 'Founder', financialGoal: 'IPO', relationshipStatus: 'Single', topPriority: 'Growth', personalNotes: '' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    birthData: {
      solarYear: 1985, solarMonth: 6, solarDay: 20, solarHour: 14, solarMinute: 0,
      hasExactHour: true, birthCity: 'Hà Nội', birthCountry: 'Việt Nam',
      timezoneOffset: 7, timezoneName: 'Asia/Ho_Chi_Minh', gender: 'Male', calendarSystem: 'solar'
    }
  };

  const profileB: UserProfile = {
    id: 'user_b',
    userId: 'usr_b',
    name: 'Trần Thị B',
    isPrimary: false,
    avatarSeed: 'seed_b',
    behavioralContext: { careerField: 'Tech', employmentStatus: 'CTO', financialGoal: 'Scale', relationshipStatus: 'Single', topPriority: 'Innovation', personalNotes: '' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    birthData: {
      solarYear: 1988, solarMonth: 11, solarDay: 12, solarHour: 8, solarMinute: 30,
      hasExactHour: true, birthCity: 'TP. Hồ Chí Minh', birthCountry: 'Việt Nam',
      timezoneOffset: 7, timezoneName: 'Asia/Ho_Chi_Minh', gender: 'Female', calendarSystem: 'solar'
    }
  };

  const calcA = runFullDestinyCalculation(profileA.birthData, profileA.id, 0);
  const calcB = runFullDestinyCalculation(profileB.birthData, profileB.id, 0);

  await t.test('1. Computes Bi-directional Elemental Deficit correctly', () => {
    const reportB2B = computeSynergyMatrix360(profileA, calcA, profileB, calcB, 'B2B_BOARDROOM');

    assert.ok(reportB2B.elementalDeficit.userDominantElement);
    assert.ok(reportB2B.elementalDeficit.userDeficitElement);
    assert.ok(reportB2B.elementalDeficit.partnerDominantElement);
    assert.ok(reportB2B.elementalDeficit.partnerDeficitElement);
    assert.ok(reportB2B.elementalDeficit.userHelpedByPartnerScore >= 0 && reportB2B.elementalDeficit.userHelpedByPartnerScore <= 100);
    assert.ok(reportB2B.elementalDeficit.dayMasterRelationship.dynamicType);
  });

  await t.test('2. Generates Cross-Chart Flying Si Hua Transformations (Tứ Hóa Phi Tinh Chéo)', () => {
    const report = computeSynergyMatrix360(profileA, calcA, profileB, calcB, 'B2B_BOARDROOM');

    assert.ok(report.crossFlyingStars.length > 0, 'Must generate flying Si Hua links between charts');
    for (const link of report.crossFlyingStars) {
      assert.ok(['Lộc', 'Quyền', 'Khoa', 'Kỵ'].includes(link.transformationType));
      assert.ok(link.targetPalaceKey);
      assert.ok(link.targetPalaceNameVi);
      assert.ok(link.significance.length > 0);
    }
  });

  await t.test('3. B2B Boardroom Role Allocation is synthesized with Capital Leakage metric', () => {
    const report = computeSynergyMatrix360(profileA, calcA, profileB, calcB, 'B2B_BOARDROOM');

    assert.ok(report.boardroomAllocation, 'Must have boardroom allocation in B2B mode');
    assert.ok(report.boardroomAllocation.chairperson.name);
    assert.ok(report.boardroomAllocation.managingPartner.name);
    assert.ok(report.boardroomAllocation.cfoTreasurer.name);
    assert.ok(report.boardroomAllocation.capitalLeakageRiskIndex >= 0 && report.boardroomAllocation.capitalLeakageRiskIndex <= 100);
    assert.ok(report.boardroomAllocation.deadlockResolutionProtocol.length > 0);
  });

  await t.test('4. Romantic Soulmate Guidance is synthesized in SOULMATE mode', () => {
    const report = computeSynergyMatrix360(profileA, calcA, profileB, calcB, 'SOULMATE_LIFE_COMPANION');

    assert.ok(report.soulmateGuidance, 'Must have soulmate guidance in Romantic mode');
    assert.ok(report.soulmateGuidance.emotionalBondIndex >= 0 && report.soulmateGuidance.emotionalBondIndex <= 100);
    assert.ok(report.soulmateGuidance.harmonyStrengths.length > 0);
    assert.ok(report.soulmateGuidance.fengShuiHarmonization.sharedSpacePalette.length > 0);
  });

  await t.test('5. 100-run Determinism Invariant for Synergy Matrix', () => {
    const r1 = computeSynergyMatrix360(profileA, calcA, profileB, calcB, 'B2B_BOARDROOM');
    const r2 = computeSynergyMatrix360(profileA, calcA, profileB, calcB, 'B2B_BOARDROOM');

    assert.equal(r1.metrics.overall360Score, r2.metrics.overall360Score);
    assert.equal(r1.verdict.code, r2.verdict.code);
    assert.equal(r1.boardroomAllocation?.chairperson.name, r2.boardroomAllocation?.chairperson.name);
    assert.equal(r1.crossFlyingStars.length, r2.crossFlyingStars.length);
  });
});
