import { getApps, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import type {
  FirebaseUserProfile,
  NotificationDisplayMode,
  SupportTicket,
  UserAccount,
  UserNotification,
} from '../types';
import {
  FIREBASE_ADMIN_EMAIL,
  getFirebaseApp,
  getFirebaseAuth,
} from './firebaseAdminAuth';

const getDb = () => getFirestore(getFirebaseApp());
const getUsersCollection = () => collection(getDb(), 'users');
const getLegacyProfilesCollection = () => collection(getDb(), 'userProfiles');

const getFirebaseErrorCode = (error: unknown): string =>
  error && typeof error === 'object' && 'code' in error ? String(error.code) : '';

export const registerFirebaseUser = async (
  email: string,
  password: string,
  account: UserAccount
): Promise<void> => {
  const auth = getFirebaseAuth();
  const credential = await createUserWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    password
  );
  try {
    await sendEmailVerification(credential.user);
    await updateProfile(credential.user, { displayName: account.fullName });
    await setDoc(
      doc(getUsersCollection(), credential.user.uid),
      userDocumentDataFromAccount(
        { ...account, id: credential.user.uid, firebaseUid: credential.user.uid },
        credential.user.uid,
        credential.user.email || email
      ),
      { merge: true }
    );
  } catch (error) {
    console.error('FIREBASE_REGISTRATION_ERROR:', error);
    try {
      await deleteUser(credential.user);
    } catch (cleanupError) {
      console.error('FIREBASE_REGISTRATION_ROLLBACK_ERROR:', cleanupError);
      throw new Error(
        'Không thể lưu hồ sơ tài khoản lên Firebase và cũng không thể hoàn tác tài khoản vừa tạo. Hãy liên hệ Admin để xử lý trước khi đăng ký lại.'
      );
    } finally {
      await signOut(auth);
    }
    throw error;
  }
  await signOut(auth);
};

export const signInFirebaseUser = async (
  email: string,
  password: string
): Promise<User> => {
  const auth = getFirebaseAuth();
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password
    );
    if (!credential.user.emailVerified) {
      try {
        await sendEmailVerification(credential.user);
      } finally {
        await signOut(auth);
      }
      throw new Error(
        'Email chưa được xác minh bằng Firebase. Hệ thống đã gửi liên kết xác minh mới; hãy mở email rồi đăng nhập lại.'
      );
    }
    return credential.user;
  } catch (error) {
    if (error instanceof Error && error.message.includes('chưa được xác minh')) {
      throw error;
    }
    const code = getFirebaseErrorCode(error);
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
      throw new Error('Email hoặc mật khẩu không chính xác.');
    }
    if (code === 'auth/user-not-found') {
      throw new Error('FIREBASE_USER_NOT_FOUND');
    }
    if (code === 'auth/too-many-requests') {
      throw new Error('Firebase tạm khóa đăng nhập do quá nhiều lần thử. Hãy thử lại sau.');
    }
    throw error;
  }
};

export const sendFirebaseUserPasswordReset = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(getFirebaseAuth(), email.trim().toLowerCase());
};

