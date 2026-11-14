import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
export const SENDER_GMAIL = 'bonbenemail@gmail.com';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({ login_hint: SENDER_GMAIL });

let isSigningIn = false;
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

const sendMailViaBackend = async ({
  toEmail,
  cc,
  replyTo,
  subject,
  html,
  text,
}: {
  toEmail: string;
  cc?: string;
  replyTo?: string;
  subject: string;
  html?: string;
  text?: string;
}) => {
  let response: Response;
  const controller = new AbortController();
  let timeoutId = 0;
  try {
    response = await Promise.race([
      fetch('/api/send-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail, cc, replyTo, subject, html, text }),
        signal: controller.signal,
      }),
      new Promise<never>((_resolve, reject) => {
        timeoutId = window.setTimeout(() => {
          controller.abort();
          reject(new Error('EMAIL_REQUEST_TIMEOUT'));
        }, 15000);
      }),
    ]);
  } catch (error) {
    if (error instanceof Error && error.message === 'EMAIL_REQUEST_TIMEOUT') {
      throw new Error(
        'Máy chủ gửi email không phản hồi trong 15 giây. Website có thể chưa triển khai backend gửi email.'
      );
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Yêu cầu gửi email đã bị hủy. Vui lòng thử lại.');
    }
    if (error instanceof TypeError) {
      throw new Error(
        'Không kết nối được máy chủ gửi email trên web. Website cần được triển khai cùng backend gửi email.'
      );
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  let data: { ok?: boolean; message?: string };
  try {
    data = await response.json();
  } catch {
    throw new Error(
      `Máy chủ email trả về phản hồi không hợp lệ (HTTP ${response.status}). Hãy kiểm tra cấu hình triển khai backend.`
    );
  }

  if (!response.ok || data.ok !== true) {
    throw new Error(
      data.message || `Máy chủ không gửi được email (HTTP ${response.status}).`
    );
  }

  return data;
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
  const subjectText = `[Lớp học Bon Ben] Mã xác thực 6 số tạo tài khoản: ${otpCode}`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #bae6fd; border-radius: 16px; background-color: #f0f9ff;">
      <div style="background: linear-gradient(90deg, #0c4a6e, #0284c7); padding: 18px 24px; border-radius: 12px; color: #ffffff; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">LỚP HỌC BON BEN</h2>
        <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Hệ thống học tập trực tuyến Toán - Tiếng Việt - Tiếng Anh</p>
      </div>
      <div style="background: #ffffff; padding: 24px; border-radius: 12px; margin-top: 16px; border: 1px solid #e0f2fe;">
        <p style="font-size: 14px; color: #334155; margin-top: 0;">Xin chào <strong>${studentName}</strong> (Đăng ký <strong>Lớp ${grade}</strong>),</p>
        <p style="font-size: 14px; color: #334155; line-height: 1.5;">Cảm ơn bạn đã đăng ký tài khoản tại <strong>Lớp học Bon Ben</strong>. Đây là mã xác thực gồm 6 chữ số để hoàn tất tạo tài khoản của bạn:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #0369a1; background: #e0f2fe; padding: 14px 28px; border-radius: 12px; border: 2px solid #38bdf8; font-family: monospace;">${otpCode}</span>
        </div>
        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 0;">Vui lòng quay lại trang đăng ký <strong>Lớp học Bon Ben</strong> và nhập đúng 6 chữ số này để kích hoạt tài khoản. Tuyệt đối không chia sẻ mã này cho người khác.</p>
      </div>
      <p style="text-align: center; font-size: 11px; color: #64748b; margin: 14px 0 0;">Email được gửi tự động từ Hệ thống Lớp học Bon Ben.</p>
    </div>
  `.trim();

  await sendMailViaBackend({
    toEmail: toEmail.trim(),
    cc: SENDER_GMAIL,
    replyTo: SENDER_GMAIL,
    subject: subjectText,
    html: htmlBody,
    text: `Mã xác thực của bạn là ${otpCode}. Vui lòng nhập đúng 6 chữ số trong trang đăng ký.`,
  });
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
  const subjectText = `[Lớp học Bon Ben] Mã 6 số khôi phục mật khẩu tài khoản: ${otpCode}`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #bae6fd; border-radius: 16px; background-color: #f0f9ff;">
      <div style="background: linear-gradient(90deg, #0c4a6e, #0284c7); padding: 18px 24px; border-radius: 12px; color: #ffffff; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">LỚP HỌC BON BEN - KHÔI PHỤC MẬT KHẨU</h2>
        <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Hệ thống học tập trực tuyến Văn - Toán - Anh</p>
      </div>
      <div style="background: #ffffff; padding: 24px; border-radius: 12px; margin-top: 16px; border: 1px solid #e0f2fe;">
        <p style="font-size: 14px; color: #334155; margin-top: 0;">Xin chào <strong>${studentName}</strong> (Tài khoản: <strong>${toEmail}</strong>),</p>
        <p style="font-size: 14px; color: #334155; line-height: 1.5;">Hệ thống <strong>Lớp học Bon Ben</strong> vừa nhận được yêu cầu đặt lại mật khẩu cho tài khoản Gmail của bạn. Đây là mã xác thực gồm 6 chữ số để đổi mật khẩu mới:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #0369a1; background: #e0f2fe; padding: 14px 28px; border-radius: 12px; border: 2px solid #38bdf8; font-family: monospace;">${otpCode}</span>
        </div>
        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 0;">Vui lòng nhập đúng 6 chữ số này trên cửa sổ <strong>Quên mật khẩu</strong> để thiết lập mật khẩu mới. Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.</p>
      </div>
      <p style="text-align: center; font-size: 11px; color: #64748b; margin: 14px 0 0;">Email được gửi tự động từ Hệ thống Lớp học Bon Ben.</p>
    </div>
  `.trim();

  await sendMailViaBackend({
    toEmail: toEmail.trim(),
    cc: SENDER_GMAIL,
    replyTo: SENDER_GMAIL,
    subject: subjectText,
    html: htmlBody,
    text: `Mã khôi phục mật khẩu của bạn là ${otpCode}. Vui lòng nhập đúng mã này để đặt lại mật khẩu mới.`,
  });
};
