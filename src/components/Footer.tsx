import React from 'react';
import {
  Mail,
  MapPin,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { MASCOT_IMAGE } from '../data/bonbenData';
import { AppPage } from './Header';
import { SiteConfig } from '../types';

interface FooterProps {
  onNavigatePage?: (page: AppPage) => void;
  siteConfig?: SiteConfig;
}

export const Footer: React.FC<FooterProps> = ({ onNavigatePage, siteConfig }) => {
  const handleNav = (e: React.MouseEvent, page: AppPage) => {
    e.preventDefault();
    if (onNavigatePage) {
      onNavigatePage(page);
    }
  };

  return (
    <footer className="bg-sky-950 text-white pt-16 pb-12 border-t border-sky-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-sky-800/80">
          {/* Column 1 & 2: Brand & Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-sky-400 p-0.5 bg-sky-900">
                <img
                  src={MASCOT_IMAGE}
                  alt="Lớp học Bon Ben"
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight">
                  Lớp học <span className="text-sky-400">Bon Ben</span>
                </span>
                <p className="text-[11px] text-sky-300 font-medium">
                  HỆ SINH THÁI GIÁO DỤC TRỰC TUYẾN ỨNG DỤNG AI
                </p>
              </div>
            </div>

            <p className="text-xs text-sky-200 leading-relaxed max-w-sm">
              {siteConfig?.footerDescription ||
                'Nền tảng học tập trực tuyến thông minh hàng đầu dành cho học sinh phổ thông từ Lớp 1 đến Lớp 12, ứng dụng trí tuệ nhân tạo (AI) giúp tối ưu hóa lộ trình học Toán, Ngữ văn và Tiếng Anh.'}
            </p>

            <div className="space-y-2 text-xs text-sky-200 pt-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  Trụ sở chính: Tòa nhà Công nghệ Bon Ben, Phố Duy Tân, Quận Cầu Giấy, TP. Hà Nội
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  Hòm thư tiếp nhận:{' '}
                  <span className="text-white">
                    {siteConfig?.supportContactEmailDisplay || 'hotro@bonben.edu.vn'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Column 3: Fast Navigation */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">
              Khám phá các trang
            </h4>
            <ul className="space-y-2 text-xs text-sky-300">
              <li>
                <a
                  href="#exercises"
                  onClick={(e) => handleNav(e, 'exercises')}
                  className="hover:text-white transition-colors"
                >
                  20 Bài luyện Toán học SGK mới
                </a>
              </li>
              <li>
                <a
                  href="#exercises"
                  onClick={(e) => handleNav(e, 'exercises')}
                  className="hover:text-white transition-colors"
                >
                  20 Bài luyện Tiếng Việt & Ngữ văn
                </a>
              </li>
              <li>
                <a
                  href="#exercises"
                  onClick={(e) => handleNav(e, 'exercises')}
                  className="hover:text-white transition-colors"
                >
                  20 Bài luyện Tiếng Anh chuẩn CEFR
                </a>
              </li>
              <li>
                <a
                  href="#courses"
                  onClick={(e) => handleNav(e, 'courses')}
                  className="hover:text-white transition-colors"
                >
                  Khóa học chuyên đề 12 khối lớp
                </a>
              </li>
              <li>
                <a
                  href="#pathway"
                  onClick={(e) => handleNav(e, 'pathway')}
                  className="hover:text-white transition-colors"
                >
                  Bản đồ chẩn đoán năng lực AI
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Practice & Assessment */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">
              Luyện tập & Khảo thí
            </h4>
            <ul className="space-y-2 text-xs text-sky-300">
              <li>
                <a
                  href="#exam"
                  onClick={(e) => handleNav(e, 'exam')}
                  className="hover:text-white transition-colors"
                >
                  Trung tâm Đề thi Học kì (20 câu)
                </a>
              </li>
              <li>
                <a
                  href="#courses"
                  onClick={(e) => handleNav(e, 'courses')}
                  className="hover:text-white transition-colors"
                >
                  Kho bài luyện 12 khối lớp
                </a>
              </li>
              <li>
                <a
                  href="#home"
                  onClick={(e) => handleNav(e, 'home')}
                  className="hover:text-white transition-colors"
                >
                  Trang chủ Lớp học Bon Ben
                </a>
              </li>
              <li>
                <a
                  href="#pathway"
                  onClick={(e) => handleNav(e, 'pathway')}
                  className="hover:text-white transition-colors"
                >
                  Đánh giá năng lực chuẩn Bộ GD&ĐT
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: App Download & Certifications */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">
              Tải ứng dụng Bon Ben
            </h4>
            <p className="text-xs text-sky-300">
              Trải nghiệm học tập mượt mà trên điện thoại, máy tính bảng và Smart TV.
            </p>

            <div className="space-y-2">
              <div className="bg-sky-900/60 p-2.5 rounded-xl border border-sky-800 flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-sky-400" />
                <div>
                  <div className="text-[10px] text-sky-300 uppercase">Tải ngay trên</div>
                  <div className="text-xs font-bold text-white">App Store & Google Play</div>
                </div>
              </div>
            </div>

            {/* Certifications badges */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-700/60 px-3 py-1.5 rounded-xl text-[11px] text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Nội dung đã kiểm định bởi Bộ GD&ĐT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sky-400">
          <div>© 2026 Bản quyền thuộc về Lớp học Bon Ben. Mọi quyền được bảo lưu.</div>
          <div className="flex items-center gap-6">
            <a href="#home" onClick={(e) => handleNav(e, 'home')} className="hover:text-white">
              Điều khoản sử dụng
            </a>
            <a href="#home" onClick={(e) => handleNav(e, 'home')} className="hover:text-white">
              Chính sách bảo mật
            </a>
            <a href="#home" onClick={(e) => handleNav(e, 'home')} className="hover:text-white">
              Quy chế hoạt động
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
