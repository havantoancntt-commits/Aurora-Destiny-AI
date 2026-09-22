# GIỚI HẠN MÔ HÌNH VÀ BẢN ĐẶC TẢ TÍNH TOÁN (MODEL LIMITATIONS & CALCULATION SPECIFICATION)
**AURORA DESTINY AI — HỆ THỐNG PHÂN TÍCH MỆNH LÝ TOÁN HỌC & AI GROUNDED**
*Tài liệu công khai minh bạch nguyên lý tính toán, giới hạn phương pháp luận và chuẩn mực đạo đức dữ liệu.*

---

## 1. Mục Đích và Phạm Vi Giải Thích (Scope of Explanation)
Aurora Destiny AI là một hệ thống tính toán và tham vấn triết học phương Đông (Đông phương mệnh lý học), kết hợp giữa lịch pháp thiên văn toán học (astronomical ephemeris), thuật toán cấu trúc Bát Tự & Tử Vi Đẩu Số truyền thống, và mô hình ngôn ngữ lớn (LLM) được neo chặn (grounded) nghiêm ngặt vào dữ liệu đầu ra có thể kiểm chứng.

Hệ thống được thiết kế phục vụ mục đích:
- Khám phá mô hình nhịp điệu sinh học - tâm lý theo quan điểm triết học cổ điển.
- Hỗ trợ phản chiếu bản thân (self-reflection), hoạch định chiến lược và rèn luyện tư duy nhận diện rủi ro.
- Cung cấp công cụ tính toán thiên văn chuẩn xác (kinh độ địa lý, phương trình thời gian, can chi theo tiết khí).

**TUYỆT ĐỐI KHÔNG SỬ DỤNG CHO CÁC MỤC ĐÍCH SAU:**
- Hệ thống **KHÔNG PHẢI** là công cụ dự đoán tương lai tất định hay cam kết tiên tri.
- Hệ thống **KHÔNG THAY THẾ** các dịch vụ tư vấn chuyên nghiệp được cấp phép: y tế, chẩn đoán tâm thần, tư vấn đầu tư tài chính, hoặc tư vấn pháp lý.

---

## 2. Bốn Lớp Điểm Số Riêng Biệt (Strict Separation of Confidence Layers)
Để bảo đảm tính trung thực và ngăn ngừa việc ngộ nhận điểm số giải đoán thành xác suất khoa học thực nghiệm, Aurora Destiny AI phân tách rạch ròi 4 lớp độ tin cậy độc lập:

### Lớp I: Độ Chính Xác Tính Toán Lịch Pháp & Thiên Văn (`calculationIntegrityScore`)
- **Bản chất:** Toán học & Thiên văn học tất định (Deterministic Astronomical Ephemeris).
- **Phạm vi đo lường:**
  - Hiệu chỉnh phương trình thời gian (Equation of Time - EoT).
  - Hiệu chỉnh kinh độ địa phương (True Solar Time / Cung giờ Mặt Trời thực).
  - Tọa độ hoàng kinh Mặt Trời để xác định thời điểm chuyển tiếp Tiết khí (Solar Terms) chính xác đến từng phút.
  - Phân định chuẩn xác Dạ Tý (Late Rat) và quy tắc Giờ Tý khởi đầu ngày mới.
- **Giá trị:** 0 - 100%. Đạt mức tối đa khi người dùng cung cấp tọa độ địa lý (kinh độ, vĩ độ) và giờ sinh chính xác.

### Lớp II: Tính Nhất Quán Thuật Toán Nội Bộ (`ruleConsistencyScore` / `validationScore`)
- **Bản chất:** Tính toàn vẹn cấu trúc và bất biến toán học (System Invariant Validation).
- **Phạm vi đo lường:**
  - Kiểm tra tính bảo toàn của 12 cung Tử Vi (không trùng lặp, đầy đủ cung vị).
  - Kiểm tra tương quan Ngũ hành tương sinh, tương khắc, hợp, xung, hình, hại trong Bát Tự.
  - Xác thực trật tự Đại vận (chiều thuận/nghịch theo Dương Nam Âm Nữ) và thời điểm khởi vận từ Tiết khí.
- **Giá trị:** 0 - 100%. Phản ánh thuật toán thực thi chính xác 100% các nguyên lý cổ điển mà không xảy ra xung đột logic.

