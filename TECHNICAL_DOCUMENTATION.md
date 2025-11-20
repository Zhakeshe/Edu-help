# 📚 EduHelp - Толық техникалық құжаттама / Complete Technical Documentation

> **Нұсқа / Version:** 1.0.0
> **Соңғы жаңарту / Last Updated:** 2025-01-19
> **Құрастырған / Compiled by:** EduHelp Development Team

---

## 📋 Мазмұны / Table of Contents

1. [Жобаның жалпы шолуы / Project Overview](#1-жобаның-жалпы-шолуы--project-overview)
2. [Технологиялық стек / Technology Stack](#2-технологиялық-стек--technology-stack)
3. [Архитектура / Architecture](#3-архитектура--architecture)
4. [Деректер моделдері / Data Models](#4-деректер-моделдері--data-models)
5. [Backend API құжаттамасы / Backend API Documentation](#5-backend-api-құжаттамасы--backend-api-documentation)
6. [Frontend архитектурасы / Frontend Architecture](#6-frontend-архитектурасы--frontend-architecture)
7. [Аутентификация және қауіпсіздік / Authentication & Security](#7-аутентификация-және-қауіпсіздік--authentication--security)
8. [Файл жүктеу жүйесі / File Upload System](#8-файл-жүктеу-жүйесі--file-upload-system)
9. [AI интеграциялар / AI Integrations](#9-ai-интеграциялар--ai-integrations)
10. [Орнату және іске қосу / Setup & Deployment](#10-орнату-және-іске-қосу--setup--deployment)

---

## 1. Жобаның жалпы шолуы / Project Overview

### 🎯 Мақсаты / Purpose

**EduHelp** - қазақстандық мұғалімдерге (2-11 сынып) арналған жаппай білім беру платформасы. Платформа мұғалімдерге оқу материалдарын басқаруға, AI көмегімен контент генерациялауға және бір-бірімен ресурстармен бөлісуге мүмкіндік береді.

**EduHelp** is a comprehensive educational platform for Kazakh teachers (grades 2-11). The platform enables teachers to manage educational materials, generate AI-powered content, and share resources with each other.

### ✨ Негізгі мүмкіндіктер / Key Features

1. **Материалдарды басқару / Material Management**
   - Оқу материалдарын жүктеу, сақтау, жіктеу
   - Сынып, тоқсан, категория бойынша фильтрлеу
   - Preview және Download мүмкіндіктері
   - 500MB-ға дейінгі файлдарды қолдау

2. **AI құралдары / AI Tools**
   - Gemini чат-бот (контекстпен)
   - ҚМЖ (Қысқа мерзімді жоспар) генерациялау
   - Презентация (PPTX) жасау
   - Сурет генерациялау (Stable Diffusion)

3. **Аутентификация / Authentication**
   - OTP арқылы кіру (email)
   - Дәстүрлі login/password
   - JWT токен базалы session

4. **Әкімші панелі / Admin Panel**
   - Материалдарды жүктеу және өңдеу
   - Feedback басқару
   - Статистика

### 🌍 Тіл қолдауы / Language Support

- **Негізгі тіл / Primary:** Қазақша (Kazakh)
- **Интерфейс / Interface:** 100% Қазақша
- **AI генерация / AI Generation:** Қазақша және ағылшынша

---

## 2. Технологиялық стек / Technology Stack

### 🔧 Backend

| Технология | Нұсқа | Мақсаты / Purpose |
|-----------|-------|------------------|
| **Node.js** | Latest | JavaScript runtime |
| **Express.js** | ^4.18.2 | Web server framework |
| **MongoDB** | 8.x | NoSQL деректер қоры / Database |
| **Mongoose** | ^8.0.3 | MongoDB ODM |
| **JWT** | ^9.0.2 | Аутентификация / Authentication |
| **Multer** | ^1.4.5 | Файл жүктеу / File upload |
| **bcryptjs** | ^2.4.3 | Құпия сөзді хэштеу / Password hashing |
| **Nodemailer** | ^6.10.1 | Email жіберу / Email sending |
| **Axios** | ^1.6.2 | HTTP client (AI APIs) |
| **PptxGenJS** | ^3.12.0 | PowerPoint генерациялау |

### 🎨 Frontend

| Технология | Нұсқа | Мақсаты / Purpose |
|-----------|-------|------------------|
| **React** | 18.2.0 | UI framework |
| **Vite** | ^5.0.8 | Build tool |
| **React Router** | ^6.21.1 | Client-side routing |
| **Axios** | ^1.6.2 | HTTP client |
| **Tailwind CSS** | ^3.4.0 | Styling framework |
| **Lucide React** | Latest | Icon library |

### 🤖 AI интеграциялар / AI Integrations

| API | Провайдер | Қолданылуы / Usage |
|-----|-----------|-------------------|
| **Gemini 2.0 Flash** | Google | Chat, ҚМЖ генерациялау |
| **Stable Diffusion XL** | Hugging Face | Сурет генерациялау |
| **OpenAI GPT** | OpenAI | Мәтін генерациялау (optional) |
| **Claude** | Anthropic | Мәтін генерациялау (optional) |

### 🗄️ Деректер қоры / Database

- **MongoDB Atlas** (Cloud) немесе Local MongoDB
- **Collections:** 6 (User, Admin, Material, AITool, Feedback, OTP)
- **Indexes:** TTL index (OTP auto-delete), compound indexes

### 🌐 Deployment

- **Frontend:** Vercel / Netlify / Static hosting
- **Backend:** Vercel Serverless / Railway / Traditional VPS
- **Database:** MongoDB Atlas
- **File Storage:** Server filesystem / Cloud storage (S3, Cloudinary)

---

## 3. Архитектура / Architecture

### 📁 Жоба құрылымы / Project Structure

```
Edu-help/
├── backend/                    # Backend (Node.js + Express)
│   ├── config/
│   │   └── db.js              # MongoDB қосылу
│   ├── middleware/
│   │   └── auth.js            # JWT верификация
│   ├── models/                # 6 MongoDB schema
│   │   ├── User.js
│   │   ├── Admin.js
│   │   ├── Material.js
│   │   ├── AITool.js
│   │   ├── Feedback.js
│   │   └── OTP.js
│   ├── routes/                # 7 API route файл
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── materials.js
│   │   ├── classes.js
│   │   ├── aitools.js
│   │   ├── ai.js
│   │   └── feedback.js
│   ├── utils/
│   │   └── sendOTP.js         # Email OTP utility
│   ├── uploads/               # Жүктелген файлдар
│   ├── public/
│   │   ├── presentations/     # Генерацияланған PPTX
│   │   └── images/            # Генерацияланған суреттер
│   ├── server.js              # Express қосымшасы
│   ├── package.json
│   └── vercel.json
│
├── frontend/                   # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/             # 6 негізгі бет
│   │   │   ├── Home.jsx
│   │   │   ├── Auth.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── ClassPage.jsx
│   │   │   ├── AIToolsPage.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── components/        # Компоненттер
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── ClassesList.jsx
│   │   │   ├── MaterialsView.jsx
│   │   │   ├── AITools.jsx
│   │   │   ├── ChatButton.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Admin/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── MaterialUpload.jsx
│   │   │       └── FeedbackManagement.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Глобальды state
│   │   ├── config/
│   │   │   └── api.js           # API базалық URL
│   │   ├── App.jsx              # Router
│   │   ├── main.jsx             # Entry point
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
│
├── nginx.conf                  # Nginx конфигурациясы
├── UPLOAD_GUIDE.md            # Файл жүктеу нұсқаулығы
├── TECHNICAL_DOCUMENTATION.md  # Бұл файл
└── README.md
```

### 🔄 Деректер ағыны / Data Flow

```
[Client Browser]
      ↓
[React Frontend] → Axios HTTP requests
      ↓
[Express Backend] → JWT middleware → Route handlers
      ↓
[MongoDB] ← Mongoose ODM
      ↓
[External APIs] (Gemini, Hugging Face, OpenAI)
```

### 🛡️ Қауіпсіздік қабаттары / Security Layers

1. **Frontend:** ProtectedRoute компоненті
2. **Backend:** JWT middleware (`protect`, `adminOnly`)
3. **Database:** Mongoose validation және unique indexes
4. **File System:** Қауіпті файл типтерін блоктау

---

## 4. Деректер моделдері / Data Models

### 👤 User Model

**Файл / File:** `/backend/models/User.js`

```javascript
{
  fullName: String,          // Толық аты-жөні (required)
  email: String,             // Email (unique, sparse)
  password: String,          // Хэштелген құпия сөз (optional for OTP)
  authMethod: String,        // 'password' | 'otp'
  avatar: String,            // Аватар URL
  role: String,              // 'user' | 'admin'
  apiKeys: {
    gemini: String,
    openai: String,
    anthropic: String
  },
  stats: {
    materialsDownloaded: Number,
    aiToolsUsed: Number,
    lastActive: Date
  },
  isActive: Boolean,
  createdAt: Date
}
```

**Методтар / Methods:**
- `comparePassword(candidatePassword)` - Құпия сөзді салыстыру

**Hooks:**
- `pre('save')` - Password хэштеу (bcrypt, 12 rounds)

---

### 👨‍💼 Admin Model

**Файл / File:** `/backend/models/Admin.js`

```javascript
{
  username: String,          // Пайдаланушы аты (unique, required)
  email: String,             // Email (unique, required)
  password: String,          // Хэштелген құпия сөз (required)
  role: String,              // 'admin' | 'super_admin'
  createdAt: Date
}
```

**Ескерту / Note:** Ескі модель, User моделіне миграцияланып жатыр.

---

### 📄 Material Model

**Файл / File:** `/backend/models/Material.js`

```javascript
{
  title: String,             // Материал тақырыбы (required)
  description: String,       // Сипаттама
  classNumber: Number,       // Сынып: 2-11 (required)
  quarter: Number,           // Тоқсан: 1-4 (required)
  category: String,          // 'ҚМЖ' | 'Презентациялар' | 'Жұмыс парақтары' | 'Суреттер' | 'Басқа'
  subject: String,           // Пән атауы

  // Бірнеше файл қолдауы
  files: [{
    fileName: String,
    filePath: String,
    fileType: String,
    fileSize: Number
  }],

  // Backward compatibility
  fileName: String,
  filePath: String,
  fileType: String,
  fileSize: Number,

  uploadedBy: ObjectId,      // Admin ID (ref: 'Admin')
  downloads: Number,         // Жүктеу саны (default: 0)
  createdAt: Date,
  updatedAt: Date
}
```

**Pre-save Hook:**
- `updatedAt` автоматты жаңартылады

---

### 🤖 AITool Model

**Файл / File:** `/backend/models/AITool.js`

```javascript
{
  name: String,              // Құрал атауы (required)
  description: String,       // Сипаттама (required)
  category: String,          // 'Сурет генерациялау' | 'Мәтін генерациялау' | ...
  url: String,               // Құралдың сыртқы URL-і
  apiEndpoint: String,       // API endpoint (қажет болса)
  apiKey: String,            // API кілті (select: false)
  features: [String],        // Мүмкіндіктер тізімі
  isPremium: Boolean,        // Ақылы/тегін
  logo: String,              // Логотип URL
  rating: Number,            // Рейтинг (0-5)
  usageCount: Number,        // Қолданылу саны (default: 0)
  isActive: Boolean,         // Белсенді/белсенді емес
  createdAt: Date
}
```

---

### 💬 Feedback Model

**Файл / File:** `/backend/models/Feedback.js`

```javascript
{
  fullName: String,          // Қолданушы аты (required)
  phone: String,             // Телефон нөмірі (required)
  message: String,           // Хабарлама (required)
  status: String,            // 'жаңа' | 'оқылды' | 'жауап берілді' (default: 'жаңа')
  adminResponse: String,     // Әкімші жауабы
  respondedBy: ObjectId,     // Admin ID (ref: 'Admin')
  respondedAt: Date,         // Жауап берілген уақыт
  createdAt: Date
}
```

---

### 🔐 OTP Model

**Файл / File:** `/backend/models/OTP.js`

```javascript
{
  identifier: String,        // Email (lowercase, required)
  code: String,              // 6 санды код (required)
  type: String,              // 'email'
  expiresAt: Date,           // Мерзімі (TTL index)
  verified: Boolean,         // Расталған ба
  createdAt: Date
}
```

**Indexes:**
- TTL index: `expiresAt` - 600 секундтан кейін автоматты өшіру
- Compound: `{identifier: 1, code: 1}` - жылдам іздеу үшін

---

## 5. Backend API құжаттамасы / Backend API Documentation

### 🔑 Authentication API (`/api/auth`)

#### POST `/api/auth/register`
**Сипаттама / Description:** Жаңа админ тіркеу / Register new admin

**Request Body:**
```json
{
  "username": "admin123",
  "email": "admin@example.com",
  "password": "securepass123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "65abc123...",
    "username": "admin123",
    "email": "admin@example.com",
    "token": "eyJhbGc..."
  }
}
```

---

#### POST `/api/auth/login`
**Сипаттама / Description:** Админ кіру / Admin login

**Request Body:**
```json
{
  "username": "admin123",
  "password": "securepass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "65abc123...",
    "username": "admin123",
    "email": "admin@example.com",
    "token": "eyJhbGc..."
  }
}
```

---

#### GET `/api/auth/me`
**Сипаттама / Description:** Қазіргі пайдаланушыны алу / Get current user
**Аутентификация / Auth:** Required (Bearer token)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "65abc123...",
    "username": "admin123",
    "email": "admin@example.com"
  }
}
```

---

#### POST `/api/auth/send-otp`
**Сипаттама / Description:** Email-ге OTP код жіберу / Send OTP code to email

**Request Body:**
```json
{
  "identifier": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Код email-ге жіберілді. 10 минут ішінде енгізіңіз.",
  "expiresIn": 600
}
```

**Development Mode Response:**
```json
{
  "success": true,
  "message": "Код email-ге жіберілді",
  "devMode": true,
  "code": "123456"
}
```

---

#### POST `/api/auth/verify-otp`
**Сипаттама / Description:** OTP кодын тексеру және кіру/тіркелу / Verify OTP and login/register

**Request Body:**
```json
{
  "identifier": "user@example.com",
  "code": "123456",
  "fullName": "Айдар Нұрлан"  // Жаңа қолданушы үшін
}
```

**Response (200) - Бар қолданушы:**
```json
{
  "success": true,
  "isNewUser": false,
  "message": "Жүйеге кірдіңіз!",
  "data": {
    "id": "65abc123...",
    "fullName": "Айдар Нұрлан",
    "email": "user@example.com",
    "role": "user",
    "token": "eyJhbGc..."
  }
}
```

**Response (200) - Жаңа қолданушы:**
```json
{
  "success": true,
  "isNewUser": true,
  "message": "Тіркелу сәтті өтті!",
  "data": {
    "id": "65abc456...",
    "fullName": "Айдар Нұрлан",
    "email": "user@example.com",
    "role": "user",
    "token": "eyJhbGc..."
  }
}
```

**Error (400) - Аты-жөні қажет:**
```json
{
  "success": false,
  "message": "Аты-жөніңізді енгізіңіз (тіркелу үшін)",
  "requiresFullName": true
}
```

---

### 👤 User API (`/api/users`)

#### POST `/api/users/register`
**Сипаттама / Description:** Жаңа қолданушы тіркеу (құпия сөзбен)

**Request Body:**
```json
{
  "fullName": "Айдар Нұрлан",
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "65abc123...",
    "fullName": "Айдар Нұрлан",
    "email": "user@example.com",
    "role": "user",
    "token": "eyJhbGc..."
  }
}
```

---

#### POST `/api/users/login`
**Сипаттама / Description:** Қолданушы кіру (құпия сөзбен)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepass123",
  "isAdmin": false
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "65abc123...",
    "fullName": "Айдар Нұрлан",
    "email": "user@example.com",
    "role": "user",
    "apiKeys": {
      "gemini": "",
      "openai": "",
      "anthropic": ""
    },
    "token": "eyJhbGc..."
  }
}
```

---

#### GET `/api/users/me`
**Сипаттама / Description:** Қазіргі қолданушы профилін алу
**Аутентификация / Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "65abc123...",
    "fullName": "Айдар Нұрлан",
    "email": "user@example.com",
    "role": "user",
    "avatar": "",
    "apiKeys": {
      "gemini": "",
      "openai": "",
      "anthropic": ""
    },
    "stats": {
      "materialsDownloaded": 15,
      "aiToolsUsed": 8,
      "lastActive": "2025-01-19T10:30:00.000Z"
    }
  }
}
```

---

#### PUT `/api/users/profile`
**Сипаттама / Description:** Профильді жаңарту
**Аутентификация / Auth:** Required

**Request Body:**
```json
{
  "fullName": "Айдар Нұрлан Әбділдаұлы",
  "avatar": "https://example.com/avatar.png"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "65abc123...",
    "fullName": "Айдар Нұрлан Әбділдаұлы",
    "email": "user@example.com",
    "avatar": "https://example.com/avatar.png",
    "role": "user"
  }
}
```

---

#### PUT `/api/users/api-keys`
**Сипаттама / Description:** AI API кілттерін сақтау
**Аутентификация / Auth:** Required

**Request Body:**
```json
{
  "gemini": "AIzaSyXXXXXXXXXXXXXXXXXXXXXX",
  "openai": "sk-XXXXXXXXXXXXXXXXXXXXXXXX",
  "anthropic": "sk-ant-XXXXXXXXXXXXXXXXXXXXX"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "API кілттері сақталды!",
  "data": {
    "apiKeys": {
      "gemini": "AIzaSyXXXXXXXXXXXXXXXXXXXXXX",
      "openai": "sk-XXXXXXXXXXXXXXXXXXXXXXXX",
      "anthropic": "sk-ant-XXXXXXXXXXXXXXXXXXXXX"
    }
  }
}
```

---

### 📚 Materials API (`/api/materials`)

#### POST `/api/materials/upload`
**Сипаттама / Description:** Материал(дар) жүктеу
**Аутентификация / Auth:** Required (Admin only)
**Content-Type:** multipart/form-data

**Form Data:**
```
files: [File, File, ...]   // Бірнеше файл (макс 20, әр файл макс 500MB)
title: "Математика сабағы"
description: "Алгебра материалы"
classNumber: 5
quarter: 2
category: "ҚМЖ"
subject: "Математика"
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123...",
    "title": "Математика сабағы",
    "description": "Алгебра материалы",
    "classNumber": 5,
    "quarter": 2,
    "category": "ҚМЖ",
    "subject": "Математика",
    "files": [
      {
        "fileName": "lesson1.pdf",
        "filePath": "uploads/1737282000000-123456789.pdf",
        "fileType": "pdf",
        "fileSize": 1024000
      }
    ],
    "uploadedBy": "65xyz789...",
    "downloads": 0,
    "createdAt": "2025-01-19T10:00:00.000Z"
  },
  "filesCount": 1
}
```

---

#### GET `/api/materials`
**Сипаттама / Description:** Барлық материалдарды алу (фильтрмен)
**Аутентификация / Auth:** Public

**Query Parameters:**
- `classNumber` (optional): 2-11
- `quarter` (optional): 1-4
- `category` (optional): 'ҚМЖ' | 'Презентациялар' | 'Жұмыс парақтары' | 'Суреттер' | 'Басқа'
- `subject` (optional): String

**Example:** `GET /api/materials?classNumber=5&quarter=2&category=ҚМЖ`

**Response (200):**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "_id": "65abc123...",
      "title": "Математика сабағы",
      "description": "Алгебра материалы",
      "classNumber": 5,
      "quarter": 2,
      "category": "ҚМЖ",
      "subject": "Математика",
      "files": [...],
      "downloads": 45,
      "createdAt": "2025-01-19T10:00:00.000Z"
    },
    ...
  ]
}
```

---

#### GET `/api/materials/:id`
**Сипаттама / Description:** Бір материалды алу
**Аутентификация / Auth:** Public

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123...",
    "title": "Математика сабағы",
    "description": "Алгебра материалы",
    "classNumber": 5,
    "quarter": 2,
    "category": "ҚМЖ",
    "subject": "Математика",
    "files": [
      {
        "fileName": "lesson1.pdf",
        "filePath": "uploads/1737282000000-123456789.pdf",
        "fileType": "pdf",
        "fileSize": 1024000
      }
    ],
    "uploadedBy": {
      "_id": "65xyz789...",
      "username": "admin",
      "email": "admin@example.com"
    },
    "downloads": 45,
    "createdAt": "2025-01-19T10:00:00.000Z"
  }
}
```

---

#### GET `/api/materials/preview/:id`
**Сипаттама / Description:** Материалды браузерде көру
**Аутентификация / Auth:** Public

**Қолдайтын форматтар:**
- PDF: application/pdf
- Суреттер: image/jpeg, image/png, image/gif, etc.
- Видео: video/mp4, video/webm
- Аудио: audio/mpeg, audio/wav
- Мәтін: text/plain, text/html

**Response:** File stream with appropriate Content-Type header

---

#### GET `/api/materials/download/:id`
**Сипаттама / Description:** Материалды жүктеп алу
**Аутентификация / Auth:** Public

**Әрекет / Action:**
- Файлды жүктейді
- `downloads` санағышын +1 көтереді

**Response:** File download with Content-Disposition: attachment

---

#### PUT `/api/materials/:id`
**Сипаттама / Description:** Материал метадатасын өзгерту
**Аутентификация / Auth:** Required (Admin only)

**Request Body:**
```json
{
  "title": "Математика - жаңартылған",
  "description": "Толық курс",
  "classNumber": 6,
  "quarter": 3,
  "category": "Презентациялар",
  "subject": "Геометрия"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123...",
    "title": "Математика - жаңартылған",
    // ... жаңартылған деректер
  }
}
```

---

#### DELETE `/api/materials/:id`
**Сипаттама / Description:** Материалды өшіру (файлмен қоса)
**Аутентификация / Auth:** Required (Admin only)

**Response (200):**
```json
{
  "success": true,
  "message": "Материал және файл(дар) өшірілді"
}
```

---

### 🎓 Classes API (`/api/classes`)

#### GET `/api/classes`
**Сипаттама / Description:** Барлық сыныптарды алу (материал санымен)
**Аутентификация / Auth:** Public

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "classNumber": 2,
      "materialsCount": 45,
      "quarters": [1, 2, 3, 4],
      "categories": ["ҚМЖ", "Презентациялар", "Суреттер"]
    },
    {
      "classNumber": 3,
      "materialsCount": 52,
      "quarters": [1, 2, 3, 4],
      "categories": ["ҚМЖ", "Жұмыс парақтары"]
    },
    // ... 4-11 сыныптар
  ]
}
```

