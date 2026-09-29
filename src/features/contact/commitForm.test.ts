import { describe, expect, it, vi } from 'vitest';
import { commitReducer, firstInvalidField, initialCommit, postCommit, validateCommit, type Fields } from './commitForm';

const good: Fields = { name: 'Ada', email: 'ada@example.com', message: 'Loved the render cycle!', hp_url: '' };

describe('commitReducer', () => {
  it('edits a field and clears only that field’s error', () => {
    const withErrors = commitReducer(initialCommit, { type: 'invalid', errors: { name: 'x', email: 'y' } });
    const edited = commitReducer(withErrors, { type: 'edit', field: 'name', value: 'Ada' });
    expect(edited.fields.name).toBe('Ada');
    expect(edited.errors).toEqual({ email: 'y' });
  });

  it('goes idle → sending → delivered and clears the form on delivery', () => {
    let s = commitReducer(initialCommit, { type: 'edit', field: 'message', value: 'hello there!' });
    s = commitReducer(s, { type: 'send' });
    expect(s.status).toBe('sending');
    s = commitReducer(s, { type: 'delivered' });
    expect(s.status).toBe('delivered');
    expect(s.fields).toEqual(initialCommit.fields);
  });

  it('keeps the message when a push is rejected', () => {
    let s = commitReducer(initialCommit, { type: 'edit', field: 'message', value: 'please keep me' });
    s = commitReducer(s, { type: 'send' });
    s = commitReducer(s, { type: 'rejected', reason: 'send_failed' });
    expect(s).toMatchObject({ status: 'rejected', reason: 'send_failed' });
    expect(s.fields.message).toBe('please keep me');
  });

  it('returns to idle when the visitor edits after a result', () => {
    const rejected = { ...initialCommit, status: 'rejected' as const, reason: 'network' as const };
    expect(commitReducer(rejected, { type: 'edit', field: 'name', value: 'A' }).status).toBe('idle');
  });
});

describe('validateCommit', () => {
  it('accepts a valid commit', () => {
    expect(validateCommit(good)).toBeNull();
  });

  it('returns the first message per invalid field', () => {
    const errors = validateCommit({ ...good, name: '', email: 'nope', message: 'short' });
    expect(Object.keys(errors ?? {}).sort()).toEqual(['email', 'message', 'name']);
    expect(errors?.email).toBe('That email looks off');
  });
});

describe('firstInvalidField', () => {
  it('picks the first invalid field in name → email → message order', () => {
    expect(firstInvalidField({ email: 'x', message: 'y' })).toBe('email');
    expect(firstInvalidField({ message: 'y' })).toBe('message');
    expect(firstInvalidField({})).toBeNull();
  });
});

describe('postCommit', () => {
  const respond = (status: number, body: unknown = {}) =>
    vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(body), { status }));

  it('POSTs JSON to /api/contact and reports delivery', async () => {
    const fetchImpl = respond(200, { ok: true });
    expect(await postCommit(good, fetchImpl)).toEqual({ type: 'delivered' });
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe('/api/contact');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual(good);
  });

  it('maps server field errors, rate limits, failures and network errors', async () => {
    expect(await postCommit(good, respond(400, { fieldErrors: { email: ['Bad email'] } }))).toEqual({
      type: 'invalid',
      errors: { email: 'Bad email' },
    });
    expect(await postCommit(good, respond(429))).toEqual({ type: 'rejected', reason: 'rate_limited' });
    expect(await postCommit(good, respond(502))).toEqual({ type: 'rejected', reason: 'send_failed' });
    expect(await postCommit(good, vi.fn<typeof fetch>().mockRejectedValue(new TypeError('offline')))).toEqual({
      type: 'rejected',
      reason: 'network',
    });
  });
});