### Lớp III: Độ Khớp Mẫu Hồi Cứu (`historicalPatternFitScore`)
- **Bản chất:** Đối sánh hồi cứu mang tính suy nghiệm cá nhân (Retrospective Pattern Fit).
- **Quy tắc bất biến:**
  - Nếu người dùng **CHƯA** cung cấp tối thiểu các sự kiện bước ngoặt trong quá khứ: Giá trị trả về bắt buộc là **`null`** và trạng thái là **`INSUFFICIENT_DATA`**.
  - Hệ thống **TUYỆT ĐỐI KHÔNG** gán giá trị mặc định (như 0%, 50% hay 70%) khi thiếu dữ liệu thực tế.
  - Phân tích độ khớp luôn kèm cảnh báo về **sai lệch nhớ lại (Recall Bias)** và **sai lệch tự chọn mẫu (Selection Bias)** vì sự kiện do người dùng tự hồi tưởng và cung cấp.
- **Kỳ vọng ngẫu nhiên (Null Hypothesis):** Mức 50% trong kiểm thử đối sánh được xác định là kỳ vọng nhị phân ngẫu nhiên (coin-toss binary expectation), không phải baseline chuẩn hóa của dân số.

### Lớp IV: Xác Suất Thống Kê Thực Nghiệm (`statisticalConfidence`)
- **Bản chất:** Xác suất thực nghiệm tần suất luận (Empirical Frequentist Probability).
- **Giá trị hiện tại:** **`null`** (Trạng thái: **`NOT_AVAILABLE`**).
- **Lý do minh bạch:** Đến thời điểm hiện tại, chưa có các thử nghiệm lâm sàng đối chứng ngẫu nhiên mù đôi (randomized double-blind controlled trials) trên quy mô dân số lớn để lượng hóa xác suất tiên tri của cổ học mệnh lý. Hệ thống công khai tuyên bố không có điểm số này nhằm bảo vệ sự liêm chính học thuật.

---

## 3. Bản Chất Heuristic Của Các Điểm Số Tương Hợp
Tất cả các chỉ số như `overallScore`, `harmonyLevel`, `opportunityWave`, `cautionWave`, hay `energyAlignmentScore`:
- Được xây dựng dưới dạng **Heuristic Scoring Models** (công thức định lượng hóa trọng số tương tác ngũ hành, ngũ thần và cung vị).
- Đều có khai báo định danh công thức (`formulaVersion`), tham số đầu vào (`inputs`), bảng trọng số (`weights`), và giới hạn phương pháp luận (`limitations`).
- **Không được hiểu là:** Phần trăm cơ hội xảy ra sự kiện ngoài đời thực.
- **Được hiểu là:** Mức độ cộng hưởng hay áp lực về mặt năng lượng theo quan niệm cổ thư nhằm hỗ trợ người dùng chuẩn bị tâm thế chủ động.

---

## 4. Giới Hạn Khi Thiếu Dữ Liệu Đầu Vào
| Dữ liệu bị thiếu | Tác động hệ thống | Trạng thái xử lý |
| :--- | :--- | :--- |
| **Thiếu giờ sinh chính xác** (`hasExactHour = false`) | Không thể xác định Trụ Giờ trong Bát Tự và 12 cung chức Tử Vi Đẩu Số | Vô hiệu hóa phân tích Tử Vi chi tiết, cảnh báo độ bất định cao, hạ `dataCompletenessScore`. |
| **Thiếu tọa độ địa lý** (Kinh độ/Vĩ độ) | Không thể tính Giờ Mặt Trời Thực (True Solar Time) | Dùng múi giờ danh nghĩa dân sự, cảnh báo sai số tại các khung giờ ranh giới (±15 đến ±30 phút). |
| **Thiếu sự kiện đối sánh quá khứ** | Không thể chạy thuật toán Backtesting | `historicalPatternFitScore = null`, `historicalHitRate = null`, trạng thái `INSUFFICIENT_DATA`. |

---

## 5. Nguyên Tắc Neo Chặn Trí Tuệ Nhân Tạo (AI Grounding Policy)
1. **Fact-first Synthesis:** AI Synthesizer chỉ giải thích các thông số do engine toán học trả về; AI không bao giờ tự ý sinh ra điểm số hay sửa đổi cấu trúc dữ liệu thô.
2. **Deterministic Output:** Cùng một tập tham số đầu vào sẽ luôn tạo ra cùng một kết quả lá số tính toán duy nhất.
3. **No Fake Precision:** Loại bỏ hoàn toàn các con số làm tròn mỹ miều để che mắt người dùng. Khi thiếu dữ liệu, hệ thống thông báo minh bạch để người dùng bổ sung.
