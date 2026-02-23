jest.mock('../../utils/sendOTP', () => ({
  generateOTP: () => '123456',
  sendEmailOTP: jest.fn(async () => ({ success: false, devMode: true, code: '123456' }))
}));

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('../../models/User');
const Admin = require('../../models/Admin');
const OTP = require('../../models/OTP');

let mongod;
let app;

function hashCode(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex');
}

function authToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
}

async function waitForDbReady() {
  if (mongoose.connection.readyState === 1) return;
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Mongo connection timeout')), 15000);
    mongoose.connection.once('open', () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}

async function clearDb() {
  const collections = Object.values(mongoose.connection.collections);
  for (const collection of collections) {
    // eslint-disable-next-line no-await-in-loop
    await collection.deleteMany({});
  }
}

beforeAll(async () => {
  jest.setTimeout(120000);

  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-release-secret';
  process.env.OTP_DEBUG = 'true';
  process.env.OTP_MAX_ATTEMPTS = '2';
  process.env.OTP_VERIFY_LOCK_MS = '300000';
  process.env.OTP_SEND_COOLDOWN_MS = '60000';
  delete process.env.GEMINI_API_KEY;
  delete process.env.R2_ACCOUNT_ID;
  delete process.env.R2_ACCESS_KEY_ID;
  delete process.env.R2_SECRET_ACCESS_KEY;
  delete process.env.R2_BUCKET;
  delete process.env.R2_PUBLIC_BASE_URL;

  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();

  app = require('../../server');
  await waitForDbReady();
});

afterEach(async () => {
  await clearDb();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongod) {
    await mongod.stop();
  }
});

describe('OTP auth integration', () => {
  test('enforces send cooldown', async () => {
    const payload = { identifier: 'teacher@example.com' };

    const first = await request(app)
      .post('/api/auth/send-otp')
      .send(payload)
      .expect(200);

    expect(first.body.success).toBe(true);

    const second = await request(app)
      .post('/api/auth/send-otp')
      .send(payload)
      .expect(429);

    expect(second.body.success).toBe(false);
    expect(second.body.retryAfter).toBeGreaterThan(0);
  });

  test('locks verification after max wrong attempts', async () => {
    const identifier = 'wrong-code@example.com';

    await request(app)
      .post('/api/auth/send-otp')
      .send({ identifier })
      .expect(200);

    await request(app)
      .post('/api/auth/verify-otp')
      .send({ identifier, code: '000000' })
      .expect(400);

    await request(app)
      .post('/api/auth/verify-otp')
      .send({ identifier, code: '111111' })
      .expect(400);

    const locked = await request(app)
      .post('/api/auth/verify-otp')
      .send({ identifier, code: '222222' })
      .expect(429);

    expect(locked.body.success).toBe(false);
    expect(locked.body.retryAfter).toBeGreaterThan(0);
  });

  test('rejects expired OTP code', async () => {
    await OTP.create({
      identifier: 'expired@example.com',
      codeHash: hashCode('123456'),
      type: 'email',
      attemptCount: 0,
      maxAttempts: 2,
      cooldownUntil: new Date(Date.now() - 1000),
      expiresAt: new Date(Date.now() - 1000)
    });

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ identifier: 'expired@example.com', code: '123456' })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  test('verifies admin via OTP and keeps admin role', async () => {
    await Admin.create({
      username: 'superadmin',
      email: 'admin@example.com',
      password: 'StrongPass123!'
    });

    await request(app)
      .post('/api/auth/send-otp')
      .send({ identifier: 'admin@example.com' })
      .expect(200);

    const verify = await request(app)
      .post('/api/auth/verify-otp')
      .send({ identifier: 'admin@example.com', code: '123456' })
      .expect(200);

    expect(verify.body.success).toBe(true);
    expect(verify.body.data.role).toBe('admin');

    const migrated = await User.findOne({ email: 'admin@example.com' });
    expect(migrated).toBeTruthy();
    expect(migrated.role).toBe('admin');
  });
});

