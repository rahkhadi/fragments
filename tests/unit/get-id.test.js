const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id', () => {
  test('returns 404 for non-existing ID', async () => {
    const res = await request(app)
      .get('/v1/fragments/invalid-id')
      .auth('user1@email.com', 'Ferozali1');
    expect(res.statusCode).toBe(404);
  });

  test('can retrieve a valid fragment by ID', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'Ferozali1')
      .set('Content-Type', 'text/plain')
      .send('Sample fragment');
    
    const id = postRes.body.fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'Ferozali1');
    
    expect(getRes.statusCode).toBe(200);
    expect(getRes.text).toBe('Sample fragment');
  });
});