const profileFromSnapshot = (
  uid: string,
  data: Record<string, unknown>
): FirebaseUserProfile | null => {
  const role = data.role;
  const gradeValue = Number(data.grade);
  if (
    typeof data.email !== 'string' ||
    (role !== 'student' &&
      role !== 'teacher' &&
      role !== 'school' &&
      role !== 'parent' &&
      role !== 'admin')
  ) {
    return null;
  }
  const displayName =
    (typeof data.displayName === 'string' && data.displayName.trim()) ||
    (typeof data.fullName === 'string' && data.fullName.trim()) ||
    data.email;
  const grade =
    Number.isInteger(gradeValue) && gradeValue >= 1 && gradeValue <= 12
      ? gradeValue
      : 4;
  const createdAtValue = data.createdAt;
  const createdAt =
    typeof createdAtValue === 'string'
      ? createdAtValue
      : createdAtValue &&
          typeof createdAtValue === 'object' &&
          'toDate' in createdAtValue &&
          typeof createdAtValue.toDate === 'function'
        ? createdAtValue.toDate().toISOString()
        : new Date(0).toISOString();
  return {
    uid,
    email: data.email,
    fullName: displayName,
    displayName,
    role,
    disabled: data.disabled === true,
    grade: grade as UserAccount['grade'],
    phone: typeof data.phone === 'string' ? data.phone : undefined,
    avatar: typeof data.avatar === 'string' ? data.avatar : undefined,
    className: typeof data.className === 'string' ? data.className : undefined,
    school: typeof data.school === 'string' ? data.school : undefined,
    schoolLevel:
      data.schoolLevel === 'elementary' ||
      data.schoolLevel === 'lower-secondary' ||
      data.schoolLevel === 'upper-secondary'
        ? data.schoolLevel
        : undefined,
    provinceOrCity: typeof data.provinceOrCity === 'string' ? data.provinceOrCity : undefined,
    district: typeof data.district === 'string' ? data.district : undefined,
    studentCode: typeof data.studentCode === 'string' ? data.studentCode : undefined,
    canPracticeAll: data.canPracticeAll === true,
    practiceApprovalStatus:
      data.practiceApprovalStatus === 'approved' ||
      data.practiceApprovalStatus === 'blocked' ||
      data.practiceApprovalStatus === 'pending'
        ? data.practiceApprovalStatus
        : 'pending',
    teacherApprovalStatus:
      data.teacherApprovalStatus === 'approved' ||
      data.teacherApprovalStatus === 'rejected' ||
      data.teacherApprovalStatus === 'pending'
        ? data.teacherApprovalStatus
        : role === 'teacher'
          ? 'pending'
          : undefined,
    teacherClassStatus:
      data.teacherClassStatus === 'pending' ||
      data.teacherClassStatus === 'approved' ||
      data.teacherClassStatus === 'rejected' ||
      data.teacherClassStatus === 'none'
        ? data.teacherClassStatus
        : undefined,
    matchedTeacherEmail:
      typeof data.matchedTeacherEmail === 'string' ? data.matchedTeacherEmail : undefined,
    matchedTeacherName:
      typeof data.matchedTeacherName === 'string' ? data.matchedTeacherName : undefined,
    diamonds: typeof data.diamonds === 'number' ? data.diamonds : 0,
    level: typeof data.level === 'number' ? data.level : 1,
    selectedExerciseTypes: Array.isArray(data.selectedExerciseTypes)
      ? data.selectedExerciseTypes.filter((value): value is string => typeof value === 'string')
      : [],
    createdAt,
  };
};

export const firebaseProfileToUserAccount = (
  profile: FirebaseUserProfile
): UserAccount => ({
  id: profile.uid,
  firebaseUid: profile.uid,
  fullName: profile.fullName,
  email: profile.email,
  grade: profile.grade,
  phone: profile.phone,
  avatar: profile.avatar,
  className: profile.className,
  school: profile.school,
  schoolLevel: profile.schoolLevel,
  provinceOrCity: profile.provinceOrCity,
  district: profile.district,
  role: profile.role,
  disabled: profile.disabled,
  canPracticeAll: profile.canPracticeAll,
  practiceApprovalStatus: profile.practiceApprovalStatus,
  teacherApprovalStatus: profile.teacherApprovalStatus,
  teacherClassStatus: profile.teacherClassStatus,
  matchedTeacherEmail: profile.matchedTeacherEmail,
  matchedTeacherName: profile.matchedTeacherName,
  diamonds: profile.diamonds || 0,
  level: profile.level || 1,
  studentCode: profile.studentCode || `HS-${profile.grade}A1`,
  selectedExerciseTypes: profile.selectedExerciseTypes || [],
  createdAt: profile.createdAt,
});

