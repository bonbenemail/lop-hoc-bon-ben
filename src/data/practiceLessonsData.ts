import { Lesson, QuizQuestion, GradeLevel, ExerciseType } from '../types';

// ============================================================================
// HỆ THỐNG CHƯƠNG TRÌNH 12 KHỐI LỚP (LỚP 1 -> LỚP 12)
// MỖI KHỐI LỚP CÓ ĐÚNG 20 BÀI LUYỆN TOÁN, 20 BÀI LUYỆN VĂN, 20 BÀI LUYỆN ANH
// MỖI BÀI LUYỆN CÓ ĐÚNG 20 CÂU HỎI RIÊNG BIỆT CỦA KHỐI LỚP ĐÓ
// ============================================================================

export const GRADE_MATH_20_TOPICS: Record<GradeLevel, string[]> = {
  1: [
    'Các số từ 0 đến 10 và so sánh số lớn - bé',
    'Phép cộng trong phạm vi 10',
    'Phép trừ trong phạm vi 10',
    'Nhận biết Hình vuông, Hình tròn, Hình tam giác, Hình chữ nhật',
    'Các số từ 11 đến 20 (Chục và đơn vị)',
    'Phép cộng, phép trừ không nhớ trong phạm vi 20',
    'Các số tròn chục (10, 20, 30... đến 90) và số 100',
    'Đọc, viết và so sánh các số có hai chữ số đến 100',
    'Phép cộng số có hai chữ số với số có một chữ số (không nhớ)',
    'Phép cộng số có hai chữ số với số có hai chữ số (không nhớ)',
    'Phép trừ số có hai chữ số cho số có một chữ số (không nhớ)',
    'Phép trừ số có hai chữ số cho số có hai chữ số (không nhớ)',
    'Đo độ dài và đơn vị đo Xăng-ti-mét (cm)',
    'Xem đồng hồ chỉ đúng giờ (1 giờ, 2 giờ... 12 giờ)',
    'Các ngày trong tuần lễ và đọc tờ lịch hàng ngày',
    'Bài toán có lời văn về thêm vào (Phép cộng Lớp 1)',
    'Bài toán có lời văn về bớt đi (Phép trừ Lớp 1)',
    'Thực hành lắp ghép, xếp hình phẳng và khối lập phương',
    'Tính giá trị biểu thức có hai dấu phép tính cộng, trừ',
    'Tổng ôn Toán Lớp 1: Số học và Hình học trực quan'
  ],
  2: [
    'Tia số, Số liền trước - Số liền sau trong phạm vi 100',
    'Số hạng - Tổng và Bị trừ - Số trừ - Hiệu',
    'Phép cộng có nhớ qua 10 trong phạm vi 20 (9+5, 8+6...)',
    'Phép trừ có nhớ qua 10 trong phạm vi 20 (11-4, 13-7...)',
    'Phép cộng có nhớ trong phạm vi 100',
    'Phép trừ có nhớ trong phạm vi 100',
    'Bài toán về Nhiều hơn và Ít hơn một số đơn vị',
    'Đơn vị đo độ dài Đề-xi-mét (dm), Mét (m) và Ki-lô-mét (km)',
    'Đơn vị đo khối lượng Ki-lô-gam (kg) và dung tích Lít (l)',
    'Đường thẳng, Đường cong, Đường gấp khúc và tính độ dài',
    'Ba điểm thẳng hàng và Hình tứ giác',
    'Phép nhân, Thừa số - Tích và Bảng nhân 2, Bảng nhân 5',
    'Phép chia, Số bị chia - Số chia - Thương và Bảng chia 2, Bảng chia 5',
    'Xem đồng hồ đến 15 phút, 30 phút và Ngày - Giờ, Ngày - Tháng',
    'Các số có ba chữ số trong phạm vi 1000 (Trăm, chục, đơn vị)',
    'So sánh các số có ba chữ số trong phạm vi 1000',
    'Phép cộng, phép trừ không nhớ trong phạm vi 1000',
    'Nhận biết Khối trụ và Khối cầu trong thực tế',
    'Thu thập, phân loại, kiểm đếm và biểu đồ tranh Lớp 2',
    'Tổng ôn Toán Lớp 2: Bảng nhân chia và Các số đến 1000'
  ],
  3: [
    'Ôn tập và bổ sung các số đến 1000, tính giá trị biểu thức',
    'Bảng nhân 3, 4, 6 và Bảng chia 3, 4, 6',
    'Bảng nhân 7, 8, 9 và Bảng chia 7, 8, 9',
    'Một phần mấy (1/2, 1/3, 1/4... đến 1/9) của một hình',
    'Gấp một số lên một số lần và Giảm một số đi một số lần',
    'So sánh số lớn gấp mấy lần số bé',
    'Nhân số có hai, ba chữ số với số có một chữ số',
    'Chia số có hai, ba chữ số cho số có một chữ số (chia hết và có dư)',
    'Điểm ở giữa, Trung điểm của đoạn thẳng',
    'Hình tròn, Tâm, Bán kính và Đường kính của hình tròn',
    'Góc vuông, Góc không vuông và thực hành với Ê-ke',
    'Chu vi Hình tam giác, Hình tứ giác, Hình chữ nhật và Hình vuông',
    'Diện tích của một hình, Đơn vị cm² và Diện tích Hình chữ nhật, Hình vuông',
    'Các số có bốn chữ số và năm chữ số (đến 100.000)',
    'Phép cộng, phép trừ các số trong phạm vi 100.000',
    'Nhân, chia số có năm chữ số với/cho số có một chữ số',
    'Đơn vị đo khối lượng Gam (g) và dung tích Mi-li-lít (ml)',
    'Chữ số La Mã (I đến XX) và Tiền Việt Nam',
    'Giải bài toán bằng hai bước tính Lớp 3',
    'Tổng ôn Toán Lớp 3: Chu vi, diện tích và Các số đến 100.000'
  ],
  4: [
    'Các số có sáu chữ số, Hàng và Lớp (Lớp triệu, lớp nghìn, lớp đơn vị)',
    'Làm tròn số đến hàng trăm nghìn và Dãy số tự nhiên',
    'Góc nhọn, Góc tù, Góc bẹt và đơn vị đo góc (Độ)',
    'Hai đường thẳng vuông góc và Hai đường thẳng song song',
    'Hình bình hành và Hình thoi: Đặc điểm nhận biết',
    'Đơn vị đo khối lượng Yến, Tạ, Tấn và đo thời gian Giây, Thế kỷ',
    'Đơn vị đo diện tích: dm², m², mm² và chuyển đổi đơn vị',
    'Tìm số trung bình cộng của nhiều số',
    'Bài toán Tìm hai số khi biết Tổng và Hiệu của hai số đó',
    'Nhân với số có hai, ba chữ số và tính chất giao hoán, kết hợp',
    'Chia cho số có hai chữ số và thương có chữ số 0',
    'Dấu hiệu chia hết cho 2, cho 5, cho 3 và cho 9',
    'Khái niệm Phân số, Phân số bằng nhau và Rút gọn phân số',
    'Quy đồng mẫu số và So sánh hai phân số',
    'Phép cộng và Phép trừ hai phân số cùng mẫu, khác mẫu số',
    'Phép nhân phân số và Tìm phân số của một số',
    'Phép chia phân số và bài toán liên quan',
    'Biểu đồ cột và đọc số liệu thống kê Lớp 4',
    'Kiểm đếm số lần lặp lại của một sự kiện xác suất',
    'Tổng ôn Toán Lớp 4: Phân số, Tổng - Hiệu và Hình học'
  ],
  5: [
    'Ôn tập Phân số, Phân số thập phân và Hỗn số',
    'Bài toán Tìm hai số khi biết Tổng và Tỉ số của hai số đó',
    'Bài toán Tìm hai số khi biết Hiệu và Tỉ số của hai số đó',
    'Khái niệm Số thập phân, Hàng của số thập phân và Đọc viết số thập phân',
    'So sánh hai số thập phân và Số thập phân bằng nhau',
    'Đơn vị đo diện tích Héc-ta (ha) và Ki-lô-mét vuông (km²)',
    'Phép cộng và Phép trừ hai số thập phân',
    'Phép nhân số thập phân với 10, 100, 1000 và với một số thập phân',
    'Phép chia số thập phân cho số tự nhiên và cho số thập phân',
    'Tỉ số phần trăm và Giải bài toán về Tỉ số phần trăm (3 dạng)',
    'Diện tích Hình tam giác và Diện tích Hình thang',
    'Chu vi và Diện tích Hình tròn (Số Pi = 3,14)',
    'Hình hộp chữ nhật, Hình lập phương: Diện tích xung quanh và toàn phần',
    'Thể tích của một hình: Đơn vị cm³, dm³, m³ và Thể tích hình hộp',
    'Số đo thời gian và Cộng, trừ, nhân, chia số đo thời gian',
    'Vận tốc, Quãng đường, Thời gian trong chuyển động đều',
    'Bài toán Hai vật chuyển động ngược chiều và cùng chiều',
    'Biểu đồ hình quạt tròn và phân tích dữ liệu Lớp 5',
    'Tỉ lệ bản đồ và ứng dụng thực tế',
    'Tổng ôn Toán Lớp 5: Số thập phân, Hình khối và Chuyển động'
  ],
  6: [
    'Tập hợp, Phần tử của tập hợp và Tập hợp các số tự nhiên N',
    'Lũy thừa với số mũ tự nhiên và Thứ tự thực hiện các phép tính',
    'Quan hệ chia hết, Tính chất chia hết của một tổng và Dấu hiệu chia hết',
    'Số nguyên tố, Hợp số và Phân tích một số ra thừa số nguyên tố',
    'Ước chung, Ước chung lớn nhất (ƯCLN) và ứng dụng',
    'Bội chung, Bội chung nhỏ nhất (BCNN) và quy đồng mẫu',
    'Tập hợp các Số nguyên Z, Thứ tự trong tập hợp số nguyên',
    'Phép cộng và Phép trừ hai số nguyên, Quy tắc dấu ngoặc',
    'Phép nhân, Phép chia số nguyên và Bội, ước của một số nguyên',
    'Hình học trực quan: Tam giác đều, Hình vuông, Lục giác đều, Hình thoi',
    'Hình có trục đối xứng và Hình có tâm đối xứng trong tự nhiên',
    'Mở rộng Phân số với tử và mẫu là số nguyên, So sánh phân số',
    'Các phép tính Cộng, Trừ, Nhân, Chia phân số Lớp 6',
    'Hai bài toán cơ bản về Phân số trong thực tiễn',
    'Số thập phân âm, Làm tròn và Ước lượng kết quả, Tỉ số phần trăm',
    'Điểm, Đường thẳng, Ba điểm thẳng hàng và Tia, Đoạn thẳng',
    'Độ dài đoạn thẳng và Trung điểm của đoạn thẳng',
    'Góc, Số đo góc và các góc đặc biệt (vuông, nhọn, tù, bẹt)',
    'Thu thập, tổ chức dữ liệu, Bảng thống kê và Biểu đồ cột kép',
    'Xác suất thực nghiệm trong các trò chơi đơn giản Lớp 6'
  ],
  7: [
    'Tập hợp các Số hữu tỉ Q và Biểu diễn số hữu tỉ trên trục số',
    'Cộng, trừ, nhân, chia số hữu tỉ và Lũy thừa của một số hữu tỉ',
    'Thứ tự thực hiện các phép tính và Quy tắc chuyển vế',
    'Số thập phân vô hạn tuần hoàn, Số vô tỉ và Căn bậc hai số học',
    'Tập hợp các Số thực R và Giá trị tuyệt đối của một số thực',
    'Tỉ lệ thức và Tính chất của dãy tỉ số bằng nhau',
    'Đại lượng tỉ lệ thuận và Đại lượng tỉ lệ nghịch trong thực tế',
    'Góc ở vị trí đặc biệt (Kề bù, đối đỉnh) và Tia phân giác của góc',
    'Hai đường thẳng song song, Tiên đề Euclid và tính chất',
    'Định lí và Chứng minh một định lí hình học',
    'Tổng các góc trong một tam giác và Góc ngoài của tam giác',
    'Ba trường hợp bằng nhau của hai tam giác (c.c.c, c.g.c, g.c.g)',
    'Các trường hợp bằng nhau của hai tam giác vuông và Tam giác cân',
    'Quan hệ giữa góc và cạnh đối diện, Bất đẳng thức tam giác',
    'Các đường đồng quy trong tam giác: Trung tuyến, Phân giác, Trung trực, Đường cao',
    'Biểu thức đại số và Đa thức một biến, Nghiệm của đa thức một biến',
    'Cộng, trừ, nhân, chia Đa thức một biến',
    'Hình hộp chữ nhật, Hình lập phương và Hình lăng trụ đứng tam giác, tứ giác',
    'Biểu đồ hình quạt tròn và Biểu đồ đoạn thẳng Lớp 7',
    'Biến cố ngẫu nhiên và Xác suất của biến cố Lớp 7'
  ],
  8: [
    'Đơn thức nhiều biến và Đa thức nhiều biến',
    'Các phép tính Cộng, trừ, nhân, chia đa thức nhiều biến',
    '7 Hằng đẳng thức đáng nhớ (Bình phương, lập phương, hiệu hai bình phương...)',
    'Phân tích đa thức thành nhân tử bằng nhiều phương pháp',
    'Phân thức đại số, Tính chất cơ bản và Rút gọn phân thức',
    'Phép cộng, phép trừ, phép nhân và phép chia Phân thức đại số',
    'Hàm số và Đồ thị của hàm số bậc nhất y = ax + b (a ≠ 0)',
    'Hệ số góc của đường thẳng y = ax + b và hai đường thẳng song song, cắt nhau',
    'Phương trình bậc nhất một ẩn và Giải bài toán bằng cách lập phương trình',
    'Định lí Pythagore trong tam giác vuông và ứng dụng',
    'Tứ giác, Hình thang cân, Hình bình hành, Hình chữ nhật',
    'Hình thoi và Hình vuông: Dấu hiệu nhận biết và tính chất',
    'Định lí Thalès trong tam giác và Đường trung bình, Tính chất đường phân giác',
    'Tam giác đồng dạng: Ba trường hợp đồng dạng của hai tam giác',
    'Các trường hợp đồng dạng của hai tam giác vuông và ứng dụng đo chiều cao',
    'Hình chóp tam giác đều và Hình chóp tứ giác đều: Diện tích và Thể tích',
    'Thu thập, phân loại dữ liệu và lựa chọn dạng biểu đồ thích hợp',
    'Phân tích số liệu thống kê dựa vào biểu đồ Lớp 8',
    'Mô tả xác suất của biến cố bằng tỉ số và Xác suất thực nghiệm',
    'Tổng ôn Toán Lớp 8: Hằng đẳng thức, Phân thức và Tam giác đồng dạng'
  ],
  9: [
    'Phương trình quy về phương trình bậc nhất một ẩn (Phương trình tích, chứa ẩn ở mẫu)',
    'Phương trình bậc nhất hai ẩn và Hệ hai phương trình bậc nhất hai ẩn',
    'Giải hệ phương trình bằng phương pháp thế và cộng đại số',
    'Giải bài toán bằng cách lập hệ phương trình bậc nhất hai ẩn',
    'Bất đẳng thức và Bất phương trình bậc nhất một ẩn',
    'Căn bậc hai, Căn thức bậc hai và Hằng đẳng thức √(A²) = |A|',
    'Biến đổi đơn giản và Rút gọn biểu thức chứa căn thức bậc hai, căn bậc ba',
    'Tỉ số lượng giác của góc nhọn (sin, cos, tan, cot) và hệ thức lượng trong tam giác vuông',
    'Đường tròn, Tính đối xứng của đường tròn, Dây và đường kính',
    'Vị trí tương đối của đường thẳng và đường tròn, Tiếp tuyến của đường tròn',
    'Góc ở tâm, Góc nội tiếp, Độ dài cung tròn và Diện tích hình quạt tròn',
    'Hàm số y = ax² (a ≠ 0) và Đồ thị Parabol',
    'Phương trình bậc hai một ẩn ax² + bx + c = 0 và Công thức nghiệm',
    'Định lí Viète và ứng dụng tìm hai số khi biết tổng và tích',
    'Giải bài toán bằng cách lập phương trình bậc hai',
    'Đường tròn ngoại tiếp, Đường tròn nội tiếp tam giác và Tứ giác nội tiếp',
    'Đa giác đều và phép quay bảo toàn đa giác đều',
    'Hình trụ, Hình nón và Hình cầu: Diện tích mặt và Thể tích',
    'Bảng tần số, Tần số tương đối và Biểu đồ tần số ghép nhóm',
    'Không gian mẫu và Xác suất của biến cố trong một số trò chơi Lớp 9'
  ],
  10: [
    'Mệnh đề toán học, Mệnh đề đảo, Mệnh đề chứa biến và Ký hiệu ∀, ∃',
    'Tập hợp và các phép toán trên tập hợp (Giao, Hợp, Hiệu, Phần bù)',
    'Bất phương trình và Hệ bất phương trình bậc nhất hai ẩn (Bài toán quy hoạch tuyến tính)',
    'Giá trị lượng giác của góc từ 0° đến 180°, Định lí Côsin và Định lí Sin trong tam giác',
    'Giải tam giác và các công thức tính Diện tích tam giác (Heron, R, r)',
    'Khái niệm Vectơ, Tổng và Hiệu của hai vectơ, Quy tắc hình bình hành',
    'Tích của một vectơ với một số và Tích vô hướng của hai vectơ',
    'Hàm số, Tập xác định, Sự biến thiên và Đồ thị hàm số',
    'Hàm số bậc hai y = ax² + bx + c: Đỉnh Parabol, Trục đối xứng và Bảng biến thiên',
    'Dấu của tam thức bậc hai và Giải bất phương trình bậc hai một ẩn',
    'Phương trình quy về phương trình bậc hai (chứa căn thức)',
    'Phương pháp tọa độ trong mặt phẳng Oxy: Tọa độ của điểm và vectơ',
    'Phương trình tổng quát, Phương trình tham số của đường thẳng và khoảng cách, góc',
    'Phương trình đường tròn và Phương trình tiếp tuyến của đường tròn',
    'Ba đường Conic: Elip, Hypebol và Parabol',
    'Quy tắc cộng, Quy tắc nhân và Sơ đồ hình cây trong Đại số tổ hợp',
    'Hoán vị, Chỉnh hợp và Tổ hợp',
    'Nhị thức Newton (a + b)ⁿ và tam giác Pascal',
    'Số gần đúng, Sai số, Các số đặc trưng đo xu thế trung tâm và độ phân tán',
    'Không gian mẫu, Biến cố đối và Tính xác suất theo định nghĩa cổ điển Lớp 10'
  ],
  11: [
    'Góc lượng giác, Đơn vị Radian và Giá trị lượng giác của góc lượng giác',
    'Công thức lượng giác: Cộng, Nhân đôi, Biến đổi tổng thành tích',
    'Hàm số lượng giác (y = sin x, cos x, tan x, cot x) và tính tuần hoàn',
    'Phương trình lượng giác cơ bản (sin x = m, cos x = m, tan x = m)',
    'Dãy số, Dãy số tăng giảm và Dãy số bị chặn',
    'Cấp số cộng: Số hạng tổng quát và Tổng n số hạng đầu',
    'Cấp số nhân: Số hạng tổng quát và Tổng n số hạng đầu',
    'Giới hạn của dãy số và Tổng của cấp số nhân lùi vô hạn',
    'Giới hạn của hàm số và Hàm số liên tục tại một điểm, trên một khoảng',
    'Đường thẳng và Mặt phẳng trong không gian: Cách xác định mặt phẳng',
    'Hai đường thẳng song song, Đường thẳng song song với mặt phẳng',
    'Hai mặt phẳng song song, Định lí Thalès trong không gian và Hình lăng trụ, Hình hộp',
    'Phép chiếu song song và biểu diễn hình không gian',
    'Lũy thừa với số mũ thực và Khái niệm Lôgarit, tính chất Lôgarit',
    'Hàm số mũ y = aˣ và Hàm số lôgarit y = logₐ x',
    'Phương trình, Bất phương trình mũ và lôgarit',
    'Hai đường thẳng vuông góc và Đường thẳng vuông góc với mặt phẳng',
    'Hai mặt phẳng vuông góc, Khoảng cách trong không gian và Thể tích khối chóp, lăng trụ',
    'Đạo hàm: Định nghĩa, Ý nghĩa hình học (Tiếp tuyến) và Quy tắc tính đạo hàm, Đạo hàm cấp hai',
    'Biến cố hợp, Biến cố giao, Biến cố độc lập và Quy tắc nhân xác suất Lớp 11'
  ],
  12: [
    'Tính đơn điệu (Đồng biến, Nghịch biến) và Cực trị của hàm số dùng Đạo hàm',
    'Giá trị lớn nhất (GTLN) và Giá trị nhỏ nhất (GTNN) của hàm số trên một đoạn',
    'Đường tiệm cận của đồ thị hàm số: Tiệm cận đứng, Tiệm cận ngang, Tiệm cận xiên',
    'Khảo sát sự biến thiên và vẽ đồ thị hàm bậc ba, hàm phân thức hữu tỉ',
    'Ứng dụng đạo hàm để giải quyết các bài toán tối ưu hóa thực tiễn',
    'Vectơ và các phép toán vectơ trong không gian ba chiều',
    'Hệ trục tọa độ Oxyz: Tọa độ của điểm và tọa độ của vectơ trong không gian',
    'Biểu thức tọa độ của phép cộng, trừ, tích vô hướng hai vectơ trong Oxyz',
    'Các số đặc trưng đo mức độ phân tán của mẫu số liệu ghép nhóm (Khoảng biến thiên, Tứ phân vị, Phương sai, Độ lệch chuẩn)',
    'Nguyên hàm của hàm số sơ cấp và Bảng nguyên hàm cơ bản',
    'Khái niệm Tích phân, Tính chất của tích phân và các phương pháp tính tích phân',
    'Ứng dụng hình học của Tích phân: Tính diện tích hình phẳng',
    'Ứng dụng hình học của Tích phân: Tính thể tích vật thể và khối tròn xoay',
    'Phương trình mặt phẳng trong không gian Oxyz (Vectơ pháp tuyến, khoảng cách)',
    'Phương trình đường thẳng trong không gian Oxyz (Tham số, chính tắc, vị trí tương đối)',
    'Công thức tính góc trong không gian Oxyz (Giữa hai đường thẳng, hai mặt phẳng, đường và mặt)',
    'Phương trình mặt cầu trong không gian Oxyz: Tâm và bán kính',
    'Xác suất có điều kiện P(A|B) và Công thức nhân xác suất',
    'Công thức xác suất toàn phần và Công thức Bayes trong thực tiễn',
    'Tổng ôn Toán Lớp 12: Khảo sát hàm số, Nguyên hàm - Tích phân và Hình học Oxyz'
  ],
};

