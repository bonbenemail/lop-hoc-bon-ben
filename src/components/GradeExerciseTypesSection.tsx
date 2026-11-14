import React, { useState } from 'react';
import {
  Calculator,
  Shapes,
  Scale,
  BookOpen,
  Zap,
  Target,
  TrendingUp,
  Clock,
  Play,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Search,
  Globe,
  CheckCircle2,
  Lock,
  Users
} from 'lucide-react';
import { GradeLevel, ExerciseType, UserAccount } from '../types';
import { MASCOT_IMAGE } from '../data/bonbenData';
import {
  getVietnamese20ExercisesByGrade,
  getEnglish20ExercisesByGrade,
  getMath20ExercisesByGrade
} from '../data/practiceLessonsData';
import { getLessonProgress } from '../services/progressTracker';
import {
  canUserAccessLesson,
  canUserAccessExam,
  getAssignmentsForStudent,
  getLessonOverrides,
  getConfiguredMascotImage
} from '../services/schoolManager';

interface GradeExerciseTypesSectionProps {
  currentGrade: GradeLevel;
  onSelectGrade: (grade: GradeLevel) => void;
  currentUser: UserAccount | null;
  onOpenLesson: (exerciseId: string) => void;
  onOpenExam: () => void;
  onLockedNotice?: (msg: string) => void;
  progressVersion?: number;
}

