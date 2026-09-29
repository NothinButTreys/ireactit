import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Tell me your name').max(100),
  email: z.email('That email looks off'),
  message: z.string().trim().min(10, 'A little more detail, please').max(5000),
  company: z.string().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
