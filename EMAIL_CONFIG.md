# 📧 Email конфигурациясы - Барлық провайдерлер үшін / Email Configuration for All Providers

EduHelp платформасы OTP кодын email арқылы жіберу үшін **Nodemailer** пайдаланады. Nodemailer барлық SMTP провайдерлерді қолдайды.

---

## 📋 Қолдаулы провайдерлер / Supported Providers

✅ Gmail (Google)
✅ Mail.ru
✅ BK.ru
✅ Yandex
✅ Outlook / Hotmail
✅ Yahoo Mail
✅ iCloud
✅ Кез келген SMTP сервер / Any SMTP server

---

## 🔧 Конфигурация / Configuration

### 1️⃣ Gmail

**App Password жасау керек:**

1. Google Account Settings-ке кіріңіз: https://myaccount.google.com/
2. Security → 2-Step Verification қосыңыз
3. App Passwords → Mail → Create
4. 16 таңбалы паролді көшіріп алыңыз

**`.env` файл:**
```env
# Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx    # App password (16 таңба)
EMAIL_FROM_NAME=EduHelp
EMAIL_FROM_ADDRESS=your-email@gmail.com
```

---

### 2️⃣ Mail.ru

**App Password жасау керек:**

1. Mail.ru-ға кіріңіз
2. Настройки → Пароль и безопасность
3. Пароли для внешних приложений → Создать
4. "EduHelp" деп атап, паролді көшіріңіз

**`.env` файл:**
```env
# Mail.ru SMTP
SMTP_HOST=smtp.mail.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@mail.ru
SMTP_PASS=app-password-here
EMAIL_FROM_NAME=EduHelp
EMAIL_FROM_ADDRESS=your-email@mail.ru
```

---

### 3️⃣ BK.ru (Bk.ru)

Bk.ru Mail.ru-дың бөлігі, сондықтан бірдей конфигурация.

**`.env` файл:**
```env
# BK.ru SMTP (Mail.ru infrastructure)
SMTP_HOST=smtp.mail.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@bk.ru
SMTP_PASS=app-password-here
EMAIL_FROM_NAME=EduHelp
EMAIL_FROM_ADDRESS=your-email@bk.ru
```

---

### 4️⃣ Yandex

**`.env` файл:**
```env
# Yandex SMTP
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@yandex.ru
SMTP_PASS=your-password
EMAIL_FROM_NAME=EduHelp
EMAIL_FROM_ADDRESS=your-email@yandex.ru
```

**Ескерту:** Yandex-те "Access for less secure apps" қосу керек болуы мүмкін.

---

### 5️⃣ Outlook / Hotmail

**`.env` файл:**
```env
# Outlook/Hotmail SMTP
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
EMAIL_FROM_NAME=EduHelp
EMAIL_FROM_ADDRESS=your-email@outlook.com
```

---

### 6️⃣ Yahoo Mail

**App Password жасау керек:**

1. Yahoo Account Security-ге кіріңіз
2. Generate app password
3. "EduHelp" деп атап, паролді көшіріңіз

**`.env` файл:**
```env
# Yahoo SMTP
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@yahoo.com
SMTP_PASS=app-password-here
EMAIL_FROM_NAME=EduHelp
EMAIL_FROM_ADDRESS=your-email@yahoo.com
```

---

### 7️⃣ iCloud (Apple)

**App-specific password жасау керек:**

1. appleid.apple.com → Security
2. App-Specific Passwords → Generate
3. Паролді көшіріңіз

**`.env` файл:**
```env
# iCloud SMTP
SMTP_HOST=smtp.mail.me.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@icloud.com
SMTP_PASS=app-specific-password
EMAIL_FROM_NAME=EduHelp
EMAIL_FROM_ADDRESS=your-email@icloud.com
```

---

### 8️⃣ Өз серверіңіз / Custom SMTP Server

**`.env` файл:**
```env
# Custom SMTP
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587               # немесе 465
SMTP_SECURE=false           # true for port 465
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-password
EMAIL_FROM_NAME=EduHelp
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
```

---

## 🔍 SMTP портар / SMTP Ports

| Порт | Қауіпсіздік | Қолданылуы |
|------|-------------|-----------|
| **25** | Жоқ | Ескі, көп провайдерлер блоктайды |
| **465** | SSL | Тікелей SSL (SMTP_SECURE=true) |
| **587** | STARTTLS | Қауіпсіз (SMTP_SECURE=false) |
| **2525** | STARTTLS | Alternative port (кейбір хостингтер) |

**Ұсыныс:** Порт 587 пайдаланыңыз (STARTTLS).

---

## 🧪 Тестілеу / Testing

### Backend серверді іске қосу

```bash
cd backend
npm install
npm run dev
```

### OTP жіберуді тестілеу

**1. API endpoint арқылы:**

```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com"}'
```

**2. Frontend арқылы:**

1. http://localhost:5173/auth ашыңыз
2. Email енгізіңіз
3. "Код жіберу" басыңыз
4. Email-ді тексеріңіз

### Development режимде тестілеу

Егер SMTP конфигурация дұрыс емес болса, код консольда көрсетіледі:

