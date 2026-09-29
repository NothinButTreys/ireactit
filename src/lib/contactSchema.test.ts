import { describe, expect, it } from 'vitest';
import { contactSchema } from './contactSchema';

const valid = { name: 'Ada Lovelace', email: 'ada@example.com', message: 'Hello Trey, loved the site!' };

describe('contactSchema', () => {
  it('accepts a valid message and trims whitespace', () => {
    const r = contactSchema.safeParse({ ...valid, name: '  Ada  ' });
    expect(r.success).toBe(true);
    expect(r.success && r.data.name).toBe('Ada');
  });

  it.each([
    ['empty name', { name: '' }],
    ['name over 100 chars', { name: 'a'.repeat(101) }],
    ['bad email', { email: 'not-an-email' }],
    ['short message', { message: 'too short' }],
    ['message over 5000 chars', { message: 'a'.repeat(5001) }],
  ])('rejects %s', (_, patch) => {
    expect(contactSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });

  it('allows the honeypot field', () => {
    expect(contactSchema.safeParse({ ...valid, company: 'bot inc' }).success).toBe(true);
  });

  it('trims whitespace from the email', () => {
    const r = contactSchema.safeParse({ ...valid, email: 'ada@example.com ' });
    expect(r.success).toBe(true);
    expect(r.success && r.data.email).toBe('ada@example.com');
  });
});
