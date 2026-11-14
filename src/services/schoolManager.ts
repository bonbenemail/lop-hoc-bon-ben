import { GradeLevel, Lesson, SchoolDirectoryEntry, SiteConfig, UserAccount } from '../types';
import { shuffleQuestionOptions } from '../utils/answerOptionShuffle';
import { VIETNAM_OSM_SCHOOLS } from '../data/vietnamOsmSchools';

const ACCOUNTS_KEY = 'bonben_registered_accounts';
const CURRENT_USER_KEY = 'bonben_user_account';
const TEACHER_ASSIGNMENTS_KEY = 'bonben_teacher_assignments';
const SITE_CONFIG_KEY = 'bonben_site_config';
const LESSON_OVERRIDES_KEY = 'bonben_lesson_overrides';
const SCHOOL_DIRECTORY_KEY = 'bonben_school_directory';
const TEACHER_ASSIGNMENTS_SHUFFLE_VERSION_KEY = 'bonben_teacher_assignments_shuffle_version';
const TEACHER_ASSIGNMENTS_SHUFFLE_VERSION = '1';

export const ADMIN_GMAIL_INTERNAL = 'bonbenemail@gmail.com';

export const getSchoolDirectory = (): SchoolDirectoryEntry[] => {
  try {
    const raw = localStorage.getItem(SCHOOL_DIRECTORY_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return VIETNAM_OSM_SCHOOLS;
    const customEntries = parsed.filter(
      (entry): entry is SchoolDirectoryEntry =>
        entry &&
        typeof entry.id === 'string' &&
        typeof entry.schoolName === 'string' &&
        typeof entry.schoolLevel === 'string' &&
        ['elementary', 'lower-secondary', 'upper-secondary', 'all'].includes(entry.schoolLevel) &&
        typeof entry.provinceOrCity === 'string' &&
        typeof entry.district === 'string' &&
        entry.source !== 'openstreetmap'
    );
    return [...VIETNAM_OSM_SCHOOLS, ...customEntries];
  } catch (error) {
    console.error('Không thể đọc danh mục trường học:', error);
    return VIETNAM_OSM_SCHOOLS;
  }
};

export const saveSchoolDirectory = (entries: SchoolDirectoryEntry[]): void => {
  localStorage.setItem(
    SCHOOL_DIRECTORY_KEY,
    JSON.stringify(entries.filter((entry) => entry.source !== 'openstreetmap'))
  );
};

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  topBannerText: 'Ngân hàng 20 bài luyện chuyên sâu mỗi môn Văn · Toán · Anh',
  heroBadgeText: 'CÔNG NGHỆ AI CHẨN ĐOÁN LỖ HỔNG KIẾN THỨC BON BEN',
  heroTitleLine1: 'Học đúng trọng tâm,',
  heroTitleHighlight: 'Bứt phá điểm số',
  heroTitleLine2: 'cùng Lớp học Bon Ben',
  heroDescription:
    'Nền tảng học trực tuyến thông minh chuẩn hóa 100% chương trình SGK mới của Bộ GD&ĐT. Mỗi khối lớp từ Lớp 1 đến Lớp 12 đều có riêng trọn bộ 20 bài luyện Toán, 20 bài luyện Văn và 20 bài luyện Tiếng Anh (20 câu/bài).',
  footerDescription:
    'Nền tảng học tập trực tuyến thông minh hàng đầu dành cho học sinh phổ thông từ Lớp 1 đến Lớp 12, ứng dụng trí tuệ nhân tạo (AI) giúp tối ưu hóa lộ trình học Toán, Ngữ văn và Tiếng Anh.',
  supportContactEmailDisplay: 'hotro@bonben.edu.vn',
  trialLimitCount: 3,
};

export const normalizeClassName = (cls?: string, grade?: number): string => {
  const raw = (cls || (grade ? `${grade}A1` : '')).trim().toLowerCase();
  return raw.replace(/^lớp\s+/i, '').replace(/\s+/g, '');
};

