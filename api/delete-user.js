import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Chỉ tài khoản quản trị này được phép gọi API xóa tài khoản.
const FIREBASE_ADMIN_EMAIL = 'bonbenemail@gmail.com';

const readPrivateKey = () => {
  const raw = process.env.FIREBASE_PRIVATE_KEY || '';
  // Vercel thường lưu private key dưới dạng chuỗi có \n literal.
  return raw.includes('\\n') ? raw.replace(/\\n/g, '\n') : raw;
};

const getAdminApp = () => {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = readPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Thiếu cấu hình Firebase Admin SDK. Hãy khai báo FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL và FIREBASE_PRIVATE_KEY trong biến môi trường.'
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId,
  });
};

const deleteSubcollection = async (db, parentCollection, uid, subcollection) => {
  const snapshot = await db
    .collection(parentCollection)
    .doc(uid)
    .collection(subcollection)
    .get();
  if (snapshot.empty) return;
  const batch = db.batch();
  snapshot.docs.forEach((document) => batch.delete(document.ref));
  await batch.commit();
};

const deleteTicketsByField = async (db, field, value) => {
  if (!value) return;
  const snapshot = await db.collection('supportTickets').where(field, '==', value).get();
  if (snapshot.empty) return;
  const batch = db.batch();
  snapshot.docs.forEach((document) => batch.delete(document.ref));
  await batch.commit();
};

const deleteRelatedFirestoreData = async (db, uid, email) => {
  await Promise.all([
    deleteSubcollection(db, 'users', uid, 'inbox'),
    deleteSubcollection(db, 'userProfiles', uid, 'inbox'),
    db.collection('userProfiles').doc(uid).delete(),
    deleteTicketsByField(db, 'senderUid', uid),
    deleteTicketsByField(db, 'senderEmail', email),
  ]);

  // Xóa document chính trong collection users.
  await db.collection('users').doc(uid).delete();
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, message: 'Phương thức không được hỗ trợ.' });
  }

  try {
    const app = getAdminApp();
    const adminAuth = getAuth(app);
    const db = getFirestore(app);

    // Bắt buộc: người gọi phải đang đăng nhập bằng tài khoản Admin.
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!idToken) {
      return res.status(401).json({ ok: false, message: 'Thiếu mã xác thực Admin.' });
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      console.error('DELETE_USER_TOKEN_ERROR:', error);
      return res
        .status(401)
        .json({ ok: false, message: 'Mã xác thực Admin không hợp lệ hoặc đã hết hạn.' });
    }

    if ((decodedToken.email || '').toLowerCase() !== FIREBASE_ADMIN_EMAIL) {
      return res
        .status(403)
        .json({ ok: false, message: 'Chỉ quản trị viên được phép xóa tài khoản.' });
    }

    const { uid, email } = req.body || {};
    if (!uid || typeof uid !== 'string') {
      return res.status(400).json({ ok: false, message: 'Thiếu uid của tài khoản cần xóa.' });
    }
    if (uid === decodedToken.uid) {
      return res
        .status(400)
        .json({ ok: false, message: 'Không thể xóa tài khoản Admin đang đăng nhập.' });
    }

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    await deleteRelatedFirestoreData(db, uid, normalizedEmail);

    // Xóa tận gốc khỏi Firebase Authentication.
    try {
      await adminAuth.deleteUser(uid);
    } catch (error) {
      if (error?.code !== 'auth/user-not-found') throw error;
    }

    return res.json({ ok: true, uid, email: normalizedEmail });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Xóa tài khoản thất bại.';
    console.error('DELETE_USER_ERROR:', message);
    return res.status(500).json({ ok: false, message });
  }
}
