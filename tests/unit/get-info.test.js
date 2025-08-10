const request = require('supertest');
const app = require('../../src/app');

const USER = 'user1@email.com';
const PASS = 'Ferozali1';

describe('GET /v1/fragments/:id/info', () => {
  test('returns fragment metadata for existing id', async () => {
    const create = await request(app)
      .post('/v1/fragments')
      .auth(USER, PASS)
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('meta'));
    expect(create.status).toBe(201);
    const id = create.body.fragment.id;

    const info = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth(USER, PASS);
    expect(info.status).toBe(200);
    expect(info.body.fragment.id).toBe(id);
  });

  test('404 for unknown id', async () => {
    const res = await request(app)
      .get('/v1/fragments/nope/info')
      .auth(USER, PASS);
    expect(res.status).toBe(404);
  });
});