---

#### GET `/api/classes/:classNumber`
**Сипаттама / Description:** Нақты сыныптың материалдары (тоқсан бойынша)
**Аутентификация / Auth:** Public

**Response (200):**
```json
{
  "success": true,
  "data": {
    "classNumber": 5,
    "quarters": [
      {
        "quarter": 1,
        "materials": {
          "ҚМЖ": [/* материалдар */],
          "Презентациялар": [/* материалдар */],
          "Жұмыс парақтары": [/* материалдар */]
        }
      },
      // ... 2-4 тоқсандар
    ]
  }
}
```

---

#### GET `/api/classes/:classNumber/stats`
**Сипаттама / Description:** Сынып статистикасы
**Аутентификация / Auth:** Public

**Response (200):**
```json
{
  "success": true,
  "data": {
    "classNumber": 5,
    "totalMaterials": 48,
    "byQuarter": {
      "1": 12,
      "2": 15,
      "3": 11,
      "4": 10
    },
    "byCategory": {
      "ҚМЖ": 25,
      "Презентациялар": 15,
      "Жұмыс парақтары": 8
    }
  }
}
```

---

### 🤖 AI Tools API (`/api/ai-tools`)

#### GET `/api/ai-tools`
**Сипаттама / Description:** Барлық белсенді AI құралдарын алу
**Аутентификация / Auth:** Public

