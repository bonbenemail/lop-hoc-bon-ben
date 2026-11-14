import { getApps, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
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
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import type {
  FirebaseUserProfile,
  NotificationDisplayMode,
  UserAccount,
  UserNotification,
} from '../types';
import { getFirebaseApp, getFirebaseAuth } from './firebaseAdminAuth';

const getDb = () => getFirestore(getFirebaseApp());
const getProfilesCollection = () => collection(getDb(), 'userProfiles');

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
    await setDoc(
      doc(getProfilesCollection(), credential.user.uid),
      selfProfileDataFromAccount(account, credential.user.email || email),
      { merge: false }
    );
  } catch (error) {
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
  const grade = Number(data.grade);
  if (
    typeof data.email !== 'string' ||
    typeof data.fullName !== 'string' ||
    (role !== 'student' && role !== 'teacher' && role !== 'school') ||
    !Number.isInteger(grade) ||
    grade < 1 ||
    grade > 12
  ) {
    return null;
  }
  return {
    uid,
    email: data.email,
    fullName: data.fullName,
    role,
    grade: grade as UserAccount['grade'],
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
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : undefined,
  };
};

export const firebaseProfileToUserAccount = (
  profile: FirebaseUserProfile
): UserAccount => ({
  id: profile.uid,
  firebaseUid: profile.uid,
  fullName: profile.fullName,
  email: profile.email,
  verifiedByGmail: true,
  grade: profile.grade,
  className: profile.className,
  school: profile.school,
  schoolLevel: profile.schoolLevel,
  provinceOrCity: profile.provinceOrCity,
  district: profile.district,
  role: profile.role,
  canPracticeAll: profile.canPracticeAll,
  practiceApprovalStatus: profile.practiceApprovalStatus,
  teacherApprovalStatus: profile.teacherApprovalStatus,
  diamonds: 0,
  level: 1,
  studentCode: profile.studentCode || `HS-${profile.grade}A1`,
  selectedExerciseTypes: [],
  createdAt: profile.createdAt || new Date().toISOString(),
});

const profileDataFromAccount = (
  account: UserAccount,
  email = account.email
): Omit<FirebaseUserProfile, 'uid'> => {
  if (account.role !== 'student' && account.role !== 'teacher' && account.role !== 'school') {
    throw new Error('Vai trò này không thể đồng bộ thành hồ sơ Firebase.');
  }
  return {
    email: email.trim().toLowerCase(),
    fullName: account.fullName,
    role: account.role,
    grade: account.grade,
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
    createdAt: account.createdAt || new Date().toISOString(),
  };
};

const selfProfileDataFromAccount = (
  account: UserAccount,
  email = account.email
): Omit<FirebaseUserProfile, 'uid'> => {
  if (account.role !== 'student' && account.role !== 'teacher') {
    throw new Error('Vai trò này chỉ có thể được Admin cấp trong Firebase.');
  }
  const isTeacher = account.role === 'teacher';
  return profileDataFromAccount(
    {
      ...account,
      canPracticeAll: isTeacher,
      practiceApprovalStatus: isTeacher ? 'approved' : 'pending',
      teacherApprovalStatus: isTeacher ? 'pending' : undefined,
    },
    email
  );
};

export const saveManagedFirebaseProfile = async (
  account: UserAccount
): Promise<void> => {
  if (!account.firebaseUid) {
    throw new Error('Tài khoản chưa có Firebase UID nên không thể đồng bộ hồ sơ.');
  }
  await setDoc(
    doc(getProfilesCollection(), account.firebaseUid),
    profileDataFromAccount(account),
    { merge: true }
  );
};

export const getFirebaseUserProfile = async (
  uid: string
): Promise<FirebaseUserProfile | null> => {
  const snapshot = await getDoc(doc(getProfilesCollection(), uid));
  if (!snapshot.exists()) return null;
  return profileFromSnapshot(uid, snapshot.data());
};

export const getFirebaseUserProfiles = async (): Promise<FirebaseUserProfile[]> => {
  const snapshot = await getDocs(getProfilesCollection());
  return snapshot.docs
    .map((profile) => profileFromSnapshot(profile.id, profile.data()))
    .filter((profile): profile is FirebaseUserProfile => profile !== null);
};

export const saveOwnFirebaseProfile = async (
  user: User,
  account: UserAccount
): Promise<FirebaseUserProfile> => {
  if (!user.emailVerified || !user.email || user.email.toLowerCase() !== account.email.toLowerCase()) {
    throw new Error('Chỉ có thể đồng bộ hồ sơ sau khi xác minh đúng địa chỉ email.');
  }

  const profileRef = doc(getProfilesCollection(), user.uid);
  const existing = await getDoc(profileRef);
  if (existing.exists()) {
    const profile = profileFromSnapshot(user.uid, existing.data());
    if (!profile || profile.email.toLowerCase() !== user.email.toLowerCase()) {
      throw new Error('Hồ sơ Firebase không hợp lệ hoặc email tài khoản không khớp.');
    }
    return profile;
  }

  if (account.role !== 'student' && account.role !== 'teacher') {
    throw new Error('Vai trò này chỉ có thể được Admin cấp trong Firebase.');
  }

  const profileData = selfProfileDataFromAccount(account, user.email);
  await setDoc(profileRef, { ...profileData, createdAt: serverTimestamp() });
  return { uid: user.uid, ...profileData };
};

export const createManagedFirebaseProfile = async (
  account: UserAccount
): Promise<string> => {
  const provisioningAppName = 'bonben-user-provisioning';
  const existingApp = getFirebaseApp();
  const provisioningApp =
    getApps().find((app) => app.name === provisioningAppName) ||
    initializeApp(existingApp.options, provisioningAppName);
  const provisioningAuth = getAuth(provisioningApp);
  const password = account.password;
  if (!password) throw new Error('Thiếu mật khẩu khi tạo tài khoản được Admin quản lý.');

  const credential = await createUserWithEmailAndPassword(
    provisioningAuth,
    account.email.toLowerCase(),
    password
  );
  try {
    await sendEmailVerification(credential.user);
    await setDoc(
      doc(getProfilesCollection(), credential.user.uid),
      {
        ...profileDataFromAccount(account),
        schoolLevel: account.schoolLevel || null,
        teacherApprovalStatus:
          account.role === 'teacher' ? account.teacherApprovalStatus || 'pending' : null,
        createdAt: serverTimestamp(),
      },
      { merge: false }
    );
    return credential.user.uid;
  } catch (error) {
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
      const inboxRef = doc(collection(db, 'userProfiles', recipient.uid, 'inbox'));
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
      collection(getDb(), 'userProfiles', uid, 'inbox'),
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
  await updateDoc(doc(getDb(), 'userProfiles', uid, 'inbox', notificationId), {
    read: true,
    readAt: serverTimestamp(),
  });
};
