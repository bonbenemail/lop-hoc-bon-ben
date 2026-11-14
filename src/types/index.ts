export type GradeLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface Subject {
  id: string;
  name: string;
  iconName: string;
  color: string;
  grades: number[];
  lessonsCount: number;
  exercisesCount: number;
  description: string;
  badge?: string;
}

export interface Lesson {
  id: string;
  title: string;
  subjectId: string;
  grade: GradeLevel;
  duration: string;
  videoUrl?: string;
  difficulty: 'Cơ bản' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  completionRate: number;
  xpReward: number;
  diamonds: number;
  description: string;
  keyPoints: string[];
  sampleQuestions: QuizQuestion[];
  isTeacherCustom?: boolean;
  teacherEmail?: string;
  teacherName?: string;
  targetClassName?: string;
  targetSchool?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ArenaQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  grade: number;
}

export interface GiftItem {
  id: string;
  name: string;
  category: 'gau_bong' | 'hoc_tap' | 'thoi_trang' | 'cong_nghe' | 'hoc_bong';
  diamondsCost: number;
  image: string;
  stock: number;
  badge?: string;
  description: string;
}

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  school: string;
  province: string;
  grade: number;
  score: number;
  diamonds: number;
  arenaWins: number;
  avatar: string;
}

export interface SkillDiagnosis {
  category: string;
  mastery: number; // 0 - 100
  status: 'mastered' | 'improving' | 'gap';
  recommendedTopic: string;
  totalPracticed: number;
}

export interface ExerciseType {
  id: string;
  grade: GradeLevel;
  subject: string;
  name: string;
  description: string;
  difficulty: 'Cơ bản' | 'Nâng cao' | 'Vận dụng';
  totalQuestions: number;
  completedQuestions?: number;
  badge?: string;
  iconName: string;
}

export interface UserAccount {
  id: string;
  firebaseUid?: string;
  fullName: string;
  email: string;
  /** Tên tài khoản (username) dùng để đăng nhập, tối thiểu 8 ký tự, không trùng nhau. */
  username?: string;
  phone?: string;
  grade: GradeLevel;
  className?: string;
  school?: string;
  schoolLevel?: 'elementary' | 'lower-secondary' | 'upper-secondary';
  provinceOrCity?: string;
  district?: string;
  role: 'student' | 'teacher' | 'parent' | 'school' | 'admin';
  disabled?: boolean;
  /**
   * Đối với Học sinh:
   * - canPracticeAll = false (mặc định khi mới đăng ký): Chỉ được làm thử 3 bài ở dòng đầu, không được làm các bài ôn 4..20 và không được làm bài thi/kiểm tra.
   * - canPracticeAll = true (khi được Admin duyệt cho phép): Được làm toàn bộ mọi bài luyện, bài thi và kiểm tra.
   */
  canPracticeAll?: boolean;
  practiceApprovalStatus?: 'pending' | 'approved' | 'blocked';
  /**
   * Đối với Giáo viên:
   * - teacherApprovalStatus = 'pending' (mặc định khi mới đăng ký): Chờ Admin xét duyệt.
   * - teacherApprovalStatus = 'approved': Đã được Admin duyệt, có toàn quyền quản lý lớp học, duyệt học sinh vào lớp và tạo bài tập.
   */
  teacherApprovalStatus?: 'pending' | 'approved' | 'rejected';
  /**
   * Trạng thái vào lớp của Học sinh khi trùng Lớp & Trường với Giáo viên đã đăng ký:
   * - 'none': Chưa có giáo viên nào đăng ký trùng lớp & trường.
   * - 'pending': Trùng lớp & trường với giáo viên, đang đợi giáo viên cho vào lớp.
   * - 'approved': Đã được giáo viên duyệt cho vào lớp học.
   * - 'rejected': Giáo viên từ chối.
   */
  teacherClassStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  matchedTeacherEmail?: string;
  matchedTeacherName?: string;
  diamonds: number;
  level: number;
  studentCode: string;
  avatar?: string;
  selectedExerciseTypes?: string[];
  createdAt: string;
}

export type NotificationAudienceRole = 'student' | 'teacher' | 'school';
export type NotificationDisplayMode = 'prominent' | 'inbox';

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  displayMode: NotificationDisplayMode;
  recipientUid: string;
  recipientEmail: string;
  createdBy: string;
  createdAt: number;
  read: boolean;
}

export interface SupportTicket {
  id: string;
  senderName: string;
  senderEmail: string;
  /** Tên đăng nhập (username) của người gửi, hiển thị kèm trong hộp thư hỗ trợ. */
  senderUsername?: string;
  senderUid?: string;
  gradeInfo: string;
  schoolInfo: string;
  topic: string;
  issueContent: string;
  createdAt: number;
  handled: boolean;
  handledAt?: number;
  handledBy?: string;
}

