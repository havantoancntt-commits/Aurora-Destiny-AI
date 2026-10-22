// ==========================================
// RUNTIME SCHEMA VALIDATION (ZOD)
// Aurora Destiny AI — Production Hardening
// ==========================================

import { z } from 'zod';

// 1. Birth Data Schema
export const BirthDataSchema = z.object({
  solarYear: z.number().int().min(1900, 'Năm sinh từ 1900 đến 2100').max(2100, 'Năm sinh từ 1900 đến 2100'),
  solarMonth: z.number().int().min(1, 'Tháng sinh từ 1 đến 12').max(12, 'Tháng sinh từ 1 đến 12'),
  solarDay: z.number().int().min(1, 'Ngày sinh từ 1 đến 31').max(31, 'Ngày sinh từ 1 đến 31'),
  solarHour: z.number().int().min(0, 'Giờ sinh từ 0 đến 23').max(23, 'Giờ sinh từ 0 đến 23'),
  solarMinute: z.number().int().min(0, 'Phút sinh từ 0 đến 59').max(59, 'Phút sinh từ 0 đến 59'),
  hasExactHour: z.boolean(),
  lunarYear: z.number().int().optional(),
  lunarMonth: z.number().int().optional(),
  lunarDay: z.number().int().optional(),
  isLeapMonth: z.boolean().optional(),
  birthCity: z.string().trim().min(1, 'Thành phố nơi sinh không được để trống').max(100),
  birthCountry: z.string().trim().min(1, 'Quốc gia không được để trống').max(100),
  timezoneOffset: z.number().min(-12, 'Múi giờ hợp lệ từ -12 đến +14').max(14, 'Múi giờ hợp lệ từ -12 đến +14'),
  timezoneName: z.string().trim().min(1).max(100),
  gender: z.union([
    z.enum(['Male', 'Female', 'Other', 'PreferNotToSay']),
    z.enum(['male', 'female', 'other', 'prefer_not_to_say', 'preferNotToSay'])
  ]).transform(v => {
    const lower = v.toLowerCase();
    if (lower === 'male') return 'Male';
    if (lower === 'female') return 'Female';
    if (lower === 'other') return 'Other';
    return 'PreferNotToSay';
  }),
  calendarSystem: z.enum(['solar', 'lunar']),
  isLateRat: z.boolean().optional().default(false),
  timeConvention: z.enum(['civil', 'trueSolar', 'standard']).optional().default('civil').transform(v => v === 'standard' ? 'civil' : v),
  ziweiYearConvention: z.enum(['solarLapXuan', 'lunarNewYear']).optional().default('solarLapXuan'),
  ziweiLeapMonthConvention: z.enum(['midMonthSplit', 'keepMonth']).optional().default('midMonthSplit'),
  longitude: z.number().min(-180).max(180).optional(),
  latitude: z.number().min(-90).max(90).optional()
}).refine((data) => {
  // Validate real calendar days per month (including leap years)
  const daysInMonth = new Date(data.solarYear, data.solarMonth, 0).getDate();
  return data.solarDay <= daysInMonth;
}, {
  message: 'Ngày sinh không tồn tại trong tháng/năm đã chọn',
  path: ['solarDay']
}).refine((data) => {
  // Validate semantic consistency between timezoneName and timezoneOffset
  if (!data.timezoneName) return true;
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: data.timezoneName,
      timeZoneName: 'shortOffset'
    });
    const parts = formatter.formatToParts(new Date(Date.UTC(data.solarYear, (data.solarMonth || 1) - 1, data.solarDay || 1, 12, 0)));
    const offsetPart = parts.find(p => p.type === 'timeZoneName')?.value;
    if (offsetPart) {
      const match = offsetPart.match(/(?:GMT|UTC)([+-])(\d+)(?::(\d+))?/i);
      if (match) {
        const sign = match[1] === '-' ? -1 : 1;
        const hours = parseInt(match[2], 10);
        const mins = match[3] ? parseInt(match[3], 10) : 0;
        const expectedOffset = sign * (hours + mins / 60);
        if (Math.abs(data.timezoneOffset - expectedOffset) > 2) {
          return false;
        }
      }
    }
  } catch {
    // Non-IANA string or legacy label passes
  }
  return true;
}, {
  message: 'Mâu thuẫn ngữ nghĩa giữa tên múi giờ (timezoneName) và độ lệch thời gian (timezoneOffset)',
  path: ['timezoneOffset']
});

// 2. Behavioral Context Schema
export const BehavioralContextSchema = z.object({
  careerField: z.string().max(200).default(''),
  employmentStatus: z.string().max(100).default(''),
  financialGoal: z.string().max(200).default(''),
  relationshipStatus: z.string().max(100).default(''),
  topPriority: z.string().max(200).default(''),
  personalNotes: z.string().max(1000).default('')
});

// 3. User Profile Creation Schema
export const ProfileCreateSchema = z.object({
  name: z.string().trim().min(1, 'Tên hồ sơ không được để trống').max(100, 'Tên hồ sơ tối đa 100 ký tự'),
  isPrimary: z.boolean().optional().default(false),
  birthData: BirthDataSchema,
  behavioralContext: BehavioralContextSchema.optional(),
  idempotencyKey: z.string().max(128).optional(),
  clientProfileId: z.string().max(128).optional()
});

