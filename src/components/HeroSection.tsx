import React from 'react';
import {
  Sparkles,
  Award,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Users,
  BrainCircuit,
  Zap,
  GraduationCap,
  Layers,
  BookOpen,
  FileText
} from 'lucide-react';
import { GradeLevel, SiteConfig } from '../types';
import { HERO_IMAGE, MASCOT_IMAGE } from '../data/bonbenData';
import { AppPage } from './Header';

interface HeroSectionProps {
  currentGrade: GradeLevel;
  onSelectGrade: (grade: GradeLevel) => void;
  onOpenLesson: (lessonId?: string) => void;
  onNavigatePage: (page: AppPage) => void;
  userRole: 'student' | 'parent' | 'school';
  onSelectRole: (role: 'student' | 'parent' | 'school') => void;
  siteConfig?: SiteConfig;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentGrade,
  onSelectGrade,
  onOpenLesson,
  onNavigatePage,
  siteConfig,
}) => {
  const gradesList: GradeLevel[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const mainSections: {
    page: AppPage;
    badge: string;
    title: string;
    desc: string;
    btnText: string;
    icon: React.ReactNode;
    gradient: string;
  }[] = [
    {
      page: 'exercises',
      badge: `60 BÀI LUYỆN LỚP ${currentGrade}`,
      title: `Bài Luyện Chuyên Đề Lớp ${currentGrade}`,
      desc: `Trọn bộ 20 bài Văn, 20 bài Toán và 20 bài Tiếng Anh theo đúng khối Lớp ${currentGrade} (20 câu hỏi/bài).`,
      btnText: 'Vào trang Bài luyện',
      icon: <Layers className="w-6 h-6 text-sky-600" />,
      gradient: 'from-sky-500/10 to-blue-500/5 border-sky-200 hover:border-sky-400',
    },
    {
      page: 'courses',
      badge: `3 MÔN VĂN · TOÁN · ANH`,
      title: `Khóa Học Lớp ${currentGrade}`,
      desc: `Hệ thống khóa học chuyên sâu chuẩn SGK mới của Lớp ${currentGrade}, phân tách rõ từng môn Văn, Toán, Anh.`,
      btnText: 'Mở trang Khóa học',
      icon: <BookOpen className="w-6 h-6 text-blue-600" />,
      gradient: 'from-blue-500/10 to-indigo-500/5 border-blue-200 hover:border-blue-400',
    },
    {
      page: 'exam',
      badge: `ĐỀ THI 20 CÂU · 30 PHÚT`,
      title: `Phòng Thi & Kiểm Tra Lớp ${currentGrade}`,
      desc: `Làm đề thi khảo sát năng lực 20 câu hỏi các môn Văn, Toán, Anh Lớp ${currentGrade} có bấm giờ và chấm điểm tự động.`,
      btnText: 'Vào Phòng thi ngay',
      icon: <FileText className="w-6 h-6 text-amber-600" />,
      gradient: 'from-amber-500/10 to-orange-500/5 border-amber-200 hover:border-amber-400',
    },
    {
      page: 'pathway',
      badge: `THỐNG KÊ CHÍNH XÁC 100%`,
      title: `Chẩn Đoán Năng Lực AI`,
      desc: `Theo dõi chính xác từng bài đã làm (số câu đúng/sai) và các bài chưa làm (mặc định 0%) ở Lớp ${currentGrade}.`,
      btnText: 'Xem Chẩn đoán AI',
      icon: <BrainCircuit className="w-6 h-6 text-emerald-600" />,
      gradient: 'from-emerald-500/10 to-sky-500/5 border-emerald-200 hover:border-emerald-400',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-slate-50/50 pt-8 pb-14 sm:pt-10 sm:pb-16 border-b border-sky-100/70">
      {/* Delicate background blur elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-sky-200/30 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-blue-100/40 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tagline kicker */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-100/70 text-sky-800 border border-sky-200/60 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>
                {siteConfig?.heroBadgeText || 'CÔNG NGHỆ AI CHẨN ĐOÁN LỖ HỔNG KIẾN THỨC BON BEN'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18] text-balance">
              {siteConfig?.heroTitleLine1 || 'Học đúng trọng tâm,'} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-700">
                {siteConfig?.heroTitleHighlight || 'Bứt phá điểm số'}
              </span>{' '}
              {siteConfig?.heroTitleLine2 || 'cùng Lớp học Bon Ben'}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
              {siteConfig?.heroDescription ||
                'Nền tảng học trực tuyến thông minh chuẩn hóa 100% chương trình SGK mới của Bộ GD&ĐT. Mỗi khối lớp từ Lớp 1 đến Lớp 12 đều có riêng trọn bộ 20 bài luyện Toán, 20 bài luyện Văn và 20 bài luyện Tiếng Anh (20 câu/bài).'}
            </p>

            {/* Elegant Grade Quick Filter */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Chọn khối lớp đang học:</span>
                <span className="text-sky-700 font-bold">
                  Đang học: Lớp {currentGrade} (60 bài luyện riêng)
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {gradesList.map((g) => (
                  <button
                    key={g}
                    onClick={() => onSelectGrade(g)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      currentGrade === g
                        ? 'bg-sky-600 text-white shadow-sm scale-105'
                        : 'bg-white text-slate-700 hover:bg-sky-50 border border-slate-200 hover:border-sky-300'
                    }`}
                  >
                    Lớp {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigatePage('courses')}
                className="px-6 py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md shadow-sky-600/20 flex items-center gap-2 transition-transform hover:scale-[1.02] cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Mở Khóa Học Lớp {currentGrade}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigatePage('exercises')}
                className="px-5 py-3.5 bg-white hover:bg-sky-50 text-sky-900 border border-sky-200 hover:border-sky-400 font-bold text-sm sm:text-base rounded-2xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-sky-600" />
                <span>Vào Kho 60 Bài Luyện Lớp {currentGrade}</span>
              </button>

              <button
                onClick={() => onOpenLesson(`van-g${currentGrade}-bai-1`)}
                className="px-4 py-3.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-xs sm:text-sm rounded-2xl transition-all cursor-pointer"
              >
                Làm thử 3 bài đầu ngay
              </button>
            </div>

            {/* Checkpoints */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span>Bám sát SGK Kết Nối & Cánh Diều</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span>Kết nối trực tiếp Lớp học Giáo viên & Học sinh</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span>Đầy đủ 20 bài luyện Toán · Văn · Anh</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Classroom Photo Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-card-hover border-4 border-white bg-slate-900 group">
                <img
                  src={HERO_IMAGE}
                  alt="Lớp học thông minh Bon Ben"
                  className="w-full h-80 sm:h-96 object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center justify-between text-xs text-sky-200 mb-1">
                    <span className="flex items-center gap-1.5">
                      <BrainCircuit className="w-3.5 h-3.5 text-sky-400" />
                      Lớp học thông minh ứng dụng AI
                    </span>
                    <span className="bg-sky-500/80 px-2 py-0.5 rounded-full text-[11px] font-bold">
                      Lớp {currentGrade}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white">
                    Hơn 3.500.000 học sinh hào hứng học mỗi ngày
                  </p>
                </div>
              </div>

              {/* Floating AI Diagnostic Card */}
              <div className="absolute -top-4 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-sky-100 max-w-[250px] animate-in fade-in slide-in-from-left-4">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                    AI
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-800">Chẩn đoán thực tế</div>
                    <div className="text-[9px] text-sky-600">Chính xác theo bài đã làm</div>
                  </div>
                </div>
                <div className="text-xs font-bold text-slate-900">
                  Toán · Văn · Anh Lớp {currentGrade}:{' '}
                  <span className="text-sky-700 font-extrabold">Mặc định 0% khi chưa làm</span>
                </div>
                <div className="mt-1.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-sky-500 to-emerald-500 h-1.5 rounded-full w-0"></div>
                </div>
              </div>

              {/* Floating Mascot Greeting Card */}
              <div className="absolute -bottom-5 -right-3 sm:-right-5 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-sky-100 flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-sky-200">
                  <img
                    src={MASCOT_IMAGE}
                    alt="Bon Ben Mascot"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-bold text-sky-700 flex items-center gap-1">
                    <span>Bon Ben thân mến</span>
                    <span className="text-xs">👋</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    Cùng luyện 20 câu mỗi ngày, <br />
                    bứt phá điểm 10 trên lớp!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Page Navigation Hub (4 Separate Pages) */}
        <div className="mt-14 pt-8 border-t border-sky-100">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <span className="text-xs font-extrabold text-sky-700 uppercase tracking-wider">
                CHỌN CHUYÊN MỤC HỌC TẬP LỚP {currentGrade}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                Khám Phá Từng Trang Chuyên Biệt Của Lớp {currentGrade}
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Nhấn vào mục bất kỳ để mở trang riêng gọn gàng với đầy đủ 100% bài tập & đề thi
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mainSections.map((item) => (
              <div
                key={item.page}
                onClick={() => onNavigatePage(item.page)}
                className={`bg-gradient-to-br ${item.gradient} bg-white rounded-3xl p-5 border shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-white text-sky-900 border border-sky-100 shadow-2xs">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-extrabold text-sky-700 group-hover:text-sky-900">
                  <span>{item.btnText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4-Column Refined Trust Metrics */}
        <div className="mt-10 pt-8 border-t border-sky-100/70 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl p-4 border border-sky-100/70 shadow-soft flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
                3.500.000+
              </div>
              <div className="text-xs text-slate-500 font-medium">Học sinh toàn quốc tin dùng</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-sky-100/70 shadow-soft flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">98.2%</div>
              <div className="text-xs text-slate-500 font-medium">Tiến bộ rõ rệt sau 3 tháng</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-sky-100/70 shadow-soft flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
                150.000+
              </div>
              <div className="text-xs text-slate-500 font-medium">Câu hỏi AI cá nhân hóa</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-sky-100/70 shadow-soft flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
                1.200+
              </div>
              <div className="text-xs text-slate-500 font-medium">Chuyên đề Toán · Văn · Anh</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