export const normalizeSchoolName = (school?: string): string => {
  return (school || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
};

export const formatSchoolName = (value: string): string =>
  value
    .trim()
    .replace(/\s+/g, ' ')
    .split(/(\s+|-)/)
    .map((part) => {
      if (!part || /^[\s-]+$/.test(part)) return part;
      if (part === part.toLocaleUpperCase('vi-VN')) return part;
      return `${part.charAt(0).toLocaleUpperCase('vi-VN')}${part.slice(1).toLocaleLowerCase('vi-VN')}`;
    })
    .join('');

export const isSameClassAndSchool = (
  classA?: string,
  schoolA?: string,
  classB?: string,
  schoolB?: string,
  gradeA?: number,
  gradeB?: number
): boolean => {
  const normClassA = normalizeClassName(classA, gradeA);
  const normClassB = normalizeClassName(classB, gradeB);
  const normSchoolA = normalizeSchoolName(schoolA);
  const normSchoolB = normalizeSchoolName(schoolB);
  if (!normClassA || !normSchoolA || !normClassB || !normSchoolB) return false;
  return normClassA === normClassB && normSchoolA === normSchoolB;
};

/**
 * Đọc và đồng bộ tự động mối liên kết Lớp & Trường giữa Học sinh và Giáo viên
 */
export const getAllRegisteredAccounts = (): UserAccount[] => {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed: UserAccount[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const uniqueMap = new Map<string, UserAccount>();
    for (const acc of parsed) {
      if (
        acc &&
        acc.verifiedByGmail === true &&
        typeof acc.email === 'string' &&
        acc.email.toLowerCase().endsWith('@gmail.com') &&
        acc.email.toLowerCase() !== ADMIN_GMAIL_INTERNAL
      ) {
        const key = acc.email.toLowerCase();
        if (!uniqueMap.has(key)) {
          // Chuẩn hóa các trường mặc định cho tài khoản cũ nếu chưa có
          const normalizedAcc: UserAccount = {
            ...acc,
            role:
              acc.role === 'teacher' || acc.role === 'school' || acc.role === 'parent'
                ? acc.role
                : 'student',
            canPracticeAll: acc.role === 'teacher' ? true : acc.canPracticeAll === true,
            practiceApprovalStatus:
              acc.role === 'teacher'
                ? 'approved'
                : acc.practiceApprovalStatus || (acc.canPracticeAll === true ? 'approved' : 'pending'),
            teacherApprovalStatus:
              acc.role === 'teacher' ? acc.teacherApprovalStatus || 'pending' : undefined,
          };
          uniqueMap.set(key, normalizedAcc);
        }
      }
    }

    const list = Array.from(uniqueMap.values());
    const teachers = list.filter((u) => u.role === 'teacher' && u.teacherApprovalStatus !== 'rejected');

    // Tự động kiểm tra xem học sinh có trùng Lớp & Trường với giáo viên nào đã đăng ký không
    let changed = false;
    const syncedList: UserAccount[] = list.map((acc): UserAccount => {
      if (acc.role !== 'student') return acc;
      const matchedTeacher = teachers.find((t) =>
        isSameClassAndSchool(acc.className, acc.school, t.className, t.school, acc.grade, t.grade)
      );

      if (matchedTeacher) {
        const teacherEmail = matchedTeacher.email.toLowerCase();
        if (acc.matchedTeacherEmail?.toLowerCase() !== teacherEmail) {
          changed = true;
          return {
            ...acc,
            matchedTeacherEmail: teacherEmail,
            matchedTeacherName: matchedTeacher.fullName,
            teacherClassStatus: acc.teacherClassStatus === 'approved' ? 'approved' : 'pending',
          };
        }
        if (!acc.teacherClassStatus || acc.teacherClassStatus === 'none') {
          changed = true;
          return {
            ...acc,
            matchedTeacherEmail: teacherEmail,
            matchedTeacherName: matchedTeacher.fullName,
            teacherClassStatus: 'pending',
          };
        }
      } else if (acc.teacherClassStatus && acc.teacherClassStatus !== 'none') {
        changed = true;
        return {
          ...acc,
          matchedTeacherEmail: undefined,
          matchedTeacherName: undefined,
          teacherClassStatus: 'none',
        };
      }
      return acc;
    });

    if (changed) {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(syncedList));
    }

    return syncedList;
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const saveAllRegisteredAccounts = (accounts: UserAccount[]): void => {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    // Đồng bộ lại tài khoản đang đăng nhập nếu trùng email
    const currentRaw = localStorage.getItem(CURRENT_USER_KEY);
    if (currentRaw) {
      const current: UserAccount = JSON.parse(currentRaw);
      const matched = accounts.find(
        (a) => a.email.toLowerCase() === current.email?.toLowerCase()
      );
      if (matched) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(matched));
      }
    }
  } catch (e) {
    console.error(e);
  }
};