describe('Authorization hardening integration', () => {
  test('blocks normal user from admin feedback endpoints and allows admin', async () => {
    const normalUser = await User.create({
      fullName: 'Regular User',
      email: 'user@example.com',
      authMethod: 'otp',
      role: 'user'
    });

    const adminUser = await User.create({
      fullName: 'Admin User',
      email: 'admin2@example.com',
      authMethod: 'otp',
      role: 'admin'
    });

    await request(app)
      .post('/api/feedback')
      .send({
        fullName: 'Teacher',
        phone: '+77000000000',
        message: 'Need help'
      })
      .expect(201);

    await request(app)
      .get('/api/feedback')
      .set('Authorization', `Bearer ${authToken(normalUser)}`)
      .expect(403);

    await request(app)
      .get('/api/feedback')
      .set('Authorization', `Bearer ${authToken(adminUser)}`)
      .expect(200);

    await request(app)
      .get('/api/feedback/stats/overview')
      .set('Authorization', `Bearer ${authToken(adminUser)}`)
      .expect(200);
  });

  test('requires admin role for AI tools mutating routes', async () => {
    const normalUser = await User.create({
      fullName: 'Normal',
      email: 'normal@example.com',
      authMethod: 'otp',
      role: 'user'
    });

    const adminUser = await User.create({
      fullName: 'Admin',
      email: 'admin3@example.com',
      authMethod: 'otp',
      role: 'admin'
    });

    const payload = {
      name: 'Local Tool',
      description: 'Tool for tests',
      category: 'text'
    };

    await request(app)
      .post('/api/ai-tools')
      .set('Authorization', `Bearer ${authToken(normalUser)}`)
      .send(payload)
      .expect(403);

    const created = await request(app)
      .post('/api/ai-tools')
      .set('Authorization', `Bearer ${authToken(adminUser)}`)
      .send(payload)
      .expect(201);

    const toolId = created.body.data._id;

    await request(app)
      .put(`/api/ai-tools/${toolId}`)
      .set('Authorization', `Bearer ${authToken(normalUser)}`)
      .send({ description: 'updated' })
      .expect(403);

    await request(app)
      .put(`/api/ai-tools/${toolId}`)
      .set('Authorization', `Bearer ${authToken(adminUser)}`)
      .send({ description: 'updated by admin' })
      .expect(200);

    await request(app)
      .delete(`/api/ai-tools/${toolId}`)
      .set('Authorization', `Bearer ${authToken(normalUser)}`)
      .expect(403);

    await request(app)
      .delete(`/api/ai-tools/${toolId}`)
      .set('Authorization', `Bearer ${authToken(adminUser)}`)
      .expect(200);
  });
});

describe('AI route contracts integration', () => {
  test('deprecated AI text route returns deprecation header and fallback payload', async () => {
    const response = await request(app)
      .post('/api/ai-tools/generate/text')
      .send({ prompt: 'Generate a short plan' })
      .expect(503);

    expect(response.headers['x-api-deprecated']).toBe('true');
    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe('GEMINI_UNAVAILABLE');
    expect(Array.isArray(response.body.fallback?.freeTools)).toBe(true);
    expect(response.body.fallback.freeTools.length).toBeGreaterThan(0);
  });

  test('bundle generator returns R2_NOT_CONFIGURED when R2 env is missing', async () => {
    const user = await User.create({
      fullName: 'Bundle User',
      email: 'bundle@example.com',
      authMethod: 'otp',
      role: 'user'
    });

    const response = await request(app)
      .post('/api/ai/generate-bundle')
      .set('Authorization', `Bearer ${authToken(user)}`)
      .send({
        subject: 'Math',
        classNumber: '6',
        quarter: '2',
        theme: 'Fractions'
      })
      .expect(503);

    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe('R2_NOT_CONFIGURED');
    expect(Array.isArray(response.body.fallback?.freeTools)).toBe(true);
  });
});
