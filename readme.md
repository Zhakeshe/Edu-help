# EduHelp

EduHelp is a teacher-focused platform for class materials, AI generation, and admin workflows.

## Release Status
- Release: `Big Release (OTP + Gemini-first + R2 + Bundle Generator)`
- Last updated: `2026-02-23`

## What Is Included
- Security hardening: `helmet`, global API rate limiting, stricter CORS allowlist.
- Auth UX is OTP-only (`/auth`) for all users, including admins.
- Admin-only authorization tightened for feedback and AI tool management.
- OTP storage upgraded to hashed code with cooldown and attempt lockout.
- Storage moved to Cloudflare R2 for new uploads, with legacy local-read compatibility.
- AI generation standardized to Gemini-first.
- New Bundle Generator endpoint: `POST /api/ai/generate-bundle`.
- Free AI fallback payload when generation fails or limits are reached.

## Main API Endpoints
- `POST /api/materials/upload` (admin only)
- `GET /api/materials`
- `GET /api/materials/preview/:id`
- `GET /api/materials/download/:id`
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `POST /api/ai/chat`
- `POST /api/ai/generate-kmzh`
- `POST /api/ai/generate-presentation`
- `POST /api/ai/generate-bundle`
- `POST /api/ai/generate-image`
- `POST /api/ai-tools/generate/text` (soft-deprecated; still works with warning header)

## Auth Flow
- Frontend: `/auth` only.
- `/admin/login` is not used anymore.
- Admin access is role-based: `user.role === "admin"`.
- Legacy password endpoints still exist with `X-API-Deprecated` headers.

## Cloudflare R2
New writes use R2. Local `/uploads` static route remains for legacy reads only.

Required backend env for R2:
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_BASE_URL` (optional but recommended)

## Migrations
Run in this order:
1. Dry run
2. Backup DB
3. Apply
4. Verify

Commands:
```bash
cd backend
npm run migrate:admin-users
npm run migrate:materials-files

npm run migrate:admin-users -- --apply
npm run migrate:materials-files -- --apply
```

## Free AI Fallback
When internal generation fails, API returns:
```json
{
  "success": false,
  "errorCode": "GEMINI_UNAVAILABLE",
  "fallback": {
    "freeTools": []
  }
}
```

Disclaimer:
- Free external tools can change limits, pricing tiers, and availability at any time.
- Last verified: `2026-02-23`.

## Local Development
Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Frontend env:
- `VITE_API_URL` (optional; empty means same-origin `/api`)