/**
 * Kiểm tra bài luyện có thuộc 3 bài đầu tiên (dòng đầu) được phép làm thử hay không
 */
export const isLessonInFirst3Trial = (lessonIdOrIndex: string | number): boolean => {
  if (typeof lessonIdOrIndex === 'number') {
    return lessonIdOrIndex >= 0 && lessonIdOrIndex < 3;
  }
  if (lessonIdOrIndex.startsWith('teacher-custom-')) {
    return false;
  }
  const match = lessonIdOrIndex.match(/-bai-(\d+)$/);
  if (match) {
    const num = parseInt(match[1], 10);
    return num >= 1 && num <= 3;
  }
  return false;
};

/**
 * Kiểm tra quyền làm bài luyện của người dùng:
 * - Admin hoặc Giáo viên đã được Admin duyệt: được truy cập tất cả.
 * - Học sinh đã được Admin cho phép (canPracticeAll === true): được làm toàn bộ mọi bài luyện.
 * - Học sinh chưa được Admin cho phép (canPracticeAll !== true) hoặc chưa đăng nhập:
 *   CHỈ được làm thử 3 bài ở dòng đầu (Bài 1, 2, 3), KHÔNG thể làm các bài ôn 4..20.
 */
export const canUserAccessLesson = (
  user: UserAccount | null,
  lessonIdOrIndex: string | number
): boolean => {
  if (isLessonInFirst3Trial(lessonIdOrIndex)) {
    return true;
  }
  if (!user) return false;
  if (user.role === 'admin' || user.email?.toLowerCase() === ADMIN_GMAIL_INTERNAL) {
    return true;
  }
  if (user.role === 'teacher' && user.teacherApprovalStatus === 'approved') {
    return true;
  }
  if (user.role === 'student' && user.canPracticeAll === true) {
    return true;
  }
  return false;
};

/**
 * Kiểm tra quyền làm Bài thi & Kiểm tra 20 câu:
 * - Chỉ mở khi Admin đã cho phép học sinh làm bài (canPracticeAll === true) hoặc là Giáo viên đã duyệt / Admin.
 */
export const canUserAccessExam = (user: UserAccount | null): boolean => {
  if (!user) return false;
  if (user.role === 'admin' || user.email?.toLowerCase() === ADMIN_GMAIL_INTERNAL) {
    return true;
  }
  if (user.role === 'teacher' && user.teacherApprovalStatus === 'approved') {
    return true;
  }
  if (user.role === 'student' && user.canPracticeAll === true) {
    return true;
  }
  return false;
};

/**
 * Admin duyệt hoặc thu hồi tài khoản Giáo viên
 */
export const adminUpdateTeacherApproval = (
  teacherEmail: string,
  status: 'approved' | 'pending' | 'rejected'
): UserAccount[] => {
  const accounts = getAllRegisteredAccounts();
  const next = accounts.map((acc) => {
    if (acc.email.toLowerCase() === teacherEmail.toLowerCase() && acc.role === 'teacher') {
      return {
        ...acc,
        teacherApprovalStatus: status,
      };
    }
    return acc;
  });
  saveAllRegisteredAccounts(next);
  return getAllRegisteredAccounts();
};

/**
 * Admin cho phép hoặc không cho phép Học sinh làm toàn bộ bài luyện, bài thi & kiểm tra
 */
