const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  test('should create a fragment with text/plain', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'Ferozali1')
      .set('Content-Type', 'text/plain')
      .send('Hello World');
    expect(res.statusCode).toBe(201);
  });

  test('should reject unsupported type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'Ferozali1')
      .set('Content-Type', 'application/unsupported')
      .send('test');
    expect(res.statusCode).toBe(415);
  });
});
