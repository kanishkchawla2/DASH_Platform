import nodemailer from 'nodemailer';

let transporter = null;

function getTransport() {
  if (transporter) return transporter;
  const user = process.env.GMAIL_EMAIL;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
  return transporter;
}

export async function sendNotification({ symbol, userEmail, userName, notes, requestId }) {
  const transport = getTransport();
  if (!transport) {
    console.log('[Mail] Gmail not configured — skipping email');
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'kanishkchawla2@gmail.com';
  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const adminLink = `${appUrl}/admin`;

  await transport.sendMail({
    from: `"DASH Platform" <${process.env.GMAIL_EMAIL}>`,
    to: adminEmail,
    subject: `[DASH] New Report Request: ${symbol}`,
    html: `
      <div style="font-family: system-ui; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #06b6d4;">New Report Request</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #64748b;">Symbol</td><td style="padding: 8px 0; font-weight: 700;">${symbol}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Requested by</td><td style="padding: 8px 0;">${userName} (${userEmail})</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Notes</td><td style="padding: 8px 0;">${notes || '—'}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Request ID</td><td style="padding: 8px 0; font-family: monospace;">${requestId}</td></tr>
        </table>
        <a href="${adminLink}" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #06b6d4; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Review in Admin Panel →
        </a>
      </div>
    `,
  });

  console.log(`[Mail] Notification sent for ${symbol}`);
}
