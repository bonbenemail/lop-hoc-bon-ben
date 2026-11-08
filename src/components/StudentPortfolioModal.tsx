import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  BookOpen, 
  Sparkles,
  Clock
} from 'lucide-react';
import { UserAccount, GradeLevel } from '../types';
import { MASCOT_IMAGE } from '../data/bonbenData';
import {
  getVietnamese20LessonsByGrade,
  getMath20LessonsByGrade,
  getEnglish20LessonsByGrade
} from '../data/practiceLessonsData';
import { getSubjectRealStats } from '../services/progressTracker';

interface StudentPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  currentGrade: GradeLevel;
}

export const StudentPortfolioModal: React.FC<StudentPortfolioModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentGrade,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  if (!isOpen) return null;

  const isAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.email?.toLowerCase() === 'bonbenemail@gmail.com';
  const studentName = currentUser?.fullName || 'Học sinh Lớp học Bon Ben';
  const studentEmail = isAdmin
    ? 'Tài khoản Quản trị viên'
    : currentUser?.email || 'Chưa đăng nhập';
  const studentSchool = currentUser?.school || 'Chưa cập nhật trường';
  const studentClass = currentUser?.className || `${currentGrade}A1`;
  const studentCode = currentUser?.studentCode || `BONBEN-${studentClass}`;
  const userEmail = currentUser?.email || null;

  const vanLessons = getVietnamese20LessonsByGrade(currentGrade);
  const toanLessons = getMath20LessonsByGrade(currentGrade);
  const anhLessons = getEnglish20LessonsByGrade(currentGrade);

  const vanStats = getSubjectRealStats(currentGrade, 'tieng-viet', vanLessons, userEmail);
  const toanStats = getSubjectRealStats(currentGrade, 'toan', toanLessons, userEmail);
  const anhStats = getSubjectRealStats(currentGrade, 'tieng-anh', anhLessons, userEmail);

  const totalPracticedLessons =
    vanStats.practicedLessonsCount +
    toanStats.practicedLessonsCount +
    anhStats.practicedLessonsCount;

  const totalAnsweredQuestions =
    vanStats.answeredQuestionsCount +
    toanStats.answeredQuestionsCount +
    anhStats.answeredQuestionsCount;

  const totalCorrectQuestions =
    vanStats.correctQuestionsCount +
    toanStats.correctQuestionsCount +
    anhStats.correctQuestionsCount;

  const totalWrongQuestions =
    vanStats.wrongQuestionsCount +
    toanStats.wrongQuestionsCount +
    anhStats.wrongQuestionsCount;

  const overallAccuracy =
    totalAnsweredQuestions > 0
      ? Math.round((totalCorrectQuestions / totalAnsweredQuestions) * 100)
      : 0;

  const subjectProgress = [
    {
      subject: `${currentGrade <= 5 ? 'Tiếng Việt (Văn)' : 'Ngữ văn'} Lớp ${currentGrade} (20 bài luyện · 400 câu)`,
      mastery: vanStats.overallUnderstandingRate,
      practicedLessons: vanStats.practicedLessonsCount,
      answeredQuestions: vanStats.answeredQuestionsCount,
      correctQuestions: vanStats.correctQuestionsCount,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      subject: `Toán học Lớp ${currentGrade} (20 bài luyện · 400 câu)`,
      mastery: toanStats.overallUnderstandingRate,
      practicedLessons: toanStats.practicedLessonsCount,
      answeredQuestions: toanStats.answeredQuestionsCount,
      correctQuestions: toanStats.correctQuestionsCount,
      color: 'from-sky-500 to-blue-600',
    },
    {
      subject: `Tiếng Anh Lớp ${currentGrade} (20 bài luyện · 400 câu)`,
      mastery: anhStats.overallUnderstandingRate,
      practicedLessons: anhStats.practicedLessonsCount,
      answeredQuestions: anhStats.answeredQuestionsCount,
      correctQuestions: anhStats.correctQuestionsCount,
      color: 'from-indigo-500 to-sky-600',
    },
  ];

  const allHistoryRecords = [
    ...vanStats.practicedLessonsDetails,
    ...toanStats.practicedLessonsDetails,
    ...anhStats.practicedLessonsDetails,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-sky-200 w-full max-w-4xl overflow-hidden relative flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-800 to-blue-800 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/80 shadow-md bg-white shrink-0">
              <img src={currentUser?.avatar || MASCOT_IMAGE} alt={studentName} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-sky-400 text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded-md">
                  LỚP {studentClass} (KHỐI {currentGrade})
                </span>
                <span className="text-xs text-sky-200 font-mono">Mã: {studentCode}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                {studentName}
              </h3>
              <p className="text-xs text-sky-200">
                🏫 {studentSchool} · {studentEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 px-3.5 py-1.5 rounded-2xl text-sky-200 font-black text-xs sm:text-sm border border-white/15">
              {totalPracticedLessons === 0
                ? 'Chưa làm bài (0%)'
                : `Đã làm ${totalPracticedLessons}/60 bài`}
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 gap-6 text-xs sm:text-sm font-bold text-slate-500 overflow-x-auto">
          {[
            { id: 'overview', label: '📊 Tổng quan học bạ thực tế' },
            { id: 'history', label: `📝 Lịch sử bài đã làm (${allHistoryRecords.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-sky-600 text-sky-700 font-extrabold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* 4 Real Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100">
                  <div className="text-[11px] font-bold text-slate-500">Số bài luyện đã làm</div>
                  <div className="text-xl sm:text-2xl font-black text-sky-800 mt-1 tabular-nums">
                    {totalPracticedLessons} / 60 bài
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {totalPracticedLessons === 0 ? 'Chưa làm bài nào (0%)' : `Còn ${60 - totalPracticedLessons} bài chưa làm`}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100">
                  <div className="text-[11px] font-bold text-slate-500">Số câu hỏi đã nộp</div>
                  <div className="text-xl sm:text-2xl font-black text-sky-700 mt-1 tabular-nums">
                    {totalAnsweredQuestions} / 1.200 câu
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Độ chính xác câu đã làm: {overallAccuracy}%
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100">
                  <div className="text-[11px] font-bold text-slate-500">Số câu Đúng / Sai</div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 tabular-nums">
                    {totalCorrectQuestions} đúng · <span className="text-red-500">{totalWrongQuestions} sai</span>
                  </div>
                  <div className="text-[10px] text-sky-600 font-semibold mt-1">
                    Ghi nhận trực tiếp khi làm bài
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100">
                  <div className="text-[11px] font-bold text-slate-500">Lớp & Trường hiện tại</div>
                  <div className="text-base sm:text-lg font-black text-purple-700 mt-1 truncate">
                    Lớp {studentClass}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 truncate">{studentSchool}</div>
                </div>
              </div>

              {/* Subject Mastery Progress Bars (0% if not done) */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Mức độ hiểu bài thực tế theo môn học (Mặc định 0% khi chưa làm)
                </h4>

                <div className="space-y-4">
                  {subjectProgress.map(sp => (
                    <div key={sp.subject} className="space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-slate-800">{sp.subject}</span>
                        <span className="font-extrabold text-sky-700">
                          {sp.answeredQuestions === 0
                            ? 'Chưa làm (0% · 0/20 bài)'
                            : `Đã hiểu ${sp.mastery}% (Đã làm ${sp.practicedLessons}/20 bài · Đúng ${sp.correctQuestions}/${sp.answeredQuestions} câu)`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${sp.color} transition-all duration-300`}
                          style={{ width: `${sp.mastery}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accurate AI Note */}
              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-150 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-sky-950 font-bold">Nhận xét thực tế của AI Bon Ben: </strong>
                  {totalPracticedLessons === 0 ? (
                    <span>
                      Hiện tại học sinh <strong>chưa làm bài luyện nào (0/60 bài, 0%)</strong> ở Lớp {currentGrade}. Hãy vào phần 20 bài luyện của môn Văn, Toán hoặc Tiếng Anh để bắt đầu làm bài và hệ thống sẽ thống kê chính xác kết quả tại đây!
                    </span>
                  ) : (
                    <span>
                      Học sinh đã thực hiện <strong>{totalPracticedLessons}/60 bài luyện</strong> ({totalAnsweredQuestions} câu đã nộp), trong đó trả lời đúng <strong>{totalCorrectQuestions} câu</strong> và sai <strong>{totalWrongQuestions} câu</strong> (đạt tỉ lệ chính xác {overallAccuracy}% trên số câu đã làm). Còn <strong>{60 - totalPracticedLessons} bài luyện chưa làm (0%)</strong>.
                    </span>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: REAL HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900">
                Danh sách các bài luyện đã làm thực tế ({allHistoryRecords.length} bài)
              </h4>
              {allHistoryRecords.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs sm:text-sm font-bold text-slate-700">
                    Chưa có bài luyện nào được thực hiện (0 bài).
                  </p>
                  <p className="text-xs text-slate-500">
                    Khi bạn làm bất kỳ bài luyện nào, lịch sử số câu đúng/sai và mức độ hiểu bài sẽ được lưu chính xác tại đây.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {allHistoryRecords.map(rec => (
                    <div key={rec.lessonId} className="p-4 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm">{rec.title}</div>
                        <div className="text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                          <span>Đã làm: <strong>{rec.answeredCount}/20 câu</strong></span>
                          <span>·</span>
                          <span className="font-bold text-emerald-600">Đúng {rec.correctCount} câu</span>
                          <span>·</span>
                          <span className="font-bold text-red-500">Sai {rec.wrongCount} câu</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-black text-sky-700 text-sm">
                          Đã hiểu: {rec.understandingRate}%
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Chính xác: {rec.accuracyOnAnswered}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
