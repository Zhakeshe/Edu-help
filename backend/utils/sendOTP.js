const nodemailer = require('nodemailer');
const TelegramBot = require('node-telegram-bot-api');

// Telegram Bot instance (тек қажет болғанда іске қосамыз)
let telegramBot = null;

const getTelegramBot = () => {
  if (!telegramBot && process.env.TELEGRAM_BOT_TOKEN) {
    telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
  }
  return telegramBot;
};

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
              © 2025 Edu-help Platform. Барлық құқықтар қорғалған.
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

// SMS арқылы код жіберу (SMSC.kz API)
const sendSMSOTP = async (phone, code) => {
  try {
    // Телефон нөмірін форматтау (+7 → 7)
    const cleanPhone = phone.replace(/[^\d]/g, '');

    // Development mode - тек консольға шығару
    if (!process.env.SMSC_LOGIN || !process.env.SMSC_PASSWORD) {
      console.log(`\n📱 SMS код (DEV MODE):`);
      console.log(`   Телефон: ${phone}`);
      console.log(`   Код: ${code}`);
      console.log(`   Мерзімі: 10 минут`);
      console.log(`   ⚠️  SMSC конфигурациясы жоқ (.env файлында SMSC_LOGIN/SMSC_PASSWORD қосыңыз)\n`);

      return {
        success: true,
        devMode: true,
        message: 'SMS жіберу функциясы әзірлеу режимінде. Код консольда.',
        code
      };
    }

    // SMSC.kz API арқылы SMS жіберу
    const https = require('https');
    const querystring = require('querystring');

    const params = querystring.stringify({
      login: process.env.SMSC_LOGIN,
      psw: process.env.SMSC_PASSWORD,
      phones: cleanPhone,
      mes: `Edu-help кіру коды: ${code}. Код 10 минут жарамды.`,
      sender: process.env.SMSC_SENDER || 'Edu-help',
      charset: 'utf-8'
    });

    const url = `https://smsc.kz/sys/send.php?${params}`;

    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            // SMSC жауабын парсинг
            const response = JSON.parse(data);

            if (response.error) {
              console.error('❌ SMSC қатесі:', response.error_code, response.error);
              resolve({
                success: false,
                error: 'SMS жіберу қатесі. Қайтадан көріңіз.'
              });
            } else {
              console.log(`✅ SMS жіберілді: ${phone} (ID: ${response.id})`);
              resolve({
                success: true,
                message: 'SMS жіберілді'
              });
            }
          } catch (parseError) {
            console.error('❌ SMSC жауабын парсинг қатесі:', parseError.message);
            resolve({
              success: false,
              error: 'SMS жіберу қатесі. Қайтадан көріңіз.'
            });
          }
        });
      }).on('error', (error) => {
        console.error('❌ SMS жіберу қатесі:', error.message);
        resolve({
          success: false,
          error: 'SMS жіберу қатесі. Қайтадан көріңіз.'
        });
      });
    });
  } catch (error) {
    console.error('❌ SMS жіберу қатесі:', error.message);

    // Қате болса, консольға жазамыз (development үшін)
    console.log(`\n📱 Development mode - SMS код: ${code} → ${phone}\n`);

    return {
      success: false,
      error: 'SMS жіберу қатесі. Қайтадан көріңіз.',
      devMode: true,
      code: process.env.NODE_ENV === 'development' ? code : undefined
    };
  }
};

// Telegram арқылы код жіберу (ТЕГІН! 🎉)
const sendTelegramOTP = async (telegramId, code) => {
  try {
    // Development mode - тек консольға шығару
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.log(`\n💬 Telegram код (DEV MODE):`);
      console.log(`   Telegram ID/Username: ${telegramId}`);
      console.log(`   Код: ${code}`);
      console.log(`   Мерзімі: 10 минут`);
      console.log(`   ⚠️  TELEGRAM_BOT_TOKEN жоқ (.env файлында қосыңыз)\n`);

      return {
        success: true,
        devMode: true,
        message: 'Telegram жіберу функциясы әзірлеу режимінде. Код консольда.',
        code
      };
    }

    const bot = getTelegramBot();

    if (!bot) {
      throw new Error('Telegram Bot інициализациялау қатесі');
    }

    // Telegram хабарламасы (emoji және форматтаумен)
    const message = `
🎓 *Edu-help Platform*

🔐 Сіздің кіру кодыңыз:

\`${code}\`

⏰ Код *10 минут* ішінде жарамды.

_Егер сіз бұл кодты сұрамаған болсаңыз, бұл хабарламаны елемеңіз._
    `.trim();

    // Telegram-ға жіберу
    await bot.sendMessage(telegramId, message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });

    console.log(`✅ Telegram код жіберілді: ${telegramId}`);

    return {
      success: true,
      message: 'Telegram хабарламасы жіберілді'
    };
  } catch (error) {
    console.error('❌ Telegram жіберу қатесі:', error.message);

    // Қате болса, консольға жазамыз (development үшін)
    console.log(`\n💬 Development mode - Telegram код: ${code} → ${telegramId}\n`);

    // Егер пайдаланушы ботты бастамаған болса
    if (error.message.includes('bot was blocked') || error.message.includes('user not found')) {
      return {
        success: false,
        error: 'Telegram ботын бастаңыз! @YourBotName ботын іске қосып, /start басыңыз.',
        needsBotStart: true
      };
    }

    return {
      success: false,
      error: 'Telegram жіберу қатесі. Қайтадан көріңіз.',
      devMode: true,
      code: process.env.NODE_ENV === 'development' ? code : undefined
    };
  }
};

module.exports = {
  generateOTP,
  sendEmailOTP,
  sendSMSOTP,
  sendTelegramOTP
};
