import React, { useState } from 'react';
import {
  Calculator,
  BookOpen,
  Globe,
  Brain,
  Sparkles,
  Compass,
  Play,
  Clock,
  Search,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { GradeLevel, Lesson, UserAccount } from '../types';
import { SUBJECTS } from '../data/bonbenData';
import {
  getVietnamese20LessonsByGrade,
  getEnglish20LessonsByGrade,
  getMath20LessonsByGrade
} from '../data/practiceLessonsData';
import { getLessonProgress } from '../services/progressTracker';
import {
  canUserAccessLesson,
  applyLessonOverrides
} from '../services/schoolManager';

interface CurriculumMatrixProps {
  currentGrade: GradeLevel;
  onSelectGrade: (grade: GradeLevel) => void;
  onOpenLesson: (lessonId: string) => void;
  currentUser?: UserAccount | null;
  userEmail?: string | null;
  onLockedNotice?: (msg: string) => void;
  progressVersion?: number;
}

export const CurriculumMatrix: React.FC<CurriculumMatrixProps> = ({
  currentGrade,
  onSelectGrade,
  onOpenLesson,
  currentUser = null,
  userEmail,
  onLockedNotice,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('tieng-viet');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const gradeTiers = [
    { label: 'Tiểu học (Lớp 1 - 5)', grades: [1, 2, 3, 4, 5] as GradeLevel[] },
    { label: 'THCS (Lớp 6 - 9)', grades: [6, 7, 8, 9] as GradeLevel[] },
    { label: 'THPT (Lớp 10 - 12)', grades: [10, 11, 12] as GradeLevel[] },
  ];

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calculator': return <Calculator className="w-5 h-5" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5" />;
      case 'Globe': return <Globe className="w-5 h-5" />;
      case 'Brain': return <Brain className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'Compass': return <Compass className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  // Lấy đúng 20 bài luyện riêng biệt của từng môn theo đúng khối lớp currentGrade đang chọn (kèm chỉnh sửa trực tiếp của Admin nếu có)
  const vietnamese20ForGrade = applyLessonOverrides(getVietnamese20LessonsByGrade(currentGrade));
  const math20ForGrade = applyLessonOverrides(getMath20LessonsByGrade(currentGrade));
  const english20ForGrade = applyLessonOverrides(getEnglish20LessonsByGrade(currentGrade));

  const getLessonsForSubject = (subjectId: string): Lesson[] => {
    if (subjectId === 'tieng-viet') return vietnamese20ForGrade;
    if (subjectId === 'toan') return math20ForGrade;
    if (subjectId === 'tieng-anh') return english20ForGrade;
    return vietnamese20ForGrade;
  };

  const rawLessons = getLessonsForSubject(selectedSubjectId);

  const filteredLessons = rawLessons.filter((l) => {
    const matchesSearch =
      searchQuery === '' ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const selectedSubject = SUBJECTS.find((s) => s.id === selectedSubjectId) || SUBJECTS[0];
  const subjectDisplayName =
    selectedSubjectId === 'tieng-viet'
      ? currentGrade <= 5
        ? `Môn Tiếng Việt (Văn) Lớp ${currentGrade}`
        : `Môn Ngữ văn Lớp ${currentGrade}`
      : selectedSubjectId === 'toan'
        ? `Môn Toán học Lớp ${currentGrade}`
        : `Môn Tiếng Anh Lớp ${currentGrade}`;

  return (
    <section id="courses" className="py-14 sm:py-20 bg-white border-b border-sky-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 bg-sky-50 px-3.5 py-1.5 rounded-full mb-3 border border-sky-100">
              <BookOpen className="w-3.5 h-3.5 text-sky-600" />
              <span>CHƯƠNG TRÌNH CHUẨN BỘ GIÁO DỤC & ĐÀO TẠO · LỚP {currentGrade}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Khóa học & 20 Bài luyện chuyên đề mỗi môn (Lớp {currentGrade})
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-xl font-normal leading-relaxed">
              Hệ thống gồm 3 môn trọng tâm: <strong>Văn, Toán, Anh</strong>. Nếu Admin chưa cho phép tài khoản, học sinh chỉ được làm thử <strong>3 bài ở dòng đầu tiên</strong>; khi Admin cho phép sẽ mở khóa toàn bộ 20 bài/môn.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Tìm bài luyện ${subjectDisplayName}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 rounded-2xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Tier and Grade Selector Segmented Tab */}
        <div className="bg-sky-50/60 p-2 sm:p-2.5 rounded-2xl border border-sky-100 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-sky-900 px-2">Cấp học:</span>
              {gradeTiers.map((tier) => {
                const isActiveTier = tier.grades.includes(currentGrade);
                return (
                  <button
                    key={tier.label}
                    onClick={() => onSelectGrade(tier.grades[0])}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActiveTier
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-sky-100/70 border border-sky-100/80'
                    }`}
                  >
                    {tier.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto py-1">
              <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">Khối lớp:</span>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                <button
                  key={g}
                  onClick={() => onSelectGrade(g as GradeLevel)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                    currentGrade === g
                      ? 'bg-sky-600 text-white shadow-xs scale-105'
                      : 'bg-white text-slate-700 hover:bg-sky-100/80 border border-slate-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Core Subjects Grid Selector: Văn, Toán, Anh */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {SUBJECTS.map((sub) => {
            const isSelected = sub.id === selectedSubjectId;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`p-5 rounded-2xl text-left border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-b from-sky-600 to-blue-600 text-white border-transparent shadow-md shadow-sky-600/20 scale-[1.01]'
                    : 'bg-white text-slate-800 border-slate-200/80 hover:border-sky-300 hover:bg-sky-50/40 hover:shadow-xs'
                }`}
              >
                <span
                  className={`absolute top-3 right-3 text-[10px] font-black px-2.5 py-0.5 rounded-md ${
                    isSelected ? 'bg-white/20 text-white backdrop-blur-xs' : 'bg-sky-100 text-sky-800'
                  }`}
                >
                  Lớp {currentGrade} · 20 bài luyện
                </span>
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-sky-50 text-sky-600'
                  }`}
                >
                  {getSubjectIcon(sub.iconName)}
                </div>
                <div className="font-extrabold text-base leading-tight">
                  {sub.id === 'tieng-viet'
                    ? `Môn Văn (${currentGrade <= 5 ? 'Tiếng Việt' : 'Ngữ văn'} Lớp ${currentGrade})`
                    : sub.id === 'toan'
                      ? `Môn Toán (Toán học Lớp ${currentGrade})`
                      : `Môn Anh (Tiếng Anh Lớp ${currentGrade})`}
                </div>
                <div className={`text-xs mt-1 font-medium ${isSelected ? 'text-sky-100' : 'text-slate-500'}`}>
                  Đúng 20 bài luyện chuyên đề {sub.name} Lớp {currentGrade} (400 câu hỏi)
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Subject Overview Banner */}
        <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-blue-800 rounded-3xl p-6 sm:p-8 text-white mb-10 shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="bg-sky-400 text-slate-900 text-xs font-black px-3 py-1 rounded-xl shadow-xs">
                  KHỐI LỚP {currentGrade}
                </span>
                <span className="text-sky-200 text-xs font-medium bg-white/10 px-2.5 py-0.5 rounded-lg backdrop-blur-xs">
                  Chỉ hiển thị duy nhất dạng bài của {subjectDisplayName}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {subjectDisplayName} - Trọn Bộ {filteredLessons.length} Bài Luyện Chuyên Đề
              </h3>
              <p className="text-sky-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
                {selectedSubject.description} Mỗi bài luyện bao gồm đúng 20 câu hỏi trắc nghiệm có lời giải chi tiết dành riêng cho học sinh Lớp {currentGrade}.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => onOpenLesson(filteredLessons[0]?.id || `van-g${currentGrade}-bai-1`)}
                className="px-6 py-3.5 bg-white text-sky-900 hover:bg-sky-50 rounded-2xl font-extrabold text-sm shadow-md flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-sky-800 text-sky-800" />
                <span>Làm thử ngay Bài số 1 (20 câu)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lessons List Grid */}
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-lg font-extrabold text-slate-900">
              Danh sách 20 bài luyện {subjectDisplayName} ({filteredLessons.length} bài luyện · {filteredLessons.length * 20} câu hỏi)
            </h4>
            <span className="text-xs text-sky-700 font-semibold bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              {currentUser?.canPracticeAll || currentUser?.role === 'admin' || currentUser?.role === 'teacher'
                ? '✓ Tài khoản đã được mở khóa toàn bộ 20 bài luyện'
                : '🔒 Đang mở làm thử 3 bài đầu · Từ Bài 4–20 cần Admin cho phép'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLessons.map((lesson) => {
              const realProg = getLessonProgress(lesson.id, userEmail, {
                title: lesson.title,
                grade: currentGrade,
                totalQuestions: 20,
              });
              const isPracticed = realProg.answeredCount > 0;
              const isAllowed = canUserAccessLesson(currentUser || null, lesson.id);

              return (
                <div
                  key={lesson.id}
                  className={`rounded-2xl border transition-all p-5 flex flex-col justify-between group ${
                    isAllowed
                      ? 'bg-white border-slate-200/80 hover:border-sky-300 hover:shadow-card-hover'
                      : 'bg-slate-50/80 border-slate-200 opacity-90'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-extrabold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-lg">
                          {selectedSubjectId === 'tieng-viet'
                            ? `${currentGrade <= 5 ? 'Tiếng Việt' : 'Ngữ văn'} Lớp ${currentGrade}`
                            : selectedSubjectId === 'toan'
                              ? `Toán Lớp ${currentGrade}`
                              : `Tiếng Anh Lớp ${currentGrade}`}
                        </span>
                        {!isAllowed ? (
                          <span className="text-[10px] font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>Chờ Admin duyệt</span>
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-100">
                            {lesson.difficulty}
                          </span>
                        )}
                      </div>
                      <div
                        className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border shrink-0 ${
                          isPracticed
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                            : 'text-slate-500 bg-slate-100 border-slate-200'
                        }`}
                      >
                        {isPracticed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Đã làm {realProg.answeredCount}/20 câu</span>
                          </>
                        ) : (
                          <span>Chưa làm (0/20 câu)</span>
                        )}
                      </div>
                    </div>

                    <h5 className="font-extrabold text-slate-900 text-base group-hover:text-sky-600 transition-colors line-clamp-2">
                      {lesson.title}
                    </h5>

                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {lesson.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {lesson.duration}
                      </span>
                      <span className={`font-bold ${isPracticed ? 'text-sky-700' : 'text-slate-500'}`}>
                        {isPracticed
                          ? `Đã hiểu: ${realProg.understandingRate}% (Đúng ${realProg.correctCount}/${realProg.answeredCount} câu)`
                          : 'Đã hiểu: 0% (Chưa làm)'}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-sky-500 to-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${realProg.understandingRate}%` }}
                      ></div>
                    </div>

                    <button
                      onClick={() => {
                        if (!isAllowed) {
                          if (onLockedNotice) {
                            onLockedNotice(
                              '🔒 Tài khoản của bạn chưa được Admin cho phép làm bài ôn này! Hiện tại bạn chỉ được làm thử 3 bài ở dòng đầu (Bài 1, 2, 3). Vui lòng đợi Admin duyệt!'
                            );
                          }
                          return;
                        }
                        onOpenLesson(lesson.id);
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                        isAllowed
                          ? 'bg-sky-50 hover:bg-sky-600 text-sky-800 hover:text-white'
                          : 'bg-slate-200/80 hover:bg-amber-100 text-slate-600 hover:text-amber-900'
                      }`}
                    >
                      {!isAllowed ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Khóa · Chờ Admin cho phép làm bài</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>
                            {isPracticed
                              ? `Tiếp tục / Làm lại (${realProg.answeredCount}/20 câu)`
                              : 'Vào học & Luyện 20 câu ngay'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
