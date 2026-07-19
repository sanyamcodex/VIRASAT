import crypto from 'crypto';
import request from 'supertest';
import app from '../app.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import { connect, disconnect, clear } from './setup.js';

beforeAll(connect);
afterAll(disconnect);
afterEach(clear);

const registerBuyer = () =>
  request(app)
    .post('/api/auth/user/register')
    .send({ name: 'Buyer', email: 'buyer@test.com', password: 'password123' });

describe('checkout payment verification', () => {
  test('valid Razorpay signature marks the order paid and clears the cart', async () => {
    process.env.RAZORPAY_KEY_SECRET = 'test_secret';
    const { body } = await registerBuyer();
    const token = body.accessToken;
    const userId = body.user.id;

    const category = await Category.create({ name: 'Pottery' });
    const product = await Product.create({
      title: 'Clay Pot',
      price: 400,
      category: category._id,
      status: 'published',
    });

    // Put something in the cart, then stage a pending order (as createCheckoutOrder would).
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ product: product._id.toString(), quantity: 2 });

    const rzpOrderId = 'order_TEST123';
    await Order.create({
      user: userId,
      items: [{ product: product._id, title: 'Clay Pot', price: 400, quantity: 2 }],
      total: 800,
      status: 'pending',
      paymentInfo: { razorpayOrderId: rzpOrderId },
    });

    const paymentId = 'pay_TEST123';
    const signature = crypto
      .createHmac('sha256', 'test_secret')
      .update(`${rzpOrderId}|${paymentId}`)
      .digest('hex');

    const res = await request(app)
      .post('/api/checkout/verify')
      .set('Authorization', `Bearer ${token}`)
      .send({
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('paid');

    const cart = await Cart.findOne({ user: userId });
    expect(cart.items).toHaveLength(0);
  });

  test('an invalid signature is rejected and the order stays pending', async () => {
    process.env.RAZORPAY_KEY_SECRET = 'test_secret';
    const { body } = await registerBuyer();

    await Order.create({
      user: body.user.id,
      items: [],
      total: 100,
      status: 'pending',
      paymentInfo: { razorpayOrderId: 'order_X' },
    });

    const res = await request(app)
      .post('/api/checkout/verify')
      .set('Authorization', `Bearer ${body.accessToken}`)
      .send({
        razorpay_order_id: 'order_X',
        razorpay_payment_id: 'pay_X',
        razorpay_signature: 'deadbeef',
      });

    expect(res.status).toBe(400);
    const order = await Order.findOne({ 'paymentInfo.razorpayOrderId': 'order_X' });
    expect(order.status).toBe('pending');
  });

  test('checkout routes require authentication', async () => {
    const res = await request(app).post('/api/checkout/verify').send({});
    expect(res.status).toBe(401);
  });
});
