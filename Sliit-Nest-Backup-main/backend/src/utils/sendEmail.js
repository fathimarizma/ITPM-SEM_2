const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const isFakeSmtp = process.env.SMTP_EMAIL === 'your_email' || !process.env.SMTP_EMAIL;

  if (isFakeSmtp) {
    console.log('\n======================================================');
    console.log(`[MOCK EMAIL INTERCEPTED - Intended for ${options.email}]`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.message}`);
    console.log('======================================================\n');
    return;
  }

  // ─── Transporter (SMTP Configuration) ────────────────────────────────────────
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // 16-char App Password, NOT your Gmail password
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'SLIIT Nest'} <${process.env.FROM_EMAIL || 'noreply@sliitnest.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent Successfully: %s', info.messageId);
};

module.exports = sendEmail;