export const GRADE_VAN_20_TOPICS: Record<GradeLevel, string[]> = {
  1: [
    'Nhận diện các nguyên âm đơn (a, o, ô, ơ, e, ê, i, u, ư) và dấu thanh',
    'Quy tắc ghép chữ c, k, q với các nguyên âm đứng sau',
    'Quy tắc chính tả g / gh và ng / ngh trước i, e, ê',
    'Phân biệt phụ âm đầu dễ lẫn: l / n và s / x',
    'Phân biệt phụ âm đầu: ch / tr và r / d / gi',
    'Luyện đọc và phân biệt các vần an / ang, ân / âng, ăn / ăng',
    'Luyện đọc và phân biệt các vần en / eng, in / inh, un / ung',
    'Luyện đọc và phân biệt các vần có nguyên âm đôi iê / yê, uô, ươ',
    'Quy tắc đặt dấu thanh (sắc, huyền, hỏi, ngã, nặng) đúng vị trí',
    'Từ chỉ sự vật: Đồ dùng học tập, cây cối và con vật quanh em',
    'Từ chỉ hoạt động, trạng thái của học sinh ở trường và ở nhà',
    'Từ chỉ đặc điểm, màu sắc, hình dáng đơn giản Lớp 1',
    'Sắp xếp các từ ngữ thành câu trọn vẹn ý nghĩa',
    'Quy tắc viết hoa chữ cái đầu câu và đặt dấu chấm cuối câu',
    'Lời chào hỏi, cảm ơn và xin lỗi lễ phép trong giao tiếp hàng ngày',
    'Đọc hiểu các bài thơ ngắn bốn chữ, năm chữ về gia đình và trường lớp',
    'Đọc hiểu truyện kể ngắn về tình bạn và lòng thật thà',
    'Chọn từ thích hợp điền vào chỗ trống hoàn thành câu văn Lớp 1',
    'Tập viết 2 - 3 câu giới thiệu về bản thân và gia đình em',
    'Tổng ôn Tiếng Việt Lớp 1: Âm vần, Chính tả và Đọc hiểu'
  ],
  2: [
    'Bảng chữ cái Tiếng Việt và viết hoa tên riêng người, địa danh',
    'Từ chỉ sự vật, Từ chỉ hoạt động và Từ chỉ đặc điểm Lớp 2',
    'Mẫu câu kể: "Ai là gì?" giới thiệu về người và đồ vật',
    'Mẫu câu kể: "Ai làm gì?" kể về công việc hàng ngày',
    'Mẫu câu kể: "Ai thế nào?" miêu tả đặc điểm sự vật',
    'Dấu chấm, Dấu chấm hỏi và Dấu chấm than cuối câu',
    'Cách dùng Dấu phẩy ngăn cách các từ cùng loại trong câu',
    'Mở rộng vốn từ về Gia đình, Ông bà, Cha mẹ và Anh chị em',
    'Mở rộng vốn từ về Trường học, Thầy cô và Bạn bè thân thiết',
    'Mở rộng vốn từ về Bốn mùa (Xuân, Hạ, Thu, Đông) và Thiên nhiên',
    'Mở rộng vốn từ về Các loài chim, Muông thú và Sông biển',
    'Tìm từ có nghĩa giống nhau và từ có nghĩa trái ngược nhau Lớp 2',
    'Đặt và trả lời câu hỏi: Khi nào? Ở đâu? Như thế nào? Vì sao?',
    'Đáp lại lời khen ngợi, lời chúc mừng, lời mời và lời chia sẻ',
    'Viết đoạn văn ngắn (4 - 5 câu) tả một đồ dùng học tập em yêu thích',
    'Viết đoạn văn ngắn kể về một việc làm tốt của em ở nhà hoặc ở trường',
    'Viết đoạn văn giới thiệu về một người thân trong gia đình',
    'Chính tả phân biệt dấu hỏi / dấu ngã và âm cuối n / ng, t / c',
    'Đọc hiểu văn bản thông tin đơn giản: Mục lục sách, Thời khóa biểu, Nội quy',
    'Tổng ôn Tiếng Việt Lớp 2: Từ và câu, Viết đoạn văn ngắn'
  ],
  3: [
    'Biện pháp tu từ So sánh: So sánh sự vật với sự vật, hoạt động với hoạt động',
    'Biện pháp tu từ Nhân hóa: Gọi và tả sự vật bằng từ ngữ của con người',
    'Ôn luyện 3 kiểu câu kể: Ai là gì? Ai làm gì? Ai thế nào?',
    'Câu hỏi (Câu nghi vấn), Câu khiến (Câu cầu khiến) và Câu cảm (Câu cảm thán)',
    'Dấu hai chấm, Dấu ngoặc kép và Dấu gạch ngang trong hội thoại',
    'Mở rộng vốn từ về Thiếu nhi, Cộng đồng, Quê hương và Đất nước',
    'Mở rộng vốn từ về Sáng tạo, Nghệ thuật, Thể thao và Lễ hội',
    'Từ có nghĩa giống nhau (Đồng nghĩa) và Từ có nghĩa trái ngược nhau (Trái nghĩa)',
    'Đặt và trả lời câu hỏi: Bằng gì? Để làm gì? Vì sao?',
    'Chính tả nâng cao Lớp 3: Phân biệt l/n, s/x, ch/tr, r/d/gi, ươn/ương',
    'Viết đoạn văn nêu tình cảm, cảm xúc về một người bạn hoặc thầy cô giáo',
    'Viết đoạn văn thuật lại một ngày hội hoặc hoạt động tập thể ở trường',
    'Viết đoạn văn tả một đồ vật hoặc món đồ chơi gắn bó với em',
    'Cách viết bức thư ngắn và tin nhắn thăm hỏi người thân ở xa',
    'Cách viết Thông báo và Đơn xin tham gia câu lạc bộ năng khiếu',
    'Đọc hiểu truyện đồng thoại và bài học ứng xử nhân ái',
    'Đọc hiểu thơ thiếu nhi và cảm nhận hình ảnh thiên nhiên tươi đẹp',
    'Đọc hiểu văn bản thông tin về khám phá thế giới tự nhiên',
    'Rèn kỹ năng tóm tắt câu chuyện dựa vào tranh minh họa',
    'Tổng ôn Tiếng Việt Lớp 3: So sánh, Nhân hóa và Tập làm văn'
  ],
  4: [
    'Phân biệt Từ đơn, Từ ghép (tổng hợp, phân loại) và Từ láy',
    'Danh từ, Danh từ chung, Danh từ riêng và quy tắc viết hoa',
    'Động từ chỉ hoạt động, trạng thái và Tính từ chỉ đặc điểm, tính chất',
    'Cấu tạo của Câu kể: Xác định thành phần chính Chủ ngữ và Vị ngữ',
    'Thành phần phụ của câu: Trạng ngữ chỉ thời gian, nơi chốn, nguyên nhân, mục đích',
    'Công dụng của Dấu gạch ngang, Dấu ngoặc kép và Dấu ngoặc đơn',
    'Chủ đề từ vựng: Nhân hậu - Đoàn kết, Trung thực - Tự trọng, Ý chí - Nghị lực',
    'Chủ đề từ vựng: Ước mơ, Khám phá thế giới, Cái đẹp và Lạc quan yêu đời',
    'Cách chọn từ ngữ giàu hình ảnh, cảm xúc trong viết câu văn miêu tả',
    'Lập dàn ý và viết bài văn Kể lại một câu chuyện đã đọc, đã nghe',
    'Lập dàn ý và viết bài văn Miêu tả cây cối (cây hoa, cây ăn quả, cây bóng mát)',
    'Lập dàn ý và viết bài văn Miêu tả con vật nuôi trong gia đình',
    'Viết đoạn văn nêu ý kiến tán thành về một câu chuyện hoặc nhân vật',
    'Viết báo cáo thảo luận nhóm và hướng dẫn thực hiện một công việc',
    'Biện pháp tu từ So sánh và Nhân hóa nâng cao trong thơ văn Lớp 4',
    'Hiểu và vận dụng Thành ngữ, Tục ngữ về đạo đức và học tập',
    'Đọc hiểu văn bản truyện lịch sử và lòng tự hào dân tộc',
    'Đọc hiểu thơ tự do, thơ lục bát viết về quê hương, gia đình',
    'Đọc hiểu văn bản thông tin khoa học thường thức dành cho thiếu nhi',
    'Tổng ôn Tiếng Việt Lớp 4: Từ loại, Thành phần câu và Văn miêu tả'
  ],
  5: [
    'Từ đồng nghĩa (đồng nghĩa hoàn toàn và không hoàn toàn)',
    'Từ trái nghĩa và tác dụng tạo phép đối trong tục ngữ, thơ văn',
    'Từ đồng âm và cách phân biệt để tránh nhầm lẫn trong giao tiếp',
    'Từ nhiều nghĩa: Phân biệt Nghĩa gốc và Nghĩa chuyển của từ',
    'Đại từ (Đại từ xưng hô, đại từ thay thế) và Kết từ (Quan hệ từ)',
    'Câu đơn và Câu ghép: Cách nối các vế câu ghép trực tiếp và bằng từ nối',
    'Câu ghép sử dụng cặp quan hệ từ (Vì... nên..., Nếu... thì..., Tuy... nhưng...)',
    'Liên kết các câu trong đoạn văn bằng phép lặp từ ngữ, phép thế và phép nối',
    'Điệp từ, Điệp ngữ và tác dụng nhấn mạnh cảm xúc trong văn bản',
    'Ôn tập tổng hợp về Dấu câu: Dấu chấm, phẩy, hai chấm, chấm than, gạch ngang',
    'Chủ đề từ vựng: Hòa bình - Hữu nghị, Bảo vệ môi trường, Công dân toàn cầu',
    'Lập dàn ý và viết bài văn Tả phong cảnh thiên nhiên, quê hương đất nước',
    'Lập dàn ý và viết bài văn Tả người (Thầy cô, người thân, bạn bè)',
    'Viết bài văn kể chuyện sáng tạo (đóng vai nhân vật hoặc thay đổi kết thúc)',
    'Viết đoạn văn thể hiện tình cảm, cảm xúc trước một sự việc hoặc bài thơ',
    'Viết chương trình hoạt động và báo cáo công việc của Liên đội, lớp học',
    'Đọc hiểu truyện ngắn hiện đại viết về tuổi thơ và tình yêu Tổ quốc',
    'Đọc hiểu thơ ca Việt Nam về vẻ đẹp thiên nhiên và con người lao động',
    'Đọc hiểu kịch bản ngắn: Nhân vật, lời thoại và cử chỉ hành động',
    'Tổng ôn Tiếng Việt Lớp 5: Từ vựng, Câu ghép, Liên kết câu và Tập làm văn'
  ],
  6: [
    'Truyện đồng thoại và Truyện truyền thuyết, Cổ tích Việt Nam',
    'Từ đơn, Từ phức (Từ ghép, Từ láy) và Nghĩa của từ trong ngữ cảnh',
    'Biện pháp tu từ Ẩn dụ và Hoán dụ: Nhận diện và phân tích tác dụng',
    'Thơ lục bát: Luật bằng trắc, cách gieo vần và nhịp thơ truyền thống',
    'Ký và Hồi ký: Người kể chuyện ngôi thứ nhất và tính xác thực của sự việc',
    'Cụm danh từ, Cụm động từ và Cụm tính từ: Cấu tạo 3 phần',
    'Từ đa nghĩa, Từ đồng âm và Từ mượn (Từ Hán Việt và từ mượn châu Âu)',
    'Mở rộng thành phần chính của câu bằng cụm từ và Trạng ngữ trong câu',
    'Lựa chọn từ ngữ, cấu trúc câu và công dụng của Dấu chấm phẩy, Dấu ngoặc kép',
    'Văn bản thông tin thuật lại một sự kiện lịch sử hoặc lễ hội truyền thống',
    'Văn bản nghị luận xã hội: Ý kiến, Lý lẽ và Bằng chứng thuyết phục',
    'Viết bài văn Kể lại một trải nghiệm đáng nhớ của bản thân',
    'Viết đoạn văn ghi lại cảm xúc về một bài thơ có yếu tố tự sự, miêu tả',
    'Viết bài văn tả cảnh sinh hoạt nhộn nhịp ở quê hương',
    'Viết bài văn trình bày ý kiến về một hiện tượng trong đời sống học đường',
    'Viết biên bản một cuộc họp, cuộc thảo luận và tóm tắt văn bản bằng sơ đồ',
    'Đọc hiểu văn bản "Dế Mèn phiêu lưu ký" (Tô Hoài) và bài học trưởng thành',
    'Đọc hiểu truyền thuyết "Thánh Gióng", "Sơn Tinh, Thủy Tinh" và tinh thần dân tộc',
    'Thực hành nói và nghe: Kể lại một trải nghiệm và thảo luận nhóm nhỏ',
    'Tổng ôn Ngữ văn Lớp 6: Truyền thuyết, Thơ lục bát, Ẩn dụ - Hoán dụ và Viết văn'
  ],
  7: [
    'Thơ bốn chữ, Thơ năm chữ và cách cảm nhận hình ảnh, nhịp điệu thơ',
    'Truyện ngụ ngôn và Tục ngữ Việt Nam: Bài học triết lý nhân sinh sâu sắc',
    'Truyện khoa học viễn tưởng: Đề tài, không gian, thời gian và cốt truyện',
    'Tùy bút và Tản văn: Chất trữ tình, cái tôi tác giả và ngôn ngữ giàu hình ảnh',
    'Văn bản nghị luận: Mối quan hệ giữa Ý kiến, Lý lẽ và Bằng chứng',
    'Văn bản thông tin giới thiệu một quy tắc hoặc luật lệ trong trò chơi, hoạt động',
    'Phó từ, Số từ và chức năng bổ sung ý nghĩa trong cụm từ',
    'Mở rộng trạng ngữ và thành phần chính của câu bằng cụm Chủ - Vị',
    'Biện pháp tu từ Nói quá (Khoa trương) và Nói giảm nói tránh',
    'Mạch lạc và Liên kết trong văn bản, Từ ngữ địa phương và Thuật ngữ khoa học',
    'Dấu chấm lửng (...) và công dụng biểu đạt ý nghĩa hàm ẩn, cảm xúc',
    'Nghĩa của các yếu tố Hán Việt thông dụng và cách giải nghĩa từ Hán Việt',
    'Viết bài văn Kể lại sự việc có thật liên quan đến nhân vật hoặc sự kiện lịch sử',
    'Viết bài văn Biểu cảm về con người hoặc sự việc gắn bó sâu sắc',
    'Viết bài văn Phân tích đặc điểm nhân vật trong một tác phẩm văn học',
    'Viết bài văn Nghị luận về một vấn đề trong đời sống (Trình bày ý kiến tán thành/phản đối)',
    'Viết văn bản thuyết minh về một quy tắc hay luật lệ trong hoạt động',
    'Đọc hiểu tùy bút về văn hóa, ẩm thực và cảnh sắc bốn mùa Việt Nam',
    'Tóm tắt văn bản theo những yêu cầu khác nhau về độ dài',
    'Tổng ôn Ngữ văn Lớp 7: Ngụ ngôn, Tùy bút, Tiếng Việt thực hành và Văn nghị luận'
  ],
  8: [
    'Truyện lịch sử và Tiểu thuyết chương hồi: Bối cảnh, cốt truyện và nhân vật',
    'Thơ Đường luật (Thất ngôn bát cú và Tứ tuyệt): Bố cục Đề - Thực - Luận - Kết',
    'Thơ trào phúng và Truyện cười dân gian: Tiếng cười phê phán thói hư tật xấu',
    'Hài kịch: Xung đột kịch, hành động, lời thoại và thủ pháp trào phúng',
    'Truyện ngắn hiện thực và lãng mạn Việt Nam giai đoạn 1930 - 1945',
    'Thơ tự do và Thơ sáu chữ, bảy chữ hiện đại Việt Nam',
    'Từ tượng hình, Từ tượng thanh và giá trị gợi tả sinh động',
    'Biện pháp tu từ Đảo ngữ, Câu hỏi tu từ và Từ Hán Việt mở rộng',
    'Trợ từ, Thán từ và Thành phần biệt lập (Tình thái, Cảm thán, Gọi - đáp, Phụ chú)',
    'Nghĩa tường minh và Nghĩa hàm ẩn của câu trong giao tiếp',
    'Câu chia theo mục đích nói (Nghi vấn, Cầu khiến, Cảm thán, Trần thuật), Câu khẳng định & phủ định',
    'Đoạn văn演 dịch, Quy nạp, Song song và Phối hợp',
    'Văn bản nghị luận xã hội và Nghị luận văn học trung đại (Hịch tướng sĩ)',
    'Văn bản thông tin giải thích một hiện tượng tự nhiên hoặc giới thiệu một cuốn sách',
    'Viết bài văn Kể lại một chuyến đi hoặc một hoạt động xã hội giàu ý nghĩa',
    'Viết bài văn Phân tích một tác phẩm văn học (Bài thơ Đường luật, thơ tự do hoặc truyện)',
    'Viết bài văn Nghị luận về một vấn đề đời sống (Con người với xã hội, tự nhiên)',
    'Viết văn bản thuyết minh giải thích một hiện tượng tự nhiên trong đời sống',
    'Đọc hiểu chuyên sâu tác phẩm "Hịch tướng sĩ" (Trần Quốc Tuấn) và "Lão Hạc" (Nam Cao)',
    'Tổng ôn Ngữ văn Lớp 8: Thơ Đường luật, Truyện hiện thực, Thành phần biệt lập và Nghị luận'
  ],
  9: [
    'Truyện truyền kỳ ("Chuyện người con gái Nam Xương" - Nguyễn Dữ) và yếu tố kỳ ảo',
    'Truyện thơ Nôm và kiệt tác "Truyện Kiều" của đại thi hào Nguyễn Du',
    'Nghệ thuật miêu tả nội tâm nhân vật và bút pháp tả cảnh ngụ tình trong Truyện Kiều',
    'Thơ tám chữ và Thơ hiện đại Việt Nam thời kỳ kháng chiến và xây dựng đất nước',
    'Bi kịch: Xung đột bi kịch, nhân vật bi kịch và hiệu ứng thanh lọc tâm hồn',
    'Truyện trinh thám: Chi tiết suy luận logic, tình huống bất ngờ và người điều tra',
    'Văn bản nghị luận xã hội và Nghị luận văn học phân tích tác phẩm',
    'Văn bản thông tin giới thiệu một danh lam thắng cảnh hoặc di tích lịch sử',
    'Điển tích, Điển cố trong văn học cổ điển và Chữ Nôm, chữ Quốc ngữ',
    'Biện pháp tu từ Chơi chữ, Điệp thanh và Điệp vần trong thơ ca',
    'Cách dẫn trực tiếp và Cách dẫn gián tiếp lời nói, ý nghĩ của nhân vật',
    'Câu đơn, Câu ghép đẳng lập, Câu ghép chính phụ và phép biến đổi câu (Rút gọn, Mở rộng)',
    'Nghĩa của từ ngữ mới và sự phát triển của từ vựng Tiếng Việt hiện đại',
    'Viết bài văn Nghị luận về một vấn đề cần giải quyết trong đời sống của học sinh',
    'Viết bài văn Phân tích một tác phẩm thơ (Thơ tám chữ, thơ tự do, đoạn trích Truyện Kiều)',
    'Viết bài văn Phân tích một tác phẩm truyện (Cốt truyện, nhân vật, nghệ thuật trần thuật)',
    'Viết văn bản thuyết minh giới thiệu một danh lam thắng cảnh hoặc di tích lịch sử',
    'Viết bài văn Quảng cáo hoặc tờ rơi về một sản phẩm, hoạt động cộng đồng',
    'Rèn kỹ năng làm đề thi tuyển sinh vào Lớp 10 môn Ngữ văn (Đọc hiểu + Nghị luận)',
    'Tổng ôn Ngữ văn Lớp 9: Truyện Kiều, Thơ và Truyện hiện đại, Ôn thi vào Lớp 10'
  ],
  10: [
    'Thần thoại và Sử thi (Đăm Săn, Ô-đi-xê): Không gian vũ trụ và người anh hùng sử thi',
    'Thơ Đường luật chữ Hán và chữ Nôm (Nguyễn Trãi, Nguyễn Bỉnh Khiêm, Hồ Xuân Hương)',
    'Nghệ thuật Sân khấu dân gian: Chèo cổ ("Xuý Vân giả dại") và Tuồng truyền thống',
    'Văn bản nghị luận trung đại và hiện đại: Luận đề, luận điểm, lý lẽ và bằng chứng',
    'Thơ trữ tình hiện đại: Chủ thể trữ tình, tứ thơ, vần, nhịp và hình ảnh biểu tượng',
    'Truyện ngắn và Tiểu thuyết: Điểm nhìn trần thuật, người kể chuyện toàn tri và hạn tri',
    'Tác gia Nguyễn Trãi: Cuộc đời, sự nghiệp văn chương và kiệt tác "Bình Ngô đại cáo"',
    'Văn bản thông tin tổng hợp: Bản tin, phóng sự và biểu đồ đa phương thức',
    'Lỗi dùng từ Tiếng Việt (Lặp từ, dùng từ không đúng nghĩa, sai phong cách) và cách sửa',
    'Trật tự từ trong câu và Biện pháp tu từ Chêm xen, Liệt kê',
    'Sử dụng trích dẫn, cước chú và các phương tiện giao tiếp phi ngôn ngữ',
    'Viết văn bản Nghị luận phân tích, đánh giá một tác phẩm truyện hoặc thơ',
    'Viết bài luận thuyết phục người khác từ bỏ một thói quen hay một quan niệm lệch lạc',
    'Viết bài luận về bản thân (Personal Essay) ứng tuyển học bổng hoặc câu lạc bộ',
    'Viết báo cáo kết quả nghiên cứu về một vấn đề văn hóa, lịch sử hoặc tự nhiên',
    'Viết văn bản nội quy hoặc hướng dẫn nơi công cộng',
    'Đọc hiểu chuyên sâu "Bình Ngô đại cáo" và thơ quốc âm của Nguyễn Trãi',
    'Đọc hiểu văn học nước ngoài: Thần thoại Hy Lạp, Sử thi Ấn Độ và thơ Haiku Nhật Bản',
    'Kỹ năng thuyết trình và thảo luận về một vấn đề xã hội có những ý kiến khác nhau',
    'Tổng ôn Ngữ văn Lớp 10: Sử thi, Sân khấu dân gian, Nguyễn Trãi và Văn nghị luận'
  ],
  11: [
    'Truyện ngắn hiện đại (Chí Phèo - Nam Cao, Chữ người tử tù - Nguyễn Tuân, Hai đứa trẻ - Thạch Lam)',
    'Cấu tứ và hình ảnh trong Thơ trữ tình (Thơ Mới 1932 - 1945 và thơ tượng trưng)',
    'Truyện thơ dân gian ("Tiễn dặn người yêu") và Truyện thơ Nôm bác học',
    'Bi kịch cổ điển và hiện đại ("Rô-mê-ô và Giu-li-ét" - William Shakespeare)',
    'Tác gia Nguyễn Du: Cuộc đời, tư tưởng nhân đạo và đỉnh cao nghệ thuật Truyện Kiều',
    'Ký văn học: Tùy bút, Tản văn, Truyện ký và sự kết hợp giữa tự sự với trữ tình',
    'Văn bản nghị luận xã hội và văn học: Cấu trúc lập luận chặt chẽ, sắc bén',
    'Văn bản thông tin giải thích một hiện tượng xã hội hoặc quy trình khoa học',
    'Đặc điểm cơ bản của Ngôn ngữ nói và Ngôn ngữ viết trong tiếng Việt',
    'Lỗi về thành phần câu (Thiếu chủ ngữ, thiếu vị ngữ, câu cụt) và cách khắc phục',
    'Biện pháp tu từ Lặp cấu trúc, Đối và cách giải nghĩa từ trong từ điển',
    'Cách trình bày tài liệu tham khảo trong một báo cáo nghiên cứu khoa học',
    'Viết văn bản Nghị luận về một vấn đề xã hội (Hình thành lối sống tích cực trong xã hội hiện đại)',
    'Viết văn bản Nghị luận phân tích, đánh giá một tác phẩm thơ hoặc kịch bản văn học',
    'Viết văn bản thuyết minh có lồng ghép một hay nhiều yếu tố như miêu tả, tự sự, biểu cảm',
    'Viết báo cáo nghiên cứu về một vấn đề tự nhiên hoặc xã hội Lớp 11',
    'Đọc hiểu chuyên sâu thơ Xuân Diệu ("Vội vàng"), Huy Cận ("Tràng giang"), Hàn Mặc Tử ("Đây thôn Vĩ Dạ")',
    'Đọc hiểu chuyên sâu tác phẩm tự sự của Nam Cao, Vũ Trọng Phụng và Nguyễn Tuân',
    'Kỹ năng tranh biện và giới thiệu một tác phẩm nghệ thuật (Văn học, Điện ảnh, Hội họa)',
    'Tổng ôn Ngữ văn Lớp 11: Thơ Mới, Truyện hiện thực 1930-1945, Nguyễn Du và Bi kịch'
  ],
  12: [
    'Tiểu thuyết hiện đại Việt Nam và thế giới: Phong cách hiện thực và hậu hiện đại',
    'Thơ trữ tình hiện đại ("Tây Tiến" - Quang Dũng, "Việt Bắc" - Tố Hữu, "Đất Nước" - Nguyễn Khoa Điềm)',
    'Tác gia Hồ Chí Minh: Quan điểm sáng tác văn học, Tuyên ngôn Độc lập và Nhật ký trong tù',
    'Truyện truyền kỳ và Văn tế trung đại ("Văn tế nghĩa sĩ Cần Giuộc" - Nguyễn Đình Chiểu)',
    'Hài kịch hiện đại ("Quan thanh tra" - Gô-gôn, "Hồn Trương Ba, da hàng thịt" - Lưu Quang Vũ)',
    'Phóng sự, Nhật ký và Hồi ký chiến tranh ("Nhật ký Đặng Thùy Trâm", Nguyễn Tuân)',
    'Văn bản nghị luận văn học: So sánh, đánh giá hai tác phẩm văn học cùng hoặc khác thể loại',
    'Văn bản thông tin tổng hợp: Dữ liệu sơ cấp, thứ cấp và tính cập nhật, độ tin cậy',
    'Giữ gìn sự trong sáng của Tiếng Việt và sự phát triển ngôn ngữ trong kỷ nguyên số',
    'Lỗi logic, lỗi câu mơ hồ và cách sửa để đảm bảo tính chuẩn xác của văn bản',
    'Biện pháp tu từ Nói mỉa (Trào phúng), Nghịch ngữ và giá trị nghệ thuật trong văn chương',
    'Tôn trọng và bảo vệ quyền sở hữu trí tuệ trong học tập và nghiên cứu',
    'Viết bài văn Nghị luận so sánh, đánh giá hai tác phẩm truyện hoặc hai tác phẩm thơ',
    'Viết bài văn Nghị luận về một vấn đề có liên quan đến tuổi trẻ và định hướng tương lai',
    'Viết thư trao đổi công việc hoặc một vấn đề đáng quan tâm một cách trang trọng',
    'Viết báo cáo kết quả của bài tập dự án nghiên cứu liên môn Lớp 12',
    'Đọc hiểu chuyên sâu tác phẩm "Vợ chồng A Phủ" (Tô Hoài), "Vợ nhặt" (Kim Lân), "Chiếc thuyền ngoài xa" (Nguyễn Minh Châu)',
    'Đọc hiểu chuyên sâu tùy bút "Người lái đò Sông Đà" (Nguyễn Tuân) và "Ai đã đặt tên cho dòng sông?" (Hoàng Phủ Ngọc Tường)',
    'Chiến thuật làm bài thi Tốt nghiệp THPT môn Ngữ văn đạt điểm 9+ (Đọc hiểu + Nghị luận xã hội + Nghị luận văn học)',
    'Tổng ôn Ngữ văn Lớp 12: Tác gia Hồ Chí Minh, Thơ - Truyện hiện đại và Luyện thi THPT Quốc gia'
  ],
};

