import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
];

export const SENDER_GMAIL = 'bonbenemail@gmail.com';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({
  login_hint: SENDER_GMAIL,
});

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the access token in memory ONLY (never in localStorage or sessionStorage).
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Không lấy được quyền truy cập Gmail từ Google Auth.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: unknown) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getCurrentGoogleUser = (): User | null => {
  return auth.currentUser;
};

export const logoutGmail = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Helper to encode UTF-8 string to base64
const utf8ToBase64 = (str: string): string => {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Helper to encode UTF-8 string to base64url (required by Gmail API raw message)
const utf8ToBase64Url = (str: string): string => {
  return utf8ToBase64(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export interface SendOtpEmailParams {
  toEmail: string;
  studentName: string;
  grade: number;
  otpCode: string;
}

export const sendVerificationOtpViaGmail = async ({
  toEmail,
  studentName,
  grade,
  otpCode,
}: SendOtpEmailParams): Promise<void> => {
  let token = await getAccessToken();
  if (!token) {
    const signInResult = await googleSignIn();
    if (!signInResult?.accessToken) {
      throw new Error('Vui lòng đăng nhập tài khoản Google để gửi mã xác thực.');
    }
    token = signInResult.accessToken;
  }

  const subjectText = `[Lớp học Bon Ben] Mã xác thực 6 số tạo tài khoản: ${otpCode}`;
  const encodedSubject = `=?UTF-8?B?${utf8ToBase64(subjectText)}?=`;
  const encodedFromName = `=?UTF-8?B?${utf8ToBase64('Lớp học Bon Ben')}?=`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #bae6fd; border-radius: 16px; background-color: #f0f9ff;">
      <div style="background: linear-gradient(90deg, #0c4a6e, #0284c7); padding: 18px 24px; border-radius: 12px; color: #ffffff; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">LỚP HỌC BON BEN</h2>
        <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Hệ thống học tập trực tuyến Toán - Tiếng Việt - Tiếng Anh</p>
      </div>
      <div style="background: #ffffff; padding: 24px; border-radius: 12px; margin-top: 16px; border: 1px solid #e0f2fe;">
        <p style="font-size: 14px; color: #334155; margin-top: 0;">Xin chào <strong>${studentName}</strong> (Đăng ký <strong>Lớp ${grade}</strong>),</p>
        <p style="font-size: 14px; color: #334155; line-height: 1.5;">
          Cảm ơn bạn đã đăng ký tài khoản tại <strong>Lớp học Bon Ben</strong>. Đây là mã xác thực gồm 6 chữ số để hoàn tất tạo tài khoản của bạn:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #0369a1; background: #e0f2fe; padding: 14px 28px; border-radius: 12px; border: 2px solid #38bdf8; font-family: monospace;">
            ${otpCode}
          </span>
        </div>
        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
          Vui lòng quay lại trang đăng ký <strong>Lớp học Bon Ben</strong> và nhập đúng 6 chữ số này để kích hoạt tài khoản. Tuyệt đối không chia sẻ mã này cho người khác.
        </p>
      </div>
      <p style="text-align: center; font-size: 11px; color: #64748b; margin: 14px 0 0;">
        Email được gửi tự động từ Hệ thống Lớp học Bon Ben.
      </p>
    </div>
  `.trim();

  const mimeMessage = [
    `From: ${encodedFromName} <${SENDER_GMAIL}>`,
    `To: <${toEmail.trim()}>`,
    `Subject: ${encodedSubject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    utf8ToBase64(htmlBody),
  ].join('\r\n');

  const raw = utf8ToBase64Url(mimeMessage);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (response.status === 401 || response.status === 403) {
    cachedAccessToken = null;
    throw new Error('Phiên kết nối Gmail đã hết hạn hoặc chưa cấp quyền gửi thư. Vui lòng nhấn "Sign in with Google" để cấp quyền lại.');
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData?.error?.message || `Lỗi gửi email qua Gmail API (Mã lỗi ${response.status})`;
    throw new Error(errMsg);
  }
};

export interface SendPasswordResetOtpParams {
  toEmail: string;
  studentName: string;
  otpCode: string;
}

export const sendPasswordResetOtpViaGmail = async ({
  toEmail,
  studentName,
  otpCode,
}: SendPasswordResetOtpParams): Promise<void> => {
  let token = await getAccessToken();
  if (!token) {
    const signInResult = await googleSignIn();
    if (!signInResult?.accessToken) {
      throw new Error('Vui lòng đăng nhập tài khoản Google để gửi mã 6 số khôi phục mật khẩu.');
    }
    token = signInResult.accessToken;
  }

  const subjectText = `[Lớp học Bon Ben] Mã 6 số khôi phục mật khẩu tài khoản: ${otpCode}`;
  const encodedSubject = `=?UTF-8?B?${utf8ToBase64(subjectText)}?=`;
  const encodedFromName = `=?UTF-8?B?${utf8ToBase64('Lớp học Bon Ben')}?=`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #bae6fd; border-radius: 16px; background-color: #f0f9ff;">
      <div style="background: linear-gradient(90deg, #0c4a6e, #0284c7); padding: 18px 24px; border-radius: 12px; color: #ffffff; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">LỚP HỌC BON BEN - KHÔI PHỤC MẬT KHẨU</h2>
        <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Hệ thống học tập trực tuyến Văn - Toán - Anh</p>
      </div>
      <div style="background: #ffffff; padding: 24px; border-radius: 12px; margin-top: 16px; border: 1px solid #e0f2fe;">
        <p style="font-size: 14px; color: #334155; margin-top: 0;">Xin chào <strong>${studentName}</strong> (Tài khoản: <strong>${toEmail}</strong>),</p>
        <p style="font-size: 14px; color: #334155; line-height: 1.5;">
          Hệ thống <strong>Lớp học Bon Ben</strong> vừa nhận được yêu cầu đặt lại mật khẩu cho tài khoản Gmail của bạn. Đây là mã xác thực gồm 6 chữ số để đổi mật khẩu mới:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #0369a1; background: #e0f2fe; padding: 14px 28px; border-radius: 12px; border: 2px solid #38bdf8; font-family: monospace;">
            ${otpCode}
          </span>
        </div>
        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
          Vui lòng nhập đúng 6 chữ số này trên cửa sổ <strong>Quên mật khẩu</strong> để thiết lập mật khẩu mới. Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.
        </p>
      </div>
      <p style="text-align: center; font-size: 11px; color: #64748b; margin: 14px 0 0;">
        Email được gửi tự động từ Hệ thống Lớp học Bon Ben.
      </p>
    </div>
  `.trim();

  const mimeMessage = [
    `From: ${encodedFromName} <${SENDER_GMAIL}>`,
    `To: <${toEmail.trim()}>`,
    `Subject: ${encodedSubject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    utf8ToBase64(htmlBody),
  ].join('\r\n');

  const raw = utf8ToBase64Url(mimeMessage);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (response.status === 401 || response.status === 403) {
    cachedAccessToken = null;
    throw new Error('Phiên kết nối Gmail đã hết hạn hoặc chưa cấp quyền gửi thư. Vui lòng nhấn "Sign in with Google" để cấp quyền lại.');
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData?.error?.message || `Lỗi gửi email qua Gmail API (Mã lỗi ${response.status})`;
    throw new Error(errMsg);
  }
};

export interface SendSupportEmailParams {
  senderName: string;
  senderEmail: string;
  gradeInfo: string;
  schoolInfo: string;
  topic: string;
  issueContent: string;
}

export const sendSupportEmailViaGmail = async ({
  senderName,
  senderEmail,
  gradeInfo,
  schoolInfo,
  topic,
  issueContent,
}: SendSupportEmailParams): Promise<void> => {
  let token = await getAccessToken();
  if (!token) {
    const signInResult = await googleSignIn();
    if (!signInResult?.accessToken) {
      throw new Error('Vui lòng đăng nhập Google để gửi yêu cầu hỗ trợ về Ban Quản Trị Lớp học Bon Ben.');
    }
    token = signInResult.accessToken;
  }

  const subjectText = `[Hỗ trợ Lớp học Bon Ben] ${topic} - Từ: ${senderName} (${senderEmail})`;
  const encodedSubject = `=?UTF-8?B?${utf8ToBase64(subjectText)}?=`;
  const encodedFromName = `=?UTF-8?B?${utf8ToBase64('Trung tâm Hỗ trợ Lớp học Bon Ben')}?=`;

  const escapedIssue = issueContent
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #bae6fd; border-radius: 16px; background-color: #f0f9ff;">
      <div style="background: linear-gradient(90deg, #0c4a6e, #0284c7); padding: 18px 24px; border-radius: 12px; color: #ffffff;">
        <h2 style="margin: 0; font-size: 19px;">YÊU CẦU HỖ TRỢ MỚI - LỚP HỌC BON BEN</h2>
        <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Gửi trực tiếp về hộp thư Ban Quản Trị Lớp học Bon Ben</p>
      </div>
      <div style="background: #ffffff; padding: 22px; border-radius: 12px; margin-top: 16px; border: 1px solid #e0f2fe;">
        <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 140px;">Người gửi:</td>
            <td style="padding: 6px 0;">${senderName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Gmail liên hệ:</td>
            <td style="padding: 6px 0; color: #0284c7; font-weight: bold;">${senderEmail}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Lớp / Khối:</td>
            <td style="padding: 6px 0;">${gradeInfo}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Trường học:</td>
            <td style="padding: 6px 0;">${schoolInfo || 'Chưa cung cấp'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Chủ đề hỗ trợ:</td>
            <td style="padding: 6px 0;"><strong style="color: #0369a1;">${topic}</strong></td>
          </tr>
        </table>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p style="font-size: 13px; font-weight: bold; color: #0f172a; margin: 0 0 8px;">Nội dung vấn đề cần hỗ trợ:</p>
        <div style="background: #f8fafc; padding: 14px 16px; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 14px; color: #1e293b; line-height: 1.6;">
          ${escapedIssue}
        </div>
      </div>
      <p style="text-align: center; font-size: 11px; color: #64748b; margin: 14px 0 0;">
        Yêu cầu hỗ trợ được gửi từ giao diện Lớp học Bon Ben tới Ban Quản Trị.
      </p>
    </div>
  `.trim();

  const mimeMessage = [
    `From: ${encodedFromName} <${SENDER_GMAIL}>`,
    `To: <${SENDER_GMAIL}>`,
    `Reply-To: <${senderEmail.trim()}>`,
    `Subject: ${encodedSubject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    utf8ToBase64(htmlBody),
  ].join('\r\n');

  const raw = utf8ToBase64Url(mimeMessage);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (response.status === 401 || response.status === 403) {
    cachedAccessToken = null;
    throw new Error('Phiên kết nối Gmail đã hết hạn hoặc chưa cấp quyền gửi thư. Vui lòng nhấn "Sign in with Google" để cấp quyền lại.');
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData?.error?.message || `Lỗi gửi email hỗ trợ qua Gmail API (Mã lỗi ${response.status})`;
    throw new Error(errMsg);
  }
};

