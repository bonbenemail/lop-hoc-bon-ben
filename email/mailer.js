import nodemailer from 'nodemailer';

export class MailRequestError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'MailRequestError';
    this.statusCode = statusCode;
  }
}

let transporter;

const getMailerSettings = () => {
  const mailFrom = (process.env.MAIL_FROM || process.env.SMTP_USER || '').trim();
  const mailFromName = process.env.MAIL_FROM_NAME?.trim() || 'Lớp học Bon Ben';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mailFrom)) {
    throw new Error('MAIL_FROM chưa được cấu hình bằng địa chỉ gửi đã xác minh.');
  }

  return { mailFrom, mailFromName };
};

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || 465);
  const secureSetting = process.env.SMTP_SECURE?.trim().toLowerCase();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('SMTP_HOST hoặc SMTP_PORT chưa được cấu hình hợp lệ.');
  }
  if (!user || !pass) {
    throw new Error('SMTP_USER và SMTP_PASS chưa được cấu hình trong môi trường hosting.');
  }
  if (secureSetting && secureSetting !== 'true' && secureSetting !== 'false') {
    throw new Error('SMTP_SECURE chỉ được nhận true hoặc false.');
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: secureSetting ? secureSetting === 'true' : port === 465,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    auth: { user, pass },
  });

  return transporter;
};

export const verifyEmailProvider = async () => {
  if (process.env.VERCEL) {
    if (!process.env.RESEND_API_KEY?.trim()) {
      throw new Error('Thiếu RESEND_API_KEY trong Environment Variables trên Vercel.');
    }
    getMailerSettings();
    return 'resend-api-configured';
  }

  await getTransporter().verify();
  return 'smtp';
};

const sendWithResend = async ({ mailFrom, mailFromName, recipient, subject, html, text, replyTo, cc }) => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('RESEND_API_KEY chưa được cấu hình trong Environment Variables trên Vercel.');
  }

  let response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${mailFromName} <${mailFrom}>`,
        to: [recipient],
        cc: cc ? [cc] : undefined,
        reply_to: replyTo || mailFrom,
        subject,
        text: text || 'Lớp học Bon Ben',
        html: html || text || '',
      }),
      signal: AbortSignal.timeout(12000),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new Error('Resend không phản hồi trong 12 giây.');
    }
    throw new Error('Không kết nối được Resend API từ Vercel.');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Resend trả về phản hồi không hợp lệ (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    throw new Error(
      typeof data?.message === 'string'
        ? data.message
        : `Resend không gửi được email (HTTP ${response.status}).`
    );
  }
  if (typeof data?.id !== 'string' || !data.id) {
    throw new Error('Resend chưa xác nhận đã nhận yêu cầu gửi email.');
  }

  return { messageId: data.id, accepted: [recipient] };
};

export const sendEmail = async (payload) => {
  const { toEmail, subject, html, text, replyTo, cc } = payload || {};

  if (
    typeof toEmail !== 'string' ||
    typeof subject !== 'string' ||
    (!html && !text) ||
    (html !== undefined && typeof html !== 'string') ||
    (text !== undefined && typeof text !== 'string') ||
    (cc !== undefined && typeof cc !== 'string') ||
    (replyTo !== undefined && typeof replyTo !== 'string')
  ) {
    throw new MailRequestError(400, 'Thông tin email không hợp lệ hoặc thiếu trường bắt buộc.');
  }

  const recipient = toEmail.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    throw new MailRequestError(400, 'Địa chỉ email nhận không hợp lệ.');
  }
  const { mailFrom, mailFromName } = getMailerSettings();

  if (process.env.VERCEL) {
    return sendWithResend({
      mailFrom,
      mailFromName,
      recipient,
      subject,
      html,
      text,
      replyTo,
      cc,
    });
  }

  const info = await getTransporter().sendMail({
    from: { name: mailFromName, address: mailFrom },
    to: recipient,
    cc: cc || undefined,
    replyTo: replyTo || mailFrom,
    subject,
    text: text || 'Lớp học Bon Ben',
    html: html || text || '',
  });

  const accepted = info.accepted || [];
  const acceptedRecipient = accepted.some((address) =>
    (typeof address === 'string' ? address : address.address).toLowerCase() ===
    recipient.toLowerCase()
  );

  if (!acceptedRecipient) {
    throw new MailRequestError(502, 'Máy chủ email không chấp nhận địa chỉ người nhận.');
  }

  return { messageId: info.messageId, accepted };
};