**Query Parameters:**
- `category` (optional): String

**Response (200):**
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "_id": "65abc123...",
      "name": "Gemini Chat",
      "description": "Google-дың AI чат-боты",
      "category": "Мәтін генерациялау",
      "url": "https://gemini.google.com",
      "features": ["Чат", "Мәтін генерациялау", "Код жазу"],
      "isPremium": false,
      "logo": "/images/gemini-logo.png",
      "rating": 4.8,
      "usageCount": 1523,
      "isActive": true,
      "createdAt": "2025-01-10T00:00:00.000Z"
    },
    // ... басқа құралдар
  ]
}
```

---

#### POST `/api/ai-tools/:id/use`
**Сипаттама / Description:** Қолданылу санағышын көбейту
**Аутентификация / Auth:** Public

**Response (200):**
```json
{
  "success": true,
  "data": {
    "usageCount": 1524
  }
}
```

---

### 🧠 AI Generation API (`/api/ai`)

#### POST `/api/ai/chat`
**Сипаттама / Description:** Gemini чат-бот
**Аутентификация / Auth:** Required

**Request Body:**
```json
{
  "message": "Математикадан сұрақ бар",
  "history": [
    {
      "role": "user",
      "content": "Сәлем!"
    },
    {
      "role": "assistant",
      "content": "Сәлеметсіз бе! Сізге қалай көмектесе аламын?"
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "response": "Әрине! Қандай сұрақ?"
}
```

---

#### POST `/api/ai/generate-kmzh`
**Сипаттама / Description:** ҚМЖ (сабақ жоспары) генерациялау
**Аутентификация / Auth:** Required

**Request Body:**
```json
{
  "subject": "Математика",
  "classNumber": 5,
  "quarter": 2,
  "theme": "Бөлшектер",
  "objectives": "Бөлшектерді қосуды үйрену"
}
```

**Response (200):**
```json
{
  "success": true,
  "content": "# Қысқа мерзімді жоспар\n\n## Пән: Математика\n...",
  "filename": "kmzh_matematika_5sinip_2toksan_1737282000000.txt"
}
```

---

#### POST `/api/ai/generate-presentation`
**Сипаттама / Description:** PowerPoint презентациясын генерациялау
**Аутентификация / Auth:** Required

**Request Body:**
```json
{
  "subject": "Математика",
  "theme": "Бөлшектер",
  "slides": 10,
  "details": "5-сынып үшін"
}
```

**Response (200):**
```json
{
  "success": true,
  "pptxUrl": "/presentations/presentation_1737282000000.pptx",
  "content": "Слайд 1: Титул\nСлайд 2: Кіріспе\n...",
  "filename": "presentation_1737282000000.pptx"
}
```

---

#### POST `/api/ai/generate-image`
**Сипаттама / Description:** Сурет генерациялау (Stable Diffusion)
**Аутентификация / Auth:** Required

**Request Body:**
```json
{
  "prompt": "A beautiful sunset over mountains"
}
```

**Response (200):**
```json
{
  "success": true,
  "imageUrl": "/images/image_1737282000000.png"
}
```

**Error (503) - Model loading:**
```json
{
  "success": false,
  "message": "Модель жүктелуде. 20 секундтан кейін қайталап көріңіз.",
  "estimatedTime": 20,
  "code": "MODEL_LOADING"
}
```

---

### 💬 Feedback API (`/api/feedback`)

#### POST `/api/feedback`
**Сипаттама / Description:** Пікір жіберу
**Аутентификация / Auth:** Public

**Request Body:**
```json
{
  "fullName": "Айдар Нұрлан",
  "phone": "+77001234567",
  "message": "Өте жақсы платформа!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Сіздің пікіріңіз жіберілді! Рахмет!",
  "data": {
    "_id": "65abc123...",
    "fullName": "Айдар Нұрлан",
    "phone": "+77001234567",
    "message": "Өте жақсы платформа!",
    "status": "жаңа",
    "createdAt": "2025-01-19T10:00:00.000Z"
  }
}
```

---

#### GET `/api/feedback`
**Сипаттама / Description:** Барлық пікірлерді алу
**Аутентификация / Auth:** Required (Admin)

**Query Parameters:**
- `status` (optional): 'жаңа' | 'оқылды' | 'жауап берілді'

**Response (200):**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "65abc123...",
      "fullName": "Айдар Нұрлан",
      "phone": "+77001234567",
      "message": "Өте жақсы платформа!",
      "status": "жаңа",
      "createdAt": "2025-01-19T10:00:00.000Z"
    },
    // ... басқа пікірлер
  ]
}
```

---

#### PUT `/api/feedback/:id/respond`
**Сипаттама / Description:** Пікірге жауап беру
**Аутентификация / Auth:** Required (Admin)

**Request Body:**
```json
{
  "adminResponse": "Рахмет сіздің пікіріңіз үшін!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123...",
    "fullName": "Айдар Нұрлан",
    "message": "Өте жақсы платформа!",
    "status": "жауап берілді",
    "adminResponse": "Рахмет сіздің пікіріңіз үшін!",
    "respondedBy": "65xyz789...",
    "respondedAt": "2025-01-19T11:00:00.000Z"
  }
}
```

---

## 6. Frontend архитектурасы / Frontend Architecture

### 📄 Беттер / Pages

#### 1. **Home** (`/pages/Home.jsx`)
- **Маршрут / Route:** `/`
- **Қол жеткізу / Access:** Public
- **Компоненттер:**
  - `<Hero />` - Негізгі баннер
  - `<ClassesList />` - Сыныптар тізімі

#### 2. **Auth** (`/pages/Auth.jsx`)
- **Маршрут / Route:** `/auth`
- **Қол жеткізу / Access:** Public
- **Функциялар:**
  - 2-қадамды OTP аутентификация
  - Email енгізу → OTP код → Кіру/Тіркелу
  - Timer (10 минут)
  - Қайта жіберу мүмкіндігі
  - Dev режимде кодты көрсету

#### 3. **Profile** (`/pages/Profile.jsx`)
- **Маршрут / Route:** `/profile`
- **Қол жеткізу / Access:** Protected (кіру қажет)
- **Функциялар:**
  - Профильді өзгерту (аты-жөні, аватар)
  - Статистиканы көру
  - API кілттерін сақтау

#### 4. **ClassPage** (`/pages/ClassPage.jsx`)
- **Маршрут / Route:** `/class/:classNumber`
- **Қол жеткізу / Access:** Protected
- **Функциялар:**
  - Нақты сыныптың материалдары
  - Тоқсан және категория бойынша фильтр
  - Preview және Download

#### 5. **AIToolsPage** (`/pages/AIToolsPage.jsx`)
- **Маршрут / Route:** `/ai-tools`
- **Қол жеткізу / Access:** Protected
- **Функциялар:**
  - **Chat:** Gemini чат-бот
  - **ҚМЖ Generator:** Сабақ жоспары
  - **Presentation Generator:** PPTX жасау
  - **Image Generator:** Сурет жасау
  - Conversation history
  - Download мүмкіндігі

#### 6. **AdminPanel** (`/pages/AdminPanel.jsx`)
- **Маршрут / Route:** `/admin`
- **Қол жеткізу / Access:** Admin only
- **Функциялар:**
  - Материалдарды жүктеу
  - Материалдарды өңдеу/өшіру
  - Feedback басқару

---

### 🧩 Компоненттер / Components

#### **Navbar** (`/components/Navbar.jsx`)
```jsx
// Мүмкіндіктер:
- Logo + бренд
- Навигация меню
- Profile dropdown (authenticated)
- Admin panel link (admin)
- Logout
- Mobile menu
```

#### **Hero** (`/components/Hero.jsx`)
```jsx
// Landing section:
- Анимациялы фон
- CTA батырмалары
- Feature badges
```

#### **ClassesList** (`/components/ClassesList.jsx`)
```jsx
// Сыныптар тізімі:
- 2-11 сынып карталары
- Материал саны
- Click → /class/:classNumber
```

#### **MaterialsView** (`/components/MaterialsView.jsx`)
```jsx
// Материалдар көрінісі:
- Фильтр (тоқсан, категория)
- Карта/тізім режимі
- Preview/Download батырмалары
```

#### **ProtectedRoute** (`/components/ProtectedRoute.jsx`)
```jsx
// Route қорғаныс:
<ProtectedRoute>
  <ClassPage />
</ProtectedRoute>

<ProtectedRoute adminOnly>
  <AdminPanel />
</ProtectedRoute>
```

---

### 🌐 State Management (Context API)

#### **AuthContext** (`/context/AuthContext.jsx`)

```jsx
// State:
const {
  user,              // Қолданушы объектісі
  loading,           // Loading жағдайы
  token,             // JWT токен
  isAuthenticated,   // Кірген/кірмеген
  isAdmin,           // Админ ме

  // Methods:
  register,          // Тіркелу
  login,             // Кіру
  logout,            // Шығу
  loginWithToken,    // OTP үшін тікелей token кіру
  updateProfile,     // Профильді жаңарту
  saveApiKeys        // API кілттерін сақтау
} = useAuth();
```

**Пайдалану мысалы:**
```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  return (
    <div>
      <h1>Сәлем, {user.fullName}!</h1>
      <button onClick={logout}>Шығу</button>
    </div>
  );
}
```

---

## 7. Аутентификация және қауіпсіздік / Authentication & Security

### 🔐 Аутентификация әдістері / Authentication Methods

#### 1. **OTP арқылы кіру (ұсынылады)**

**Процесс:**
```
1. Қолданушы email енгізеді
2. Backend 6 санды код генерациялайды
3. Nodemailer арқылы email-ге жіберіледі
4. MongoDB-ға сақталады (TTL: 10 минут)
5. Қолданушы кодты енгізеді
6. Backend кодты тексереді
7. JWT токен қайтарылады
8. Frontend tokenді localStorage-қа сақтайды
```

**Артықшылықтары:**
- ✅ Құпия сөз жоқ
- ✅ Тез және қарапайым
- ✅ Автоматты тіркелу
- ✅ Email верификациясы

#### 2. **Құпия сөзбен кіру**

**Процесс:**
```
1. Қолданушы email + password енгізеді
2. Backend bcrypt.compare() шақырады
3. JWT токен қайтарылады
4. Frontend tokenді сақтайды
```

**Қолданылуы:**
- Admin кіру
- Legacy қолданушылар

---

### 🛡️ Қауіпсіздік механизмдері / Security Mechanisms

#### **1. JWT Token қорғанысы**

```javascript
// Backend middleware
const protect = async (req, res, next) => {
  // 1. Authorization header тексеру
  if (!req.headers.authorization?.startsWith('Bearer')) {
    return res.status(401).json({ message: 'Token жоқ' });
  }

  // 2. Token алу
  const token = req.headers.authorization.split(' ')[1];

  // 3. Token верификациялау
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 4. Қолданушыны табу
  req.user = await User.findById(decoded.id).select('-password');

  // 5. Әрі қарай жіберу
  next();
};
```

**JWT құрылымы:**
```javascript
{
  id: "65abc123...",      // User ID
  role: "user",           // 'user' | 'admin'
  iat: 1737282000,        // Issued at
  exp: 1739874000         // Expires (30 күннен кейін)
}
```

---

#### **2. Құпия сөзді хэштеу**

```javascript
// Pre-save hook
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  // bcrypt хэштеу (12 rounds)
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Салыстыру
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

---

#### **3. OTP қауіпсіздігі**

```javascript
// TTL Index - 10 минуттан кейін автоматты өшіру
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index - жылдам іздеу
otpSchema.index({ identifier: 1, code: 1 });

// Verification
const otpRecord = await OTP.findOne({
  identifier: email.toLowerCase(),
  code: code.trim()
});

if (!otpRecord || otpRecord.expiresAt < new Date()) {
  return res.status(400).json({ message: 'Қате немесе ескірген код' });
}
```

---

#### **4. Файл қауіпсіздігі**

```javascript
// Қауіпті файлдарды блоктау
const fileFilter = (req, file, cb) => {
  const dangerousTypes = /\.exe$|\.bat$|\.cmd$|\.sh$|\.app$/i;

  if (dangerousTypes.test(file.originalname)) {
    cb(new Error('Қауіпті файл типі! Рұқсат етілмейді.'));
  } else {
    cb(null, true);
  }
};

// Өлшем шектеуі
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});
```

---

#### **5. CORS конфигурациясы**

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

---

#### **6. API кілттерін қорғау**

```javascript
// API keys select: false (default-та қайтарылмайды)
apiKeys: {
  gemini: { type: String, default: '', select: false },
  openai: { type: String, default: '', select: false },
  anthropic: { type: String, default: '', select: false }
}

