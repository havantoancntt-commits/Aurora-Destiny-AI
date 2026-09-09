// ==========================================
// AURORA DESTINY AI — DEVELOPMENT SEED SCRIPT
// Explicitly run via: npm run seed:dev
// Strictly prohibited in production environments
// ==========================================

import { repository } from '../src/db/repository';
import { hashPassword } from '../src/server/auth';
import crypto from 'crypto';

export async function runDevSeed() {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Refusing to run dev seed in production environment!');
    process.exit(1);
  }

  console.log('🌱 [Seed] Seeding development environment with sample profile...');

  const devEmail = 'dev@aurora.local';
  const existing = repository.getUserByEmail(devEmail);
  if (existing) {
    console.log('ℹ️ [Seed] Dev user already exists.');
    return;
  }

  const { hash, salt } = hashPassword('DevPassword123!');
  const userId = `usr_dev_${crypto.randomBytes(4).toString('hex')}`;
  const devUser = repository.saveUser({
    id: userId,
    email: devEmail,
    fullName: 'Nhà Phát Triển Thử Nghiệm',
    role: 'USER',
    subscriptionTier: 'Pro',
    language: 'vi',
    emailVerified: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    profilesCount: 1
  }, `${salt}:${hash}`);

  // Seed primary test profile
  repository.saveProfile({
    id: `prof_dev_${crypto.randomBytes(4).toString('hex')}`,
    userId: devUser.id,
    name: 'Mẫu Thử Nghiệm Bát Tự',
    isPrimary: true,
    avatarSeed: 'seed_aurora_dev',
    birthData: {
      solarYear: 1995,
      solarMonth: 8,
      solarDay: 18,
      solarHour: 12,
      solarMinute: 30,
      hasExactHour: true,
      birthCity: 'Hà Nội',
      birthCountry: 'Việt Nam',
      timezoneOffset: 7,
      timezoneName: 'Asia/Bangkok (UTC+7)',
      gender: 'Male',
      calendarSystem: 'solar'
    },
    behavioralContext: {
      careerField: 'Công nghệ thông tin',
      employmentStatus: 'Kỹ sư phần mềm',
      financialGoal: 'Tự do tài chính',
      relationshipStatus: 'Độc thân',
      topPriority: 'Phát triển sự nghiệp',
      personalNotes: 'Hồ sơ seed thử nghiệm cục bộ.'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  console.log(`✅ [Seed] Created dev user: ${devUser.email} with primary profile`);
}

if (process.argv[1] && process.argv[1].endsWith('seedDev.ts')) {
  runDevSeed().catch(console.error);
}
