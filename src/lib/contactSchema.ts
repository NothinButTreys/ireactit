import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Tell me your name').max(100),
  email: z.string().trim().pipe(z.email('That email looks off')),
  message: z.string().trim().min(10, 'A little more detail, please').max(5000),
  /** Honeypot. Named so browser autofill won't fill it for real visitors (unlike `company`). */
  hp_url: z.string().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
