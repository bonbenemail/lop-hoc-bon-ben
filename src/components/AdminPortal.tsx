import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
  Pencil,
  Search,
  Globe,
  BookOpen,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  Clock,
  Sliders
} from 'lucide-react';
import { GradeLevel, Lesson, SiteConfig, UserAccount } from '../types';
import {
  getAllRegisteredAccounts,
  saveAllRegisteredAccounts,
  adminUpdateTeacherApproval,
  adminUpdateStudentPracticePermission,
  getSiteConfig,
  saveSiteConfig,
  resetSiteConfig,
  saveLessonOverride,
  applyLessonOverrides
} from '../services/schoolManager';
import {
  getVietnamese20LessonsByGrade,
  getMath20LessonsByGrade,
  getEnglish20LessonsByGrade
} from '../data/practiceLessonsData';

interface AdminPortalProps {
  onSiteConfigChange: (config: SiteConfig) => void;
  onAccountsChange: () => void;
  onSwitchToLivePageInspect?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onSiteConfigChange,
  onAccountsChange,
  onSwitchToLivePageInspect,
}) => {
  const [activeTab, setActiveTab] = useState<
    'pending-teachers' | 'pending-students' | 'all-accounts' | 'site-editor'
  >('pending-students');

  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher'>('all');
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  // State sửa mật khẩu & sửa Lớp/Trường trong quản lý tài khoản
  const [editingPasswordEmail, setEditingPasswordEmail] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [editingInfoEmail, setEditingInfoEmail] = useState<string | null>(null);
  const [editGrade, setEditGrade] = useState<GradeLevel>(4);
  const [editClass, setEditClass] = useState('');
  const [editSchool, setEditSchool] = useState('');
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [showPassMap, setShowPassMap] = useState<Record<string, boolean>>({});

  // State sửa trực tiếp trang web
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => getSiteConfig());
  const [editorGrade, setEditorGrade] = useState<GradeLevel>(4);
  const [editorSubject, setEditorSubject] = useState<'tieng-viet' | 'toan' | 'tieng-anh'>('toan');
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [editLessonDesc, setEditLessonDesc] = useState('');
  const [editLessonDiff, setEditLessonDiff] = useState<'Cơ bản' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao'>('Cơ bản');

  const reloadAccounts = () => {
    setAccounts(getAllRegisteredAccounts());
  };

  useEffect(() => {
    reloadAccounts();
  }, []);

  const notify = (msg: string) => {
    setBannerMsg(msg);
    setTimeout(() => setBannerMsg(null), 4000);
  };

  // Phân loại Giáo viên & Học sinh rõ ràng
  const allTeachers = accounts.filter((a) => a.role === 'teacher');
  const pendingTeachers = allTeachers.filter((t) => t.teacherApprovalStatus !== 'approved');
  const approvedTeachers = allTeachers.filter((t) => t.teacherApprovalStatus === 'approved');

  const allStudents = accounts.filter((a) => a.role === 'student');
  const restrictedStudents = allStudents.filter((s) => s.canPracticeAll !== true);
  const allowedStudents = allStudents.filter((s) => s.canPracticeAll === true);

  // Xử lý duyệt Giáo viên
  const handleTeacherDecision = (email: string, status: 'approved' | 'pending' | 'rejected') => {
    const next = adminUpdateTeacherApproval(email, status);
    setAccounts(next);
    onAccountsChange();
    notify(
      status === 'approved'
        ? '✅ Đã xét duyệt tài khoản Giáo viên thành công!'
        : 'Đã cập nhật trạng thái tài khoản Giáo viên.'
    );
  };

  const handleApproveAllPendingTeachers = () => {
    const updated = accounts.map((acc) =>
      acc.role === 'teacher' ? { ...acc, teacherApprovalStatus: 'approved' as const } : acc
    );
    saveAllRegisteredAccounts(updated);
    reloadAccounts();
    onAccountsChange();
    notify('✅ Đã duyệt toàn bộ tài khoản Giáo viên đang chờ!');
  };

  // Xử lý cho phép / không cho phép Học sinh làm bài
  const handleStudentPermission = (email: string, allowAll: boolean) => {
    const next = adminUpdateStudentPracticePermission(email, allowAll);
    setAccounts(next);
    onAccountsChange();
    notify(
      allowAll
        ? '✅ Đã CHO PHÉP học sinh làm toàn bộ mọi bài luyện, bài thi & kiểm tra!'
        : '🔒 Đã chuyển học sinh sang trạng thái KHÔNG CHO PHÉP (Chỉ được làm thử 3 bài đầu tiên).'
    );
  };

  const handleApproveAllPendingStudents = () => {
    const updated = accounts.map((acc) =>
      acc.role === 'student'
        ? { ...acc, canPracticeAll: true, practiceApprovalStatus: 'approved' as const }
        : acc
    );
    saveAllRegisteredAccounts(updated);
    reloadAccounts();
    onAccountsChange();
    notify('✅ Đã cho phép toàn bộ học sinh làm tất cả bài luyện và bài thi!');
  };

  // Đổi mật khẩu tài khoản
  const handleSaveNewPassword = (targetEmail: string) => {
    if (newPasswordInput.length <= 6) {
      notify('⚠️ Mật khẩu mới phải có nhiều hơn 6 ký tự (từ 7 ký tự trở lên).');
      return;
    }
    const updated = accounts.map((acc) =>
      acc.email.toLowerCase() === targetEmail.toLowerCase()
        ? { ...acc, password: newPasswordInput }
        : acc
    );
    saveAllRegisteredAccounts(updated);
    reloadAccounts();
    setEditingPasswordEmail(null);
    setNewPasswordInput('');
    onAccountsChange();
    notify('✅ Đã đổi mật khẩu cho tài khoản thành công!');
  };

  // Sửa Lớp & Trường
  const handleSaveAccountInfo = (targetEmail: string) => {
    if (!editClass.trim() || !editSchool.trim()) {
      notify('⚠️ Vui lòng nhập đầy đủ Lớp và Trường.');
      return;
    }
    const updated = accounts.map((acc) =>
      acc.email.toLowerCase() === targetEmail.toLowerCase()
        ? {
            ...acc,
            grade: editGrade,
            className: editClass.trim().toUpperCase(),
            school: editSchool.trim(),
          }
        : acc
    );
    saveAllRegisteredAccounts(updated);
    reloadAccounts();
    setEditingInfoEmail(null);
    onAccountsChange();
    notify('✅ Đã cập nhật Lớp & Trường cho tài khoản!');
  };

  // Xóa tài khoản
  const handleDeleteAccount = (targetEmail: string) => {
    const updated = accounts.filter(
      (acc) => acc.email.toLowerCase() !== targetEmail.toLowerCase()
    );
    saveAllRegisteredAccounts(updated);
    reloadAccounts();
    setDeletingEmail(null);
    onAccountsChange();
    notify('🗑️ Đã xóa tài khoản khỏi hệ thống!');
  };

  // Lưu chỉnh sửa trực tiếp giao diện trang web
  const handleSaveSiteConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = saveSiteConfig(siteConfig);
    onSiteConfigChange(saved);
    notify('✅ Đã lưu chỉnh sửa trực tiếp nội dung trang web thành công!');
  };

  const handleResetSiteConfig = () => {
    const def = resetSiteConfig();
    setSiteConfig(def);
    onSiteConfigChange(def);
    notify('🔄 Đã khôi phục nội dung trang web về mặc định!');
  };

  // Danh sách bài luyện để Admin sửa trực tiếp
  const rawLessonsForEditor: Lesson[] =
    editorSubject === 'tieng-viet'
      ? getVietnamese20LessonsByGrade(editorGrade)
      : editorSubject === 'toan'
        ? getMath20LessonsByGrade(editorGrade)
        : getEnglish20LessonsByGrade(editorGrade);
  const lessonsForEditor = applyLessonOverrides(rawLessonsForEditor);

  const handleSaveLessonDirectEdit = (lessonId: string) => {
    if (!editLessonTitle.trim()) return;
    saveLessonOverride({
      lessonId,
      title: editLessonTitle.trim(),
      description: editLessonDesc.trim(),
      difficulty: editLessonDiff,
    });
    setEditingLessonId(null);
    onAccountsChange();
    notify('✅ Đã cập nhật trực tiếp nội dung bài luyện trên trang web!');
  };

  const filteredAccounts = accounts.filter((acc) => {
    const matchRole = roleFilter === 'all' || acc.role === roleFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      acc.fullName.toLowerCase().includes(q) ||
      acc.email.toLowerCase().includes(q) ||
      (acc.className || '').toLowerCase().includes(q) ||
      (acc.school || '').toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  return (
    <section className="py-8 sm:py-10 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
      {/* Top Admin Command Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-sky-800/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>TÀI KHOẢN QUẢN TRỊ VIÊN CHUYÊN BIỆT (ADMIN)</span>
              </span>
              <span className="bg-white/10 text-sky-200 text-xs font-bold px-3 py-0.5 rounded-full">
                Toàn quyền Quản lý Tài khoản & Sửa trực tiếp Trang web
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Trung Tâm Điều Hành & Quản Trị Hệ Thống Lớp Học Bon Ben
            </h1>
            <p className="text-xs sm:text-sm text-sky-200 max-w-2xl leading-relaxed">
              Tài khoản Admin chuyên biệt dùng để xét duyệt Giáo viên, cấp/khóa quyền làm bài luyện & bài thi của Học sinh, quản lý toàn bộ tài khoản và chỉnh sửa trực tiếp nội dung trang web.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onSwitchToLivePageInspect && (
              <button
                type="button"
                onClick={onSwitchToLivePageInspect}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Globe className="w-4 h-4" />
                <span>Xem giao diện các trang web</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div
            onClick={() => setActiveTab('pending-students')}
            className="bg-white/10 hover:bg-white/15 p-3.5 rounded-2xl border border-white/15 cursor-pointer transition-colors"
          >
            <div className="text-[11px] text-amber-300 font-bold uppercase">
              HS Chờ duyệt cho phép làm bài
            </div>
            <div className="text-2xl font-black text-white mt-0.5">{restrictedStudents.length} học sinh</div>
            <div className="text-[11px] text-sky-200 mt-0.5">
              Đang khóa (Chỉ mở 3 bài đầu làm thử)
            </div>
          </div>

          <div
            onClick={() => setActiveTab('pending-teachers')}
            className="bg-white/10 hover:bg-white/15 p-3.5 rounded-2xl border border-white/15 cursor-pointer transition-colors"
          >
            <div className="text-[11px] text-sky-300 font-bold uppercase">
              GV Chờ Admin xét duyệt
            </div>
            <div className="text-2xl font-black text-white mt-0.5">{pendingTeachers.length} giáo viên</div>
            <div className="text-[11px] text-sky-200 mt-0.5">
              Đã duyệt: {approvedTeachers.length} giáo viên
            </div>
          </div>

          <div
            onClick={() => setActiveTab('pending-students')}
            className="bg-white/10 hover:bg-white/15 p-3.5 rounded-2xl border border-white/15 cursor-pointer transition-colors"
          >
            <div className="text-[11px] text-emerald-300 font-bold uppercase">
              HS Đã được cho phép làm bài
            </div>
            <div className="text-2xl font-black text-white mt-0.5">{allowedStudents.length} học sinh</div>
            <div className="text-[11px] text-sky-200 mt-0.5">
              Được làm trọn bộ 20 bài/môn & Đề thi
            </div>
          </div>

          <div
            onClick={() => setActiveTab('site-editor')}
            className="bg-white/10 hover:bg-white/15 p-3.5 rounded-2xl border border-white/15 cursor-pointer transition-colors"
          >
            <div className="text-[11px] text-purple-300 font-bold uppercase">
              Trình sửa trực tiếp Web
            </div>
            <div className="text-lg font-black text-white mt-1">Chỉnh sửa tức thì</div>
            <div className="text-[11px] text-sky-200 mt-0.5">
              Sửa trang chủ, thông báo & 60 bài luyện
            </div>
          </div>
        </div>
      </div>

      {bannerMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{bannerMsg}</span>
        </div>
      )}

      {/* 4 Main Separated Admin Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 bg-white p-2.5 rounded-3xl border border-sky-100 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('pending-students')}
          className={`p-3 rounded-2xl text-xs font-extrabold flex items-center justify-between gap-2 transition-all cursor-pointer ${
            activeTab === 'pending-students'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-700 hover:bg-sky-50'
          }`}
        >
          <div className="flex items-center gap-2 text-left">
            <Lock className="w-4 h-4 shrink-0" />
            <span>1. Duyệt Cho Phép HS Làm Bài</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
              activeTab === 'pending-students'
                ? 'bg-amber-300 text-slate-950'
                : 'bg-amber-100 text-amber-900'
            }`}
          >
            {restrictedStudents.length} chờ
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending-teachers')}
          className={`p-3 rounded-2xl text-xs font-extrabold flex items-center justify-between gap-2 transition-all cursor-pointer ${
            activeTab === 'pending-teachers'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-700 hover:bg-sky-50'
          }`}
        >
          <div className="flex items-center gap-2 text-left">
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span>2. Chờ Duyệt TK Giáo Viên</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
              activeTab === 'pending-teachers'
                ? 'bg-amber-300 text-slate-950'
                : 'bg-amber-100 text-amber-900'
            }`}
          >
            {pendingTeachers.length} chờ
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all-accounts')}
          className={`p-3 rounded-2xl text-xs font-extrabold flex items-center justify-between gap-2 transition-all cursor-pointer ${
            activeTab === 'all-accounts'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-700 hover:bg-sky-50'
          }`}
        >
          <div className="flex items-center gap-2 text-left">
            <Users className="w-4 h-4 shrink-0" />
            <span>3. Quản Lý Toàn Bộ Tài Khoản</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
              activeTab === 'all-accounts'
                ? 'bg-white/20 text-white'
                : 'bg-slate-200 text-slate-800'
            }`}
          >
            {accounts.length} TK
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('site-editor')}
          className={`p-3 rounded-2xl text-xs font-extrabold flex items-center justify-between gap-2 transition-all cursor-pointer ${
            activeTab === 'site-editor'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-700 hover:bg-sky-50'
          }`}
        >
          <div className="flex items-center gap-2 text-left">
            <Sliders className="w-4 h-4 shrink-0" />
            <span>4. Sửa Trực Tiếp Trang Web</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'site-editor'
                ? 'bg-white/20 text-white'
                : 'bg-sky-100 text-sky-800'
            }`}
          >
            Live
          </span>
        </button>
      </div>

      {/* ==================== TAB 1: CHỜ DUYỆT CHO PHÉP HỌC SINH LÀM BÀI (TÁCH RIÊNG) ==================== */}
      {activeTab === 'pending-students' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Phần 1A: Học sinh đang chờ duyệt / Không được phép làm bài (chỉ làm thử 3 bài đầu) */}
          <div className="bg-white rounded-3xl border-2 border-amber-300 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-900 text-[11px] font-black px-2.5 py-0.5 rounded-md">
                    MẶC ĐỊNH KHI ĐĂNG KÝ MỚI
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                  Học sinh đang Chờ duyệt / Không cho phép làm bài ({restrictedStudents.length} tài khoản)
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Các học sinh trong danh sách này hiện <strong>chỉ được làm thử 3 bài ở dòng đầu (Bài 1, 2, 3)</strong> và <strong>không được làm các bài ôn từ Bài 4–20 hay Bài thi/Kiểm tra</strong>. Nhấn <strong>"Cho phép làm bài"</strong> để mở khóa toàn bộ cho học sinh.
                </p>
              </div>

              {restrictedStudents.length > 0 && (
                <button
                  type="button"
                  onClick={handleApproveAllPendingStudents}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cho phép tất cả ({restrictedStudents.length} HS)</span>
                </button>
              )}
            </div>

            {restrictedStudents.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                Hiện không có học sinh nào đang chờ duyệt quyền làm bài.
              </div>
            ) : (
              <div className="space-y-3">
                {restrictedStudents.map((st) => (
                  <div
                    key={st.email}
                    className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm sm:text-base text-slate-900">
                          {st.fullName}
                        </span>
                        <span className="bg-amber-200/80 text-amber-950 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                          🔒 Đang giới hạn (Chỉ làm thử 3 bài đầu)
                        </span>
                        <span className="bg-sky-100 text-sky-900 text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                          Lớp {st.className || `${st.grade}A1`} (Khối {st.grade})
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 flex flex-wrap gap-3">
                        <span>Gmail: <strong>{st.email}</strong></span>
                        <span>·</span>
                        <span>🏫 Trường: <strong>{st.school || 'Chưa cập nhật'}</strong></span>
                        {st.matchedTeacherName && (
                          <>
                            <span>·</span>
                            <span className="text-sky-800 font-semibold">
                              GV Lớp: {st.matchedTeacherName} (
                              {st.teacherClassStatus === 'approved'
                                ? 'Đã vào lớp GV'
                                : 'Đang đợi GV cho vào lớp'}
                              )
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStudentPermission(st.email, true)}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Cho phép làm mọi bài luyện & bài thi</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Phần 1B: Học sinh ĐÃ ĐƯỢC CHO PHÉP làm toàn bộ bài luyện & bài thi */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  Học sinh Đã được Admin cho phép làm mọi bài luyện & bài thi ({allowedStudents.length} học sinh)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bạn có thể bấm "Không cho phép" bất kỳ lúc nào để khóa lại (chỉ cho làm thử 3 bài đầu).
                </p>
              </div>
            </div>

            {allowedStudents.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                Chưa có học sinh nào được cấp quyền làm toàn bộ bài luyện.
              </div>
            ) : (
              <div className="space-y-2.5">
                {allowedStudents.map((st) => (
                  <div
                    key={st.email}
                    className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-slate-900">{st.fullName}</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                          ✓ Đã cho phép làm toàn bộ bài luyện & đề thi
                        </span>
                        <span className="text-xs font-bold text-sky-800">
                          Lớp {st.className || `${st.grade}A1`} · {st.school}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Gmail: {st.email}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStudentPermission(st.email, false)}
                      className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Không cho phép (Khóa về 3 bài đầu)</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: CHỜ DUYỆT TÀI KHOẢN GIÁO VIÊN (TÁCH RIÊNG) ==================== */}
      {activeTab === 'pending-teachers' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Phần 2A: Giáo viên đang chờ Admin xét duyệt */}
          <div className="bg-white rounded-3xl border-2 border-sky-300 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="bg-sky-100 text-sky-900 text-[11px] font-black px-2.5 py-0.5 rounded-md">
                  XÉT DUYỆT GIÁO VIÊN ĐĂNG KÝ MỚI
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                  Tài khoản Giáo viên đang chờ Admin xét duyệt ({pendingTeachers.length} giáo viên)
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Khi Admin bấm <strong>"Duyệt Giáo Viên"</strong>, giáo viên đó sẽ được kích hoạt quyền quản lý Lớp & Trường đang dạy, duyệt học sinh vào lớp, tự tạo bài tập và xem kết quả làm bài của học sinh.
                </p>
              </div>

              {pendingTeachers.length > 0 && (
                <button
                  type="button"
                  onClick={handleApproveAllPendingTeachers}
                  className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-2xl shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Duyệt tất cả Giáo viên ({pendingTeachers.length})</span>
                </button>
              )}
            </div>

            {pendingTeachers.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                Hiện không có tài khoản Giáo viên nào đang chờ xét duyệt.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTeachers.map((tc) => (
                  <div
                    key={tc.email}
                    className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm sm:text-base text-slate-900">
                          Giáo viên: {tc.fullName}
                        </span>
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                          ⏳ Chờ Admin duyệt
                        </span>
                        <span className="bg-sky-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                          Dạy Lớp {tc.className || `${tc.grade}A1`} (Khối {tc.grade})
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 flex flex-wrap gap-3">
                        <span>Gmail: <strong>{tc.email}</strong></span>
                        <span>·</span>
                        <span>🏫 Trường đang dạy: <strong>{tc.school || 'Chưa cập nhật'}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTeacherDecision(tc.email, 'approved')}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Duyệt Giáo Viên Này</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTeacherDecision(tc.email, 'rejected')}
                        className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Phần 2B: Giáo viên đã được Admin xét duyệt */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 border-b border-slate-100 pb-3">
              Danh sách Giáo viên đã được Admin xét duyệt ({approvedTeachers.length} giáo viên)
            </h3>

            {approvedTeachers.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                Chưa có giáo viên nào trong danh sách đã duyệt.
              </div>
            ) : (
              <div className="space-y-2.5">
                {approvedTeachers.map((tc) => (
                  <div
                    key={tc.email}
                    className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-slate-900">
                          GV. {tc.fullName}
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                          ✓ Đã được Admin duyệt
                        </span>
                        <span className="text-xs font-bold text-sky-800">
                          Lớp đang dạy: {tc.className} · Trường: {tc.school}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Gmail: {tc.email}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTeacherDecision(tc.email, 'pending')}
                      className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs rounded-xl shrink-0 cursor-pointer"
                    >
                      Chuyển về Chờ duyệt
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 3: QUẢN LÝ TOÀN BỘ TÀI KHOẢN ==================== */}
      {activeTab === 'all-accounts' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5 animate-in fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Quản Lý Toàn Bộ Tài Khoản Học Sinh & Giáo Viên ({accounts.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Admin có toàn quyền đổi mật khẩu, sửa Lớp/Trường, cấp/khóa quyền làm bài và xóa bất kỳ tài khoản nào.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(['all', 'student', 'teacher'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    roleFilter === r
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-sky-50'
                  }`}
                >
                  {r === 'all'
                    ? `Tất cả (${accounts.length})`
                    : r === 'student'
                      ? `Học sinh (${allStudents.length})`
                      : `Giáo viên (${allTeachers.length})`}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo họ tên, địa chỉ Gmail, tên lớp hoặc trường học..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {filteredAccounts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
              Không tìm thấy tài khoản nào khớp điều kiện lọc.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAccounts.map((acc) => {
                const emailKey = acc.email.toLowerCase();
                const isEditingPass = editingPasswordEmail === emailKey;
                const isEditingInfo = editingInfoEmail === emailKey;
                const isDeleting = deletingEmail === emailKey;

                return (
                  <div
                    key={emailKey}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-3"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                              acc.role === 'teacher'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {acc.role === 'teacher' ? 'GIÁO VIÊN' : 'HỌC SINH'}
                          </span>
                          <span className="font-extrabold text-sm text-slate-900">
                            {acc.fullName}
                          </span>
                          <span className="text-xs font-bold text-sky-700">
                            Lớp {acc.className || `${acc.grade}A1`} (Khối {acc.grade})
                          </span>
                          <span className="text-xs text-slate-600">🏫 {acc.school}</span>
                        </div>

                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                          <span>Gmail: <strong>{acc.email}</strong></span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            Mật khẩu:{' '}
                            <strong className="font-mono text-slate-800">
                              {showPassMap[emailKey] ? acc.password || '(Chưa đặt)' : '••••••••'}
                            </strong>
                            <button
                              type="button"
                              onClick={() =>
                                setShowPassMap((prev) => ({
                                  ...prev,
                                  [emailKey]: !prev[emailKey],
                                }))
                              }
                              className="text-sky-600 hover:text-sky-800 ml-1 cursor-pointer"
                            >
                              {showPassMap[emailKey] ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </span>
                          <span>·</span>
                          {acc.role === 'student' ? (
                            <span
                              className={`font-bold ${
                                acc.canPracticeAll ? 'text-emerald-700' : 'text-amber-700'
                              }`}
                            >
                              {acc.canPracticeAll
                                ? '✓ Được phép làm mọi bài'
                                : '🔒 Không cho phép (Chỉ 3 bài đầu)'}
                            </span>
                          ) : (
                            <span
                              className={`font-bold ${
                                acc.teacherApprovalStatus === 'approved'
                                  ? 'text-emerald-700'
                                  : 'text-amber-700'
                              }`}
                            >
                              {acc.teacherApprovalStatus === 'approved'
                                ? '✓ GV Đã duyệt'
                                : '⏳ GV Chờ duyệt'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        {acc.role === 'student' ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleStudentPermission(acc.email, !acc.canPracticeAll)
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer ${
                              acc.canPracticeAll
                                ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                                : 'bg-emerald-600 text-white hover:bg-emerald-500'
                            }`}
                          >
                            {acc.canPracticeAll
                              ? 'Khóa về 3 bài đầu'
                              : 'Cho phép làm mọi bài'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleTeacherDecision(
                                acc.email,
                                acc.teacherApprovalStatus === 'approved' ? 'pending' : 'approved'
                              )
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer ${
                              acc.teacherApprovalStatus === 'approved'
                                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {acc.teacherApprovalStatus === 'approved'
                              ? 'Thu hồi duyệt GV'
                              : 'Duyệt Giáo viên'}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setEditingInfoEmail(isEditingInfo ? null : emailKey);
                            setEditGrade(acc.grade);
                            setEditClass(acc.className || `${acc.grade}A1`);
                            setEditSchool(acc.school || '');
                            setEditingPasswordEmail(null);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Sửa Lớp/Trường</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingPasswordEmail(isEditingPass ? null : emailKey);
                            setNewPasswordInput('');
                            setEditingInfoEmail(null);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Đổi MK</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingEmail(isDeleting ? null : emailKey)}
                          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>

                    {isEditingInfo && (
                      <div className="p-3 rounded-xl bg-white border border-sky-200 grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <select
                          value={editGrade}
                          onChange={(e) => {
                            const g = Number(e.target.value) as GradeLevel;
                            setEditGrade(g);
                            setEditClass(`${g}A1`);
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                            <option key={g} value={g}>
                              Khối {g}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={editClass}
                          onChange={(e) => setEditClass(e.target.value)}
                          placeholder="Tên lớp (VD: 4A1)"
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                        />
                        <input
                          type="text"
                          value={editSchool}
                          onChange={(e) => setEditSchool(e.target.value)}
                          placeholder="Tên trường..."
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveAccountInfo(acc.email)}
                          className="px-3 py-1.5 bg-sky-600 text-white font-extrabold text-xs rounded-lg cursor-pointer"
                        >
                          Lưu Lớp & Trường
                        </button>
                      </div>
                    )}

                    {isEditingPass && (
                      <div className="p-3 rounded-xl bg-white border border-amber-200 flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          placeholder="Nhập mật khẩu mới (> 6 ký tự)..."
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveNewPassword(acc.email)}
                          className="px-4 py-1.5 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-lg cursor-pointer"
                        >
                          Lưu mật khẩu mới
                        </button>
                      </div>
                    )}

                    {isDeleting && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-red-800">
                          Xác nhận xóa vĩnh viễn tài khoản {acc.fullName} ({acc.email})?
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteAccount(acc.email)}
                            className="px-3 py-1 bg-red-600 text-white font-extrabold rounded-lg cursor-pointer"
                          >
                            Xác nhận xóa
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingEmail(null)}
                            className="px-3 py-1 bg-white text-slate-700 border border-slate-200 font-bold rounded-lg cursor-pointer"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 4: SỬA TRỰC TIẾP TRANG WEB & NỘI DUNG BÀI LUYỆN ==================== */}
      {activeTab === 'site-editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          {/* Cột trái: Sửa trực tiếp văn bản & giao diện trang web */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-sky-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  Sửa Trực Tiếp Giao Diện & Nội Dung Trang Web
                </h3>
                <p className="text-xs text-slate-500">
                  Mọi thay đổi được áp dụng trực tiếp lên Trang chủ, Thanh điều hướng và Chân trang.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetSiteConfig}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Mặc định</span>
              </button>
            </div>

            <form onSubmit={handleSaveSiteConfig} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Dòng thông báo thanh trên cùng (Header):
                </label>
                <input
                  type="text"
                  value={siteConfig.topBannerText}
                  onChange={(e) =>
                    setSiteConfig({ ...siteConfig, topBannerText: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nhãn nổi bật đầu Trang chủ (Hero Badge):
                </label>
                <input
                  type="text"
                  value={siteConfig.heroBadgeText}
                  onChange={(e) =>
                    setSiteConfig({ ...siteConfig, heroBadgeText: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tiêu đề dòng 1:</label>
                  <input
                    type="text"
                    value={siteConfig.heroTitleLine1}
                    onChange={(e) =>
                      setSiteConfig({ ...siteConfig, heroTitleLine1: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chữ nổi bật:</label>
                  <input
                    type="text"
                    value={siteConfig.heroTitleHighlight}
                    onChange={(e) =>
                      setSiteConfig({ ...siteConfig, heroTitleHighlight: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-sky-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tiêu đề dòng 2:</label>
                  <input
                    type="text"
                    value={siteConfig.heroTitleLine2}
                    onChange={(e) =>
                      setSiteConfig({ ...siteConfig, heroTitleLine2: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mô tả giới thiệu Trang chủ:
                </label>
                <textarea
                  rows={3}
                  value={siteConfig.heroDescription}
                  onChange={(e) =>
                    setSiteConfig({ ...siteConfig, heroDescription: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mô tả giới thiệu ở Chân trang (Footer):
                </label>
                <textarea
                  rows={2}
                  value={siteConfig.footerDescription}
                  onChange={(e) =>
                    setSiteConfig({ ...siteConfig, footerDescription: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Thay Đổi Trực Tiếp Lên Trang Web</span>
              </button>
            </form>
          </div>

          {/* Cột phải: Sửa trực tiếp các bài luyện của 12 khối lớp */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                Sửa Trực Tiếp 60 Bài Luyện Theo Khối Lớp
              </h3>
              <p className="text-xs text-slate-500">
                Chọn khối lớp và môn học để sửa trực tiếp tên bài luyện, mô tả hoặc mức độ hiển thị trên web.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={editorGrade}
                onChange={(e) => setEditorGrade(Number(e.target.value) as GradeLevel)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-extrabold text-sky-900 bg-sky-50"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                  <option key={g} value={g}>
                    Khối Lớp {g}
                  </option>
                ))}
              </select>

              {[
                { id: 'tieng-viet', label: '📖 Môn Văn (20 bài)' },
                { id: 'toan', label: '📐 Môn Toán (20 bài)' },
                { id: 'tieng-anh', label: '🌍 Môn Anh (20 bài)' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setEditorSubject(s.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                    editorSubject === s.id
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-sky-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2.5 pr-1">
              {lessonsForEditor.map((les, idx) => {
                const isEditing = editingLessonId === les.id;
                return (
                  <div
                    key={les.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-sky-100 text-sky-900">
                          Bài {idx + 1} · {les.difficulty} {idx < 3 ? '(Mở làm thử)' : '(Cần Admin cho phép)'}
                        </span>
                        <h4 className="font-extrabold text-slate-900 mt-1">{les.title}</h4>
                        <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">
                          {les.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (isEditing) {
                            setEditingLessonId(null);
                          } else {
                            setEditingLessonId(les.id);
                            setEditLessonTitle(les.title);
                            setEditLessonDesc(les.description);
                            setEditLessonDiff(les.difficulty);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 font-bold shrink-0 cursor-pointer"
                      >
                        {isEditing ? 'Đóng' : '✏️ Sửa bài này'}
                      </button>
                    </div>

                    {isEditing && (
                      <div className="p-3 rounded-xl bg-white border border-sky-200 space-y-2">
                        <input
                          type="text"
                          value={editLessonTitle}
                          onChange={(e) => setEditLessonTitle(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold"
                          placeholder="Tên bài luyện..."
                        />
                        <textarea
                          rows={2}
                          value={editLessonDesc}
                          onChange={(e) => setEditLessonDesc(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                          placeholder="Mô tả bài luyện..."
                        />
                        <div className="flex items-center justify-between gap-2">
                          <select
                            value={editLessonDiff}
                            onChange={(e) => setEditLessonDiff(e.target.value as any)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold"
                          >
                            <option value="Cơ bản">Cơ bản</option>
                            <option value="Thông hiểu">Thông hiểu</option>
                            <option value="Vận dụng">Vận dụng</option>
                            <option value="Vận dụng cao">Vận dụng cao</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleSaveLessonDirectEdit(les.id)}
                            className="px-4 py-1.5 bg-sky-600 text-white font-extrabold rounded-lg cursor-pointer"
                          >
                            Lưu bài luyện
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
