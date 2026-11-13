import { verifyEmailProvider } from '../email/mailer.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, message: 'Phương thức không được hỗ trợ.' });
  }

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
      message: 'SMTP chưa sẵn sàng. Kiểm tra Environment Variables trên Vercel.',
    });
  }
}
