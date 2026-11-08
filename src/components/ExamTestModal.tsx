import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Timer, 
  Award, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Bookmark,
  Lock
} from 'lucide-react';
import { GradeLevel, QuizQuestion, ExamTest, UserAccount } from '../types';
import { MASCOT_IMAGE } from '../data/bonbenData';
import {
  getVietnamese20LessonsByGrade,
  getMath20LessonsByGrade,
  getEnglish20LessonsByGrade
} from '../data/practiceLessonsData';
import { canUserAccessExam } from '../services/schoolManager';

interface ExamTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGrade: GradeLevel;
  currentUser?: UserAccount | null;
  onCompleteExam?: (xpAmount: number) => void;
  inlinePage?: boolean;
  onGoToTrialExercises?: () => void;
}

export const ExamTestModal: React.FC<ExamTestModalProps> = ({
  isOpen,
  onClose,
  currentGrade,
  currentUser,
  onCompleteExam,
  inlinePage = false,
  onGoToTrialExercises,
}) => {
  const [examState, setExamState] = useState<'intro' | 'testing' | 'result'>('intro');
  const [selectedExamId, setSelectedExamId] = useState<string>('exam-van');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [qIndex: number]: number }>({});
  const [flagged, setFlagged] = useState<{ [qIndex: number]: boolean }>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(30 * 60); // 30 minutes
  const [finalScore, setFinalScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const isExamAllowed = canUserAccessExam(currentUser || null);

  const vanLessons = getVietnamese20LessonsByGrade(currentGrade);
  const mathLessons = getMath20LessonsByGrade(currentGrade);
  const anhLessons = getEnglish20LessonsByGrade(currentGrade);

  const MULTI_SUBJECT_EXAMS: ExamTest[] = [
    {
      id: 'exam-van',
      title: `Đề thi Khảo sát Môn ${currentGrade <= 5 ? 'Tiếng Việt' : 'Ngữ văn'} Lớp ${currentGrade}`,
      subject: `Môn Văn Lớp ${currentGrade}`,
      grade: currentGrade,
      durationMinutes: 30,
      totalQuestions: 20,
      description: `Trọn bộ 20 câu hỏi tổng hợp kiến thức môn ${currentGrade <= 5 ? 'Tiếng Việt' : 'Ngữ văn'} Lớp ${currentGrade} bám sát chương trình SGK mới.`,
      questions: vanLessons[vanLessons.length - 1]?.sampleQuestions || [],
      badge: `Văn Lớp ${currentGrade}`
    },
    {
      id: 'exam-toan',
      title: `Đề thi Khảo sát Môn Toán học Lớp ${currentGrade}`,
      subject: `Môn Toán Lớp ${currentGrade}`,
      grade: currentGrade,
      durationMinutes: 30,
      totalQuestions: 20,
      description: `Trọn bộ 20 câu hỏi tổng hợp kiến thức môn Toán Lớp ${currentGrade} từ cơ bản đến vận dụng cao.`,
      questions: mathLessons[mathLessons.length - 1]?.sampleQuestions || [],
      badge: `Toán Lớp ${currentGrade}`
    },
    {
      id: 'exam-anh',
      title: `Đề thi Khảo sát Môn Tiếng Anh Lớp ${currentGrade}`,
      subject: `Môn Anh Lớp ${currentGrade}`,
      grade: currentGrade,
      durationMinutes: 30,
      totalQuestions: 20,
      description: `Trọn bộ 20 câu hỏi tổng hợp Từ vựng, Ngữ pháp và Đọc hiểu môn Tiếng Anh Lớp ${currentGrade} (Global Success).`,
      questions: anhLessons[anhLessons.length - 1]?.sampleQuestions || [],
      badge: `Anh Lớp ${currentGrade}`
    }
  ];

  const activeExam: ExamTest = MULTI_SUBJECT_EXAMS.find(e => e.id === selectedExamId) || MULTI_SUBJECT_EXAMS[0];
  const questions: QuizQuestion[] = activeExam.questions; // Guaranteed 20 questions

  useEffect(() => {
    let interval: any;
    if (examState === 'testing' && timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [examState, timeLeftSeconds]);

  if (!isOpen) return null;

  const currentQ = questions[currentIdx] || questions[0];

  const handleStartExam = (examId?: string) => {
    if (!isExamAllowed) return;
    if (examId) setSelectedExamId(examId);
    setExamState('testing');
    setCurrentIdx(0);
    setAnswers({});
    setFlagged({});
    setTimeLeftSeconds((activeExam.durationMinutes || 30) * 60);
  };

  const handleSelectAnswer = (optIdx: number) => {
    setAnswers(prev => ({ ...prev, [currentIdx]: optIdx }));
  };

  const toggleFlag = (idx: number) => {
    setFlagged(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSubmitExam = () => {
    let corrects = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) {
        corrects += 1;
      }
    });

    setCorrectCount(corrects);
    const scoreOut10 = (corrects / questions.length) * 10;
    setFinalScore(Number(scoreOut10.toFixed(1)));
    
    const earnedXp = Math.max(100, corrects * 15);
    if (onCompleteExam) onCompleteExam(earnedXp);

    setExamState('result');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={
        inlinePage
          ? 'py-8 sm:py-12 px-4 sm:px-6 max-w-6xl mx-auto w-full animate-in fade-in'
          : 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in'
      }
    >
      <div
        className={
          inlinePage
            ? 'bg-white rounded-3xl shadow-xl border border-sky-200 w-full overflow-hidden relative flex flex-col'
            : 'bg-white rounded-3xl shadow-2xl border border-sky-200 w-full max-w-5xl overflow-hidden relative flex flex-col max-h-[92vh]'
        }
      >
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-blue-900 text-white p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-sky-950 flex items-center justify-center font-bold shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">ĐỀ THI CHÍNH THỨC</span>
                <span className="bg-sky-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded">LỚP {currentGrade} · 20 CÂU HỎI</span>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight mt-0.5">
                Bài Thi Khảo Sát & Đánh Giá Năng Lực Toàn Diện Lớp {currentGrade}
              </h3>
            </div>
          </div>

          {!inlinePage ? (
            <button
              onClick={onClose}
              className="p-1.5 text-sky-200 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            examState !== 'intro' && (
              <button
                onClick={() => setExamState('intro')}
                className="px-3.5 py-1.5 text-xs font-bold bg-white/15 hover:bg-white/25 text-white rounded-xl transition-colors cursor-pointer"
              >
                ← Chọn đề thi khác
              </button>
            )
          )}
        </div>

        {/* Content Body */}
        <div className={inlinePage ? 'p-5 sm:p-8 flex-1' : 'p-5 sm:p-7 overflow-y-auto flex-1'}>
          
          {!isExamAllowed ? (
            /* LOCKED EXAM SCREEN WHEN ADMIN HAS NOT APPROVED */
            <div className="max-w-xl mx-auto py-8 text-center space-y-5">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-700 shadow-lg">
                <Lock className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <span className="inline-block px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider border border-amber-300">
                  Chờ Admin Cho Phép Làm Bài Thi & Kiểm Tra
                </span>
                <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Mục Bài Thi & Kiểm Tra Đang Tạm Khóa
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {!currentUser
                    ? 'Bạn cần Đăng nhập tài khoản Học sinh và được Admin xét duyệt cho phép làm bài để tham gia các kỳ thi khảo sát & kiểm tra định kỳ.'
                    : currentUser.practiceApprovalStatus === 'blocked'
                      ? 'Tài khoản của bạn hiện đang bị Admin tạm khóa quyền làm các bài ôn tập nâng cao và bài thi kiểm tra. Bạn chỉ được làm thử 3 bài đầu tiên ở dòng đầu mỗi môn.'
                      : 'Tài khoản học sinh mới đăng ký mặc định ở trạng thái Chờ Admin xét duyệt. Khi chưa được Admin cho phép, bạn chỉ được làm thử 3 bài ở dòng đầu (Bài 1, Bài 2, Bài 3) và chưa thể làm Bài thi & Kiểm tra.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 text-left space-y-1.5">
                <div className="font-extrabold">📌 Quyền lợi hiện tại của bạn:</div>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 font-medium">
                  <li>Được làm thử miễn phí <strong>3 bài đầu tiên ở dòng đầu (Bài 1, Bài 2, Bài 3)</strong> của cả 3 môn Văn, Toán, Anh ở mọi khối lớp.</li>
                  <li>Ngay sau khi Admin bấm <strong>"Cho phép làm bài"</strong> trong mục Duyệt Học sinh, toàn bộ 20 bài luyện mỗi môn cùng Đề thi & Kiểm tra sẽ tự động mở khóa 100%.</li>
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {onGoToTrialExercises && (
                  <button
                    onClick={onGoToTrialExercises}
                    className="px-6 py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md cursor-pointer"
                  >
                    Làm thử 3 bài đầu ở dòng đầu ngay →
                  </button>
                )}
                {!inlinePage && (
                  <button
                    onClick={onClose}
                    className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl cursor-pointer"
                  >
                    Đóng cửa sổ
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* INTRO SCREEN */}
              {examState === 'intro' && (
                <div className="space-y-6 py-4 max-w-2xl mx-auto">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-3xl overflow-hidden border-2 border-sky-300 shadow-md">
                      <img src={MASCOT_IMAGE} alt="Bon Ben Exam" className="w-full h-full object-cover" />
                    </div>
                    <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      Trung Tâm Khảo Thí & Thi Thử Bon Ben Lớp {currentGrade}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
                      Các đề thi chuẩn hóa bám sát cấu trúc đề thi chính thức của Bộ GD&ĐT và kỳ thi học sinh giỏi VioEdu. Mỗi đề gồm đúng <strong>20 câu hỏi</strong>, thời gian <strong>30 phút</strong>.
                    </p>
                  </div>

                  {/* Exam selection list */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Chọn đề thi bạn muốn làm:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {MULTI_SUBJECT_EXAMS.map(exam => {
                        const isSelected = selectedExamId === exam.id;
                        return (
                          <div
                            key={exam.id}
                            onClick={() => setSelectedExamId(exam.id)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                              isSelected
                                ? 'border-sky-600 bg-sky-50/70 shadow-sm ring-2 ring-sky-500/20'
                                : 'border-slate-200 hover:border-sky-300 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="text-[10px] font-extrabold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
                                  {exam.subject}
                                </span>
                                <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                                  {exam.badge || 'Chính thức'}
                                </span>
                              </div>
                              <h5 className="font-extrabold text-sm text-slate-900 leading-snug">
                                {exam.title}
                              </h5>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                {exam.description}
                              </p>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                              <span>⏱ {exam.durationMinutes} phút</span>
                              <span className="font-extrabold text-sky-700">20 câu hỏi</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleStartExam(selectedExamId)}
                      className="w-full py-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Bắt đầu làm bài thi ({activeExam.title})</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TESTING SCREEN */}
              {examState === 'testing' && (
                <div className="space-y-6">
                  
                  {/* Question Navigation Matrix (1 to 20) */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                      <span>Bảng 20 câu hỏi bài thi (Đã làm {Object.keys(answers).length}/20 câu):</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-sky-700">
                          <span className="w-3 h-3 rounded-full bg-sky-600 inline-block"></span> Đã chọn
                        </span>
                        <span className="flex items-center gap-1 text-amber-600">
                          <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span> Đánh dấu xem lại
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {questions.map((_, idx) => {
                        const isAnswered = answers[idx] !== undefined;
                        const isFlagged = flagged[idx];
                        const isCurrent = idx === currentIdx;

                        let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-sky-50';
                        if (isAnswered) {
                          btnStyle = 'bg-sky-600 text-white border-sky-600 font-extrabold shadow-xs';
                        }
                        if (isFlagged) {
                          btnStyle = 'bg-amber-400 text-sky-950 border-amber-500 font-extrabold';
                        }
                        if (isCurrent) {
                          btnStyle += ' ring-2 ring-sky-500 scale-110';
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => setCurrentIdx(idx)}
                            className={`w-8 h-8 rounded-xl text-xs font-bold border transition-all flex items-center justify-center cursor-pointer ${btnStyle}`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* HUD: Timer & Action */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-sky-50 p-3 sm:p-4 rounded-2xl border border-sky-200">
                    <div className="flex items-center gap-2">
                      <div className="px-3.5 py-1.5 bg-white rounded-xl border border-sky-200 flex items-center gap-2 font-mono font-bold text-sm text-sky-900 shadow-xs">
                        <Timer className="w-4 h-4 text-sky-600" />
                        <span>Thời gian còn: {formatTime(timeLeftSeconds)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFlag(currentIdx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer ${
                          flagged[currentIdx] ? 'bg-amber-400 text-sky-950 border-amber-500' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>{flagged[currentIdx] ? 'Đã đánh dấu xem lại' : 'Đánh dấu xem lại'}</span>
                      </button>

                      <button
                        onClick={handleSubmitExam}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
                      >
                        Nộp bài thi
                      </button>
                    </div>
                  </div>

                  {/* Current Question Statement */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="text-xs font-bold text-sky-800 bg-sky-50 px-3 py-1 rounded-xl inline-block">
                      CÂU HỎI {currentIdx + 1} TRÊN 20
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                      {currentQ.question}
                    </h4>

                    {/* 4 Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {currentQ.options.map((opt, optIdx) => {
                        const isSelected = answers[currentIdx] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectAnswer(optIdx)}
                            className={`p-4 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center gap-3 cursor-pointer ${
                              isSelected
                                ? 'bg-sky-100 border-sky-600 text-sky-950 font-bold ring-2 ring-sky-500/20'
                                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-sky-50 hover:border-sky-300'
                            }`}
                          >
                            <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-sky-900 font-extrabold text-xs flex items-center justify-center shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Navigation between questions */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        disabled={currentIdx === 0}
                        onClick={() => setCurrentIdx(prev => Math.max(prev - 1, 0))}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        ← Câu trước
                      </button>

                      {currentIdx < questions.length - 1 ? (
                        <button
                          onClick={() => setCurrentIdx(prev => prev + 1)}
                          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-extrabold cursor-pointer"
                        >
                          Câu tiếp theo →
                        </button>
                      ) : (
                        <button
                          onClick={handleSubmitExam}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
                        >
                          Nộp bài ngay
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              )}

              {/* RESULT & FULL 20-QUESTION REVIEW SCREEN */}
              {examState === 'result' && (
                <div className="space-y-6 max-w-4xl mx-auto py-4">
                  
                  <div className="text-center space-y-3">
                    <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shadow-xl ring-8 ring-amber-50">
                      <Award className="w-10 h-10" />
                    </div>
                    <h4 className="text-2xl sm:text-3xl font-extrabold text-sky-950">
                      Kết Quả Bài Thi Đánh Giá Năng Lực!
                    </h4>
                    <p className="text-sm text-slate-600">
                      Chúc mừng bạn đã hoàn thành trọn vẹn 20 câu hỏi khảo sát chuyên sâu.
                    </p>
                  </div>

                  {/* Score summary cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100">
                      <div className="text-xs text-slate-500 font-medium">Điểm thi</div>
                      <div className="text-2xl sm:text-3xl font-black text-sky-900 mt-1 tabular-nums">
                        {finalScore} <span className="text-sm font-semibold text-slate-400">/ 10</span>
                      </div>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                      <div className="text-xs text-slate-500 font-medium">Số câu đúng</div>
                      <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1 tabular-nums">
                        {correctCount} <span className="text-sm font-semibold text-slate-400">/ 20</span>
                      </div>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                      <div className="text-xs text-slate-500 font-medium">Xếp loại</div>
                      <div className="text-xl font-black text-amber-800 mt-2">
                        {finalScore >= 9 ? 'Xuất Sắc 🌟' : finalScore >= 8 ? 'Giỏi' : finalScore >= 6.5 ? 'Khá' : 'Cần cố gắng'}
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                      <div className="text-xs text-slate-500 font-medium">Điểm thưởng XP</div>
                      <div className="text-2xl font-black text-emerald-600 mt-1">
                        ⚡ +{Math.max(100, correctCount * 15)} XP
                      </div>
                    </div>
                  </div>

                  {/* 20 Questions Review Section */}
                  <div className="space-y-4 pt-4">
                    <h5 className="font-extrabold text-base text-sky-950">
                      Chi tiết đáp án & giải thích toàn bộ 20 câu:
                    </h5>

                    <div className="space-y-3">
                      {questions.map((q, idx) => {
                        const userAns = answers[idx];
                        const isCorrect = userAns === q.correctIndex;

                        return (
                          <div key={q.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sky-800">Câu {idx + 1}:</span>
                              <span className={`font-bold px-2 py-0.5 rounded-md ${
                                isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {isCorrect ? '✓ Đúng' : `✕ Sai (Bạn chọn: ${userAns !== undefined ? String.fromCharCode(65 + userAns) : 'Bỏ trống'})`}
                              </span>
                            </div>
                            <p className="font-semibold text-slate-800">{q.question}</p>
                            <div className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <strong className="text-emerald-700">Đáp án đúng: {String.fromCharCode(65 + q.correctIndex)}. {q.options[q.correctIndex]}</strong>
                              <p className="mt-1 text-slate-500">{q.explanation}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleStartExam(selectedExamId)}
                      className="flex-1 py-3 bg-white text-sky-800 border-2 border-sky-300 hover:bg-sky-50 font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer text-xs"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Làm lại bài thi 20 câu</span>
                    </button>
                    <button
                      onClick={() => {
                        if (inlinePage) {
                          setExamState('intro');
                        } else {
                          onClose();
                        }
                      }}
                      className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-2xl shadow-md cursor-pointer text-xs"
                    >
                      {inlinePage ? 'Quay về danh sách đề thi' : 'Đóng & Cập nhật điểm'}
                    </button>
                  </div>

                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
};
