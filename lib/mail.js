import 'server-only';

/* Sends email through Resend (RESEND_API_KEY) or SMTP (SMTP_HOST ...). Returns { ok, error }. */
export const mailEnabled = () => Boolean(process.env.RESEND_API_KEY || process.env.SMTP_HOST);

export async function sendMail({ to, subject, html, text, replyTo, fromName }) {
  if (!mailEnabled()) return { ok: false, error: 'Email is not set up. Add RESEND_API_KEY or the SMTP_* variables.' };
  const fromEmail = process.env.MAIL_FROM || process.env.SMTP_USER || 'onboarding@resend.dev';
  const from = `${fromName || 'Manik Hossain'} <${fromEmail}>`;
  try {
    if (process.env.RESEND_API_KEY) {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [].concat(to), subject, html, text, reply_to: replyTo || undefined }),
      });
      if (!r.ok) { const j = await r.json().catch(() => ({})); return { ok: false, error: j.message || `Resend error ${r.status}` }; }
      return { ok: true };
    }
    const nodemailer = (await import('nodemailer')).default;
    const port = Number(process.env.SMTP_PORT || 465);
    const t = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
    await t.sendMail({ from, to, subject, html, text, replyTo });
    return { ok: true };
  } catch (e) {
    console.error('[mail]', e.message);
    return { ok: false, error: e.message };
  }
}

/* Short alert to the site owner. */
export async function notify(subject, text, html) {
  const to = process.env.NOTIFY_EMAIL;
  if (!to || !mailEnabled()) return;
  await sendMail({ to, subject, text, html });
}
