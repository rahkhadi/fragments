// fragments/tests/unit/post.test.js
const request = require('supertest');
const app = require('../../src/app');

const USER = process.env.BASIC_AUTH_USERNAME || 'user1@email.com';
const PASS = process.env.BASIC_AUTH_PASSWORD || 'Ferozali1';

describe('POST /v1/fragments', () => {
  test('should create a fragment with text/plain', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth(USER, PASS, { type: 'basic' })
      .set('Content-Type', 'text/plain; charset=utf-8')
      .send(Buffer.from('hello', 'utf8'));

    expect(res.status).toBe(201);
    expect(res.body.fragment.type).toMatch(/^text\/plain/);
  });

  test('should reject unsupported type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth(USER, PASS, { type: 'basic' })
      .set('Content-Type', 'application/xml')
      .send('<x/>');

    expect(res.status).toBe(415);
  });

  // CHANGED: prove application/json is accepted and stored
  test('should create a fragment with application/json', async () => {
    const payload = { a: 1, b: 'two' };
    const res = await request(app)
      .post('/v1/fragments')
      .auth(USER, PASS, { type: 'basic' })
      .set('Content-Type', 'application/json')
      // send a string to simulate browser fetch / axios
      .send(JSON.stringify(payload));

    expect(res.status).toBe(201);
    expect(res.body.fragment.type).toBe('application/json');
    // Fetch it back via extension endpoint to confirm round-trip
    const id = res.body.fragment.id;
    const get = await request(app)
      .get(`/v1/fragments/${id}.json`)
      .auth(USER, PASS, { type: 'basic' });
    expect(get.status).toBe(200);
    expect(JSON.parse(get.text)).toEqual(payload);
  });
});

/*
WHY:
- Keeps your existing tests intact.
- Adds a new test that creates JSON to verify the new acceptance path
  and confirms we can read the same JSON back via `.json` extension.
*/
