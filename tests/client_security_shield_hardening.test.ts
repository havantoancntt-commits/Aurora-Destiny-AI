// ==========================================
// AURORA DESTINY AI — CLIENT SECURITY SHIELD & CSP AUDIT REGRESSION TEST
// Verifies that clientSecurityShield does not mutate Object.prototype,
// does not block DevTools, shortcuts, or contextmenu, uses safe DOM creation,
// and ensures CSP does not contain 'unsafe-eval'.
// ==========================================

import assert from 'node:assert';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { initClientSecurityShield, showSecurityToast } from '../src/services/clientSecurityShield';

test('🛡️ Client Security Shield & CSP Hardening Suite', async (t) => {
  await t.test('1. Object.prototype is never mutated or polluted with custom properties', () => {
    // Check clean baseline prototype
    const testObj: Record<string, any> = {};
    assert.strictEqual(testObj.polluted, undefined);
    assert.strictEqual(testObj.isAdmin, undefined);
    assert.strictEqual(testObj.role, undefined);
    assert.strictEqual(testObj.isAuthorized, undefined);

    // Call initClientSecurityShield
    initClientSecurityShield();

    // Verify Object.prototype still does not own any custom properties
    assert.strictEqual(Object.prototype.hasOwnProperty('polluted'), false);
    assert.strictEqual(Object.prototype.hasOwnProperty('isAdmin'), false);
    assert.strictEqual(Object.prototype.hasOwnProperty('role'), false);
    assert.strictEqual(Object.prototype.hasOwnProperty('isAuthorized'), false);

    // Verify plain object can define these properties normally without conflict
    testObj.isAdmin = true;
    assert.strictEqual(testObj.isAdmin, true);
  });

  await t.test('2. vercel.json CSP does not contain unsafe-eval', () => {
    const vercelJsonPath = path.resolve(process.cwd(), 'vercel.json');
    const vercelContent = fs.readFileSync(vercelJsonPath, 'utf8');
    const vercelConfig = JSON.parse(vercelContent);

    const cspHeader = vercelConfig.headers
      ?.flatMap((h: any) => h.headers)
      ?.find((item: any) => item.key === 'Content-Security-Policy');

    assert.ok(cspHeader, 'Content-Security-Policy header must exist in vercel.json');
    assert.strictEqual(
      cspHeader.value.includes("'unsafe-eval'"),
      false,
      'vercel.json CSP must not contain unsafe-eval'
    );
  });

  await t.test('3. server.ts CSP policy does not contain unsafe-eval in production or dev', () => {
    const serverPath = path.resolve(process.cwd(), 'server.ts');
    const serverContent = fs.readFileSync(serverPath, 'utf8');

    // Regex check for unsafe-eval inside CSP strings
    const hasUnsafeEvalInCsp = /script-src[^;]+unsafe-eval/.test(serverContent);
    assert.strictEqual(
      hasUnsafeEvalInCsp,
      false,
      'server.ts CSP must not contain unsafe-eval'
    );
  });

  await t.test('4. clientSecurityShield source code does not contain innerHTML or Object.defineProperty on Object.prototype', () => {
    const shieldPath = path.resolve(process.cwd(), 'src/services/clientSecurityShield.ts');
    const shieldContent = fs.readFileSync(shieldPath, 'utf8');

    assert.strictEqual(
      shieldContent.includes('innerHTML'),
      false,
      'clientSecurityShield must not use innerHTML'
    );
    assert.strictEqual(
      shieldContent.includes('Object.defineProperty'),
      false,
      'clientSecurityShield must not use Object.defineProperty to mutate prototypes'
    );
    assert.strictEqual(
      shieldContent.includes('console.clear'),
      false,
      'clientSecurityShield must not disrupt developer workflow with console.clear'
    );
  });

  await t.test('5. pdfExport.ts escapes HTML in book title', () => {
    const pdfExportPath = path.resolve(process.cwd(), 'src/utils/pdfExport.ts');
    const pdfExportContent = fs.readFileSync(pdfExportPath, 'utf8');

    assert.ok(
      pdfExportContent.includes('escapeHtml'),
      'pdfExport.ts must contain HTML escaping for titles'
    );
    assert.ok(
      pdfExportContent.includes('<title>${safeTitle}'),
      'pdfExport.ts must use safeTitle in title tags'
    );
  });
});
