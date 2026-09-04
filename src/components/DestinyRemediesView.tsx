// ==========================================
// DESTINY REMEDIES & FENG SHUI OPTIMIZATION VIEW
// Actionable Dụng Thần, Chromatics, Spatial & Organ Wellness
// ==========================================

import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Compass,
  Palette,
  Compass as CompassIcon,
  HeartPulse,
  Briefcase,
  Gem,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  CalculationResult,
  LanguageCode
} from '../types/destiny';
import { UserProfile } from '../types/user';
import { generateDestinyRemedies, DestinyRemediesData } from '../engine/remedies';
import { ELEMENT_RELATIONS } from '../engine/canchi';

interface Props {
  profile: UserProfile;
  calculation: CalculationResult;
  language: LanguageCode;
}

export const DestinyRemediesView: React.FC<Props> = ({
  profile,
  calculation,
  language
}) => {
  const remedies: DestinyRemediesData = useMemo(() => {
    return generateDestinyRemedies(profile, calculation);
  }, [profile, calculation]);

  const [activeRemedyTab, setActiveRemedyTab] = useState<'colors' | 'spatial' | 'career' | 'organ' | 'items'>('colors');

  const favInfo = ELEMENT_RELATIONS[remedies.primaryFavorable];
  const unfavInfo = ELEMENT_RELATIONS[remedies.unfavorableElement];

  return (
    <div className="space-y-6 pb-24 text-slate-200">
      {/* 1. Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1622] via-[#09101b] to-[#050911] p-6 border border-teal-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dụng Thần Cải Vận & Khoa Học Không Gian</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-white flex items-center gap-2">
              Cải Mệnh & Phong Thủy Toàn Diện
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              "Tri mệnh để thuận mệnh, cải mệnh bằng hành động thực tế". Hệ thống trích xuất chính xác Dụng Thần & Hỷ Thần từ Bát Tự để đề xuất giải pháp màu sắc, phương hướng, ngành nghề, dưỡng sinh và tâm thức giúp bạn làm chủ vận khí.
            </p>
          </div>

          {/* Quick Core Badge */}
          <div className="bg-black/50 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-serif text-xl font-bold text-white shadow-lg"
              style={{ backgroundColor: favInfo.color }}
            >
              {favInfo.vi}
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Dụng Thần Trọng Tâm</span>
              <span className="text-sm font-bold text-white">Hành {favInfo.vi}</span>
              <span className="text-[11px] text-teal-300 block">Kích hoạt tài vận & bình an</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Core Dụng Thần Insight Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-[#0b0f1e]/90 border border-teal-500/20 p-4 shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>1. Dụng Thần Bát Tự</span>
          </div>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            Hành {favInfo.vi}
            {remedies.secondaryFavorable && (
              <span className="text-xs font-normal text-slate-400">
                (Hỷ Thần: {ELEMENT_RELATIONS[remedies.secondaryFavorable].vi})
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {remedies.whyThisRemedy}
          </p>
        </div>

        <div className="rounded-2xl bg-[#0b0f1e]/90 border border-rose-500/20 p-4 shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400 uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>2. Kỵ Thần Cần Tiết Chế</span>
          </div>
          <div className="text-lg font-bold text-white">
            Hành {unfavInfo.vi}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Hành này đang quá vượng hoặc gây khắc chế trực tiếp lên Nhật Chủ. Nên hạn chế lạm dụng đồ vật hoặc màu sắc thuộc hành {unfavInfo.vi} trong các sự kiện mang tính bước ngoặt.
          </p>
        </div>

        <div className="rounded-2xl bg-[#0b0f1e]/90 border border-amber-500/20 p-4 shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>3. Con Số Cát Tường (Hà Đồ)</span>
          </div>
          <div className="flex items-center gap-2">
            {remedies.luckyNumbers.map((num, i) => (
              <span
                key={i}
                className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-sm flex items-center justify-center shadow-inner"
              >
                {num}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Số may mắn tương hợp Dụng Thần; ứng dụng thuận lợi trong số đuôi điện thoại, mật mã tài khoản hoặc chọn tầng nhà.
          </p>
        </div>
      </div>

      {/* 3. Interactive Category Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/10">
        {[
          { key: 'colors', label: 'Màu Sắc Cát Tường', icon: Palette },
          { key: 'spatial', label: 'Phương Vị Bát Trạch', icon: CompassIcon },
          { key: 'career', label: 'Ngành Nghề Vượng Vận', icon: Briefcase },
          { key: 'organ', label: 'Dưỡng Sinh Ngũ Tạng', icon: HeartPulse },
          { key: 'items', label: 'Vật Phẩm Phong Thủy', icon: Gem },
        ].map(({ key, label, icon: Icon }) => {
          const isActive = activeRemedyTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveRemedyTab(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-teal-500/20 to-emerald-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Tab Content Panels */}
      <div>
        {/* TAB 1: COLORS */}
        {activeRemedyTab === 'colors' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider">
                Bảng Phối Màu Kích Hoạt Sinh Khí
              </h3>
              <span className="text-xs text-slate-400">Trang phục, Phụ kiện & Không gian</span>
            </div>

            {/* Favorable Colors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {remedies.recommendedColors.map((col, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#0b0e1b]/90 border border-white/10 p-4 shadow-lg space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl border border-white/20 shadow-md shrink-0"
                      style={{ backgroundColor: col.hex }}
                    />
                    <div>
                      <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider block">
                        {col.category}
                      </span>
                      <h4 className="text-sm font-bold text-white">{col.nameVi}</h4>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {col.usage}
                  </p>
                </div>
              ))}
            </div>

            {/* Avoid Colors Warning */}
            <div className="rounded-2xl bg-rose-950/20 border border-rose-500/30 p-4 space-y-2">
              <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>Màu Sắc Cần Hạn Chế (Khắc Chế Bản Mệnh)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {remedies.avoidColors.map((avoid, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-black/40 p-3 rounded-xl border border-rose-500/10">
                    <div
                      className="w-6 h-6 rounded-lg border border-white/20 shrink-0 mt-0.5"
                      style={{ backgroundColor: avoid.hex }}
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{avoid.nameVi}</div>
                      <div className="text-[11px] text-slate-400">{avoid.usage}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SPATIAL ORIENTATIONS */}
        {activeRemedyTab === 'spatial' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider">
                Bố Cục Phương Vị Vượng Khí & Bát Trạch
              </h3>
              <span className="text-xs text-slate-400">Gia tăng sinh khí bàn làm việc & phòng ngủ</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {remedies.spatialDirections.map((dir, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#0b0e1b]/90 border border-white/10 p-5 shadow-lg space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider">
                        {dir.title}
                      </span>
                      <Compass className="w-4 h-4 text-teal-400" />
                    </div>
                    <div className="text-lg font-serif font-bold text-white">
                      {dir.direction}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {dir.significance}
                    </p>
                  </div>

                  <div className="bg-black/40 rounded-xl p-3 border border-white/5 text-xs text-teal-200/90 flex items-start gap-2 mt-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Hành động thực tế:</strong> {dir.practicalAction}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CAREER SECTORS */}
        {activeRemedyTab === 'career' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider">
                Định Hướng Lĩnh Vực & Ngành Nghề Tương Phù
              </h3>
              <span className="text-xs text-slate-400">Thuận theo thế mạnh thiên bẩm</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {remedies.careerSectors.map((sector, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#0b0e1b]/90 border border-white/10 p-5 shadow-lg space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-teal-300">Nhóm {idx + 1}</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-500" />
                  </div>
                  <h4 className="text-sm font-bold text-white">{sector.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {sector.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ORGAN WELLNESS */}
        {activeRemedyTab === 'organ' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#0b0e1b]/90 border border-white/10 p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest block">
                    Đông Y Dưỡng Sinh Ngũ Tạng
                  </span>
                  <h3 className="text-lg font-serif font-bold text-white">
                    {remedies.organCare.organ}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs bg-teal-500/10 border border-teal-500/30 px-3 py-1.5 rounded-xl text-teal-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{remedies.organCare.goldenHour}</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                <strong className="text-amber-300">Đặc điểm lưu tâm:</strong> {remedies.organCare.sensitivities}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 bg-black/30 p-4 rounded-xl border border-white/5">
                  <h4 className="text-xs font-semibold text-teal-300 uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Thực Phẩm Nuôi Dưỡng Tạng Phủ
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {remedies.organCare.dietaryTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-teal-400">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 bg-black/30 p-4 rounded-xl border border-white/5">
                  <h4 className="text-xs font-semibold text-indigo-300 uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5" />
                    Thói Quen Sinh Hoạt Vàng
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {remedies.organCare.wellnessHabits.map((habit, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-400">•</span>
                        <span>{habit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: FENG SHUI ITEMS */}
        {activeRemedyTab === 'items' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider">
                Vật Phẩm Phong Thủy & Chất Liệu Trợ Mệnh
              </h3>
              <span className="text-xs text-slate-400">Cân bằng trường năng lượng tự nhiên</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {remedies.fengShuiMaterials.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#0b0e1b]/90 border border-white/10 p-5 shadow-lg space-y-2"
                >
                  <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold">
                    <Gem className="w-4 h-4" />
                    <span>Vật phẩm cát tường 0{idx + 1}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{item.material}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.role}
                  </p>
                  <div className="text-[11px] text-slate-400 bg-black/40 p-2.5 rounded-xl border border-white/5">
                    <strong className="text-slate-200">Vị trí đặt tối ưu:</strong> {item.placement}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Philosophical Mindset & Spiritual Empowerment */}
      <div className="rounded-2xl bg-gradient-to-br from-[#121626] via-[#0b0e1b] to-[#070912] border border-white/10 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <h3 className="text-base font-serif font-bold text-white">
            Tâm Thức & Đạo Lý Cải Biến Vận Mệnh (Đức Năng Thắng Số)
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Cổ nhân dạy: "Nhất Mệnh, Nhì Vận, Tam Phong Thủy, Tứ Tích Âm Đức, Ngũ Độc Thư". Phong thủy chỉ là chiếc thuyền hỗ trợ, chính tâm đức và trí tuệ của bạn mới là người cầm lái chuyển hóa mọi giông bão thành cơ hội.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {remedies.spiritualVirtues.map((virtue, idx) => (
            <div key={idx} className="bg-black/40 p-3.5 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed space-y-1">
              <span className="text-amber-400 font-bold block font-mono">Nguyên tắc 0{idx + 1}</span>
              <span>{virtue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