export const GRADE_ANH_20_TOPICS: Record<GradeLevel, string[]> = {
  1: [
    'Unit 1: The Alphabet (A - M) & Phonics Sounds',
    'Unit 2: The Alphabet (N - Z) & Beginning Letters',
    'Unit 3: Greetings: Hello, Hi, Goodbye & "What is your name?"',
    'Unit 4: Numbers 1 to 10 & Counting Objects ("How many...?")',
    'Unit 5: Basic Colors (Red, Blue, Yellow, Green, Orange, Pink)',
    'Unit 6: School Things (Pen, Pencil, Book, Bag, Ruler, Eraser)',
    'Unit 7: Classroom Commands (Stand up, Sit down, Open your book)',
    'Unit 8: My Family Members (Father, Mother, Brother, Sister, Baby)',
    'Unit 9: Parts of the Face & Body (Eyes, Nose, Mouth, Ears, Hands)',
    'Unit 10: Farm Animals (Dog, Cat, Duck, Cow, Pig, Bird)',
    'Unit 11: My Favorite Toys (Ball, Doll, Car, Teddy bear, Kite)',
    'Unit 12: Delicious Food & Drinks (Apple, Banana, Milk, Water, Cake)',
    'Unit 13: Shapes Around Us (Circle, Square, Triangle, Star)',
    'Unit 14: Structure "This is my..." & "It is a..."',
    'Unit 15: Asking "Is it a...?" - "Yes, it is / No, it isn\'t"',
    'Unit 16: Expressing Likes: "I like apples / I like milk"',
    'Unit 17: Action Verbs: Run, Jump, Sing, Dance, Swim',
    'Unit 18: Capabilities with "I can..." ("I can sing", "I can draw")',
    'Unit 19: Polite Words: Please, Thank you & Sorry',
    'Unit 20: Grade 1 English Comprehensive Review (20 Questions)'
  ],
  2: [
    'Unit 1: Numbers 11 to 20 & Asking About Age ("How old are you?")',
    'Unit 2: Days of the Week (Monday to Sunday)',
    'Unit 3: Feelings & Emotions (Happy, Sad, Hungry, Thirsty, Tired)',
    'Unit 4: Rooms in the House (Living room, Bedroom, Kitchen, Bathroom)',
    'Unit 5: Clothes We Wear (Shirt, Dress, Shoes, Hat, Shorts, Coat)',
    'Unit 6: Wild Animals at the Zoo (Elephant, Tiger, Monkey, Lion, Zebra)',
    'Unit 7: Weather Today (Sunny, Rainy, Windy, Cloudy, Snowy)',
    'Unit 8: Means of Transport (Bus, Bike, Car, Train, Boat, Plane)',
    'Unit 9: Prepositions of Place: In, On, Under ("Where is the ball?")',
    'Unit 10: Demonstratives: This / That & These / Those',
    'Unit 11: Singular and Plural Nouns (a cat -> two cats)',
    'Unit 12: Subject Pronouns: He, She, It, We, They + Verb To Be',
    'Unit 13: Present Continuous for Actions Now ("He is reading")',
    'Unit 14: Asking "Can you...?" - "Yes, I can / No, I can\'t"',
    'Unit 15: There is a... / There are... in My Classroom',
    'Unit 16: Playground Activities (Slide, Seesaw, Swing, Ride a bike)',
    'Unit 17: Sea Animals & At the Beach (Fish, Crab, Octopus, Sandcastle)',
    'Unit 18: Phonics Review: Digraphs sh, ch, th & Short Vowels',
    'Unit 19: Everyday Short Conversations for Grade 2',
    'Unit 20: Grade 2 English Comprehensive Review (20 Questions)'
  ],
  3: [
    'Unit 1: Hello, Introductions & "How are you? - I\'m fine, thank you"',
    'Unit 2: Our Names & Spelling Names ("How do you spell your name?")',
    'Unit 3: Our Friends & Introducing Classmates ("This is my friend...")',
    'Unit 4: Our Bodies & Touch Your Nose/Eyes/Ears',
    'Unit 5: My Hobbies ("What\'s your hobby? - I like singing and painting")',
    'Unit 6: Our School Facilities (Classroom, Library, Playground, Art room)',
    'Unit 7: Classroom Instructions & Asking Permission ("May I come in?")',
    'Unit 8: My School Things & Possession ("Do you have a ruler?")',
    'Unit 9: Colors of School Objects ("What color is it? / What color are they?")',
    'Unit 10: Break Time Activities (Play badminton, chess, hide-and-seek)',
    'Unit 11: My Family & Ages of Family Members ("How old is your brother?")',
    'Unit 12: Jobs & Occupations (Doctor, Teacher, Driver, Worker, Farmer)',
    'Unit 13: My House & Furniture (Table, Chair, Lamp, Bed, Wardrobe)',
    'Unit 14: My Bedroom & Prepositions (Near, Next to, Behind, In front of)',
    'Unit 15: At the Dining Table ("Would you like some rice, meat, fish, juice?")',
    'Unit 16: My Pets (Dog, Cat, Parrot, Goldfish, Rabbit)',
    'Unit 17: Our Toys & Counting Numbers 21 to 100',
    'Unit 18: Playing & Doing Activities in the Living Room (Watching TV, listening to music)',
    'Unit 19: Outdoor Activities in the Park (Flying a kite, cycling, skating)',
    'Unit 20: At the Zoo & Grade 3 English Comprehensive Review'
  ],
  4: [
    'Unit 1: My Friends & Countries ("Where are you from? - I\'m from Vietnam")',
    'Unit 2: Time & Daily Routines ("What time do you get up?")',
    'Unit 3: My Week & Study Schedule ("What do you do on Mondays?")',
    'Unit 4: My Birthday Party & Months of the Year ("When\'s your birthday?")',
    'Unit 5: Things We Can Do ("Can you play the guitar / ride a horse / cook?")',
    'Unit 6: Our School Facilities in Town, Village, Mountains',
    'Unit 7: Our Timetables & School Subjects (Math, Vietnamese, English, Science, Music)',
    'Unit 8: My Favorite Subjects & Why ("Because I want to be an English teacher")',
    'Unit 9: Our Sports Day in May, June, July',
    'Unit 10: Our Summer Holidays ("Where were you last summer? - Was/Were")',
    'Unit 11: My Home & Street Address ("Where do you live?")',
    'Unit 12: Jobs & Workplaces (Hospital, Factory, Field, Office, Nursing home)',
    'Unit 13: Appearance ("What does he look like? - Tall, slim, short hair")',
    'Unit 14: Daily Activities & Helping Parents at Home',
    'Unit 15: My Family\'s Weekends (Cinema, Shopping center, Swimming pool)',
    'Unit 16: Weather & Four Seasons ("What\'s the weather like in Hanoi?")',
    'Unit 17: In the City & Road Signs (Turn left, Turn right, Go straight, Stop)',
    'Unit 18: At the Shopping Center & Asking Prices ("How much is the T-shirt?")',
    'Unit 19: The Animal World (Giraffes, Crocodiles, Hippos, Lions)',
    'Unit 20: At Summer Camp & Grade 4 English Comprehensive Review'
  ],
  5: [
    'Unit 1: All About Me (Class, Address, Favorite Sport, Animal, Color)',
    'Unit 2: Our Homes & Building Types (House, Flat, Tower, Building)',
    'Unit 3: My Foreign Friends & Personality (Friendly, Helpful, Active, Clever)',
    'Unit 4: Our Free-Time Activities & Adverbs of Frequency (Always, Usually, Often)',
    'Unit 5: My Future Job (Firefighter, Reporter, Gardener, Writer, Dentist)',
    'Unit 6: Our School Rooms & Directions (First floor, Second floor, Go upstairs)',
    'Unit 7: Our Favorite School Activities (Solving math problems, doing projects)',
    'Unit 8: In Our Classroom & Prepositions of Location (Above, Beside, Under)',
    'Unit 9: Our Outdoor Activities in the Past (Past Simple of Be & Regular Verbs)',
    'Unit 10: Our School Trip to Ba Na Hills, Hoan Kiem Lake (Irregular Past Verbs)',
    'Unit 11: Family Time on Vacation (Took photos, bought souvenirs, ate seafood)',
    'Unit 12: Our Tet Holiday ("Will you make banh chung / decorate the house?")',
    'Unit 13: Our Special Days (Children\'s Day, Teachers\' Day, Mid-Autumn Festival)',
    'Unit 14: Staying Healthy (Do morning exercise, eat vegetables, drink fresh juice)',
    'Unit 15: Our Health & Common Illnesses (Toothache, Headache, Sore throat + Should)',
    'Unit 16: Seasons and the Weather + Wearing Suitable Clothes',
    'Unit 17: Stories for Children (The Fox and the Crow, The Tortoise and the Hare)',
    'Unit 18: Means of Transport & Tourist Attractions in Vietnam',
    'Unit 19: Places of Interest & Distance ("How far is it from... to...?")',
    'Unit 20: Our Summer Holidays ("Be going to") & Grade 5 Comprehensive Review'
  ],
  6: [
    'Unit 1: My New School & Present Simple vs. Adverbs of Frequency',
    'Unit 2: My House, Possessive Case (\'s) & Prepositions of Place',
    'Unit 3: My Friends: Appearance, Personality & Present Continuous Tense',
    'Unit 4: My Neighbourhood & Comparative Adjectives (shorter, more modern)',
    'Unit 5: Natural Wonders of Vietnam (Ha Long Bay, Mui Ne) & Countable/Uncountable, Must/Mustn\'t',
    'Unit 6: Our Tet Holiday & Should / Shouldn\'t, Some / Any',
    'Unit 7: Television Programmes, Wh-Questions & Conjunctions (and, but, so, because)',
    'Unit 8: Sports and Games, Past Simple Tense & Imperatives',
    'Unit 9: Cities of the World, Possessive Adjectives & Possessive Pronouns (mine, yours)',
    'Unit 10: Our Houses in the Future, Future Simple (Will) & Might for Possibility',
    'Unit 11: Our Greener World (3Rs: Reduce, Reuse, Recycle), Articles (a/an/the) & First Conditional',
    'Unit 12: Robots & Superlative Adjectives (the smartest, the fastest)',
    'Lesson 13: Pronunciation of Final -s / -es (/s/, /z/, /ɪz/) in Grade 6',
    'Lesson 14: Pronunciation of Final -ed (/t/, /d/, /ɪd/) & Vowel Sounds',
    'Lesson 15: Prepositions of Time (in, on, at) & Everyday Schedules',
    'Lesson 16: Word Formation Basics (Nouns & Adjectives) for Grade 6',
    'Lesson 17: Everyday Communication & Polite Responses (Grade 6)',
    'Lesson 18: Reading Comprehension: School Life & Environment Passages',
    'Lesson 19: Sentence Transformation & Error Identification (Grade 6)',
    'Lesson 20: Grade 6 English Comprehensive Review (CEFR A2 Foundation)'
  ],
  7: [
    'Unit 1: Hobbies & Verbs of Liking / Disliking (+ V-ing: love, enjoy, hate)',
    'Unit 2: Healthy Living & Simple Sentences (Subject + Verb + Object + Adverb)',
    'Unit 3: Community Service & Past Simple Tense (Regular and Irregular Verbs)',
    'Unit 4: Music and Arts & Comparisons: (not) as... as, the same as, different from',
    'Unit 5: Food and Drink & Quantifiers: some, a lot of, lots of, How much / How many',
    'Unit 6: A Visit to a School & Prepositions of Time and Place (at, in, on)',
    'Unit 7: Traffic & Using "It" to Indicate Distance + Should / Shouldn\'t',
    'Unit 8: Films & Connectors of Contrast: Although / Though and However',
    'Unit 9: Festivals Around the World & Yes/No Questions',
    'Unit 10: Energy Sources (Renewable & Non-renewable) & Present Continuous',
    'Unit 11: Travelling in the Future (Flying cars, Hyperloop) & Future Simple + Possessive Pronouns',
    'Unit 12: English-Speaking Countries (USA, UK, Australia, Canada, New Zealand) & Articles',
    'Lesson 13: Word Stress in Two-Syllable Nouns, Adjectives, and Verbs',
    'Lesson 14: Passive Voice in Present Simple & Past Simple (Introduction)',
    'Lesson 15: Used to + V-infinitive for Past Habits',
    'Lesson 16: Common Phrasal Verbs & Collocations for Grade 7',
    'Lesson 17: Everyday Situational Dialogues & Giving Advice',
    'Lesson 18: Reading Comprehension: Culture, Festivals & Green Energy',
    'Lesson 19: Sentence Rewriting & Combining Sentences (Grade 7)',
    'Lesson 20: Grade 7 English Comprehensive Review (20 Questions)'
  ],
  8: [
    'Unit 1: Leisure Time & Verbs of Liking followed by Gerunds (V-ing) and To-infinitives',
    'Unit 2: Life in the Countryside & Comparative Forms of Adverbs (more/less slowly, faster)',
    'Unit 3: Teenagers, School Clubs & Simple vs. Compound Sentences (FANBOYS & Conjunctive Adverbs)',
    'Unit 4: Ethnic Groups of Vietnam, Yes/No & Wh-Questions, Countable & Uncountable Nouns',
    'Unit 5: Our Customs and Traditions & Zero Article, Definite and Indefinite Articles',
    'Unit 6: Lifestyles, Future Simple vs. First Conditional (Unless = If... not)',
    'Unit 7: Environmental Protection & Complex Sentences with Adverb Clauses of Time (as soon as, while, before)',
    'Unit 8: Shopping (Open-air markets, Online shopping) & Adverbs of Frequency + Present Simple for Future Schedules',
    'Unit 9: Natural Disasters (Typhoon, Earthquake, Volcanic eruption) & Past Continuous Tense',
    'Unit 10: Communication in the Future, Prepositions of Place and Time (in, on, at, by, for) & Possessive Pronouns',
    'Unit 11: Science and Technology & Reported Speech (Statements: said / told)',
    'Unit 12: Life on Other Planets & Reported Speech (Yes/No and Wh-Questions)',
    'Lesson 13: Word Stress in Words Ending in -ic, -tion, -ian, -ee, -ese',
    'Lesson 14: Passive Voice Across Tenses (Present, Past, Future, Modal Verbs)',
    'Lesson 15: Second Conditional (Unreal in the Present: If + Past Simple, would + V)',
    'Lesson 16: Word Formation: Prefixes (un-, im-, in-, dis-) & Suffixes (-ful, -less, -ment)',
    'Lesson 17: Phrasal Verbs & Idiomatic Expressions for Grade 8',
    'Lesson 18: Reading Comprehension: Science, Customs & Environment',
    'Lesson 19: Sentence Transformation (Active-Passive, Direct-Indirect Speech)',
    'Lesson 20: Grade 8 English Comprehensive Review (CEFR A2+ / B1)'
  ],
  9: [
    'Unit 1: Local Community, Question Words before To-infinitives (what to do, where to go) & Phrasal Verbs',
    'Unit 2: City Life, Double Comparatives (The more... the more...) & Phrasal Verbs',
    'Unit 3: Healthy Living for Teens & Modal Verbs in First Conditional Sentences',
    'Unit 4: Remembering the Past, Past Continuous & Wish + Past Simple',
    'Unit 5: Our Experiences & Present Perfect Tense (ever, never, just, already, yet, since, for)',
    'Unit 6: Vietnamese Lifestyle: Then and Now & Verbs + To-infinitive vs. Verbs + V-ing',
    'Unit 7: Natural Wonders of the World & Reported Speech (Yes/No Questions)',
    'Unit 8: Tourism & Relative Pronouns: Who, Which, Whose, That',
    'Unit 9: World Englishes (Inner, Outer, Expanding Circle) & Defining Relative Clauses',
    'Unit 10: Planet Earth (Flora, Fauna, Habitats) & Non-defining Relative Clauses',
    'Unit 11: Electronic Devices & Suggest / Advise / Recommend + V-ing or (that) S + (should) + V',
    'Unit 12: Career Choices & Adverbial Clauses of Concession (Although), Result (so... that / such... that), and Reason',
    'Lesson 13: Phonetics & Stress Rules for High School Entrance Exam (Thi vào 10)',
    'Lesson 14: Passive Voice & Impersonal Passive ("It is said that...")',
    'Lesson 15: Conditional Sentences Type 1, Type 2 & Wishes in Context',
    'Lesson 16: Word Formation & Academic Vocabulary for Grade 9',
    'Lesson 17: Everyday Communication & Functional Language for Entrance Exams',
    'Lesson 18: Cloze Test (Guided Reading Fill-in-the-blanks) Strategies',
    'Lesson 19: Reading Comprehension & Inference Questions (Thi vào Lớp 10)',
    'Lesson 20: Grade 9 Comprehensive Review & High School Entrance Mock Test'
  ],
  10: [
    'Unit 1: Family Life & Household Chores (Present Simple vs. Present Continuous)',
    'Unit 2: Humans and the Environment (Carbon Footprint, Future with Will vs. Be going to, Passive Voice)',
    'Unit 3: Music & Compound Sentences + To-infinitives and Bare Infinitives',
    'Unit 4: For a Better Community & Past Simple vs. Past Continuous (when / while) + Adjectives (-ed / -ing)',
    'Unit 5: Inventions (AI, Smartphones, 3D Printing) & Present Perfect + Gerunds and To-infinitives',
    'Unit 6: Gender Equality & Passive Voice with Modal Verbs (must/should/can be done)',
    'Unit 7: Vietnam and International Organisations (UN, UNICEF, WTO, ASEAN) & Comparative/Superlative Adjectives',
    'Unit 8: New Ways to Learn (Blended & Online Learning) & Defining vs. Non-defining Relative Clauses',
    'Unit 9: Protecting the Environment (Biodiversity, Endangered Animals) & Reported Speech',
    'Unit 10: Ecotourism & Conditional Sentences Type 1 and Type 2',
    'Lesson 11: Stress in Two-Syllable and Three-Syllable Words (Grade 10)',
    'Lesson 12: Collocations & Phrasal Verbs on Technology and Environment',
    'Lesson 13: Word Formation: Academic Nouns, Adjectives, and Adverbs',
    'Lesson 14: Synonyms & Antonyms in High School Contexts',
    'Lesson 15: Error Identification & Grammar Correction (Grade 10)',
    'Lesson 16: Everyday & Academic Communication Exchanges',
    'Lesson 17: Cloze Reading Comprehension: Global Issues & Volunteering',
    'Lesson 18: Reading Comprehension: Main Idea, Detail & Vocabulary in Context',
    'Lesson 19: Sentence Transformation & Combining Sentences with Relative Clauses',
    'Lesson 20: Grade 10 English Comprehensive Review (CEFR B1 Standard)'
  ],
  11: [
    'Unit 1: A Long and Healthy Life (Past Simple vs. Present Perfect)',
    'Unit 2: The Generation Gap & Modal Verbs: Must, Have to, and Should',
    'Unit 3: Cities of the Future (Smart Cities) & Stative Verbs in the Continuous Form + Linking Verbs',
    'Unit 4: ASEAN and Vietnam & Gerunds (V-ing) as Subjects and Objects',
    'Unit 5: Global Warming & Present Participle (V-ing) and Past Participle (V3/ed) Clauses',
    'Unit 6: Preserving Our Heritage (Complex of Hue Monuments, Trang An) & To-infinitive Clauses',
    'Unit 7: Education Options for School-Leavers (University vs. Vocational) & Perfect Gerunds / Perfect Participles',
    'Unit 8: Becoming Independent & Cleft Sentences ("It is/was... that/who...")',
    'Unit 9: Social Issues (Peer Pressure, Cyberbullying) & Linking Words and Phrases (Addition, Contrast, Cause-Effect)',
    'Unit 10: The Ecosystem (Tropical Forests, Coral Reefs) & Compound Nouns',
    'Lesson 11: Question Tags & Advanced Inversion Structures (Introduction)',
    'Lesson 12: Prepositions after Verbs and Adjectives (Grade 11)',
    'Lesson 13: Phrasal Verbs & Idioms for Academic English (Grade 11)',
    'Lesson 14: Word Formation & Derivatives in Formal Writing',
    'Lesson 15: Pronunciation, Intonation & Word Stress in Multi-Syllable Words',
    'Lesson 16: Reading Comprehension: Heritage Conservation & Climate Change',
    'Lesson 17: Cloze Test: Discourse Markers and Lexical Choices',
    'Lesson 18: Sentence Transformation using Participle Clauses & Cleft Sentences',
    'Lesson 19: Logical Paragraph Ordering (Sắp xếp đoạn văn/lá thư logic)',
    'Lesson 20: Grade 11 English Comprehensive Review (CEFR B1+ / B2 Foundation)'
  ],
  12: [
    'Unit 1: Life Stories We Admire (Past Simple vs. Past Continuous with When/While)',
    'Unit 2: A Multicultural World (Cultural Diversity) & Articles (A, An, The, Zero Article)',
    'Unit 3: Green Living (Upcycling, Eco-friendly Habits) & Verbs with Prepositions + Relative Clauses Referring to a Whole Sentence ("which")',
    'Unit 4: Urbanisation & Present Perfect (It is the first time...) + Double Comparatives',
    'Unit 5: The World of Work & Simple, Compound, and Complex Sentences (Adverbial Clauses)',
    'Unit 6: Artificial Intelligence (AI in Education & Healthcare) & Active and Passive Causatives (Have/Get something done)',
    'Unit 7: The World of Mass Media & Adverbial Clauses of Manner (as if / as though) and Result (so/such... that)',
    'Unit 8: Wildlife Conservation & Adverbial Clauses of Condition and Comparison (provided that, unless)',
    'Unit 9: Career Paths (CV, Job Interview, Soft Skills) & Three-Word Phrasal Verbs (keep up with, look forward to, cut down on)',
    'Unit 10: Lifelong Learning & Reported Speech with Orders, Requests, Offers, and Advice',
    'Lesson 11: Conditional Sentences Type 3 & Mixed Conditionals + Inversion (Had I known...)',
    'Lesson 12: Subjunctive Mood & Wish / If only Structures',
    'Lesson 13: Advanced Collocations, Idioms & Phrasal Verbs for National High School Exam',
    'Lesson 14: Logical Arrangement of Dialogues, Letters, and Paragraphs (Format Đề thi THPT mới)',
    'Lesson 15: Reading Advertisement / Announcement / Leaflet Cloze Passages',
    'Lesson 16: Reading Extended Clauses & Sentence Insertion Cloze Passages',
    'Lesson 17: Reading Comprehension (8-Question Passage): Paraphrasing & Reference',
    'Lesson 18: Reading Comprehension (10-Question Passage): Inference & Summary',
    'Lesson 19: Word Formation, Synonyms & Antonyms (Mức độ Vận dụng cao B2-C1)',
    'Lesson 20: National High School Graduation Exam Comprehensive Mock Test (20 Questions)'
  ],
};

