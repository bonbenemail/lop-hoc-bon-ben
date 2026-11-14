import React, { useState, useEffect, useRef } from 'react';
import { GradeLevel, UserAccount, SiteConfig } from './types';
import { Header, AppPage } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CurriculumMatrix } from './components/CurriculumMatrix';
import { AiLearningPathway } from './components/AiLearningPathway';
import { InteractiveLessonModal } from './components/InteractiveLessonModal';
import { ExamTestModal } from './components/ExamTestModal';
import { TestimonialsNews } from './components/TestimonialsNews';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { GradeExerciseTypesSection } from './components/GradeExerciseTypesSection';
import { StudentPortfolioModal } from './components/StudentPortfolioModal';
import { SupportModal } from './components/SupportModal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminPortal } from './components/AdminPortal';
import {
  getAllRegisteredAccounts,
  saveAllRegisteredAccounts,
  getSiteConfig,
  canUserAccessLesson
} from './services/schoolManager';
import {
  createFirebaseAdminAccount,
  FIREBASE_ADMIN_EMAIL,
  signOutFirebaseAdmin,
  subscribeToFirebaseAdmin
} from './services/firebaseAdminAuth';
import {
  FileText,
  GraduationCap,
  BookOpen,
  Globe,
  Calculator,
  ArrowLeft,
  Layers,
  BrainCircuit,
  ShieldCheck,
  Users,
  Lock,
  CheckCircle2
} from 'lucide-react';

const ADMIN_GMAIL_INTERNAL = 'bonbenemail@gmail.com';