// Тек арнайы сұраған кезде ғана алу
const user = await User.findById(id).select('+apiKeys');
```

---

## 8. Файл жүктеу жүйесі / File Upload System

### 📤 Multer конфигурациясы

```javascript
// Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Уникалды файл аты
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const dangerousTypes = /\.exe$|\.bat$|\.cmd$|\.sh$|\.app$/i;
  if (dangerousTypes.test(file.originalname)) {
    cb(new Error('Қауіпті файл типі!'));
  } else {
    cb(null, true);
  }
};

// Multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});
```

### 📊 Шектеулер / Limits

| Параметр | Мән | Себебі |
|----------|-----|--------|
| Файл өлшемі | 500MB | Үлкен презентация/видео үшін |
| Файл саны | 20 файл | Бір материалда бірнеше файл |
| Express body limit | 500MB | Үлкен payload үшін |
| Блокталған файлдар | .exe, .bat, .cmd, .sh, .app | Қауіпсіздік |

### 🔄 Жүктеу процессі / Upload Process

```
Frontend:
1. Қолданушы файлдарды таңдайды
2. Frontend валидация (500MB limit)
3. FormData жасау
4. axios.post('/api/materials/upload', formData)

Backend:
5. Multer middleware файлдарды өңдейді
6. Файлдар /uploads/ папкасына сақталады
7. MongoDB-ға метадата сақталады
8. Response қайтарылады
```

### 📥 Жүктеп алу процессі / Download Process

```
Frontend:
1. Қолданушы "Жүктеп алу" басады
2. GET /api/materials/download/:id