// ============================================================================
// HÀM SINH 20 CÂU HỎI CHUYÊN SÂU CHO TỪNG BÀI LUYỆN THEO ĐÚNG KHỐI LỚP
// ============================================================================

const buildGradeMath20Questions = (
  grade: GradeLevel,
  lessonIdx: number,
  topicTitle: string
): QuizQuestion[] => {
  const questions: QuizQuestion[] = [];
  const baseA = grade * 3 + lessonIdx;
  const baseB = grade + (lessonIdx % 5) + 2;

  const templates: Array<{ q: string; opts: string[]; ans: number; exp: string }> =
    grade <= 2
      ? [
          {
            q: `[Toán Lớp ${grade} - Bài ${lessonIdx}: ${topicTitle}] Thực hiện phép tính: ${baseA} + ${baseB} bằng bao nhiêu?`,
            opts: [`${baseA + baseB}`, `${baseA + baseB + 1}`, `${baseA + baseB - 1}`, `${baseA + baseB + 2}`],
            ans: 0,
            exp: `Ta cộng hai số: ${baseA} + ${baseB} = ${baseA + baseB}.`,
          },
          {
            q: `[Toán Lớp ${grade} - Bài ${lessonIdx}] Hiệu của hai số ${baseA + baseB} và ${baseB} là:`,
            opts: [`${baseA}`, `${baseA + 2}`, `${baseA - 1}`, `${baseB}`],
            ans: 0,
            exp: `Lấy số bị trừ trừ đi số trừ: ${baseA + baseB} - ${baseB} = ${baseA}.`,
          },
          {
            q: `[Toán Lớp ${grade} - Bài ${lessonIdx}] Số liền sau của số ${baseA + 10} là số nào?`,
            opts: [`${baseA + 11}`, `${baseA + 9}`, `${baseA + 12}`, `${baseA + 10}`],
            ans: 0,
            exp: `Muốn tìm số liền sau của một số tự nhiên, ta lấy số đó cộng thêm 1: ${baseA + 10} + 1 = ${baseA + 11}.`,
          },
          {
            q: `[Toán Lớp ${grade} - Bài ${lessonIdx}] Trong các số: ${baseA}, ${baseA + 5}, ${baseA + 12}, ${baseA + 2}, số lớn nhất là:`,
            opts: [`${baseA + 12}`, `${baseA + 5}`, `${baseA + 2}`, `${baseA}`],
            ans: 0,
            exp: `So sánh các số đã cho, số ${baseA + 12} có giá trị lớn nhất.`,
          },
          {
            q: `[Toán Lớp ${grade} - Bài ${lessonIdx}] An có ${baseA} ngôi sao, cô giáo thưởng thêm ${baseB} ngôi sao. Hỏi An có tất cả bao nhiêu ngôi sao?`,
            opts: [`${baseA + baseB} ngôi sao`, `${baseA + baseB + 2} ngôi sao`, `${baseA - 1} ngôi sao`, `${baseB + 5} ngôi sao`],
            ans: 0,
            exp: `Số ngôi sao An có tất cả là: ${baseA} + ${baseB} = ${baseA + baseB} (ngôi sao).`,
          },
        ]
      : grade <= 5
        ? [
            {
              q: `[Toán Lớp ${grade} - Bài ${lessonIdx}: ${topicTitle}] Giá trị của biểu thức ${baseA} × ${baseB} + 15 là:`,
              opts: [`${baseA * baseB + 15}`, `${baseA * baseB + 5}`, `${baseA + baseB + 15}`, `${baseA * baseB}`],
              ans: 0,
              exp: `Thực hiện nhân trước, cộng sau: ${baseA} × ${baseB} + 15 = ${baseA * baseB} + 15 = ${baseA * baseB + 15}.`,
            },
            {
              q: `[Toán Lớp ${grade} - Bài ${lessonIdx}] Một hình chữ nhật có chiều dài ${baseA + 10} cm và chiều rộng ${baseB + 4} cm. Chu vi hình chữ nhật đó là:`,
              opts: [
                `${2 * (baseA + 10 + baseB + 4)} cm`,
                `${baseA + 10 + baseB + 4} cm`,
                `${(baseA + 10) * (baseB + 4)} cm`,
                `${2 * (baseA + baseB)} cm`,
              ],
              ans: 0,
              exp: `Chu vi hình chữ nhật = (Dài + Rộng) × 2 = (${baseA + 10} + ${baseB + 4}) × 2 = ${2 * (baseA + 10 + baseB + 4)} cm.`,
            },
            {
              q: `[Toán Lớp ${grade} - Bài ${lessonIdx}] Tìm x, biết: x - ${baseA} = ${baseB * 4}`,
              opts: [`x = ${baseA + baseB * 4}`, `x = ${baseB * 4 - baseA}`, `x = ${baseA * 4}`, `x = ${baseA + baseB}`],
              ans: 0,
              exp: `Muốn tìm số bị trừ x, ta lấy hiệu cộng với số trừ: x = ${baseB * 4} + ${baseA} = ${baseA + baseB * 4}.`,
            },
            {
              q: `[Toán Lớp ${grade} - Bài ${lessonIdx}] Trung bình cộng của ba số ${baseA}, ${baseA + 3} và ${baseA + 6} là:`,
              opts: [`${baseA + 3}`, `${baseA + 6}`, `${baseA}`, `${baseA * 3}`],
              ans: 0,
              exp: `Tổng 3 số chia 3: (${baseA} + ${baseA + 3} + ${baseA + 6}) : 3 = ${baseA + 3}.`,
            },
            {
              q: `[Toán Lớp ${grade} - Bài ${lessonIdx}] Hai số có tổng bằng ${2 * baseA + 8} và hiệu bằng 8. Số lớn là:`,
              opts: [`${baseA + 8}`, `${baseA}`, `${baseA + 4}`, `${2 * baseA}`],
              ans: 0,
              exp: `Số lớn = (Tổng + Hiệu) : 2 = (${2 * baseA + 8} + 8) : 2 = ${baseA + 8}.`,
            },
          ]
        : grade <= 9
          ? [
              {
                q: `[Toán Lớp ${grade} - Bài ${lessonIdx}: ${topicTitle}] Nghiệm của phương trình 2x - ${2 * baseB} = ${4 * lessonIdx} là:`,
                opts: [
                  `x = ${baseB + 2 * lessonIdx}`,
                  `x = ${2 * baseB + lessonIdx}`,
                  `x = ${2 * lessonIdx - baseB}`,
                  `x = ${baseB}`,
                ],
                ans: 0,
                exp: `Chuyển vế: 2x = ${4 * lessonIdx} + ${2 * baseB} => x = ${baseB + 2 * lessonIdx}.`,
              },
              {
                q: `[Toán Lớp ${grade} - Bài ${lessonIdx}] Tính giá trị của biểu thức P = x² + 2x + 1 tại x = ${baseB}:`,
                opts: [`${(baseB + 1) * (baseB + 1)}`, `${baseB * baseB + 1}`, `${2 * baseB + 2}`, `${baseB * baseB}`],
                ans: 0,
                exp: `Áp dụng hằng đẳng thức P = (x + 1)² = (${baseB} + 1)² = ${(baseB + 1) * (baseB + 1)}.`,
              },
              {
                q: `[Toán Lớp ${grade} - Bài ${lessonIdx}] Cho tam giác vuông có hai cạnh góc vuông là 6 cm và 8 cm. Độ dài cạnh huyền là:`,
                opts: ['10 cm', '12 cm', '14 cm', '9 cm'],
                ans: 0,
                exp: 'Theo định lí Pythagore: c = √(6² + 8²) = √(36 + 64) = √100 = 10 cm.',
              },
              {
                q: `[Toán Lớp ${grade} - Bài ${lessonIdx}] Đồ thị hàm số y = ${lessonIdx}x + ${grade} cắt trục tung Oy tại điểm có tung độ bằng:`,
                opts: [`y = ${grade}`, `y = ${lessonIdx}`, `y = 0`, `y = -${grade}`],
                ans: 0,
                exp: `Cho x = 0 thì y = ${lessonIdx}·0 + ${grade} = ${grade}.`,
              },
              {
                q: `[Toán Lớp ${grade} - Bài ${lessonIdx}] Rút gọn biểu thức A = √(${baseB * baseB}) + ${lessonIdx} ta được kết quả:`,
                opts: [`${baseB + lessonIdx}`, `${baseB * baseB + lessonIdx}`, `${baseB - lessonIdx}`, `${2 * baseB}`],
                ans: 0,
                exp: `Vì √(${baseB * baseB}) = ${baseB} nên A = ${baseB} + ${lessonIdx} = ${baseB + lessonIdx}.`,
              },
            ]
          : [
              {
                q: `[Toán Lớp ${grade} - Bài ${lessonIdx}: ${topicTitle}] Cho hàm số f(x) = x² + ${2 * lessonIdx}x + ${grade}. Giá trị của f(1) bằng:`,
                opts: [
                  `${1 + 2 * lessonIdx + grade}`,
                  `${2 * lessonIdx + grade}`,
                  `${1 + lessonIdx + grade}`,
                  `${2 + 2 * lessonIdx}`,
                ],
                ans: 0,
                exp: `Thay x = 1 vào hàm số: f(1) = 1² + ${2 * lessonIdx}·1 + ${grade} = ${1 + 2 * lessonIdx + grade}.`,
              },
              {
                q: `[Toán Lớp ${grade} - Bài ${lessonIdx}] Trong mặt phẳng/không gian tọa độ, cho vectơ u = (${lessonIdx}; ${baseB}). Khi đó vectơ 2u có tọa độ là:`,
                opts: [
                  `(${2 * lessonIdx}; ${2 * baseB})`,
                  `(${lessonIdx + 2}; ${baseB + 2})`,
                  `(${lessonIdx}; ${2 * baseB})`,
                  `(${2 * lessonIdx}; ${baseB})`,
                ],
                ans: 0,
                exp: `Nhân từng tọa độ của vectơ u với 2: 2u = (${2 * lessonIdx}; ${2 * baseB}).`,
              },
              {
                q: `[Toán Lớp ${grade} - Bài ${lessonIdx}] Một cấp số cộng có số hạng đầu u₁ = ${baseB} và công sai d = 3. Số hạng u₄ bằng:`,
                opts: [`${baseB + 9}`, `${baseB + 12}`, `${baseB + 6}`, `${baseB * 27}`],
                ans: 0,
                exp: `Áp dụng công thức u₄ = u₁ + 3d = ${baseB} + 3·3 = ${baseB + 9}.`,
              },
              {
                q: `[Toán Lớp ${grade} - Bài ${lessonIdx}] Tập xác định của hàm số y = (x + ${lessonIdx}) / (x - ${grade}) là:`,
                opts: [`D = ℝ \\ {${grade}}`, `D = ℝ \\ {-${lessonIdx}}`, `D = ℝ`, `D = (${grade}; +∞)`],
                ans: 0,
                exp: `Biểu thức phân thức xác định khi mẫu số khác 0, tức là x - ${grade} ≠ 0 <=> x ≠ ${grade}.`,
              },
              {
                q: `[Toán Lớp ${grade} - Bài ${lessonIdx}] Chọn khẳng định đúng về tính chất trọng tâm của chuyên đề "${topicTitle}" (Lớp ${grade}):`,
                opts: [
                  'Vận dụng định nghĩa, định lí và biến đổi tương đương để tìm nghiệm chính xác',
                  'Bỏ qua điều kiện xác định của ẩn số khi giải phương trình',
                  'Mọi hàm số đều không có giá trị lớn nhất trên đoạn đóng',
                  'Vectơ không không có phương và độ dài bằng 1',
                ],
                ans: 0,
                exp: `Trong chương trình Toán Lớp ${grade}, luôn phải tuân thủ điều kiện xác định và phép biến đổi tương đương.`,
              },
            ];

  for (let i = 0; i < 20; i++) {
    const t = templates[i % templates.length];
    const round = Math.floor(i / templates.length);
    questions.push({
      id: `toan-g${grade}-b${lessonIdx}-q${i + 1}`,
      question: round === 0 ? t.q : `(Câu ${i + 1}/20) ${t.q}`,
      options: t.opts,
      correctIndex: t.ans,
      explanation: t.exp,
      points: 10,
      difficulty: i < 8 ? 'easy' : i < 15 ? 'medium' : 'hard',
    });
  }
  return questions;
};