const profileDataFromAccount = (
  account: UserAccount,
  email = account.email
): Omit<FirebaseUserProfile, 'uid'> => {
  return {
    email: email.trim().toLowerCase(),
    fullName: account.fullName,
    displayName: account.fullName,
    role: account.role,
    ...(account.disabled ? { disabled: true } : {}),
    grade: account.grade,
    ...(account.phone ? { phone: account.phone } : {}),
    ...(account.avatar ? { avatar: account.avatar } : {}),
    className: account.className || '',
    school: account.school || '',
    ...(account.schoolLevel ? { schoolLevel: account.schoolLevel } : {}),
    provinceOrCity: account.provinceOrCity || '',
    district: account.district || '',
    studentCode: account.studentCode,
    canPracticeAll: account.canPracticeAll === true,
    practiceApprovalStatus:
      account.practiceApprovalStatus ||
      (account.canPracticeAll === true ? 'approved' : 'pending'),
    ...(account.role === 'teacher'
      ? { teacherApprovalStatus: account.teacherApprovalStatus || 'pending' }
      : {}),
    ...(account.teacherClassStatus ? { teacherClassStatus: account.teacherClassStatus } : {}),
    ...(account.matchedTeacherEmail ? { matchedTeacherEmail: account.matchedTeacherEmail } : {}),
    ...(account.matchedTeacherName ? { matchedTeacherName: account.matchedTeacherName } : {}),
    diamonds: account.diamonds,
    level: account.level,
    ...(account.selectedExerciseTypes
      ? { selectedExerciseTypes: account.selectedExerciseTypes }
      : {}),
    createdAt: account.createdAt || new Date().toISOString(),
  };
};

const userDocumentDataFromAccount = (
  account: UserAccount,
  uid: string,
  email = account.email
): Omit<FirebaseUserProfile, 'uid'> & { uid: string } => ({
  ...profileDataFromAccount(account, email),
  uid,
  displayName: account.fullName,
});

export const saveManagedFirebaseProfile = async (
  account: UserAccount
): Promise<void> => {
  if (!account.firebaseUid) {
    throw new Error('Tài khoản chưa có Firebase UID nên không thể đồng bộ hồ sơ.');
  }
  const { createdAt: _createdAt, ...profileData } = userDocumentDataFromAccount(
    account,
    account.firebaseUid
  );
  try {
    await setDoc(
      doc(getUsersCollection(), account.firebaseUid),
      profileData,
      { merge: true }
    );
  } catch (error) {
    console.error('FIREBASE_USER_PROFILE_WRITE_ERROR:', error);
    throw error;
  }
};

export const saveOwnFirebaseProfile = async (account: UserAccount): Promise<void> => {
  if (!account.firebaseUid) {
    throw new Error('Tài khoản chưa có Firebase UID nên không thể đồng bộ hồ sơ.');
  }
  try {
    await setDoc(
      doc(getUsersCollection(), account.firebaseUid),
      {
        email: account.email.trim().toLowerCase(),
        fullName: account.fullName,
        displayName: account.fullName,
        grade: account.grade,
        className: account.className || '',
        school: account.school || '',
        schoolLevel: account.schoolLevel || null,
        provinceOrCity: account.provinceOrCity || '',
        district: account.district || '',
        phone: account.phone || null,
        avatar: account.avatar || null,
      },
      { merge: true }
    );
  } catch (error) {
    console.error('FIREBASE_OWN_USER_PROFILE_WRITE_ERROR:', error);
    throw error;
  }
};

