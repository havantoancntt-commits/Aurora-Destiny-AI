// ==========================================
// AURORA DESTINY AI — ENTERPRISE TEST ORCHESTRATOR
// Master runner for Golden regression, Temporal edge cases,
// Timezone correction and Astrological calculation invariants.
// ==========================================

import { runCalculationRegressionTests } from './regression/calculationRegression.test';
import { runTemporalEdgeCaseTests } from './edge-cases/temporalEdgeCases.test';
import { runTimezoneCorrectionTests } from './timezone/timezoneCorrection.test';
import { runBaziZiweiIntegrityTests } from './calculation/baziZiweiIntegrity.test';

export function runMasterTestSuite() {
  console.log('====================================================');
  console.log('🛡️  AURORA DESTINY AI — ENTERPRISE VALIDATION SUITE');
  console.log('====================================================\n');

  const start = Date.now();
  let totalPassed = 0;
  let totalFailed = 0;
  const allErrors: string[] = [];

  const regressionRes = runCalculationRegressionTests();
  totalPassed += regressionRes.passed;
  totalFailed += regressionRes.failed;
  allErrors.push(...regressionRes.errors);

  const edgeCasesRes = runTemporalEdgeCaseTests();
  totalPassed += edgeCasesRes.passed;
  totalFailed += edgeCasesRes.failed;
  allErrors.push(...edgeCasesRes.errors);

  const timezoneRes = runTimezoneCorrectionTests();
  totalPassed += timezoneRes.passed;
  totalFailed += timezoneRes.failed;
  allErrors.push(...timezoneRes.errors);

  const integrityRes = runBaziZiweiIntegrityTests();
  totalPassed += integrityRes.passed;
  totalFailed += integrityRes.failed;
  allErrors.push(...integrityRes.errors);

  const elapsed = Date.now() - start;

  console.log('\n====================================================');
  console.log(`🏁 MASTER SUITE COMPLETE (${elapsed}ms)`);
  console.log(`   TOTAL TESTS PASSED: ${totalPassed}`);
  console.log(`   TOTAL TESTS FAILED: ${totalFailed}`);
  if (totalFailed > 0) {
    console.log('\n❌ FAILURES:');
    allErrors.forEach(e => console.log(`   - ${e}`));
  } else {
    console.log('   STATUS: ALL SYSTEMS COMPLIANT & DETERMINISTIC ✅');
  }
  console.log('====================================================\n');

  if (totalFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runMasterTestSuite();
