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
  gender: z.enum(['Male', 'Female', 'Other', 'PreferNotToSay']),
  calendarSystem: z.enum(['solar', 'lunar']),
  isLateRat: z.boolean().optional().default(false),
  timeConvention: z.enum(['civil', 'trueSolar']).optional().default('civil'),
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
  behavioralContext: BehavioralContextSchema.optional()
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
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').max(100),
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
  newPassword: z.string().min(6, 'Mật khẩu mới tối thiểu 6 ký tự').max(100)
});
