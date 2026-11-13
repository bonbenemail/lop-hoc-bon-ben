import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const projectDirectory = path.dirname(fileURLToPath(import.meta.url));
const buildDirectory = path.join(projectDirectory, 'dist');

app.use(express.json({ limit: '1mb' }));

const getTransporter = () => {
  const host = process.env.SMTP_HOST?.trim();
  const portNo = Number(process.env.SMTP_PORT || 465);
  const secureSetting = process.env.SMTP_SECURE?.trim().toLowerCase();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !Number.isInteger(portNo) || portNo < 1 || portNo > 65535) {
    throw new Error('SMTP_HOST hoặc SMTP_PORT trong file .env không hợp lệ.');
  }
  if (!user || !pass) {
    throw new Error('SMTP_USER và SMTP_PASS chưa được cấu hình trong file .env.');
  }
  if (secureSetting && secureSetting !== 'true' && secureSetting !== 'false') {
    throw new Error('SMTP_SECURE trong file .env chỉ được nhận true hoặc false.');
  }

  return nodemailer.createTransport({
    host,
    port: portNo,
    secure: secureSetting ? secureSetting === 'true' : portNo === 465,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    auth: { user, pass },
  });
};

app.get('/api/health', async (_req, res) => {
  try {
    await getTransporter().verify();
    return res.json({ ok: true, service: 'bonben-mailer', smtp: 'ready' });
  } catch (error) {
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String(error.code)
        : 'SMTP_NOT_READY';
    console.error('MAIL_SMTP_VERIFY_ERROR:', code);
    return res.status(503).json({
      ok: false,
      service: 'bonben-mailer',
      message: 'SMTP chưa sẵn sàng. Kiểm tra cấu hình máy chủ gửi email trong file .env.',
    });
  }
});

app.post('/api/send-mail', async (req, res) => {
  try {
    const { toEmail, subject, html, text, replyTo, cc } = req.body || {};

    if (
      typeof toEmail !== 'string' ||
      typeof subject !== 'string' ||
      (!html && !text) ||
      (html !== undefined && typeof html !== 'string') ||
      (text !== undefined && typeof text !== 'string') ||
      (cc !== undefined && typeof cc !== 'string') ||
      (replyTo !== undefined && typeof replyTo !== 'string')
    ) {
      return res.status(400).json({
        ok: false,
        message: 'Thông tin email không hợp lệ hoặc thiếu trường bắt buộc.',
      });
    }

    const recipient = toEmail.trim();
    const mailFrom = process.env.MAIL_FROM?.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
      return res.status(400).json({ ok: false, message: 'Địa chỉ email nhận không hợp lệ.' });
    }
    if (!mailFrom || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mailFrom)) {
      throw new Error('MAIL_FROM chưa được cấu hình bằng địa chỉ gửi đã xác minh.');
    }

    const transporter = getTransporter();
    const mailFromName = process.env.MAIL_FROM_NAME || 'Lớp học Bon Ben';

    const info = await transporter.sendMail({
      from: `${mailFromName} <${mailFrom}>`,
      to: recipient,
      cc: cc || undefined,
      replyTo: replyTo || mailFrom,
      subject,
      text: text || 'Lớp học Bon Ben',
      html: html || text || '',
    });

    const acceptedRecipient = info.accepted.some((address) =>
      (typeof address === 'string' ? address : address.address).toLowerCase() ===
      recipient.toLowerCase()
    );
    if (!acceptedRecipient) {
      return res.status(502).json({
        ok: false,
        message: 'Máy chủ email không chấp nhận địa chỉ người nhận.',
      });
    }

    return res.json({
      ok: true,
      messageId: info.messageId,
      accepted: info.accepted,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gửi email thất bại.';
    console.error('MAIL_SEND_ERROR:', message);
    return res.status(500).json({
      ok: false,
      message,
    });
  }
});

app.use(express.static(buildDirectory, { index: false }));

app.get(/^(?!\/api\/).*/, (req, res, next) => {
  res.sendFile(path.join(buildDirectory, 'index.html'), (error) => {
    if (error) next(error);
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Bon Ben mailer running on http://localhost:${port}`);
});