// 4. User Profile Update Schema
export const ProfileUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  isPrimary: z.boolean().optional(),
  birthData: BirthDataSchema.optional(),
  behavioralContext: BehavioralContextSchema.optional()
});

// 5. Historical Event Schema for Retrospective Analysis
export const HistoricalEventSchema = z.object({
  profileId: z.string().min(1, 'Mã hồ sơ không được để trống'),
  year: z.number().int().min(1920, 'Năm sự kiện từ 1920 đến năm hiện tại').max(new Date().getFullYear(), 'Sự kiện quá khứ không được vượt quá năm hiện tại'),
  month: z.number().int().min(1).max(12).optional(),
  title: z.string().trim().min(2, 'Tiêu đề sự kiện tối thiểu 2 ký tự').max(200, 'Tiêu đề tối đa 200 ký tự'),
  category: z.enum([
    'Career',
    'Finance',
    'Relationship',
    'Relocation',
    'Health',
    'Education',
    'Crisis',
    'MajorBreakthrough',
    'PersonalDevelopment'
  ]),
  impact: z.enum([
    'Breakthrough',
    'Positive',
    'Neutral',
    'Negative',
    'Very Negative'
  ]),
  intensity: z.number().int().min(1).max(5),
  description: z.string().max(1000).optional().default(''),
  userConfidence: z.number().int().min(1).max(5).default(5),
  evidenceNote: z.string().max(500).optional().default('')
});

// 6. AI Chat Schema
export const AiChatSchema = z.object({
  profileId: z.string().min(1, 'Mã hồ sơ bắt buộc'),
  message: z.string().trim().min(1, 'Nội dung tin nhắn không được để trống').max(1500, 'Tin nhắn tối đa 1500 ký tự'),
  analysisYear: z.number().int().min(1900, 'Năm phân tích từ 1900 đến 2100').max(2100, 'Năm phân tích từ 1900 đến 2100').optional()
});

// 7. What-If Scenario Evaluation Schema
export const ScenarioEvaluateSchema = z.object({
  profileId: z.string().min(1, 'Mã hồ sơ bắt buộc'),
  question: z.string().trim().min(3, 'Câu hỏi tối thiểu 3 ký tự').max(500, 'Câu hỏi tối đa 500 ký tự'),
  analysisYear: z.number().int().min(1900, 'Năm phân tích từ 1900 đến 2100').max(2100, 'Năm phân tích từ 1900 đến 2100').optional()
});

// 8. User Preferences Schema
export const UserPreferencesSchema = z.object({
  theme: z.enum(['dark', 'light', 'aurora']).optional(),
  language: z.string().max(10).optional(),
  timezone: z.string().max(50).optional(),
  enableNotifications: z.boolean().optional(),
  enableAILearning: z.boolean().optional(),
  anonymizeData: z.boolean().optional(),
  scientificConfidenceMode: z.boolean().optional(),
  highContrast: z.boolean().optional()
});

// 9. Feature Flag Toggle Schema (Admin Only)
export const FeatureFlagToggleSchema = z.object({
  key: z.string().min(1),
  enabled: z.boolean()
});

// 10. Auth Schemas
export const RegisterSchema = z.object({
  email: z.string().email('Email không hợp lệ').max(100),
  password: z.string().min(12, 'Mật khẩu tối thiểu 12 ký tự để đảm bảo an toàn').max(100),
  fullName: z.string().trim().min(1, 'Họ tên không được để trống').max(100)
});

export const LoginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu')
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ').max(100)
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(10, 'Mã khôi phục không hợp lệ').max(128),
  newPassword: z.string().min(12, 'Mật khẩu mới tối thiểu 12 ký tự để đảm bảo an toàn').max(100)
});

// 11. Patron & Payment Integrity Schemas
export const PatronCreateSchema = z.object({
  name: z.string().trim().min(1, 'Tên hoặc pháp danh không được để trống').max(80),
  tier: z.enum(['dong', 'bac', 'vang', 'kim_cuong', 'tam_tinh']).default('tam_tinh'),
  amount: z.number().int().min(10000, 'Số tiền tối thiểu 10,000 VNĐ').max(100000000).optional(),
  message: z.string().trim().max(300).optional(),
  note: z.string().trim().max(300).optional(),
  location: z.string().trim().max(100).optional(),
  isAnonymous: z.boolean().optional().default(false)
});

export const PaymentWebhookSchema = z.object({
  idempotencyKey: z.string().trim().min(8).max(128),
  provider: z.enum(['VIETQR', 'VIETQR_VCB', 'MOMO', 'ZALOPAY', 'BANK_TRANSFER']),
  patronId: z.string().trim().min(5).max(64),
  paymentReference: z.string().trim().min(3).max(128),
  amount: z.number().positive('Số tiền thanh toán phải lớn hơn 0'),
  timestamp: z.number().int().positive('Thời gian giao dịch không hợp lệ')
});

