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

/**
 * Tên tài khoản (username) là duy nhất và được lưu trong collection `usernames`
 * với document id chính là username đã chuẩn hóa, do đó Firestore tự chống trùng.
 * Mỗi document ánh xạ username -> { uid, email } để phục vụ đăng nhập.
 */
export const USERNAME_MIN_LENGTH = 8;
export const USERNAME_MAX_LENGTH = 30;

const USERNAME_PATTERN = /^[a-z0-9._]+$/;

const getDb = () => getFirestore(getFirebaseApp());
const getUsernamesCollection = () => collection(getDb(), 'usernames');

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

/** Đăng ký tên tài khoản cho một tài khoản; ném lỗi nếu đã bị người khác dùng. */
export const reserveUsername = async (
  raw: string,
  uid: string,
  email: string
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
  });
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
  const snapshot = await getDocs(
    query(getUsernamesCollection(), where('uid', '==', uid))
  );
  await Promise.all(snapshot.docs.map((usernameDoc) => deleteDoc(usernameDoc.ref)));
};