export const adminUpdateStudentPracticePermission = (
  studentEmail: string,
  allowAll: boolean
): UserAccount[] => {
  const accounts = getAllRegisteredAccounts();
  const next = accounts.map((acc) => {
    if (acc.email.toLowerCase() === studentEmail.toLowerCase() && acc.role === 'student') {
      return {
        ...acc,
        canPracticeAll: allowAll,
        practiceApprovalStatus: (allowAll ? 'approved' : 'blocked') as 'approved' | 'blocked',
      };
    }
    return acc;
  });
  saveAllRegisteredAccounts(next);
  return getAllRegisteredAccounts();
};

/**
 * Giáo viên duyệt hoặc từ chối Học sinh (cùng Lớp & Trường) vào lớp học của mình
 */
export const teacherUpdateStudentClassStatus = (
  teacher: UserAccount,
  studentEmail: string,
  status: 'approved' | 'rejected' | 'pending'
): UserAccount[] => {
  const accounts = getAllRegisteredAccounts();
  const next = accounts.map((acc) => {
    if (acc.email.toLowerCase() === studentEmail.toLowerCase() && acc.role === 'student') {
      return {
        ...acc,
        teacherClassStatus: status,
        matchedTeacherEmail: teacher.email.toLowerCase(),
        matchedTeacherName: teacher.fullName,
      };
    }
    return acc;
  });
  saveAllRegisteredAccounts(next);
  return getAllRegisteredAccounts();
};

/**
 * Quản lý Bài tập do Giáo viên tự tạo cho Lớp & Trường của mình
 */