export const upsertAuthenticatedFirebaseUser = async (
  user: User,
  accountOverride?: UserAccount
): Promise<UserAccount> => {
  if (!user.email) {
    throw new Error('Tài khoản Firebase không có email nên không thể đồng bộ hồ sơ.');
  }
  const userRef = doc(getUsersCollection(), user.uid);
  let userSnapshot;
  try {
    userSnapshot = await getDoc(userRef);
  } catch (error) {
    console.error('FIREBASE_AUTHENTICATED_USER_READ_ERROR:', error);
    throw error;
  }
  if (userSnapshot.exists() && userSnapshot.data().disabled === true) {
    await signOut(getFirebaseAuth());
    throw new Error('Tài khoản này đã bị Admin vô hiệu hóa. Hãy liên hệ quản trị viên.');
  }
  let account =
    accountOverride ||
    (userSnapshot.exists()
      ? (() => {
          const profile = profileFromSnapshot(user.uid, userSnapshot.data());
          return profile ? firebaseProfileToUserAccount(profile) : null;
        })()
      : null);

  if (!account && !userSnapshot.exists()) {
    let legacySnapshot;
    try {
      legacySnapshot = await getDoc(doc(getLegacyProfilesCollection(), user.uid));
    } catch (error) {
      console.error('FIREBASE_LEGACY_USER_PROFILE_READ_ERROR:', error);
      throw error;
    }
    if (legacySnapshot.exists()) {
      const legacyProfile = profileFromSnapshot(user.uid, legacySnapshot.data());
      if (legacyProfile) account = firebaseProfileToUserAccount(legacyProfile);
    }
  }

  const isAdmin = user.email.toLowerCase() === FIREBASE_ADMIN_EMAIL;
  const email = user.email.trim().toLowerCase();
  const displayName =
    account?.fullName ||
    user.displayName?.trim() ||
    email.split('@')[0];
  const createdAt =
    account?.createdAt ||
    user.metadata.creationTime ||
    new Date().toISOString();
  const resolvedAccount: UserAccount = {
    id: user.uid,
    firebaseUid: user.uid,
    fullName: displayName,
    email,
    grade: account?.grade || 4,
    phone: account?.phone,
    avatar: account?.avatar,
    className: account?.className,
    school: account?.school,
    schoolLevel: account?.schoolLevel,
    provinceOrCity: account?.provinceOrCity,
    district: account?.district,
    role: isAdmin ? 'admin' : account?.role || 'student',
    canPracticeAll: account?.canPracticeAll ?? false,
    practiceApprovalStatus: account?.practiceApprovalStatus || 'pending',
    teacherApprovalStatus: account?.teacherApprovalStatus,
    teacherClassStatus: account?.teacherClassStatus,
    matchedTeacherEmail: account?.matchedTeacherEmail,
    matchedTeacherName: account?.matchedTeacherName,
    diamonds: account?.diamonds ?? 0,
    level: account?.level ?? 1,
    studentCode: account?.studentCode || `HS-${account?.grade || 4}A1`,
    selectedExerciseTypes: account?.selectedExerciseTypes || [],
    createdAt,
  };

  if (user.displayName !== displayName) {
    await updateProfile(user, { displayName });
  }
  try {
    await setDoc(
      userRef,
      userSnapshot.exists() && !isAdmin
        ? {
            uid: user.uid,
            email,
            fullName: resolvedAccount.fullName,
            displayName,
            role: resolvedAccount.role,
            createdAt: userSnapshot.data().createdAt ?? createdAt,
          }
        : userDocumentDataFromAccount(resolvedAccount, user.uid, email),
      { merge: true }
    );
  } catch (error) {
    console.error('FIREBASE_AUTHENTICATED_USER_UPSERT_ERROR:', error);
    throw error;
  }
  return resolvedAccount;
};

export const getFirebaseUserProfile = async (
  uid: string
): Promise<FirebaseUserProfile | null> => {
  try {
    const snapshot = await getDoc(doc(getUsersCollection(), uid));
    if (!snapshot.exists()) return null;
    return profileFromSnapshot(uid, snapshot.data());
  } catch (error) {
    console.error('FIREBASE_USER_PROFILE_READ_ERROR:', error);
    throw error;
  }
};

const migrateLegacyUserProfiles = async (): Promise<void> => {
  const [usersSnapshot, legacySnapshot] = await Promise.all([
    getDocs(getUsersCollection()),
    getDocs(getLegacyProfilesCollection()),
  ]);
  const existingUids = new Set(usersSnapshot.docs.map((userDoc) => userDoc.id));
  const legacyProfiles = legacySnapshot.docs
    .map((legacyDoc) => ({
      uid: legacyDoc.id,
      profile: profileFromSnapshot(legacyDoc.id, legacyDoc.data()),
    }))
    .filter(
      (entry): entry is { uid: string; profile: FirebaseUserProfile } =>
        Boolean(entry.profile) && !existingUids.has(entry.uid)
    );

  for (let start = 0; start < legacyProfiles.length; start += 450) {
    const batch = writeBatch(getDb());
    legacyProfiles.slice(start, start + 450).forEach(({ uid, profile }) => {
      const account = firebaseProfileToUserAccount(profile);
      batch.set(
        doc(getUsersCollection(), uid),
        userDocumentDataFromAccount(account, uid),
        { merge: true }
      );
    });
    await batch.commit();
  }
};

