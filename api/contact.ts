import { createContactHandler } from '../src/features/contact/server/handleContact.js';
import { sendContactEmail } from '../src/features/contact/server/sendContactEmail.js';
import { createRateLimiter } from '../src/lib/rateLimit.js';

const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

export function POST(request: Request): Promise<Response> {
  return createContactHandler({ send: sendContactEmail, limiter, ditlToken: process.env.DITL_TOKEN })(request);
}
