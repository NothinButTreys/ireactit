import { z } from 'zod';
import { contactSchema, type ContactInput } from '../../../lib/contactSchema.js';
import { safeEqual } from '../../../lib/safeEqual.js';

type Deps = {
  send: (input: ContactInput) => Promise<void>;
  limiter: (key: string) => boolean;
  ditlToken?: string;
};

const json = (status: number, body: unknown) => Response.json(body, { status });

function clientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export function createContactHandler({ send, limiter, ditlToken }: Deps) {
  return async function handleContact(req: Request): Promise<Response> {
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return json(400, { ok: false, error: 'invalid', fieldErrors: {} });
    }

    const parsed = contactSchema.safeParse(raw);
    if (!parsed.success) {
      return json(400, { ok: false, error: 'invalid', fieldErrors: z.flattenError(parsed.error).fieldErrors });
    }

    if (parsed.data.company) return json(200, { ok: true });

    if (!limiter(clientIp(req))) return json(429, { ok: false, error: 'rate_limited' });

    const header = req.headers.get('x-ditl-token');
    if (ditlToken && header && safeEqual(header, ditlToken)) {
      return json(200, { ok: true, dryRun: true });
    }

    try {
      await send(parsed.data);
    } catch (err) {
      console.error('[contact] send failed', err);
      return json(502, { ok: false, error: 'send_failed' });
    }
    return json(200, { ok: true });
  };
}
