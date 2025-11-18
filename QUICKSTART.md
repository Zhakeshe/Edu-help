# ⚡ EduHelp - Жылдам Deploy (5 минут)

## 🎯 Қадамдар:

### 1. Railway-ге Backend deploy жасау

#### MongoDB қосу:
```
1. https://railway.app → Login
2. New Project → Database → Add MongoDB
3. Connection String-ті көшіріп алыңыз
```

#### Backend deploy:
```
1. New → GitHub Repo → Edu-help таңдау
2. Settings → Root Directory: backend
3. Variables → Төмендегіні қосыңыз:

MONGODB_URI=<Railway-дан көшірген>
JWT_SECRET=eduhelp_super_secret_key_2025_minimum_32_characters
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://eduhelp.vercel.app

4. Deploy → URL алыңыз (мысалы: eduhelp-backend.up.railway.app)
```

---

### 2. Vercel-ге Frontend deploy жасау

#### Vercel Setup:
```
1. https://vercel.com → Login
2. Add New Project → Import Git Repository
3. Root Directory: frontend
4. Framework Preset: Vite
5. Environment Variables:

VITE_API_URL=https://your-backend.up.railway.app

6. Deploy → URL алыңыз
```

---

### 3. Алғашқы админ тіркеу

```bash
curl -X POST https://your-backend.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@eduhelp.kz",
    "password": "Admin123!"
  }'
```

---

### 4. Railway-дегі FRONTEND_URL жаңарту

```
Railway → Variables → FRONTEND_URL-ді жаңартыңыз:
FRONTEND_URL=https://your-site.vercel.app
```

---

## ✅ Дайын!

Сіздің сайт онлайн: **https://your-site.vercel.app**

Admin кіру: **https://your-site.vercel.app/admin/login**

---

## 🔧 Егер қате шықса:

### CORS қатесі:
Railway → Variables → FRONTEND_URL дұрыс па тексеріңіз

### MongoDB қосылмайды:
Railway → MongoDB → Connection String қайта көшіріңіз

### API 404 қатесі:
Vercel → Settings → Environment Variables → VITE_API_URL тексеріңіз

---

## 📞 Көмек керек пе?

- Railway: https://railway.app/help
- Vercel: https://vercel.com/docs

Сәттілік! 🎉
