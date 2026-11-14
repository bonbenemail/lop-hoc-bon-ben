import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { getFirebaseApp } from './firebaseAdminAuth';
import type { UserAccount, UserDirectoryEntry } from '../types';

/**
 * Tên tài khoản (username) là duy nhất và được lưu trong collection `usernames`
 * với document id chính là username đã chuẩn hóa, do đó Firestore tự chống trùng.
 * Mỗi document ánh xạ username -> hồ sơ công khai (uid, email, họ tên, khối lớp...),
 * vừa phục vụ đăng nhập vừa phục vụ tra cứu & kết bạn.
 */
export const USERNAME_MIN_LENGTH = 8;
export const USERNAME_MAX_LENGTH = 30;

const USERNAME_PATTERN = /^[a-z0-9._]+$/;

const getDb = () => getFirestore(getFirebaseApp());
const getUsernamesCollection = () => collection(getDb(), 'usernames');
/**
 * Bảng ánh xạ email -> { uid, username } với document id chính là email đã chuẩn hóa.
 * Cho phép tra cứu công khai (get) để tìm bạn bằng email mà không lộ danh sách toàn bộ người dùng.
 */
const getEmailDirectoryCollection = () => collection(getDb(), 'emailDirectory');

export const normalizeUsername = (raw: string): string => raw.trim().toLowerCase();

export const isValidUsername = (raw: string): boolean => {
  const username = normalizeUsername(raw);
  return (
    username.length >= USERNAME_MIN_LENGTH &&
    username.length <= USERNAME_MAX_LENGTH &&
    USERNAME_PATTERN.test(username)
  );
};

export const USERNAME_INVALID_MESSAGE = `Tên tài khoản phải có tối thiểu ${USERNAME_MIN_LENGTH} ký tự, tối đa ${USERNAME_MAX_LENGTH} ký tự và chỉ gồm chữ thường, số, dấu chấm (.) hoặc gạch dưới (_).`;
export const USERNAME_TAKEN_MESSAGE = 'Tên tài khoản này đã được sử dụng. Vui lòng chọn tên khác.';

/** Tra cứu username -> email để đăng nhập. Trả về null nếu chưa tồn tại. */
export const lookupEmailByUsername = async (raw: string): Promise<string | null> => {
  const username = normalizeUsername(raw);
  if (!username) return null;
  const snapshot = await getDoc(doc(getUsernamesCollection(), username));
  if (!snapshot.exists()) return null;
  const email = snapshot.data().email;
  return typeof email === 'string' && email ? email : null;
};

/** Kiểm tra tên tài khoản còn trống hay không. */
export const isUsernameAvailable = async (raw: string): Promise<boolean> =>
  (await lookupEmailByUsername(raw)) === null;

/** Hồ sơ công khai lưu kèm trong document username (phục vụ tìm kiếm & kết bạn). */
export interface UsernameDirectoryInfo {
  fullName?: string;
  role?: UserAccount['role'];
  grade?: number;
  className?: string;
  school?: string;
  avatar?: string;
}

const directoryFieldsFrom = (info?: UsernameDirectoryInfo): Record<string, unknown> => {
  if (!info) return {};
  const fields: Record<string, unknown> = {};
  if (info.fullName) fields.fullName = info.fullName;
  if (info.role) fields.role = info.role;
  if (typeof info.grade === 'number') fields.grade = info.grade;
  if (info.className) fields.className = info.className;
  if (info.school) fields.school = info.school;
  if (info.avatar) fields.avatar = info.avatar;
  return fields;
};

