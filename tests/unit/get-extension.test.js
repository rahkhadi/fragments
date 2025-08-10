// fragments/tests/unit/get-extension.test.js
const request = require('supertest');
const app = require('../../src/app');

const USER = process.env.BASIC_AUTH_USERNAME || 'user1@email.com';
const PASS = process.env.BASIC_AUTH_PASSWORD || 'Ferozali1';

const oneByOnePng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
  'base64'
);

// Helper to create a fragment; coerces non-Buffer to Buffer on the client side
async function createFragment(type, body) {
  const res = await request(app)
    .post('/v1/fragments')
    .auth(USER, PASS, { type: 'basic' })
    .set('Content-Type', type)
    .send(Buffer.isBuffer(body) ? body : Buffer.from(body));
  expect(res.status).toBe(201);
  return res.body.fragment.id;
}

describe('GET /v1/fragments/:id.:ext', () => {
  // ---------- TEXT / MARKDOWN ----------
  test('markdown → html', async () => {
    const id = await createFragment('text/markdown; charset=utf-8', '# Hello');
    const res = await request(app)
      .get(`/v1/fragments/${id}.html`)
      .auth(USER, PASS, { type: 'basic' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/^text\/html/);
    expect(res.text).toMatch(/<h1>.*Hello.*<\/h1>/i);
  });

  test('markdown → markdown (pass-through)', async () => {
    const id = await createFragment('text/markdown', 'Some *md*');
    const res = await request(app)
      .get(`/v1/fragments/${id}.md`)
      .auth(USER, PASS, { type: 'basic' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/^text\/markdown/);
    expect(res.text).toBe('Some *md*');
  });

  test('markdown → plain', async () => {
    const id = await createFragment('text/markdown', '# T\n\n**b**');
    const res = await request(app)
      .get(`/v1/fragments/${id}.txt`)
      .auth(USER, PASS, { type: 'basic' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/^text\/plain/);
    // current implementation returns the source markdown
    expect(res.text).toContain('# T');
  });

  // ---------- TEXT / PLAIN ----------
  test('plain → html (escaped inside <pre>)', async () => {
    const id = await createFragment('text/plain; charset=utf-8', '<b>bold</b>');
    const res = await request(app)
      .get(`/v1/fragments/${id}.html`)
      .auth(USER, PASS, { type: 'basic' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/^text\/html/);
    expect(res.text).toMatch(/<pre>&lt;b&gt;bold&lt;\/b&gt;<\/pre>/);
  });

  test('plain → markdown (pass-through)', async () => {
    const id = await createFragment('text/plain', 'just text');
    const res = await request(app)
      .get(`/v1/fragments/${id}.md`)
      .auth(USER, PASS, { type: 'basic' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/^text\/markdown/);
    expect(res.text).toBe('just text');
  });

  test('plain → plain (pass-through)', async () => {
    const id = await createFragment('text/plain', 'abc');
    const res = await request(app)
      .get(`/v1/fragments/${id}.txt`)
      .auth(USER, PASS, { type: 'basic' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/^text\/plain/);
    expect(res.text).toBe('abc');
  });

  // ---------- TEXT / HTML ----------
  test('html → plain (strip tags)', async () => {
    const id = await createFragment('text/html', '<h1>Hi</h1><p>there</p>');
    const res = await request(app)
      .get(`/v1/fragments/${id}.txt`)
      .auth(USER, PASS, { type: 'basic' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/^text\/plain/);
    // Your implementation removes tags without adding spaces, effectively "Hithere"
    expect(res.text.replace(/\s+/g, '')).toBe('Hithere');
  });

  test('html → html (pass-through)', async () => {
    const id = await createFragment('text/html', '<p>ok</p>');
    const res = await request(app)
      .get(`/v1/fragments/${id}.html`)
      .auth(USER, PASS, { type: 'basic' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/^text\/html/);
    expect(res.text).toBe('<p>ok</p>');
  });

  test('html → markdown is unsupported (415)', async () => {
    const id = await createFragment('text/html', '<p>nope</p>');
    const res = await request(app)
      .get(`/v1/fragments/${id}.md`)
      .auth(USER, PASS, { type: 'basic' });
    expect(res.status).toBe(415);
  });

  // ---------- JSON ----------
  // CHANGED: now that POST accepts JSON, verify json → json pass-through.
  test('json → json (pass-through)', async () => {
    const obj = { a: 1, b: 'two' };
    const id = await createFragment('application/json', JSON.stringify(obj));
    const res = await request(app)
      .get(`/v1/fragments/${id}.json`)
      .auth(USER, PASS, { type: 'basic' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/^application\/json/);
    expect(JSON.parse(res.text)).toEqual(obj);
  });

  // ---------- IMAGES ----------
  test('png → jpeg', async () => {
    const id = await createFragment('image/png', oneByOnePng);
    const res = await request(app)
      .get(`/v1/fragments/${id}.jpeg`)
      .auth(USER, PASS, { type: 'basic' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/jpeg');
    expect(Buffer.isBuffer(res.body)).toBe(true);
  });

  test('png → webp', async () => {
    const id = await createFragment('image/png', oneByOnePng);
    const res = await request(app)
      .get(`/v1/fragments/${id}.webp`)
      .auth(USER, PASS, { type: 'basic' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/webp');
    expect(Buffer.isBuffer(res.body)).toBe(true);
  });

  test('png → gif', async () => {
    const id = await createFragment('image/png', oneByOnePng);
    const res = await request(app)
      .get(`/v1/fragments/${id}.gif`)
      .auth(USER, PASS, { type: 'basic' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/gif');
    expect(Buffer.isBuffer(res.body)).toBe(true);
  });

  test('image to unsupported extension → 415', async () => {
    const id = await createFragment('image/png', oneByOnePng);
    const res = await request(app)
      .get(`/v1/fragments/${id}.bmp`)
      .auth(USER, PASS, { type: 'basic' });
    expect(res.status).toBe(415);
  });

  // ---------- ERROR PATHS ----------
  test('unknown fragment id → 404', async () => {
    const res = await request(app)
      .get('/v1/fragments/does-not-exist.html')
      .auth(USER, PASS, { type: 'basic' });
    expect(res.status).toBe(404);
  });

  test('unsupported extension for text → 415 (e.g., txt -> pdf)', async () => {
    const id = await createFragment('text/plain', 'x');
    const res = await request(app)
      .get(`/v1/fragments/${id}.pdf`)
      .auth(USER, PASS, { type: 'basic' });
    expect(res.status).toBe(415);
  });
});

