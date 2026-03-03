# EduHelp Technical Documentation

- Version: `2.0.0`
- Last Updated: `2026-02-23`
- Scope: security hardening, OTP-only UI auth, Gemini-first AI, Cloudflare R2 storage, Bundle Generator

## Architecture Overview
- Frontend: React + Vite
- Backend: Express + MongoDB (Mongoose)
- Storage: Cloudflare R2 (new writes), local disk (legacy reads only)
- AI:
  - Text/KMZH/Presentation/Bundle: Gemini
  - Image generation: HuggingFace

## Security and Middleware
- `helmet` enabled globally.
- API rate limiting enabled on `/api`.
- JSON/body limits:
  - `express.json` => `10mb`
  - `express.urlencoded` => `20mb`
- CORS uses comma-separated allowlist via `FRONTEND_URL`.

## Authentication and Authorization
- Frontend entry point is OTP-only (`/auth`).
- Admin access requires `user.role === "admin"`.
- `POST /api/auth/register` and password routes are soft-deprecated and return:
  - `X-API-Deprecated: true`
  - `X-API-Deprecated-Message: ...`

## OTP Model and Controls
`backend/models/OTP.js`
- `codeHash` (SHA-256) replaces plaintext code.
- Added:
  - `attemptCount`
  - `maxAttempts`
  - `cooldownUntil`
  - TTL on `expiresAt`
- Protections:
  - resend cooldown on `send-otp`
  - attempt lockout on `verify-otp`
  - no OTP code logs
  - dev code exposed only with `NODE_ENV=development && OTP_DEBUG=true`

## Storage Model and Flows
`backend/services/storage/r2Storage.js`
- Upload via S3-compatible API (`@aws-sdk/client-s3`).
- Signed URLs via `@aws-sdk/s3-request-presigner`.

Material metadata now supports:
```js
files[].provider      // "r2" | "local"
files[].objectKey
files[].publicUrl
files[].filePath      // legacy/local
files[].fileType
files[].contentType
files[].fileSize
```

Upload flow:
1. `multer.memoryStorage()`
2. Upload buffer to R2
3. Persist metadata in `Material.files[]`

Preview/download flow:
- R2 object key => signed URL redirect
- Legacy public URL => redirect
- Legacy local path => stream/download from filesystem

Delete flow:
- Remove all entries from R2/local for `files[]`
- Fallback cleanup for legacy `filePath`

## AI Standardization
Unified Gemini service:
- `backend/services/ai/geminiService.js`
- Used by:
  - `/api/ai/chat`
  - `/api/ai/generate-kmzh`
  - `/api/ai/generate-presentation`
  - `/api/ai/generate-bundle`

Soft-deprecated route:
- `POST /api/ai-tools/generate/text`
- Behavior: Gemini proxy + deprecation headers

Structured failure contract:
```json
{
  "success": false,
  "message": "error text",
  "errorCode": "GEMINI_UNAVAILABLE",
  "fallback": {
    "freeTools": []
  }
}
```

## Bundle Generator
Endpoint:
- `POST /api/ai/generate-bundle`

Request:
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

Output:
- JSON metadata + R2 URLs for:
  - `kmzh.txt`
  - `presentation.pptx`
  - `worksheet.md`
  - `worksheet.pdf`
- Worksheet pipeline:
  - Gemini markdown generation
  - PDF conversion with `pdfkit`

## Data Model Consistency
- `Material.uploadedBy.ref` migrated from `Admin` to `User`.
- `Feedback.respondedBy.ref` migrated from `Admin` to `User`.

Migration scripts:
- `backend/scripts/migrations/migrate_admin_to_user.js`
- `backend/scripts/migrations/migrate_material_files_schema.js`

Both scripts support:
- dry-run (default)
- apply mode (`--apply`)
- idempotent behavior

## Integration Tests
`backend/tests/integration/release.integration.test.js`
- OTP send cooldown
- OTP wrong-attempt lockout
- OTP expired code rejection
- Admin OTP verification role consistency
- Feedback admin endpoint authorization (`403` vs `200`)
- Deprecated AI text route header + fallback contract
- Bundle endpoint R2-not-configured contract

Run:
```bash
cd backend
npm test
```

## Free AI Section
- Free external tools are returned in fallback payloads.
- Limits and availability may change without notice.
- Last verified: `2026-02-23`.