Backend:
3. Material табу
4. Файл бар екенін тексеру (fsSync.existsSync)
5. downloads санағышын +1
6. res.download(filePath, fileName)
7. Файл browser-ге жіберіледі
```

### 🖼️ Preview процессі / Preview Process

```
Frontend:
1. Қолданушы "Көру" басады
2. GET /api/materials/preview/:id

Backend:
3. Material табу
4. MIME type анықтау
5. Content-Type header қою
6. fs.createReadStream() → res.pipe()
7. Файл stream арқылы жіберіледі
```

---

## 9. AI интеграциялар / AI Integrations

### 🤖 1. Gemini API (Google)

**Қолданылуы:**
- Chat-bot (conversation history)
- ҚМЖ генерациялау (8000 tokens)

**Конфигурация:**
```javascript
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    maxOutputTokens: 8000,
    temperature: 0.7
  }
});
```

**Пример запрос:**
```javascript
const result = await model.generateContent({
  contents: [
    { role: "user", parts: [{ text: "Сәлем!" }] },
    { role: "model", parts: [{ text: "Сәлеметсіз бе!" }] },
    { role: "user", parts: [{ text: "Математикадан көмек керек" }] }
  ]
});
```

---

### 🎨 2. Stable Diffusion (Hugging Face)

**Қолданылуы:**
- Сурет генерациялау

**API Endpoint:**
```
https://api-inference.huggingface.co/models/stabilityai/sdxl-turbo
```

**Пример запрос:**
```javascript
const response = await axios.post(
  'https://api-inference.huggingface.co/models/stabilityai/sdxl-turbo',
  { inputs: prompt },
  {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    responseType: 'arraybuffer'
  }
);

