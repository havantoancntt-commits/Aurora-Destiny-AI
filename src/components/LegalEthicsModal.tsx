// ==========================================================
// AURORA DESTINY AI — LEGAL & ETHICS COMPLIANCE MODAL
// Bản Tuyên Bố Pháp Lý, Quy Chuẩn Đạo Đức & Cam Kết Tuân Thủ Pháp Luật Việt Nam
// Tuân thủ triệt để: Bộ luật Dân sự 2015, Luật An ninh mạng,
// Nghị định 72/2013/NĐ-CP, Nghị định 147/2024/NĐ-CP & Nghị định 13/2023/NĐ-CP
// ==========================================================

import React from 'react';
import {
  ShieldCheck,
  Scale,
  BookOpen,
  Lock,
  AlertTriangle,
  HeartHandshake,
  CheckCircle2,
  X,
  GraduationCap
} from 'lucide-react';
import { LanguageCode } from '../types/destiny';

interface Props {
  isOpen: boolean;
  language?: LanguageCode;
  onClose: () => void;
}

export const LegalEthicsModal: React.FC<Props> = ({
  isOpen,
  language = 'vi',
  onClose
}) => {
  if (!isOpen) return null;
  const isVi = language === 'vi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl my-auto rounded-3xl bg-[#090a12] border border-amber-500/30 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_40px_rgba(245,158,11,0.15)] overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Radiant Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-teal-500" />

        {/* Modal Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-mono font-semibold uppercase tracking-wider">
                  Chính Thức • Minh Bạch
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Hiến Chương &amp; Pháp Lý
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-white">
                {isVi ? 'Cam Kết Tuân Thủ Pháp Luật & Quy Chuẩn Đạo Đức' : 'Legal Compliance & Ethics Framework'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-5 sm:px-7 py-5 space-y-5 max-h-[75vh] overflow-y-auto text-xs sm:text-sm leading-relaxed text-slate-300">
          {/* Executive Summary Box */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Tuyên Ngôn Cốt Lõi Về Tính Hợp Pháp</span>
            </div>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              Nền tảng <strong>Aurora Destiny AI</strong> (trực thuộc kênh <em>Huyền Phong Phật Đạo</em>, do <strong>Giáo Sư - Prof.TOAN</strong> phát triển) được kiến tạo với tôn chỉ tối thượng: <strong>Tuân thủ triệt để pháp luật của nước Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</strong>, lấy tinh thần phụng sự văn hóa, nghiên cứu khoa học máy tính và bảo tồn giá trị cổ học truyền thống làm kim chỉ nam.
            </p>
          </div>

          {/* Section 1: Non-superstitious & Anti-fraud */}
          <div className="space-y-2 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs sm:text-sm">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>1. Bài Trừ Mê Tín Dị Đoan &amp; Tuân Thủ Luật An Ninh Mạng</span>
            </div>
            <div className="text-xs text-slate-300/90 pl-6 space-y-1.5 font-light">
              <p>
                • <strong>Tuân thủ Nghị định 72/2013/NĐ-CP &amp; Nghị định 147/2024/NĐ-CP</strong>: Nghiêm cấm lợi dụng mạng viễn thông, Internet để truyền bá mê tín dị đoan, kích động hoang mang dư luận hoặc lừa đảo chiếm đoạt tài sản.
              </p>
              <p>
                • <strong>Bản chất hệ thống:</strong> Đây là công trình nghiên cứu khoa học tính toán (Computational Metaphysics) nhằm mô hình hóa lịch pháp thiên văn học (24 Tiết khí Mặt Trời VSOP87, chu kỳ Trái Đất) và ma trận biểu tượng triết học Phương Đông (Bát Tự, Chu Dịch 64 quẻ, Tử Vi Đẩu Số cổ truyền).
              </p>
              <p>
                • <strong>Không buôn bán dịch vụ tâm linh:</strong> Nền tảng tuyệt đối không bán bùa chú, không tổ chức cúng bái giải hạn trục lợi, không kinh doanh vật phẩm phong thủy thần bí hóa, và không thu phí xem bói dưới bất kỳ hình thức nào.
              </p>
            </div>
          </div>

          {/* Section 2: Voluntary Sponsorship Legal Grounding */}
          <div className="space-y-2 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs sm:text-sm">
              <HeartHandshake className="w-4 h-4 text-rose-400" />
              <span>2. Tính Chất Pháp Lý Của Khoản Tiền Ủng Hộ (Tùy Hỷ Công Đức)</span>
            </div>
            <div className="text-xs text-slate-300/90 pl-6 space-y-1.5 font-light">
              <p>
                • <strong>Căn cứ Điều 457 Bộ luật Dân sự 2015</strong>: Mọi sự ủng hộ thông qua tài khoản Ngân hàng (Vietcombank <strong>0501000160764</strong> - Chủ tài khoản: <strong>HA VAN TOAN</strong>) hay Ví điện tử MoMo / ZaloPay (<strong>0974313633</strong> - <strong>Hà Văn Toàn</strong>) mang bản chất là <strong>Hợp đồng tặng cho tài sản tự nguyện</strong>, xuất phát từ lòng hảo tâm và sự ghi nhận của người dùng đối với công trình nghiên cứu và kênh Huyền Phong Phật Đạo.
              </p>
              <p>
                • <strong>Mục đích sử dụng tài trợ:</strong> Toàn bộ nguồn kinh phí ủng hộ được tác giả sử dụng minh bạch nhằm chi trả chi phí thuê máy chủ điện toán đám mây AI (GPU Cloud Servers), chi phí bảo mật lưu trữ và hỗ trợ nghiên cứu công nghệ phục vụ cộng đồng hoàn toàn miễn phí.
              </p>
              <p>
                • <strong>Phi thương mại &amp; Không hoàn lại:</strong> Khoản ủng hộ không cấu thành hợp đồng mua bán dịch vụ, không phải là phí bói toán, và không tạo ra cam kết bảo đảm thay đổi số phận cho bất kỳ ai.
              </p>
            </div>
          </div>

          {/* Section 3: Personal Data Sovereignty */}
          <div className="space-y-2 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 text-teal-300 font-semibold text-xs sm:text-sm">
              <Lock className="w-4 h-4 text-teal-400" />
              <span>3. Bảo Vệ Dữ Liệu Cá Nhân (Nghị định 13/2023/NĐ-CP)</span>
            </div>
            <div className="text-xs text-slate-300/90 pl-6 space-y-1.5 font-light">
              <p>
                • Dữ liệu năm, tháng, ngày, giờ sinh và địa điểm sinh của người dùng chỉ được sử dụng duy nhất cho mục đích lập biểu đồ thiên văn và phân tích thuật toán theo yêu cầu tức thời của người dùng.
              </p>
              <p>
                • Cam kết tuyệt đối <strong>không thu thập trái phép, không bán, không thương mại hóa</strong> và không chuyển giao dữ liệu cá nhân cho bất kỳ bên thứ ba hay tổ chức quảng cáo nào.
              </p>
              <p>
                • Người dùng có toàn quyền chỉnh sửa, ẩn danh hoặc xóa bỏ hoàn toàn hồ sơ dữ liệu của mình bất cứ lúc nào qua Trung tâm Quyền Riêng Tư.
              </p>
            </div>
          </div>

          {/* Section 4: Professional Medical, Legal & Investment Disclaimer */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-yellow-300 font-semibold text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span>4. Tuyên Bố Miễn Trừ Trách Nhiệm Chuyên Môn</span>
            </div>
            <div className="text-xs text-slate-300/90 pl-6 space-y-1.5 font-light">
              <p>
                • Các phân tích năng lượng, ngũ hành và vận trình là tư liệu tham khảo, mang tính suy ngẫm hành vi (Reflective Framework) và chiêm nghiệm văn hóa dân gian.
              </p>
              <p>
                • Hệ thống <strong>hoàn toàn không thay thế</strong> cho các chẩn đoán, điều trị y khoa chuyên môn; không thay thế cho tư vấn pháp lý của luật sư; và không cấu thành lời khuyên đầu tư tài chính, chứng khoán hay kinh doanh.
              </p>
              <p>
                • Người dùng luôn là chủ thể duy nhất chịu trách nhiệm đối với mọi quyết định thực tiễn và hành vi của bản thân trong đời sống. "Đức năng thắng số" — hành động thiện lương, nỗ lực thực tế và học hỏi không ngừng mới là cội nguồn của an lạc và hanh thông.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-7 py-3.5 bg-black/40 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã xác thực quy chuẩn tuân thủ pháp luật CHXHCN Việt Nam</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer shadow"
          >
            Đã Thấu Hiểu &amp; Đồng Ý
          </button>
        </div>
      </div>
    </div>
  );
};
