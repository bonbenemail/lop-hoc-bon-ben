import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Lock,
  Mail,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  RefreshCw,
  Send,
  Loader2,
  Building2,
  BookOpen,
  Trash2,
  KeyRound,
  Search,
  Users,
  Save,
  Pencil
} from 'lucide-react';
import { GradeLevel, SchoolDirectoryEntry, UserAccount } from '../types';
import { MASCOT_IMAGE, GRADE_EXERCISE_TYPES } from '../data/bonbenData';
import { VIETNAM_ADMIN_UNITS } from '../data/vietnamAdministrativeUnits';
import {
  initAuth,
  googleSignIn,
  logoutGmail,
  sendVerificationOtpViaGmail,
  sendPasswordResetOtpViaGmail
} from '../services/gmailAuth';
import {
  createFirebaseAdminAccount,
  FIREBASE_ADMIN_EMAIL,
  sendAdminFirebasePasswordReset,
  signInAdminWithFirebase
} from '../services/firebaseAdminAuth';
import {
  getAllRegisteredAccounts,
  saveAllRegisteredAccounts,
  isSameClassAndSchool,
  adminUpdateTeacherApproval,
  adminUpdateStudentPracticePermission,
  getSchoolDirectory,
  formatSchoolName,
  getConfiguredMascotImage
} from '../services/schoolManager';

const ADMIN_GMAIL = FIREBASE_ADMIN_EMAIL;

type GradeSchoolLevel = Exclude<SchoolDirectoryEntry['schoolLevel'], 'all'>;

const getSchoolLevelForGrade = (grade: number): GradeSchoolLevel =>
  grade <= 5 ? 'elementary' : grade <= 9 ? 'lower-secondary' : 'upper-secondary';

const getGradesForSchoolLevel = (schoolLevel: GradeSchoolLevel): GradeLevel[] => {
  if (schoolLevel === 'elementary') return [1, 2, 3, 4, 5];
  if (schoolLevel === 'lower-secondary') return [6, 7, 8, 9];
  return [10, 11, 12];
};

