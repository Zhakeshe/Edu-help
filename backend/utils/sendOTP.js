const nodemailer = require('nodemailer');

// 6 санды код генерациялау
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Email арқылы код жіберу
const sendEmailOTP = async (email, code) => {
  try {
    // Nodemailer transporter (Өз хостингіңіздің SMTP)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.eduhelp.kz',
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE === 'true' || true, // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER || 'noreply@eduhelp.kz',
        pass: process.env.SMTP_PASS || ''
      },
      tls: {
        rejectUnauthorized: false // Кейбір хостингтер үшін керек
      }
    });

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Edu-help Platform'}" <${process.env.EMAIL_FROM_ADDRESS || 'noreply@eduhelp.kz'}>`,
      to: email,
      subject: 'Кіру коды - Edu-help',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">📚 Edu-help</h1>
          </div>

          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #374151; margin-top: 0;">Сіздің кіру кодыңыз:</h2>

            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px;">
                ${code}
              </div>
            </div>

            <p style="color: #6b7280; margin: 15px 0;">Бұл код <strong>10 минут</strong> ішінде жарамды.</p>

            <p style="color: #6b7280; margin: 15px 0;">
              Егер сіз бұл кодты сұрамаған болсаңыз, бұл хатты елемеңіз.
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              © 2024 Edu-help Platform. Барлық құқықтар қорғалған.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email код жіберілді: ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email жіберу қатесі:', error.message);

    // Қате болса, консольға жазамыз (development үшін)
    console.log(`\n🔑 Development mode - Email код: ${code} → ${email}\n`);

    return {
      success: false,
      error: 'Email жіберу қатесі. Қайтадан көріңіз.',
      devMode: true,
      code: process.env.NODE_ENV === 'development' ? code : undefined
    };
  }
};

// SMS арқылы код жіберу
const sendSMSOTP = async (phone, code) => {
  try {
    // TODO: SMS API интеграциясы (Twilio, Vonage, т.б.)
    // Қазір console.log-пен тестілейміз

    console.log(`\n📱 SMS код жіберілді:`);
    console.log(`   Телефон: ${phone}`);
    console.log(`   Код: ${code}`);
    console.log(`   Мерзімі: 10 минут\n`);

    // Development mode-та код қайтарамыз
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        devMode: true,
        message: 'SMS жіберу функциясы әзірлеу режимінде. Код консольда.',
        code
      };
    }

    // Production mode-та SMS API қолдану керек
    // Мысалы: Twilio, Vonage, Infobip т.б.
    /*
    const twilioClient = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await twilioClient.messages.create({
      body: `Edu-help кіру коды: ${code}. Код 10 минут жарамды.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    */

    return {
      success: true,
      message: 'SMS жіберілді (dev mode)'
    };
  } catch (error) {
    console.error('❌ SMS жіберу қатесі:', error.message);
    return {
      success: false,
      error: 'SMS жіберу қатесі. Қайтадан көріңіз.'
    };
  }
};

module.exports = {
  generateOTP,
  sendEmailOTP,
  sendSMSOTP
};