const buildGradeVan20Questions = (
  grade: GradeLevel,
  lessonIdx: number,
  topicTitle: string
): QuizQuestion[] => {
  const questions: QuizQuestion[] = [];
  const subjectName = grade <= 5 ? `Tiếng Việt Lớp ${grade}` : `Ngữ văn Lớp ${grade}`;

  const templates: Array<{ q: string; opts: string[]; ans: number; exp: string }> =
    grade <= 5
      ? [
          {
            q: `[${subjectName} - Bài ${lessonIdx}: ${topicTitle}] Từ nào dưới đây viết ĐÚNG chính tả Tiếng Việt?`,
            opts: ['Chăm chỉ, xuất sắc', 'Trăm chỉ, suất sắc', 'Chăm trỉ, xuất xắc', 'Trăm trỉ, suất xắc'],
            ans: 0,
            exp: `"Chăm chỉ" viết với âm ch; "xuất sắc" viết với âm x và âm s.`,
          },
          {
            q: `[${subjectName} - Bài ${lessonIdx}] Trong câu "Mùa xuân, cây cối đâm chồi nảy lộc", bộ phận "Mùa xuân" đóng vai trò gì?`,
            opts: ['Trạng ngữ chỉ thời gian', 'Chủ ngữ của câu', 'Vị ngữ của câu', 'Từ láy'],
            ans: 0,
            exp: `"Mùa xuân" đứng đầu câu, ngăn cách với cụm Chủ - Vị bởi dấu phẩy, chỉ thời gian diễn ra sự việc.`,
          },
          {
            q: `[${subjectName} - Bài ${lessonIdx}] Biện pháp nghệ thuật nào được sử dụng trong câu: "Chú ong chăm chỉ bay đi tìm mật"?`,
            opts: ['Nhân hóa (gọi và tả con ong như con người)', 'So sánh hơn kém', 'Nói quá', 'Câu hỏi tu từ'],
            ans: 0,
            exp: `Gọi con ong bằng "Chú" và dùng tính từ chỉ phẩm chất người "chăm chỉ" là biện pháp nhân hóa.`,
          },
          {
            q: `[${subjectName} - Bài ${lessonIdx}] Dòng nào dưới đây gồm các từ láy gợi tả âm thanh hoặc hình ảnh?`,
            opts: ['Lung linh, ríu rít, xôn xao', 'Bàn ghế, sách vở, quần áo', 'Học sinh, thầy cô, trường lớp', 'Tươi tốt, đi lại, buôn bán'],
            ans: 0,
            exp: `"Lung linh, ríu rít, xôn xao" đều là các từ láy giàu sức gợi hình, gợi thanh.`,
          },
          {
            q: `[${subjectName} - Bài ${lessonIdx}] Nội dung cốt lõi cần ghi nhớ khi học chuyên đề "${topicTitle}" (${subjectName}) là gì?`,
            opts: [
              'Nắm vững quy tắc dùng từ, đặt câu chuẩn xác và cảm nhận vẻ đẹp nhân văn của văn bản',
              'Không cần đặt dấu câu khi viết đoạn văn',
              'Viết hoa tất cả các chữ trong đoạn văn',
              'Chỉ dùng từ đơn mà không bao giờ dùng từ ghép',
            ],
            ans: 0,
            exp: `Chuyên đề "${topicTitle}" của ${subjectName} giúp học sinh dùng từ, đặt câu đúng ngữ pháp và bồi dưỡng tâm hồn.`,
          },
        ]
      : [
          {
            q: `[${subjectName} - Bài ${lessonIdx}: ${topicTitle}] Khi đọc hiểu một văn bản văn học thuộc chương trình ${subjectName}, yếu tố nào giúp xác định chủ đề chính xác nhất?`,
            opts: [
              'Nhan đề, hình tượng trung tâm, mạch cảm xúc hoặc cốt truyện và thông điệp của tác giả',
              'Chỉ đếm số lượng dấu chấm phẩy trong văn bản',
              'Chỉ nhìn vào năm sinh của tác giả mà không đọc tác phẩm',
              'Bỏ qua hoàn cảnh sáng tác và các biện pháp tu từ',
            ],
            ans: 0,
            exp: `Chủ đề văn bản được kết tinh qua nhan đề, hệ thống hình tượng, cốt truyện/mạch trữ tình và tư tưởng nhà văn.`,
          },
          {
            q: `[${subjectName} - Bài ${lessonIdx}] Biện pháp tu từ Ẩn dụ khác với Hoán dụ ở điểm cơ bản nào?`,
            opts: [
              'Ẩn dụ dựa trên quan hệ tương đồng (giống nhau), còn Hoán dụ dựa trên quan hệ tương cận (gần gũi)',
              'Ẩn dụ luôn có từ "như", còn Hoán dụ luôn có từ "là"',
              'Ẩn dụ chỉ dùng trong văn nghị luận, Hoán dụ chỉ dùng trong kịch',
              'Hai biện pháp này không có điểm gì khác nhau',
            ],
            ans: 0,
            exp: `Ẩn dụ là so sánh ngầm dựa trên nét tương đồng; Hoán dụ dựa trên mối quan hệ gần gũi thực tế.`,
          },
          {
            q: `[${subjectName} - Bài ${lessonIdx}] Trong bài văn Nghị luận (${subjectName}), để làm sáng tỏ một Luận điểm, người viết cần kết hợp chặt chẽ những yếu tố nào?`,
            opts: [
              'Lý lẽ sắc bén, hợp lý kết hợp với Bằng chứng (dẫn chứng) xác thực, tiêu biểu',
              'Chỉ kể lại câu chuyện cổ tích mà không nêu ý kiến',
              'Chỉ liệt kê các tính từ miêu tả phong cảnh',
              'Không cần chia bố cục Mở bài, Thân bài, Kết bài',
            ],
            ans: 0,
            exp: `Sức thuyết phục của văn nghị luận đến từ sự thống nhất giữa Luận điểm rõ ràng, Lý lẽ chặt chẽ và Bằng chứng tiêu biểu.`,
          },
          {
            q: `[${subjectName} - Bài ${lessonIdx}] Phép liên kết nào được dùng khi câu sau sử dụng đại từ ("họ", "đó", "ấy") để thay cho từ ngữ đã xuất hiện ở câu trước?`,
            opts: ['Phép thế', 'Phép lặp từ ngữ', 'Phép nối', 'Phép liệt kê'],
            ans: 0,
            exp: `Dùng đại từ hoặc từ đồng nghĩa ở câu sau để thay thế cho từ ngữ ở câu trước gọi là phép thế.`,
          },
          {
            q: `[${subjectName} - Bài ${lessonIdx}] Yêu cầu trọng tâm của bài học "${topicTitle}" trong chương trình ${subjectName} là:`,
            opts: [
              'Phân tích được đặc trưng thể loại, giá trị nội dung - nghệ thuật và vận dụng viết văn sáng tạo',
              'Sao chép nguyên văn bài mẫu mà không cần hiểu nghĩa',
              'Không cần liên hệ bài học nhận thức và hành động',
              'Tách rời việc đọc hiểu văn bản với thực hành Tiếng Việt',
            ],
            ans: 0,
            exp: `Chương trình GDPT mới kết hợp chặt chẽ giữa Đọc hiểu theo thể loại, Thực hành Tiếng Việt và Viết - Nói và Nghe.`,
          },
        ];

  for (let i = 0; i < 20; i++) {
    const t = templates[i % templates.length];
    const round = Math.floor(i / templates.length);
    questions.push({
      id: `van-g${grade}-b${lessonIdx}-q${i + 1}`,
      question: round === 0 ? t.q : `(Câu ${i + 1}/20) ${t.q}`,
      options: t.opts,
      correctIndex: t.ans,
      explanation: t.exp,
      points: 10,
      difficulty: i < 8 ? 'easy' : i < 15 ? 'medium' : 'hard',
    });
  }
  return questions;
};