export const GradeExerciseTypesSection: React.FC<GradeExerciseTypesSectionProps> = ({
  currentGrade,
  onSelectGrade,
  currentUser,
  onOpenLesson,
  onOpenExam,
  onLockedNotice,
}) => {
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<'tieng-viet' | 'toan' | 'tieng-anh'>('tieng-viet');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const overrides = getLessonOverrides();

  const applyOverrideToEx = (list: ExerciseType[]): ExerciseType[] =>
    list.map((ex) => {
      const ov = overrides[ex.id];
      if (!ov) return ex;
      return {
        ...ex,
        name: ov.title || ex.name,
        description: ov.description || ex.description,
      };
    });

  // Toàn bộ 20 bài luyện Văn, 20 bài luyện Toán và 20 bài luyện Anh đều thuộc đúng khối lớp currentGrade đang chọn
  const vietnamese20Exercises: ExerciseType[] = applyOverrideToEx(
    getVietnamese20ExercisesByGrade(currentGrade)
  );
  const math20Exercises: ExerciseType[] = applyOverrideToEx(
    getMath20ExercisesByGrade(currentGrade)
  );
  const english20Exercises: ExerciseType[] = applyOverrideToEx(
    getEnglish20ExercisesByGrade(currentGrade)
  );

  const activeSubjectList: ExerciseType[] =
    filterSubject === 'tieng-viet'
      ? vietnamese20Exercises
      : filterSubject === 'toan'
        ? math20Exercises
        : english20Exercises;

  const activeSubjectLabel =
    filterSubject === 'tieng-viet'
      ? currentGrade <= 5
        ? `Môn Tiếng Việt (Văn) Lớp ${currentGrade}`
        : `Môn Ngữ văn Lớp ${currentGrade}`
      : filterSubject === 'toan'
        ? `Môn Toán học Lớp ${currentGrade}`
        : `Môn Tiếng Anh Lớp ${currentGrade}`;

  const filteredExercises = activeSubjectList.filter((item) => {
    const matchDiff = filterDifficulty === 'all' || item.difficulty === filterDifficulty;
    const matchSearch =
      searchTerm.trim() === '' ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDiff && matchSearch;
  });

  // Bài tập do Giáo viên của lớp giao (chỉ hiển thị khi học sinh đã được Giáo viên duyệt vào lớp)
  const teacherClassAssignments = getAssignmentsForStudent(currentUser);
  const examUnlocked = canUserAccessExam(currentUser);

  const getExerciseIcon = (iconName: string, subject: string) => {
    if (subject.includes('Tiếng Anh')) return <Globe className="w-5 h-5" />;
    if (subject.includes('Tiếng Việt') || subject.includes('Ngữ văn')) return <BookOpen className="w-5 h-5" />;
    switch (iconName) {
      case 'Calculator': return <Calculator className="w-5 h-5" />;
      case 'Shapes': return <Shapes className="w-5 h-5" />;
      case 'Scale': return <Scale className="w-5 h-5" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'Target': return <Target className="w-5 h-5" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5" />;
      case 'Clock': return <Clock className="w-5 h-5" />;
      default: return <Calculator className="w-5 h-5" />;
    }
  };

  return (
    <section id="exercise-types" className="py-12 sm:py-16 bg-white border-b border-sky-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Thông báo trạng thái Quyền làm bài từ Admin & Lớp học của Giáo viên */}
        <div className="space-y-3">
          {(!currentUser || (currentUser.role === 'student' && !currentUser.canPracticeAll)) && (
            <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border-2 border-amber-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-black uppercase bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-full">
                      {currentUser
                        ? 'TÀI KHOẢN ĐANG CHỜ ADMIN DUYỆT CHO PHÉP LÀM BÀI'
                        : 'CHẾ ĐỘ LÀM THỬ 3 BÀI ĐẦU TIÊN'}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 mt-1">
                    Hiện chỉ mở làm thử 3 bài ở dòng đầu (Bài 1, Bài 2, Bài 3) của mỗi môn
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {currentUser
                      ? 'Tài khoản học sinh mới đăng ký mặc định ở trạng thái chờ Admin cho phép. Khi Admin duyệt cho phép, toàn bộ 20 bài luyện mỗi môn và Phòng thi & Kiểm tra sẽ được mở khóa 100%.'
                      : 'Vui lòng đăng ký / đăng nhập tài khoản và đợi Admin duyệt cho phép để mở khóa toàn bộ 20 bài luyện mỗi môn và Phòng thi.'}
                  </p>
                </div>
              </div>
              <span className="px-3.5 py-2 rounded-2xl bg-white border border-amber-300 text-amber-900 font-extrabold text-xs shrink-0 self-start md:self-center">
                Đang mở: 3/20 bài đầu mỗi môn
              </span>
            </div>
          )}

          {currentUser && currentUser.role === 'student' && currentUser.matchedTeacherName && (
            <div
              className={`p-4 sm:p-5 rounded-3xl border-2 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                currentUser.teacherClassStatus === 'approved'
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : 'bg-sky-50/80 border-sky-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold ${
                    currentUser.teacherClassStatus === 'approved'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-sky-600 text-white'
                  }`}
                >
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      currentUser.teacherClassStatus === 'approved'
                        ? 'bg-emerald-200 text-emerald-950'
                        : 'bg-sky-200 text-sky-950'
                    }`}
                  >
                    {currentUser.teacherClassStatus === 'approved'
                      ? '✓ ĐÃ ĐƯỢC GIÁO VIÊN CHO VÀO LỚP'
                      : '⏳ ĐANG ĐỢI GIÁO VIÊN CHO VÀO LỚP'}
                  </span>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 mt-1">
                    Lớp {currentUser.className} ({currentUser.school}) — Giáo viên phụ trách: {currentUser.matchedTeacherName}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {currentUser.teacherClassStatus === 'approved'
                      ? `Bạn đã chính thức vào lớp học của Giáo viên ${currentUser.matchedTeacherName}. Kết quả làm bài của bạn được đồng bộ trực tiếp cho giáo viên theo dõi.`
                      : `Bạn đăng ký trùng Lớp ${currentUser.className} và Trường ${currentUser.school} với Giáo viên ${currentUser.matchedTeacherName}. Vui lòng đợi Giáo viên duyệt cho vào lớp học!`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nếu học sinh đã được Giáo viên cho vào lớp và Giáo viên có giao bài tập riêng */}
        {teacherClassAssignments.length > 0 && (
          <div className="bg-gradient-to-br from-purple-50 via-sky-50 to-white rounded-3xl border-2 border-purple-200 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="bg-purple-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  BÀI TẬP DO GIÁO VIÊN LỚP GIAO ({teacherClassAssignments.length} BÀI)
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  Bài Tập Riêng Của Lớp {currentUser?.className} — {currentUser?.school}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teacherClassAssignments.map((ass) => {
                const prog = getLessonProgress(ass.id, currentUser?.email, {
                  title: ass.title,
                  grade: ass.grade,
                  totalQuestions: ass.sampleQuestions.length || 1,
                });
                const allowed = canUserAccessLesson(currentUser, ass.id);
                return (
                  <div
                    key={ass.id}
                    className="bg-white rounded-2xl border border-purple-200 p-4 flex flex-col justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                        <span className="text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">
                          GV: {ass.teacherName}
                        </span>
                        <span className="text-sky-700">
                          {prog.answeredCount}/{ass.sampleQuestions.length} câu ({prog.understandingRate}%)
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900">{ass.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{ass.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!allowed) {
                          if (onLockedNotice) {
                            onLockedNotice(
                              '🔒 Tài khoản của bạn đang chờ Admin duyệt cho phép làm bài! Hiện tại chỉ mở làm thử 3 bài đầu tiên.'
                            );
                          }
                          return;
                        }
                        onOpenLesson(ass.id);
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer ${
                        allowed
                          ? 'bg-purple-600 hover:bg-purple-500 text-white'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {allowed ? (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Làm bài tập Giáo viên giao</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Chờ Admin cho phép làm bài</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Personalized Welcome Banner if User is Logged In */}
        {currentUser && (
          <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-sky-500/20 rounded-full blur-2xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl overflow-hidden border-2 border-sky-400 p-0.5 bg-sky-950 shrink-0 shadow-lg">
                  <img
                    src={getConfiguredMascotImage(MASCOT_IMAGE)}
                    onError={(event) => {
                      event.currentTarget.src = MASCOT_IMAGE;
                    }}
                    alt="Bon Ben"
                    className="w-full h-full object-cover rounded-[22px]"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-amber-400 text-sky-950 text-xs font-black px-2.5 py-0.5 rounded-lg">
                      {currentUser.canPracticeAll ? '✓ ĐÃ ĐƯỢC ADMIN CHO PHÉP LÀM BÀI' : '⏳ CHỜ ADMIN CHO PHÉP (MỞ 3 BÀI ĐẦU)'}
                    </span>
                    <span className="text-sky-200 text-xs">Mã: {currentUser.studentCode}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                    Bàn Học Cá Nhân: {currentUser.fullName} (Lớp {currentUser.className || currentGrade})
                  </h3>
                  <p className="text-xs sm:text-sm text-sky-200 mt-1 max-w-xl">
                    Hệ thống gồm <strong>20 bài luyện môn Văn Lớp {currentGrade}</strong>, <strong>20 bài luyện môn Toán Lớp {currentGrade}</strong> và <strong>20 bài luyện môn Tiếng Anh Lớp {currentGrade}</strong>.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={() => {
                    if (!examUnlocked) {
                      if (onLockedNotice) {
                        onLockedNotice(
                          '🔒 Bài thi & Kiểm tra chỉ mở khi Admin đã cho phép tài khoản của bạn làm bài! Hiện tại bạn chỉ có thể làm thử 3 bài đầu tiên.'
                        );
                      }
                      return;
                    }
                    onOpenExam();
                  }}
                  className={`px-5 py-3 font-extrabold text-xs sm:text-sm rounded-2xl shadow-md transition-transform cursor-pointer flex items-center gap-2 ${
                    examUnlocked
                      ? 'bg-white hover:bg-sky-50 text-sky-950 hover:scale-105'
                      : 'bg-white/15 text-sky-200 border border-white/20'
                  }`}
                >
                  {examUnlocked ? (
                    <>
                      <Sparkles className="w-4 h-4 text-sky-600" />
                      <span>Làm đề kiểm tra Lớp {currentGrade}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-300" />
                      <span>Đề kiểm tra (Chờ Admin cho phép)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-3.5 py-1 rounded-full mb-2 border border-sky-100">
              <GraduationCap className="w-4 h-4 text-sky-600" />
              <span>KHO BÀI LUYỆN CHUYÊN SÂU LỚP {currentGrade}: 3 MÔN VĂN · TOÁN · ANH</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-sky-950 tracking-tight">
              Hệ Thống 20 Bài Luyện Chuyên Đề Mỗi Môn (Lớp {currentGrade})
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Chọn 1 trong 3 môn học <strong>Văn, Toán, Anh</strong>. Nếu tài khoản chưa được Admin cho phép, học sinh chỉ được làm thử <strong>3 bài ở dòng đầu tiên</strong>; khi Admin cho phép sẽ làm được toàn bộ 20 bài/môn.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Tìm bài luyện ${activeSubjectLabel}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Prominent 3 Subject Tabs (Văn, Toán, Anh) & Difficulty Filter */}
        <div className="bg-sky-50/70 p-3 sm:p-4 rounded-3xl border border-sky-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterSubject('tieng-viet')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                filterSubject === 'tieng-viet'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-white text-slate-700 hover:bg-sky-100 border border-sky-200/70'
              }`}
            >
              <span>📖 Môn Văn (Lớp {currentGrade})</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  filterSubject === 'tieng-viet' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800'
                }`}
              >
                20 bài luyện
              </span>
            </button>

            <button
              onClick={() => setFilterSubject('toan')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                filterSubject === 'toan'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-white text-slate-700 hover:bg-sky-100 border border-sky-200/70'
              }`}
            >
              <span>📐 Môn Toán (Lớp {currentGrade})</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  filterSubject === 'toan' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800'
                }`}
              >
                20 bài luyện
              </span>
            </button>

            <button
              onClick={() => setFilterSubject('tieng-anh')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                filterSubject === 'tieng-anh'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-white text-slate-700 hover:bg-sky-100 border border-sky-200/70'
              }`}
            >
              <span>🌍 Môn Anh (Lớp {currentGrade})</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  filterSubject === 'tieng-anh' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800'
                }`}
              >
                20 bài luyện
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-sky-100 self-start lg:self-auto">
            {['all', 'Cơ bản', 'Vận dụng', 'Nâng cao'].map((diff) => (
              <button
                key={diff}
                onClick={() => setFilterDifficulty(diff)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterDifficulty === diff
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {diff === 'all' ? 'Mọi mức độ' : diff}
              </button>
            ))}
          </div>
        </div>

        {/* 12 Grades Quick Selector Pills */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-sky-900 shrink-0 ml-1">Đang học khối:</span>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
            <button
              key={g}
              onClick={() => onSelectGrade(g as GradeLevel)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                currentGrade === g
                  ? 'bg-sky-600 text-white shadow-sm scale-105'
                  : 'bg-white text-slate-700 hover:bg-sky-100 border border-slate-200'
              }`}
            >
              Lớp {g}
            </button>
          ))}
        </div>

        {/* Exercise Types Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExercises.map((ex) => {
            const realProg = getLessonProgress(ex.id, currentUser?.email, {
              title: ex.name,
              grade: currentGrade,
              totalQuestions: 20,
            });
            const isPracticed = realProg.answeredCount > 0;
            const isAllowed = canUserAccessLesson(currentUser, ex.id);

            return (
              <div
                key={ex.id}
                className={`rounded-3xl border transition-all p-5 flex flex-col justify-between group ${
                  isAllowed
                    ? 'bg-white border-slate-200 hover:border-sky-300 hover:shadow-xl'
                    : 'bg-slate-50/80 border-slate-200/90 opacity-90'
                }`}
              >
                <div>
                  {/* Card Top badges */}
                  <div className="flex items-center justify-between mb-3 gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200/60">
                        {ex.subject}
                      </span>
                      {!isAllowed ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>Chờ Admin duyệt</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                          {currentUser?.canPracticeAll ? 'Đã mở khóa' : 'Làm thử (3 bài đầu)'}
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                        isPracticed
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : 'text-slate-500 bg-slate-100 border-slate-200'
                      }`}
                    >
                      {isPracticed ? `Đã hiểu ${realProg.understandingRate}%` : 'Chưa làm (0%)'}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
                        isAllowed
                          ? 'bg-sky-50 text-sky-600 border-sky-100 group-hover:bg-sky-600 group-hover:text-white'
                          : 'bg-slate-200 text-slate-500 border-slate-300'
                      }`}
                    >
                      {isAllowed ? getExerciseIcon(ex.iconName, ex.subject) : <Lock className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-sky-600 transition-colors leading-snug">
                        {ex.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {ex.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Real Progress Bar & Button */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Tiến độ:{' '}
                      <strong className={isPracticed ? 'text-sky-800' : 'text-slate-700'}>
                        {isPracticed
                          ? `Đã làm ${realProg.answeredCount}/20 câu (Đúng ${realProg.correctCount})`
                          : 'Chưa làm (0/20 câu)'}
                      </strong>
                    </span>
                    <span className={`font-bold ${isPracticed ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {realProg.understandingRate}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${realProg.understandingRate}%` }}
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (!isAllowed) {
                        if (onLockedNotice) {
                          onLockedNotice(
                            '🔒 Tài khoản chưa được Admin cho phép làm bài ôn này! Hiện tại bạn chỉ được làm thử 3 bài ở dòng đầu tiên (Bài 1, 2, 3). Vui lòng đợi Admin duyệt cho phép!'
                          );
                        }
                        return;
                      }
                      onOpenLesson(ex.id);
                    }}
                    className={`w-full py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                      isAllowed
                        ? 'bg-sky-50 hover:bg-sky-600 text-sky-800 hover:text-white group-hover:shadow-md'
                        : 'bg-slate-200/80 hover:bg-amber-100 text-slate-600 hover:text-amber-900'
                    }`}
                  >
                    {!isAllowed ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Khóa · Chờ Admin cho phép làm bài</span>
                      </>
                    ) : isPracticed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Làm tiếp / Xem kết quả ({realProg.answeredCount}/20 câu)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Vào làm 20 câu bài luyện này</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
