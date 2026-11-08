import React from 'react';
import { Star } from 'lucide-react';

export const TestimonialsNews: React.FC = () => {
  const reviews = [
    {
      name: 'Chị Mai Lan',
      role: 'Phụ huynh bé Ben (Lớp 4, Hà Nội)',
      comment: 'Trước đây con rất ngại học Toán, mỗi tối ngồi kèm con là mẹ con căng thẳng. Từ khi học Lớp học Bon Ben với các bài giảng hoạt hình dễ hiểu và Đấu trường hàng tuần, con tự giác học đúng 30 phút mỗi ngày. Kỳ thi giữa kỳ vừa rồi con đạt điểm 10 trọn vẹn!',
      rating: 5,
    },
    {
      name: 'Thầy Trần Văn Tuấn',
      role: 'Giáo viên Toán trường Tiểu học Chu Văn An',
      comment: 'Hệ thống chẩn đoán năng lực của Bon Ben rất chính xác. Tôi có thể nắm được ngay em nào hổng phần phân số, em nào mạnh hình học để giao bài tập phân hóa phù hợp. Học sinh trong lớp cực kỳ hào hứng thi đấu trên Đấu trường toàn quốc.',
      rating: 5,
    },
    {
      name: 'Bé Bảo Ngọc',
      role: 'Học sinh Lớp 5, TP. Hồ Chí Minh',
      comment: 'Em thích nhất là kho 20 bài luyện Tiếng Anh và 20 bài luyện Ngữ văn trên Lớp học Bon Ben vì câu hỏi rất hay và có giải thích chi tiết. Nhờ luyện mỗi ngày mà em đã đạt danh hiệu Học sinh Xuất sắc học kỳ vừa qua!',
      rating: 5,
    }
  ];

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-sky-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full">
              CHIA SẺ TỪ HỌC SINH VÀ PHỤ HUYNH
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-sky-950 mt-2">
              Hơn 3.500.000 Gia Đình Tin Tưởng Lựa Chọn
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev, idx) => (
              <div 
                key={idx}
                className="bg-sky-50/50 rounded-3xl p-6 border border-sky-100 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-sky-100">
                  <h4 className="font-extrabold text-slate-900 text-sm">{rev.name}</h4>
                  <p className="text-xs text-sky-700 font-medium">{rev.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
