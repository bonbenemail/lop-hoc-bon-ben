import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ArrowRight,
  Target,
  Zap,
  BookOpen,
  Calculator,
  Globe,
  RotateCcw,
  Clock,
  FileCheck2,
  XCircle
} from 'lucide-react';
import { GradeLevel, UserAccount } from '../types';
import { MASCOT_IMAGE } from '../data/bonbenData';
import {
  getVietnamese20LessonsByGrade,
  getMath20LessonsByGrade,
  getEnglish20LessonsByGrade
} from '../data/practiceLessonsData';
import {
  getLessonProgress,
  getSubjectRealStats,
  resetAllUserProgress,
  LessonProgressRecord
} from '../services/progressTracker';
import { applyLessonOverrides, getConfiguredMascotImage } from '../services/schoolManager';

interface AiLearningPathwayProps {
  currentGrade: GradeLevel;
  currentUser?: UserAccount | null;
  onOpenLesson: (lessonId?: string) => void;
  progressVersion?: number;
  onResetAllProgress?: () => void;
}

export const AiLearningPathway: React.FC<AiLearningPathwayProps> = ({
  currentGrade,
  currentUser,
  onOpenLesson,
  onResetAllProgress,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<'tieng-viet' | 'toan' | 'tieng-anh'>('tieng-viet');
  const [statusFilter, setStatusFilter] = useState<'all' | 'practiced' | 'unpracticed'>('all');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(`van-g${currentGrade}-bai-1`);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const userEmail = currentUser?.email || null;

  const vanLessons = applyLessonOverrides(getVietnamese20LessonsByGrade(currentGrade));
  const toanLessons = applyLessonOverrides(getMath20LessonsByGrade(currentGrade));
  const anhLessons = applyLessonOverrides(getEnglish20LessonsByGrade(currentGrade));

  const vanStats = getSubjectRealStats(currentGrade, 'tieng-viet', vanLessons, userEmail);
  const toanStats = getSubjectRealStats(currentGrade, 'toan', toanLessons, userEmail);
  const anhStats = getSubjectRealStats(currentGrade, 'tieng-anh', anhLessons, userEmail);

  const activeLessons =
    selectedSubject === 'tieng-viet'
      ? vanLessons
      : selectedSubject === 'toan'
      ? toanLessons
      : anhLessons;

  const activeSubjectStats =
    selectedSubject === 'tieng-viet'
      ? vanStats
      : selectedSubject === 'toan'
      ? toanStats
      : anhStats;

  useEffect(() => {
    const firstId = activeLessons[0]?.id || `van-g${currentGrade}-bai-1`;
    setSelectedLessonId(firstId);
  }, [currentGrade, selectedSubject]);

  const totalPracticedLessonsAll3 =
    vanStats.practicedLessonsCount +
    toanStats.practicedLessonsCount +
    anhStats.practicedLessonsCount;

  const totalAnsweredAll3 =
    vanStats.answeredQuestionsCount +
    toanStats.answeredQuestionsCount +
    anhStats.answeredQuestionsCount;

  const totalCorrectAll3 =
    vanStats.correctQuestionsCount +
    toanStats.correctQuestionsCount +
    anhStats.correctQuestionsCount;

  const totalWrongAll3 =
    vanStats.wrongQuestionsCount +
    toanStats.wrongQuestionsCount +
    anhStats.wrongQuestionsCount;

  const overallAll3Understanding = Math.round((totalCorrectAll3 / 1200) * 100);

  const allPracticedRecordsAcross3Subjects: LessonProgressRecord[] = [
    ...vanStats.practicedLessonsDetails,
    ...toanStats.practicedLessonsDetails,
    ...anhStats.practicedLessonsDetails,
  ];

  const filteredLessons = activeLessons.filter((lesson) => {
    const prog = getLessonProgress(lesson.id, userEmail);
    if (statusFilter === 'practiced') return prog.answeredCount > 0;
    if (statusFilter === 'unpracticed') return prog.answeredCount === 0;
    return true;
  });

  const selectedLessonObj =
    activeLessons.find((l) => l.id === selectedLessonId) || activeLessons[0];

  const selectedLessonProgress = getLessonProgress(
    selectedLessonObj.id,
    userEmail,
    {
      title: selectedLessonObj.title,
      subjectId: selectedSubject,
      grade: currentGrade,
      totalQuestions: 20,
    }
  );

  const renderLessonStatusBadge = (prog: LessonProgressRecord) => {
    if (prog.answeredCount === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>Chưa làm (0%)</span>
        </span>
      );
    }

    if (prog.answeredCount < prog.totalQuestions) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
          <TrendingUp className="w-3 h-3 text-amber-600" />
          <span>
            Đang làm ({prog.answeredCount}/20 câu · Đã hiểu {prog.understandingRate}%)
          </span>
        </span>
      );
    }

    if (prog.understandingRate >= 80) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Đã làm xong · Nắm vững ({prog.understandingRate}%)</span>
        </span>
      );
    }

    if (prog.understandingRate >= 50) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
          <CheckCircle2 className="w-3 h-3 text-sky-600" />
          <span>Đã làm xong · Mức Đạt ({prog.understandingRate}%)</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
        <AlertCircle className="w-3 h-3 text-red-600" />
        <span>Đã làm xong · Cần ôn lại ({prog.understandingRate}%)</span>
      </span>
    );
  };

  const handleConfirmResetAll = () => {
    resetAllUserProgress(userEmail);
    setConfirmResetOpen(false);
    if (onResetAllProgress) {
      onResetAllProgress();
    }
  };

  return (
    <section id="pathway" className="py-14 sm:py-20 bg-gradient-to-b from-sky-50/50 via-white to-sky-50/30 border-b border-sky-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 bg-sky-100/80 px-4 py-1.5 rounded-full mb-3 border border-sky-200/60 shadow-2xs">
            <BrainCircuit className="w-4 h-4 text-sky-600" />
            <span>CHẨN ĐOÁN AI TRUNG THỰC 100% THEO DỮ LIỆU LÀM BÀI THỰC TẾ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Bản Đồ Chẩn Đoán Năng Lực & Kết Quả Thực Tế (Lớp {currentGrade})
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2 font-normal leading-relaxed">
            Bài nào <strong>chưa làm</strong> sẽ hiển thị đúng <strong>Chưa làm (0%)</strong>. Bài nào <strong>đã làm</strong> sẽ báo cáo chính xác số câu đã làm, số câu đúng, số câu sai và phần trăm hiểu bài thực tế.
          </p>
        </div>

        {/* Interactive Dashboard Container */}
        <div className="bg-white rounded-3xl border border-sky-150 shadow-soft overflow-hidden">
          
          {/* Top Bar of the Dashboard */}
          <div className="bg-gradient-to-r from-sky-800 to-blue-800 text-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-sky-200 border border-white/15">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-sky-200 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>
                    Hồ sơ chẩn đoán thực tế:{' '}
                    <strong>{currentUser?.fullName || 'Học sinh Lớp học Bon Ben'}</strong> (Lớp {currentGrade})
                  </span>
                </div>
                <div className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                  {totalPracticedLessonsAll3 === 0
                    ? `Chưa làm bài luyện nào ở Lớp ${currentGrade} (Đã làm: 0/60 bài · 0/1.200 câu · Đã hiểu: 0%)`
                    : `Đã làm ${totalPracticedLessonsAll3}/60 bài (${totalAnsweredAll3}/1.200 câu) · Đúng ${totalCorrectAll3} câu · Sai ${totalWrongAll3} câu · Tổng hiểu bài: ${overallAll3Understanding}%`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {totalAnsweredAll3 > 0 && (
                <button
                  type="button"
                  onClick={() => setConfirmResetOpen(true)}
                  className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-white/20"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Đặt lại toàn bộ về 0%</span>
                </button>
              )}
            </div>
          </div>

          {/* 3 Subject Real Diagnostic Summary Cards */}
          <div className="p-5 sm:p-6 bg-sky-50/50 border-b border-sky-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                id: 'tieng-viet' as const,
                stats: vanStats,
                icon: <BookOpen className="w-4 h-4" />,
              },
              {
                id: 'toan' as const,
                stats: toanStats,
                icon: <Calculator className="w-4 h-4" />,
              },
              {
                id: 'tieng-anh' as const,
                stats: anhStats,
                icon: <Globe className="w-4 h-4" />,
              },
            ].map((item) => {
              const isSelected = selectedSubject === item.id;
              const s = item.stats;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedSubject(item.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-sky-500 shadow-sm ring-2 ring-sky-500/20'
                      : 'bg-white/80 border-slate-200 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 font-extrabold text-xs sm:text-sm text-slate-900">
                      <span className="p-1.5 rounded-lg bg-sky-100 text-sky-700">{item.icon}</span>
                      <span>{s.subjectName}</span>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        s.practicedLessonsCount > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {s.practicedLessonsCount > 0
                        ? `Đã hiểu ${s.overallUnderstandingRate}%`
                        : 'Chưa làm (0%)'}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-2">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${s.overallUnderstandingRate}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>
                      Đã làm: <strong>{s.practicedLessonsCount}/20 bài</strong> ({s.answeredQuestionsCount}/400 câu)
                    </span>
                    <span className="font-bold text-sky-700">
                      {s.practicedLessonsCount === 0
                        ? 'Chưa làm bài nào'
                        : `Đúng ${s.correctQuestionsCount} · Sai ${s.wrongQuestionsCount}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Grid: Left 20-Lesson Real Status List + Right Exact AI Diagnostic Report */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 7 Columns: 20 Lessons Breakdown for Selected Subject */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Chi tiết 20 bài luyện {activeSubjectStats.subjectName}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Đã làm: <strong className="text-emerald-600">{activeSubjectStats.practicedLessonsCount} bài</strong> · Chưa làm: <strong className="text-slate-700">{activeSubjectStats.unpracticedLessonsCount} bài (0%)</strong>
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  {[
                    { id: 'all', label: `Tất cả (20)` },
                    { id: 'practiced', label: `Đã làm (${activeSubjectStats.practicedLessonsCount})` },
                    { id: 'unpracticed', label: `Chưa làm (${activeSubjectStats.unpracticedLessonsCount})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setStatusFilter(tab.id as any)}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        statusFilter === tab.id
                          ? 'bg-white text-sky-800 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredLessons.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                  <p className="text-xs sm:text-sm font-bold text-slate-700">
                    {statusFilter === 'practiced'
                      ? `Bạn chưa làm bài luyện nào trong ${activeSubjectStats.subjectName} (0/20 bài).`
                      : `Bạn đã làm tất cả các bài trong danh sách này!`}
                  </p>
                  {statusFilter === 'practiced' && (
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className="text-xs font-bold text-sky-600 hover:underline cursor-pointer"
                    >
                      Xem danh sách 20 bài luyện để bắt đầu làm bài →
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {filteredLessons.map((lesson) => {
                    const prog = getLessonProgress(lesson.id, userEmail, {
                      title: lesson.title,
                      subjectId: selectedSubject,
                      grade: currentGrade,
                      totalQuestions: 20,
                    });
                    const isSelected = selectedLessonObj.id === lesson.id;
                    const isDone = prog.answeredCount > 0;

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => setSelectedLessonId(lesson.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-sky-500 bg-sky-50/40 shadow-xs ring-2 ring-sky-500/20' 
                            : 'border-slate-200/80 hover:border-sky-200 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="font-extrabold text-xs sm:text-sm text-slate-900">
                            {lesson.title}
                          </div>
                          <div className="shrink-0">
                            {renderLessonStatusBadge(prog)}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              !isDone
                                ? 'bg-slate-300'
                                : prog.understandingRate >= 80
                                ? 'bg-gradient-to-r from-emerald-500 to-sky-600'
                                : prog.understandingRate >= 50
                                ? 'bg-gradient-to-r from-sky-500 to-blue-600'
                                : 'bg-gradient-to-r from-amber-500 to-red-500'
                            }`}
                            style={{ width: `${prog.understandingRate}%` }}
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                          {isDone ? (
                            <span>
                              Kết quả thực tế:{' '}
                              <strong className="text-slate-800">
                                Đã làm {prog.answeredCount}/20 câu
                              </strong>{' '}
                              · <strong className="text-emerald-600">Đúng {prog.correctCount} câu</strong> ·{' '}
                              <strong className="text-red-500">Sai {prog.wrongCount} câu</strong> (Tỉ lệ đúng câu đã nộp: {prog.accuracyOnAnswered}%)
                            </span>
                          ) : (
                            <span>
                              Trạng thái: <strong className="text-slate-700">Chưa làm (0/20 câu · Đã hiểu 0%)</strong>
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenLesson(lesson.id);
                            }}
                            className="text-sky-700 font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <span>{isDone ? 'Làm tiếp / Làm lại' : 'Bắt đầu làm bài'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right 5 Columns: Accurate AI Diagnosis Panel */}
            <div className="lg:col-span-5 bg-gradient-to-b from-sky-50/70 via-white to-sky-50/40 rounded-3xl p-6 sm:p-7 border border-sky-200/80 shadow-xs space-y-5">
              
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl overflow-hidden border-2 border-sky-300 shrink-0 shadow-xs bg-white">
                  <img
                    src={getConfiguredMascotImage(MASCOT_IMAGE)}
                    onError={(event) => {
                      event.currentTarget.src = MASCOT_IMAGE;
                    }}
                    alt="AI Bon Ben"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-sky-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Kết quả Chẩn đoán AI Chính Xác</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Đánh giá trung thực theo bài làm
                  </h4>
                </div>
              </div>

              {/* Selected Lesson Detailed Diagnosis Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-100 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${
                      selectedLessonProgress.answeredCount === 0
                        ? 'text-slate-700 bg-slate-100 border-slate-200'
                        : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    {selectedLessonProgress.answeredCount === 0
                      ? 'TRẠNG THÁI: CHƯA LÀM (0%)'
                      : `TRẠNG THÁI: ĐÃ LÀM (${selectedLessonProgress.answeredCount}/20 CÂU)`}
                  </span>
                  <span className="text-xs font-extrabold text-sky-700">
                    Đã hiểu: {selectedLessonProgress.understandingRate}%
                  </span>
                </div>

                <div className="text-sm font-extrabold text-slate-900 leading-snug">
                  {selectedLessonObj.title}
                </div>

                {selectedLessonProgress.answeredCount === 0 ? (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed space-y-1.5">
                    <p className="font-bold text-slate-900">
                      📌 Chẩn đoán AI: Bạn CHƯA LÀM bài luyện này (0/20 câu).
                    </p>
                    <p>
                      Vì bạn chưa trả lời câu hỏi nào trong bài này nên mức độ hiểu bài hiện tại là <strong>0%</strong>. Hệ thống không tự động cộng điểm hay báo cáo đã làm khi bạn chưa thực sự làm bài.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100">
                        <div className="text-[10px] font-bold text-slate-500">Đã làm</div>
                        <div className="text-sm font-black text-sky-800">
                          {selectedLessonProgress.answeredCount}/20 câu
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                        <div className="text-[10px] font-bold text-emerald-700">Làm đúng</div>
                        <div className="text-sm font-black text-emerald-700">
                          {selectedLessonProgress.correctCount} câu
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-100">
                        <div className="text-[10px] font-bold text-red-600">Làm sai</div>
                        <div className="text-sm font-black text-red-600">
                          {selectedLessonProgress.wrongCount} câu
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200/80 text-xs text-slate-700 leading-relaxed space-y-1.5">
                      <p className="font-extrabold text-sky-950">
                        📌 Nhận xét chính xác từ AI Bon Ben:
                      </p>
                      {selectedLessonProgress.answeredCount < 20 ? (
                        <p>
                          Bạn <strong>đã bắt đầu làm</strong> bài này và hoàn thành{' '}
                          <strong>{selectedLessonProgress.answeredCount}/20 câu</strong> (trả lời đúng{' '}
                          <strong>{selectedLessonProgress.correctCount} câu</strong>, sai{' '}
                          <strong>{selectedLessonProgress.wrongCount} câu</strong>, đạt mức hiểu bài{' '}
                          <strong>{selectedLessonProgress.understandingRate}%</strong> trên toàn bài). Bạn còn{' '}
                          <strong>{20 - selectedLessonProgress.answeredCount} câu chưa làm</strong>, hãy hoàn thành nốt để có đánh giá trọn vẹn 20 câu!
                        </p>
                      ) : selectedLessonProgress.understandingRate >= 80 ? (
                        <p>
                          Bạn <strong>đã làm xong trọn bộ 20/20 câu</strong> của bài này với kết quả rất tốt: Đúng{' '}
                          <strong>{selectedLessonProgress.correctCount}/20 câu</strong>, sai{' '}
                          <strong>{selectedLessonProgress.wrongCount} câu</strong> (Đã hiểu{' '}
                          <strong>{selectedLessonProgress.understandingRate}%</strong>). Bạn đã nắm vững chuyên đề này!
                        </p>
                      ) : selectedLessonProgress.understandingRate >= 50 ? (
                        <p>
                          Bạn <strong>đã làm xong 20/20 câu</strong> của bài này và đạt mức trung bình - khá: Đúng{' '}
                          <strong>{selectedLessonProgress.correctCount}/20 câu</strong>, còn sai{' '}
                          <strong>{selectedLessonProgress.wrongCount} câu</strong> (Đã hiểu{' '}
                          <strong>{selectedLessonProgress.understandingRate}%</strong>). Hãy xem kỹ lời giải của{' '}
                          {selectedLessonProgress.wrongCount} câu làm sai để nắm chắc hơn.
                        </p>
                      ) : (
                        <p>
                          Bạn <strong>đã làm 20/20 câu</strong> nhưng mới đúng{' '}
                          <strong>{selectedLessonProgress.correctCount}/20 câu</strong> và sai{' '}
                          <strong>{selectedLessonProgress.wrongCount} câu</strong> (Đã hiểu{' '}
                          <strong>{selectedLessonProgress.understandingRate}%</strong>). Kiến thức chuyên đề này còn hổng, bạn cần ôn lại lý thuyết và làm lại bài này.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => onOpenLesson(selectedLessonObj.id)}
                  className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-2xl font-extrabold text-xs sm:text-sm shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>
                    {selectedLessonProgress.answeredCount === 0
                      ? 'Vào làm 20 câu của bài này ngay'
                      : `Làm tiếp / Xem lại bài này (${selectedLessonProgress.answeredCount}/20 câu)`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Overall Real History of What Has Been Done vs Not Done */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-sky-600" />
                    <span>Thống kê bài Đã làm & Chưa làm (Lớp {currentGrade})</span>
                  </h5>
                  <span className="text-[11px] font-bold text-sky-700">
                    {allPracticedRecordsAcross3Subjects.length}/60 bài đã làm
                  </span>
                </div>

                {allPracticedRecordsAcross3Subjects.length === 0 ? (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 leading-relaxed">
                    <strong>Chưa có bài luyện nào được làm ở Lớp {currentGrade}:</strong> Cả 60/60 bài luyện (20 bài Văn, 20 bài Toán, 20 bài Anh) đều đang ở trạng thái <strong>Chưa làm (0%)</strong>. Khi bạn làm bất kỳ bài nào, kết quả thực tế sẽ xuất hiện ngay tại đây.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {allPracticedRecordsAcross3Subjects.map((rec) => (
                      <div
                        key={rec.lessonId}
                        onClick={() => onOpenLesson(rec.lessonId)}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200/80 text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors"
                      >
                        <div className="truncate">
                          <div className="font-bold text-slate-800 truncate">{rec.title}</div>
                          <div className="text-[11px] text-slate-500">
                            Đã làm {rec.answeredCount}/20 câu ·{' '}
                            <span className="text-emerald-600 font-bold">Đúng {rec.correctCount}</span> ·{' '}
                            <span className="text-red-500 font-bold">Sai {rec.wrongCount}</span>
                          </div>
                        </div>
                        <span className="shrink-0 font-extrabold text-sky-700 bg-white px-2 py-1 rounded-lg border border-sky-100">
                          Hiểu {rec.understandingRate}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* Confirm Reset Modal */}
        {confirmResetOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">
                    Đặt lại toàn bộ tiến độ về 0%?
                  </h4>
                  <p className="text-xs text-slate-500">
                    Xóa lịch sử câu trả lời để làm lại từ đầu (0%)
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tất cả các bài luyện sẽ quay về trạng thái <strong>Chưa làm (0%)</strong>. Bạn có chắc chắn muốn đặt lại không?
              </p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmResetOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmResetAll}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs cursor-pointer"
                >
                  Xác nhận đặt về 0%
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
