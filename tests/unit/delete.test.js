const request = require('supertest');
const app = require('../../src/app');

const USER = 'user1@email.com';
const PASS = 'Ferozali1';

describe('DELETE /v1/fragments/:id', () => {
  test('deletes an existing fragment', async () => {
    const create = await request(app)
      .post('/v1/fragments')
      .auth(USER, PASS)
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('to-delete'));
    expect(create.status).toBe(201);
    const id = create.body.fragment.id;

    const del = await request(app)
      .delete(`/v1/fragments/${id}`)
      .auth(USER, PASS);
    expect(del.status).toBe(200);
  });

  test('404 when deleting unknown id', async () => {
    const res = await request(app)
      .delete('/v1/fragments/nope')
      .auth(USER, PASS);
    expect(res.status).toBe(404);
  });
});
