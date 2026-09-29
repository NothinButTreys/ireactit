// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { createContactHandler } from './handleContact';

const valid = { name: 'Ada', email: 'ada@example.com', message: 'Hello there, Trey!' };

function req(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '1.2.3.4, 10.0.0.1', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

function setup(overrides: Partial<Parameters<typeof createContactHandler>[0]> = {}) {
  const send = vi.fn<(i: unknown) => Promise<void>>().mockResolvedValue(undefined);
  const limiter = vi.fn<(k: string) => boolean>().mockReturnValue(true);
  const handler = createContactHandler({ send, limiter, ditlToken: 'ditl-secret', ...overrides });
  return { send, limiter, handler };
}

describe('POST /api/contact handler', () => {
  it('sends a valid message and returns 200', async () => {
    const { handler, send } = setup();
    const res = await handler(req(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(send).toHaveBeenCalledWith(expect.objectContaining(valid));
  });

  it('returns 400 for malformed JSON', async () => {
    const { handler, send } = setup();
    const res = await handler(req('{nope'));
    expect(res.status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it('returns 400 with field errors for invalid input', async () => {
    const { handler } = setup();
    const res = await handler(req({ ...valid, email: 'bad' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('invalid');
    expect(body.fieldErrors.email).toBeDefined();
  });

  it('silently accepts honeypot submissions without sending', async () => {
    const { handler, send } = setup();
    const res = await handler(req({ ...valid, company: 'spam co' }));
    expect(res.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it('rate-limits by the first forwarded IP', async () => {
    const { handler, limiter, send } = setup();
    limiter.mockReturnValue(false);
    const res = await handler(req(valid));
    expect(res.status).toBe(429);
    expect(limiter).toHaveBeenCalledWith('1.2.3.4');
    expect(send).not.toHaveBeenCalled();
  });

  it('dry-runs when the DITL token matches', async () => {
    const { handler, send } = setup();
    const res = await handler(req(valid, { 'x-ditl-token': 'ditl-secret' }));
    expect(await res.json()).toEqual({ ok: true, dryRun: true });
    expect(send).not.toHaveBeenCalled();
  });

  it('a valid DITL token is not rate-limited', async () => {
    const { handler, send, limiter } = setup();
    limiter.mockReturnValue(false);
    const res = await handler(req(valid, { 'x-ditl-token': 'ditl-secret' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, dryRun: true });
    expect(limiter).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it('ignores a wrong DITL token and sends for real', async () => {
    const { handler, send } = setup();
    await handler(req(valid, { 'x-ditl-token': 'guess' }));
    expect(send).toHaveBeenCalledOnce();
  });

  it('never dry-runs when no DITL token is configured', async () => {
    const { handler, send } = setup({ ditlToken: undefined });
    await handler(req(valid, { 'x-ditl-token': '' }));
    expect(send).toHaveBeenCalledOnce();
  });

  it('returns 502 when delivery fails', async () => {
    const { handler, send } = setup();
    send.mockRejectedValue(new Error('resend down'));
    const res = await handler(req(valid));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false, error: 'send_failed' });
  });
});
