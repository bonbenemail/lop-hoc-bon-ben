import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Volume2, 
  HelpCircle,
  ArrowRight,
  Award,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  RotateCcw,
  Lock
} from 'lucide-react';
import { GradeLevel, Lesson, QuizQuestion, UserAccount } from '../types';
import { 
  MASCOT_IMAGE, 
  LESSON_PRACTICE_20_QUESTIONS, 
  VIETNAMESE_PRACTICE_20_QUESTIONS, 
  ENGLISH_PRACTICE_20_QUESTIONS
} from '../data/bonbenData';
import {
  getVietnamese20LessonsByGrade,
  getEnglish20LessonsByGrade,
  getMath20LessonsByGrade
} from '../data/practiceLessonsData';
import {
  getLessonProgress,
  saveLessonProgress,
  resetSingleLessonProgress
} from '../services/progressTracker';
import {
  applyLessonOverrides,
  getTeacherCustomAssignments,
  canUserAccessLesson
} from '../services/schoolManager';

interface InteractiveLessonModalProps {
  lessonId: string | null;
  isOpen: boolean;
  onClose: () => void;
  currentGrade?: GradeLevel;
  userEmail?: string | null;
  currentUser?: UserAccount | null;
  onCompleteLesson?: (xpAmount: number) => void;
  onProgressUpdated?: () => void;
}