export const getFirebaseUserProfiles = async (): Promise<FirebaseUserProfile[]> => {
  try {
    await migrateLegacyUserProfiles();
    const snapshot = await getDocs(getUsersCollection());
    return snapshot.docs
      .map((profile) => profileFromSnapshot(profile.id, profile.data()))
      .filter((profile): profile is FirebaseUserProfile => profile !== null);
  } catch (error) {
    console.error('FIREBASE_USER_PROFILES_READ_ERROR:', error);
    throw error;
  }
};

export const subscribeToFirebaseUsers = (
  onUsers: (users: FirebaseUserProfile[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  void migrateLegacyUserProfiles().catch((error: unknown) => {
    console.error('FIREBASE_LEGACY_USER_MIGRATION_ERROR:', error);
    onError(error instanceof Error ? error : new Error('Không thể chuyển hồ sơ Firebase cũ.'));
  });
  return onSnapshot(
    getUsersCollection(),
    (snapshot) => {
      onUsers(
        snapshot.docs
          .map((userDoc) => profileFromSnapshot(userDoc.id, userDoc.data()))
          .filter((profile): profile is FirebaseUserProfile => profile !== null)
      );
    },
    (error) => onError(error)
  );
};

export const subscribeToFirebaseStudentsForTeacher = (
  teacher: UserAccount,
  onStudents: (students: FirebaseUserProfile[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  if (!teacher.className || !teacher.school) {
    const error = new Error('Giáo viên cần có lớp và trường để tải danh sách học sinh.');
    onError(error);
    return () => undefined;
  }
  return onSnapshot(
    query(
      getUsersCollection(),
      where('role', '==', 'student'),
      where('className', '==', teacher.className),
      where('school', '==', teacher.school)
    ),
    (snapshot) => {
      onStudents(
        snapshot.docs
          .map((userDoc) => profileFromSnapshot(userDoc.id, userDoc.data()))
          .filter((profile): profile is FirebaseUserProfile => profile !== null)
      );
    },
    (error) => onError(error)
  );
};

export const subscribeToFirebaseUser = (
  uid: string,
  onUser: (user: FirebaseUserProfile | null) => void,
  onError: (error: Error) => void
): Unsubscribe =>
  onSnapshot(
    doc(getUsersCollection(), uid),
    (snapshot) => {
      onUser(snapshot.exists() ? profileFromSnapshot(uid, snapshot.data()) : null);
    },
    (error) => onError(error)
  );

export const updateTeacherStudentClassStatus = async (
  teacher: UserAccount,
  student: UserAccount,
  status: 'approved' | 'rejected'
): Promise<void> => {
  if (!teacher.firebaseUid || !student.firebaseUid) {
    throw new Error('Thiếu Firebase UID của giáo viên hoặc học sinh.');
  }
  try {
    await setDoc(
      doc(getUsersCollection(), student.firebaseUid),
      {
        teacherClassStatus: status,
        matchedTeacherEmail: teacher.email.toLowerCase(),
        matchedTeacherName: teacher.fullName,
      },
      { merge: true }
    );
  } catch (error) {
    console.error('FIREBASE_TEACHER_STUDENT_STATUS_WRITE_ERROR:', error);
    throw error;
  }
};

export const disableFirebaseUser = async (uid: string): Promise<void> => {
  try {
    await setDoc(
      doc(getUsersCollection(), uid),
      { uid, disabled: true, disabledAt: new Date().toISOString() },
      { merge: true }
    );
  } catch (error) {
    console.error('FIREBASE_USER_DISABLE_WRITE_ERROR:', error);
    throw error;
  }
};

export const createManagedFirebaseProfile = async (
  account: UserAccount,
  password: string
): Promise<string> => {
  const provisioningAppName = 'bonben-user-provisioning';
  const existingApp = getFirebaseApp();
  const provisioningApp =
    getApps().find((app) => app.name === provisioningAppName) ||
    initializeApp(existingApp.options, provisioningAppName);
  const provisioningAuth = getAuth(provisioningApp);
  if (!password) throw new Error('Thiếu mật khẩu khi tạo tài khoản được Admin quản lý.');

  const credential = await createUserWithEmailAndPassword(
    provisioningAuth,
    account.email.toLowerCase(),
    password
  );
  try {
    await sendEmailVerification(credential.user);
    await updateProfile(credential.user, { displayName: account.fullName });
    await setDoc(
      doc(getUsersCollection(), credential.user.uid),
      {
        ...userDocumentDataFromAccount(
          { ...account, id: credential.user.uid, firebaseUid: credential.user.uid },
          credential.user.uid
        ),
        schoolLevel: account.schoolLevel || null,
        teacherApprovalStatus:
          account.role === 'teacher' ? account.teacherApprovalStatus || 'pending' : null,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
    return credential.user.uid;
  } catch (error) {
    console.error('FIREBASE_MANAGED_ACCOUNT_PROFILE_WRITE_ERROR:', error);
    try {
      await deleteUser(credential.user);
    } catch (cleanupError) {
      console.error('FIREBASE_MANAGED_ACCOUNT_ROLLBACK_ERROR:', cleanupError);
      throw new Error(
        'Không thể lưu hồ sơ tài khoản lên Firebase và không thể hoàn tác tài khoản vừa tạo. Hãy liên hệ Admin để xử lý trước khi tạo lại.'
      );
    }
    throw error;
  } finally {
    await signOut(provisioningAuth);
  }
};

export const sendNotifications = async (
  recipients: FirebaseUserProfile[],
  notification: {
    title: string;
    message: string;
    displayMode: NotificationDisplayMode;
    createdBy: string;
  }
): Promise<number> => {
  const db = getDb();
  const uniqueRecipients = Array.from(
    new Map(recipients.map((recipient) => [recipient.uid, recipient])).values()
  );
  for (let start = 0; start < uniqueRecipients.length; start += 450) {
    const batch = writeBatch(db);
    const chunk = uniqueRecipients.slice(start, start + 450);
    for (const recipient of chunk) {
      const inboxRef = doc(collection(db, 'users', recipient.uid, 'inbox'));
      batch.set(inboxRef, {
        title: notification.title.trim(),
        message: notification.message.trim(),
        displayMode: notification.displayMode,
        recipientUid: recipient.uid,
        recipientEmail: recipient.email.toLowerCase(),
        createdBy: notification.createdBy,
        createdAt: serverTimestamp(),
        read: false,
      });
    }
    await batch.commit();
  }
  return uniqueRecipients.length;
};

const notificationFromSnapshot = (
  id: string,
  data: Record<string, unknown>,
  recipientUid: string
): UserNotification | null => {
  if (
    typeof data.title !== 'string' ||
    typeof data.message !== 'string' ||
    (data.displayMode !== 'prominent' && data.displayMode !== 'inbox') ||
    typeof data.recipientEmail !== 'string'
  ) {
    return null;
  }
  const createdAt =
    data.createdAt && typeof data.createdAt === 'object' && 'toMillis' in data.createdAt
      ? Number((data.createdAt as { toMillis: () => number }).toMillis())
      : Date.now();
  return {
    id,
    title: data.title,
    message: data.message,
    displayMode: data.displayMode as NotificationDisplayMode,
    recipientUid,
    recipientEmail: data.recipientEmail,
    createdBy: typeof data.createdBy === 'string' ? data.createdBy : '',
    createdAt,
    read: data.read === true,
  };
};

export const subscribeToUserInbox = (
  uid: string,
  onNotifications: (notifications: UserNotification[]) => void,
  onError: (error: Error) => void
): Unsubscribe =>
  onSnapshot(
    query(
      collection(getDb(), 'users', uid, 'inbox'),
      orderBy('createdAt', 'desc'),
      limit(100)
    ),
    (snapshot) => {
      onNotifications(
        snapshot.docs
          .map((notification) => notificationFromSnapshot(notification.id, notification.data(), uid))
          .filter((notification): notification is UserNotification => notification !== null)
      );
    },
    (error) => onError(error)
  );

export const markUserNotificationRead = async (
  uid: string,
  notificationId: string
): Promise<void> => {
  await updateDoc(doc(getDb(), 'users', uid, 'inbox', notificationId), {
    read: true,
    readAt: serverTimestamp(),
  });
};

const SUPPORT_TICKETS_COLLECTION = 'supportTickets';

const supportTicketFromSnapshot = (
  id: string,
  data: Record<string, unknown>
): SupportTicket | null => {
  if (
    typeof data.senderName !== 'string' ||
    typeof data.senderEmail !== 'string' ||
    typeof data.issueContent !== 'string'
  ) {
    return null;
  }
  const createdAtValue = data.createdAt;
  const createdAt =
    createdAtValue && typeof createdAtValue === 'object' && 'toMillis' in createdAtValue
      ? Number((createdAtValue as { toMillis: () => number }).toMillis())
      : Date.now();
  const handledAtValue = data.handledAt;
  return {
    id,
    senderName: data.senderName,
    senderEmail: data.senderEmail,
    senderUid: typeof data.senderUid === 'string' && data.senderUid ? data.senderUid : undefined,
    gradeInfo: typeof data.gradeInfo === 'string' ? data.gradeInfo : '',
    schoolInfo: typeof data.schoolInfo === 'string' ? data.schoolInfo : '',
    topic: typeof data.topic === 'string' ? data.topic : '',
    issueContent: data.issueContent,
    createdAt,
    handled: data.handled === true,
    handledAt:
      handledAtValue && typeof handledAtValue === 'object' && 'toMillis' in handledAtValue
        ? Number((handledAtValue as { toMillis: () => number }).toMillis())
        : undefined,
    handledBy: typeof data.handledBy === 'string' ? data.handledBy : undefined,
  };
};

export const submitSupportTicket = async (ticket: {
  senderName: string;
  senderEmail: string;
  senderUid?: string;
  gradeInfo: string;
  schoolInfo: string;
  topic: string;
  issueContent: string;
}): Promise<string> => {
  const ticketRef = doc(collection(getDb(), SUPPORT_TICKETS_COLLECTION));
  await setDoc(ticketRef, {
    senderName: ticket.senderName.trim(),
    senderEmail: ticket.senderEmail.trim().toLowerCase(),
    senderUid: ticket.senderUid || '',
    gradeInfo: ticket.gradeInfo.trim(),
    schoolInfo: ticket.schoolInfo.trim(),
    topic: ticket.topic.trim(),
    issueContent: ticket.issueContent.trim(),
    createdAt: serverTimestamp(),
    handled: false,
  });
  return ticketRef.id;
};

export const subscribeToSupportTickets = (
  onTickets: (tickets: SupportTicket[]) => void,
  onError: (error: Error) => void
): Unsubscribe =>
  onSnapshot(
    query(
      collection(getDb(), SUPPORT_TICKETS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(200)
    ),
    (snapshot) => {
      onTickets(
        snapshot.docs
          .map((ticketDoc) => supportTicketFromSnapshot(ticketDoc.id, ticketDoc.data()))
          .filter((ticket): ticket is SupportTicket => ticket !== null)
      );
    },
    (error) => onError(error)
  );

export const markSupportTicketHandled = async (
  ticketId: string,
  handledBy: string
): Promise<void> => {
  await updateDoc(doc(getDb(), SUPPORT_TICKETS_COLLECTION, ticketId), {
    handled: true,
    handledAt: serverTimestamp(),
    handledBy,
  });
};
