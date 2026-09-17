import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/generateCarousel.js';

async function request(body, method = 'POST') {
  const response = { statusCode: 200, headers: {}, setHeader(k,v) { this.headers[k] = v; }, status(code) { this.statusCode = code; return this; }, json(data) { this.body = data; return this; }, end() { return this; } };
  await handler({ method, body }, response);
  return response;
}

test('carousel API validates requests and provider response modes', async t => {
  const oldFetch = globalThis.fetch;
  const keys = ['GROQ_API_KEY', 'GEMINI_API_KEY', 'GEMINI_API_KEY_2'];
  const saved = Object.fromEntries(keys.map(k => [k, process.env[k]]));
  t.after(() => { globalThis.fetch = oldFetch; for(const k of keys) { if(saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; } });
  for(const k of keys) delete process.env[k];
  assert.equal((await request({}, 'GET')).statusCode, 405);
  assert.equal((await request({ prompt: ' ' })).statusCode, 400);
  assert.equal((await request({ prompt: 'x', mode: 'invalid' })).statusCode, 400);
  assert.equal((await request({ prompt: 'x'.repeat(4001) })).statusCode, 400);
  assert.equal((await request({ prompt: 'test' })).statusCode, 503);

  process.env.GROQ_API_KEY = 'test-key';
  const questions = [1,2,3].map(id => ({ id, question: 'Who is the audience?', options: ['Students', 'Experts', 'General'] }));
  const response = value => ({ ok: true, status: 200, json: async () => ({ choices: [{ message: { content: JSON.stringify(value) } }] }) });
  globalThis.fetch = async () => response({ questions });
  assert.deepEqual((await request({ prompt: 'Coding', mode: 'questions' })).body.questions, questions);

  const slides = [1,2].map(i => ({ title: `Slide ${i}`, content: 'A literal { bracket is valid text.', bullets: ['Point'] }));
  globalThis.fetch = async () => response({ slides });
  assert.deepEqual((await request({ prompt: 'Coding', slideCount: 2 })).body.slides, slides);
  globalThis.fetch = async () => response({ slides: [null, null] });
  assert.equal((await request({ prompt: 'Coding', slideCount: 2 })).statusCode, 429);

  delete process.env.GROQ_API_KEY;
  process.env.GEMINI_API_KEY = 'test-gemini';
  globalThis.fetch = async (url, options) => {
    assert.ok(!url.includes('key='));
    assert.equal(options.headers['x-goog-api-key'], 'test-gemini');
    return { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify({ slides }) }] } }] }) };
  };
  assert.equal((await request({ prompt: 'Coding', slideCount: 2 })).statusCode, 200);
});
