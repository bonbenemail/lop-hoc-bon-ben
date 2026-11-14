import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
  Pencil,
  Search,
  Globe,
  BookOpen,
  Save,
  RotateCcw,
  Sparkles,
  Check,
  Clock,
  Sliders,
  Building2,
  MapPin,
  Plus,
  Bell,
  Inbox,
  MessageSquare
} from 'lucide-react';
import {
  GradeLevel,
  Lesson,
  QuizQuestion,
  SchoolDirectoryEntry,
  SiteConfig,
  UserAccount,
} from '../types';
import {
  getSiteConfig,
  saveSiteConfig,
  resetSiteConfig,
  saveLessonOverride,
  applyLessonOverrides,
  formatSchoolName,
  getSchoolDirectory,
  saveSchoolDirectory,
  ADMIN_GMAIL_INTERNAL
} from '../services/schoolManager';
import {
  getVietnamese20LessonsByGrade,
  getMath20LessonsByGrade,
  getEnglish20LessonsByGrade
} from '../data/practiceLessonsData';
import { GRADE_EXERCISE_TYPES, HERO_IMAGE, MASCOT_IMAGE } from '../data/bonbenData';
import { VIETNAM_ADMIN_UNITS } from '../data/vietnamAdministrativeUnits';
import { AdminNotificationsPanel } from './AdminNotificationsPanel';
import { AdminSupportInbox } from './AdminSupportInbox';
import { AdminChatHistoryModal } from './AdminChatHistoryModal';
import {
  createManagedFirebaseProfile,
  firebaseProfileToUserAccount,
  deleteUserAccount,
  saveManagedFirebaseProfile,
  sendFirebaseUserPasswordReset,
  subscribeToFirebaseUsers,
} from '../services/firebaseNotifications';
import {
  isUsernameAvailable,
  isValidUsername,
  normalizeUsername,
  USERNAME_INVALID_MESSAGE,
} from '../services/usernames';

const isValidImageUrl = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;
  try {
    return new URL(trimmed).protocol === 'https:';
  } catch {
    return false;
  }
};

