import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

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

    if (!toEmail || !subject || (!html && !text)) {
      return res.status(400).json({
        ok: false,
        message: 'Thiếu trường bắt buộc: toEmail, subject, html/text.',
      });
    }

    const transporter = getTransporter();
    const mailFrom = process.env.MAIL_FROM || process.env.SMTP_USER;
    const mailFromName = process.env.MAIL_FROM_NAME || 'Lớp học Bon Ben';

    const info = await transporter.sendMail({
      from: `${mailFromName} <${mailFrom}>`,
      to: toEmail,
      cc: cc || undefined,
      replyTo: replyTo || mailFrom,
      subject,
      text: text || 'Lớp học Bon Ben',
      html: html || text || '',
    });

    return res.json({
      ok: true,
      messageId: info.messageId,
      accepted: info.accepted || [toEmail],
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

app.listen(port, '0.0.0.0', () => {
  console.log(`Bon Ben mailer running on http://localhost:${port}`);
});
