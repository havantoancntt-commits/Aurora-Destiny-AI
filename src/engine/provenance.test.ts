// ==========================================
// CALCULATION PROVENANCE & AUDITABILITY TEST SUITE
// Verifies deterministic cryptographic trace, engine versions & zero secret leakage
// ==========================================

import { runFullDestinyCalculation } from './destinyEngine';
import { CURRENT_ENGINE_VERSIONS } from './provenance';
import { BirthData } from '../types/destiny';

export function runProvenanceTests() {
  console.log('📜 Running Calculation Provenance & Versioning Tests...');

  const sampleBirth: BirthData = {
    solarYear: 1995,
    solarMonth: 8,
    solarDay: 18,
    solarHour: 10,
    solarMinute: 30,
    hasExactHour: true,
    timezoneOffset: 7,
    timezoneName: 'Asia/Ho_Chi_Minh',
    birthCity: 'Da Nang',
    birthCountry: 'Vietnam',
    gender: 'Female',
    calendarSystem: 'solar'
  };

  const calcResult1 = runFullDestinyCalculation(sampleBirth, 'prof_test_prov_1');
  const calcResult2 = runFullDestinyCalculation(sampleBirth, 'prof_test_prov_2');

  const prov1 = calcResult1.provenance;
  const prov2 = calcResult2.provenance;

  if (!prov1 || !prov2) {
    throw new Error('Expected calculation result to include provenance metadata');
  }

  // 1. Check required provenance fields
  const requiredFields = [
    'inputHash', 'engineVersion', 'engineVersions', 'calculationVersion',
    'calendarConvention', 'ziweiConvention', 'solarTermConvention',
    'leapMonthConvention', 'timezone', 'timezoneName', 'calculatedAt', 'resultHash'
  ];
  for (const f of requiredFields) {
    if ((prov1 as any)[f] === undefined) {
      throw new Error(`Provenance record missing required field: ${f}`);
    }
  }
  console.log('  ✔ All required provenance audit fields exist.');

  // 2. Deterministic Hash Repeatability
  if (prov1.inputHash !== prov2.inputHash) {
    throw new Error(`Input hash mismatch for identical birth data: ${prov1.inputHash} !== ${prov2.inputHash}`);
  }
  if (prov1.resultHash !== prov2.resultHash) {
    throw new Error(`Result hash mismatch for identical calculations: ${prov1.resultHash} !== ${prov2.resultHash}`);
  }
  console.log(`  ✔ Deterministic inputHash (${prov1.inputHash.slice(0, 12)}...) & resultHash (${prov1.resultHash.slice(0, 12)}...) verified.`);

  // 3. Engine Versioning Integrity
  if (prov1.engineVersions.baziEngineVersion !== CURRENT_ENGINE_VERSIONS.baziEngineVersion) {
    throw new Error('Bazi engine version in provenance does not match current version');
  }
  if (prov1.engineVersions.ziweiEngineVersion !== CURRENT_ENGINE_VERSIONS.ziweiEngineVersion) {
    throw new Error('Ziwei engine version in provenance does not match current version');
  }
  console.log(`  ✔ Granular Engine Versions verified (Bazi: ${prov1.engineVersions.baziEngineVersion}, Ziwei: ${prov1.engineVersions.ziweiEngineVersion}, Temporal: ${prov1.engineVersions.temporalEngineVersion}).`);

  // 4. Zero Secrets Leakage Check
  const serialized = JSON.stringify(prov1);
  const forbiddenKeywords = ['secret', 'password', 'token', 'apiKey', 'gemini_api_key', 'bearer'];
  for (const kw of forbiddenKeywords) {
    if (serialized.toLowerCase().includes(kw)) {
      throw new Error(`Security breach: provenance metadata contains sensitive keyword "${kw}"`);
    }
  }
  console.log('  ✔ Provenance verified clean: Zero secrets, tokens, or credentials leaked.');

  console.log('✅ All Calculation Provenance Tests Passed!\n');
}

if (typeof process !== 'undefined' && Array.isArray(process.argv) && process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  runProvenanceTests();
}
