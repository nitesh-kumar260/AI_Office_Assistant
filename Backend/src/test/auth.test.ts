import assert from 'assert';
import http from 'http';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../app';
import User from '../models/User';

mongoose.set('bufferCommands', false);

async function runAuthTests() {
  console.log('\n--- STARTING AUTHENTICATION SUITE TESTS ---\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`[FAIL] ${name}:`, err.stack || err.message);
      failed++;
    }
  }

  // Setup environment JWT_SECRET
  const TEST_JWT_SECRET = 'test-secret-key-1234567890';
  process.env.JWT_SECRET = TEST_JWT_SECRET;

  // Mock in-memory user store for User model
  const inMemoryUsers: any[] = [];

  const origFindOne = User.findOne;
  const origCreate = User.create;
  const origFindById = User.findById;

  (User as any).create = async function (data: any) {
    const userDoc: any = {
      _id: new mongoose.Types.ObjectId(),
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role || 'legal',
      avatar: data.avatar || '',
      title: data.title || 'Legal Specialist',
      organization: data.organization || 'Ornitech Intelligence Labs',
      workspaces: data.workspaces || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    userDoc.toObject = function () {
      const clone = { ...this };
      delete clone.toObject;
      delete clone.save;
      delete clone.passwordHash; // default Mongoose select: false behavior
      return clone;
    };

    userDoc.save = async function () {
      return this;
    };

    inMemoryUsers.push(userDoc);
    return userDoc;
  };

  (User as any).findOne = function (query: any) {
    const email = query.email;
    const found = inMemoryUsers.find((u) => u.email === email);

    const execQuery = (includePasswordHash: boolean) => {
      if (!found) return null;
      const clone = { ...found };
      clone.toObject = function () {
        const obj = { ...this };
        delete obj.toObject;
        delete obj.save;
        if (!includePasswordHash) {
          delete obj.passwordHash;
        }
        return obj;
      };
      if (!includePasswordHash) {
        delete clone.passwordHash;
      }
      return clone;
    };

    return {
      select: (fields: string) => {
        const includePasswordHash = fields.includes('+passwordHash');
        return Promise.resolve(execQuery(includePasswordHash));
      },
      then: (resolve: any, reject: any) => {
        return Promise.resolve(execQuery(false)).then(resolve, reject);
      },
    };
  };

  (User as any).findById = async function (id: any) {
    const found = inMemoryUsers.find((u) => u._id.toString() === id.toString());
    if (!found) return null;
    const clone = { ...found };
    clone.toObject = function () {
      const obj = { ...this };
      delete obj.toObject;
      delete obj.save;
      delete obj.passwordHash;
      return obj;
    };
    delete clone.passwordHash;
    return clone;
  };

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // -------------------------------------------------------------
    // Test 1: User Registration & Password Hashing
    // -------------------------------------------------------------
    await test('POST /api/auth/register registers user, hashes password, and returns token without passwordHash', async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Jane Doe',
          email: 'jane@ornitech.ai',
          password: 'Password123!',
          title: 'Senior Counsel',
        }),
      });

      assert.strictEqual(res.status, 201);
      const data: any = await res.json();
      assert.strictEqual(data.message, 'User registered successfully');
      assert.ok(data.token, 'Token should be present in registration response');
      assert.strictEqual(data.user.email, 'jane@ornitech.ai');
      assert.strictEqual(data.user.role, 'legal');
      assert.strictEqual(data.user.passwordHash, undefined, 'passwordHash must never be exposed');

      // Check DB level storage
      const dbUser = inMemoryUsers.find((u) => u.email === 'jane@ornitech.ai');
      assert.ok(dbUser, 'User stored in DB');
      assert.notStrictEqual(dbUser.passwordHash, 'Password123!', 'Plaintext password must not be stored');
      assert.ok(dbUser.passwordHash.startsWith('$2'), 'Password must be hashed with bcrypt');

      const matches = await bcrypt.compare('Password123!', dbUser.passwordHash);
      assert.strictEqual(matches, true, 'Bcrypt compare should match plaintext password with hash');
    });

    // -------------------------------------------------------------
    // Test 2: Prevent Duplicate Email Registration
    // -------------------------------------------------------------
    await test('POST /api/auth/register rejects duplicate email registration', async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Jane Duplicate',
          email: 'JANE@ornitech.ai', // check email normalization
          password: 'AnotherPassword123!',
        }),
      });

      assert.strictEqual(res.status, 400);
      const data: any = await res.json();
      assert.strictEqual(data.error, 'Email is already registered');
    });

    // -------------------------------------------------------------
    // Test 3: Elevated Role Protection
    // -------------------------------------------------------------
    await test('POST /api/auth/register does not blindly grant admin role from public register', async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Hacker Admin',
          email: 'hacker@ornitech.ai',
          password: 'Password123!',
          role: 'admin',
        }),
      });

      assert.strictEqual(res.status, 201);
      const data: any = await res.json();
      assert.strictEqual(data.user.role, 'legal', 'Public registration must default to legal and refuse admin');
    });

    // -------------------------------------------------------------
    // Test 4: Password Length Validation
    // -------------------------------------------------------------
    await test('POST /api/auth/register rejects password shorter than 6 characters', async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Short Pass',
          email: 'shortpass@ornitech.ai',
          password: '123',
        }),
      });

      assert.strictEqual(res.status, 400);
      const data: any = await res.json();
      assert.ok(data.error.includes('at least 6 characters'));
    });

    // -------------------------------------------------------------
    // Test 5: Login with Invalid Credentials
    // -------------------------------------------------------------
    await test('POST /api/auth/login rejects incorrect password or non-existent email with 401', async () => {
      // Incorrect password
      const wrongPassRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'jane@ornitech.ai',
          password: 'WrongPassword!',
        }),
      });
      assert.strictEqual(wrongPassRes.status, 401);
      const wrongPassData: any = await wrongPassRes.json();
      assert.strictEqual(wrongPassData.error, 'Invalid email or password');

      // Non-existent email
      const wrongEmailRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nobody@ornitech.ai',
          password: 'Password123!',
        }),
      });
      assert.strictEqual(wrongEmailRes.status, 401);
    });

    // -------------------------------------------------------------
    // Test 6: Successful Login & JWT Verification
    // -------------------------------------------------------------
    let loggedInToken = '';
    await test('POST /api/auth/login succeeds with correct credentials and returns JWT token', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'jane@ornitech.ai',
          password: 'Password123!',
        }),
      });

      assert.strictEqual(res.status, 200);
      const data: any = await res.json();
      assert.strictEqual(data.message, 'Login successful');
      assert.ok(data.token, 'JWT token returned');
      assert.strictEqual(data.user.email, 'jane@ornitech.ai');
      assert.strictEqual(data.user.passwordHash, undefined);

      loggedInToken = data.token;

      // Verify JWT payload
      const decoded: any = jwt.verify(loggedInToken, TEST_JWT_SECRET);
      assert.ok(decoded.userId);
      assert.strictEqual(decoded.email, 'jane@ornitech.ai');
      assert.strictEqual(decoded.role, 'legal');
    });

    // -------------------------------------------------------------
    // Test 7: GET /api/auth/me Endpoint with Valid Bearer Token
    // -------------------------------------------------------------
    await test('GET /api/auth/me returns authenticated user profile with valid Bearer token', async () => {
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${loggedInToken}`,
        },
      });

      assert.strictEqual(res.status, 200);
      const data: any = await res.json();
      assert.ok(data.user);
      assert.strictEqual(data.user.email, 'jane@ornitech.ai');
      assert.strictEqual(data.user.passwordHash, undefined);
    });

    // -------------------------------------------------------------
    // Test 8: Protected Route Rejects Missing or Malformed Auth Header
    // -------------------------------------------------------------
    await test('GET /api/auth/me rejects missing or malformed Authorization header with 401', async () => {
      // Missing header
      const missingRes = await fetch(`${baseUrl}/api/auth/me`);
      assert.strictEqual(missingRes.status, 401);

      // Malformed header (not Bearer)
      const malformedRes = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: 'Basic some-base64-string' },
      });
      assert.strictEqual(malformedRes.status, 401);
    });

    // -------------------------------------------------------------
    // Test 9: Protected Route Rejects Invalid or Expired Token
    // -------------------------------------------------------------
    await test('GET /api/auth/me rejects invalid JWT token with 401', async () => {
      const invalidTokenRes = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: 'Bearer this.is.an.invalid.jwt.token' },
      });
      assert.strictEqual(invalidTokenRes.status, 401);
      const data: any = await invalidTokenRes.json();
      assert.ok(data.error.includes('Invalid or expired'));
    });

    // -------------------------------------------------------------
    // Test 10: Server Configuration Error when JWT_SECRET is Missing
    // -------------------------------------------------------------
    await test('Fails with 500 configuration error if process.env.JWT_SECRET is missing', async () => {
      delete process.env.JWT_SECRET;
      try {
        const res = await fetch(`${baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'jane@ornitech.ai',
            password: 'Password123!',
          }),
        });
        assert.strictEqual(res.status, 500);
        const data: any = await res.json();
        assert.ok(data.error.includes('JWT_SECRET'));
      } finally {
        process.env.JWT_SECRET = TEST_JWT_SECRET;
      }
    });

  } finally {
    // Restore mocks
    User.findOne = origFindOne;
    User.create = origCreate;
    User.findById = origFindById;
    server.close();
  }

  console.log(`\n=================================================`);
  console.log(`AUTH TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`=================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthTests().catch((err) => {
  console.error('Auth test suite failed with unexpected error:', err);
  process.exit(1);
});