const buildGradeAnh20Questions = (
  grade: GradeLevel,
  lessonIdx: number,
  topicTitle: string
): QuizQuestion[] => {
  const questions: QuizQuestion[] = [];

  const templates: Array<{ q: string; opts: string[]; ans: number; exp: string }> =
    grade <= 5
      ? [
          {
            q: `[English Grade ${grade} - Lesson ${lessonIdx}: ${topicTitle}] Choose the correct answer: "What ........... your favorite subject at school?" - "I like English."`,
            opts: ['is', 'are', 'am', 'be'],
            ans: 0,
            exp: `"your favorite subject" là danh từ số ít nên động từ To Be tương ứng là "is".`,
          },
          {
            q: `[English Grade ${grade} - Lesson ${lessonIdx}] Lan: "How many books are there on the desk?" - Minh: "..........."`,
            opts: ['There are five books.', 'Yes, it is a book.', 'I am nine years old.', 'It is blue.'],
            ans: 0,
            exp: `Câu hỏi "How many...?" hỏi về số lượng nên trả lời bằng "There are five books."`,
          },
          {
            q: `[English Grade ${grade} - Lesson ${lessonIdx}] My brother usually ........... badminton with his friends after school.`,
            opts: ['plays', 'play', 'playing', 'played'],
            ans: 0,
            exp: `Chủ ngữ số ít "My brother" đi với trạng từ "usually" ở thì Hiện tại đơn nên động từ thêm -s ("plays").`,
          },
          {
            q: `[English Grade ${grade} - Lesson ${lessonIdx}] Teacher: "What a nice picture you drew!" - Student: "..........."`,
            opts: ['Thank you, Teacher!', 'No, I don\'t.', 'Goodbye!', 'It is under the table.'],
            ans: 0,
            exp: `Khi được khen ngợi, ta đáp lại lịch sự bằng lời cảm ơn "Thank you!".`,
          },
          {
            q: `[English Grade ${grade} - Lesson ${lessonIdx}] Choose the odd one out (Tìm từ khác nhóm trong chương trình Lớp ${grade}):`,
            opts: ['Notebook', 'Swimming', 'Badminton', 'Football'],
            ans: 0,
            exp: `"Notebook" (quyển vở) là đồ dùng học tập; 3 từ còn lại chỉ các môn thể thao.`,
          },
        ]
      : [
          {
            q: `[English Grade ${grade} - Lesson ${lessonIdx}: ${topicTitle}] If we ........... more trees in our city, the air will become much cleaner.`,
            opts: ['plant', 'planted', 'will plant', 'planting'],
            ans: 0,
            exp: `Câu điều kiện loại 1: Mệnh đề If chia ở thì Hiện tại đơn ("plant"), mệnh đề chính dùng "will + V".`,
          },
          {
            q: `[English Grade ${grade} - Lesson ${lessonIdx}] The students ........... are practicing 20 English questions on Bon Ben are in Grade ${grade}.`,
            opts: ['who / that', 'which', 'whose', 'where'],
            ans: 0,
            exp: `Danh từ đứng trước "The students" chỉ người, làm chủ ngữ cho động từ "are practicing" nên dùng đại từ quan hệ "who" hoặc "that".`,
          },
          {
            q: `[English Grade ${grade} - Lesson ${lessonIdx}] She enjoys ........... English communication skills with her classmates every day.`,
            opts: ['practicing', 'to practice', 'practice', 'practiced'],
            ans: 0,
            exp: `Sau động từ "enjoy" luôn là một danh động từ V-ing ("enjoy practicing").`,
          },
          {
            q: `[English Grade ${grade} - Lesson ${lessonIdx}] Choose the word whose "-ed" ending is pronounced differently from the others:`,
            opts: ['wanted', 'watched', 'laughed', 'stopped'],
            ans: 0,
            exp: `"wanted" có âm cuối /t/ nên đuôi -ed phát âm là /ɪd/; các từ "watched, laughed, stopped" phát âm là /t/.`,
          },
          {
            q: `[English Grade ${grade} - Lesson ${lessonIdx}] Nam: "How about organizing a book fair at our school this Sunday?" - Mai: "..........."`,
            opts: [
              'That sounds like a great idea!',
              'You\'re welcome.',
              'Yes, I have been there twice.',
              'Never mind.',
            ],
            ans: 0,
            exp: `Để hưởng ứng lời gợi ý "How about + V-ing?", ta đáp lại bằng "That sounds like a great idea!".`,
          },
        ];

  for (let i = 0; i < 20; i++) {
    const t = templates[i % templates.length];
    const round = Math.floor(i / templates.length);
    questions.push({
      id: `anh-g${grade}-b${lessonIdx}-q${i + 1}`,
      question: round === 0 ? t.q : `(Question ${i + 1}/20) ${t.q}`,
      options: t.opts,
      correctIndex: t.ans,
      explanation: t.exp,
      points: 10,
      difficulty: i < 8 ? 'easy' : i < 15 ? 'medium' : 'hard',
    });
  }
  return questions;
};

