# 🚀 EduHelp - Vercel/Railway Deploy нұсқаулығы

## 🎯 Ұсынылатын стратегия: Frontend Vercel + Backend Railway

### ✅ Артықшылықтары:
- ⚡ Жылдам орнату
- 💰 Тегін тарифтер
- 🔧 Оңай конфигурация
- 📊 Автоматты масштабтау

---

## 🌐 БӨЛІМ 1: Frontend - Vercel-ге deploy

### 1️⃣ Vercel аккаунтын жасау
1. https://vercel.com қосылыңыз
2. GitHub аккаунтымен кіріңіз
3. Repository-ді импорттаңыз

### 2️⃣ Vercel конфигурациясы

**Root Directory:** `frontend`

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
dist
```

**Install Command:**
```bash
npm install
```

### 3️⃣ Environment Variables (Vercel)

```env
VITE_API_URL=https://your-backend-url.up.railway.app
```

### 4️⃣ Deploy
- GitHub-қа push жасасаңыз - автоматты deploy болады
- Domain: `eduhelp.vercel.app`

---

## 🚂 БӨЛІМ 2: Backend - Railway-ге deploy

### 1️⃣ Railway аккаунтын жасау
1. https://railway.app қосылыңыз
2. GitHub аккаунтымен кіріңіз

### 2️⃣ MongoDB қосу

1. Railway Dashboard-та **"New"** → **"Database"** → **"MongoDB"**
2. Connection String алыңыз

### 3️⃣ Backend сервисін қосу

1. **"New"** → **"GitHub Repo"** → `Edu-help` таңдаңыз
2. **Root Directory:** `backend` орнатыңыз

### 4️⃣ Environment Variables (Railway)

Railway Dashboard → Variables бөлімінде:

```env
MONGODB_URI=mongodb://...  (Railway MongoDB-тан көшіріңіз)
JWT_SECRET=your_super_secret_key_here_min_32_chars
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://eduhelp.vercel.app

# AI API Keys (опциялық)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...
```

### 5️⃣ Deploy Settings

**Start Command:**
```bash
npm start
```

**Build Command:**
```bash
npm install
```

### 6️⃣ Deploy
- Deploy басыңыз
- Domain алыңыз: `eduhelp-backend.up.railway.app`

---

## 🔗 БӨЛІМ 3: Қосымдарды байланыстыру

### 1️⃣ Vercel-де API URL жаңарту

Frontend Vercel Settings → Environment Variables:

```env
VITE_API_URL=https://eduhelp-backend.up.railway.app
```

### 2️⃣ Railway-де CORS жаңарту

Backend Railway Environment Variables:

```env
FRONTEND_URL=https://eduhelp.vercel.app
```

### 3️⃣ Frontend кодын жаңарту

`frontend/src/context/AuthContext.jsx` және басқа файлдарда:

```javascript
// Бұрынғы:
axios.get('/api/auth/me');

// Жаңа (production үшін):
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
axios.get(`${API_URL}/api/auth/me`);
```

---

## 🎯 БӨЛІМ 4: Алғашқы админ тіркеу

Deploy аяқталғаннан кейін:

```bash
curl -X POST https://eduhelp-backend.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@eduhelp.kz",
    "password": "YourSecurePassword123!"
  }'
```

---

## 🌟 ҚОСЫМША: Vercel Монорепо (Альтернатива)

Егер бір Vercel проектінде deploy жасағыңыз келсе:

### vercel.json конфигурациясы

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://eduhelp-backend.up.railway.app/api/:path*"
    }
  ]
}
```

---

## ✅ Deployment чеклист:

- [ ] GitHub репозиторий дайын
- [ ] Railway аккаунт жасалды
- [ ] MongoDB Railway-де орнатылды
- [ ] Backend Railway-ге deploy жасалды
- [ ] Backend Environment Variables орнатылды
- [ ] Vercel аккаунт жасалды
- [ ] Frontend Vercel-ге deploy жасалды
- [ ] Frontend Environment Variables орнатылды (VITE_API_URL)
- [ ] CORS конфигурациясы дұрыс
- [ ] Алғашқы админ тіркелді
- [ ] Сайт жұмыс істейді! 🎉

---

## 🔧 Қателерді жою

### CORS қатесі:
```
Access to XMLHttpRequest blocked by CORS policy
```

**Шешім:** Railway-дегі `FRONTEND_URL` environment variable-ды тексеріңіз

### MongoDB қосылмайды:
```
MongoServerError: Authentication failed
```

**Шешім:** Railway MongoDB connection string-ті дұрыс көшіргеніңізді тексеріңіз

### 404 қатесі API-да:
```
Cannot GET /api/classes
```

**Шешім:** `VITE_API_URL` дұрыс орнатылғанын тексеріңіз

---

## 📞 Көмек

- Railway документациясы: https://docs.railway.app
- Vercel документациясы: https://vercel.com/docs
- GitHub Issues: [Сіздің репозиторий]/issues

---

## 🎊 Дайын!

Сіздің сайт енді онлайн:

- **Frontend:** https://eduhelp.vercel.app
- **Backend:** https://eduhelp-backend.up.railway.app

Құттықтаймын! 🎓✨
