import { getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
  type UserCredential,
} from 'firebase/auth';
import type { GradeLevel, UserAccount } from '../types';

export const FIREBASE_ADMIN_EMAIL = 'bonbenemail@gmail.com';

const BONBEN_APP_NAME = 'bonben-auth';
const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredConfigKeys: Array<keyof FirebaseOptions> = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

export const isAdminFirebaseConfigured = (): boolean =>
  requiredConfigKeys.every((key) => {
    const value = firebaseConfig[key];
    return typeof value === 'string' && value.trim().length > 0;
  });

let adminAuthInstance: Auth | null = null;

export const getFirebaseApp = () => {
  if (!isAdminFirebaseConfigured()) {
    throw new Error(
      'Thiếu cấu hình Firebase. Hãy thêm đầy đủ các biến VITE_FIREBASE_... vào file .env rồi khởi động lại ứng dụng.'
    );
  }

  return getApps().find((app) => app.name === BONBEN_APP_NAME) ||
    initializeApp(firebaseConfig, BONBEN_APP_NAME);
};

export const getFirebaseAuth = (): Auth => {
  if (!adminAuthInstance) {
    adminAuthInstance = getAuth(getFirebaseApp());
  }

  return adminAuthInstance;
};

export const signInAdminWithFirebase = async (email: string, password: string): Promise<User> => {
  if (email.trim().toLowerCase() !== FIREBASE_ADMIN_EMAIL) {
    throw new Error('Chỉ tài khoản quản trị được phép đăng nhập bằng luồng này.');
  }

  const auth = getFirebaseAuth();
  let credential: UserCredential;
  try {
    credential = await signInWithEmailAndPassword(auth, FIREBASE_ADMIN_EMAIL, password);
  } catch (error) {
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String(error.code)
        : '';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
      throw new Error('Email hoặc mật khẩu Admin không chính xác.');
    }
    if (code === 'auth/user-not-found') {
      throw new Error('Chưa tạo tài khoản Admin trong Firebase Authentication.');
    }
    if (code === 'auth/operation-not-allowed') {
      throw new Error('Firebase chưa bật phương thức đăng nhập Email/Mật khẩu.');
    }
    if (code === 'auth/too-many-requests') {
      throw new Error('Firebase tạm khóa đăng nhập do quá nhiều lần thử. Hãy thử lại sau.');
    }
    throw error;
  }
  if (!credential.user.emailVerified) {
    try {
      await sendEmailVerification(credential.user);
    } finally {
      await signOut(auth);
    }
    throw new Error('Email Admin chưa được xác minh. Firebase đã gửi liên kết xác minh tới hộp thư.');
  }

  return credential.user;
};

export const sendAdminFirebasePasswordReset = async (): Promise<void> => {
  await sendPasswordResetEmail(getFirebaseAuth(), FIREBASE_ADMIN_EMAIL);
};

export const subscribeToFirebaseAdmin = (callback: (user: User | null) => void): (() => void) => {
  if (!isAdminFirebaseConfigured()) return () => undefined;
  return onAuthStateChanged(getFirebaseAuth(), callback);
};

export const signOutFirebaseAdmin = async (): Promise<void> => {
  if (!isAdminFirebaseConfigured()) return;
  await signOut(getFirebaseAuth());
};

export const createFirebaseAdminAccount = (user: User, grade: GradeLevel): UserAccount => ({
  id: user.uid,
  firebaseUid: user.uid,
  fullName: user.displayName || 'Quản Trị Hệ Thống Bon Ben',
  email: FIREBASE_ADMIN_EMAIL,
  verifiedByGmail: user.emailVerified,
  grade,
  className: `${grade}A1`,
  school: 'Hệ thống Lớp học Bon Ben',
  role: 'admin',
  diamonds: 9999,
  level: 99,
  studentCode: 'ADMIN-BONBEN',
  createdAt: user.metadata.creationTime || new Date().toISOString(),
});
