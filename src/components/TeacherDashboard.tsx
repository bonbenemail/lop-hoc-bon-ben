import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  BookOpen,
  Trash2,
  Eye,
  GraduationCap,
  Building2,
  Sparkles,
  Play,
  FilePlus2,
  AlertCircle,
  Check
} from 'lucide-react';
import { GradeLevel, Lesson, QuizQuestion, UserAccount } from '../types';
import {
  isSameClassAndSchool,
  getTeacherCustomAssignments,
  saveTeacherCustomAssignment,
  deleteTeacherCustomAssignment,
  applyLessonOverrides
} from '../services/schoolManager';
import {
  firebaseProfileToUserAccount,
  subscribeToFirebaseStudentsForTeacher,
  updateTeacherStudentClassStatus,
} from '../services/firebaseNotifications';
import {
  getVietnamese20LessonsByGrade,
  getMath20LessonsByGrade,
  getEnglish20LessonsByGrade
} from '../data/practiceLessonsData';
import { getSubjectRealStats, getLessonProgress } from '../services/progressTracker';
import { shuffleQuestionOptions } from '../utils/answerOptionShuffle';

interface TeacherDashboardProps {
  currentUser: UserAccount;
  onOpenLesson: (lessonId: string) => void;
  onUpdateAccounts?: () => void;
  progressVersion?: number;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentUser,
  onOpenLesson,
  onUpdateAccounts,
  progressVersion,
}) => {
  const [activeTab, setActiveTab] = useState<'students-approval' | 'student-progress' | 'create-assignment'>('students-approval');
  const [allAccounts, setAllAccounts] = useState<UserAccount[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<Lesson[]>([]);
  const [selectedStudentForInspect, setSelectedStudentForInspect] = useState<UserAccount | null>(null);
  const [noticeBanner, setNoticeBanner] = useState<string | null>(null);

  // State tạo bài tập mới của Giáo viên
  const [newTitle, setNewTitle] = useState('');
  const [newSubjectId, setNewSubjectId] = useState<'tieng-viet' | 'toan' | 'tieng-anh'>('toan');
  const [newDifficulty, setNewDifficulty] = useState<'Cơ bản' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao'>('Vận dụng');
  const [newDescription, setNewDescription] = useState('');
  const [customQuestions, setCustomQuestions] = useState<QuizQuestion[]>([
    {
      id: `q-${Date.now()}-1`,
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: '',
      points: 10,
      difficulty: 'medium',
    },
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  const reloadData = () => {
    const allCustom = getTeacherCustomAssignments();
    setTeacherAssignments(
      allCustom.filter(
        (a) =>
          a.teacherEmail?.toLowerCase() === currentUser.email.toLowerCase() ||
          isSameClassAndSchool(
            a.targetClassName,
            a.targetSchool,
            currentUser.className,
            currentUser.school,
            a.grade,
            currentUser.grade
          )
      )
    );
  };

  useEffect(() => {
    reloadData();
    return subscribeToFirebaseStudentsForTeacher(
      currentUser,
      (profiles) => setAllAccounts(profiles.map(firebaseProfileToUserAccount)),
      (error) => {
        console.error('FIREBASE_TEACHER_USERS_LIST_ERROR:', error);
        showNotice(`Không thể tải danh sách học sinh từ Firebase: ${error.message}`);
      }
    );
  }, [currentUser.email, currentUser.className, currentUser.school, progressVersion]);

  const showNotice = (msg: string) => {
    setNoticeBanner(msg);
    setTimeout(() => setNoticeBanner(null), 4000);
  };

  const isTeacherApprovedByAdmin = currentUser.teacherApprovalStatus === 'approved';

  // Lọc các học sinh có đăng ký trùng Lớp và Trường với Giáo viên
  const matchingStudents = allAccounts.filter(
    (acc) =>
      acc.role === 'student' &&
      isSameClassAndSchool(
        acc.className,
        acc.school,
        currentUser.className,
        currentUser.school,
        acc.grade,
        currentUser.grade
      )
  );

  const pendingStudents = matchingStudents.filter(
    (s) => s.teacherClassStatus !== 'approved' && s.teacherClassStatus !== 'rejected'
  );
  const approvedStudents = matchingStudents.filter((s) => s.teacherClassStatus === 'approved');
  const rejectedStudents = matchingStudents.filter((s) => s.teacherClassStatus === 'rejected');

  const handleStudentClassDecision = async (
    student: UserAccount,
    status: 'approved' | 'rejected'
  ) => {
    try {
      await updateTeacherStudentClassStatus(currentUser, student, status);
      if (onUpdateAccounts) onUpdateAccounts();
      showNotice(
        status === 'approved'
          ? `✅ Đã cho phép học sinh "${student.fullName}" vào lớp ${currentUser.className} (${currentUser.school})!`
          : `Đã từ chối yêu cầu vào lớp của "${student.fullName}".`
      );
    } catch (error: unknown) {
      console.error('FIREBASE_TEACHER_STUDENT_STATUS_ERROR:', error);
      showNotice(
        `Không thể cập nhật trạng thái học sinh: ${
          error instanceof Error ? error.message : 'Vui lòng thử lại.'
        }`
      );
    }
  };

  const handleAddQuestionRow = () => {
    setCustomQuestions((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}-${prev.length + 1}`,
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        explanation: '',
        points: 10,
        difficulty: 'medium',
      },
    ]);
  };

  const handleRemoveQuestionRow = (idx: number) => {
    if (customQuestions.length <= 1) return;
    setCustomQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx: number, field: 'question' | 'explanation' | 'correctIndex', value: string | number) => {
    setCustomQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    setCustomQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const nextOpts = [...q.options];
        nextOpts[optIdx] = val;
        return { ...q, options: nextOpts };
      })
    );
  };

  const handleCreateAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newTitle.trim()) {
      setFormError('Vui lòng nhập tên bài tập do giáo viên giao.');
      return;
    }

    for (let i = 0; i < customQuestions.length; i++) {
      const q = customQuestions[i];
      if (!q.question.trim()) {
        setFormError(`Vui lòng nhập nội dung câu hỏi số ${i + 1}.`);
        return;
      }
      if (q.options.some((opt) => !opt.trim())) {
        setFormError(`Vui lòng điền đủ 4 đáp án A, B, C, D cho câu hỏi số ${i + 1}.`);
        return;
      }
    }

    const lessonId = `teacher-custom-${Date.now()}`;
    const newLesson: Lesson = {
      id: lessonId,
      title: `[Bài tập Giáo viên] ${newTitle.trim()}`,
      subjectId: newSubjectId,
      grade: currentUser.grade,
      duration: '20:00',
      difficulty: newDifficulty,
      completionRate: 0,
      xpReward: 200,
      diamonds: 0,
      description:
        newDescription.trim() ||
        `Bài tập chuyên đề do Giáo viên ${currentUser.fullName} tạo riêng cho Lớp ${currentUser.className} - ${currentUser.school}.`,
      keyPoints: [
        `Bài tập do Giáo viên ${currentUser.fullName} biên soạn cho Lớp ${currentUser.className} (${currentUser.school}).`,
        'Hoàn thành đầy đủ các câu hỏi để giáo viên theo dõi kết quả trong bảng tổng kết lớp.',
      ],
      sampleQuestions: customQuestions.map((q, idx) => {
        const id = `tcq-${Date.now()}-${idx + 1}`;
        const shuffled = shuffleQuestionOptions(
          q.options,
          q.correctIndex,
          `teacher-assignment:${lessonId}:${id}`
        );
        return {
          ...q,
          id,
          options: shuffled.options,
          correctIndex: shuffled.correctIndex,
          explanation:
            q.explanation.trim() ||
            `Đáp án đúng là ${String.fromCharCode(65 + shuffled.correctIndex)}: ${shuffled.options[shuffled.correctIndex]}`,
        };
      }),
      isTeacherCustom: true,
      teacherEmail: currentUser.email.toLowerCase(),
      teacherName: currentUser.fullName,
      targetClassName: currentUser.className || `${currentUser.grade}A1`,
      targetSchool: currentUser.school || '',
    };

    saveTeacherCustomAssignment(newLesson);
    reloadData();
    if (onUpdateAccounts) onUpdateAccounts();

    setNewTitle('');
    setNewDescription('');
    setCustomQuestions([
      {
        id: `q-${Date.now()}-1`,
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        explanation: '',
        points: 10,
        difficulty: 'medium',
      },
    ]);
    showNotice(`✅ Đã tạo bài tập mới "${newLesson.title}" cho Lớp ${currentUser.className}!`);
  };

  const handleDeleteAssignment = (lessonId: string) => {
    deleteTeacherCustomAssignment(lessonId);
    reloadData();
    if (onUpdateAccounts) onUpdateAccounts();
    showNotice('Đã xóa bài tập của giáo viên.');
  };

  if (!isTeacherApprovedByAdmin) {
    return (
      <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-xl p-6 sm:p-10 text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
            <Clock className="w-8 h-8" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold uppercase">
            TRẠNG THÁI: ĐANG CHỜ ADMIN XÉT DUYỆT TÀI KHOẢN GIÁO VIÊN
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Xin chào Giáo viên {currentUser.fullName}
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Bạn đã đăng ký giảng dạy tại <strong>Lớp {currentUser.className} (Khối {currentUser.grade})</strong> —{' '}
            <strong>{currentUser.school}</strong>. Hiện tại tài khoản Giáo viên của bạn đang chờ <strong>Admin xét duyệt</strong>.
            Ngay sau khi Admin duyệt, bạn sẽ có thể:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-2xl mx-auto pt-2">
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-xs space-y-1">
              <div className="font-extrabold text-sky-900">1. Duyệt học sinh vào lớp</div>
              <p className="text-slate-600">
                Cho phép các học sinh đăng ký trùng Lớp {currentUser.className} & Trường {currentUser.school} vào lớp học của bạn.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-xs space-y-1">
              <div className="font-extrabold text-sky-900">2. Tự tạo bài tập riêng</div>
              <p className="text-slate-600">
                Soạn và giao bài tập Văn, Toán, Anh trực tiếp cho học sinh trong lớp của mình.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-xs space-y-1">
              <div className="font-extrabold text-sky-900">3. Xem học sinh làm bài</div>
              <p className="text-slate-600">
                Kiểm tra chi tiết từng học sinh đã làm những bài luyện nào, đúng/sai bao nhiêu câu.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner của Giáo viên */}
      <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-400 text-slate-950 text-xs font-black px-3 py-0.5 rounded-full">
                ✓ GIÁO VIÊN ĐÃ ĐƯỢC ADMIN DUYỆT
              </span>
              <span className="bg-white/15 text-sky-100 text-xs font-bold px-3 py-0.5 rounded-full">
                Đang dạy: Lớp {currentUser.className} (Khối {currentUser.grade})
              </span>
              <span className="bg-white/15 text-sky-100 text-xs font-bold px-3 py-0.5 rounded-full">
                🏫 {currentUser.school}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Quản Lý Lớp Học Của Giáo Viên: {currentUser.fullName}
            </h2>
            <p className="text-xs sm:text-sm text-sky-200 max-w-2xl">
              Học sinh đăng ký trùng <strong>Lớp {currentUser.className}</strong> và <strong>{currentUser.school}</strong> sẽ tự động hiển thị tại đây để đợi bạn duyệt vào lớp.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 shrink-0 text-center">
            <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5">
              <div className="text-xl font-black text-amber-300">{pendingStudents.length}</div>
              <div className="text-[11px] text-sky-200 font-semibold">Chờ vào lớp</div>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5">
              <div className="text-xl font-black text-emerald-300">{approvedStudents.length}</div>
              <div className="text-[11px] text-sky-200 font-semibold">HS trong lớp</div>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5">
              <div className="text-xl font-black text-sky-300">{teacherAssignments.length}</div>
              <div className="text-[11px] text-sky-200 font-semibold">Bài tập đã tạo</div>
            </div>
          </div>
        </div>
      </div>

      {noticeBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{noticeBanner}</span>
        </div>
      )}

      {/* 3 Tab Điều Hướng của Giáo Viên */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-sky-100 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('students-approval')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'students-approval'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-sky-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Duyệt học sinh vào lớp ({pendingStudents.length} chờ duyệt)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('student-progress')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'student-progress'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-sky-50'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Xem học sinh đã làm bài luyện nào ({approvedStudents.length} HS)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('create-assignment')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'create-assignment'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-sky-50'
          }`}
        >
          <FilePlus2 className="w-4 h-4" />
          <span>Tự tạo bài tập cho lớp ({teacherAssignments.length})</span>
        </button>
      </div>

      {/* TAB 1: DUYỆT HỌC SINH VÀO LỚP */}
      {activeTab === 'students-approval' && (
        <div className="space-y-6">
          {/* Khu vực 1: Học sinh trùng Lớp & Trường đang chờ Giáo viên cho vào lớp */}
          <div className="bg-white rounded-3xl border border-amber-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  1. Học sinh đăng ký trùng Lớp {currentUser.className} ({currentUser.school}) đang chờ vào lớp ({pendingStudents.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nhấn "Cho vào lớp" để học sinh chính thức vào lớp học của bạn và nhận các bài tập bạn giao.
                </p>
              </div>
              <span className="bg-amber-100 text-amber-800 text-xs font-black px-3 py-1 rounded-full shrink-0">
                {pendingStudents.length} đang đợi
              </span>
            </div>

            {pendingStudents.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                Hiện chưa có học sinh nào mới đang chờ duyệt vào Lớp {currentUser.className} ({currentUser.school}).
              </div>
            ) : (
              <div className="space-y-3">
                {pendingStudents.map((st) => (
                  <div
                    key={st.email}
                    className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-slate-900">{st.fullName}</span>
                        <span className="text-[11px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md">
                          Lớp {st.className} · Khối {st.grade}
                        </span>
                        <span className="text-[11px] text-slate-600">🏫 {st.school}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Gmail học sinh: <strong>{st.email}</strong> · Quyền làm bài từ Admin:{' '}
                        <strong className={st.canPracticeAll ? 'text-emerald-700' : 'text-amber-700'}>
                          {st.canPracticeAll ? 'Đã được Admin cho phép làm bài' : 'Đang chờ Admin cho phép (Chỉ mở 3 bài đầu)'}
                        </strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStudentClassDecision(st, 'approved')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Cho vào lớp</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStudentClassDecision(st, 'rejected')}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Khu vực 2: Danh sách học sinh đã được duyệt vào lớp */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  2. Danh sách học sinh chính thức trong Lớp {currentUser.className} ({approvedStudents.length} học sinh)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Các học sinh dưới đây đã được bạn cho phép vào lớp học.
                </p>
              </div>
            </div>

            {approvedStudents.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                Chưa có học sinh nào trong danh sách lớp chính thức.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {approvedStudents.map((st) => (
                  <div
                    key={st.email}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">{st.fullName}</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                          Đã vào lớp
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{st.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudentForInspect(st);
                          setActiveTab('student-progress');
                        }}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Xem bài đã làm
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStudentClassDecision(st, 'rejected')}
                        className="px-2.5 py-1.5 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Xóa khỏi lớp
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {rejectedStudents.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 mb-2">
                  Học sinh đã từ chối ({rejectedStudents.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {rejectedStudents.map((st) => (
                    <div
                      key={st.email}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs flex items-center gap-2"
                    >
                      <span>{st.fullName} ({st.email})</span>
                      <button
                        type="button"
                        onClick={() => handleStudentClassDecision(st, 'approved')}
                        className="text-sky-700 font-extrabold underline cursor-pointer"
                      >
                        Cho vào lớp lại
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: XEM XÉT HỌC SINH ĐÃ LÀM NHỮNG BÀI LUYỆN NÀO */}
      {activeTab === 'student-progress' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
              Theo Dõi Kết Quả Làm Bài Của Học Sinh Lớp {currentUser.className} ({currentUser.school})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Xem chính xác từng học sinh đã làm những bài luyện nào (Văn, Toán, Anh & Bài tập Giáo viên giao), số câu đúng/sai và mức độ hiểu bài.
            </p>
          </div>

          {approvedStudents.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
              Chưa có học sinh nào được duyệt vào lớp. Hãy sang mục "Duyệt học sinh vào lớp" để chấp nhận học sinh.
            </div>
          ) : (
            <div className="space-y-4">
              {approvedStudents.map((st) => {
                const vanLessons = applyLessonOverrides(getVietnamese20LessonsByGrade(st.grade));
                const toanLessons = applyLessonOverrides(getMath20LessonsByGrade(st.grade));
                const anhLessons = applyLessonOverrides(getEnglish20LessonsByGrade(st.grade));

                const vanStats = getSubjectRealStats(st.grade, 'tieng-viet', vanLessons, st.email);
                const toanStats = getSubjectRealStats(st.grade, 'toan', toanLessons, st.email);
                const anhStats = getSubjectRealStats(st.grade, 'tieng-anh', anhLessons, st.email);

                const customDone = teacherAssignments
                  .map((a) =>
                    getLessonProgress(a.id, st.email, {
                      title: a.title,
                      subjectId: (a.subjectId as 'tieng-viet' | 'toan' | 'tieng-anh') || 'toan',
                      grade: a.grade,
                      totalQuestions: a.sampleQuestions.length || 1,
                    })
                  )
                  .filter((p) => p.answeredCount > 0);

                const allDoneLessons = [
                  ...customDone,
                  ...vanStats.practicedLessonsDetails,
                  ...toanStats.practicedLessonsDetails,
                  ...anhStats.practicedLessonsDetails,
                ];

                const totalPracticed = allDoneLessons.length;
                const totalCorrect = allDoneLessons.reduce((acc, p) => acc + p.correctCount, 0);
                const totalAnswered = allDoneLessons.reduce((acc, p) => acc + p.answeredCount, 0);
                const isSelected = selectedStudentForInspect?.email === st.email;

                return (
                  <div
                    key={st.email}
                    className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/40"
                  >
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm sm:text-base text-slate-900">
                            {st.fullName}
                          </span>
                          <span className="text-xs text-slate-500">({st.email})</span>
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                              totalPracticed > 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {totalPracticed === 0
                              ? 'Chưa làm bài nào (0%)'
                              : `Đã làm ${totalPracticed} bài luyện`}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-3">
                          <span>Văn: <strong>{vanStats.practicedLessonsCount}/20 bài</strong> ({vanStats.overallUnderstandingRate}%)</span>
                          <span>Toán: <strong>{toanStats.practicedLessonsCount}/20 bài</strong> ({toanStats.overallUnderstandingRate}%)</span>
                          <span>Anh: <strong>{anhStats.practicedLessonsCount}/20 bài</strong> ({anhStats.overallUnderstandingRate}%)</span>
                          <span>Bài tập GV: <strong>{customDone.length}/{teacherAssignments.length} bài</strong></span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedStudentForInspect(isSelected ? null : st)
                        }
                        className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 font-extrabold text-xs rounded-xl border border-sky-200 cursor-pointer shrink-0"
                      >
                        {isSelected ? 'Thu gọn chi tiết' : `Chi tiết ${totalPracticed} bài đã làm`}
                      </button>
                    </div>

                    {isSelected && (
                      <div className="p-4 bg-sky-50/40 border-t border-slate-200 space-y-2.5">
                        <div className="text-xs font-extrabold text-sky-950">
                          Danh sách cụ thể các bài luyện học sinh {st.fullName} đã thực hiện (Tổng đúng {totalCorrect}/{totalAnswered} câu đã nộp):
                        </div>
                        {allDoneLessons.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">
                            Học sinh này chưa làm bài luyện nào (Tất cả đang ở mức 0%).
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {allDoneLessons.map((rec) => (
                              <div
                                key={rec.lessonId}
                                className="p-3 rounded-xl bg-white border border-sky-100 flex items-center justify-between gap-2 text-xs"
                              >
                                <div>
                                  <div className="font-bold text-slate-900">{rec.title}</div>
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    Đã làm {rec.answeredCount}/{rec.totalQuestions} câu ·{' '}
                                    <span className="text-emerald-600 font-bold">Đúng {rec.correctCount}</span> ·{' '}
                                    <span className="text-red-500 font-bold">Sai {rec.wrongCount}</span>
                                  </div>
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-900 font-black shrink-0">
                                  Hiểu {rec.understandingRate}%
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GIÁO VIÊN TỰ TẠO BÀI TẬP CHO LỚP */}
      {activeTab === 'create-assignment' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form tạo bài tập mới */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-sky-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                Tạo Bài Tập Mới Cho Lớp {currentUser.className} ({currentUser.school})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bài tập bạn tạo sẽ tự động hiển thị cho các học sinh trong Lớp {currentUser.className} đã được bạn duyệt vào lớp.
              </p>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAssignmentSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tên bài tập giao cho lớp: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={`Ví dụ: Ôn tập cuối tuần Lớp ${currentUser.className}`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Môn học:</label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-sky-900 bg-white"
                  >
                    <option value="toan">📐 Môn Toán (Lớp {currentUser.grade})</option>
                    <option value="tieng-viet">📖 Môn Văn (Lớp {currentUser.grade})</option>
                    <option value="tieng-anh">🌍 Môn Anh (Lớp {currentUser.grade})</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mức độ:</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-sky-900 bg-white"
                  >
                    <option value="Cơ bản">Cơ bản</option>
                    <option value="Thông hiểu">Thông hiểu</option>
                    <option value="Vận dụng">Vận dụng</option>
                    <option value="Vận dụng cao">Vận dụng cao</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Hướng dẫn / Ghi chú cho học sinh:
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Nhập dặn dò của giáo viên cho bài tập này..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              {/* Danh sách câu hỏi do Giáo viên biên soạn */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-sky-950">
                    Danh sách câu hỏi ({customQuestions.length} câu):
                  </span>
                  <button
                    type="button"
                    onClick={handleAddQuestionRow}
                    className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-extrabold text-xs rounded-xl border border-sky-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm câu hỏi</span>
                  </button>
                </div>

                {customQuestions.map((q, qIdx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-sky-800">
                        Câu hỏi số {qIdx + 1}:
                      </span>
                      {customQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestionRow(qIdx)}
                          className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa câu này</span>
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      required
                      value={q.question}
                      onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                      placeholder={`Nhập đề bài câu hỏi số ${qIdx + 1}...`}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-900 font-extrabold text-xs flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                            placeholder={`Đáp án ${String.fromCharCode(65 + optIdx)}`}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Đáp án đúng:
                        </label>
                        <select
                          value={q.correctIndex}
                          onChange={(e) =>
                            handleQuestionChange(qIdx, 'correctIndex', Number(e.target.value))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-emerald-700"
                        >
                          <option value={0}>Đáp án A</option>
                          <option value={1}>Đáp án B</option>
                          <option value={2}>Đáp án C</option>
                          <option value={3}>Đáp án D</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Lời giải thích:
                        </label>
                        <input
                          type="text"
                          value={q.explanation}
                          onChange={(e) =>
                            handleQuestionChange(qIdx, 'explanation', e.target.value)
                          }
                          placeholder="Giải thích ngắn gọn..."
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Lưu & Giao Bài Tập Cho Lớp {currentUser.className}</span>
              </button>
            </form>
          </div>

          {/* Danh sách bài tập Giáo viên đã tạo */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3">
              Bài Tập Đã Giao Cho Lớp {currentUser.className} ({teacherAssignments.length})
            </h3>

            {teacherAssignments.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                Bạn chưa tạo bài tập riêng nào cho lớp. Hãy điền biểu mẫu bên trái để giao bài tập đầu tiên!
              </div>
            ) : (
              <div className="space-y-3">
                {teacherAssignments.map((ass) => (
                  <div
                    key={ass.id}
                    className="p-4 rounded-2xl border border-sky-200 bg-sky-50/40 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-sky-600 text-white">
                          Lớp {ass.targetClassName} · {ass.sampleQuestions.length} câu hỏi
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900 mt-1">
                          {ass.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">{ass.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteAssignment(ass.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                        title="Xóa bài tập"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-sky-100">
                      <span className="text-[11px] font-bold text-sky-800">
                        Đã làm:{' '}
                        {
                          approvedStudents.filter(
                            (st) => getLessonProgress(ass.id, st.email).answeredCount > 0
                          ).length
                        }
                        /{approvedStudents.length} học sinh
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenLesson(ass.id)}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Xem / Làm thử</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
