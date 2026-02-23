# EduHelp Quickstart

## 1. Requirements
- Node.js 18+
- MongoDB (local or cloud)
- npm

## 2. Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/eduhelp
JWT_SECRET=replace_with_a_long_secret
NODE_ENV=development
PORT=5000

# Comma-separated allowlist
FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173

# OTP
OTP_DEBUG=true
OTP_MAX_ATTEMPTS=5
OTP_SEND_COOLDOWN_MS=60000
OTP_VERIFY_LOCK_MS=600000

# Gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash

# HuggingFace image generation
HUGGINGFACE_API_KEY=

# Cloudflare R2 (optional in local dev)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=
```

Run backend:
```bash
npm run dev
```

## 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

Run frontend:
```bash
npm run dev
```

## 4. Login Flow
- Open `/auth`
- Send OTP to email
- Verify OTP
- If user role is admin, `/admin` unlocks automatically

## 5. Migrations
From `backend/`:
```bash
npm run migrate:admin-users
npm run migrate:materials-files
```

Apply mode:
```bash
npm run migrate:admin-users -- --apply
npm run migrate:materials-files -- --apply
```

## 6. Integration Tests
From `backend/`:
```bash
npm test
```

## 7. Bundle Generator
API:
```http
POST /api/ai/generate-bundle
Authorization: Bearer <token>
Content-Type: application/json
```

Body:
```json
{
  "subject": "Math",
  "classNumber": "6",
  "quarter": "2",
  "theme": "Fractions",
  "objectives": "Understand equivalent fractions",
  "slidesCount": 8,
  "worksheetLevel": "standard"
}
```