// Суретті сақтау
fs.writeFileSync(`public/images/image_${timestamp}.png`, response.data);
```

**Model Loading:**
- 503 статус = Модель жүктелуде
- 20-30 секунд күту керек
- Retry логикасы бар

---

### 📊 3. PptxGenJS

**Қолданылуы:**
- PowerPoint презентациясын генерациялау

**Мысал:**
```javascript
const pptx = new PptxGenJS();

// Слайд қосу
const slide = pptx.addSlide();

// Титул
slide.addText("Презентация тақырыбы", {
  x: 0.5,
  y: 1.0,
  w: 9.0,
  h: 1.5,
  fontSize: 44,
  bold: true,
  color: 'FFFFFF',
  fill: { color: '4472C4' }
});

// Мәтін
slide.addText("Слайд мәтіні...", {
  x: 0.5,
  y: 2.5,
  w: 9.0,
  h: 3.0,
  fontSize: 18
});

// Сақтау
await pptx.writeFile(`presentations/pres_${timestamp}.pptx`);
```

---

## 10. Орнату және іске қосу / Setup & Deployment

### ⚙️ Development орнату

#### 1. **Репозиторийді клондау**
```bash
git clone https://github.com/Zhakeshe/Edu-help.git
cd Edu-help
```

#### 2. **Backend орнату**
```bash
cd backend
npm install
```

**`.env` файл жасау:**
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/eduhelp
# немесе
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eduhelp

# JWT
JWT_SECRET=your_super_secret_key_here_minimum_32_characters

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM_NAME=EduHelp
EMAIL_FROM_ADDRESS=your-email@gmail.com

# AI APIs (optional)
GEMINI_API_KEY=AIzaSy...
HUGGINGFACE_API_KEY=hf_...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

**Backend іске қосу:**
```bash
npm run dev    # Development (nodemon)
# немесе
npm start      # Production
```

#### 3. **Frontend орнату**
```bash
cd frontend
npm install
```

**`.env.local` файл жасау:**
```env
VITE_API_URL=http://localhost:5000
```

**Frontend іске қосу:**
```bash
npm run dev
```

**Браузерде ашу:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

### 🚀 Production Deployment

#### **Нұсқа 1: Vercel (Frontend + Backend)**

**Frontend:**
```bash
cd frontend
npm run build
vercel --prod
```

**Backend:**
```bash
cd backend
vercel --prod
```

**⚠️ Vercel шектеулері:**
- Body size: 4.5MB
- Үлкен файлдар жұмыс істемейді

---

#### **Нұсқа 2: Railway (ұсынылады)**

**1. Railway CLI орнату:**
```bash
npm install -g @railway/cli
```

**2. Login:**
```bash
railway login
```

**3. Deploy:**
```bash
# Backend
cd backend
railway up