interface AdminPortalProps {
  onSiteConfigChange: (config: SiteConfig) => void;
  onAccountsChange: () => void;
  onSwitchToLivePageInspect?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onSiteConfigChange,
  onAccountsChange,
  onSwitchToLivePageInspect,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'pending-teachers'
    | 'pending-students'
    | 'all-accounts'
    | 'site-editor'
    | 'create-account'
    | 'school-directory'
    | 'notifications'
    | 'support-inbox'
  >('pending-students');

  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [historyAccount, setHistoryAccount] = useState<UserAccount | null>(null);
  const [schoolDirectory, setSchoolDirectoryState] = useState<SchoolDirectoryEntry[]>(() => getSchoolDirectory());
  const [directorySchoolName, setDirectorySchoolName] = useState('');
  const [directorySchoolLevel, setDirectorySchoolLevel] = useState<SchoolDirectoryEntry['schoolLevel']>('elementary');
  const [directoryProvince, setDirectoryProvince] = useState('');
  const [directoryDistrict, setDirectoryDistrict] = useState('');
  const [newAccountRole, setNewAccountRole] = useState<'student' | 'teacher' | 'school'>('school');
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountEmail, setNewAccountEmail] = useState('');
  const [newAccountUsername, setNewAccountUsername] = useState('');
  const [newAccountPassword, setNewAccountPassword] = useState('');
  const [newAccountGrade, setNewAccountGrade] = useState<GradeLevel>(4);
  const [newAccountClass, setNewAccountClass] = useState('4A1');
  const [newAccountProvince, setNewAccountProvince] = useState('');
  const [newAccountDistrict, setNewAccountDistrict] = useState('');
  const [newAccountSchoolId, setNewAccountSchoolId] = useState('');
  const [newAccountManualSchoolName, setNewAccountManualSchoolName] = useState('');
  const [isNewAccountManualSchool, setIsNewAccountManualSchool] = useState(false);
  const [newAccountManualSchoolLevel, setNewAccountManualSchoolLevel] =
    useState<Exclude<SchoolDirectoryEntry['schoolLevel'], 'all'>>('elementary');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<
    'all' | 'student' | 'teacher' | 'school' | 'admin'
  >('all');
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);
  const [isBannerError, setIsBannerError] = useState(false);
  const [isCreatingManagedAccount, setIsCreatingManagedAccount] = useState(false);

  const newAccountSchools = schoolDirectory.filter(
    (school) =>
      school.provinceOrCity === newAccountProvince &&
      school.district === newAccountDistrict &&
      (newAccountRole === 'school' ||
        school.schoolLevel === 'all' ||
        school.schoolLevel === (
          newAccountGrade <= 5
            ? 'elementary'
            : newAccountGrade <= 9
              ? 'lower-secondary'
              : 'upper-secondary'
        ))
  );
  const newAccountManualSchoolMode =
    Boolean(newAccountDistrict) &&
    (isNewAccountManualSchool || newAccountSchools.length === 0);

  // State sửa hồ sơ tài khoản
  const [editingInfoEmail, setEditingInfoEmail] = useState<string | null>(null);
  const [editGrade, setEditGrade] = useState<GradeLevel>(4);
  const [editClass, setEditClass] = useState('');
  const [editSchoolId, setEditSchoolId] = useState('');
  const [editSchoolLevel, setEditSchoolLevel] = useState<SchoolDirectoryEntry['schoolLevel']>('elementary');
  const [editProvince, setEditProvince] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editRole, setEditRole] = useState<'student' | 'teacher' | 'school'>('student');
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editDiamonds, setEditDiamonds] = useState('0');
  const [editLevel, setEditLevel] = useState('1');
  const [editStudentCode, setEditStudentCode] = useState('');

  // State sửa trực tiếp trang web
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => getSiteConfig());
  const [editorGrade, setEditorGrade] = useState<GradeLevel>(4);
  const [editorSubject, setEditorSubject] = useState<'tieng-viet' | 'toan' | 'tieng-anh'>('toan');
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [editLessonDesc, setEditLessonDesc] = useState('');
  const [editLessonDiff, setEditLessonDiff] = useState<'Cơ bản' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao'>('Cơ bản');
  const [editLessonQuestions, setEditLessonQuestions] = useState<QuizQuestion[]>([]);

  const notify = (msg: string, isError = false) => {
    setIsBannerError(isError);
    setBannerMsg(msg);
    setTimeout(() => setBannerMsg(null), 4000);
  };

  useEffect(() => {
    return subscribeToFirebaseUsers(
      (users) => setAccounts(users.map(firebaseProfileToUserAccount)),
      (error) => {
        console.error('FIREBASE_ADMIN_ACCOUNT_LIST_ERROR:', error);
        notify(`⚠️ Không tải được danh sách tài khoản Firebase: ${error.message}`, true);
      }
    );
  }, []);

  // Phân loại Giáo viên & Học sinh rõ ràng
  const allTeachers = accounts.filter((a) => a.role === 'teacher');
  const pendingTeachers = allTeachers.filter((t) => t.teacherApprovalStatus !== 'approved');
  const approvedTeachers = allTeachers.filter((t) => t.teacherApprovalStatus === 'approved');

  const allStudents = accounts.filter((a) => a.role === 'student');
  const restrictedStudents = allStudents.filter((s) => s.canPracticeAll !== true);
  const allowedStudents = allStudents.filter((s) => s.canPracticeAll === true);

  // Xử lý duyệt Giáo viên
  const handleTeacherDecision = async (email: string, status: 'approved' | 'pending' | 'rejected') => {
    const target = accounts.find((account) => account.email.toLowerCase() === email.toLowerCase());
    if (!target || target.role !== 'teacher') {
      notify('⚠️ Không tìm thấy tài khoản Giáo viên cần cập nhật.', true);
      return;
    }
    const next = accounts.map((account) =>
      account.email.toLowerCase() === email.toLowerCase()
        ? { ...account, teacherApprovalStatus: status }
        : account
    );
    try {
      await saveManagedFirebaseProfile(
        next.find((account) => account.email.toLowerCase() === email.toLowerCase())!
      );
    } catch (error: unknown) {
      console.error('FIREBASE_ADMIN_PROFILE_SYNC_ERROR:', error);
      notify(
        `⚠️ Không thể đồng bộ trạng thái duyệt lên Firebase: ${
          error instanceof Error ? error.message : 'Vui lòng thử lại.'
        }`,
        true
      );
      return;
    }
    setAccounts(next);
    onAccountsChange();
    notify(
      status === 'approved'
        ? '✅ Đã xét duyệt tài khoản Giáo viên thành công!'
        : 'Đã cập nhật trạng thái tài khoản Giáo viên.'
    );
  };

  const handleApproveAllPendingTeachers = async () => {
    const updated = accounts.map((acc): UserAccount =>
      acc.role === 'teacher' ? { ...acc, teacherApprovalStatus: 'approved' as const } : acc
    );
    const profiles = updated.filter((account) => account.role === 'teacher' && account.firebaseUid);
    try {
      await Promise.all(profiles.map(saveManagedFirebaseProfile));
    } catch (error: unknown) {
      console.error('FIREBASE_ADMIN_PROFILE_SYNC_ERROR:', error);
      notify('⚠️ Không thể đồng bộ trạng thái duyệt giáo viên lên Firebase. Hãy thử lại.', true);
      return;
    }
    setAccounts(updated);
    onAccountsChange();
    notify('✅ Đã duyệt toàn bộ tài khoản Giáo viên đang chờ!');
  };

  // Xử lý cho phép / không cho phép Học sinh làm bài
  const handleStudentPermission = async (email: string, allowAll: boolean) => {
    const target = accounts.find((account) => account.email.toLowerCase() === email.toLowerCase());
    if (!target || target.role !== 'student') {
      notify('⚠️ Không tìm thấy tài khoản Học sinh cần cập nhật.', true);
      return;
    }
    const next = accounts.map((account) =>
      account.email.toLowerCase() === email.toLowerCase()
        ? {
            ...account,
            canPracticeAll: allowAll,
            practiceApprovalStatus: allowAll ? 'approved' as const : 'blocked' as const,
          }
        : account
    );
    try {
      await saveManagedFirebaseProfile(
        next.find((account) => account.email.toLowerCase() === email.toLowerCase())!
      );
    } catch (error: unknown) {
      console.error('FIREBASE_ADMIN_PROFILE_SYNC_ERROR:', error);
      notify(
        `⚠️ Không thể đồng bộ quyền học sinh lên Firebase: ${
          error instanceof Error ? error.message : 'Vui lòng thử lại.'
        }`,
        true
      );
      return;
    }
    setAccounts(next);
    onAccountsChange();
    notify(
      allowAll
        ? '✅ Đã CHO PHÉP học sinh làm toàn bộ mọi bài luyện, bài thi & kiểm tra!'
        : '🔒 Đã chuyển học sinh sang trạng thái KHÔNG CHO PHÉP (Chỉ được làm thử 3 bài đầu tiên).'
    );
  };

  const handleApproveAllPendingStudents = async () => {
    const updated = accounts.map((acc) =>
      acc.role === 'student'
        ? { ...acc, canPracticeAll: true, practiceApprovalStatus: 'approved' as const }
        : acc
    );
    const profiles = updated.filter((account) => account.role === 'student' && account.firebaseUid);
    try {
      await Promise.all(profiles.map(saveManagedFirebaseProfile));
    } catch (error: unknown) {
      console.error('FIREBASE_ADMIN_PROFILE_SYNC_ERROR:', error);
      notify('⚠️ Không thể đồng bộ trạng thái duyệt học sinh lên Firebase. Hãy thử lại.', true);
      return;
    }
    setAccounts(updated);
    onAccountsChange();
    notify('✅ Đã cho phép toàn bộ học sinh làm tất cả bài luyện và bài thi!');
  };

  const handleSendPasswordReset = async (targetEmail: string) => {
    try {
      await sendFirebaseUserPasswordReset(targetEmail);
      notify(`✅ Đã gửi liên kết đặt lại mật khẩu tới ${targetEmail}.`);
    } catch (error: unknown) {
      console.error('FIREBASE_PASSWORD_RESET_ERROR:', error);
      notify(
        `⚠️ Không thể gửi liên kết đặt lại mật khẩu: ${
          error instanceof Error ? error.message : 'Vui lòng thử lại.'
        }`,
        true
      );
    }
  };

  // Sửa Lớp & Trường
  const handleSaveAccountInfo = async (targetEmail: string) => {
    const targetAccount = accounts.find(
      (acc) => acc.email.toLowerCase() === targetEmail.toLowerCase()
    );
    if (!targetAccount) {
      notify('⚠️ Không tìm thấy tài khoản cần cập nhật. Hãy tải lại danh sách.');
      return;
    }
    const selectedSchool = schoolDirectory.find((entry) => entry.id === editSchoolId);
    const diamonds = Number(editDiamonds);
    const level = Number(editLevel);
    if (!editFullName.trim() || (!editClass.trim() && editRole !== 'school') || !selectedSchool) {
      notify('⚠️ Vui lòng nhập họ tên, lớp phù hợp và chọn trường trong danh mục Admin cấp.');
      return;
    }
    if (!Number.isInteger(diamonds) || diamonds < 0 || !Number.isInteger(level) || level < 1) {
      notify('⚠️ Kim cương phải từ 0 và cấp độ phải là số nguyên từ 1 trở lên.');
      return;
    }
    if (!isValidImageUrl(editAvatar)) {
      notify('⚠️ Ảnh đại diện cần là URL HTTPS hoặc đường dẫn bắt đầu bằng dấu /.');
      return;
    }
    const updated = accounts.map((acc): UserAccount =>
      acc.email.toLowerCase() === targetEmail.toLowerCase()
        ? {
            ...acc,
            role: editRole,
            fullName: editFullName.trim(),
            phone: editPhone.trim() || undefined,
            avatar: editAvatar.trim() || undefined,
            grade: editGrade,
            className: editClass.trim().toUpperCase(),
            school: selectedSchool.schoolName,
            schoolLevel: selectedSchool.schoolLevel === 'all'
              ? editGrade <= 5
                ? 'elementary'
                : editGrade <= 9
                  ? 'lower-secondary'
                  : 'upper-secondary'
              : selectedSchool.schoolLevel,
            provinceOrCity: selectedSchool.provinceOrCity,
            district: selectedSchool.district,
            diamonds,
            level,
            studentCode: editStudentCode.trim() || acc.studentCode,
            canPracticeAll:
              editRole === 'student'
                ? acc.role === 'student' && acc.canPracticeAll === true
                : true,
            practiceApprovalStatus:
              editRole === 'student'
                ? acc.role === 'student' && acc.canPracticeAll === true
                  ? 'approved'
                  : 'pending'
                : 'approved',
            teacherApprovalStatus:
              editRole === 'teacher'
                ? acc.role === 'teacher'
                  ? acc.teacherApprovalStatus || 'pending'
                  : 'pending'
                : undefined,
            teacherClassStatus: editRole === 'student' ? acc.teacherClassStatus || 'none' : 'none',
            matchedTeacherEmail: editRole === 'student' ? acc.matchedTeacherEmail : undefined,
            matchedTeacherName: editRole === 'student' ? acc.matchedTeacherName : undefined,
          }
        : acc
    );
    try {
      await saveManagedFirebaseProfile(
        updated.find((account) => account.email.toLowerCase() === targetEmail.toLowerCase())!
      );
    } catch (error: unknown) {
      console.error('FIREBASE_ADMIN_PROFILE_SYNC_ERROR:', error);
      notify(
        `⚠️ Không thể cập nhật hồ sơ trên Firebase: ${
          error instanceof Error ? error.message : 'Vui lòng thử lại.'
        }`,
        true
      );
      return;
    }
    setAccounts(updated);
    setEditingInfoEmail(null);
    onAccountsChange();
    notify('✅ Đã cập nhật hồ sơ và thông tin trường cho tài khoản!');
  };

  const handleAddSchoolDirectoryEntry = (event: React.FormEvent) => {
    event.preventDefault();
    const schoolName = directorySchoolName.trim();
    const provinceOrCity = directoryProvince.trim();
    const district = directoryDistrict.trim();
    const province = VIETNAM_ADMIN_UNITS.find((entry) => entry.name === provinceOrCity);
    if (!schoolName || !province || !province.wards.some((ward) => ward.name === district)) {
      notify('⚠️ Chọn tỉnh/thành, phường/xã hợp lệ và nhập tên trường.');
      return;
    }

    const duplicate = schoolDirectory.some(
      (entry) =>
        entry.schoolName.toLocaleLowerCase() === schoolName.toLocaleLowerCase() &&
        entry.provinceOrCity.toLocaleLowerCase() === provinceOrCity.toLocaleLowerCase() &&
        entry.district.toLocaleLowerCase() === district.toLocaleLowerCase() &&
        entry.schoolLevel === directorySchoolLevel
    );
    if (duplicate) {
      notify('⚠️ Trường này đã có trong danh mục.');
      return;
    }

    const next = [
      ...schoolDirectory,
      {
        id: `school-${Date.now()}`,
        schoolName,
        schoolLevel: directorySchoolLevel,
        provinceOrCity,
        district,
      },
    ];
    saveSchoolDirectory(next);
    setSchoolDirectoryState(next);
    setDirectorySchoolName('');
    notify('✅ Đã thêm trường vào danh mục lựa chọn.');
  };

  const handleDeleteSchoolDirectoryEntry = (entryId: string) => {
    const target = schoolDirectory.find((entry) => entry.id === entryId);
    if (!target) {
      notify('⚠️ Không tìm thấy trường trong danh mục.');
      return;
    }
    if (target.source === 'openstreetmap') {
      notify('⚠️ Trường lấy từ OpenStreetMap; không thể xóa khỏi dữ liệu nền.');
      return;
    }
    const linkedAccounts = accounts.filter(
      (account) =>
        account.school === target.schoolName &&
        account.schoolLevel === target.schoolLevel &&
        account.provinceOrCity === target.provinceOrCity &&
        account.district === target.district
    );
    if (linkedAccounts.length > 0) {
      notify(`⚠️ Trường đang được dùng bởi ${linkedAccounts.length} tài khoản. Hãy chuyển các tài khoản đó sang trường khác trước khi xóa.`);
      return;
    }
    const next = schoolDirectory.filter((entry) => entry.id !== entryId);
    saveSchoolDirectory(next);
    setSchoolDirectoryState(next);
    notify('Đã xóa trường khỏi danh mục lựa chọn.');
  };

  const handleCreateManagedAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    const email = newAccountEmail.trim().toLowerCase();
    if (
      !newAccountName.trim() ||
      !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email) ||
      (newAccountRole !== 'school' && !newAccountClass.trim())
    ) {
      notify('⚠️ Nhập họ tên, Gmail hợp lệ và khối/lớp nếu tạo tài khoản học sinh hoặc giáo viên.', true);
      return;
    }
    if (email === ADMIN_GMAIL_INTERNAL) {
      notify('⚠️ Email Admin được dành riêng cho tài khoản Firebase, không thể tạo tài khoản cục bộ.', true);
      return;
    }
    if (newAccountPassword.length <= 6) {
      notify('⚠️ Mật khẩu phải có ít nhất 7 ký tự.', true);
      return;
    }
    if (accounts.some((account) => account.email.toLowerCase() === email)) {
      notify('⚠️ Gmail này đã có tài khoản.', true);
      return;
    }

    const username = normalizeUsername(newAccountUsername);
    if (!isValidUsername(username)) {
      notify(`⚠️ ${USERNAME_INVALID_MESSAGE}`, true);
      return;
    }
    try {
      if (!(await isUsernameAvailable(username))) {
        notify('⚠️ Tên tài khoản này đã được sử dụng. Vui lòng chọn tên khác.', true);
        return;
      }
    } catch (error) {
      console.error('ADMIN_USERNAME_AVAILABILITY_CHECK_ERROR:', error);
    }

    const province = VIETNAM_ADMIN_UNITS.find((entry) => entry.name === newAccountProvince);
    if (!province || !province.wards.some((ward) => ward.name === newAccountDistrict)) {
      notify('⚠️ Hãy chọn tỉnh/thành và phường/xã hợp lệ.', true);
      return;
    }
    const school = newAccountManualSchoolMode
      ? undefined
      : newAccountSchools.find((entry) => entry.id === newAccountSchoolId);
    const schoolName = newAccountManualSchoolMode
      ? formatSchoolName(newAccountManualSchoolName)
      : school?.schoolName;
    if (!schoolName || (!newAccountManualSchoolMode && !school)) {
      notify(
        newAccountManualSchoolMode
          ? '⚠️ Nhập tên trường cần tạo tài khoản.'
          : '⚠️ Hãy chọn trường trong danh mục hoặc chuyển sang nhập tên thủ công.',
        true
      );
      return;
    }

    const gradeSchoolLevel: SchoolDirectoryEntry['schoolLevel'] =
      newAccountGrade <= 5
        ? 'elementary'
        : newAccountGrade <= 9
          ? 'lower-secondary'
          : 'upper-secondary';
    const schoolLevel = newAccountManualSchoolMode
      ? newAccountRole === 'school'
        ? newAccountManualSchoolLevel
        : gradeSchoolLevel
      : school && school.schoolLevel !== 'all'
        ? school.schoolLevel
        : gradeSchoolLevel;

    const account: UserAccount = {
      id: `user-${Date.now()}`,
      fullName: newAccountName.trim(),
      email,
      username,
      grade: newAccountGrade,
      className: newAccountRole === 'school' ? '' : newAccountClass.trim().toUpperCase(),
      school: schoolName,
      schoolLevel,
      provinceOrCity: newAccountProvince,
      district: newAccountDistrict,
      role: newAccountRole,
      canPracticeAll: true,
      practiceApprovalStatus: 'approved',
      teacherApprovalStatus: newAccountRole === 'teacher' ? 'approved' : undefined,
      teacherClassStatus: 'none',
      diamonds: 0,
      level: 1,
      studentCode: `${newAccountRole === 'school' ? 'TRUONG' : newAccountRole === 'teacher' ? 'GV' : 'HS'}-${newAccountRole === 'school' ? 'TK' : newAccountClass.trim().toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      selectedExerciseTypes: (
        GRADE_EXERCISE_TYPES[newAccountGrade] || GRADE_EXERCISE_TYPES[4]
      ).map((exerciseType) => exerciseType.id),
      createdAt: new Date().toISOString(),
    };

    setIsCreatingManagedAccount(true);
    try {
      const firebaseUid = await createManagedFirebaseProfile(account, newAccountPassword);
      const managedAccount = { ...account, id: firebaseUid, firebaseUid };
      setAccounts((previous) =>
        previous.some((entry) => entry.firebaseUid === firebaseUid)
          ? previous
          : [...previous, managedAccount]
      );
      onAccountsChange();
      setNewAccountName('');
      setNewAccountEmail('');
      setNewAccountUsername('');
      setNewAccountPassword('');
      setNewAccountProvince('');
      setNewAccountDistrict('');
      setNewAccountSchoolId('');
      setNewAccountManualSchoolName('');
      setIsNewAccountManualSchool(false);
      notify(`✅ Đã tạo tài khoản ${newAccountRole === 'school' ? 'nhà trường' : newAccountRole === 'teacher' ? 'giáo viên' : 'học sinh'} trong Firebase. Người dùng có thể đăng nhập ngay.`);
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'code' in error &&
        String(error.code) === 'auth/email-already-in-use'
          ? 'Gmail này đã tồn tại trong Firebase Authentication.'
          : error instanceof Error && error.message === 'USERNAME_TAKEN'
            ? 'Tên tài khoản này đã được sử dụng. Vui lòng chọn tên khác.'
            : error instanceof Error
              ? error.message
              : 'Không tạo được tài khoản Firebase.';
      notify(`⚠️ Không tạo được tài khoản: ${message}`, true);
    } finally {
      setIsCreatingManagedAccount(false);
    }
  };

  // Xóa tài khoản: xóa dữ liệu Firebase ngay khi bấm
  const handleDeleteAccount = async (targetEmail: string) => {
    const account = accounts.find(
      (acc) => acc.email.toLowerCase() === targetEmail.toLowerCase()
    );
    if (!account?.firebaseUid) {
      notify('⚠️ Không tìm thấy Firebase UID của tài khoản.', true);
      return;
    }
    try {
      const mode = await deleteUserAccount(account.firebaseUid, account.email);
      notify(
        mode === 'server'
          ? `✅ Đã xóa tận gốc tài khoản ${account.fullName} (${account.email}) khỏi Firebase Authentication và Firestore.`
          : `✅ Đã xóa tài khoản ${account.fullName} (${account.email}) và dữ liệu liên quan trên Firestore. Máy chủ xóa Authentication chưa được triển khai.`
      );
    } catch (error: unknown) {
      console.error('FIREBASE_ADMIN_ACCOUNT_DELETE_ERROR:', error);
      notify(
        `⚠️ Không thể xóa tài khoản: ${
          error instanceof Error ? error.message : 'Vui lòng thử lại.'
        }`,
        true
      );
    }
  };

  // Lưu chỉnh sửa trực tiếp giao diện trang web
  const handleSaveSiteConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidImageUrl(siteConfig.heroImageUrl || '') || !isValidImageUrl(siteConfig.mascotImageUrl || '')) {
      notify('⚠️ Ảnh cần dùng URL HTTPS hoặc đường dẫn bắt đầu bằng dấu /.');
      return;
    }
    const saved = saveSiteConfig(siteConfig);
    onSiteConfigChange(saved);
    notify('✅ Đã lưu nội dung trang web trên trình duyệt này!');
  };

  const handleResetSiteConfig = () => {
    const def = resetSiteConfig();
    setSiteConfig(def);
    onSiteConfigChange(def);
    notify('🔄 Đã khôi phục nội dung trang web về mặc định!');
  };

  // Danh sách bài luyện để Admin sửa trực tiếp
  const rawLessonsForEditor: Lesson[] =
    editorSubject === 'tieng-viet'
      ? getVietnamese20LessonsByGrade(editorGrade)
      : editorSubject === 'toan'
        ? getMath20LessonsByGrade(editorGrade)
        : getEnglish20LessonsByGrade(editorGrade);
  const lessonsForEditor = applyLessonOverrides(rawLessonsForEditor);

  const handleSaveLessonDirectEdit = (lessonId: string) => {
    if (!editLessonTitle.trim()) {
      notify('⚠️ Tên bài luyện không được để trống.');
      return;
    }
    const invalidQuestionIndex = editLessonQuestions.findIndex(
      (question) =>
        !question.question.trim() ||
        question.options.length !== 4 ||
        question.options.some((option) => !option.trim()) ||
        !Number.isInteger(question.correctIndex) ||
        question.correctIndex < 0 ||
        question.correctIndex >= question.options.length ||
        !Number.isFinite(question.points) ||
        question.points <= 0
    );
    if (invalidQuestionIndex >= 0) {
      notify(`⚠️ Câu ${invalidQuestionIndex + 1} cần có nội dung, đủ 4 lựa chọn và đáp án đúng hợp lệ.`);
      return;
    }
    saveLessonOverride({
      lessonId,
      title: editLessonTitle.trim(),
      description: editLessonDesc.trim(),
      difficulty: editLessonDiff,
      sampleQuestions: editLessonQuestions,
    });
    setEditingLessonId(null);
    onAccountsChange();
    notify('✅ Đã lưu bài luyện và ngân hàng câu hỏi trên trình duyệt này!');
  };

  const filteredAccounts = accounts.filter((acc) => {
    const matchRole = roleFilter === 'all' || acc.role === roleFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      acc.fullName.toLowerCase().includes(q) ||
      acc.email.toLowerCase().includes(q) ||
      (acc.className || '').toLowerCase().includes(q) ||
      (acc.school || '').toLowerCase().includes(q);
    return matchRole && matchSearch;
  });
  const schoolLevelLabel = (level?: SchoolDirectoryEntry['schoolLevel']) =>
    level === 'elementary'
      ? 'Tiểu học'
      : level === 'lower-secondary'
        ? 'THCS'
        : level === 'upper-secondary'
          ? 'THPT'
          : 'Chưa rõ cấp';

  return (
    <section className="py-8 sm:py-10 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
      {/* Top Admin Command Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-sky-800/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>TÀI KHOẢN QUẢN TRỊ VIÊN CHUYÊN BIỆT (ADMIN)</span>
              </span>
              <span className="bg-white/10 text-sky-200 text-xs font-bold px-3 py-0.5 rounded-full">
                Toàn quyền Quản lý Tài khoản & Sửa trực tiếp Trang web
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Trung Tâm Điều Hành & Quản Trị Hệ Thống Lớp Học Bon Ben
            </h1>
            <p className="text-xs sm:text-sm text-sky-200 max-w-2xl leading-relaxed">
              Tài khoản Admin chuyên biệt dùng để xét duyệt Giáo viên, cấp/khóa quyền làm bài luyện & bài thi của Học sinh, quản lý toàn bộ tài khoản và chỉnh sửa trực tiếp nội dung trang web.
            </p>
            <p className="text-[11px] text-amber-200 max-w-2xl">
              Danh sách tài khoản được đồng bộ trực tiếp từ Firebase; nội dung trang và danh mục trường vẫn được lưu trong trình duyệt này.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onSwitchToLivePageInspect && (
              <button
                type="button"
                onClick={onSwitchToLivePageInspect}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Globe className="w-4 h-4" />
                <span>Xem giao diện các trang web</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div
            onClick={() => setActiveTab('pending-students')}
            className="bg-white/10 hover:bg-white/15 p-3.5 rounded-2xl border border-white/15 cursor-pointer transition-colors"
          >
            <div className="text-[11px] text-amber-300 font-bold uppercase">
              HS Chờ duyệt cho phép làm bài
            </div>
            <div className="text-2xl font-black text-white mt-0.5">{restrictedStudents.length} học sinh</div>
            <div className="text-[11px] text-sky-200 mt-0.5">
              Đang khóa (Chỉ mở 3 bài đầu làm thử)
            </div>
          </div>

          <div
            onClick={() => setActiveTab('pending-teachers')}
            className="bg-white/10 hover:bg-white/15 p-3.5 rounded-2xl border border-white/15 cursor-pointer transition-colors"
          >
            <div className="text-[11px] text-sky-300 font-bold uppercase">
              GV Chờ Admin xét duyệt
            </div>
            <div className="text-2xl font-black text-white mt-0.5">{pendingTeachers.length} giáo viên</div>
            <div className="text-[11px] text-sky-200 mt-0.5">
              Đã duyệt: {approvedTeachers.length} giáo viên
            </div>
          </div>

          <div
            onClick={() => setActiveTab('pending-students')}
            className="bg-white/10 hover:bg-white/15 p-3.5 rounded-2xl border border-white/15 cursor-pointer transition-colors"
          >
            <div className="text-[11px] text-emerald-300 font-bold uppercase">
              HS Đã được cho phép làm bài
            </div>
            <div className="text-2xl font-black text-white mt-0.5">{allowedStudents.length} học sinh</div>
            <div className="text-[11px] text-sky-200 mt-0.5">
              Được làm trọn bộ 20 bài/môn & Đề thi
            </div>
          </div>

          <div
            onClick={() => setActiveTab('site-editor')}
            className="bg-white/10 hover:bg-white/15 p-3.5 rounded-2xl border border-white/15 cursor-pointer transition-colors"
          >
            <div className="text-[11px] text-purple-300 font-bold uppercase">
              Trình sửa trực tiếp Web
            </div>
            <div className="text-lg font-black text-white mt-1">Chỉnh sửa tức thì</div>
            <div className="text-[11px] text-sky-200 mt-0.5">
              Sửa trang chủ, thông báo & 60 bài luyện
            </div>
          </div>
        </div>
      </div>

      {bannerMsg && (
        <div
          role={isBannerError ? 'alert' : 'status'}
          aria-live="polite"
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in ${
            isBannerError
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {isBannerError ? (
            <XCircle className="w-4 h-4 text-red-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{bannerMsg}</span>
        </div>
      )}

      {/* 4 Main Separated Admin Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 bg-white p-2.5 rounded-3xl border border-sky-100 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('pending-students')}
          className={`p-3 rounded-2xl text-xs font-extrabold flex items-center justify-between gap-2 transition-all cursor-pointer ${
            activeTab === 'pending-students'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-700 hover:bg-sky-50'
          }`}
        >
          <div className="flex items-center gap-2 text-left">
            <Lock className="w-4 h-4 shrink-0" />
            <span>1. Duyệt Cho Phép HS Làm Bài</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
              activeTab === 'pending-students'
                ? 'bg-amber-300 text-slate-950'
                : 'bg-amber-100 text-amber-900'
            }`}
          >
            {restrictedStudents.length} chờ
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending-teachers')}
          className={`p-3 rounded-2xl text-xs font-extrabold flex items-center justify-between gap-2 transition-all cursor-pointer ${
            activeTab === 'pending-teachers'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-700 hover:bg-sky-50'
          }`}
        >
          <div className="flex items-center gap-2 text-left">
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span>2. Chờ Duyệt TK Giáo Viên</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
              activeTab === 'pending-teachers'
                ? 'bg-amber-300 text-slate-950'
                : 'bg-amber-100 text-amber-900'
            }`}
          >
            {pendingTeachers.length} chờ
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all-accounts')}
          className={`p-3 rounded-2xl text-xs font-extrabold flex items-center justify-between gap-2 transition-all cursor-pointer ${
            activeTab === 'all-accounts'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-700 hover:bg-sky-50'
          }`}
        >
          <div className="flex items-center gap-2 text-left">
            <Users className="w-4 h-4 shrink-0" />
            <span>3. Quản Lý Toàn Bộ Tài Khoản</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
              activeTab === 'all-accounts'
                ? 'bg-white/20 text-white'
                : 'bg-slate-200 text-slate-800'
            }`}
          >
            {accounts.length} TK
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('create-account')}
          className={`p-3 rounded-2xl text-xs font-extrabold flex items-center justify-between gap-2 transition-all cursor-pointer ${
            activeTab === 'create-account'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-700 hover:bg-sky-50'
          }`}
        >
          <div className="flex items-center gap-2 text-left">
            <Plus className="w-4 h-4 shrink-0" />
            <span>4. Tạo tài khoản quản lý</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900">
            Admin
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('school-directory')}
          className={`p-3 rounded-2xl text-xs font-extrabold flex items-center justify-between gap-2 transition-all cursor-pointer ${
            activeTab === 'school-directory'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-700 hover:bg-sky-50'
          }`}
        >
          <div className="flex items-center gap-2 text-left">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>5. Danh mục trường/khu vực</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-100 text-sky-800">
            {schoolDirectory.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`p-3 rounded-2xl text-xs font-extrabold flex items-center justify-between gap-2 transition-all cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-700 hover:bg-sky-50'
          }`}
        >
          <div className="flex items-center gap-2 text-left">
            <Bell className="w-4 h-4 shrink-0" />
            <span>6. Thông báo & Hộp thư</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900">
            Firebase
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('support-inbox')}
          className={`p-3 rounded-2xl text-xs font-extrabold flex items-center justify-between gap-2 transition-all cursor-pointer ${
            activeTab === 'support-inbox'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-700 hover:bg-sky-50'
          }`}
        >
          <div className="flex items-center gap-2 text-left">
            <Inbox className="w-4 h-4 shrink-0" />
            <span>7. Hộp thư hỗ trợ</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900">
            Firebase
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('site-editor')}
          className={`p-3 rounded-2xl text-xs font-extrabold flex items-center justify-between gap-2 transition-all cursor-pointer ${
            activeTab === 'site-editor'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-700 hover:bg-sky-50'
          }`}
        >
          <div className="flex items-center gap-2 text-left">
            <Sliders className="w-4 h-4 shrink-0" />
            <span>8. Sửa Trực Tiếp Trang Web</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'site-editor'
                ? 'bg-white/20 text-white'
                : 'bg-sky-100 text-sky-800'
            }`}
          >
            Live
          </span>
        </button>
      </div>

      {/* ==================== TAB 1: CHỜ DUYỆT CHO PHÉP HỌC SINH LÀM BÀI (TÁCH RIÊNG) ==================== */}
      {activeTab === 'pending-students' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Phần 1A: Học sinh đang chờ duyệt / Không được phép làm bài (chỉ làm thử 3 bài đầu) */}
          <div className="bg-white rounded-3xl border-2 border-amber-300 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-900 text-[11px] font-black px-2.5 py-0.5 rounded-md">
                    MẶC ĐỊNH KHI ĐĂNG KÝ MỚI
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                  Học sinh đang Chờ duyệt / Không cho phép làm bài ({restrictedStudents.length} tài khoản)
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Các học sinh trong danh sách này hiện <strong>chỉ được làm thử 3 bài ở dòng đầu (Bài 1, 2, 3)</strong> và <strong>không được làm các bài ôn từ Bài 4–20 hay Bài thi/Kiểm tra</strong>. Nhấn <strong>"Cho phép làm bài"</strong> để mở khóa toàn bộ cho học sinh.
                </p>
              </div>

              {restrictedStudents.length > 0 && (
                <button
                  type="button"
                  onClick={handleApproveAllPendingStudents}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cho phép tất cả ({restrictedStudents.length} HS)</span>
                </button>
              )}
            </div>

            {restrictedStudents.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                Hiện không có học sinh nào đang chờ duyệt quyền làm bài.
              </div>
            ) : (
              <div className="space-y-3">
                {restrictedStudents.map((st) => (
                  <div
                    key={st.email}
                    className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm sm:text-base text-slate-900">
                          {st.fullName}
                        </span>
                        <span className="bg-amber-200/80 text-amber-950 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                          🔒 Đang giới hạn (Chỉ làm thử 3 bài đầu)
                        </span>
                        <span className="bg-sky-100 text-sky-900 text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                          Lớp {st.className || `${st.grade}A1`} (Khối {st.grade})
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 flex flex-wrap gap-3">
                        <span>Gmail: <strong>{st.email}</strong></span>
                        <span>·</span>
                        <span>🏫 Trường: <strong>{st.school || 'Chưa cập nhật'}</strong></span>
                        {st.matchedTeacherName && (
                          <>
                            <span>·</span>
                            <span className="text-sky-800 font-semibold">
                              GV Lớp: {st.matchedTeacherName} (
                              {st.teacherClassStatus === 'approved'
                                ? 'Đã vào lớp GV'
                                : 'Đang đợi GV cho vào lớp'}
                              )
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStudentPermission(st.email, true)}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Cho phép làm mọi bài luyện & bài thi</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Phần 1B: Học sinh ĐÃ ĐƯỢC CHO PHÉP làm toàn bộ bài luyện & bài thi */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  Học sinh Đã được Admin cho phép làm mọi bài luyện & bài thi ({allowedStudents.length} học sinh)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bạn có thể bấm "Không cho phép" bất kỳ lúc nào để khóa lại (chỉ cho làm thử 3 bài đầu).
                </p>
              </div>
            </div>

            {allowedStudents.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                Chưa có học sinh nào được cấp quyền làm toàn bộ bài luyện.
              </div>
            ) : (
              <div className="space-y-2.5">
                {allowedStudents.map((st) => (
                  <div
                    key={st.email}
                    className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-slate-900">{st.fullName}</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                          ✓ Đã cho phép làm toàn bộ bài luyện & đề thi
                        </span>
                        <span className="text-xs font-bold text-sky-800">
                          Lớp {st.className || `${st.grade}A1`} · {st.school}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Gmail: {st.email}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStudentPermission(st.email, false)}
                      className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Không cho phép (Khóa về 3 bài đầu)</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: CHỜ DUYỆT TÀI KHOẢN GIÁO VIÊN (TÁCH RIÊNG) ==================== */}
      {activeTab === 'pending-teachers' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Phần 2A: Giáo viên đang chờ Admin xét duyệt */}
          <div className="bg-white rounded-3xl border-2 border-sky-300 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="bg-sky-100 text-sky-900 text-[11px] font-black px-2.5 py-0.5 rounded-md">
                  XÉT DUYỆT GIÁO VIÊN ĐĂNG KÝ MỚI
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                  Tài khoản Giáo viên đang chờ Admin xét duyệt ({pendingTeachers.length} giáo viên)
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Khi Admin bấm <strong>"Duyệt Giáo Viên"</strong>, giáo viên đó sẽ được kích hoạt quyền quản lý Lớp & Trường đang dạy, duyệt học sinh vào lớp, tự tạo bài tập và xem kết quả làm bài của học sinh.
                </p>
              </div>

              {pendingTeachers.length > 0 && (
                <button
                  type="button"
                  onClick={handleApproveAllPendingTeachers}
                  className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-2xl shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Duyệt tất cả Giáo viên ({pendingTeachers.length})</span>
                </button>
              )}
            </div>

            {pendingTeachers.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                Hiện không có tài khoản Giáo viên nào đang chờ xét duyệt.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTeachers.map((tc) => (
                  <div
                    key={tc.email}
                    className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm sm:text-base text-slate-900">
                          Giáo viên: {tc.fullName}
                        </span>
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                          ⏳ Chờ Admin duyệt
                        </span>
                        <span className="bg-sky-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                          Dạy Lớp {tc.className || `${tc.grade}A1`} (Khối {tc.grade})
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 flex flex-wrap gap-3">
                        <span>Gmail: <strong>{tc.email}</strong></span>
                        <span>·</span>
                        <span>🏫 Trường đang dạy: <strong>{tc.school || 'Chưa cập nhật'}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTeacherDecision(tc.email, 'approved')}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Duyệt Giáo Viên Này</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTeacherDecision(tc.email, 'rejected')}
                        className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Phần 2B: Giáo viên đã được Admin xét duyệt */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 border-b border-slate-100 pb-3">
              Danh sách Giáo viên đã được Admin xét duyệt ({approvedTeachers.length} giáo viên)
            </h3>

            {approvedTeachers.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                Chưa có giáo viên nào trong danh sách đã duyệt.
              </div>
            ) : (
              <div className="space-y-2.5">
                {approvedTeachers.map((tc) => (
                  <div
                    key={tc.email}
                    className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-slate-900">
                          GV. {tc.fullName}
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                          ✓ Đã được Admin duyệt
                        </span>
                        <span className="text-xs font-bold text-sky-800">
                          Lớp đang dạy: {tc.className} · Trường: {tc.school}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Gmail: {tc.email}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTeacherDecision(tc.email, 'pending')}
                      className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs rounded-xl shrink-0 cursor-pointer"
                    >
                      Chuyển về Chờ duyệt
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 3: QUẢN LÝ TOÀN BỘ TÀI KHOẢN ==================== */}
      {activeTab === 'all-accounts' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5 animate-in fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Quản Lý Toàn Bộ Tài Khoản Học Sinh & Giáo Viên ({accounts.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Admin có toàn quyền đổi mật khẩu, sửa Lớp/Trường, cấp/khóa quyền làm bài và xóa bất kỳ tài khoản nào.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(['all', 'student', 'teacher', 'school', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    roleFilter === r
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-sky-50'
                  }`}
                >
                  {r === 'all'
                    ? `Tất cả (${accounts.length})`
                    : r === 'student'
                      ? `Học sinh (${allStudents.length})`
                      : r === 'teacher'
                        ? `Giáo viên (${allTeachers.length})`
                        : r === 'school'
                          ? `Nhà trường (${accounts.filter((account) => account.role === 'school').length})`
                          : `Admin (${accounts.filter((account) => account.role === 'admin').length})`}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo họ tên, địa chỉ Gmail, tên lớp hoặc trường học..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {filteredAccounts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
              Không tìm thấy tài khoản nào khớp điều kiện lọc.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAccounts.map((acc) => {
                const emailKey = acc.email.toLowerCase();
                const isEditingInfo = editingInfoEmail === emailKey;

                return (
                  <div
                    key={emailKey}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-3"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                              acc.role === 'teacher'
                                ? 'bg-purple-100 text-purple-800'
                                : acc.role === 'school'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {acc.role === 'teacher'
                              ? 'GIÁO VIÊN'
                              : acc.role === 'school'
                                ? 'NHÀ TRƯỜNG'
                                : acc.role === 'admin'
                                  ? 'ADMIN'
                                  : acc.role === 'parent'
                                    ? 'PHỤ HUYNH'
                                    : 'HỌC SINH'}
                          </span>
                          <span className="font-extrabold text-sm text-slate-900">
                            {acc.fullName}
                          </span>
                          <span className="text-xs font-bold text-sky-700">
                            Lớp {acc.className || `${acc.grade}A1`} (Khối {acc.grade})
                          </span>
                          <span className="text-xs text-slate-600">🏫 {acc.school}</span>
                        </div>

                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                          <span>Gmail: <strong>{acc.email}</strong></span>
                          <span>·</span>
                          <span>UID: <strong className="font-mono">{acc.firebaseUid}</strong></span>
                          <span>·</span>
                          {acc.role === 'student' ? (
                            <span
                              className={`font-bold ${
                                acc.canPracticeAll ? 'text-emerald-700' : 'text-amber-700'
                              }`}
                            >
                              {acc.canPracticeAll
                                ? '✓ Được phép làm mọi bài'
                                : '🔒 Không cho phép (Chỉ 3 bài đầu)'}
                            </span>
                          ) : acc.role === 'teacher' ? (
                            <span
                              className={`font-bold ${
                                acc.teacherApprovalStatus === 'approved'
                                  ? 'text-emerald-700'
                                  : 'text-amber-700'
                              }`}
                            >
                              {acc.teacherApprovalStatus === 'approved'
                                ? '✓ GV Đã duyệt'
                                : '⏳ GV Chờ duyệt'}
                            </span>
                          ) : acc.role === 'admin' ? (
                            <span className="font-bold text-sky-700">Quản trị viên</span>
                          ) : (
                            <span className="font-bold text-amber-700">Tài khoản nhà trường</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        {acc.role === 'student' ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleStudentPermission(acc.email, !acc.canPracticeAll)
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer ${
                              acc.canPracticeAll
                                ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                                : 'bg-emerald-600 text-white hover:bg-emerald-500'
                            }`}
                          >
                            {acc.canPracticeAll
                              ? 'Khóa về 3 bài đầu'
                              : 'Cho phép làm mọi bài'}
                          </button>
                        ) : acc.role === 'teacher' ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleTeacherDecision(
                                acc.email,
                                acc.teacherApprovalStatus === 'approved' ? 'pending' : 'approved'
                              )
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer ${
                              acc.teacherApprovalStatus === 'approved'
                                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {acc.teacherApprovalStatus === 'approved'
                              ? 'Thu hồi duyệt GV'
                              : 'Duyệt Giáo viên'}
                          </button>
                        ) : null}

                        {acc.role !== 'admin' && (
                          <>
                            <button
                              type="button"
                              onClick={() => setHistoryAccount(acc)}
                              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Lịch sử trò chuyện</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingInfoEmail(isEditingInfo ? null : emailKey);
                                setEditGrade(acc.grade);
                                setEditClass(acc.className || `${acc.grade}A1`);
                                setEditSchoolLevel(acc.schoolLevel || 'elementary');
                                setEditProvince(acc.provinceOrCity || '');
                                setEditDistrict(acc.district || '');
                                const matchingSchool = schoolDirectory.find(
                                  (entry) =>
                                    entry.schoolName === acc.school &&
                                    (entry.schoolLevel === (acc.schoolLevel || 'elementary') ||
                                      entry.schoolLevel === 'all') &&
                                    entry.provinceOrCity === acc.provinceOrCity &&
                                    entry.district === acc.district
                                );
                                setEditSchoolId(matchingSchool?.id || '');
                                setEditRole(acc.role === 'teacher' || acc.role === 'school' ? acc.role : 'student');
                                setEditFullName(acc.fullName);
                                setEditPhone(acc.phone || '');
                                setEditAvatar(acc.avatar || '');
                                setEditDiamonds(String(acc.diamonds ?? 0));
                                setEditLevel(String(acc.level ?? 1));
                                setEditStudentCode(acc.studentCode);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Sửa thông tin</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendPasswordReset(acc.email)}
                              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <KeyRound className="w-3 h-3" />
                              <span>Gửi link đổi mật khẩu</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAccount(acc.email)}
                              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Xóa tài khoản</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {isEditingInfo && (
                      <div className="p-3 rounded-xl bg-white border border-sky-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        <label className="text-[11px] font-bold text-slate-600">
                          Loại tài khoản
                          <select
                            value={editRole}
                            onChange={(event) => {
                              const nextRole = event.target.value as 'student' | 'teacher' | 'school';
                              setEditRole(nextRole);
                              if (nextRole === 'school') {
                                setEditClass('');
                              } else if (!editClass.trim()) {
                                setEditClass(`${editGrade}A1`);
                              }
                            }}
                            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                          >
                            <option value="student">Học sinh</option>
                            <option value="teacher">Giáo viên</option>
                            <option value="school">Nhà trường</option>
                          </select>
                        </label>
                        <label className="text-[11px] font-bold text-slate-600">
                          Họ và tên
                          <input
                            type="text"
                            value={editFullName}
                            onChange={(event) => setEditFullName(event.target.value)}
                            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                          />
                        </label>
                        <label className="text-[11px] font-bold text-slate-600">
                          Số điện thoại
                          <input
                            type="tel"
                            value={editPhone}
                            onChange={(event) => setEditPhone(event.target.value)}
                            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                          />
                        </label>
                        {editRole !== 'school' && (
                          <label className="text-[11px] font-bold text-slate-600">
                            Khối
                            <select
                              value={editGrade}
                              onChange={(e) => {
                                const g = Number(e.target.value) as GradeLevel;
                                const schoolLevel = g <= 5
                                  ? 'elementary'
                                  : g <= 9
                                    ? 'lower-secondary'
                                    : 'upper-secondary';
                                setEditGrade(g);
                                setEditClass(`${g}A1`);
                                if (schoolLevel !== editSchoolLevel) {
                                  setEditSchoolLevel(schoolLevel);
                                  setEditProvince('');
                                  setEditDistrict('');
                                  setEditSchoolId('');
                                }
                              }}
                              className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                                <option key={g} value={g}>Khối {g}</option>
                              ))}
                            </select>
                          </label>
                        )}
                        {editRole !== 'school' && (
                          <label className="text-[11px] font-bold text-slate-600">
                            Lớp
                            <input
                              type="text"
                              value={editClass}
                              onChange={(e) => setEditClass(e.target.value)}
                              placeholder="Tên lớp (VD: 4A1)"
                              className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-normal"
                            />
                          </label>
                        )}
                        <label className="text-[11px] font-bold text-slate-600">
                          URL ảnh đại diện (HTTPS)
                          <input
                            type="text"
                            inputMode="url"
                            value={editAvatar}
                            onChange={(event) => setEditAvatar(event.target.value)}
                            placeholder="https://..."
                            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                          />
                        </label>
                        <label className="text-[11px] font-bold text-slate-600">
                          Mã học sinh/giáo viên
                          <input
                            type="text"
                            value={editStudentCode}
                            onChange={(event) => setEditStudentCode(event.target.value)}
                            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                          />
                        </label>
                        <label className="text-[11px] font-bold text-slate-600">
                          Kim cương
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={editDiamonds}
                            onChange={(event) => setEditDiamonds(event.target.value)}
                            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                          />
                        </label>
                        <label className="text-[11px] font-bold text-slate-600">
                          Cấp độ
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={editLevel}
                            onChange={(event) => setEditLevel(event.target.value)}
                            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                          />
                        </label>
                        <label className="text-[11px] font-bold text-slate-600">
                          Cấp trường
                          <select
                            value={editSchoolLevel}
                            onChange={(event) => {
                              setEditSchoolLevel(event.target.value as SchoolDirectoryEntry['schoolLevel']);
                              setEditProvince('');
                              setEditDistrict('');
                              setEditSchoolId('');
                            }}
                            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                          >
                            <option value="elementary">Tiểu học</option>
                            <option value="lower-secondary">THCS</option>
                            <option value="upper-secondary">THPT</option>
                          </select>
                        </label>
                        <label className="text-[11px] font-bold text-slate-600">
                          Tỉnh/Thành
                          <select
                            value={editProvince}
                            onChange={(event) => {
                              setEditProvince(event.target.value);
                              setEditDistrict('');
                              setEditSchoolId('');
                            }}
                            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                          >
                            <option value="">Chọn tỉnh/thành</option>
                            {editProvince && !VIETNAM_ADMIN_UNITS.some((province) => province.name === editProvince) && (
                              <option value={editProvince}>{editProvince} (dữ liệu cũ)</option>
                            )}
                            {VIETNAM_ADMIN_UNITS.map((province) => (
                              <option key={province.code} value={province.name}>{province.name}</option>
                            ))}
                          </select>
                        </label>
                        <label className="text-[11px] font-bold text-slate-600">
                          Phường/Xã/Đặc khu
                          <select
                            value={editDistrict}
                            disabled={!editProvince}
                            onChange={(event) => {
                              setEditDistrict(event.target.value);
                              setEditSchoolId('');
                            }}
                            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white disabled:bg-slate-100"
                          >
                            <option value="">Chọn phường/xã/đặc khu</option>
                            {editDistrict &&
                              !VIETNAM_ADMIN_UNITS
                                .find((province) => province.name === editProvince)
                                ?.wards.some((ward) => ward.name === editDistrict) && (
                                <option value={editDistrict}>{editDistrict} (dữ liệu cũ)</option>
                              )}
                            {VIETNAM_ADMIN_UNITS
                              .find((province) => province.name === editProvince)
                              ?.wards.map((ward) => (
                                <option key={ward.code} value={ward.name}>{ward.name}</option>
                              ))}
                          </select>
                        </label>
                        <label className="text-[11px] font-bold text-slate-600">
                          Trường đầy đủ
                          <select
                            value={editSchoolId}
                            disabled={!editDistrict}
                            onChange={(event) => setEditSchoolId(event.target.value)}
                            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white disabled:bg-slate-100"
                          >
                            <option value="">Chọn trường đã cấp</option>
                            {schoolDirectory
                              .filter((entry) =>
                                (entry.schoolLevel === editSchoolLevel || entry.schoolLevel === 'all') &&
                                entry.provinceOrCity === editProvince &&
                                entry.district === editDistrict
                              )
                              .map((entry) => (
                                <option key={entry.id} value={entry.id}>{entry.schoolName}</option>
                              ))}
                          </select>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleSaveAccountInfo(acc.email)}
                          className="px-3 py-1.5 bg-sky-600 text-white font-extrabold text-xs rounded-lg cursor-pointer self-end"
                        >
                          Lưu hồ sơ
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'create-account' && (
        <form
          onSubmit={handleCreateManagedAccount}
          noValidate
          className="bg-white rounded-3xl border border-sky-200 p-5 sm:p-6 shadow-xs space-y-4 animate-in fade-in"
        >
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Tạo tài khoản do Admin quản lý</h2>
            <p className="text-xs text-slate-600 mt-1">
              Tài khoản Nhà trường chỉ được tạo tại đây, không xuất hiện trong biểu mẫu đăng ký công khai.
            </p>
            <p className="text-[11px] text-amber-800 mt-2">
              Tài khoản được lưu trên Firebase để đăng nhập trên các thiết bị; người dùng có thể đăng nhập ngay sau khi tạo.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs font-bold text-slate-700">
              Loại tài khoản
              <select
                value={newAccountRole}
                onChange={(event) => {
                  setNewAccountRole(event.target.value as 'student' | 'teacher' | 'school');
                  setNewAccountSchoolId('');
                  setIsNewAccountManualSchool(false);
                }}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white disabled:bg-slate-100"
              >
                <option value="school">Nhà trường (chỉ Admin tạo)</option>
                <option value="teacher">Giáo viên</option>
                <option value="student">Học sinh</option>
              </select>
            </label>
            <label className="text-xs font-bold text-slate-700">
              Tỉnh/Thành
              <select
                required
                value={newAccountProvince}
                onChange={(event) => {
                  setNewAccountProvince(event.target.value);
                  setNewAccountDistrict('');
                  setNewAccountSchoolId('');
                  setNewAccountManualSchoolName('');
                  setIsNewAccountManualSchool(false);
                }}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="">Chọn tỉnh/thành</option>
                {VIETNAM_ADMIN_UNITS.map((province) => (
                  <option key={province.code} value={province.name}>{province.name}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold text-slate-700">
              Phường/Xã/Đặc khu
              <select
                required
                value={newAccountDistrict}
                disabled={!newAccountProvince}
                onChange={(event) => {
                  setNewAccountDistrict(event.target.value);
                  setNewAccountSchoolId('');
                  setNewAccountManualSchoolName('');
                  setIsNewAccountManualSchool(false);
                }}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white disabled:bg-slate-100"
              >
                <option value="">Chọn phường/xã/đặc khu</option>
                {VIETNAM_ADMIN_UNITS
                  .find((province) => province.name === newAccountProvince)
                  ?.wards.map((ward) => (
                    <option key={ward.code} value={ward.name}>{ward.name}</option>
                  ))}
              </select>
            </label>
            <div className="text-xs font-bold text-slate-700">
              <label htmlFor="admin-account-school">Trường trong khu vực đã chọn</label>
              {newAccountManualSchoolMode ? (
                <input
                  id="admin-account-school"
                  required
                  value={newAccountManualSchoolName}
                  onChange={(event) => setNewAccountManualSchoolName(event.target.value)}
                  onBlur={(event) =>
                    setNewAccountManualSchoolName(formatSchoolName(event.target.value))
                  }
                  placeholder="Tên riêng trường (VD: ABC)"
                  className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
                />
              ) : (
                <select
                  id="admin-account-school"
                  required
                  value={newAccountSchoolId}
                  onChange={(event) => setNewAccountSchoolId(event.target.value)}
                  disabled={!newAccountDistrict}
                  className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white disabled:bg-slate-100"
                >
                  <option value="">Chọn trường</option>
                  {newAccountSchools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.schoolName}
                    </option>
                  ))}
                </select>
              )}
              {newAccountRole === 'school' && newAccountManualSchoolMode && (
                <select
                  aria-label="Cấp học của trường"
                  value={newAccountManualSchoolLevel}
                  onChange={(event) =>
                    setNewAccountManualSchoolLevel(
                      event.target.value as Exclude<SchoolDirectoryEntry['schoolLevel'], 'all'>
                    )
                  }
                  className="mt-2 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="elementary">Tiểu học</option>
                  <option value="lower-secondary">THCS</option>
                  <option value="upper-secondary">THPT</option>
                </select>
              )}
              {newAccountDistrict && newAccountManualSchoolMode && (
                <p className="mt-1 text-[11px] font-normal text-amber-700">
                  {newAccountSchools.length
                    ? 'Có thể nhập tên trường nếu chưa có trong danh sách.'
                    : 'Khu vực này chưa có trường trong danh sách; hãy nhập tên trường.'}
                </p>
              )}
              {newAccountDistrict && newAccountSchools.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setIsNewAccountManualSchool(!newAccountManualSchoolMode);
                    setNewAccountSchoolId('');
                    setNewAccountManualSchoolName('');
                  }}
                  className="mt-1 text-[11px] font-semibold text-sky-700 underline"
                >
                  {newAccountManualSchoolMode
                    ? 'Chọn trường trong danh sách'
                    : 'Trường chưa có trong danh sách? Nhập tên'}
                </button>
              )}
            </div>
            <label className="text-xs font-bold text-slate-700">
              Họ và tên
              <input
                required
                value={newAccountName}
                onChange={(event) => setNewAccountName(event.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200"
              />
            </label>
            <label className="text-xs font-bold text-slate-700">
              Gmail đăng nhập
              <input
                required
                type="email"
                value={newAccountEmail}
                onChange={(event) => setNewAccountEmail(event.target.value)}
                placeholder="ten@gmail.com"
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200"
              />
            </label>
            <label className="text-xs font-bold text-slate-700">
              Tên tài khoản (tối thiểu 8 ký tự)
              <input
                required
                type="text"
                value={newAccountUsername}
                onChange={(event) => setNewAccountUsername(event.target.value)}
                placeholder="Ví dụ: nguyenben2000"
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200"
              />
            </label>
            <label className="text-xs font-bold text-slate-700">
              Mật khẩu (ít nhất 7 ký tự)
              <input
                required
                type="password"
                value={newAccountPassword}
                onChange={(event) => setNewAccountPassword(event.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200"
              />
            </label>
            {newAccountRole !== 'school' && (
              <label className="text-xs font-bold text-slate-700">
                Khối/lớp phụ trách
                <div className="flex gap-2 mt-1">
                  <select
                  value={newAccountGrade}
                    onChange={(event) => {
                      const grade = Number(event.target.value) as GradeLevel;
                      setNewAccountGrade(grade);
                      setNewAccountClass(`${grade}A1`);
                      setNewAccountSchoolId('');
                    }}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    {Array.from({ length: 12 }, (_, index) => index + 1).map((grade) => (
                      <option key={grade} value={grade}>Khối {grade}</option>
                    ))}
                  </select>
                  <input
                    required
                    value={newAccountClass}
                    onChange={(event) => setNewAccountClass(event.target.value)}
                    placeholder="Lớp 4A1"
                    className="min-w-0 flex-1 px-3 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </label>
            )}
          </div>
          <button
            type="submit"
            disabled={isCreatingManagedAccount}
            className="px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white text-xs font-extrabold cursor-pointer disabled:cursor-not-allowed"
          >
            {isCreatingManagedAccount ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </button>
        </form>
      )}

      {activeTab === 'school-directory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in">
          <form
            onSubmit={handleAddSchoolDirectoryEntry}
            className="bg-white rounded-3xl border border-sky-200 p-5 sm:p-6 shadow-xs space-y-3"
          >
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Cấp trường/khu vực đăng ký</h2>
              <p className="text-xs text-slate-600 mt-1">
                Học sinh, giáo viên chọn trường từ dữ liệu nền hoặc danh mục Admin bổ sung; không cần tự gõ tên trường.
              </p>
            </div>
            <label className="block text-xs font-bold text-slate-700">
              Cấp học
              <select
                value={directorySchoolLevel}
                onChange={(event) =>
                  setDirectorySchoolLevel(event.target.value as SchoolDirectoryEntry['schoolLevel'])
                }
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="elementary">Tiểu học</option>
                <option value="lower-secondary">THCS</option>
                <option value="upper-secondary">THPT</option>
              </select>
            </label>
            <label className="block text-xs font-bold text-slate-700">
              Tỉnh/Thành phố
              <select
                required
                value={directoryProvince}
                onChange={(event) => {
                  setDirectoryProvince(event.target.value);
                  setDirectoryDistrict('');
                }}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="">Chọn tỉnh/thành</option>
                {VIETNAM_ADMIN_UNITS.map((province) => (
                  <option key={province.code} value={province.name}>{province.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-bold text-slate-700">
              Phường/Xã/Đặc khu
              <select
                required
                value={directoryDistrict}
                disabled={!directoryProvince}
                onChange={(event) => setDirectoryDistrict(event.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white disabled:bg-slate-100"
              >
                <option value="">Chọn phường/xã/đặc khu</option>
                {VIETNAM_ADMIN_UNITS
                  .find((province) => province.name === directoryProvince)
                  ?.wards.map((ward) => (
                    <option key={ward.code} value={ward.name}>{ward.name}</option>
                  ))}
              </select>
            </label>
            <label className="block text-xs font-bold text-slate-700">
              Tên trường đầy đủ
              <input
                required
                value={directorySchoolName}
                onChange={(event) => setDirectorySchoolName(event.target.value)}
                placeholder="Ví dụ: Trường Tiểu học ... "
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200"
              />
            </label>
            <button type="submit" className="px-5 py-3 rounded-xl bg-sky-600 text-white text-xs font-extrabold">
              Thêm trường vào danh mục
            </button>
          </form>

          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900">Danh sách trường đã cấp ({schoolDirectory.length})</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Có {schoolDirectory.filter((entry) => entry.source === 'openstreetmap').length} mục từ OpenStreetMap. Danh mục này chưa đầy đủ vì chỉ giữ trường có địa chỉ khớp dữ liệu hành chính hiện hành; Admin có thể bổ sung trường còn thiếu.{' '}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                © OpenStreetMap contributors (ODbL)
              </a>
            </p>
            {schoolDirectory.length === 0 ? (
              <p className="p-5 rounded-2xl bg-slate-50 text-xs text-slate-600">
                Chưa có trường. Thêm trường để bật lựa chọn khi đăng ký/tạo tài khoản.
              </p>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {schoolDirectory.map((entry) => (
                  <div key={entry.id} className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-200">
                    <div className="text-xs">
                      <p className="font-bold text-slate-900">{entry.schoolName}</p>
                      <p className="text-slate-600">{schoolLevelLabel(entry.schoolLevel)} · {entry.district}, {entry.provinceOrCity}</p>
                      {entry.source === 'openstreetmap' && (
                        <p className="text-[10px] text-slate-500">Nguồn dữ liệu nền: OpenStreetMap</p>
                      )}
                    </div>
                    {entry.source === 'openstreetmap' ? (
                      <span className="text-[10px] text-slate-500">Dữ liệu nền</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDeleteSchoolDirectoryEntry(entry.id)}
                        className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-bold"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'notifications' && <AdminNotificationsPanel />}

      {activeTab === 'support-inbox' && <AdminSupportInbox />}

      {/* ==================== TAB 7: SỬA TRỰC TIẾP TRANG WEB & NỘI DUNG BÀI LUYỆN ==================== */}
      {activeTab === 'site-editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          {/* Cột trái: Sửa trực tiếp văn bản & giao diện trang web */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-sky-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  Sửa Trực Tiếp Giao Diện & Nội Dung Trang Web
                </h3>
                <p className="text-xs text-slate-500">
                  Nội dung và hình ảnh áp dụng trên trình duyệt hiện tại cho Trang chủ, Thanh điều hướng và Chân trang.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetSiteConfig}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Mặc định</span>
              </button>
            </div>

            <form onSubmit={handleSaveSiteConfig} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Dòng thông báo thanh trên cùng (Header):
                </label>
                <input
                  type="text"
                  value={siteConfig.topBannerText}
                  onChange={(e) =>
                    setSiteConfig({ ...siteConfig, topBannerText: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nhãn nổi bật đầu Trang chủ (Hero Badge):
                </label>
                <input
                  type="text"
                  value={siteConfig.heroBadgeText}
                  onChange={(e) =>
                    setSiteConfig({ ...siteConfig, heroBadgeText: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tiêu đề dòng 1:</label>
                  <input
                    type="text"
                    value={siteConfig.heroTitleLine1}
                    onChange={(e) =>
                      setSiteConfig({ ...siteConfig, heroTitleLine1: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chữ nổi bật:</label>
                  <input
                    type="text"
                    value={siteConfig.heroTitleHighlight}
                    onChange={(e) =>
                      setSiteConfig({ ...siteConfig, heroTitleHighlight: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-sky-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tiêu đề dòng 2:</label>
                  <input
                    type="text"
                    value={siteConfig.heroTitleLine2}
                    onChange={(e) =>
                      setSiteConfig({ ...siteConfig, heroTitleLine2: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mô tả giới thiệu Trang chủ:
                </label>
                <textarea
                  rows={3}
                  value={siteConfig.heroDescription}
                  onChange={(e) =>
                    setSiteConfig({ ...siteConfig, heroDescription: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mô tả giới thiệu ở Chân trang (Footer):
                </label>
                <textarea
                  rows={2}
                  value={siteConfig.footerDescription}
                  onChange={(e) =>
                    setSiteConfig({ ...siteConfig, footerDescription: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <label className="text-xs font-bold text-slate-700">
                  URL ảnh bìa trang chủ (HTTPS hoặc /public-path):
                  <input
                    type="text"
                    inputMode="url"
                    value={siteConfig.heroImageUrl || ''}
                    onChange={(event) =>
                      setSiteConfig({ ...siteConfig, heroImageUrl: event.target.value })
                    }
                    placeholder="https://.../anh-bia.jpg"
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 font-normal"
                  />
                  <img
                    src={siteConfig.heroImageUrl || HERO_IMAGE}
                    onError={(event) => {
                      event.currentTarget.src = HERO_IMAGE;
                    }}
                    alt="Xem trước ảnh bìa"
                    className="mt-2 h-24 w-full rounded-xl object-cover border border-slate-200"
                  />
                </label>
                <label className="text-xs font-bold text-slate-700">
                  URL ảnh mascot/logo (HTTPS hoặc /public-path):
                  <input
                    type="text"
                    inputMode="url"
                    value={siteConfig.mascotImageUrl || ''}
                    onChange={(event) =>
                      setSiteConfig({ ...siteConfig, mascotImageUrl: event.target.value })
                    }
                    placeholder="https://.../mascot.png"
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 font-normal"
                  />
                  <img
                    src={siteConfig.mascotImageUrl || MASCOT_IMAGE}
                    onError={(event) => {
                      event.currentTarget.src = MASCOT_IMAGE;
                    }}
                    alt="Xem trước ảnh mascot"
                    className="mt-2 h-24 w-full rounded-xl object-cover border border-slate-200"
                  />
                </label>
                <p className="sm:col-span-2 text-[11px] text-slate-500">
                  Dùng liên kết ảnh HTTPS công khai hoặc đặt tệp trong thư mục public rồi nhập đường dẫn bắt đầu bằng /. Các thay đổi lưu trên trình duyệt này.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">
                  Email hiển thị hỗ trợ:
                  <input
                    type="email"
                    value={siteConfig.supportContactEmailDisplay}
                    onChange={(event) =>
                      setSiteConfig({
                        ...siteConfig,
                        supportContactEmailDisplay: event.target.value,
                      })
                    }
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 font-normal"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Thay Đổi Trực Tiếp Lên Trang Web</span>
              </button>
            </form>
          </div>

          {/* Cột phải: Sửa trực tiếp các bài luyện của 12 khối lớp */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                Sửa Trực Tiếp 60 Bài Luyện Theo Khối Lớp
              </h3>
              <p className="text-xs text-slate-500">
                Chọn khối lớp và môn học để sửa tên bài, mô tả, độ khó và toàn bộ câu hỏi/đáp án.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={editorGrade}
                onChange={(e) => setEditorGrade(Number(e.target.value) as GradeLevel)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-extrabold text-sky-900 bg-sky-50"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                  <option key={g} value={g}>
                    Khối Lớp {g}
                  </option>
                ))}
              </select>

              {[
                { id: 'tieng-viet', label: '📖 Môn Văn (20 bài)' },
                { id: 'toan', label: '📐 Môn Toán (20 bài)' },
                { id: 'tieng-anh', label: '🌍 Môn Anh (20 bài)' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setEditorSubject(s.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                    editorSubject === s.id
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-sky-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2.5 pr-1">
              {lessonsForEditor.map((les, idx) => {
                const isEditing = editingLessonId === les.id;
                return (
                  <div
                    key={les.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-sky-100 text-sky-900">
                          Bài {idx + 1} · {les.difficulty} {idx < 3 ? '(Mở làm thử)' : '(Cần Admin cho phép)'}
                        </span>
                        <h4 className="font-extrabold text-slate-900 mt-1">{les.title}</h4>
                        <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">
                          {les.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (isEditing) {
                            setEditingLessonId(null);
                          } else {
                            setEditingLessonId(les.id);
                            setEditLessonTitle(les.title);
                            setEditLessonDesc(les.description);
                            setEditLessonDiff(les.difficulty);
                            setEditLessonQuestions(
                              les.sampleQuestions.map((question) => ({
                                ...question,
                                options: [...question.options],
                              }))
                            );
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 font-bold shrink-0 cursor-pointer"
                      >
                        {isEditing ? 'Đóng' : '✏️ Sửa bài này'}
                      </button>
                    </div>

                    {isEditing && (
                      <div className="p-3 rounded-xl bg-white border border-sky-200 space-y-3">
                        <input
                          type="text"
                          value={editLessonTitle}
                          onChange={(e) => setEditLessonTitle(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold"
                          placeholder="Tên bài luyện..."
                        />
                        <textarea
                          rows={2}
                          value={editLessonDesc}
                          onChange={(e) => setEditLessonDesc(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                          placeholder="Mô tả bài luyện..."
                        />
                        <div className="flex items-center gap-2">
                          <select
                            value={editLessonDiff}
                            onChange={(e) =>
                              setEditLessonDiff(
                                e.target.value as 'Cơ bản' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao'
                              )
                            }
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold"
                          >
                            <option value="Cơ bản">Cơ bản</option>
                            <option value="Thông hiểu">Thông hiểu</option>
                            <option value="Vận dụng">Vận dụng</option>
                            <option value="Vận dụng cao">Vận dụng cao</option>
                          </select>
                        </div>
                        <div className="border-t border-slate-100 pt-3 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="font-extrabold text-slate-800">
                              Câu hỏi và đáp án ({editLessonQuestions.length})
                            </h5>
                            <button
                              type="button"
                              onClick={() =>
                                setEditLessonQuestions((questions) => [
                                  ...questions,
                                  {
                                    id: `admin-q-${Date.now()}`,
                                    question: '',
                                    options: ['', '', '', ''],
                                    correctIndex: 0,
                                    explanation: '',
                                    points: 10,
                                    difficulty: 'medium',
                                  },
                                ])
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold"
                            >
                              + Thêm câu
                            </button>
                          </div>
                          {editLessonQuestions.map((question, questionIndex) => (
                            <fieldset
                              key={question.id}
                              className="p-3 rounded-xl border border-slate-200 space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <legend className="font-extrabold text-sky-900">
                                  Câu {questionIndex + 1}
                                </legend>
                                {editLessonQuestions.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditLessonQuestions((questions) =>
                                        questions.filter((_, index) => index !== questionIndex)
                                      )
                                    }
                                    className="text-red-600 font-bold"
                                  >
                                    Xóa câu
                                  </button>
                                )}
                              </div>
                              <textarea
                                rows={2}
                                value={question.question}
                                onChange={(event) =>
                                  setEditLessonQuestions((questions) =>
                                    questions.map((item, index) =>
                                      index === questionIndex
                                        ? { ...item, question: event.target.value }
                                        : item
                                    )
                                  )
                                }
                                placeholder="Nội dung câu hỏi"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                              />
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {question.options.map((option, optionIndex) => (
                                  <label
                                    key={`${question.id}-option-${optionIndex}`}
                                    className="text-[11px] font-bold text-slate-600"
                                  >
                                    Đáp án {String.fromCharCode(65 + optionIndex)}
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(event) =>
                                        setEditLessonQuestions((questions) =>
                                          questions.map((item, index) =>
                                            index === questionIndex
                                              ? {
                                                  ...item,
                                                  options: item.options.map((value, currentIndex) =>
                                                    currentIndex === optionIndex
                                                      ? event.target.value
                                                      : value
                                                  ),
                                                }
                                              : item
                                          )
                                        )
                                      }
                                      className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-normal"
                                    />
                                  </label>
                                ))}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <label className="text-[11px] font-bold text-slate-600">
                                  Đáp án đúng
                                  <select
                                    value={question.correctIndex}
                                    onChange={(event) =>
                                      setEditLessonQuestions((questions) =>
                                        questions.map((item, index) =>
                                          index === questionIndex
                                            ? { ...item, correctIndex: Number(event.target.value) }
                                            : item
                                        )
                                      )
                                    }
                                    className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                                  >
                                    {question.options.map((_, optionIndex) => (
                                      <option key={optionIndex} value={optionIndex}>
                                        {String.fromCharCode(65 + optionIndex)}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <label className="text-[11px] font-bold text-slate-600">
                                  Điểm
                                  <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={question.points}
                                    onChange={(event) =>
                                      setEditLessonQuestions((questions) =>
                                        questions.map((item, index) =>
                                          index === questionIndex
                                            ? { ...item, points: Number(event.target.value) }
                                            : item
                                        )
                                      )
                                    }
                                    className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                                  />
                                </label>
                                <label className="text-[11px] font-bold text-slate-600">
                                  Mức độ câu hỏi
                                  <select
                                    value={question.difficulty}
                                    onChange={(event) =>
                                      setEditLessonQuestions((questions) =>
                                        questions.map((item, index) =>
                                          index === questionIndex
                                            ? {
                                                ...item,
                                                difficulty: event.target.value as QuizQuestion['difficulty'],
                                              }
                                            : item
                                        )
                                      )
                                    }
                                    className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                                  >
                                    <option value="easy">Cơ bản</option>
                                    <option value="medium">Thông hiểu</option>
                                    <option value="hard">Nâng cao</option>
                                  </select>
                                </label>
                              </div>
                              <textarea
                                rows={2}
                                value={question.explanation}
                                onChange={(event) =>
                                  setEditLessonQuestions((questions) =>
                                    questions.map((item, index) =>
                                      index === questionIndex
                                        ? { ...item, explanation: event.target.value }
                                        : item
                                    )
                                  )
                                }
                                placeholder="Giải thích đáp án"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                              />
                            </fieldset>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSaveLessonDirectEdit(les.id)}
                          className="w-full px-4 py-2 bg-sky-600 text-white font-extrabold rounded-lg cursor-pointer"
                        >
                          Lưu bài luyện và câu hỏi
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <AdminChatHistoryModal account={historyAccount} onClose={() => setHistoryAccount(null)} />
    </section>
  );
};
