import express from 'express';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MailRequestError, sendEmail, verifyEmailProvider } from './email/mailer.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const projectDirectory = path.dirname(fileURLToPath(import.meta.url));
const buildDirectory = path.join(projectDirectory, 'dist');

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (_req, res) => {
  try {
    const delivery = await verifyEmailProvider();
    return res.json({ ok: true, service: 'bonben-mailer', delivery });
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
    const result = await sendEmail(req.body);
    return res.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gửi email thất bại.';
    console.error('MAIL_SEND_ERROR:', message);
    return res.status(error instanceof MailRequestError ? error.statusCode : 500).json({
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
