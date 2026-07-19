import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import User from '../models/User.js';
import { connect, disconnect, clear } from './setup.js';

beforeAll(connect);
afterAll(disconnect);
afterEach(clear);

const register = (over = {}) =>
  request(app)
    .post('/api/auth/user/register')
    .send({ name: 'Buyer', email: 'buyer@test.com', password: 'password123', ...over });

describe('auth', () => {
  test('registers a user, issues an access token, and gates a protected route', async () => {
    const res = await register();
    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.user.role).toBe('user');

    const ok = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${res.body.accessToken}`);
    expect(ok.status).toBe(200);
  });

  test('rejects login with a wrong password', async () => {
    await register();
    const res = await request(app)
      .post('/api/auth/user/login')
      .send({ email: 'buyer@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  test('blocks a disabled account from logging in', async () => {
    await User.create({
      name: 'X',
      email: 'disabled@test.com',
      password: 'password123',
      role: 'user',
      disabled: true,
    });
    const res = await request(app)
      .post('/api/auth/user/login')
      .send({ email: 'disabled@test.com', password: 'password123' });
    expect(res.status).toBe(403);
  });

  test('refresh + logout flow works via the httpOnly cookie', async () => {
    const agent = request.agent(app);
    await agent
      .post('/api/auth/user/register')
      .send({ name: 'A', email: 'a@test.com', password: 'password123' });

    const refreshed = await agent.post('/api/auth/refresh');
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.accessToken).toBeTruthy();

    const out = await agent.post('/api/auth/logout');
    expect(out.status).toBe(200);
  });

  test('rejects an expired access token (JWT expiry enforced)', async () => {
    const expired = jwt.sign({ sub: '507f1f77bcf86cd799439011', role: 'user' }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '-10s',
    });
    const res = await request(app).get('/api/cart').set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });

  test('RBAC: no token → 401, wrong role → 403', async () => {
    const anon = await request(app).get('/api/cart');
    expect(anon.status).toBe(401);

    const { body } = await register();
    const wrongRole = await request(app)
      .get('/api/artisan/products')
      .set('Authorization', `Bearer ${body.accessToken}`);
    expect(wrongRole.status).toBe(403);
  });

  test('NoSQL operator injection in login is neutralised', async () => {
    await register();
    const res = await request(app)
      .post('/api/auth/user/login')
      .send({ email: { $ne: null }, password: { $ne: null } });
    // sanitizer strips $-keys and zod rejects the non-string → never authenticates.
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.accessToken).toBeUndefined();
  });
});