const getFirstGradeForSchoolLevel = (
  schoolLevel: GradeSchoolLevel
): GradeLevel => getGradesForSchoolLevel(schoolLevel)[0];

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLogin: (user: UserAccount) => void;
  onUpdateUser: (user: UserAccount) => void;
  onLogout: () => void;
  currentGrade: GradeLevel;
  onSelectGrade: (grade: GradeLevel) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onUpdateUser,
  onLogout,
  currentGrade,
  onSelectGrade,
}) => {
  const isAdminUser =
    currentUser?.role === 'admin' ||
    currentUser?.email?.toLowerCase() === ADMIN_GMAIL;

  const [authMode, setAuthMode] = useState<
    'login' | 'register' | 'forgot-password' | 'profile' | 'admin'
  >(currentUser ? (isAdminUser ? 'admin' : 'profile') : 'register');
  const [registerStep, setRegisterStep] = useState<'form' | 'verify-otp'>('form');
  const [forgotStep, setForgotStep] = useState<'request' | 'verify-otp'>('request');
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [resetNewPassword, setResetNewPassword] = useState<string>('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState<string>('');
  const [showResetPassword, setShowResetPassword] = useState<boolean>(false);
  const [showForgotConfirmModal, setShowForgotConfirmModal] = useState<boolean>(false);

  // Form fields (Supports Student or Teacher registration with Class & School)
  const [registerAccountType, setRegisterAccountType] = useState<'student' | 'teacher'>('student');
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [password, setPassword] = useState('');
  const [isAdminSigningIn, setIsAdminSigningIn] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(currentUser?.grade || currentGrade);
  const [classNameInput, setClassNameInput] = useState(
    currentUser?.className || `${currentUser?.grade || currentGrade}A1`
  );
  const [schoolInput, setSchoolInput] = useState(currentUser?.school || '');
  const [manualSchoolName, setManualSchoolName] = useState('');
  const [isManualSchool, setIsManualSchool] = useState(false);
  const [schoolLevelInput, setSchoolLevelInput] = useState<GradeSchoolLevel>(
    currentUser?.schoolLevel || getSchoolLevelForGrade(currentUser?.grade || currentGrade)
  );
  const [provinceInput, setProvinceInput] = useState(currentUser?.provinceOrCity || '');
  const [districtInput, setDistrictInput] = useState(currentUser?.district || '');
  const [schoolDirectory, setSchoolDirectory] = useState<SchoolDirectoryEntry[]>(() => getSchoolDirectory());

  // Profile edit state (for changing class & school after registration)
  const [editGrade, setEditGrade] = useState<GradeLevel>(currentUser?.grade || currentGrade);
  const [editClassName, setEditClassName] = useState(
    currentUser?.className || `${currentUser?.grade || currentGrade}A1`
  );
  const [editSchoolLevel, setEditSchoolLevel] = useState<GradeSchoolLevel>(
    currentUser?.schoolLevel || getSchoolLevelForGrade(currentUser?.grade || currentGrade)
  );
  const [editProvince, setEditProvince] = useState(currentUser?.provinceOrCity || '');
  const [editDistrict, setEditDistrict] = useState(currentUser?.district || '');
  const [editSchoolId, setEditSchoolId] = useState('');
  const [profileSavedNotice, setProfileSavedNotice] = useState<string | null>(null);

  // Admin Management state (automatically available when logged in with bonbenemail@gmail.com)
  const [registeredStudents, setRegisteredStudents] = useState<UserAccount[]>([]);
  const [adminSubTab, setAdminSubTab] = useState<'pending-students' | 'pending-teachers' | 'all'>('pending-students');
  const [adminSearch, setAdminSearch] = useState('');
  const [editingPasswordEmail, setEditingPasswordEmail] = useState<string | null>(null);
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [editingInfoEmail, setEditingInfoEmail] = useState<string | null>(null);
  const [adminEditGrade, setAdminEditGrade] = useState<GradeLevel>(4);
  const [adminEditClass, setAdminEditClass] = useState('');
  const [adminEditSchool, setAdminEditSchool] = useState('');
  const [deletingEmailConfirm, setDeletingEmailConfirm] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [adminActionBanner, setAdminActionBanner] = useState<string | null>(null);

  // 6-digit Email OTP verification state (never rendered on web UI, only sent via Gmail)
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [otpSentNotice, setOtpSentNotice] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [showSendConfirmModal, setShowSendConfirmModal] = useState<boolean>(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Google Workspace / Gmail Auth state
  const [needsGmailAuth, setNeedsGmailAuth] = useState<boolean>(false);
  const [isSigningInGmail, setIsSigningInGmail] = useState<boolean>(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const registrationProvince = VIETNAM_ADMIN_UNITS.find((province) => province.name === provinceInput);
  const profileProvince = VIETNAM_ADMIN_UNITS.find((province) => province.name === editProvince);
  const registrationSchools = schoolDirectory.filter(
    (entry) =>
      (entry.schoolLevel === schoolLevelInput || entry.schoolLevel === 'all') &&
      entry.provinceOrCity === provinceInput &&
      entry.district === districtInput
  );
  const manualSchoolMode =
    Boolean(districtInput) && (isManualSchool || registrationSchools.length === 0);
  const registrationSchoolName = manualSchoolMode
    ? formatSchoolName(manualSchoolName)
    : schoolInput.trim();
  const profileSchools = schoolDirectory.filter(
    (entry) =>
      (entry.schoolLevel === editSchoolLevel || entry.schoolLevel === 'all') &&
      entry.provinceOrCity === editProvince &&
      entry.district === editDistrict
  );

  // Helper to get registered & Gmail-OTP-verified accounts from localStorage
  const getRegisteredGmailAccounts = (): UserAccount[] => {
    return getAllRegisteredAccounts();
  };

  const refreshRegisteredStudents = () => {
    setRegisteredStudents(getAllRegisteredAccounts());
  };

  useEffect(() => {
    if (isOpen) {
      refreshRegisteredStudents();
      const directory = getSchoolDirectory();
      setSchoolDirectory(directory);
      if (currentUser) {
        setEditGrade(currentUser.grade);
        setEditClassName(currentUser.className || `${currentUser.grade}A1`);
        const currentSchool = directory.find(
          (entry) =>
            entry.schoolName === currentUser.school &&
            (entry.schoolLevel === (currentUser.schoolLevel || getSchoolLevelForGrade(currentUser.grade)) ||
              entry.schoolLevel === 'all') &&
            entry.provinceOrCity === currentUser.provinceOrCity &&
            entry.district === currentUser.district
        );
        setEditSchoolLevel(currentUser.schoolLevel || getSchoolLevelForGrade(currentUser.grade));
        setEditProvince(currentUser.provinceOrCity || currentSchool?.provinceOrCity || '');
        setEditDistrict(currentUser.district || currentSchool?.district || '');
        setEditSchoolId(currentSchool?.id || (currentUser.school ? '__current__' : ''));
        if (currentUser.role === 'admin' || currentUser.email.toLowerCase() === ADMIN_GMAIL) {
          setAuthMode('admin');
        } else {
          setAuthMode('profile');
        }
      }
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  if (!isOpen) return null;

  // Validation functions
  const validateEmail = (val: string) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    return gmailRegex.test(val.trim());
  };

  const validatePassword = (val: string) => {
    // Strictly greater than 6 characters (> 6 ký tự)
    return val.length > 6;
  };

  const handleGradeChange = (newGrade: GradeLevel) => {
    setSelectedGrade(newGrade);
    setClassNameInput(`${newGrade}A1`);
    setSchoolLevelInput(getSchoolLevelForGrade(newGrade));
    setProvinceInput('');
    setDistrictInput('');
    setSchoolInput('');
    setManualSchoolName('');
    setIsManualSchool(false);
  };

  const handleSchoolLevelChange = (schoolLevel: GradeSchoolLevel) => {
    setSchoolLevelInput(schoolLevel);
    const grade = getGradesForSchoolLevel(schoolLevel).includes(selectedGrade)
      ? selectedGrade
      : getFirstGradeForSchoolLevel(schoolLevel);
    setSelectedGrade(grade);
    setClassNameInput(`${grade}A1`);
    setProvinceInput('');
    setDistrictInput('');
    setSchoolInput('');
    setManualSchoolName('');
    setIsManualSchool(false);
  };

  const handleGoogleSignInClick = async () => {
    setIsSigningInGmail(true);
    setErrors({});
    try {
      const result = await googleSignIn();
      if (result) {
        setNeedsGmailAuth(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đăng nhập Google thất bại.';
      setErrors({ gmail: message });
    } finally {
      setIsSigningInGmail(false);
    }
  };

  const handleDisconnectGmail = async () => {
    await logoutGmail();
    setNeedsGmailAuth(true);
  };

  const executeSendEmailOtp = async () => {
    setIsSendingEmail(true);
    setErrors({});
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      await sendVerificationOtpViaGmail({
        toEmail: email.trim().toLowerCase(),
        studentName: fullName.trim(),
        grade: selectedGrade,
        otpCode: code,
      });
      setGeneratedOtp(code);
      setOtpDigits(['', '', '', '', '', '']);
      setResendTimer(60);
      setShowSendConfirmModal(false);
      setRegisterStep('verify-otp');
      setOtpSentNotice(
        `Đã gửi mã xác thực 6 số tới hộp thư ${email.trim().toLowerCase()}`
      );
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 120);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Không thể gửi email xác thực. Vui lòng kiểm tra cấu hình máy chủ gửi email.';
      setErrors({ gmail: msg });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Gửi mã 6 số khôi phục mật khẩu qua Gmail thật cho tài khoản quên mật khẩu
  const executeSendForgotRequest = async () => {
    setIsSendingEmail(true);
    setErrors({});
    const cleanEmail = forgotEmail.trim().toLowerCase();
    const registeredAccounts = getRegisteredGmailAccounts();
    const matchedAccount = registeredAccounts.find(
      (acc) => acc.email.toLowerCase() === cleanEmail
    );
    const targetName =
      matchedAccount?.fullName ||
      (cleanEmail === ADMIN_GMAIL ? 'Quản Trị Hệ Thống Bon Ben' : cleanEmail);

    if (cleanEmail === ADMIN_GMAIL) {
      try {
        await sendAdminFirebasePasswordReset();
        setShowForgotConfirmModal(false);
        setSuccessMessage(
          `Firebase đã gửi liên kết đặt lại mật khẩu tới ${ADMIN_GMAIL}. Hãy dùng liên kết đó để đặt mật khẩu mới.`
        );
        setTimeout(() => {
          setSuccessMessage(null);
          setAuthMode('login');
          setForgotStep('request');
        }, 4000);
      } catch (error: unknown) {
        setErrors({
          gmail:
            error instanceof Error
              ? error.message
              : 'Không thể gửi liên kết đặt lại mật khẩu Firebase.',
        });
      } finally {
        setIsSendingEmail(false);
      }
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      await sendPasswordResetOtpViaGmail({
        toEmail: cleanEmail,
        studentName: targetName,
        otpCode: code,
      });
      setGeneratedOtp(code);
      setOtpDigits(['', '', '', '', '', '']);
      setResendTimer(60);
      setShowForgotConfirmModal(false);
      setForgotStep('verify-otp');
      setOtpSentNotice(
        `Đã gửi mã khôi phục mật khẩu 6 số tới hộp thư ${cleanEmail}`
      );
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 120);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Không thể gửi email mã khôi phục. Vui lòng kiểm tra cấu hình máy chủ gửi email.';
      setErrors({ gmail: msg });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleForgotRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = forgotEmail.trim().toLowerCase();

    if (!cleanEmail) {
      setErrors({
        forgotEmail: 'Vui lòng nhập địa chỉ Gmail (@gmail.com) đã đăng ký của bạn.',
      });
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setErrors({
        forgotEmail: 'Chỉ chấp nhận địa chỉ Gmail hợp lệ có đuôi @gmail.com.',
      });
      return;
    }

    const registeredAccounts = getRegisteredGmailAccounts();
    const matchedAccount = registeredAccounts.find(
      (acc) => acc.email.toLowerCase() === cleanEmail
    );

    if (!matchedAccount && cleanEmail !== ADMIN_GMAIL) {
      setErrors({
        forgotEmail: `Tài khoản Gmail "${cleanEmail}" chưa được đăng ký trên hệ thống! Chỉ tài khoản Gmail đã đăng ký mới có thể nhận mã 6 số để khôi phục mật khẩu.`,
      });
      return;
    }

    setErrors({});
    setShowForgotConfirmModal(true);
  };

  const handleForgotVerifyAndResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotEmail.trim().toLowerCase() === ADMIN_GMAIL) {
      setErrors({
        otp: 'Mật khẩu Admin phải được đặt lại bằng liên kết Firebase gửi tới email.',
      });
      return;
    }
    const enteredCode = otpDigits.join('');
    if (enteredCode.length < 6) {
      setErrors({
        otp: 'Vui lòng nhập đủ 6 chữ số khôi phục mật khẩu đã được gửi vào hộp thư Gmail của bạn.',
      });
      return;
    }
    if (!generatedOtp || enteredCode !== generatedOtp) {
      setErrors({
        otp: 'Mã xác thực 6 số không chính xác. Vui lòng kiểm tra lại hộp thư Gmail của bạn!',
      });
      return;
    }
    if (!resetNewPassword || !validatePassword(resetNewPassword)) {
      setErrors({
        resetPassword: `Mật khẩu mới phải trên 6 ký tự (từ 7 ký tự trở lên). Hiện có: ${resetNewPassword.length} ký tự.`,
      });
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setErrors({
        resetConfirmPassword: 'Mật khẩu xác nhận không khớp với mật khẩu mới.',
      });
      return;
    }

    const cleanEmail = forgotEmail.trim().toLowerCase();
    const registeredAccounts = getRegisteredGmailAccounts();
    let updatedAccount: UserAccount | null = null;

    const updatedList = registeredAccounts.map((acc) => {
      if (acc.email.toLowerCase() === cleanEmail) {
        const modified = { ...acc, password: resetNewPassword };
        updatedAccount = modified;
        return modified;
      }
      return acc;
    });

    localStorage.setItem('bonben_registered_accounts', JSON.stringify(updatedList));
    refreshRegisteredStudents();
    setErrors({});

    if (updatedAccount) {
      const finalAccount: UserAccount = updatedAccount;
      onSelectGrade(finalAccount.grade);
      onLogin(finalAccount);
      setSuccessMessage(
        `Đổi mật khẩu mới thành công! Đã tự động đăng nhập tài khoản ${finalAccount.fullName} (${cleanEmail}).`
      );
      setTimeout(() => {
        setSuccessMessage(null);
        setForgotStep('request');
        setResetNewPassword('');
        setResetConfirmPassword('');
        onClose();
      }, 1300);
    }
  };

  // Chỉ được gọi SAU KHI người dùng đã nhập đúng mã 6 số gửi về Gmail khi Tạo tài khoản
  const completeRegistrationAfterGmailOtp = () => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === ADMIN_GMAIL) {
      setErrors({
        otp: 'Tài khoản Admin chỉ được tạo trong Firebase Authentication, không đăng ký từ biểu mẫu công khai.',
      });
      setRegisterStep('form');
      return;
    }

    // Kiểm tra lại lần nữa: 1 Gmail chỉ được tạo duy nhất 1 tài khoản
    const existingAccounts = getRegisteredGmailAccounts();
    const alreadyExists = existingAccounts.some(
      (acc) => acc.email.toLowerCase() === cleanEmail
    );
    if (alreadyExists) {
      setErrors({
        otp: `Địa chỉ Gmail "${cleanEmail}" đã có tài khoản trên hệ thống! Mỗi Gmail chỉ được tạo duy nhất 1 tài khoản.`,
      });
      return;
    }

    const cleanClass = (classNameInput.trim() || `${selectedGrade}A1`).toUpperCase();
    const cleanSchool = registrationSchoolName;
    const selectedSchool = manualSchoolMode
      ? undefined
      : schoolDirectory.find(
          (entry) =>
            entry.schoolName === cleanSchool &&
            (entry.schoolLevel === schoolLevelInput || entry.schoolLevel === 'all') &&
            entry.provinceOrCity === provinceInput &&
            entry.district === districtInput
        );
    if (!cleanSchool || (!manualSchoolMode && !selectedSchool)) {
      setErrors({
        otp: 'Thông tin trường chưa hợp lệ. Vui lòng quay lại kiểm tra tên trường và địa bàn.',
      });
      setRegisterStep('form');
      return;
    }
    const finalRole: 'teacher' | 'student' =
      registerAccountType === 'teacher' ? 'teacher' : 'student';

    // Kiểm tra xem Học sinh mới đăng ký có trùng Lớp & Trường với Giáo viên nào đã đăng ký không
    const matchedTeacher =
      finalRole === 'student'
        ? existingAccounts.find(
            (acc) =>
              acc.role === 'teacher' &&
              acc.teacherApprovalStatus !== 'rejected' &&
              isSameClassAndSchool(cleanClass, cleanSchool, acc.className, acc.school, selectedGrade, acc.grade)
          )
        : undefined;

    const newAccount: UserAccount = {
      id: `user-${Date.now()}`,
      fullName: fullName.trim(),
      email: cleanEmail,
      password: password,
      verifiedByGmail: true,
      grade: selectedGrade,
      className: cleanClass,
      school: cleanSchool,
      schoolLevel: selectedSchool
        ? selectedSchool.schoolLevel === 'all'
          ? schoolLevelInput
          : selectedSchool.schoolLevel
        : schoolLevelInput,
      provinceOrCity: selectedSchool?.provinceOrCity || provinceInput,
      district: selectedSchool?.district || districtInput,
      role: finalRole,
      // Học sinh mới khi đăng ký mặc định ở trạng thái KHÔNG CHO PHÉP (chờ Admin duyệt, chỉ làm thử 3 bài đầu)
      canPracticeAll: finalRole === 'teacher',
      practiceApprovalStatus: finalRole === 'teacher' ? 'approved' : 'pending',
      // Giáo viên mới đăng ký cần được Admin xét duyệt
      teacherApprovalStatus: finalRole === 'teacher' ? 'pending' : undefined,
      // Nếu học sinh trùng Lớp & Trường với giáo viên đã đăng ký -> Đợi giáo viên cho vào lớp
      teacherClassStatus: matchedTeacher ? 'pending' : 'none',
      matchedTeacherEmail: matchedTeacher?.email.toLowerCase(),
      matchedTeacherName: matchedTeacher?.fullName,
      diamonds: 0,
      level: 1,
      studentCode:
        finalRole === 'teacher'
          ? `GV-${cleanClass}-${Math.floor(100 + Math.random() * 900)}`
          : `HS-${cleanClass}-${Math.floor(100 + Math.random() * 900)}`,
      selectedExerciseTypes: (GRADE_EXERCISE_TYPES[selectedGrade] || GRADE_EXERCISE_TYPES[4]).map(
        (exerciseType) => exerciseType.id
      ),
      createdAt: new Date().toISOString(),
    };

    const updatedAccounts = [...existingAccounts, newAccount];
    saveAllRegisteredAccounts(updatedAccounts);
    const syncedAccounts = getAllRegisteredAccounts();
    const syncedNewAccount =
      syncedAccounts.find((a) => a.email.toLowerCase() === cleanEmail) || newAccount;
    refreshRegisteredStudents();

    onSelectGrade(selectedGrade);
    onLogin(syncedNewAccount);

    if (finalRole === 'teacher') {
      setSuccessMessage(
        `Đăng ký tài khoản Giáo viên thành công (${syncedNewAccount.fullName} · Dạy Lớp ${cleanClass} - ${cleanSchool}). Tài khoản đang chờ Admin xét duyệt!`
      );
    } else if (matchedTeacher) {
      setSuccessMessage(
        `Tạo tài khoản Học sinh thành công! Bạn đã được ghi nhận trùng Lớp ${cleanClass} (${cleanSchool}) với Giáo viên ${matchedTeacher.fullName} — đang đợi Giáo viên cho vào lớp & chờ Admin duyệt mở khóa toàn bộ bài luyện.`
      );
    } else {
      setSuccessMessage(
        `Tạo tài khoản Học sinh thành công (${syncedNewAccount.fullName} · Lớp ${cleanClass} · ${cleanSchool})! Hiện tại bạn có thể làm thử 3 bài đầu tiên trong khi chờ Admin duyệt mở khóa toàn bộ bài luyện.`
      );
    }

    setTimeout(() => {
      setSuccessMessage(null);
      setRegisterStep('form');
      onClose();
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    const cleanEmail = email.trim().toLowerCase();

    // 1. Kiểm tra bắt buộc phải là địa chỉ Gmail (@gmail.com)
    if (!cleanEmail) {
      newErrors.email = 'Vui lòng nhập địa chỉ Gmail (@gmail.com) của bạn (bắt buộc).';
    } else if (!validateEmail(cleanEmail)) {
      newErrors.email =
        'Chỉ chấp nhận địa chỉ Gmail hợp lệ có đuôi @gmail.com (Ví dụ: hocsinh@gmail.com).';
    }

    // 2. Password check (Bắt buộc mật khẩu trên 6 ký tự)
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu (bắt buộc).';
    } else if (!validatePassword(password)) {
      newErrors.password = `Mật khẩu phải trên 6 ký tự (từ 7 ký tự trở lên). Hiện có: ${password.length} ký tự.`;
    }

    // 3. Name, Class, School checks for Register
    if (authMode === 'register') {
      if (!fullName.trim()) {
        newErrors.fullName = 'Vui lòng nhập họ và tên.';
      }
      if (!classNameInput.trim()) {
        newErrors.className = 'Vui lòng nhập tên lớp học (Ví dụ: 4A1, 7B, 10A2).';
      }
      const hasSchoolName = manualSchoolMode
        ? Boolean(manualSchoolName.trim())
        : Boolean(schoolInput.trim());
      if (!hasSchoolName || !provinceInput.trim() || !districtInput.trim()) {
        newErrors.school = 'Vui lòng nhập/chọn trường, tỉnh/thành và phường/xã.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const registeredAccounts = getRegisteredGmailAccounts();
    const matchedAccount = registeredAccounts.find(
      (acc) => acc.email.toLowerCase() === cleanEmail
    );

    // NẾU LÀ TẠO TÀI KHOẢN MỚI:
    // Kiểm tra nghiêm ngặt: 1 tài khoản Gmail chỉ được tạo duy nhất 1 tài khoản!
    if (authMode === 'register') {
      if (cleanEmail === ADMIN_GMAIL) {
        setErrors({
          email: 'Tài khoản Admin chỉ được tạo và quản lý trong Firebase Authentication.',
        });
        return;
      }
      if (matchedAccount) {
        setErrors({
          email: `Mỗi tài khoản Gmail chỉ được tạo duy nhất 1 tài khoản! Địa chỉ Gmail "${cleanEmail}" đã được đăng ký trước đó, không được đăng ký thêm tài khoản nào khác.`,
        });
        return;
      }

      setErrors({});
      setShowSendConfirmModal(true);
      return;
    }

    // Admin đăng nhập bằng Firebase Authentication, không dùng mật khẩu trong localStorage.
    if (cleanEmail === ADMIN_GMAIL) {
      setIsAdminSigningIn(true);
      try {
        const firebaseUser = await signInAdminWithFirebase(cleanEmail, password);
        const adminAccount = createFirebaseAdminAccount(firebaseUser, currentGrade);
        setErrors({});
        refreshRegisteredStudents();
        onSelectGrade(currentGrade);
        onLogin(adminAccount);
        setAuthMode('admin');
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Đăng nhập Admin bằng Firebase thất bại.';
        setErrors({ login: message, password: message });
      } finally {
        setIsAdminSigningIn(false);
      }
      return;
    }

    // Kiểm tra tài khoản đã đăng ký bằng Gmail
    if (!matchedAccount || matchedAccount.verifiedByGmail !== true) {
      setErrors({
        login: `Tài khoản Gmail "${cleanEmail}" chưa từng được đăng ký! Chỉ tài khoản đã đăng ký và xác thực mã 6 số qua Gmail mới được phép đăng nhập. Vui lòng chuyển sang mục "Tạo tài khoản mới" để đăng ký trước.`,
        email: 'Gmail này chưa được đăng ký tài khoản trên hệ thống.',
      });
      return;
    }

    if (matchedAccount.password !== password) {
      setErrors({
        login:
          'Mật khẩu không chính xác. Vui lòng nhập đúng mật khẩu của tài khoản Gmail này.',
        password: 'Mật khẩu không chính xác.',
      });
      return;
    }

    // Đăng nhập thành công với đúng tài khoản đã đăng ký bằng Gmail
    setErrors({});
    onSelectGrade(matchedAccount.grade);
    onLogin(matchedAccount);

    setSuccessMessage(
      `Đăng nhập thành công! Chào mừng ${matchedAccount.fullName} (Lớp ${matchedAccount.className || matchedAccount.grade} · ${matchedAccount.school || 'Lớp học Bon Ben'}).`
    );

    setTimeout(() => {
      setSuccessMessage(null);
      setRegisterStep('form');
      onClose();
      const exSection = document.getElementById('exercise-types');
      if (exSection) {
        exSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1200);
  };

  // Lưu thay đổi Lớp & Trường học sau khi đã đăng ký/đăng nhập
  const handleSaveProfileClassAndSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const selectedSchool = schoolDirectory.find((entry) => entry.id === editSchoolId);
    const keepCurrentSchool = editSchoolId === '__current__' && Boolean(currentUser.school);
    if (!editClassName.trim() || (!selectedSchool && !keepCurrentSchool)) {
      setErrors({
        profileEdit: 'Vui lòng chọn trường trong danh mục cấp phép trước khi lưu.',
      });
      return;
    }
    setErrors({});
    const updatedUser: UserAccount = {
      ...currentUser,
      grade: editGrade,
      className: editClassName.trim(),
      school: selectedSchool?.schoolName || currentUser.school,
      schoolLevel: selectedSchool
        ? selectedSchool.schoolLevel === 'all'
          ? getSchoolLevelForGrade(editGrade)
          : selectedSchool.schoolLevel
        : currentUser.schoolLevel,
      provinceOrCity: selectedSchool?.provinceOrCity || currentUser.provinceOrCity,
      district: selectedSchool?.district || currentUser.district,
    };
    onUpdateUser(updatedUser);
    refreshRegisteredStudents();
    setProfileSavedNotice(
      `Đã cập nhật thành công: Khối Lớp ${editGrade} · Lớp ${editClassName.trim()} · Trường ${updatedUser.school || ''}`
    );
    setTimeout(() => {
      setProfileSavedNotice(null);
    }, 3500);
  };

  // ADMIN ACTION: Đổi mật khẩu của tài khoản đã đăng ký
  const handleAdminChangeStudentPassword = (studentEmail: string) => {
    if (!validatePassword(newStudentPassword)) {
      setErrors({
        adminPwd: 'Mật khẩu mới phải trên 6 ký tự (từ 7 ký tự trở lên).',
      });
      return;
    }
    setErrors({});
    const list = getRegisteredGmailAccounts();
    const updatedList = list.map((acc) =>
      acc.email.toLowerCase() === studentEmail.toLowerCase()
        ? { ...acc, password: newStudentPassword }
        : acc
    );
    localStorage.setItem('bonben_registered_accounts', JSON.stringify(updatedList));
    setRegisteredStudents(updatedList);
    setEditingPasswordEmail(null);
    setNewStudentPassword('');
    setAdminActionBanner(
      `✅ Đã đổi mật khẩu thành công cho tài khoản: ${studentEmail}`
    );
    setTimeout(() => setAdminActionBanner(null), 4000);
  };

  // ADMIN ACTION: Đổi Lớp & Trường của bất kỳ tài khoản nào đã đăng ký
  const handleAdminChangeStudentClassSchool = (studentEmail: string) => {
    if (!adminEditClass.trim() || !adminEditSchool.trim()) {
      setErrors({
        adminEditInfo: 'Vui lòng nhập đủ Lớp và Trường học.',
      });
      return;
    }
    setErrors({});
    const list = getRegisteredGmailAccounts();
    const updatedList = list.map((acc) =>
      acc.email.toLowerCase() === studentEmail.toLowerCase()
        ? {
            ...acc,
            grade: adminEditGrade,
            className: adminEditClass.trim(),
            school: adminEditSchool.trim(),
          }
        : acc
    );
    localStorage.setItem('bonben_registered_accounts', JSON.stringify(updatedList));
    setRegisteredStudents(updatedList);
    setEditingInfoEmail(null);
    setAdminActionBanner(
      `✅ Đã cập nhật Lớp (${adminEditClass.trim()}) & Trường (${adminEditSchool.trim()}) cho tài khoản: ${studentEmail}`
    );
    setTimeout(() => setAdminActionBanner(null), 4000);
  };

  // ADMIN ACTION: Xóa tài khoản đã đăng ký
  const handleAdminDeleteStudentAccount = (studentEmail: string) => {
    const list = getRegisteredGmailAccounts();
    const target = list.find((a) => a.email.toLowerCase() === studentEmail.toLowerCase());
    const updatedList = list.filter(
      (acc) => acc.email.toLowerCase() !== studentEmail.toLowerCase()
    );
    localStorage.setItem('bonben_registered_accounts', JSON.stringify(updatedList));
    setRegisteredStudents(updatedList);
    setDeletingEmailConfirm(null);
    setAdminActionBanner(
      `🗑️ Đã xóa tài khoản "${target?.fullName || studentEmail}" (${studentEmail}) khỏi hệ thống.`
    );
    setTimeout(() => setAdminActionBanner(null), 4000);
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpDigits.join('');
    if (enteredCode.length < 6) {
      setErrors({
        otp: 'Vui lòng nhập đủ 6 chữ số xác thực đã được gửi vào hộp thư Gmail của bạn.',
      });
      return;
    }
    if (!generatedOtp || enteredCode !== generatedOtp) {
      setErrors({
        otp: 'Mã xác thực 6 số không chính xác. Vui lòng mở hộp thư Gmail để kiểm tra lại mã 6 số!',
      });
      return;
    }
    setErrors({});
    completeRegistrationAfterGmailOtp();
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/[^0-9]/g, '');
    if (!cleanVal) {
      const next = [...otpDigits];
      next[index] = '';
      setOtpDigits(next);
      return;
    }

    if (cleanVal.length > 1) {
      const chars = cleanVal.slice(0, 6).split('');
      const next = [...otpDigits];
      chars.forEach((ch, i) => {
        if (index + i < 6) next[index + i] = ch;
      });
      setOtpDigits(next);
      const focusIdx = Math.min(index + chars.length, 5);
      otpInputRefs.current[focusIdx]?.focus();
      setErrors({});
      return;
    }

    const next = [...otpDigits];
    next[index] = cleanVal;
    setOtpDigits(next);
    setErrors({});

    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const filteredAdminStudents = registeredStudents.filter((st) => {
    if (!adminSearch.trim()) return true;
    const q = adminSearch.toLowerCase();
    return (
      st.fullName.toLowerCase().includes(q) ||
      st.email.toLowerCase().includes(q) ||
      (st.school || '').toLowerCase().includes(q) ||
      (st.className || '').toLowerCase().includes(q) ||
      `lớp ${st.grade}`.includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-sky-200 max-w-2xl w-full overflow-hidden relative flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-blue-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden border border-sky-400 bg-sky-800 p-0.5 shrink-0">
              <img
                src={getConfiguredMascotImage(MASCOT_IMAGE)}
                onError={(event) => {
                  event.currentTarget.src = MASCOT_IMAGE;
                }}
                alt="Bon Ben"
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                  LỚP HỌC BON BEN
                </span>
                <span className="bg-sky-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded">
                  1 GMAIL = 1 TÀI KHOẢN DUY NHẤT
                </span>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight mt-0.5">
                {authMode === 'register'
                  ? registerStep === 'verify-otp'
                    ? 'Nhập Mã 6 Số Đã Gửi Về Gmail'
                    : 'Đăng Ký Tài Khoản Mới (Gmail · Lớp · Trường)'
                  : authMode === 'login'
                  ? 'Đăng Nhập Tài Khoản'
                  : authMode === 'forgot-password'
                  ? forgotStep === 'verify-otp'
                    ? 'Nhập Mã 6 Số Từ Gmail & Đặt Mật Khẩu Mới'
                    : 'Quên Mật Khẩu · Nhận Mã 6 Số Qua Gmail'
                  : authMode === 'admin'
                  ? 'Quản Lý Toàn Bộ Hệ Thống & Tài Khoản Đã Đăng Ký'
                  : 'Hồ Sơ Tài Khoản · Đổi Lớp & Trường'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-sky-200 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1">
          {/* Top Mode Tabs */}
          <div className="flex flex-wrap bg-sky-50 p-1 rounded-2xl border border-sky-100 mb-5 gap-1">
            {!currentUser && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setRegisterStep('form');
                    setErrors({});
                  }}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-sky-900'
                  }`}
                >
                  Tạo tài khoản mới
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setRegisterStep('form');
                    setErrors({});
                  }}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-sky-900'
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('forgot-password');
                    setForgotStep('request');
                    setForgotEmail(email || '');
                    setErrors({});
                  }}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    authMode === 'forgot-password'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-amber-800 hover:text-amber-950'
                  }`}
                >
                  Quên mật khẩu
                </button>
              </>
            )}

            {currentUser && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('profile');
                    setRegisterStep('form');
                    setErrors({});
                  }}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    authMode === 'profile'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-sky-900'
                  }`}
                >
                  Hồ sơ · Đổi Lớp & Trường ({currentUser.fullName.split(' ')[0]})
                </button>
                {isAdminUser && (
                  <button
                    type="button"
                    onClick={() => {
                      refreshRegisteredStudents();
                      setAuthMode('admin');
                      setErrors({});
                    }}
                    className={`flex-1 py-2 px-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                      authMode === 'admin'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-amber-800 bg-amber-100/60 hover:bg-amber-100'
                    }`}
                  >
                    Quản lý tài khoản đã đăng ký ({registeredStudents.length})
                  </button>
                )}
              </>
            )}
          </div>

          {/* Auto-email flow without Google linking */}
          {!successMessage && (authMode === 'register' || authMode === 'forgot-password') && (
            <div className="mb-5 p-3.5 rounded-2xl border border-sky-200 bg-sky-50/70 flex items-start sm:items-center justify-between gap-3">
              <div className="text-xs">
                <div className="flex items-center gap-1.5 font-extrabold text-sky-950">
                  <Mail className="w-3.5 h-3.5 text-sky-600" />
                  <span>Gửi mã xác thực về Gmail đã đăng ký</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Hệ thống sẽ tự đọc địa chỉ Gmail đã đăng ký và gửi mã xác thực qua hộp thư đó, không cần liên kết Google.
                </p>
              </div>

              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã sẵn sàng</span>
              </span>
            </div>
          )}

          {errors.gmail && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs text-red-600 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.gmail}</span>
              </p>
            </div>
          )}

          {/* Success Message Banner */}
          {successMessage && (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg ring-4 ring-emerald-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-extrabold text-slate-900">{successMessage}</h4>
              <p className="text-xs text-slate-500">
                Đang chuyển đến khu vực luyện tập...
              </p>
            </div>
          )}

          {/* VIEW: ADMIN MANAGEMENT DASHBOARD (Automatically shown when logged in with bonbenemail@gmail.com) */}
          {!successMessage && authMode === 'admin' && isAdminUser && (
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-gradient-to-r from-amber-50 via-sky-50 to-white p-4 rounded-2xl border border-amber-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-sky-700 text-white flex items-center justify-center font-black text-lg shadow-xs shrink-0">
                    B
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      Quản Trị Hệ Thống Lớp Học Bon Ben
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Quản lý toàn bộ tài khoản đã đăng ký · Có thể <strong>Đổi mật khẩu</strong>, <strong>Sửa Lớp & Trường</strong> và <strong>Xóa tài khoản</strong>.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 self-start sm:self-center"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>

              {adminActionBanner && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{adminActionBanner}</span>
                </div>
              )}

              {/* Separated Approval Tabs for Admin inside Modal */}
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setAdminSubTab('pending-students')}
                  className={`py-2 px-2.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                    adminSubTab === 'pending-students'
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  1. Duyệt HS Làm Bài ({registeredStudents.filter((s) => s.role === 'student' && !s.canPracticeAll).length} chờ)
                </button>
                <button
                  type="button"
                  onClick={() => setAdminSubTab('pending-teachers')}
                  className={`py-2 px-2.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                    adminSubTab === 'pending-teachers'
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  2. Duyệt Giáo Viên ({registeredStudents.filter((s) => s.role === 'teacher' && s.teacherApprovalStatus !== 'approved').length} chờ)
                </button>
                <button
                  type="button"
                  onClick={() => setAdminSubTab('all')}
                  className={`py-2 px-2.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                    adminSubTab === 'all'
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  3. Tất Cả TK ({registeredStudents.length})
                </button>
              </div>

              {/* Search & Count Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
                  <Users className="w-4 h-4 text-sky-600" />
                  <span>
                    {adminSubTab === 'pending-students'
                      ? 'Duyệt cho phép Học sinh làm bài luyện & bài thi'
                      : adminSubTab === 'pending-teachers'
                        ? 'Xét duyệt tài khoản Giáo viên đăng ký'
                        : `Toàn bộ tài khoản (${registeredStudents.length})`}
                  </span>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Tìm theo tên, Gmail, lớp, trường..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Student List */}
              {filteredAdminStudents.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Users className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">
                    {registeredStudents.length === 0
                      ? 'Chưa có tài khoản nào đăng ký trên hệ thống.'
                      : 'Không tìm thấy tài khoản phù hợp với từ khóa tìm kiếm.'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Khi người dùng đăng ký bằng Gmail và xác thực mã 6 số, tài khoản sẽ xuất hiện tại đây để bạn quản lý.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[42vh] overflow-y-auto pr-1">
                  {filteredAdminStudents
                    .filter((st) => {
                      if (adminSubTab === 'pending-students') return st.role === 'student';
                      if (adminSubTab === 'pending-teachers') return st.role === 'teacher';
                      return true;
                    })
                    .map((st) => {
                    const isEditingPwd = editingPasswordEmail === st.email;
                    const isEditingInfo = editingInfoEmail === st.email;
                    const isDeleting = deletingEmailConfirm === st.email;
                    const isPwdVisible = !!visiblePasswords[st.email];

                    return (
                      <div
                        key={st.email}
                        className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-sky-300 transition-all shadow-2xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                                  st.role === 'teacher'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-sky-100 text-sky-800'
                                }`}
                              >
                                {st.role === 'teacher' ? 'GIÁO VIÊN' : 'HỌC SINH'}
                              </span>
                              <span className="font-extrabold text-slate-900 text-sm">
                                {st.fullName}
                              </span>
                              <span className="bg-sky-50 text-sky-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-sky-200">
                                Khối {st.grade} · Lớp {st.className || `${st.grade}A1`}
                              </span>
                            </div>
                            <div className="text-xs text-sky-700 font-semibold mt-0.5">
                              📧 {st.email} · 🏫 Trường: <strong>{st.school || 'Chưa cập nhật'}</strong>
                            </div>
                            <div className="text-[11px] mt-1">
                              {st.role === 'teacher' ? (
                                <span
                                  className={`font-extrabold px-2 py-0.5 rounded-full ${
                                    st.teacherApprovalStatus === 'approved'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-900'
                                  }`}
                                >
                                  {st.teacherApprovalStatus === 'approved'
                                    ? '✓ Đã duyệt quyền Giáo viên'
                                    : '⏳ Đang chờ Admin xét duyệt Giáo viên'}
                                </span>
                              ) : (
                                <span
                                  className={`font-extrabold px-2 py-0.5 rounded-full ${
                                    st.canPracticeAll
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-900'
                                  }`}
                                >
                                  {st.canPracticeAll
                                    ? '✓ Đã cho phép làm mọi bài luyện & bài thi'
                                    : '🔒 Không cho phép (Chờ duyệt · Chỉ mở 3 bài đầu)'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons: Duyệt GV / Cho phép HS làm bài, Sửa Lớp/Trường, Đổi mật khẩu & Xóa tài khoản */}
                          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                            {st.role === 'teacher' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const nextStatus =
                                    st.teacherApprovalStatus === 'approved' ? 'pending' : 'approved';
                                  const updated = adminUpdateTeacherApproval(st.email, nextStatus);
                                  setRegisteredStudents(updated);
                                  setAdminActionBanner(
                                    nextStatus === 'approved'
                                      ? `✅ Đã duyệt tài khoản Giáo viên: ${st.fullName}`
                                      : `Đã chuyển Giáo viên ${st.fullName} về trạng thái chờ duyệt.`
                                  );
                                }}
                                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs cursor-pointer ${
                                  st.teacherApprovalStatus === 'approved'
                                    ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                                }`}
                              >
                                {st.teacherApprovalStatus === 'approved'
                                  ? 'Thu hồi duyệt GV'
                                  : '✓ Duyệt Giáo viên'}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  const allow = !st.canPracticeAll;
                                  const updated = adminUpdateStudentPracticePermission(
                                    st.email,
                                    allow
                                  );
                                  setRegisteredStudents(updated);
                                  setAdminActionBanner(
                                    allow
                                      ? `✅ Đã cho phép học sinh ${st.fullName} làm mọi bài luyện & bài thi!`
                                      : `🔒 Đã khóa quyền làm bài của ${st.fullName} (Chỉ mở 3 bài đầu làm thử).`
                                  );
                                }}
                                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs cursor-pointer ${
                                  st.canPracticeAll
                                    ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                                }`}
                              >
                                {st.canPracticeAll
                                  ? 'Không cho phép (Khóa)'
                                  : '✓ Cho phép làm bài'}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingInfoEmail(isEditingInfo ? null : st.email);
                                setAdminEditGrade(st.grade);
                                setAdminEditClass(st.className || `${st.grade}A1`);
                                setAdminEditSchool(st.school || '');
                                setEditingPasswordEmail(null);
                                setDeletingEmailConfirm(null);
                                setErrors({});
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5 text-slate-600" />
                              <span>Sửa Lớp/Trường</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPasswordEmail(isEditingPwd ? null : st.email);
                                setNewStudentPassword(st.password || '');
                                setEditingInfoEmail(null);
                                setDeletingEmailConfirm(null);
                                setErrors({});
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-sky-600" />
                              <span>Đổi mật khẩu</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingEmailConfirm(isDeleting ? null : st.email);
                                setEditingPasswordEmail(null);
                                setEditingInfoEmail(null);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Xóa TK</span>
                            </button>
                          </div>
                        </div>

                        {/* Current Password Display Row */}
                        <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl text-xs border border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-medium">Mật khẩu hiện tại:</span>
                            <code className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {isPwdVisible ? st.password || '(trống)' : '••••••••'}
                            </code>
                            <button
                              type="button"
                              onClick={() =>
                                setVisiblePasswords((prev) => ({
                                  ...prev,
                                  [st.email]: !prev[st.email],
                                }))
                              }
                              className="text-slate-400 hover:text-sky-600 p-0.5 cursor-pointer"
                              title={isPwdVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            >
                              {isPwdVisible ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Đăng ký: {new Date(st.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>

                        {/* Edit Class & School Inline Form */}
                        {isEditingInfo && (
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 animate-in fade-in">
                            <label className="text-[11px] font-extrabold text-slate-800 block">
                              Chỉnh sửa Lớp & Trường cho {st.fullName} ({st.email}):
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <select
                                value={adminEditGrade}
                                onChange={(e) => {
                                  const g = Number(e.target.value) as GradeLevel;
                                  setAdminEditGrade(g);
                                  setAdminEditClass(`${g}A1`);
                                }}
                                className="px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-sky-900"
                              >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                                  <option key={g} value={g}>
                                    Khối {g}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="text"
                                value={adminEditClass}
                                onChange={(e) => setAdminEditClass(e.target.value)}
                                placeholder="Tên lớp (VD: 4A1)"
                                className="px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800"
                              />
                              <input
                                type="text"
                                value={adminEditSchool}
                                onChange={(e) => setAdminEditSchool(e.target.value)}
                                placeholder="Tên trường học"
                                className="px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800"
                              />
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => handleAdminChangeStudentClassSchool(st.email)}
                                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl cursor-pointer"
                              >
                                Lưu Lớp & Trường
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingInfoEmail(null)}
                                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer"
                              >
                                Hủy
                              </button>
                            </div>
                            {errors.adminEditInfo && (
                              <p className="text-[11px] text-red-600 font-bold">
                                {errors.adminEditInfo}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Change Password Inline Form */}
                        {isEditingPwd && (
                          <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-200 space-y-2 animate-in fade-in">
                            <label className="text-[11px] font-extrabold text-sky-950 block">
                              Nhập mật khẩu mới cho {st.fullName} ({st.email}) - Trên 6 ký tự:
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={newStudentPassword}
                                onChange={(e) => setNewStudentPassword(e.target.value)}
                                placeholder="Nhập mật khẩu mới (> 6 ký tự)..."
                                className="flex-1 px-3 py-2 rounded-xl border border-sky-300 bg-white text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                              />
                              <button
                                type="button"
                                onClick={() => handleAdminChangeStudentPassword(st.email)}
                                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-2xs cursor-pointer shrink-0"
                              >
                                Lưu mật khẩu
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingPasswordEmail(null)}
                                className="px-2.5 py-2 bg-white hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer shrink-0"
                              >
                                Hủy
                              </button>
                            </div>
                            {errors.adminPwd && (
                              <p className="text-[11px] text-red-600 font-bold">
                                {errors.adminPwd}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Delete Confirmation Inline Box */}
                        {isDeleting && (
                          <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in">
                            <p className="text-xs text-red-800 font-bold">
                              Xác nhận xóa vĩnh viễn tài khoản <strong>{st.fullName}</strong> ({st.email})?
                            </p>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleAdminDeleteStudentAccount(st.email)}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-lg cursor-pointer"
                              >
                                Xác nhận xóa
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingEmailConfirm(null)}
                                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg border border-slate-200 cursor-pointer"
                              >
                                Không xóa
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW: LOGGED IN PROFILE + SELF-SERVICE CHANGE CLASS & SCHOOL */}
          {!successMessage && authMode === 'profile' && currentUser && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between gap-4 bg-sky-50/80 p-4 rounded-2xl border border-sky-200">
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md shrink-0">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">
                      {currentUser.fullName}
                    </h4>
                    <p className="text-xs text-sky-700 font-semibold">
                      {isAdminUser ? 'Tài khoản Quản trị viên Hệ thống' : `Gmail: ${currentUser.email}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 flex-wrap">
                      <span className="font-bold text-sky-900">
                        Khối {currentUser.grade} · Lớp {currentUser.className || `${currentUser.grade}A1`}
                      </span>
                      <span>·</span>
                      <span>🏫 {currentUser.school || 'Chưa cập nhật trường'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form tự đổi Lớp và Trường sau khi đã đăng ký */}
              <form
                onSubmit={handleSaveProfileClassAndSchool}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-sky-200 shadow-2xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-sky-600" />
                    <h5 className="font-extrabold text-xs sm:text-sm text-slate-900">
                      Tự thay đổi Khối lớp, Tên lớp & Trường học
                    </h5>
                  </div>
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full">
                    Cập nhật tức thì 60 bài luyện
                  </span>
                </div>

                {profileSavedNotice && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{profileSavedNotice}</span>
                  </div>
                )}

                {errors.profileEdit && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.profileEdit}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Cấp học:
                    </label>
                    <select
                      value={editSchoolLevel}
                      onChange={(event) => {
                        const level = event.target.value as GradeSchoolLevel;
                        const grade = getGradesForSchoolLevel(level).includes(editGrade)
                          ? editGrade
                          : getFirstGradeForSchoolLevel(level);
                        setEditSchoolLevel(level);
                        setEditGrade(grade);
                        setEditClassName(`${grade}A1`);
                        setEditProvince('');
                        setEditDistrict('');
                        setEditSchoolId('');
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-sky-900 bg-white"
                    >
                      <option value="elementary">Tiểu học</option>
                      <option value="lower-secondary">THCS</option>
                      <option value="upper-secondary">THPT</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Khối lớp hiện tại:
                    </label>
                    <select
                      value={editGrade}
                      onChange={(e) => {
                        const g = Number(e.target.value) as GradeLevel;
                        setEditGrade(g);
                        setEditClassName(`${g}A1`);
                        setEditSchoolLevel(getSchoolLevelForGrade(g));
                        setEditProvince('');
                        setEditDistrict('');
                        setEditSchoolId('');
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-sky-900 bg-white focus:ring-2 focus:ring-sky-500"
                    >
                      {getGradesForSchoolLevel(editSchoolLevel).map((g) => (
                        <option key={g} value={g}>
                          Khối Lớp {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Tên lớp cụ thể (VD: {editGrade}A1, {editGrade}B):
                    </label>
                    <input
                      type="text"
                      required
                      value={editClassName}
                      onChange={(e) => setEditClassName(e.target.value)}
                      placeholder={`Ví dụ: ${editGrade}A1`}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tỉnh/thành → phường/xã → trường:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select
                      required
                      value={editProvince}
                      onChange={(event) => {
                        setEditProvince(event.target.value);
                        setEditDistrict('');
                        setEditSchoolId('');
                      }}
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                    >
                      <option value="">Chọn tỉnh/thành</option>
                      {editSchoolId === '__current__' &&
                        currentUser.provinceOrCity &&
                        !VIETNAM_ADMIN_UNITS.some((province) => province.name === currentUser.provinceOrCity) &&
                        !schoolDirectory.some(
                          (entry) =>
                            (entry.schoolLevel === editSchoolLevel || entry.schoolLevel === 'all') &&
                            entry.provinceOrCity === currentUser.provinceOrCity
                        ) && (
                          <option value={currentUser.provinceOrCity}>
                            {currentUser.provinceOrCity} (hiện tại)
                          </option>
                        )}
                      {VIETNAM_ADMIN_UNITS.map((province) => (
                        <option key={province.code} value={province.name}>{province.name}</option>
                      ))}
                    </select>
                    <select
                      required
                      value={editDistrict}
                      disabled={!editProvince}
                      onChange={(event) => {
                        setEditDistrict(event.target.value);
                        setEditSchoolId('');
                      }}
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white disabled:bg-slate-100"
                    >
                      <option value="">Chọn phường/xã/đặc khu</option>
                      {editSchoolId === '__current__' &&
                        currentUser.district &&
                        !profileProvince?.wards.some((ward) => ward.name === currentUser.district) && (
                          <option value={currentUser.district}>
                            {currentUser.district} (hiện tại)
                          </option>
                        )}
                      {profileProvince?.wards.map((ward) => (
                        <option key={ward.code} value={ward.name}>{ward.name}</option>
                      ))}
                    </select>
                    <select
                      required
                      value={editSchoolId}
                      disabled={!editDistrict}
                      onChange={(event) => setEditSchoolId(event.target.value)}
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white disabled:bg-slate-100"
                    >
                      <option value="">Chọn trường</option>
                      {editSchoolId === '__current__' && currentUser.school && (
                        <option value="__current__">{currentUser.school} (trường hiện tại)</option>
                      )}
                      {profileSchools.map((entry) => (
                          <option key={entry.id} value={entry.id}>{entry.schoolName}</option>
                      ))}
                    </select>
                  </div>
                  {editDistrict && profileSchools.length === 0 && (
                    <p className="mt-1 text-[11px] text-amber-700">
                      Chưa có trường trong xã này ở danh mục dữ liệu hiện có. Không hiển thị trường của xã khác; hãy nhờ Admin bổ sung trường còn thiếu.
                    </p>
                  )}
                  <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                    Danh sách nền từ OpenStreetMap chỉ gồm trường có địa chỉ khớp dữ liệu hiện hành nên chưa đầy đủ.{' '}
                    <a
                      href="https://www.openstreetmap.org/copyright"
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      © OpenStreetMap contributors (ODbL)
                    </a>
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi Lớp & Trường học</span>
                </button>
              </form>

              <div className="flex gap-3 pt-1">
                {isAdminUser && (
                  <button
                    type="button"
                    onClick={() => {
                      refreshRegisteredStudents();
                      setAuthMode('admin');
                    }}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Users className="w-4 h-4" />
                    <span>Quản lý tài khoản đã đăng ký</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất tài khoản</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW: STEP 2 - VERIFY 6-DIGIT EMAIL OTP SENT TO GMAIL INBOX (NO CODE DISPLAYED ON WEB) */}
          {!successMessage && authMode === 'register' && registerStep === 'verify-otp' && (
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-5 animate-in fade-in">
              <div className="bg-gradient-to-br from-sky-50 via-blue-50/70 to-white p-5 rounded-2xl border-2 border-sky-300 shadow-xs space-y-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center mx-auto shadow-sm">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{otpSentNotice || `Đã gửi thư tới ${email.trim().toLowerCase()}`}</span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Vui lòng mở hộp thư Gmail để lấy mã 6 số
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                  <strong className="text-sky-800">Hệ thống Lớp học Bon Ben</strong> vừa gửi một email chứa{' '}
                  <strong>mã xác thực 6 chữ số</strong> đến hộp thư{' '}
                  <strong className="text-sky-800">{email.trim().toLowerCase()}</strong> của bạn. Hãy kiểm tra Hộp thư đến và nhập 6 số đó vào bên dưới:
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black font-mono rounded-2xl border-2 transition-all focus:outline-none focus:ring-3 ${
                      errors.otp
                        ? 'border-red-400 bg-red-50/40 text-red-700 focus:ring-red-200'
                        : digit
                        ? 'border-sky-600 bg-sky-50/60 text-sky-900 focus:ring-sky-200 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-800 focus:border-sky-500 focus:ring-sky-100'
                    }`}
                  />
                ))}
              </div>

              {errors.otp && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                  <p className="text-xs text-red-600 font-bold flex items-center justify-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.otp}</span>
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setRegisterStep('form');
                    setErrors({});
                  }}
                  className="text-slate-600 hover:text-sky-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại sửa thông tin / Gmail</span>
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0 || isSendingEmail}
                  onClick={() => setShowSendConfirmModal(true)}
                  className={`font-bold flex items-center gap-1.5 ${
                    resendTimer > 0 || isSendingEmail
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-sky-600 hover:text-sky-800 cursor-pointer'
                  }`}
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      resendTimer > 0 ? '' : 'hover:rotate-180 transition-transform'
                    }`}
                  />
                  <span>
                    {resendTimer > 0
                      ? `Gửi lại mã sau (${resendTimer}s)`
                      : 'Gửi lại mã 6 số mới qua Gmail'}
                  </span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-sky-600/25 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Xác nhận mã 6 số & Hoàn tất tạo tài khoản Lớp {classNameInput || selectedGrade}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* VIEW: REGISTER & LOGIN FORMS (No Admin/Student labels or role switchers shown) */}
          {!successMessage &&
            ((authMode === 'register' && registerStep === 'form') || authMode === 'login') && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.login && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 space-y-2">
                    <p className="text-xs text-red-600 font-bold flex items-start gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errors.login}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setRegisterStep('form');
                        setErrors({});
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-extrabold text-white bg-sky-600 hover:bg-sky-700 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      <span>Chuyển sang Tạo tài khoản mới bằng Gmail</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Chọn loại tài khoản khi Đăng ký: Học sinh hoặc Giáo viên */}
                {authMode === 'register' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Bạn đăng ký tài khoản dành cho: <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setRegisterAccountType('student')}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          registerAccountType === 'student'
                            ? 'bg-sky-50 border-sky-600 ring-2 ring-sky-500/20'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-sky-950">
                            🎒 Tài khoản Học sinh
                          </span>
                          {registerAccountType === 'student' && (
                            <span className="text-[10px] font-black bg-sky-600 text-white px-2 py-0.5 rounded-full">
                              Đang chọn
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          Điền Lớp & Trường đang học. Nếu trùng Lớp & Trường với Giáo viên đã đăng ký sẽ đợi Giáo viên duyệt vào lớp.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegisterAccountType('teacher')}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          registerAccountType === 'teacher'
                            ? 'bg-purple-50 border-purple-600 ring-2 ring-purple-500/20'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-purple-950">
                            👩‍🏫 Tài khoản Giáo viên
                          </span>
                          {registerAccountType === 'teacher' && (
                            <span className="text-[10px] font-black bg-purple-600 text-white px-2 py-0.5 rounded-full">
                              Đang chọn
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          Điền Lớp & Trường đang dạy (cần Admin xét duyệt). Tự tạo bài tập, duyệt học sinh vào lớp & xem học sinh làm bài.
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Full Name (For Register) */}
                {authMode === 'register' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {registerAccountType === 'teacher' ? 'Họ và tên Giáo viên:' : 'Họ và tên Học sinh:'}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder={
                          registerAccountType === 'teacher'
                            ? 'Ví dụ: Cô Nguyễn Thị Lan / Thầy Trần Minh'
                            : 'Ví dụ: Nguyễn Ben Bon'
                        }
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.fullName}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* 1. Email field (Bắt buộc phải là địa chỉ Gmail @gmail.com, 1 Gmail = 1 tài khoản duy nhất) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Địa chỉ Gmail (@gmail.com): <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-sky-600 font-semibold">
                      {authMode === 'register'
                        ? 'Mỗi Gmail chỉ tạo được 1 tài khoản duy nhất'
                        : 'Nhập Gmail đã đăng ký'}
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="Ví dụ: tenban@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-sky-500 font-medium text-slate-800 ${
                        errors.email ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {errors.email ? (
                    <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  ) : (
                    email &&
                    validateEmail(email) && (
                      <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>
                          {authMode === 'register'
                            ? 'Địa chỉ Gmail hợp lệ (Sẵn sàng nhận mã xác thực 6 số)'
                            : 'Định dạng Gmail hợp lệ'}
                        </span>
                      </p>
                    )
                  )}
                </div>

                {/* 2. Mật khẩu field (Bắt buộc mật khẩu trên 6 ký tự) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Mật khẩu: <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold ${
                          password.length > 6 ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {password.length > 6
                          ? '✓ Đã trên 6 ký tự'
                          : `${password.length} ký tự (Cần > 6 ký tự)`}
                      </span>
                      {authMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('forgot-password');
                            setForgotStep('request');
                            setForgotEmail(email || '');
                            setErrors({});
                          }}
                          className="text-[11px] font-extrabold text-amber-600 hover:text-amber-700 underline cursor-pointer"
                        >
                          Quên mật khẩu?
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Mật khẩu bảo mật (Trên 6 ký tự)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-sky-500 font-medium text-slate-800 ${
                        errors.password ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.password}</span>
                    </p>
                  )}
                </div>

                {/* 3. Phần Lớp (Khối lớp + Tên lớp) & Trường học khi Đăng ký */}
                {authMode === 'register' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Cấp trường:
                        </label>
                        <select
                          value={schoolLevelInput}
                          onChange={(event) =>
                            handleSchoolLevelChange(
                              event.target.value as GradeSchoolLevel
                            )
                          }
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-sky-900 bg-white"
                        >
                          <option value="elementary">Tiểu học</option>
                          <option value="lower-secondary">THCS</option>
                          <option value="upper-secondary">THPT</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          {registerAccountType === 'teacher'
                            ? 'Khối lớp đang dạy:'
                            : 'Chọn Khối lớp đang học:'}{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <select
                            value={selectedGrade}
                            onChange={(e) =>
                              handleGradeChange(Number(e.target.value) as GradeLevel)
                            }
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-sky-900 bg-white focus:ring-2 focus:ring-sky-500"
                          >
                            {getGradesForSchoolLevel(schoolLevelInput).map((g) => (
                              <option key={g} value={g}>
                                Lớp {g}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          {registerAccountType === 'teacher'
                            ? 'Tên lớp đang dạy:'
                            : 'Tên lớp cụ thể đang học:'}{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            placeholder={`Ví dụ: ${selectedGrade}A1, ${selectedGrade}B...`}
                            value={classNameInput}
                            onChange={(e) => setClassNameInput(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500"
                          />
                        </div>
                        {errors.className && (
                          <p className="text-[11px] text-red-500 font-semibold mt-1">
                            {errors.className}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          {registerAccountType === 'teacher'
                            ? 'Trường đang dạy:'
                            : 'Trường đang học:'}{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] text-slate-500">
                          {registerAccountType === 'teacher'
                            ? 'Học sinh trùng Lớp & Trường sẽ đợi bạn duyệt vào lớp'
                            : 'Có thể tự đổi Lớp & Trường sau khi đăng ký'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mb-2">
                        Danh mục hành chính hiện hành được chọn theo từng tỉnh/thành; danh sách trường sử dụng dữ liệu đã nạp vào hệ thống.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <select
                          required
                          value={provinceInput}
                          onChange={(e) => {
                            setProvinceInput(e.target.value);
                            setDistrictInput('');
                            setSchoolInput('');
                            setManualSchoolName('');
                            setIsManualSchool(false);
                          }}
                          className={`px-3 py-2.5 rounded-xl border text-xs font-medium bg-white ${
                            errors.school ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                          }`}
                        >
                          <option value="">Chọn tỉnh/thành</option>
                          {VIETNAM_ADMIN_UNITS.map((province) => (
                            <option key={province.code} value={province.name}>{province.name}</option>
                          ))}
                        </select>
                        <select
                          required
                          value={districtInput}
                          disabled={!provinceInput}
                          onChange={(e) => {
                            setDistrictInput(e.target.value);
                            setSchoolInput('');
                            setManualSchoolName('');
                            setIsManualSchool(false);
                          }}
                          className={`px-3 py-2.5 rounded-xl border text-xs font-medium bg-white disabled:bg-slate-100 ${
                            errors.school ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                          }`}
                        >
                          <option value="">Chọn phường/xã/đặc khu</option>
                          {registrationProvince?.wards.map((ward) => (
                            <option key={ward.code} value={ward.name}>{ward.name}</option>
                          ))}
                        </select>
                        {manualSchoolMode ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              required
                              value={manualSchoolName}
                              onChange={(event) => setManualSchoolName(event.target.value)}
                              onBlur={(event) =>
                                setManualSchoolName(formatSchoolName(event.target.value))
                              }
                              placeholder="Tên riêng trường (VD: ABC)"
                              aria-label="Nhập tên trường còn thiếu"
                              className={`w-full px-3 py-2.5 rounded-xl border text-xs font-medium bg-white ${
                                errors.school ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                              }`}
                            />
                            {registrationSchools.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setIsManualSchool(false)}
                                className="text-[11px] text-sky-700 font-semibold underline"
                              >
                                Chọn trường trong danh sách
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <select
                              required
                              value={schoolInput}
                              disabled={!districtInput}
                              onChange={(event) => setSchoolInput(event.target.value)}
                              className={`w-full px-3 py-2.5 rounded-xl border text-xs font-medium bg-white disabled:bg-slate-100 ${
                                errors.school ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                              }`}
                            >
                              <option value="">{districtInput ? 'Chọn trường' : 'Chọn phường/xã trước'}</option>
                              {registrationSchools.map((entry) => (
                              <option key={entry.id} value={entry.schoolName}>{entry.schoolName}</option>
                              ))}
                            </select>
                            {districtInput && (
                              <button
                                type="button"
                                onClick={() => setIsManualSchool(true)}
                                className="text-[11px] text-sky-700 font-semibold underline"
                              >
                                Trường chưa có trong danh sách? Nhập tên
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      {districtInput && registrationSchools.length === 0 && (
                        <p className="text-[11px] text-amber-700 mt-2">
                          Xã này chưa có trường trong danh mục. Nhập tên trường ở ô phía trên; cấp học và địa bàn đã chọn sẽ được lưu cùng tài khoản.
                        </p>
                      )}
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        Danh sách nền từ OpenStreetMap chưa đầy đủ; nếu không thấy trường, hãy liên hệ Admin.{' '}
                        <a
                          href="https://www.openstreetmap.org/copyright"
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                        >
                          © OpenStreetMap contributors (ODbL)
                        </a>
                      </p>
                      {errors.school && (
                        <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.school}</span>
                        </p>
                      )}
                    </div>

                  </>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isAdminSigningIn}
                    className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-70 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-sky-600/25 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
                  >
                    {isAdminSigningIn ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang xác thực Admin với Firebase...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {authMode === 'login'
                            ? 'Đăng nhập'
                            : 'Tạo tài khoản (Gửi mã 6 số về Gmail)'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Security note at bottom of form */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
                  <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Mỗi Gmail chỉ tạo duy nhất 1 tài khoản</span>
                  </div>
                  {authMode === 'login' && (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot-password');
                          setForgotStep('request');
                          setForgotEmail(email || '');
                          setErrors({});
                        }}
                        className="text-amber-600 font-extrabold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Quên mật khẩu?</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('register');
                          setRegisterStep('form');
                          setErrors({});
                        }}
                        className="text-sky-600 font-bold hover:underline cursor-pointer"
                      >
                        Chưa có TK? Đăng ký ngay
                      </button>
                    </div>
                  )}
                </div>
              </form>
            )}

          {/* VIEW: FORGOT PASSWORD - STEP 1 (ENTER REGISTERED GMAIL) */}
          {!successMessage && authMode === 'forgot-password' && forgotStep === 'request' && (
            <form onSubmit={handleForgotRequestSubmit} className="space-y-4 animate-in fade-in">
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-2xs">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    {forgotEmail.trim().toLowerCase() === ADMIN_GMAIL
                      ? 'Đặt lại mật khẩu Admin qua Firebase'
                      : 'Khôi phục mật khẩu bằng mã 6 số gửi về Gmail thật'}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {forgotEmail.trim().toLowerCase() === ADMIN_GMAIL
                      ? 'Firebase sẽ gửi liên kết đặt lại mật khẩu tới hộp thư Admin đã đăng ký trong Firebase Authentication.'
                      : 'Nhập địa chỉ Gmail (@gmail.com) đã đăng ký tài khoản trên Lớp học Bon Ben. Hệ thống sẽ gửi mã xác thực 6 chữ số trực tiếp vào hộp thư để đổi mật khẩu.'}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Địa chỉ Gmail đã đăng ký tài khoản: <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-amber-700 font-bold">
                    {forgotEmail.trim().toLowerCase() === ADMIN_GMAIL
                      ? 'Liên kết do Firebase gửi'
                      : 'Chỉ Gmail đã đăng ký mới nhận được mã'}
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="Nhập Gmail đã đăng ký (VD: tenban@gmail.com)"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      setErrors({});
                    }}
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-amber-500 font-medium text-slate-800 ${
                      errors.forgotEmail ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.forgotEmail && (
                  <div className="mt-2 bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-xs text-red-600 font-bold flex items-start gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errors.forgotEmail}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-1 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrors({});
                  }}
                  className="w-full sm:w-auto px-4 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại Đăng nhập</span>
                </button>
                <button
                  type="submit"
                  className="w-full flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi mã 6 số khôi phục về hộp thư Gmail</span>
                </button>
              </div>
            </form>
          )}

          {/* VIEW: FORGOT PASSWORD - STEP 2 (VERIFY 6-DIGIT OTP FROM GMAIL & SET NEW PASSWORD) */}
          {!successMessage && authMode === 'forgot-password' && forgotStep === 'verify-otp' && (
            <form
              onSubmit={handleForgotVerifyAndResetPassword}
              className="space-y-4 animate-in fade-in"
            >
              <div className="bg-gradient-to-br from-amber-50 via-orange-50/60 to-white p-4 sm:p-5 rounded-2xl border-2 border-amber-300 shadow-xs space-y-2.5 text-center">
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-xs">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {otpSentNotice || `Đã gửi mã 6 số tới ${forgotEmail.trim().toLowerCase()}`}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Nhập mã 6 số gửi về Gmail & Đặt mật khẩu mới
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                  Hãy mở hộp thư Gmail{' '}
                  <strong className="text-sky-800">{forgotEmail.trim().toLowerCase()}</strong> để
                  lấy <strong>mã xác thực 6 chữ số</strong> vừa được gửi từ{' '}
                  <strong className="text-sky-800">Hệ thống Lớp học Bon Ben</strong>:
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block text-center mb-2">
                  Mã xác thực 6 số nhận trong Gmail: <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className={`w-11 h-12 sm:w-12 sm:h-13 text-center text-lg font-black font-mono rounded-2xl border-2 transition-all focus:outline-none focus:ring-3 ${
                        errors.otp
                          ? 'border-red-400 bg-red-50/40 text-red-700 focus:ring-red-200'
                          : digit
                          ? 'border-amber-500 bg-amber-50/60 text-slate-900 focus:ring-amber-200 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-800 focus:border-amber-500 focus:ring-amber-100'
                      }`}
                    />
                  ))}
                </div>
                {errors.otp && (
                  <p className="text-xs text-red-600 font-bold text-center mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.otp}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Mật khẩu mới: <span className="text-red-500">*</span>
                    </label>
                    <span
                      className={`text-[10px] font-bold ${
                        resetNewPassword.length > 6 ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {resetNewPassword.length > 6
                        ? '✓ Trên 6 ký tự'
                        : `${resetNewPassword.length} ký tự (Cần > 6)`}
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      placeholder="Mật khẩu mới (> 6 ký tự)"
                      value={resetNewPassword}
                      onChange={(e) => {
                        setResetNewPassword(e.target.value);
                        setErrors({});
                      }}
                      className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showResetPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nhập lại mật khẩu mới: <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      placeholder="Xác nhận mật khẩu mới"
                      value={resetConfirmPassword}
                      onChange={(e) => {
                        setResetConfirmPassword(e.target.value);
                        setErrors({});
                      }}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {(errors.resetPassword || errors.resetConfirmPassword) && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-2.5">
                  <p className="text-xs text-red-600 font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.resetPassword || errors.resetConfirmPassword}</span>
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setForgotStep('request');
                    setErrors({});
                  }}
                  className="text-slate-600 hover:text-sky-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Đổi địa chỉ Gmail khác</span>
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0 || isSendingEmail}
                  onClick={() => setShowForgotConfirmModal(true)}
                  className={`font-bold flex items-center gap-1.5 ${
                    resendTimer > 0 || isSendingEmail
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-amber-700 hover:text-amber-900 cursor-pointer'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>
                    {resendTimer > 0
                      ? `Gửi lại mã sau (${resendTimer}s)`
                      : 'Gửi lại mã 6 số mới qua Gmail'}
                  </span>
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Xác nhận Mã 6 Số & Đổi Mật Khẩu Mới</span>
              </button>
            </form>
          )}
        </div>

        {/* MANDATORY USER CONFIRMATION DIALOG BEFORE SENDING EMAIL VIA GMAIL API */}
        {showSendConfirmModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl border border-sky-200 shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Xác nhận gửi Email mã 6 số qua Gmail
                  </h4>
                  <p className="text-xs text-slate-500">
                    Xác thực tạo tài khoản duy nhất cho Gmail này
                  </p>
                </div>
              </div>

              <div className="bg-sky-50/80 rounded-2xl p-4 border border-sky-200 text-xs space-y-2">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-medium">Hệ thống gửi:</span>
                  <strong className="text-sky-900 font-bold">Lớp học Bon Ben</strong>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-medium">Người nhận (To):</span>
                  <strong className="text-sky-700 font-bold">{email.trim().toLowerCase()}</strong>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-medium">Họ tên & Lớp:</span>
                  <strong className="text-slate-800">
                    {fullName.trim()} · Lớp {classNameInput || selectedGrade}
                  </strong>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-medium">Trường học:</span>
                  <strong className="text-slate-800 text-right">{registrationSchoolName}</strong>
                </div>
              </div>

              {needsGmailAuth && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                  <p className="font-semibold">
                    Vui lòng nhấn nút bên dưới để đăng nhập Google cấp quyền gửi thư xác thực:
                  </p>
                  <button
                    type="button"
                    onClick={handleGoogleSignInClick}
                    disabled={isSigningInGmail}
                    className="gsi-material-button w-full inline-flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-300 shadow-2xs transition-all cursor-pointer"
                  >
                    <div className="gsi-material-button-state" />
                    <div className="gsi-material-button-content-wrapper flex items-center gap-2">
                      <div className="gsi-material-button-icon w-4 h-4 shrink-0">
                        <svg
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 48 48"
                          className="w-4 h-4 block"
                        >
                          <path
                            fill="#EA4335"
                            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                          />
                          <path
                            fill="#34A853"
                            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                          />
                          <path fill="none" d="M0 0h48v48H0z" />
                        </svg>
                      </div>
                      <span className="gsi-material-button-contents">
                        {isSigningInGmail ? 'Đang kết nối Google...' : 'Sign in with Google'}
                      </span>
                    </div>
                  </button>
                </div>
              )}

              {errors.gmail && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.gmail}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSendingEmail}
                  onClick={() => setShowSendConfirmModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isSendingEmail}
                  onClick={executeSendEmailOtp}
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang gửi về Gmail...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Xác nhận gửi Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MANDATORY USER CONFIRMATION DIALOG BEFORE SENDING PASSWORD RESET OTP VIA GMAIL API */}
        {showForgotConfirmModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl border border-amber-200 shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    {forgotEmail.trim().toLowerCase() === ADMIN_GMAIL
                      ? 'Xác nhận gửi liên kết đặt lại mật khẩu Firebase'
                      : 'Xác nhận gửi Mã 6 Số Khôi Phục Mật Khẩu'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {forgotEmail.trim().toLowerCase() === ADMIN_GMAIL
                      ? 'Firebase gửi liên kết bảo mật tới email Admin'
                      : 'Gửi trực tiếp về hộp thư Gmail đã đăng ký'}
                  </p>
                </div>
              </div>

              <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200 text-xs space-y-2">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-medium">Hệ thống gửi:</span>
                  <strong className="text-sky-900 font-bold">Lớp học Bon Ben</strong>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-medium">
                    {forgotEmail.trim().toLowerCase() === ADMIN_GMAIL
                      ? 'Email nhận liên kết:'
                      : 'Gmail nhận mã (To):'}
                  </span>
                  <strong className="text-amber-800 font-bold">
                    {forgotEmail.trim().toLowerCase()}
                  </strong>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-medium">Mục đích:</span>
                  <strong className="text-slate-800">
                    {forgotEmail.trim().toLowerCase() === ADMIN_GMAIL
                      ? 'Đặt lại mật khẩu bằng Firebase'
                      : 'Đổi lại mật khẩu mới (Mã 6 số)'}
                  </strong>
                </div>
              </div>

              {needsGmailAuth && forgotEmail.trim().toLowerCase() !== ADMIN_GMAIL && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                  <p className="font-semibold">
                    Vui lòng nhấn nút bên dưới để đăng nhập Google cấp quyền gửi thư khôi phục:
                  </p>
                  <button
                    type="button"
                    onClick={handleGoogleSignInClick}
                    disabled={isSigningInGmail}
                    className="gsi-material-button w-full inline-flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-300 shadow-2xs transition-all cursor-pointer"
                  >
                    <div className="gsi-material-button-state" />
                    <div className="gsi-material-button-content-wrapper flex items-center gap-2">
                      <div className="gsi-material-button-icon w-4 h-4 shrink-0">
                        <svg
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 48 48"
                          className="w-4 h-4 block"
                        >
                          <path
                            fill="#EA4335"
                            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                          />
                          <path
                            fill="#34A853"
                            d="M24 48c.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                          />
                          <path fill="none" d="M0 0h48v48H0z" />
                        </svg>
                      </div>
                      <span className="gsi-material-button-contents">
                        {isSigningInGmail ? 'Đang kết nối Google...' : 'Sign in with Google'}
                      </span>
                    </div>
                  </button>
                </div>
              )}

              {errors.gmail && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.gmail}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSendingEmail}
                  onClick={() => setShowForgotConfirmModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isSendingEmail}
                  onClick={executeSendForgotRequest}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang gửi về Gmail...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {forgotEmail.trim().toLowerCase() === ADMIN_GMAIL
                          ? 'Gửi liên kết đặt lại'
                          : 'Gửi mã 6 số ngay'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
