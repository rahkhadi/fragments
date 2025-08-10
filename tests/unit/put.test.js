// tests/unit/put.test.js
// Ensure every request is authenticated with HTTP Basic.
// Note: rawBody() converts string bodies to Buffers, so PUT with a string should be 200.

const request = require('supertest');
const app = require('../../src/app');

// Use the same credentials as tests/.htpasswd
const USER = process.env.BASIC_AUTH_USERNAME || 'user1@email.com';
const PASS = process.env.BASIC_AUTH_PASSWORD || 'Ferozali1';

describe('PUT /v1/fragments/:id', () => {
  test('updates fragment data (and optionally content-type)', async () => {
    // 1) create a fragment
    const create = await request(app)
      .post('/v1/fragments')
      .auth(USER, PASS, { type: 'basic' })
      .set('Content-Type', 'text/plain; charset=utf-8')
      .send(Buffer.from('hello'));
    expect(create.status).toBe(201);
    const id = create.body.fragment.id;

    // 2) update only the body
    const put1 = await request(app)
      .put(`/v1/fragments/${id}`)
      .auth(USER, PASS, { type: 'basic' })
      .set('Content-Type', 'text/plain; charset=utf-8')
      .send(Buffer.from('world'));
    expect(put1.status).toBe(200);

    // 3) verify
    const get1 = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth(USER, PASS, { type: 'basic' });
    expect(get1.status).toBe(200);
    expect(get1.text).toBe('world');

    // 4) change content-type + body
    const put2 = await request(app)
      .put(`/v1/fragments/${id}`)
      .auth(USER, PASS, { type: 'basic' })
      .set('Content-Type', 'text/markdown; charset=utf-8')
      .send(Buffer.from('# Title'));
    expect(put2.status).toBe(200);
    expect(put2.body.fragment.type).toBe('text/markdown');

    // 5) verify again
    const get2 = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth(USER, PASS, { type: 'basic' });
    expect(get2.status).toBe(200);
    expect(get2.text).toBe('# Title');
  });

  test('returns 404 for unknown id', async () => {
    const res = await request(app)
      .put('/v1/fragments/does-not-exist')
      .auth(USER, PASS, { type: 'basic' })
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('x'));
    expect(res.status).toBe(404);
  });

  test('accepts text payload (middleware coerces to Buffer)', async () => {
    // create seed fragment
    const create = await request(app)
      .post('/v1/fragments')
      .auth(USER, PASS, { type: 'basic' })
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('init'));
    expect(create.status).toBe(201);
    const id = create.body.fragment.id;

    // send a string; rawBody() converts to Buffer -> should be 200
    const res = await request(app)
      .put(`/v1/fragments/${id}`)
      .auth(USER, PASS, { type: 'basic' })
      .set('Content-Type', 'text/plain')
      .send('not-a-buffer');
    expect(res.status).toBe(200);

    // verify persisted value
    const get = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth(USER, PASS, { type: 'basic' });
    expect(get.status).toBe(200);
    expect(get.text).toBe('not-a-buffer');
  });
});