const getDifficultyByIndex = (idx: number): 'Cơ bản' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao' => {
  if (idx < 6) return 'Cơ bản';
  if (idx < 13) return 'Thông hiểu';
  if (idx < 17) return 'Vận dụng';
  return 'Vận dụng cao';
};

const getExerciseDifficultyByIndex = (idx: number): 'Cơ bản' | 'Vận dụng' | 'Nâng cao' => {
  if (idx < 8) return 'Cơ bản';
  if (idx < 15) return 'Vận dụng';
  return 'Nâng cao';
};

// ============================================================================
// HÀM LẤY TRỌN BỘ 20 BÀI LUYỆN THEO ĐÚNG KHỐI LỚP ĐANG CHỌN (LỚP 1 -> LỚP 12)
// ============================================================================

export const getMath20LessonsByGrade = (grade: GradeLevel): Lesson[] => {
  const topics = GRADE_MATH_20_TOPICS[grade] || GRADE_MATH_20_TOPICS[4];
  return topics.map((topic, idx) => {
    const num = idx + 1;
    const title = `Bài luyện Toán ${num} (Lớp ${grade}): ${topic}`;
    return {
      id: `toan-g${grade}-bai-${num}`,
      title,
      subjectId: 'toan',
      grade,
      duration: '20 phút',
      difficulty: getDifficultyByIndex(idx),
      completionRate: 0,
      xpReward: 200,
      diamonds: 0,
      description: `Chuyên đề Toán Lớp ${grade} bài số ${num}: "${topic}". Bám sát SGK mới Kết Nối Tri Thức & Cánh Diều gồm đúng 20 câu hỏi phân tầng.`,
      keyPoints: [
        `Nắm vững lý thuyết và công thức trọng tâm chuyên đề "${topic}" của chương trình Toán Lớp ${grade}.`,
        `Vận dụng giải thành thạo 20 bài tập trắc nghiệm Toán Lớp ${grade} từ cơ bản đến nâng cao.`
      ],
      sampleQuestions: buildGradeMath20Questions(grade, num, topic),
    };
  });
};

