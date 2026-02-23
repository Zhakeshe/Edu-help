const nodemailer = require('nodemailer');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

async function sendEmailOTP(email, code) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.eduhelp.kz',
      port: parseInt(process.env.SMTP_PORT, 10) || 465,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true,
      auth: {
        user: process.env.SMTP_USER || 'noreply@eduhelp.kz',
        pass: process.env.SMTP_PASS || ''
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Edu-help Platform'}" <${process.env.EMAIL_FROM_ADDRESS || 'noreply@eduhelp.kz'}>`,
      to: email,
      subject: '???? ???? - Edu-help',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">Edu-help</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #374151; margin-top: 0;">?????? ???? ???????:</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${code}</div>
            </div>
            <p style="color: #6b7280; margin: 15px 0;">??? ??? <strong>10 ?????</strong> ?????? ???????.</p>
            <p style="color: #6b7280; margin: 15px 0;">???? ??? ????? ??? ????????? ????????, ????? ????????.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">© 2026 Edu-help Platform.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return { success: true };
  } catch (error) {
    const devMode = process.env.NODE_ENV === 'development' && process.env.OTP_DEBUG === 'true';

    return {
      success: false,
      error: 'Email ?????? ??????. ???????? ???????.',
      devMode,
      code: devMode ? code : undefined
    };
  }
}

module.exports = {
  generateOTP,
  sendEmailOTP
};
