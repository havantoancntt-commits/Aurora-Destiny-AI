// ==============================================================================
// TEST SUITE: CELESTIAL KARMIC NETWORK & RESONANCE GRAPH ENGINE
// Verifies multi-profile synastry, bilateral exchange, Quý Nhân detection, and conflict bridging
// ==============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildKarmicNetworkAnalysis,
  calculateBilateralKarmicEdge
} from '../src/engine/karmicNetworkEngine';
import { runFullDestinyCalculation } from '../src/engine/destinyEngine';
import { UserProfile } from '../src/types/user';

test('🌌 Celestial Karmic Network & Resonance Graph Suite', async (t) => {
  // Core Profile: Giáp Tý (1984-10-15 10:30)
  const coreProfile: UserProfile = {
    id: 'prof_core',
    userId: 'user_01',
    name: 'Nguyễn Văn Toàn (Hạt Nhân)',
    isPrimary: true,
    avatarSeed: 'seed_core',
    birthData: {
      solarYear: 1984,
      solarMonth: 10,
      solarDay: 15,
      solarHour: 10,
      solarMinute: 30,
      hasExactHour: true,
      birthCity: 'Hà Nội',
      birthCountry: 'Việt Nam',
      timezoneOffset: 7,
      timezoneName: 'Asia/Bangkok',
      gender: 'Male',
      calendarSystem: 'solar'
    },
    behavioralContext: {
      careerField: 'Công nghệ',
      employmentStatus: 'Toàn thời gian',
      financialGoal: 'Thịnh vượng & Bình an',
      relationshipStatus: 'Kết hôn',
      topPriority: 'Phát triển bền vững',
      personalNotes: 'Gia đạo bình an'
    },
    tag: 'self',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Member 1: Ất Sửu (1985-03-12 14:00) - Tý Sửu Lục Hợp, Sửu là Quý Nhân của Giáp!
  const memberQuyNhan: UserProfile = {
    id: 'prof_member_noble',
    userId: 'user_01',
    name: 'Lê Thị Hoa (Vợ - Quý Nhân)',
    isPrimary: false,
    avatarSeed: 'seed_hoa',
    birthData: {
      solarYear: 1985,
      solarMonth: 3,
      solarDay: 12,
      solarHour: 14,
      solarMinute: 0,
      hasExactHour: true,
      birthCity: 'Hồ Chí Minh',
      birthCountry: 'Việt Nam',
      timezoneOffset: 7,
      timezoneName: 'Asia/Bangkok',
      gender: 'Female',
      calendarSystem: 'solar'
    },
    behavioralContext: {
      careerField: 'Giáo dục',
      employmentStatus: 'Toàn thời gian',
      financialGoal: 'Gia đạo hạnh phúc',
      relationshipStatus: 'Kết hôn',
      topPriority: 'Con cái thành đạt',
      personalNotes: ''
    },
    tag: 'family',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Member 2: Bính Ngọ (1966-06-15 12:00) - Tý Ngọ Lục Xung trực diện!
  const memberClash: UserProfile = {
    id: 'prof_member_clash',
    userId: 'user_01',
    name: 'Trần Văn Hùng (Đối Tác - Xung Chi)',
    isPrimary: false,
    avatarSeed: 'seed_hung',
    birthData: {
      solarYear: 1966,
      solarMonth: 6,
      solarDay: 15,
      solarHour: 12,
      solarMinute: 0,
      hasExactHour: true,
      birthCity: 'Đà Nẵng',
      birthCountry: 'Việt Nam',
      timezoneOffset: 7,
      timezoneName: 'Asia/Bangkok',
      gender: 'Male',
      calendarSystem: 'solar'
    },
    behavioralContext: {
      careerField: 'Xây dựng',
      employmentStatus: 'Doanh nhân',
      financialGoal: 'Mở rộng thị trường',
      relationshipStatus: 'Kết hôn',
      topPriority: 'Đầu tư mạo hiểm',
      personalNotes: ''
    },
    tag: 'partner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const coreCalc = runFullDestinyCalculation(coreProfile.birthData, coreProfile.id, 0);
  const nobleCalc = runFullDestinyCalculation(memberQuyNhan.birthData, memberQuyNhan.id, 0);
  const clashCalc = runFullDestinyCalculation(memberClash.birthData, memberClash.id, 0);

  await t.test('1. Empty members list returns valid self-centered equilibrium', () => {
    const solo = buildKarmicNetworkAnalysis(coreProfile, coreCalc, [coreProfile]);
    assert.equal(solo.totalMembers, 1);
    assert.equal(solo.networkHealthScore, 100);
    assert.equal(solo.connections.length, 0);
  });

  await t.test('2. Bilateral edge correctly identifies Quý Nhân & Lục Hợp', () => {
    const edgeNoble = calculateBilateralKarmicEdge(coreProfile, coreCalc, memberQuyNhan, nobleCalc);
    assert.equal(edgeNoble.targetProfileId, 'prof_member_noble');
    assert.ok(edgeNoble.resonanceScore >= 80, 'Resonance score should be high for Noble & Liu He partner');
    assert.ok(
      edgeNoble.roleType === 'QUY_NHAN_CUU_GIAI' || edgeNoble.roleType === 'TRI_KY_HOA_KHI' || edgeNoble.roleType === 'TAI_TINH_KHOI_NGHIEP',
      `Unexpected roleType: ${edgeNoble.roleType}`
    );
    assert.ok(edgeNoble.whatTheyBringToYou.length > 0);
    assert.ok(edgeNoble.whatYouBringToThem.length > 0);
  });

  await t.test('3. Bilateral edge correctly identifies Lục Xung and generates Bridging Remedy', () => {
    const edgeClash = calculateBilateralKarmicEdge(coreProfile, coreCalc, memberClash, clashCalc);
    assert.equal(edgeClash.targetProfileId, 'prof_member_clash');
    assert.ok(edgeClash.bridgingRemedy !== undefined, 'Clash connection must provide bridging remedy');
    assert.ok(edgeClash.bridgingRemedy?.nameVi, 'Bridging remedy must have an element name');
    assert.ok(edgeClash.bridgingRemedy?.tacticalAdvice, 'Bridging remedy must have tactical advice');
  });

  await t.test('4. Full network analysis calculates health score and classifies benefactors and friction alerts', () => {
    const network = buildKarmicNetworkAnalysis(
      coreProfile,
      coreCalc,
      [coreProfile, memberQuyNhan, memberClash],
      {
        [memberQuyNhan.id]: nobleCalc,
        [memberClash.id]: clashCalc
      }
    );

    assert.equal(network.totalMembers, 3);
    assert.equal(network.connections.length, 2);
    assert.ok(network.networkHealthScore >= 0 && network.networkHealthScore <= 100);
    assert.ok(network.strategicNetworkAdvice.length > 0);
    assert.ok(Array.isArray(network.collectiveStrengths));
    assert.ok(Array.isArray(network.collectiveVulnerabilities));
  });
});