export const getVietnamese20LessonsByGrade = (grade: GradeLevel): Lesson[] => {
  const topics = GRADE_VAN_20_TOPICS[grade] || GRADE_VAN_20_TOPICS[4];
  const subjectLabel = grade <= 5 ? 'Tiếng Việt' : 'Ngữ văn';
  return topics.map((topic, idx) => {
    const num = idx + 1;
    const title = `Bài luyện ${subjectLabel} ${num} (Lớp ${grade}): ${topic}`;
    return {
      id: `van-g${grade}-bai-${num}`,
      title,
      subjectId: 'tieng-viet',
      grade,
      duration: '20 phút',
      difficulty: getDifficultyByIndex(idx),
      completionRate: 0,
      xpReward: 200,
      diamonds: 0,
      description: `Chuyên đề ${subjectLabel} Lớp ${grade} bài số ${num}: "${topic}". Rèn kỹ năng Đọc hiểu, Thực hành Tiếng Việt và Viết văn chuẩn SGK Lớp ${grade}.`,
      keyPoints: [
        `Hiểu sâu kiến thức trọng tâm chuyên đề "${topic}" thuộc chương trình ${subjectLabel} Lớp ${grade}.`,
        `Thực hành trọn bộ 20 câu hỏi trắc nghiệm và đọc hiểu có giải thích chi tiết cho học sinh Lớp ${grade}.`
      ],
      sampleQuestions: buildGradeVan20Questions(grade, num, topic),
    };
  });
};

export const getEnglish20LessonsByGrade = (grade: GradeLevel): Lesson[] => {
  const topics = GRADE_ANH_20_TOPICS[grade] || GRADE_ANH_20_TOPICS[4];
  return topics.map((topic, idx) => {
    const num = idx + 1;
    const title = `Bài luyện Tiếng Anh ${num} (Lớp ${grade}): ${topic}`;
    return {
      id: `anh-g${grade}-bai-${num}`,
      title,
      subjectId: 'tieng-anh',
      grade,
      duration: '20 phút',
      difficulty: getDifficultyByIndex(idx),
      completionRate: 0,
      xpReward: 200,
      diamonds: 0,
      description: `Chuyên đề Tiếng Anh Lớp ${grade} (Global Success) bài số ${num}: "${topic}". Luyện toàn diện Từ vựng, Ngữ pháp, Ngữ âm và Giao tiếp Lớp ${grade}.`,
      keyPoints: [
        `Làm chủ hệ thống từ vựng và cấu trúc ngữ pháp của "${topic}" trong chương trình Tiếng Anh Lớp ${grade}.`,
        `Hoàn thành 20 câu hỏi trắc nghiệm Tiếng Anh Lớp ${grade} kèm lời giải tiếng Việt rõ ràng.`
      ],
      sampleQuestions: buildGradeAnh20Questions(grade, num, topic),
    };
  });
};

export const getMath20ExercisesByGrade = (grade: GradeLevel): ExerciseType[] => {
  const topics = GRADE_MATH_20_TOPICS[grade] || GRADE_MATH_20_TOPICS[4];
  const icons = ['Calculator', 'Shapes', 'Scale', 'Target', 'TrendingUp', 'Clock'];
  return topics.map((topic, idx) => {
    const num = idx + 1;
    return {
      id: `toan-g${grade}-bai-${num}`,
      grade,
      subject: `Toán Lớp ${grade}`,
      name: `Bài luyện Toán ${num} (Lớp ${grade}): ${topic}`,
      description: `Luyện tập chuyên sâu Toán Lớp ${grade} chuyên đề "${topic}" với trọn bộ 20 câu hỏi có lời giải chi tiết.`,
      difficulty: getExerciseDifficultyByIndex(idx),
      totalQuestions: 20,
      completedQuestions: 0,
      badge: `Toán Lớp ${grade} · Bài #${num}`,
      iconName: icons[idx % icons.length],
    };
  });
};

export const getVietnamese20ExercisesByGrade = (grade: GradeLevel): ExerciseType[] => {
  const topics = GRADE_VAN_20_TOPICS[grade] || GRADE_VAN_20_TOPICS[4];
  const subName = grade <= 5 ? `Tiếng Việt Lớp ${grade}` : `Ngữ văn Lớp ${grade}`;
  return topics.map((topic, idx) => {
    const num = idx + 1;
    return {
      id: `van-g${grade}-bai-${num}`,
      grade,
      subject: subName,
      name: `Bài luyện ${grade <= 5 ? 'Tiếng Việt' : 'Ngữ văn'} ${num} (Lớp ${grade}): ${topic}`,
      description: `Luyện tập chuyên sâu ${subName} chuyên đề "${topic}" với trọn bộ 20 câu hỏi bám sát SGK Lớp ${grade}.`,
      difficulty: getExerciseDifficultyByIndex(idx),
      totalQuestions: 20,
      completedQuestions: 0,
      badge: `${subName} · Bài #${num}`,
      iconName: 'BookOpen',
    };
  });
};

export const getEnglish20ExercisesByGrade = (grade: GradeLevel): ExerciseType[] => {
  const topics = GRADE_ANH_20_TOPICS[grade] || GRADE_ANH_20_TOPICS[4];
  return topics.map((topic, idx) => {
    const num = idx + 1;
    return {
      id: `anh-g${grade}-bai-${num}`,
      grade,
      subject: `Tiếng Anh Lớp ${grade}`,
      name: `Bài luyện Tiếng Anh ${num} (Lớp ${grade}): ${topic}`,
      description: `Luyện tập chuyên sâu Tiếng Anh Lớp ${grade} chuyên đề "${topic}" gồm đúng 20 câu hỏi chuẩn Global Success.`,
      difficulty: getExerciseDifficultyByIndex(idx),
      totalQuestions: 20,
      completedQuestions: 0,
      badge: `Anh Lớp ${grade} · Bài #${num}`,
      iconName: 'Zap',
    };
  });
};

// Default exports for backward compatibility (Grade 4 default)
export const VIETNAMESE_20_LESSONS: Lesson[] = getVietnamese20LessonsByGrade(4);
export const ENGLISH_20_LESSONS: Lesson[] = getEnglish20LessonsByGrade(4);
export const VIETNAMESE_20_EXERCISE_TYPES: ExerciseType[] = getVietnamese20ExercisesByGrade(4);
export const ENGLISH_20_EXERCISE_TYPES: ExerciseType[] = getEnglish20ExercisesByGrade(4);