/** Đăng ký tên tài khoản cho một tài khoản; ném lỗi nếu đã bị người khác dùng. */
export const reserveUsername = async (
  raw: string,
  uid: string,
  email: string,
  info?: UsernameDirectoryInfo
): Promise<void> => {
  const username = normalizeUsername(raw);
  const ref = doc(getUsernamesCollection(), username);
  const snapshot = await getDoc(ref);
  if (snapshot.exists() && snapshot.data().uid !== uid) {
    throw new Error(USERNAME_TAKEN_MESSAGE);
  }
  await setDoc(ref, {
    username,
    uid,
    email: email.trim().toLowerCase(),
    ...directoryFieldsFrom(info),
  });
  await saveEmailDirectory(email, uid, username);
};

/** Lưu ánh xạ email -> username để tra cứu tìm bạn bằng email. */
const saveEmailDirectory = async (
  email: string,
  uid: string,
  username: string
): Promise<void> => {
  const key = email.trim().toLowerCase();
  if (!key) return;
  await setDoc(
    doc(getEmailDirectoryCollection(), key),
    { uid, username, email: key },
    { merge: true }
  );
};

/** Cập nhật hồ sơ công khai trong document username (nếu tài khoản có username). */
export const syncUsernameDirectory = async (
  raw: string,
  uid: string,
  info: UsernameDirectoryInfo,
  email?: string
): Promise<void> => {
  const username = normalizeUsername(raw);
  if (!username) return;
  const ref = doc(getUsernamesCollection(), username);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists() || snapshot.data().uid !== uid) return;
  await setDoc(ref, { username, uid, ...directoryFieldsFrom(info) }, { merge: true });
  if (email) await saveEmailDirectory(email, uid, username);
};

/** Tra cứu hồ sơ công khai theo tên tài khoản (dùng cho chức năng tìm bạn). */
export const lookupDirectoryByUsername = async (
  raw: string
): Promise<UserDirectoryEntry | null> => {
  const username = normalizeUsername(raw);
  if (!username) return null;
  const snapshot = await getDoc(doc(getUsernamesCollection(), username));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  if (typeof data.uid !== 'string' || !data.uid) return null;
  return {
    uid: data.uid,
    email: typeof data.email === 'string' ? data.email : '',
    username,
    fullName: typeof data.fullName === 'string' && data.fullName ? data.fullName : username,
    role: (data.role as UserAccount['role']) || 'student',
    grade: typeof data.grade === 'number' ? data.grade : undefined,
    className: typeof data.className === 'string' ? data.className : undefined,
    school: typeof data.school === 'string' ? data.school : undefined,
    avatar: typeof data.avatar === 'string' ? data.avatar : undefined,
  };
};

/** Tra cứu hồ sơ công khai theo email (dùng cho chức năng tìm bạn bằng email). */
export const lookupDirectoryByEmail = async (
  raw: string
): Promise<UserDirectoryEntry | null> => {
  const key = raw.trim().toLowerCase();
  if (!key) return null;
  const snapshot = await getDoc(doc(getEmailDirectoryCollection(), key));
  if (!snapshot.exists()) return null;
  const username = snapshot.data().username;
  if (typeof username !== 'string' || !username) return null;
  return lookupDirectoryByUsername(username);
};

/** Giải phóng tên tài khoản (dùng khi đổi tên hoặc hoàn tác đăng ký). */
export const releaseUsername = async (raw: string): Promise<void> => {
  const username = normalizeUsername(raw);
  if (!username) return;
  await deleteDoc(doc(getUsernamesCollection(), username));
};

/** Xóa mọi tên tài khoản gắn với một uid (dùng khi xóa tài khoản). */
export const releaseUsernamesForUid = async (uid: string): Promise<void> => {
  if (!uid) return;
  const [usernameSnapshot, emailSnapshot] = await Promise.all([
    getDocs(query(getUsernamesCollection(), where('uid', '==', uid))),
    getDocs(query(getEmailDirectoryCollection(), where('uid', '==', uid))),
  ]);
  await Promise.all([
    ...usernameSnapshot.docs.map((usernameDoc) => deleteDoc(usernameDoc.ref)),
    ...emailSnapshot.docs.map((emailDoc) => deleteDoc(emailDoc.ref)),
  ]);
};
