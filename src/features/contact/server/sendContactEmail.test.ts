// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ContactInput } from '../../../lib/contactSchema';

const send = vi.fn<(payload: unknown) => Promise<{ data: unknown; error: unknown }>>();

vi.mock('resend', () => ({
  Resend: class {
    emails = { send };
  },
}));

const { sendContactEmail } = await import('./sendContactEmail');

const input: ContactInput = { name: 'Ada', email: 'ada@example.com', message: 'Hello there, Trey!' };

describe('sendContactEmail', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    send.mockReset();
  });

  it('throws when RESEND_API_KEY is missing', async () => {
    vi.stubEnv('RESEND_API_KEY', undefined);
    vi.stubEnv('CONTACT_TO_EMAIL', 'to@example.com');
    await expect(sendContactEmail(input)).rejects.toThrow('Contact email is not configured');
    expect(send).not.toHaveBeenCalled();
  });

  it('throws when CONTACT_TO_EMAIL is missing', async () => {
    vi.stubEnv('RESEND_API_KEY', 'key');
    vi.stubEnv('CONTACT_TO_EMAIL', undefined);
    await expect(sendContactEmail(input)).rejects.toThrow('Contact email is not configured');
    expect(send).not.toHaveBeenCalled();
  });

  it('sends with the configured recipient, reply-to, default from, and a text body', async () => {
    vi.stubEnv('RESEND_API_KEY', 'key');
    vi.stubEnv('CONTACT_TO_EMAIL', 'to@example.com');
    vi.stubEnv('CONTACT_FROM_EMAIL', undefined);
    send.mockResolvedValue({ data: { id: '1' }, error: null });

    await sendContactEmail(input);

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'IReactIt <onboarding@resend.dev>',
        to: 'to@example.com',
        replyTo: 'ada@example.com',
        text: expect.stringContaining('— Ada <ada@example.com>'),
      }),
    );
    const call = send.mock.calls[0]![0] as { text: string };
    expect(call.text).toContain(input.message);
  });

  it('honours CONTACT_FROM_EMAIL when set', async () => {
    vi.stubEnv('RESEND_API_KEY', 'key');
    vi.stubEnv('CONTACT_TO_EMAIL', 'to@example.com');
    vi.stubEnv('CONTACT_FROM_EMAIL', 'Custom <custom@example.com>');
    send.mockResolvedValue({ data: { id: '1' }, error: null });

    await sendContactEmail(input);

    expect(send).toHaveBeenCalledWith(expect.objectContaining({ from: 'Custom <custom@example.com>' }));
  });

  it('falls back when CONTACT_FROM_EMAIL is saved as an empty string', async () => {
    vi.stubEnv('RESEND_API_KEY', 'key');
    vi.stubEnv('CONTACT_TO_EMAIL', 'to@example.com');
    vi.stubEnv('CONTACT_FROM_EMAIL', '');
    vi.stubEnv('RESEND_EMAIL_DOMAIN', 'example.com');
    send.mockResolvedValue({ data: { id: '1' }, error: null });

    await sendContactEmail(input);

    expect(send).toHaveBeenCalledWith(expect.objectContaining({ from: 'IReactIt <contact@example.com>' }));
  });

  it('sends from the Resend integration domain when RESEND_EMAIL_DOMAIN is set and CONTACT_FROM_EMAIL is not', async () => {
    vi.stubEnv('RESEND_API_KEY', 'key');
    vi.stubEnv('CONTACT_TO_EMAIL', 'to@example.com');
    vi.stubEnv('CONTACT_FROM_EMAIL', undefined);
    vi.stubEnv('RESEND_EMAIL_DOMAIN', 'mail.example.com');
    send.mockResolvedValue({ data: { id: '1' }, error: null });

    await sendContactEmail(input);

    expect(send).toHaveBeenCalledWith(expect.objectContaining({ from: 'IReactIt <contact@mail.example.com>' }));
  });

  it('prefers CONTACT_FROM_EMAIL over RESEND_EMAIL_DOMAIN when both are set', async () => {
    vi.stubEnv('RESEND_API_KEY', 'key');
    vi.stubEnv('CONTACT_TO_EMAIL', 'to@example.com');
    vi.stubEnv('CONTACT_FROM_EMAIL', 'Custom <custom@example.com>');
    vi.stubEnv('RESEND_EMAIL_DOMAIN', 'mail.example.com');
    send.mockResolvedValue({ data: { id: '1' }, error: null });

    await sendContactEmail(input);

    expect(send).toHaveBeenCalledWith(expect.objectContaining({ from: 'Custom <custom@example.com>' }));
  });

  it('throws with the Resend error message when send fails', async () => {
    vi.stubEnv('RESEND_API_KEY', 'key');
    vi.stubEnv('CONTACT_TO_EMAIL', 'to@example.com');
    send.mockResolvedValue({ data: null, error: { message: 'boom' } });

    await expect(sendContactEmail(input)).rejects.toThrow('boom');
  });

  it('strips CR/LF from a user-supplied name in the subject', async () => {
    vi.stubEnv('RESEND_API_KEY', 'key');
    vi.stubEnv('CONTACT_TO_EMAIL', 'to@example.com');
    send.mockResolvedValue({ data: { id: '1' }, error: null });

    await sendContactEmail({ ...input, name: 'Ada\r\nBcc: x@y.z' });

    const call = send.mock.calls[0]![0] as { subject: string };
    expect(call.subject).toBe('ireactit.com: commit from Ada Bcc: x@y.z');
    expect(call.subject).not.toMatch(/[\r\n]/);
  });
});
