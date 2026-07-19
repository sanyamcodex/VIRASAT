import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Notification from '../models/Notification.js';
import { connect, disconnect, clear } from './setup.js';

beforeAll(connect);
afterAll(disconnect);
afterEach(clear);

// Seeds an admin + a logged-in artisan + a category, returns tokens & ids.
const seed = async () => {
  await User.create({ name: 'Admin', email: 'admin@test.com', password: 'password123', role: 'admin' });
  const adminLogin = await request(app)
    .post('/api/auth/admin/login')
    .send({ email: 'admin@test.com', password: 'password123' });

  const artisan = await request(app)
    .post('/api/auth/artisan/register')
    .send({ name: 'Maker', email: 'maker@test.com', password: 'password123' });

  const category = await Category.create({ name: 'Textiles' });
  return {
    admin: adminLogin.body.accessToken,
    artisanToken: artisan.body.accessToken,
    categoryId: category._id.toString(),
  };
};

describe('moderation flow', () => {
  test('artisan submits → admin rejects (notifies) → admin approves → public sees it', async () => {
    const { admin, artisanToken, categoryId } = await seed();

    // Artisan creates a product (JSON body; images optional).
    const created = await request(app)
      .post('/api/artisan/products')
      .set('Authorization', `Bearer ${artisanToken}`)
      .send({ title: 'Handloom Saree', price: 2500, category: categoryId });
    expect(created.status).toBe(201);
    expect(created.body.status).toBe('pending');
    const productId = created.body._id;

    // Admin sees it in the pending queue.
    const queue = await request(app)
      .get('/api/admin/products?status=pending')
      .set('Authorization', `Bearer ${admin}`);
    expect(queue.status).toBe(200);
    expect(queue.body.map((p) => p._id)).toContain(productId);

    // Reject with reason → notifies artisan.
    const rejected = await request(app)
      .patch(`/api/admin/products/${productId}/reject`)
      .set('Authorization', `Bearer ${admin}`)
      .send({ reason: 'Needs better photos' });
    expect(rejected.status).toBe(200);
    expect(rejected.body.status).toBe('rejected');
    expect(await Notification.countDocuments()).toBe(1);

    // Approve → published.
    const approved = await request(app)
      .patch(`/api/admin/products/${productId}/approve`)
      .set('Authorization', `Bearer ${admin}`);
    expect(approved.status).toBe(200);
    expect(approved.body.status).toBe('published');

    // Public can now fetch it.
    const pub = await request(app).get(`/api/products/${productId}`);
    expect(pub.status).toBe(200);
  });

  test('RBAC: an artisan cannot approve products', async () => {
    const { artisanToken, categoryId } = await seed();
    const created = await request(app)
      .post('/api/artisan/products')
      .set('Authorization', `Bearer ${artisanToken}`)
      .send({ title: 'Scarf', price: 500, category: categoryId });

    const res = await request(app)
      .patch(`/api/admin/products/${created.body._id}/approve`)
      .set('Authorization', `Bearer ${artisanToken}`);
    expect(res.status).toBe(403);
  });

  test('reject requires a reason (validation)', async () => {
    const { admin, artisanToken, categoryId } = await seed();
    const created = await request(app)
      .post('/api/artisan/products')
      .set('Authorization', `Bearer ${artisanToken}`)
      .send({ title: 'Bag', price: 900, category: categoryId });

    const res = await request(app)
      .patch(`/api/admin/products/${created.body._id}/reject`)
      .set('Authorization', `Bearer ${admin}`)
      .send({});
    expect(res.status).toBe(400);
  });
});