```
🔑 Development mode - Email код: 123456 → test@example.com
```

API response-та да қайтарылады:

```json
{
  "success": false,
  "devMode": true,
  "code": "123456",
  "error": "Email жіберу қатесі. Қайтадан көріңіз."
}
```

---

## 🐛 Troubleshooting

### 1. "Invalid login credentials"

**Себебі:** Құпия сөз қате немесе App Password қажет

**Шешім:**
- Gmail: App Password жасаңыз
- Mail.ru: Пароли для внешних приложений
- Yahoo: App Password

---

### 2. "Connection timeout"

**Себебі:** SMTP_HOST немесе PORT қате

**Шешім:**
```env
# Тексеріңіз:
SMTP_HOST=smtp.gmail.com     # Дұрыс host
SMTP_PORT=587                # Дұрыс port
```

---

### 3. "Self signed certificate"

**Себебі:** SSL certificate проблемасы

**Шешім:**

`backend/utils/sendOTP.js`-те TLS параметрін қосыңыз:

```javascript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false  // ⬅️ Бұл
  }
});
```

---

### 4. "Too many connections"

**Себебі:** Провайдер rate limit қойған

**Шешім:**
- Кішкене күтіңіз (5-10 минут)
- Басқа email қолданыңыз
- Connection pool пайдаланыңыз:

```javascript
const transporter = nodemailer.createTransport({
  // ... бұрынғы конфигурация
  pool: true,
  maxConnections: 5,
  maxMessages: 100
});
```

---

### 5. Email Spam-ға түседі

**Шешім:**

1. **SPF Record қосыңыз** (domain үшін):
   ```
   v=spf1 include:_spf.google.com ~all
   ```

2. **DKIM қосыңыз** (провайдер settings-те)

3. **Email мәтінін жақсартыңыз:**
   - Spam сөздерді пайдаланбаңыз ("FREE", "WINNER", т.б.)
   - HTML дұрыс форматталған болуы керек
   - Қолданушы өзі сұраған email болуы керек

---

## 📊 Email статистикасы / Email Statistics

### Жіберу лимиттері / Sending Limits

| Провайдер | Күніне / Day | Сағатына / Hour |
|-----------|--------------|-----------------|
| Gmail | 500 | 100 |
| Mail.ru | 100 | 50 |
| Yandex | 500 | 100 |
| Outlook | 300 | 100 |
| Yahoo | 500 | 100 |

**Ескерту:** Лимиттер өзгеруі мүмкін. Провайдердің ресми құжаттамасын қараңыз.

---

## 🔐 Қауіпсіздік / Security

### ⚠️ Маңызды ескертулер:

1. **App Passwords пайдаланыңыз** - негізгі құпия сөзді `.env` файлға қоймаңыз
2. **`.env` файлды git-ке қоспаңыз** - `.gitignore`-да болуы керек
3. **Production-та environment variables пайдаланыңыз** - файлда емес
4. **Rate limiting қосыңыз** - spam-дан қорғау үшін
5. **HTTPS пайдаланыңыз** - production environment-та

---

## 📝 Нұсқаулар / Best Practices

### 1. Environment-қа қарай конфигурация

```javascript
// backend/utils/sendOTP.js

const getEmailConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production SMTP
    return {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    };
  } else {
    // Development - Mailtrap немесе logging
    return {
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: 'your-mailtrap-user',
        pass: 'your-mailtrap-pass'
      }
    };
  }
};
```

### 2. Email template-терді бөлек файлға шығару

```javascript
// backend/utils/emailTemplates.js

const otpTemplate = (code) => `
<!DOCTYPE html>
<html>
<body>
  <div style="max-width: 600px; margin: 0 auto;">
    <h1>Кіру коды</h1>
    <p>Сіздің кіру кодыңыз: <strong>${code}</strong></p>
  </div>
</body>
</html>
`;

module.exports = { otpTemplate };
```

### 3. Queue жүйесі (production үшін)

Үлкен жобаларда Bull Queue немесе RabbitMQ пайдаланыңыз:

```javascript
const Queue = require('bull');
const emailQueue = new Queue('email', 'redis://127.0.0.1:6379');

// Job қосу
emailQueue.add({ email, code });

// Worker
emailQueue.process(async (job) => {
  const { email, code } = job.data;
  await sendEmailOTP(email, code);
});
```

---

## ✅ Қорытынды / Summary

EduHelp барлық SMTP провайдерлермен жұмыс істейді:

1. ✅ Gmail, Mail.ru, BK.ru - **App Password қажет**
2. ✅ Yandex, Outlook - **Құпия сөзбен жұмыс істейді**
3. ✅ Өз сервер - **Кез келген SMTP**

**`.env` файлында конфигурацияны орнатыңыз** - backend автоматты қолданады!

---

## 📞 Көмек / Support

Егер email жұмыс істемесе:

1. Console логтарын тексеріңіз: `npm run dev`
2. SMTP параметрлерін тексеріңіз
3. Провайдердің құжаттамасын оқыңыз
4. Development режимде тестілеңіз

---

**© 2025 EduHelp - Email жүйесі құжаттамасы**
