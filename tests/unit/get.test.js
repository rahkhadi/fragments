// tests/unit/get.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => {
    return request(app).get('/v1/fragments').expect(401);
  });

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () => {
    return request(app)
      .get('/v1/fragments')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401);
  });

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app)
      .get('/v1/fragments')
      .auth('user1@email.com', 'Ferozali1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  // Optional: If fragments exist, check if their IDs are strings
  test('fragments array contains valid fragment ids if present', async () => {
    const res = await request(app)
      .get('/v1/fragments')
      .auth('user1@email.com', 'Ferozali1');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);

    // Only validate contents if the array is non-empty
    if (res.body.fragments.length > 0) {
      res.body.fragments.forEach(id => {
        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);
      });
    }
  });
});
