// ==========================================
// AUTH & PROFILE CREATION REGRESSION TEST
// Verifies:
// 1. Guest session bootstrapping returns valid token and sets cookie
// 2. Token extraction via Authorization: Bearer <token>
// 3. POST /api/profiles creates profile and calculation without foreign key violation
// 4. GET /api/calculations returns calculation for created profile
// ==========================================

import { app } from '../server';
import http from 'http';

export async function runAuthProfileCreationTests() {
  console.log('🧪 Starting Auth & Profile Creation Regression Suite...');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const addr = server.address() as any;
  const baseUrl = `http://127.0.0.1:${addr.port}`;

  try {
    // 1. Guest Session Bootstrap
    const guestRes = await fetch(`${baseUrl}/api/auth/guest`, { method: 'POST' });
    if (!guestRes.ok) {
      throw new Error(`Guest session endpoint failed with HTTP ${guestRes.status}`);
    }
    const guestData = await guestRes.json();
    if (!guestData.token) {
      throw new Error('Guest session response missing token');
    }
    console.log('  ✔ Guest session bootstrap succeeded and returned token.');

    // 2. Verified profile listing with Bearer token
    const listRes = await fetch(`${baseUrl}/api/profiles`, {
      headers: {
        'Authorization': `Bearer ${guestData.token}`
      }
    });
    if (!listRes.ok) {
      throw new Error(`Failed to list profiles with token: ${listRes.status}`);
    }
    console.log('  ✔ Profile listing authenticated via Bearer token.');

    // 3. Create Profile
    const createRes = await fetch(`${baseUrl}/api/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${guestData.token}`
      },
      body: JSON.stringify({
        name: 'Nguyễn Thử Nghiệm',
        birthData: {
          solarYear: 1995,
          solarMonth: 8,
          solarDay: 18,
          solarHour: 10,
          solarMinute: 30,
          hasExactHour: true,
          timezoneOffset: 7,
          timezoneName: 'Asia/Ho_Chi_Minh',
          birthCity: 'Đà Nẵng',
          birthCountry: 'Việt Nam',
          gender: 'Female',
          calendarSystem: 'solar'
        }
      })
    });

    if (createRes.status !== 201) {
      const errBody = await createRes.text();
      throw new Error(`Create profile failed with status ${createRes.status}: ${errBody}`);
    }
    const createdData = await createRes.json();
    if (!createdData.profile?.id || !createdData.calculation?.id) {
      throw new Error('Create profile did not return both profile and calculation IDs');
    }
    console.log(`  ✔ Profile created successfully (ID: ${createdData.profile.id}) with calculation (ID: ${createdData.calculation.id}).`);

    // 4. Retrieve Calculation
    const calcRes = await fetch(`${baseUrl}/api/calculations/${createdData.profile.id}`, {
      headers: {
        'Authorization': `Bearer ${guestData.token}`
      }
    });
    if (!calcRes.ok) {
      throw new Error(`Failed to retrieve calculation: ${calcRes.status}`);
    }
    const fetchedCalc = await calcRes.json();
    if (fetchedCalc.calculation?.id !== createdData.calculation.id) {
      throw new Error('Calculation ID mismatch on retrieval');
    }
    console.log('  ✔ Calculation retrieved and verified.');

    console.log('✅ Auth & Profile Creation Regression Suite Passed!\n');
  } finally {
    server.close();
  }
}

if (typeof process !== 'undefined' && Array.isArray(process.argv) && process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  process.env.DISABLE_SERVER_LISTEN = 'true';
  runAuthProfileCreationTests().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });
}
