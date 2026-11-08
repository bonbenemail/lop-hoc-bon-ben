import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Menu,
  X,
  User,
  ChevronDown,
  Layers,
  FileText,
  LogOut,
  LogIn,
  HelpCircle,
  Mail,
  Home,
  BrainCircuit,
  ShieldCheck,
  Users
} from 'lucide-react';
import { GradeLevel, UserAccount, SiteConfig } from '../types';
import { MASCOT_IMAGE } from '../data/bonbenData';

export type AppPage =
  | 'home'
  | 'exercises'
  | 'courses'
  | 'exam'
  | 'pathway'
  | 'teacher-class'
  | 'admin-portal';

interface HeaderProps {
  currentGrade: GradeLevel;
  onSelectGrade: (grade: GradeLevel) => void;
  currentUser: UserAccount | null;
  activePage: AppPage;
  onNavigatePage: (page: AppPage) => void;
  onOpenExam: () => void;
  onOpenAuth: () => void;
  onOpenLesson: (lessonId?: string) => void;
  onOpenPortfolio: () => void;
  onOpenSupport: () => void;
  onLogout: () => void;
  userRole: 'student' | 'parent' | 'school';
  onSelectRole: (role: 'student' | 'parent' | 'school') => void;
  siteConfig?: SiteConfig;
}

const ADMIN_GMAIL_INTERNAL = 'bonbenemail@gmail.com';

