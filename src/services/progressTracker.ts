import { GradeLevel, Lesson } from '../types';

export interface QuestionAttemptResult {
  questionId: string;
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
}

export interface LessonProgressRecord {
  lessonId: string;
  title: string;
  subjectId: 'tieng-viet' | 'toan' | 'tieng-anh';
  grade: GradeLevel;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  /** Mức độ hiểu bài thực tế = (correctCount / totalQuestions) * 100. Mặc định chưa làm là 0% */
  understandingRate: number;
  /** Độ chính xác trên số câu đã nộp = answeredCount > 0 ? (correctCount / answeredCount) * 100 : 0 */
  accuracyOnAnswered: number;
  status: 'not-started' | 'in-progress' | 'completed';
  selectedAnswers: Record<string, number>;
  selectedAnswerOriginalIndexes?: Record<string, number>;
  submittedQuestions: Record<string, boolean>;
  updatedAt: string;
}

const getStorageKey = (userEmail?: string | null): string => {
  const clean = userEmail ? userEmail.trim().toLowerCase() : 'guest';
  return `bonben_real_progress_v2_${clean}`;
};

export const getAllUserProgress = (
  userEmail?: string | null
): Record<string, LessonProgressRecord> => {
  try {
    const raw = localStorage.getItem(getStorageKey(userEmail));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to read user progress:', e);
  }
  return {};
};

export const getLessonProgress = (
  lessonId: string,
  userEmail?: string | null,
  fallbackMeta?: {
    title?: string;
    subjectId?: 'tieng-viet' | 'toan' | 'tieng-anh';
    grade?: GradeLevel;
    totalQuestions?: number;
  }
): LessonProgressRecord => {
  const all = getAllUserProgress(userEmail);
  const existing = all[lessonId];
  if (existing && existing.answeredCount > 0) {
    return existing;
  }

  const inferredSubject: 'tieng-viet' | 'toan' | 'tieng-anh' =
    fallbackMeta?.subjectId ||
    (lessonId.startsWith('van-')
      ? 'tieng-viet'
      : lessonId.startsWith('anh-')
      ? 'tieng-anh'
      : 'toan');

  return {
    lessonId,
    title: fallbackMeta?.title || lessonId,
    subjectId: inferredSubject,
    grade: fallbackMeta?.grade || 4,
    answeredCount: 0,
    correctCount: 0,
    wrongCount: 0,
    totalQuestions: fallbackMeta?.totalQuestions || 20,
    understandingRate: 0,
    accuracyOnAnswered: 0,
    status: 'not-started',
    selectedAnswers: {},
    submittedQuestions: {},
    updatedAt: '',
  };
};

export const saveLessonProgress = (
  record: LessonProgressRecord,
  userEmail?: string | null
): void => {
  try {
    const all = getAllUserProgress(userEmail);
    if (record.answeredCount <= 0) {
      delete all[record.lessonId];
    } else {
      all[record.lessonId] = record;
    }
    localStorage.setItem(getStorageKey(userEmail), JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save lesson progress:', e);
  }
};

export const resetSingleLessonProgress = (
  lessonId: string,
  userEmail?: string | null
): void => {
  try {
    const all = getAllUserProgress(userEmail);
    delete all[lessonId];
    localStorage.setItem(getStorageKey(userEmail), JSON.stringify(all));
  } catch (e) {
    console.error('Failed to reset lesson progress:', e);
  }
};

export const resetAllUserProgress = (userEmail?: string | null): void => {
  try {
    localStorage.removeItem(getStorageKey(userEmail));
  } catch (e) {
    console.error('Failed to reset all user progress:', e);
  }
};

export interface SubjectRealStats {
  subjectId: 'tieng-viet' | 'toan' | 'tieng-anh';
  subjectName: string;
  totalLessons: number;
  practicedLessonsCount: number;
  completedLessonsCount: number;
  unpracticedLessonsCount: number;
  totalQuestionsInSubject: number;
  answeredQuestionsCount: number;
  correctQuestionsCount: number;
  wrongQuestionsCount: number;
  /** Mức độ hiểu bài toàn môn = (tổng câu đúng / tổng số câu toàn môn 400) * 100 */
  overallUnderstandingRate: number;
  /** Tỉ lệ làm đúng trên các câu đã làm = answeredQuestionsCount > 0 ? Math.round((correctQuestionsCount / answeredQuestionsCount) * 100) : 0 */
  accuracyOnAttempted: number;
  practicedLessonsDetails: LessonProgressRecord[];
  unpracticedLessons: Lesson[];
}

export const getSubjectRealStats = (
  grade: GradeLevel,
  subjectId: 'tieng-viet' | 'toan' | 'tieng-anh',
  lessons: Lesson[],
  userEmail?: string | null
): SubjectRealStats => {
  const all = getAllUserProgress(userEmail);
  const subjectName =
    subjectId === 'tieng-viet'
      ? grade <= 5
        ? `Môn Tiếng Việt (Văn) Lớp ${grade}`
        : `Môn Ngữ văn Lớp ${grade}`
      : subjectId === 'toan'
      ? `Môn Toán học Lớp ${grade}`
      : `Môn Tiếng Anh Lớp ${grade}`;

  let practicedLessonsCount = 0;
  let completedLessonsCount = 0;
  let answeredQuestionsCount = 0;
  let correctQuestionsCount = 0;
  let wrongQuestionsCount = 0;
  const practicedLessonsDetails: LessonProgressRecord[] = [];
  const unpracticedLessons: Lesson[] = [];

  for (const lesson of lessons) {
    const rec = all[lesson.id];
    if (rec && rec.answeredCount > 0) {
      practicedLessonsCount += 1;
      if (rec.answeredCount >= rec.totalQuestions) {
        completedLessonsCount += 1;
      }
      answeredQuestionsCount += rec.answeredCount;
      correctQuestionsCount += rec.correctCount;
      wrongQuestionsCount += rec.wrongCount;
      practicedLessonsDetails.push({
        ...rec,
        title: lesson.title,
      });
    } else {
      unpracticedLessons.push(lesson);
    }
  }

  const totalLessons = lessons.length;
  const totalQuestionsInSubject = totalLessons * 20;
  const overallUnderstandingRate =
    totalQuestionsInSubject > 0
      ? Math.round((correctQuestionsCount / totalQuestionsInSubject) * 100)
      : 0;
  const accuracyOnAttempted =
    answeredQuestionsCount > 0
      ? Math.round((correctQuestionsCount / answeredQuestionsCount) * 100)
      : 0;

  return {
    subjectId,
    subjectName,
    totalLessons,
    practicedLessonsCount,
    completedLessonsCount,
    unpracticedLessonsCount: totalLessons - practicedLessonsCount,
    totalQuestionsInSubject,
    answeredQuestionsCount,
    correctQuestionsCount,
    wrongQuestionsCount,
    overallUnderstandingRate,
    accuracyOnAttempted,
    practicedLessonsDetails,
    unpracticedLessons,
  };
};
