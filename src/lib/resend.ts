import { Resend } from "resend";

export function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

// Resend requires a verified sender domain. Until chalkboardtuitions.in is verified,
// use onboarding@resend.dev which works on all Resend accounts out of the box.
export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
export const ADMIN_EMAIL = process.env.RESEND_TO_EMAIL || process.env.ADMIN_EMAIL || "admin@chalkboardtuitions.in";

export function buildConfirmationEmail(name: string, grade: string) {
  return {
    subject: "Your Free Demo Class is Confirmed — Chalkboard Tuitions 🎓",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', sans-serif; background: #fdf6e3; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 0 auto; background: #fff; }
    .header { background: #1e3a2f; padding: 40px 32px; text-align: center; }
    .header h1 { color: #f5f0e8; font-size: 24px; margin: 0 0 4px; font-family: Georgia, serif; }
    .header p { color: #f4c430; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0; }
    .body { padding: 32px; }
    .body h2 { color: #1e3a2f; font-size: 20px; font-family: Georgia, serif; }
    .body p { color: #444; font-size: 14px; line-height: 1.7; }
    .highlight { background: #fdf6e3; border-left: 4px solid #f4c430; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0; }
    .highlight p { margin: 0; color: #1a1a2e; }
    .cta { text-align: center; margin: 32px 0; }
    .cta a { background: #f4c430; color: #1e3a2f; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 14px; }
    .footer { background: #f5f0f0; padding: 24px 32px; text-align: center; }
    .footer p { color: #888; font-size: 12px; margin: 4px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <p>Chalkboard Tuitions</p>
      <h1>Demo Class Request Received!</h1>
    </div>
    <div class="body">
      <h2>Hi ${name} 👋</h2>
      <p>Thank you for your interest in Chalkboard Tuitions! We've received your demo class request for <strong>Grade ${grade}</strong>.</p>
      <div class="highlight">
        <p><strong>What happens next:</strong><br>
        Our team will WhatsApp you within 30 minutes to confirm your free demo slot. Please keep your phone handy!</p>
      </div>
      <p>Here's a quick reminder of what makes us different:</p>
      <ul style="color:#444;font-size:14px;line-height:2;">
        <li>✅ Max 8 students per batch — every child is seen</li>
        <li>✅ Daily classes, 5 days a week</li>
        <li>✅ CBSE · ICSE · Karnataka State Board</li>
        <li>✅ Branded workbooks & monthly progress cards</li>
        <li>✅ Weekly WhatsApp updates for parents</li>
      </ul>
      <div class="cta">
        <a href="https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}">Chat with us on WhatsApp →</a>
      </div>
    </div>
    <div class="footer">
      <p><strong>Chalkboard Tuitions</strong></p>
      <p>Kammanahalli & Kalyan Nagar, Bangalore</p>
      <p style="color:#bbb;font-size:11px;margin-top:12px;">You received this email because you submitted a demo request on our website.</p>
    </div>
  </div>
</body>
</html>`,
  };
}

export function buildAdminEmail(data: {
  name: string;
  email: string;
  phone: string;
  child_grade: string;
  board: string;
  message?: string;
}) {
  return {
    subject: `🔔 New Demo Request — ${data.name} (Grade ${data.child_grade})`,
    html: `
<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
  <h2 style="color:#1e3a2f;">New Lead — Chalkboard Tuitions</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;">${data.name}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;">${data.phone}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${data.email}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888;">Grade</td><td style="padding:8px;border-bottom:1px solid #eee;">${data.child_grade}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888;">Board</td><td style="padding:8px;border-bottom:1px solid #eee;">${data.board}</td></tr>
    ${data.message ? `<tr><td style="padding:8px;color:#888;vertical-align:top;">Message</td><td style="padding:8px;">${data.message}</td></tr>` : ""}
  </table>
  <div style="margin-top:20px;padding:16px;background:#fdf6e3;border-radius:8px;">
    <p style="margin:0;font-size:13px;color:#555;">📞 Call or WhatsApp this lead within 30 minutes for the best conversion rate.</p>
  </div>
</div>`,
  };
}