# Frontend
cd frontend
railway up
```

**Артықшылықтары:**
- ✅ Body size limit жоқ
- ✅ Үлкен файлдар жұмыс істейді
- ✅ Тегін tier бар

---

#### **Нұсқа 3: VPS + Nginx (толық бақылау)**

**1. Nginx орнату:**
```bash
sudo apt update
sudo apt install nginx
```

**2. Конфигурация қою:**
```bash
sudo cp nginx.conf /etc/nginx/sites-available/eduhelp
sudo ln -s /etc/nginx/sites-available/eduhelp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**3. PM2 орнату:**
```bash
npm install -g pm2
```

**4. Backend іске қосу:**
```bash
cd backend
pm2 start server.js --name eduhelp-backend
pm2 save
pm2 startup
```

**5. Frontend build:**
```bash
cd frontend
npm run build
sudo cp -r dist/* /var/www/html/
```

---

### 📊 Environment Variables жинағы

#### Backend (.env)
```env
# Required
MONGODB_URI=
JWT_SECRET=
PORT=5000
FRONTEND_URL=

# Email (OTP үшін)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM_NAME=
EMAIL_FROM_ADDRESS=

# AI APIs (optional)
GEMINI_API_KEY=
HUGGINGFACE_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

#### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000
```

---

### 🧪 Тестілеу / Testing