export const InteractiveLessonModal: React.FC<InteractiveLessonModalProps> = ({
  lessonId,
  isOpen,
  onClose,
  currentGrade = 4,
  userEmail,
  currentUser,
  onCompleteLesson,
  onProgressUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'practice' | 'video'>('practice');
  const [subjectBank, setSubjectBank] = useState<'tieng-viet' | 'toan' | 'tieng-anh'>('tieng-viet');
  const [activeLessonId, setActiveLessonId] = useState<string>(`van-g${currentGrade}-bai-1`);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [lockWarning, setLockWarning] = useState<string | null>(null);

  const [activeQIndex, setActiveQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<{ [qId: string]: boolean }>({});
  const [hasCompletedLesson, setHasCompletedLesson] = useState(false);

  // Lấy đúng 20 bài luyện Văn, 20 bài luyện Toán và 20 bài luyện Anh theo đúng khối lớp currentGrade (kèm chỉnh sửa trực tiếp của Admin)
  const vietnamese20Lessons: Lesson[] = applyLessonOverrides(getVietnamese20LessonsByGrade(currentGrade));
  const math20Lessons: Lesson[] = applyLessonOverrides(getMath20LessonsByGrade(currentGrade));
  const english20Lessons: Lesson[] = applyLessonOverrides(getEnglish20LessonsByGrade(currentGrade));
  const teacherCustomLessons: Lesson[] = getTeacherCustomAssignments();

  // Đồng bộ đúng môn (Văn, Toán, Anh) hoặc bài tập Giáo viên giao và đúng khối lớp currentGrade
  useEffect(() => {
    setLockWarning(null);
    if (!lessonId) {
      setSubjectBank('tieng-viet');
      setActiveLessonId(`van-g${currentGrade}-bai-1`);
      return;
    }

    if (lessonId.startsWith('teacher-custom-')) {
      const customFound = teacherCustomLessons.find(l => l.id === lessonId);
      if (customFound) {
        setSubjectBank(
          (customFound.subjectId as 'tieng-viet' | 'toan' | 'tieng-anh') || 'toan'
        );
        setActiveLessonId(customFound.id);
        setActiveQIndex(0);
        setHasCompletedLesson(false);
        setShowHint(false);
        return;
      }
    }

    const baiMatch = lessonId.match(/-bai-(\d+)$/);
    const rawNum = baiMatch ? Math.min(Math.max(parseInt(baiMatch[1], 10), 1), 20) : 1;
    // Nếu chưa được Admin cho phép, chỉ được mở Bài 1..3
    const targetPrefix = lessonId.startsWith('van-') ? 'van' : lessonId.startsWith('anh-') ? 'anh' : 'toan';
    const candidateId = `${targetPrefix}-g${currentGrade}-bai-${rawNum}`;
    const safeLessonNum = canUserAccessLesson(currentUser || null, candidateId) ? rawNum : 1;

    if (lessonId.startsWith('van-')) {
      setSubjectBank('tieng-viet');
      setActiveLessonId(`van-g${currentGrade}-bai-${safeLessonNum}`);
    } else if (lessonId.startsWith('anh-')) {
      setSubjectBank('tieng-anh');
      setActiveLessonId(`anh-g${currentGrade}-bai-${safeLessonNum}`);
    } else {
      setSubjectBank('toan');
      setActiveLessonId(`toan-g${currentGrade}-bai-${safeLessonNum}`);
    }
    setActiveQIndex(0);
    setHasCompletedLesson(false);
    setShowHint(false);
  }, [lessonId, currentGrade]);

  const isCustomTeacherLesson = activeLessonId.startsWith('teacher-custom-');
  const customLessonObj = isCustomTeacherLesson
    ? teacherCustomLessons.find(l => l.id === activeLessonId)
    : undefined;

  // Chỉ lấy danh sách 20 bài luyện của đúng môn đang chọn ở khối lớp currentGrade
  const subjectLessonsList: Lesson[] =
    subjectBank === 'tieng-viet'
      ? vietnamese20Lessons
      : subjectBank === 'toan'
        ? math20Lessons
        : english20Lessons;

  const currentLesson: Lesson =
    customLessonObj ||
    subjectLessonsList.find(l => l.id === activeLessonId) ||
    subjectLessonsList[0];

  // Đảm bảo đúng danh sách câu hỏi của bài tập Giáo viên tạo hoặc 20 câu hỏi của môn hiện tại
  const questionsList: QuizQuestion[] =
    currentLesson?.sampleQuestions && currentLesson.sampleQuestions.length > 0
      ? currentLesson.sampleQuestions
      : subjectBank === 'tieng-viet'
        ? VIETNAMESE_PRACTICE_20_QUESTIONS
        : subjectBank === 'tieng-anh'
          ? ENGLISH_PRACTICE_20_QUESTIONS
          : LESSON_PRACTICE_20_QUESTIONS;

  const totalQuestionsCount = questionsList.length || 20;

  // Tải đúng dữ liệu làm bài thực tế của bài học hiện tại (mặc định chưa làm là rỗng = 0%)
  useEffect(() => {
    if (!currentLesson?.id) return;
    const saved = getLessonProgress(currentLesson.id, userEmail, {
      title: currentLesson.title,
      subjectId:
        (currentLesson.subjectId as 'tieng-viet' | 'toan' | 'tieng-anh') || subjectBank,
      grade: currentLesson.grade || currentGrade,
      totalQuestions: totalQuestionsCount,
    });
    setSelectedAnswers(saved.selectedAnswers || {});
    setSubmittedQuestions(saved.submittedQuestions || {});
    setActiveQIndex(0);
    setHasCompletedLesson(false);
    setShowHint(false);
  }, [currentLesson?.id, userEmail, isOpen]);

  if (!isOpen) return null;

  const currentQuestion = questionsList[activeQIndex] || questionsList[0];

  const persistCurrentLessonState = (
    nextSelected: { [qId: string]: number },
    nextSubmitted: { [qId: string]: boolean }
  ) => {
    const totalQ = totalQuestionsCount;
    const answered = questionsList.filter(q => nextSubmitted[q.id]).length;
    const correct = questionsList.filter(
      q => nextSubmitted[q.id] && nextSelected[q.id] === q.correctIndex
    ).length;
    const wrong = Math.max(0, answered - correct);
    const understandingRate = Math.round((correct / totalQ) * 100);
    const accuracyOnAnswered = answered > 0 ? Math.round((correct / answered) * 100) : 0;

    saveLessonProgress(
      {
        lessonId: currentLesson.id,
        title: currentLesson.title,
        subjectId:
          (currentLesson.subjectId as 'tieng-viet' | 'toan' | 'tieng-anh') || subjectBank,
        grade: currentLesson.grade || currentGrade,
        answeredCount: answered,
        correctCount: correct,
        wrongCount: wrong,
        totalQuestions: totalQ,
        understandingRate,
        accuracyOnAnswered,
        status: answered === 0 ? 'not-started' : answered >= totalQ ? 'completed' : 'in-progress',
        selectedAnswers: nextSelected,
        submittedQuestions: nextSubmitted,
        updatedAt: new Date().toISOString(),
      },
      userEmail
    );
    if (onProgressUpdated) {
      onProgressUpdated();
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submittedQuestions[questionId]) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitAnswer = (questionId: string) => {
    const nextSubmitted = { ...submittedQuestions, [questionId]: true };
    setSubmittedQuestions(nextSubmitted);
    persistCurrentLessonState(selectedAnswers, nextSubmitted);
  };

  const handleResetThisLesson = () => {
    resetSingleLessonProgress(currentLesson.id, userEmail);
    setSelectedAnswers({});
    setSubmittedQuestions({});
    setActiveQIndex(0);
    setHasCompletedLesson(false);
    setShowHint(false);
    if (onProgressUpdated) {
      onProgressUpdated();
    }
  };

  const handleFinishPractice = () => {
    persistCurrentLessonState(selectedAnswers, submittedQuestions);
    setHasCompletedLesson(true);
    if (onCompleteLesson) {
      onCompleteLesson(200);
    }
  };

  const answeredCount = questionsList.filter(q => submittedQuestions[q.id]).length;
  const correctCount = questionsList.filter(
    q => submittedQuestions[q.id] && selectedAnswers[q.id] === q.correctIndex
  ).length;
  const wrongCount = Math.max(0, answeredCount - correctCount);
  const realUnderstandingPercent = Math.round((correctCount / totalQuestionsCount) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-sky-200 w-full max-w-5xl overflow-hidden relative flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-800 via-sky-700 to-blue-800 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs text-white flex items-center justify-center font-bold border border-white/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-sky-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-md">
                  LỚP {currentLesson.grade}
                </span>
                {currentLesson.isTeacherCustom && (
                  <span className="bg-indigo-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md">
                    BÀI TẬP GIÁO VIÊN ({currentLesson.teacherName})
                  </span>
                )}
                <span className="text-xs text-sky-200 font-medium">{currentLesson.difficulty}</span>
                <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-md">
                  {answeredCount === 0
                    ? 'CHƯA LÀM (0%)'
                    : `ĐÃ LÀM ${answeredCount}/${totalQuestionsCount} CÂU · ĐÃ HIỂU ${realUnderstandingPercent}%`}
                </span>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight mt-0.5">
                {currentLesson.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {answeredCount > 0 && (
              <button
                type="button"
                onClick={handleResetThisLesson}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 transition-colors cursor-pointer"
                title="Làm lại bài này từ đầu (Đặt về 0%)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Làm lại (Đặt về 0%)</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-sky-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Bar inside Modal */}
        <div className="bg-sky-50/80 px-4 sm:px-6 py-2.5 border-b border-sky-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab('practice')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'practice'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-sky-800 bg-white border border-sky-200/80'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>
                Luyện tập ({answeredCount}/{totalQuestionsCount} câu · Đã hiểu {realUnderstandingPercent}%)
              </span>
            </button>

            <button
              onClick={() => setActiveTab('video')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'video'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-sky-800 bg-white border border-sky-200/80'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Video bài giảng & Lý thuyết</span>
            </button>
          </div>

          {/* 3 Subjects Switcher inside Practice: Văn, Toán, Anh */}
          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-sky-200 text-xs">
            <span className="text-slate-400 font-bold mr-1">Môn (Lớp {currentGrade}):</span>
            {[
              { id: 'tieng-viet', label: '📖 Môn Văn (20 bài)' },
              { id: 'toan', label: '📐 Môn Toán (20 bài)' },
              { id: 'tieng-anh', label: '🌍 Môn Anh (20 bài)' },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => {
                  const newSub = s.id as 'tieng-viet' | 'toan' | 'tieng-anh';
                  setSubjectBank(newSub);
                  setLockWarning(null);
                  const firstLesson =
                    newSub === 'tieng-viet'
                      ? vietnamese20Lessons[0]
                      : newSub === 'toan'
                        ? math20Lessons[0]
                        : english20Lessons[0];
                  if (firstLesson) setActiveLessonId(firstLesson.id);
                  setActiveQIndex(0);
                  setHasCompletedLesson(false);
                  setShowHint(false);
                }}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                  subjectBank === s.id && !isCustomTeacherLesson ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-sky-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 20-Lesson Selector Bar for current subject */}
        {!isCustomTeacherLesson && (
          <div className="bg-white px-4 sm:px-6 py-2.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="font-bold text-sky-900 shrink-0">
              Chọn trong 20 bài luyện Lớp {currentGrade} của môn đang học:
            </span>
            <select
              value={currentLesson.id}
              onChange={(e) => {
                const chosenId = e.target.value;
                if (!canUserAccessLesson(currentUser || null, chosenId)) {
                  setLockWarning(
                    'Bài 4 đến Bài 20 đang khóa — Tài khoản của bạn đang chờ Admin xét duyệt cho phép làm bài. Hiện tại bạn được làm thử 3 bài đầu tiên (Bài 1, 2, 3) của mỗi môn!'
                  );
                  return;
                }
                setLockWarning(null);
                setActiveLessonId(chosenId);
                setActiveQIndex(0);
                setHasCompletedLesson(false);
                setShowHint(false);
              }}
              className="flex-1 max-w-xl px-3 py-1.5 rounded-xl border border-sky-200 bg-sky-50/50 font-bold text-sky-950 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            >
              {subjectLessonsList.map((les) => {
                const allowed = canUserAccessLesson(currentUser || null, les.id);
                const p = getLessonProgress(les.id, userEmail);
                const statusText = !allowed
                  ? '🔒 Khóa (Chờ Admin duyệt)'
                  : p.answeredCount === 0
                    ? 'Chưa làm (0%)'
                    : `Đã làm ${p.answeredCount}/20 câu · Hiểu ${p.understandingRate}%`;
                return (
                  <option key={les.id} value={les.id}>
                    {les.title} — [{statusText}]
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {lockWarning && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{lockWarning}</span>
            </div>
            <button
              onClick={() => setLockWarning(null)}
              className="px-2 py-0.5 rounded-lg bg-amber-200/70 hover:bg-amber-200 text-amber-950 text-[11px] font-black cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1">
          
          {/* ==================== TAB 1: QUESTION PRACTICE BANK ==================== */}
          {activeTab === 'practice' && (
            <div className="space-y-5">
              
              {!hasCompletedLesson ? (
                <>
                  {/* Question Fast Picker Matrix */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-500 mb-2">
                      <span>Bản đồ {totalQuestionsCount} câu hỏi ({currentLesson.title}):</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-700">
                          Đã làm: <strong>{answeredCount}/{totalQuestionsCount} câu</strong>
                        </span>
                        <span className="text-emerald-600 font-extrabold">
                          Đúng: {correctCount} câu
                        </span>
                        <span className="text-red-500 font-extrabold">
                          Sai: {wrongCount} câu
                        </span>
                        <span className="bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-lg font-extrabold">
                          Đã hiểu: {realUnderstandingPercent}%
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {questionsList.map((q, qIdx) => {
                        const isSubmitted = submittedQuestions[q.id];
                        const isCorrect = isSubmitted && selectedAnswers[q.id] === q.correctIndex;
                        const isCurrent = qIdx === activeQIndex;

                        let badgeStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-sky-50';
                        if (isSubmitted) {
                          badgeStyle = isCorrect ? 'bg-emerald-500 text-white border-emerald-500 font-bold' : 'bg-red-500 text-white border-red-500 font-bold';
                        }
                        if (isCurrent) {
                          badgeStyle += ' ring-2 ring-sky-500 scale-105 shadow-xs';
                        }

                        return (
                          <button
                            key={q.id}
                            onClick={() => {
                              setActiveQIndex(qIdx);
                              setShowHint(false);
                            }}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-bold border transition-all flex items-center justify-center cursor-pointer ${badgeStyle}`}
                          >
                            {qIdx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Question Box */}
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-sky-200/80 shadow-soft space-y-5">
                    
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-sky-800 bg-sky-50 px-3 py-1 rounded-xl border border-sky-100">
                          CÂU HỎI {activeQIndex + 1} / {totalQuestionsCount}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">({currentQuestion.points} điểm)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowHint(!showHint)}
                          className="px-3 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/70 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                          <span>Gợi ý từ AI Bon Ben</span>
                        </button>

                        {submittedQuestions[currentQuestion.id] && (
                          <span className={`text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1 ${
                            selectedAnswers[currentQuestion.id] === currentQuestion.correctIndex
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {selectedAnswers[currentQuestion.id] === currentQuestion.correctIndex ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Chính xác (+{currentQuestion.points} điểm)</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Chưa chính xác</span>
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {showHint && (
                      <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5 animate-in fade-in">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Gợi ý phương pháp giải: </strong>
                          {currentQuestion.explanation}
                        </div>
                      </div>
                    )}

                    <h4 className="font-extrabold text-base sm:text-lg text-slate-900 leading-relaxed">
                      {currentQuestion.question}
                    </h4>

                    {/* 4 Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentQuestion.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[currentQuestion.id] === optIdx;
                        const isSubmitted = submittedQuestions[currentQuestion.id];
                        const isCorrect = optIdx === currentQuestion.correctIndex;

                        let optClass = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-sky-50 hover:border-sky-300';
                        if (isSelected) {
                          optClass = 'bg-sky-100 border-sky-500 text-sky-950 font-bold ring-2 ring-sky-500/20';
                        }
                        if (isSubmitted) {
                          if (isCorrect) {
                            optClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20';
                          } else if (isSelected && !isCorrect) {
                            optClass = 'bg-red-50 border-red-500 text-red-950 font-bold ring-2 ring-red-500/20';
                          } else {
                            optClass = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={isSubmitted}
                            onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                            className={`p-4 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${optClass}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-sky-900 font-extrabold text-xs flex items-center justify-center shrink-0">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </div>
                            {isSubmitted && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />}
                            {isSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Submit Check Answer Button */}
                    {!submittedQuestions[currentQuestion.id] ? (
                      <div className="pt-2">
                        <button
                          disabled={selectedAnswers[currentQuestion.id] === undefined}
                          onClick={() => handleSubmitAnswer(currentQuestion.id)}
                          className="px-6 py-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all shadow-sm"
                        >
                          Kiểm tra đáp án câu này
                        </button>
                      </div>
                    ) : (
                      /* Detailed Explanation Box */
                      <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-200 text-xs text-slate-700 space-y-1.5 animate-in fade-in">
                        <div className="font-extrabold text-sky-900 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-sky-600" />
                          <span>Lời giải chi tiết của giáo viên Bon Ben:</span>
                        </div>
                        <p className="leading-relaxed">{currentQuestion.explanation}</p>
                      </div>
                    )}

                    {/* Pagination Nav Buttons */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        disabled={activeQIndex === 0}
                        onClick={() => {
                          setActiveQIndex(prev => Math.max(prev - 1, 0));
                          setShowHint(false);
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Câu trước</span>
                      </button>

                      {activeQIndex < questionsList.length - 1 ? (
                        <button
                          onClick={() => {
                            setActiveQIndex(prev => prev + 1);
                            setShowHint(false);
                          }}
                          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <span>Câu tiếp theo ({activeQIndex + 2}/{totalQuestionsCount})</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handleFinishPractice}
                          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Award className="w-4 h-4 text-amber-300" />
                          <span>Tổng kết kết quả làm bài</span>
                        </button>
                      )}
                    </div>

                  </div>
                </>
              ) : (
                /* Completed Questions Banner */
                <div className="text-center space-y-5 py-6 max-w-lg mx-auto">
                  <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-xl ring-8 ring-emerald-50">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3.5 py-1 rounded-full uppercase">
                      KẾT QUẢ THỰC TẾ ĐÃ ĐƯỢC LƯU VÀO CHẨN ĐOÁN AI
                    </span>
                    <h4 className="text-2xl font-extrabold text-sky-950 pt-2">
                      Tổng Kết Bài Luyện ({realUnderstandingPercent}% Đã Hiểu)
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Bài luyện: <strong>{currentLesson.title}</strong><br />
                      Đã làm: <strong>{answeredCount}/{totalQuestionsCount} câu</strong> · Đúng: <strong className="text-emerald-600">{correctCount} câu</strong> · Sai: <strong className="text-red-600">{wrongCount} câu</strong> · Mức độ hiểu bài: <strong className="text-sky-700">{realUnderstandingPercent}%</strong>.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {!isCustomTeacherLesson && (
                      <button
                        onClick={() => {
                          const currIdx = subjectLessonsList.findIndex(l => l.id === currentLesson.id);
                          const nextLes = subjectLessonsList[(currIdx + 1) % subjectLessonsList.length];
                          if (nextLes) {
                            if (!canUserAccessLesson(currentUser || null, nextLes.id)) {
                              setLockWarning(
                                'Bạn đã hoàn thành 3 bài làm thử! Để mở khóa Bài 4 đến Bài 20, vui lòng chờ Admin xét duyệt cho phép làm bài.'
                              );
                              setActiveLessonId(subjectLessonsList[0].id);
                            } else {
                              setActiveLessonId(nextLes.id);
                            }
                            setActiveQIndex(0);
                            setHasCompletedLesson(false);
                          }
                        }}
                        className="px-6 py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm rounded-2xl shadow-md cursor-pointer transition-transform hover:scale-105"
                      >
                        Chuyển sang Bài luyện tiếp theo
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl cursor-pointer"
                    >
                      Đóng cửa sổ
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ==================== TAB 2: ANIMATED VIDEO PLAYER & THEORY SUMMARY ==================== */}
          {activeTab === 'video' && (
            <div className="space-y-6">
              <div className="relative aspect-video bg-gradient-to-br from-sky-950 via-slate-900 to-sky-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-white flex flex-col justify-between p-4 sm:p-6 text-white">
                <div className="flex items-center justify-between">
                  <span className="bg-sky-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                    Video HD Hoạt hình 2D Bon Ben
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                    <Volume2 className="w-4 h-4" />
                  </div>
                </div>

                <div className="text-center space-y-3 py-6">
                  <div className="w-24 h-24 mx-auto rounded-3xl overflow-hidden border-2 border-sky-400 shadow-xl">
                    <img src={MASCOT_IMAGE} alt="Bon Ben" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-extrabold text-white">
                    {currentLesson.title}
                  </h4>
                  <p className="text-xs text-sky-200 max-w-md mx-auto">
                    {currentLesson.description}
                  </p>
                </div>

                <div className="bg-slate-950/70 backdrop-blur-md rounded-2xl p-3 border border-white/10 space-y-2">
                  <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-sky-400 h-1.5 rounded-full" style={{ width: `${videoProgress}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-sky-200">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    </button>
                    <span className="font-mono">00:00 / {currentLesson.duration}</span>
                  </div>
                </div>
              </div>

              {/* Key Theory Summary Box */}
              <div className="bg-sky-50/70 p-5 rounded-3xl border border-sky-100 space-y-2.5">
                <h5 className="font-extrabold text-sm text-sky-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>Tóm tắt lý thuyết trọng tâm cần nhớ:</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-700 list-disc pl-5">
                  {currentLesson.keyPoints.map((kp, i) => (
                    <li key={i} className="font-medium leading-relaxed">{kp}</li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setActiveTab('practice')}
                className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Chuyển sang bộ câu hỏi luyện tập</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