/** Hồ sơ công khai lưu trong collection usernames, dùng để tra cứu & kết bạn. */
export interface UserDirectoryEntry {
  uid: string;
  email: string;
  username: string;
  fullName: string;
  role: UserAccount['role'];
  grade?: number;
  className?: string;
  school?: string;
  avatar?: string;
}

/** Thông tin rút gọn của một thành viên, lưu kèm để hiển thị mà không cần đọc hồ sơ người khác. */
export interface SocialMemberProfile {
  uid: string;
  username?: string;
  fullName: string;
  avatar?: string;
  role: UserAccount['role'];
  grade?: number;
  className?: string;
  school?: string;
}

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';

export interface FriendRequest {
  id: string;
  fromUid: string;
  toUid: string;
  /** [fromUid, toUid] — dùng cho quy tắc truy vấn theo thành viên. */
  members: string[];
  fromProfile: SocialMemberProfile;
  toProfile: SocialMemberProfile;
  status: FriendRequestStatus;
  createdAt: number;
  updatedAt: number;
}

export interface Friendship {
  id: string;
  members: string[];
  profiles: Record<string, SocialMemberProfile>;
  createdAt: number;
}

export interface Conversation {
  id: string;
  members: string[];
  profiles: Record<string, SocialMemberProfile>;
  lastMessage: string;
  lastMessageAt: number;
  lastSenderUid: string;
  /** Số tin nhắn chưa đọc theo uid. */
  unread: Record<string, number>;
  createdAt: number;
}

export interface DirectMessage {
  id: string;
  senderUid: string;
  senderName: string;
  text: string;
  members: string[];
  createdAt: number;
}

/** Quan hệ chặn giữa 2 người dùng (document id = khóa ghép cặp uid). */
export interface BlockedRelation {
  id: string;
  members: string[];
  /** Người đã bấm chặn. */
  blockerUid: string;
  /** Người bị chặn. */
  blockedUid: string;
  profiles: Record<string, SocialMemberProfile>;
  createdAt: number;
}

export interface FirebaseUserProfile {
  uid: string;
  email: string;
  /** Tên tài khoản (username) dùng để đăng nhập, tối thiểu 8 ký tự, không trùng nhau. */
  username?: string;
  fullName: string;
  displayName: string;
  role: UserAccount['role'];
  disabled?: boolean;
  grade: GradeLevel;
  phone?: string;
  avatar?: string;
  className?: string;
  school?: string;
  schoolLevel?: 'elementary' | 'lower-secondary' | 'upper-secondary';
  provinceOrCity?: string;
  district?: string;
  studentCode?: string;
  canPracticeAll?: boolean;
  practiceApprovalStatus?: 'pending' | 'approved' | 'blocked';
  teacherApprovalStatus?: 'pending' | 'approved' | 'rejected';
  teacherClassStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  matchedTeacherEmail?: string;
  matchedTeacherName?: string;
  diamonds?: number;
  level?: number;
  selectedExerciseTypes?: string[];
  createdAt: string;
}

export interface SchoolDirectoryEntry {
  id: string;
  schoolName: string;
  schoolLevel: 'elementary' | 'lower-secondary' | 'upper-secondary' | 'all';
  provinceOrCity: string;
  /** Current commune/ward/special-zone name; legacy records may still contain district names. */
  district: string;
  source?: 'openstreetmap';
  sourceId?: string;
}

export interface SiteConfig {
  topBannerText: string;
  heroBadgeText: string;
  heroTitleLine1: string;
  heroTitleHighlight: string;
  heroTitleLine2: string;
  heroDescription: string;
  footerDescription: string;
  supportContactEmailDisplay: string;
  trialLimitCount: number;
  heroImageUrl?: string;
  mascotImageUrl?: string;
}

export interface ExamTest {
  id: string;
  title: string;
  subject: string;
  grade: GradeLevel;
  durationMinutes: number;
  totalQuestions: number;
  description: string;
  questions: QuizQuestion[];
  badge?: string;
}

export interface DuelOpponent {
  id: string;
  name: string;
  school: string;
  province: string;
  avatar: string;
  level: number;
  winRate: number;
  rankTitle: string;
}

export interface StudentBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate?: string;
  category: 'arena' | 'streak' | 'accuracy' | 'study';
  unlocked: boolean;
}

export interface ArenaScheduleRound {
  id: string;
  title: string;
  subject: string;
  grade: GradeLevel;
  roundNumber: number;
  date: string;
  timeSlot: string;
  status: 'upcoming' | 'live' | 'completed';
  participantsCount: number;
  totalQuestions: number;
  durationMinutes: number;
}
