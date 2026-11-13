import { MailRequestError, sendEmail } from '../email/mailer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, message: 'Phương thức không được hỗ trợ.' });
  }

  try {
    const result = await sendEmail(req.body);
    return res.json({ ok: true, ...result });
  } catch (error) {
    const statusCode = error instanceof MailRequestError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Gửi email thất bại.';
    console.error('MAIL_SEND_ERROR:', message);
    return res.status(statusCode).json({ ok: false, message });
  }
}
