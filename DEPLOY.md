# EduHelp Deploy Guide

## Target Topology
- Frontend: Vercel
- Backend: Railway (or any Node host)
- Database: MongoDB Atlas
- Object storage: Cloudflare R2

## Backend Environment Variables
Required:
```env
MONGODB_URI=
JWT_SECRET=
NODE_ENV=production
PORT=5000

# Comma-separated CORS allowlist
FRONTEND_URL=https://eduhelp.example.com,https://www.eduhelp.example.com

# Gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash

# Image generation
HUGGINGFACE_API_KEY=

# Security
API_RATE_LIMIT_MAX=400
```

OTP config:
```env
OTP_MAX_ATTEMPTS=5
OTP_SEND_COOLDOWN_MS=60000
OTP_VERIFY_LOCK_MS=600000
OTP_TTL_MS=600000
OTP_DEBUG=false
```

Cloudflare R2:
```env
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=
```

Optional flags:
```env
ALLOW_LOCAL_STORAGE_FALLBACK=false
ENABLE_BUNDLE_GENERATOR=true
ENABLE_LEGACY_AI_TEXT_ROUTE=true
```

## Frontend Environment Variables
```env
VITE_API_URL=https://api.eduhelp.example.com
```

## Migration Runbook
1. Pre-release checks:
   - Confirm R2 bucket and credentials.
   - Confirm new env vars are set.
2. Dry-run migrations:
```bash
cd backend
npm run migrate:admin-users
npm run migrate:materials-files
```
3. Take DB backup.
4. Apply migrations:
```bash
npm run migrate:admin-users -- --apply
npm run migrate:materials-files -- --apply
```
5. Verify:
   - Admin users exist in `User` model with `role=admin`.
   - Materials include `files[]` metadata.

## Deploy Order
1. Deploy backend (dual-read legacy mode already included).
2. Run migrations.
3. Deploy frontend.
4. Monitor deprecation headers and fallback ratio.

## Post-Deploy Smoke Checklist (24h)
- OTP send/verify works.
- `/admin` is accessible only for admin role.
- Normal user gets `403` on feedback admin endpoints.
- Material upload writes to R2.
- Material preview/download works for new + legacy files.
- `POST /api/ai/generate-bundle` returns valid URLs.
- Deprecated route `/api/ai-tools/generate/text` still responds and sets deprecation headers.

## Rollback Strategy
- Disable bundle feature: `ENABLE_BUNDLE_GENERATOR=false`.
- Disable deprecated proxy route: `ENABLE_LEGACY_AI_TEXT_ROUTE=false`.
- Keep legacy local read path enabled for historical files.