export const getTeacherCustomAssignments = (): Lesson[] => {
  try {
    const raw = localStorage.getItem(TEACHER_ASSIGNMENTS_KEY);
    if (!raw) {
      localStorage.setItem(TEACHER_ASSIGNMENTS_SHUFFLE_VERSION_KEY, TEACHER_ASSIGNMENTS_SHUFFLE_VERSION);
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const assignments = parsed as Lesson[];
    if (localStorage.getItem(TEACHER_ASSIGNMENTS_SHUFFLE_VERSION_KEY) !== TEACHER_ASSIGNMENTS_SHUFFLE_VERSION) {
      const migrated = assignments.map((lesson) => ({
        ...lesson,
        sampleQuestions: lesson.sampleQuestions.map((question) => {
          const correctAnswer = question.options[question.correctIndex];
          const shuffled = shuffleQuestionOptions(
            question.options,
            question.correctIndex,
            `teacher-assignment:${lesson.id}:${question.id}`
          );
          return {
            ...question,
            options: shuffled.options,
            correctIndex: shuffled.correctIndex,
            explanation: /^Đáp án đúng là [A-D]:/.test(question.explanation)
              ? `Đáp án đúng là ${String.fromCharCode(65 + shuffled.correctIndex)}: ${correctAnswer}`
              : question.explanation,
          };
        }),
      }));
      localStorage.setItem(TEACHER_ASSIGNMENTS_KEY, JSON.stringify(migrated));
      localStorage.setItem(TEACHER_ASSIGNMENTS_SHUFFLE_VERSION_KEY, TEACHER_ASSIGNMENTS_SHUFFLE_VERSION);
      return migrated;
    }

    return assignments;
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const saveTeacherCustomAssignment = (lesson: Lesson): Lesson[] => {
  const list = getTeacherCustomAssignments();
  const existingIdx = list.findIndex((l) => l.id === lesson.id);
  let next: Lesson[];
  if (existingIdx >= 0) {
    next = list.map((l, i) => (i === existingIdx ? lesson : l));
  } else {
    next = [lesson, ...list];
  }
  localStorage.setItem(TEACHER_ASSIGNMENTS_KEY, JSON.stringify(next));
  localStorage.setItem(TEACHER_ASSIGNMENTS_SHUFFLE_VERSION_KEY, TEACHER_ASSIGNMENTS_SHUFFLE_VERSION);
  return next;
};

export const deleteTeacherCustomAssignment = (lessonId: string): Lesson[] => {
  const list = getTeacherCustomAssignments();
  const next = list.filter((l) => l.id !== lessonId);
  localStorage.setItem(TEACHER_ASSIGNMENTS_KEY, JSON.stringify(next));
  return next;
};

/**
 * Lấy danh sách bài tập do Giáo viên giao cho học sinh đã được duyệt vào lớp
 */
export const getAssignmentsForStudent = (student: UserAccount | null): Lesson[] => {
  if (!student) return [];
  const allAssignments = getTeacherCustomAssignments();

  if (student.role === 'admin' || student.email?.toLowerCase() === ADMIN_GMAIL_INTERNAL) {
    return allAssignments;
  }

  if (student.role === 'teacher') {
    return allAssignments.filter(
      (a) =>
        a.teacherEmail?.toLowerCase() === student.email.toLowerCase() ||
        isSameClassAndSchool(
          a.targetClassName,
          a.targetSchool,
          student.className,
          student.school,
          a.grade,
          student.grade
        )
    );
  }

  // Học sinh chỉ thấy bài tập của giáo viên khi trùng Lớp & Trường VÀ đã được giáo viên cho vào lớp (teacherClassStatus === 'approved')
  if (student.teacherClassStatus !== 'approved') {
    return [];
  }

  return allAssignments.filter((a) =>
    isSameClassAndSchool(
      a.targetClassName,
      a.targetSchool,
      student.className,
      student.school,
      a.grade,
      student.grade
    )
  );
};

/**
 * Quản lý Cấu hình Trang Web (Cho phép Admin sửa trực tiếp trang web)
 */
export const getSiteConfig = (): SiteConfig => {
  try {
    const raw = localStorage.getItem(SITE_CONFIG_KEY);
    if (!raw) return DEFAULT_SITE_CONFIG;
    return { ...DEFAULT_SITE_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    console.error(e);
    return DEFAULT_SITE_CONFIG;
  }
};

export const getConfiguredMascotImage = (fallback: string): string => {
  const imageUrl = getSiteConfig().mascotImageUrl?.trim();
  if (!imageUrl) return fallback;
  if (imageUrl.startsWith('/') && !imageUrl.startsWith('//')) return imageUrl;
  return /^https:\/\//i.test(imageUrl) ? imageUrl : fallback;
};

export const saveSiteConfig = (config: SiteConfig): SiteConfig => {
  localStorage.setItem(SITE_CONFIG_KEY, JSON.stringify(config));
  return config;
};

export const resetSiteConfig = (): SiteConfig => {
  localStorage.removeItem(SITE_CONFIG_KEY);
  return DEFAULT_SITE_CONFIG;
};

/**
 * Cho phép Admin sửa trực tiếp tiêu đề / mô tả của bất kỳ bài luyện nào trên trang web
 */
export interface LessonOverride {
  lessonId: string;
  title?: string;
  description?: string;
  difficulty?: 'Cơ bản' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  sampleQuestions?: Lesson['sampleQuestions'];
}

export const getLessonOverrides = (): Record<string, LessonOverride> => {
  try {
    const raw = localStorage.getItem(LESSON_OVERRIDES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
};

export const saveLessonOverride = (override: LessonOverride): Record<string, LessonOverride> => {
  const current = getLessonOverrides();
  const next = {
    ...current,
    [override.lessonId]: {
      ...current[override.lessonId],
      ...override,
    },
  };
  localStorage.setItem(LESSON_OVERRIDES_KEY, JSON.stringify(next));
  return next;
};

export const applyLessonOverrides = (lessons: Lesson[]): Lesson[] => {
  const overrides = getLessonOverrides();
  return lessons.map((l) => {
    const ov = overrides[l.id];
    if (!ov) return l;
    return {
      ...l,
      title: ov.title ?? l.title,
      description: ov.description ?? l.description,
      difficulty: ov.difficulty ?? l.difficulty,
      sampleQuestions: ov.sampleQuestions ?? l.sampleQuestions,
    };
  });
};