export default function App() {
  const [currentGrade, setCurrentGrade] = useState<GradeLevel>(4);
  const [userRole, setUserRole] = useState<'student' | 'parent' | 'school'>('student');
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => getSiteConfig());

  // User Authentication State with Strict Gmail Registration Verification + Admin & Teacher Support
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      localStorage.removeItem('bonben_admin_password');
      const saved = localStorage.getItem('bonben_user_account');
      if (saved) {
        const parsedUser: UserAccount = JSON.parse(saved);
        if (
          parsedUser.role === 'admin' ||
          parsedUser.email?.toLowerCase() === ADMIN_GMAIL_INTERNAL
        ) {
          localStorage.removeItem('bonben_user_account');
        } else {
          const registeredList = getAllRegisteredAccounts();
          const matched = registeredList.find(
            (acc) =>
              acc.email.toLowerCase() === parsedUser.email?.toLowerCase() &&
              acc.verifiedByGmail === true
          );
          if (parsedUser.verifiedByGmail === true && matched) {
            return matched;
          }
        }
      }
      localStorage.removeItem('bonben_user_account');
    } catch (e) {
      console.error(e);
    }
    return null;
  });
  const adminAuthSessionRestored = useRef(false);

  const [activePage, setActivePage] = useState<AppPage>(() => {
    if (
      currentUser?.role === 'admin' ||
      currentUser?.email?.toLowerCase() === ADMIN_GMAIL_INTERNAL
    ) {
      return 'admin-portal';
    }
    if (currentUser?.role === 'teacher') {
      return 'teacher-class';
    }
    return 'home';
  });

  useEffect(() => {
    let unsubscribe: () => void = () => {};
    try {
      unsubscribe = subscribeToFirebaseAdmin((firebaseUser) => {
        if (
          firebaseUser?.email?.toLowerCase() === FIREBASE_ADMIN_EMAIL &&
          firebaseUser.emailVerified
        ) {
          adminAuthSessionRestored.current = true;
          const adminAccount = createFirebaseAdminAccount(firebaseUser, currentGrade);
          setCurrentUser(adminAccount);
          setCurrentGrade(adminAccount.grade);
          setActivePage('admin-portal');
          localStorage.setItem('bonben_user_account', JSON.stringify(adminAccount));
          return;
        }

        if (adminAuthSessionRestored.current) {
          adminAuthSessionRestored.current = false;
          localStorage.removeItem('bonben_user_account');
          setCurrentUser((user) => (user?.role === 'admin' ? null : user));
          setActivePage('home');
        }
      });
    } catch (error) {
      console.error('FIREBASE_ADMIN_AUTH_LISTENER_ERROR:', error);
    }

    return unsubscribe;
  }, []);

  // Sync user's grade
  useEffect(() => {
    if (currentUser) {
      setCurrentGrade(currentUser.grade);
    }
  }, [currentUser]);

  // Modals state
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [progressVersion, setProgressVersion] = useState(0);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4200);
  };

  const refreshCurrentUserFromStorage = () => {
    setSiteConfig(getSiteConfig());
    setProgressVersion((v) => v + 1);
    if (!currentUser) return;
    if (
      currentUser.role === 'admin' ||
      currentUser.email?.toLowerCase() === ADMIN_GMAIL_INTERNAL
    ) {
      return;
    }
    const all = getAllRegisteredAccounts();
    const fresh = all.find(
      (a) => a.email.toLowerCase() === currentUser.email.toLowerCase()
    );
    if (fresh) {
      setCurrentUser(fresh);
      localStorage.setItem('bonben_user_account', JSON.stringify(fresh));
    }
  };

  const handleNavigatePage = (page: AppPage) => {
    refreshCurrentUserFromStorage();
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLessonSafe = (lessonId?: string) => {
    const targetId = lessonId || `van-g${currentGrade}-bai-1`;
    if (!canUserAccessLesson(currentUser, targetId)) {
      showToast(
        '🔒 Bài 4 đến Bài 20 đang khóa — Bạn cần được Admin xét duyệt cho phép làm bài (Hiện chỉ được làm thử 3 bài ở dòng đầu)!'
      );
      return;
    }
    setSelectedLessonId(targetId);
  };

  const handleCompleteActivity = (xpAmount: number) => {
    showToast(
      `⚡ Chúc mừng! Bạn vừa hoàn thành xuất sắc và nhận +${xpAmount} Điểm XP vào học bạ!`
    );
  };

  const handleLogin = (user: UserAccount) => {
    // Re-sync from normalized storage so teacher matching is fresh
    let finalUser = user;
    if (user.role !== 'admin' && user.email.toLowerCase() !== ADMIN_GMAIL_INTERNAL) {
      const all = getAllRegisteredAccounts();
      const matched = all.find((a) => a.email.toLowerCase() === user.email.toLowerCase());
      if (matched) finalUser = matched;
    }
    setCurrentUser(finalUser);
    setCurrentGrade(finalUser.grade);
    localStorage.setItem('bonben_user_account', JSON.stringify(finalUser));

    if (
      finalUser.role === 'admin' ||
      finalUser.email.toLowerCase() === ADMIN_GMAIL_INTERNAL
    ) {
      setActivePage('admin-portal');
      showToast(
        '🛡️ Chào mừng Quản trị viên! Đã mở Trung tâm Quản lý Tài khoản & Sửa trực tiếp Trang web.'
      );
    } else if (finalUser.role === 'teacher') {
      setActivePage('teacher-class');
      showToast(
        finalUser.teacherApprovalStatus === 'approved'
          ? `👩‍🏫 Chào mừng Giáo viên ${finalUser.fullName} (Lớp ${finalUser.className} - ${finalUser.school})!`
          : `⏳ Tài khoản Giáo viên ${finalUser.fullName} đang chờ Admin xét duyệt!`
      );
    } else {
      setActivePage('home');
      showToast(
        finalUser.canPracticeAll
          ? `👋 Chào mừng Học sinh ${finalUser.fullName} (Đã được Admin cho phép làm mọi bài luyện)!`
          : `👋 Chào mừng ${finalUser.fullName}! Tài khoản mới đang chờ Admin duyệt — Bạn được làm thử 3 bài ở dòng đầu mỗi môn.`
      );
    }
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    try {
      const list = getAllRegisteredAccounts();
      const nextList = list.map((acc) =>
        acc.email.toLowerCase() === updatedUser.email.toLowerCase() ? updatedUser : acc
      );
      saveAllRegisteredAccounts(nextList);
      const reSynced = getAllRegisteredAccounts().find(
        (acc) => acc.email.toLowerCase() === updatedUser.email.toLowerCase()
      );
      const finalUser = reSynced || updatedUser;
      setCurrentUser(finalUser);
      setCurrentGrade(finalUser.grade);
      localStorage.setItem('bonben_user_account', JSON.stringify(finalUser));
    } catch (e) {
      console.error(e);
    }
    showToast(
      `✅ Đã cập nhật thông tin Lớp (${updatedUser.className || `Lớp ${updatedUser.grade}`}) & Trường (${updatedUser.school || ''})!`
    );
  };

  const handleLogout = async () => {
    try {
      await signOutFirebaseAdmin();
    } catch (error) {
      console.error('FIREBASE_ADMIN_SIGN_OUT_ERROR:', error);
      showToast('Không thể đăng xuất khỏi Firebase. Vui lòng thử lại.');
      return;
    }
    setCurrentUser(null);
    setActivePage('home');
    localStorage.removeItem('bonben_user_account');
    showToast('Đã đăng xuất tài khoản. Bạn có thể đăng nhập hoặc tạo tài khoản mới.');
  };

  const syncUserGrade = (g: GradeLevel) => {
    setCurrentGrade(g);
    if (currentUser && currentUser.role !== 'admin') {
      const updated = { ...currentUser, grade: g };
      setCurrentUser(updated);
      localStorage.setItem('bonben_user_account', JSON.stringify(updated));
      try {
        const list = getAllRegisteredAccounts();
        const nextList = list.map((acc) =>
          acc.email.toLowerCase() === updated.email.toLowerCase() ? { ...acc, grade: g } : acc
        );
        saveAllRegisteredAccounts(nextList);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const isAdminUser =
    currentUser?.role === 'admin' ||
    currentUser?.email?.toLowerCase() === ADMIN_GMAIL_INTERNAL;
  const isTeacherUser = currentUser?.role === 'teacher';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-sky-500 selection:text-white flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-sky-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-sky-400/40 flex items-center gap-3 animate-in slide-in-from-bottom-5 max-w-md">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-sky-950 flex items-center justify-center font-bold text-sm shrink-0">
            ✨
          </div>
          <div className="text-xs sm:text-sm font-semibold leading-snug">{toastMessage}</div>
        </div>
      )}

      {/* Main Header with Multi-Page Navigation */}
      <Header
        currentGrade={currentGrade}
        onSelectGrade={syncUserGrade}
        currentUser={currentUser}
        activePage={activePage}
        onNavigatePage={handleNavigatePage}
        onOpenExam={() => handleNavigatePage('exam')}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPortfolio={() => setIsPortfolioOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenLesson={(lessonId) => handleOpenLessonSafe(lessonId)}
        onLogout={handleLogout}
        userRole={userRole}
        onSelectRole={setUserRole}
        siteConfig={siteConfig}
      />

      {/* Active Student / Teacher / Admin Workspace Banner */}
      {currentUser && (
        <div
          className={`text-white py-2.5 px-4 sm:px-6 shadow-sm border-b animate-in fade-in ${
            isAdminUser
              ? 'bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border-amber-500/40'
              : isTeacherUser
                ? 'bg-gradient-to-r from-indigo-900 via-indigo-800 to-sky-900 border-indigo-600/40'
                : 'bg-gradient-to-r from-sky-700 via-sky-800 to-blue-800 border-sky-600/40'
          }`}
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full overflow-hidden border-2 border-white/80 shrink-0 flex items-center justify-center font-extrabold ${
                  isAdminUser
                    ? 'bg-amber-400 text-slate-950'
                    : isTeacherUser
                      ? 'bg-indigo-500 text-white'
                      : 'bg-sky-600 text-white'
                }`}
              >
                {currentUser.fullName.charAt(0)}
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-white">
                    {isAdminUser
                      ? '🛡️ Tài Khoản Chuyên Quản Lý & Sửa Trực Tiếp Trang Web (Admin)'
                      : isTeacherUser
                        ? `👩‍🏫 Giáo viên: ${currentUser.fullName}`
                        : `👦 Học sinh: ${currentUser.fullName}`}
                  </span>

                  {!isAdminUser && (
                    <>
                      <span className="bg-white/15 px-2 py-0.5 rounded-md text-[11px] font-bold text-sky-100">
                        {currentUser.className
                          ? `Lớp ${currentUser.className} (Khối ${currentGrade})`
                          : `Khối Lớp ${currentGrade}`}
                      </span>
                      {currentUser.school && (
                        <span className="text-sky-200 text-xs font-medium">
                          · 🏫 {currentUser.school}
                        </span>
                      )}
                    </>
                  )}

                  {/* Student Practice Permission Status Pill */}
                  {!isAdminUser && !isTeacherUser && (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-black inline-flex items-center gap-1 ${
                        currentUser.canPracticeAll
                          ? 'bg-emerald-400 text-slate-950'
                          : 'bg-amber-400 text-slate-950'
                      }`}
                    >
                      {currentUser.canPracticeAll ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Admin đã duyệt: Mở khóa 100% bài luyện & đề thi</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          <span>Chờ Admin duyệt: Chỉ làm thử 3 bài ở dòng đầu</span>
                        </>
                      )}
                    </span>
                  )}

                  {/* Teacher Approval Status Pill */}
                  {isTeacherUser && (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                        currentUser.teacherApprovalStatus === 'approved'
                          ? 'bg-emerald-400 text-slate-950'
                          : 'bg-amber-400 text-slate-950'
                      }`}
                    >
                      {currentUser.teacherApprovalStatus === 'approved'
                        ? '✓ Đã được Admin duyệt Giáo viên'
                        : '⏳ Đang chờ Admin xét duyệt Giáo viên'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isAdminUser ? (
                <>
                  <button
                    onClick={() => handleNavigatePage('admin-portal')}
                    className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-black text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Trung tâm Quản trị & Sửa Trang Web</span>
                  </button>
                  <button
                    onClick={() => handleNavigatePage('home')}
                    className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl font-bold text-xs transition-colors border border-white/20 cursor-pointer"
                  >
                    👁️ Xem Trang chủ hiện tại
                  </button>
                </>
              ) : isTeacherUser ? (
                <>
                  <button
                    onClick={() => handleNavigatePage('teacher-class')}
                    className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-black text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Quản lý Lớp học & Tạo bài tập</span>
                  </button>
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="px-3 py-1 bg-white/15 hover:bg-white/25 text-white rounded-xl font-bold text-xs transition-colors border border-white/20 cursor-pointer"
                  >
                    ✏️ Đổi Lớp & Trường dạy
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="px-3 py-1 bg-white/15 hover:bg-white/25 text-white rounded-xl font-bold text-xs transition-colors border border-white/20 cursor-pointer"
                  >
                    ✏️ Đổi Lớp & Trường
                  </button>
                  <button
                    onClick={() => setIsPortfolioOpen(true)}
                    className="px-3 py-1 bg-white/15 hover:bg-white/25 text-white rounded-xl font-bold text-xs transition-colors border border-white/20 cursor-pointer flex items-center gap-1"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Học bạ điện tử</span>
                  </button>
                  <button
                    onClick={() => handleOpenLessonSafe(`van-g${currentGrade}-bai-1`)}
                    className="px-3 py-1 bg-white hover:bg-sky-50 text-sky-900 rounded-xl font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                  >
                    📖 Luyện Văn Lớp {currentGrade}
                  </button>
                  <button
                    onClick={() => handleOpenLessonSafe(`toan-g${currentGrade}-bai-1`)}
                    className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-extrabold text-xs transition-colors shadow-2xs cursor-pointer"
                  >
                    📐 Luyện Toán Lớp {currentGrade}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sub-page Navigation Bar when not on Home page */}
      {activePage !== 'home' && (
        <div className="bg-white border-b border-sky-100 py-3 px-4 sm:px-6 shadow-2xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => handleNavigatePage(isAdminUser ? 'admin-portal' : 'home')}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-3.5 py-1.5 rounded-xl border border-sky-200/70 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isAdminUser ? 'Về Trung tâm Quản trị Admin' : 'Quay về Trang chủ'}</span>
            </button>

            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
              {isAdminUser && (
                <button
                  type="button"
                  onClick={() => handleNavigatePage('admin-portal')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                    activePage === 'admin-portal'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Quản trị & Sửa Trang Web</span>
                </button>
              )}

              {isTeacherUser && (
                <button
                  type="button"
                  onClick={() => handleNavigatePage('teacher-class')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                    activePage === 'teacher-class'
                      ? 'bg-indigo-600 text-white font-black shadow-xs'
                      : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Lớp dạy của Giáo viên</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleNavigatePage('exercises')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                  activePage === 'exercises'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-sky-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Bài luyện Lớp {currentGrade}</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigatePage('courses')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                  activePage === 'courses'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-sky-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Khóa học Lớp {currentGrade}</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigatePage('exam')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                  activePage === 'exam'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-sky-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Bài thi Lớp {currentGrade}</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigatePage('pathway')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                  activePage === 'pathway'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-sky-50'
                }`}
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Chẩn đoán AI</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content — Multi-Page View so each section is a clean, separate page */}
      <main className="flex-1">
        {activePage === 'admin-portal' && isAdminUser && (
          <AdminPortal
            onSiteConfigChange={(newCfg) => {
              setSiteConfig(newCfg);
              setProgressVersion((v) => v + 1);
            }}
            onAccountsChange={() => {
              refreshCurrentUserFromStorage();
            }}
            onSwitchToLivePageInspect={() => handleNavigatePage('home')}
          />
        )}

        {activePage === 'teacher-class' && currentUser && (
          <TeacherDashboard
            currentUser={currentUser}
            onOpenLesson={(lessonId) => handleOpenLessonSafe(lessonId)}
            onUpdateAccounts={() => {
              refreshCurrentUserFromStorage();
            }}
            progressVersion={progressVersion}
          />
        )}

        {activePage === 'home' && (
          <>
            <HeroSection
              currentGrade={currentGrade}
              onSelectGrade={syncUserGrade}
              onOpenLesson={(lessonId) => handleOpenLessonSafe(lessonId)}
              onNavigatePage={handleNavigatePage}
              userRole={userRole}
              onSelectRole={setUserRole}
              siteConfig={siteConfig}
            />
            <TestimonialsNews />
          </>
        )}

        {activePage === 'exercises' && (
          <GradeExerciseTypesSection
            currentGrade={currentGrade}
            onSelectGrade={syncUserGrade}
            currentUser={currentUser}
            onOpenLesson={(exerciseId) => handleOpenLessonSafe(exerciseId)}
            onOpenExam={() => handleNavigatePage('exam')}
            progressVersion={progressVersion}
            onLockedNotice={(msg) => showToast(msg)}
          />
        )}

        {activePage === 'courses' && (
          <CurriculumMatrix
            currentGrade={currentGrade}
            onSelectGrade={syncUserGrade}
            onOpenLesson={(lessonId) => handleOpenLessonSafe(lessonId)}
            userEmail={currentUser?.email}
            currentUser={currentUser}
            progressVersion={progressVersion}
            onLockedNotice={(msg) => showToast(msg)}
          />
        )}

        {activePage === 'exam' && (
          <ExamTestModal
            isOpen={true}
            inlinePage={true}
            onClose={() => handleNavigatePage('home')}
            currentGrade={currentGrade}
            currentUser={currentUser}
            onCompleteExam={handleCompleteActivity}
            onGoToTrialExercises={() => handleNavigatePage('exercises')}
          />
        )}

        {activePage === 'pathway' && (
          <AiLearningPathway
            currentGrade={currentGrade}
            currentUser={currentUser}
            onOpenLesson={(lessonId) => handleOpenLessonSafe(lessonId)}
            progressVersion={progressVersion}
            onResetAllProgress={() => {
              setProgressVersion((v) => v + 1);
              showToast('✅ Đã đặt lại toàn bộ tiến độ các bài luyện về 0%!');
            }}
          />
        )}
      </main>

      {/* Floating Action Bar for Quick Navigation & Practice (Hidden when Admin is inside AdminPortal) */}
      {activePage !== 'admin-portal' && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-2 rounded-full shadow-xl shadow-sky-950/10 border border-sky-200/80 flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => handleOpenLessonSafe(`van-g${currentGrade}-bai-1`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200/80 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-600" />
            <span>20 Bài Văn Lớp {currentGrade}</span>
          </button>

          <button
            onClick={() => handleOpenLessonSafe(`anh-g${currentGrade}-bai-1`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/80 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>20 Bài Anh Lớp {currentGrade}</span>
          </button>

          <button
            onClick={() => handleOpenLessonSafe(`toan-g${currentGrade}-bai-1`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white rounded-full text-xs font-black shadow-xs hover:scale-105 transition-all cursor-pointer whitespace-nowrap"
          >
            <Calculator className="w-3.5 h-3.5 text-sky-200" />
            <span>20 Bài Toán Lớp {currentGrade}</span>
          </button>

          <button
            onClick={() => handleNavigatePage('exam')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-sky-900 hover:bg-sky-800 text-white rounded-full text-xs font-extrabold shadow-2xs hover:scale-105 transition-all cursor-pointer whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>Bài thi Lớp {currentGrade} (20 câu)</span>
          </button>
        </div>
      )}

      {/* Footer */}
      <Footer onNavigatePage={handleNavigatePage} siteConfig={siteConfig} />

      {/* Modals */}
      <ExamTestModal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        currentGrade={currentGrade}
        currentUser={currentUser}
        onCompleteExam={handleCompleteActivity}
        onGoToTrialExercises={() => {
          setIsExamModalOpen(false);
          handleNavigatePage('exercises');
        }}
      />

      <InteractiveLessonModal
        lessonId={selectedLessonId}
        isOpen={!!selectedLessonId}
        onClose={() => setSelectedLessonId(null)}
        currentGrade={currentGrade}
        userEmail={currentUser?.email}
        currentUser={currentUser}
        onCompleteLesson={handleCompleteActivity}
        onProgressUpdated={() => setProgressVersion((v) => v + 1)}
      />

      <StudentPortfolioModal
        isOpen={isPortfolioOpen}
        onClose={() => setIsPortfolioOpen(false)}
        currentUser={currentUser}
        currentGrade={currentGrade}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          refreshCurrentUserFromStorage();
        }}
        currentUser={currentUser}
        onLogin={handleLogin}
        onUpdateUser={handleUpdateUser}
        onLogout={handleLogout}
        currentGrade={currentGrade}
        onSelectGrade={syncUserGrade}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        currentUser={currentUser}
        currentGrade={currentGrade}
      />
    </div>
  );
}