export const Header: React.FC<HeaderProps> = ({
  currentGrade,
  onSelectGrade,
  currentUser,
  activePage,
  onNavigatePage,
  onOpenAuth,
  onOpenLesson,
  onOpenPortfolio,
  onOpenSupport,
  onLogout,
  siteConfig,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gradeDropdownOpen, setGradeDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const gradesList: GradeLevel[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const isAdminUser =
    currentUser?.role === 'admin' ||
    currentUser?.email?.toLowerCase() === ADMIN_GMAIL_INTERNAL;
  const isTeacherUser = currentUser?.role === 'teacher';

  const handleNavClick = (page: AppPage) => {
    setMobileMenuOpen(false);
    onNavigatePage(page);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md shadow-xs border-b border-sky-100">
      {/* Top Utility Bar with Prominent Support Button */}
      <div className="bg-sky-950 text-sky-200 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Announcement */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sky-300 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
              <span className="truncate">
                {siteConfig?.topBannerText ||
                  `Ngân hàng 20 bài luyện chuyên sâu mỗi môn Văn · Toán · Anh Lớp ${currentGrade}`}
              </span>
            </div>
          </div>

          {/* Right: Quick Links & Top Support Button (Never exposes personal Gmail) */}
          <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-sky-300 ml-auto shrink-0">
            {isAdminUser ? (
              <button
                onClick={() => handleNavClick('admin-portal')}
                className="hidden md:inline text-amber-300 hover:text-white transition-colors font-extrabold cursor-pointer"
              >
                🛡️ Trung tâm Quản trị & Sửa trực tiếp Trang web
              </button>
            ) : isTeacherUser ? (
              <button
                onClick={() => handleNavClick('teacher-class')}
                className="hidden md:inline text-indigo-300 hover:text-white transition-colors font-extrabold cursor-pointer"
              >
                👩‍🏫 Quản lý Lớp dạy & Giao bài tập Giáo viên
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('exercises')}
                className="hidden md:inline text-sky-200 hover:text-white transition-colors font-medium cursor-pointer"
              >
                Kho bài luyện Lớp {currentGrade} (Văn - Toán - Anh)
              </button>
            )}
            <button
              onClick={onOpenSupport}
              className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-sky-950 font-extrabold px-3 py-0.5 rounded-full transition-colors cursor-pointer shadow-2xs"
            >
              <Mail className="w-3 h-3" />
              <span>Hỗ trợ trực tuyến</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-17 gap-3">
          {/* Brand Wordmark & Grade Selector */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleNavClick(isAdminUser ? 'admin-portal' : 'home')}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl overflow-hidden bg-gradient-to-tr from-sky-600 to-blue-500 p-0.5 shadow-sm group-hover:scale-105 transition-transform">
                <img
                  src={MASCOT_IMAGE}
                  alt="Lớp học Bon Ben"
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <div className="leading-tight">
                <div className="text-lg font-bold text-sky-950 tracking-tight group-hover:text-sky-700 transition-colors">
                  Lớp học <span className="text-sky-600">Bon Ben</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  Học trực tuyến thông minh AI
                </div>
              </div>
            </button>

            {/* Grade Selector Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setGradeDropdownOpen(!gradeDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50/80 hover:bg-sky-100/80 text-sky-900 border border-sky-200/60 text-xs font-bold transition-colors cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5 text-sky-600" />
                <span>Lớp {currentGrade}</span>
                <ChevronDown className="w-3 h-3 text-sky-500" />
              </button>

              {gradeDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-sky-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Chọn khối lớp học
                  </div>
                  <div className="grid grid-cols-3 gap-1 mt-1">
                    {gradesList.map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          onSelectGrade(g);
                          setGradeDropdownOpen(false);
                        }}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          currentGrade === g
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'hover:bg-sky-50 text-slate-700'
                        }`}
                      >
                        Lớp {g}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Multi-Page Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/70">
            {isAdminUser && (
              <button
                type="button"
                onClick={() => handleNavClick('admin-portal')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activePage === 'admin-portal'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Quản trị & Sửa Web</span>
              </button>
            )}

            {isTeacherUser && (
              <button
                type="button"
                onClick={() => handleNavClick('teacher-class')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activePage === 'teacher-class'
                    ? 'bg-indigo-600 text-white font-black shadow-xs'
                    : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Lớp dạy của GV</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activePage === 'home'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'hover:text-sky-700 hover:bg-white/70'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('exercises')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activePage === 'exercises'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'hover:text-sky-700 hover:bg-white/70'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Bài luyện Lớp {currentGrade}</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('courses')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activePage === 'courses'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'hover:text-sky-700 hover:bg-white/70'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Khóa học Lớp {currentGrade}</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('exam')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activePage === 'exam'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'hover:text-sky-700 hover:bg-white/70'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Bài thi Lớp {currentGrade}</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('pathway')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activePage === 'pathway'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'hover:text-sky-700 hover:bg-white/70'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Chẩn đoán AI</span>
            </button>

            {!isAdminUser && (
              <button
                type="button"
                onClick={onOpenPortfolio}
                className="px-3 py-1.5 rounded-xl hover:text-sky-700 hover:bg-white/70 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5 text-sky-600" />
                <span>Học bạ</span>
              </button>
            )}
          </nav>

          {/* Right Action Zone: Quick Practice & Profile / Login */}
          <div className="flex items-center gap-2.5">
            {!isAdminUser && (
              <button
                onClick={() => onOpenLesson(`van-g${currentGrade}-bai-1`)}
                className="hidden sm:flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100/80 border border-sky-200/60 px-3 py-1.5 rounded-full transition-all text-xs font-bold text-sky-900 cursor-pointer"
                title="Luyện tập nhanh 20 câu"
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                <span>Luyện Lớp {currentGrade}</span>
              </button>
            )}

            {/* User Profile or Login Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 transition-all text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <div
                    className={`w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs shadow-xs ${
                      isAdminUser
                        ? 'bg-amber-500 text-slate-950'
                        : isTeacherUser
                          ? 'bg-indigo-600'
                          : 'bg-sky-600'
                    }`}
                  >
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div className="hidden xl:block text-left">
                    <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[10px] text-sky-600 font-medium">
                      {isAdminUser
                        ? 'Quản trị viên'
                        : isTeacherUser
                          ? `GV Lớp ${currentUser.className || currentGrade}`
                          : `HS Lớp ${currentUser.className || currentGrade}`}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-sky-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2.5 border-b border-slate-100">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-slate-900 text-sm truncate">
                          {currentUser.fullName}
                        </p>
                        {isAdminUser ? (
                          <span className="bg-amber-400 text-sky-950 text-[9px] font-black px-1.5 py-0.5 rounded uppercase shrink-0">
                            ADMIN
                          </span>
                        ) : isTeacherUser ? (
                          <span className="bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase shrink-0">
                            GIÁO VIÊN
                          </span>
                        ) : (
                          <span className="bg-sky-100 text-sky-800 text-[9px] font-black px-1.5 py-0.5 rounded uppercase shrink-0">
                            HỌC SINH
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {isAdminUser ? 'Tài khoản Chuyên Quản Lý Hệ Thống' : currentUser.email}
                      </p>
                      {!isAdminUser && (
                        <>
                          <p className="text-[11px] text-sky-700 font-semibold mt-1 truncate">
                            {isTeacherUser ? 'Lớp đang dạy:' : 'Lớp đang học:'}{' '}
                            {currentUser.className
                              ? `${currentUser.className} (Khối ${currentGrade})`
                              : `Lớp ${currentGrade}`}
                          </p>
                          {currentUser.school && (
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              Trường: {currentUser.school}
                            </p>
                          )}
                        </>
                      )}
                      <div className="mt-2 flex items-center justify-between text-xs font-semibold bg-sky-50 p-2 rounded-xl text-sky-900">
                        <span>Mã định danh:</span>
                        <span className="text-sky-700 font-extrabold">
                          {currentUser.studentCode}
                        </span>
                      </div>
                    </div>
                    <div className="py-1 text-xs text-slate-700">
                      {isAdminUser && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleNavClick('admin-portal');
                          }}
                          className="w-full text-left px-3 py-2 bg-amber-50 hover:bg-amber-100 rounded-xl flex items-center gap-2 transition-colors text-amber-950 font-extrabold cursor-pointer mb-1"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          Mở Trung tâm Quản trị & Sửa Trang Web
                        </button>
                      )}
                      {isTeacherUser && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleNavClick('teacher-class');
                          }}
                          className="w-full text-left px-3 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-xl flex items-center gap-2 transition-colors text-indigo-950 font-extrabold cursor-pointer mb-1"
                        >
                          <Users className="w-4 h-4 text-indigo-600" />
                          Quản lý Lớp học & Bài tập Giáo viên
                        </button>
                      )}
                      {!isAdminUser && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenPortfolio();
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-sky-50 rounded-xl flex items-center gap-2 transition-colors text-sky-900 font-bold cursor-pointer"
                        >
                          <GraduationCap className="w-4 h-4 text-sky-600" />
                          Học bạ điện tử của tôi
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenAuth();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-sky-50 rounded-xl font-medium flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4 text-sky-600" />
                        {isAdminUser
                          ? 'Quản lý nhanh Tài khoản trong hộp thoại'
                          : 'Hồ sơ · Đổi Lớp & Trường học'}
                      </button>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenSupport();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-sky-50 rounded-xl font-medium flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <HelpCircle className="w-4 h-4 text-sky-600" />
                        Gửi yêu cầu Hỗ trợ trực tuyến
                      </button>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl font-medium flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Đăng xuất tài khoản
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập / Đăng ký</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-sky-50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-sky-100 px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-600">Đang chọn học:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-sky-700">Lớp {currentGrade}</span>
              <button
                onClick={() => setGradeDropdownOpen(!gradeDropdownOpen)}
                className="text-[11px] text-sky-600 underline font-medium"
              >
                (Đổi khối lớp)
              </button>
            </div>
          </div>

          {gradeDropdownOpen && (
            <div className="grid grid-cols-4 gap-1.5 p-2 bg-sky-50 rounded-xl">
              {gradesList.map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    onSelectGrade(g);
                    setGradeDropdownOpen(false);
                  }}
                  className={`py-1 text-xs font-bold rounded-lg ${
                    currentGrade === g ? 'bg-sky-600 text-white' : 'bg-white text-slate-700'
                  }`}
                >
                  Lớp {g}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-1 text-sm font-semibold text-slate-800">
            {isAdminUser && (
              <button
                onClick={() => handleNavClick('admin-portal')}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 ${
                  activePage === 'admin-portal'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-amber-50 text-amber-900 font-bold'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Trung tâm Quản trị & Sửa Trang Web
              </button>
            )}
            {isTeacherUser && (
              <button
                onClick={() => handleNavClick('teacher-class')}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 ${
                  activePage === 'teacher-class'
                    ? 'bg-indigo-600 text-white font-black'
                    : 'bg-indigo-50 text-indigo-900 font-bold'
                }`}
              >
                <Users className="w-4 h-4" />
                Lớp dạy & Tạo bài tập Giáo viên
              </button>
            )}
            <button
              onClick={() => handleNavClick('home')}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 ${
                activePage === 'home' ? 'bg-sky-600 text-white font-bold' : 'hover:bg-sky-50 text-slate-800'
              }`}
            >
              <Home className="w-4 h-4" />
              Trang chủ Lớp học Bon Ben
            </button>
            <button
              onClick={() => handleNavClick('exercises')}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 ${
                activePage === 'exercises' ? 'bg-sky-600 text-white font-bold' : 'hover:bg-sky-50 text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              Bài luyện Văn - Toán - Anh Lớp {currentGrade} (20 bài/môn)
            </button>
            <button
              onClick={() => handleNavClick('courses')}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 ${
                activePage === 'courses' ? 'bg-sky-600 text-white font-bold' : 'hover:bg-sky-50 text-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Khóa học & Bài giảng Lớp {currentGrade}
            </button>
            <button
              onClick={() => handleNavClick('exam')}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 ${
                activePage === 'exam' ? 'bg-sky-600 text-white font-bold' : 'hover:bg-sky-50 text-sky-900 font-bold'
              }`}
            >
              <FileText className="w-4 h-4" />
              Bài thi khảo sát năng lực Lớp {currentGrade} (20 câu)
            </button>
            <button
              onClick={() => handleNavClick('pathway')}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 ${
                activePage === 'pathway' ? 'bg-sky-600 text-white font-bold' : 'hover:bg-sky-50 text-slate-800'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              Bản đồ Chẩn đoán Năng lực AI
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSupport();
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-sky-50 flex items-center gap-2 text-sky-800 font-bold"
            >
              <HelpCircle className="w-4 h-4 text-sky-600" />
              Hỗ trợ trực tuyến
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-sky-50 flex items-center gap-2 text-slate-800"
            >
              <User className="w-4 h-4 text-sky-600" />
              {currentUser ? `Tài khoản (${currentUser.fullName})` : 'Đăng nhập / Đăng ký'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
