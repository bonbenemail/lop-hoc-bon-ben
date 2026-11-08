const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const SENDER_GMAIL = "bonbenemail@gmail.com";

export interface SendOtpEmailParams {
  toEmail: string;
  studentName: string;
  grade: number;
  otpCode: string;
}

export interface SendPasswordResetOtpParams {
  toEmail: string;
  studentName: string;
  otpCode: string;
}

export interface SendSupportEmailParams {
  senderName: string;
  senderEmail: string;
  gradeInfo: string;
  schoolInfo: string;
  topic: string;
  issueContent: string;
}

async function callEmailFunction(payload: Record<string, unknown>): Promise<void> {
  const apiUrl = `${SUPABASE_URL}/functions/v1/send-email`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (SUPABASE_ANON_KEY) {
    headers["Authorization"] = `Bearer ${SUPABASE_ANON_KEY}`;
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errMsg = `Lỗi gửi email (Mã lỗi ${response.status})`;
    try {
      const errData = await response.json();
      if (errData?.error) errMsg = errData.error;
    } catch {
      // ignore parse error
    }
    throw new Error(errMsg);
  }

  const data = await response.json();
  if (data?.error) {
    throw new Error(data.error);
  }
}

export const sendVerificationOtpViaGmail = async ({
  toEmail,
  studentName,
  grade,
  otpCode,
}: SendOtpEmailParams): Promise<void> => {
  await callEmailFunction({
    type: "verify-otp",
    toEmail,
    studentName,
    grade,
    otpCode,
  });
};

export const sendPasswordResetOtpViaGmail = async ({
  toEmail,
  studentName,
  otpCode,
}: SendPasswordResetOtpParams): Promise<void> => {
  await callEmailFunction({
    type: "reset-password",
    toEmail,
    studentName,
    otpCode,
  });
};

export const sendSupportEmailViaGmail = async ({
  senderName,
  senderEmail,
  gradeInfo,
  schoolInfo,
  topic,
  issueContent,
}: SendSupportEmailParams): Promise<void> => {
  await callEmailFunction({
    type: "support",
    toEmail: SENDER_GMAIL,
    senderName,
    senderEmail,
    gradeInfo,
    schoolInfo,
    topic,
    issueContent,
  });
};