**Backend endpoints тестілеу:**
```bash
# Health check
curl http://localhost:5000/

# Auth тестілеу
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com"}'
```

**Frontend тестілеу:**
```bash
cd frontend
npm run build    # Production build тестілеу
npm run preview  # Build preview
```

---

### 📈 Monitoring және Logs

**Backend logs:**
```bash
# Development
npm run dev    # Console-да көрінеді

# Production (PM2)
pm2 logs eduhelp-backend
pm2 monit
```

**Database monitoring:**
```bash
# MongoDB Atlas: Dashboard-та
# Local MongoDB:
mongo
> use eduhelp
> db.stats()
```

**Nginx logs:**
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 📞 Қолдау және байланыс / Support & Contact

### 🐛 Проблемалар / Issues
GitHub Issues: https://github.com/Zhakeshe/Edu-help/issues

### 📚 Құжаттама файлдары / Documentation Files
- `README.md` - Жалпы шолу
- `TECHNICAL_DOCUMENTATION.md` - Бұл файл (толық техникалық құжаттама)
- `UPLOAD_GUIDE.md` - Файл жүктеу нұсқаулығы
- `DEPLOY.md` - Deployment нұсқаулығы
- `QUICKSTART.md` - Жылдам бастау

---

## 📊 Статистика / Statistics

| Метрика | Мән |
|---------|-----|
| **Backend endpoints** | 40+ |
| **Database models** | 6 |
| **Frontend pages** | 6 |
| **Frontend components** | 12+ |
| **AI integrations** | 4 |
| **Supported file types** | Барлығы (тек қауіптілер блокталған) |
| **Max file size** | 500MB |
| **Supported grades** | 2-11 |
| **JWT expiry** | 30 days |
| **OTP validity** | 10 minutes |

---

## 🎯 Келешек жоспарлар / Future Plans

1. **Real-time чат** - WebSocket интеграциясы
2. **Cloud storage** - AWS S3 / Cloudinary
3. **Video streaming** - HLS протоколы
4. **Mobile app** - React Native
5. **Push notifications** - PWA
6. **Analytics dashboard** - Қолданушы белсенділігі
7. **API rate limiting** - DDoS қорғанысы
8. **Microservices** - Service-oriented architecture

---

## ✅ Changelog

### v1.0.0 (2025-01-19)
- ✅ Файл жүктеу limit 500MB-ға көтерілді
- ✅ Admin redirect қатесі жөнделді
- ✅ OTP login қатесі жөнделді
- ✅ 500 error файл downloads-та жөнделді
- ✅ Middleware User моделін қолдайды
- ✅ Frontend validation файл өлшеміне
- ✅ Nginx конфигурациясы қосылды
- ✅ Толық техникалық құжаттама

---

## 📄 Лицензия / License

MIT License - Ашық бастапқы код

---

**© 2025 EduHelp Development Team**
Қазақстандық мұғалімдер үшін жасалған ❤️

---

*Бұл құжаттама үнемі жаңартылып тұрады. Соңғы нұсқа: 2025-01-19*
