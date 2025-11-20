# Үлкен файлдарды жүктеу - Setup нұсқаулығы

## Проблема
413 Request Entity Too Large қатесі - сервер деңгейіндегі body size шектеуі.

Backend кодта 500MB limit қойсақ та, web server (nginx, Vercel, т.б.) өз шектеуін қояды.

---

## Шешім 1: Nginx пайдалану (Өз серверіңізде/VPS)

### 1. Nginx орнату
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# macOS
brew install nginx
```

### 2. Конфигурация қолдану
Жобада `nginx.conf` файлы бар. Оны пайдаланыңыз:

```bash
# Конфигурацияны көшіру
sudo cp nginx.conf /etc/nginx/sites-available/eduhelp
sudo ln -s /etc/nginx/sites-available/eduhelp /etc/nginx/sites-enabled/

# Default конфигурацияны өшіру (қажет болса)
sudo rm /etc/nginx/sites-enabled/default

# Nginx қайта іске қосу
sudo nginx -t  # Тексеру
sudo systemctl restart nginx
```

### 3. Backend және Frontend іске қосу
```bash
# Backend (терминал 1)
cd backend
npm install
npm start  # Порт 5000

# Frontend (терминал 2)
cd frontend
npm install
npm run dev  # Порт 5173
```

### 4. Қол жеткізу
- Frontend: http://localhost (nginx арқылы)
- Backend API: http://localhost/api (nginx арқылы)

---

## Шешім 2: Vercel (Тек кішкентай файлдар)

⚠️ **Маңызды:** Vercel Serverless Functions үшін **4.5MB body size limit** бар.

Егер Vercel пайдалансаңыз:
- ✅ Тек кішкентай файлдар жүктей аласыз (< 4.5MB)
- ❌ Үлкен файлдар жүмыс істемейді

### Vercel-де alternative шешімдер:

#### А) Cloud Storage пайдалану (ұсынылады)
```javascript
// AWS S3, Cloudinary, немесе Uploadcare
// Presigned URLs арқылы тікелей жүктеу
```

#### Б) Chunked Upload
Файлды бөліктерге бөліп жүктеу (күрделі).

---

## Шешім 3: Railway / Render (ұсынылады)

Railway немесе Render платформаларында body size limit жоқ немесе өте жоғары.

### Railway deployment
```bash
# Railway CLI орнату
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Render deployment
1. GitHub-қа push жасаңыз
2. https://render.com -де жаңа Web Service жасаңыз
3. Repository-ді байланыстырыңыз
4. Build command: `cd backend && npm install`
5. Start command: `cd backend && npm start`

---

## Қазіргі конфигурация

### Backend limits
- Express body parser: 500MB ✅
- Multer file size: 500MB ✅
- Бірнеше файл: 20 файлға дейін ✅

### Frontend validation
- Файл өлшемі тексеруі: 500MB ✅
- Қате хабарламалар ✅

### Server (nginx/хостинг) - ЖӨНДЕУ ҚАЖЕТ
- Nginx: `nginx.conf` қолданыңыз ✅
- Vercel: 4.5MB limit (өзгертуге болмайды) ❌
- Railway/Render: Шектеу жоқ ✅

---

## Ұсыныс

**Production үшін:**
1. 🏆 **Railway немесе Render** - ең оңай және үлкен файлдар үшін жақсы
2. 🥈 **VPS + Nginx** - толық бақылау
3. 🥉 **Vercel + Cloud Storage** - қымбат, күрделі

**Development үшін:**
- Nginx қолданыңыз (жоғарыдағы нұсқауларды қараңыз)

---

## Тексеру

Қолданбаны іске қосқаннан кейін:
1. Admin панельге кіріңіз
2. Материал жүктеп көріңіз
3. Егер 413 қате шықса:
   - Nginx конфигурациясын тексеріңіз
   - `sudo systemctl status nginx`
   - `sudo nginx -t`
   - Логтарды қараңыз: `sudo tail -f /var/log/nginx/error.log`

---

## Көмек

Егер проблема жалғасса:
1. Қандай хостингте deploy еттіңіз? (Vercel/Railway/VPS)
2. 413 қате қай endpoint-те шығады?
3. Файл өлшемі қанша?
4. Browser console логын жіберіңіз
